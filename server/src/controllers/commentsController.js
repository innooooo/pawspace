const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

// GET /api/pets/:id/comments
async function listComments(req, res) {
  const petId = req.params.id;
  try {
    const { rows } = await pool.query(
      `SELECT
         c.id, c.pet_id, c.user_id, c.parent_id, c.body, c.created_at, c.updated_at,
         u.name AS author_name, u.avatar_url AS author_avatar
       FROM pet_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.pet_id = $1
       ORDER BY c.created_at ASC`,
      [petId]
    );

    // Nest replies under their parent
    const topLevel = [];
    const map = {};
    for (const row of rows) {
      map[row.id] = { ...row, replies: [] };
    }
    for (const row of rows) {
      if (row.parent_id && map[row.parent_id]) {
        map[row.parent_id].replies.push(map[row.id]);
      } else {
        topLevel.push(map[row.id]);
      }
    }

    return ok(res, { comments: topLevel });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

// POST /api/pets/:id/comments
async function addComment(req, res) {
  const petId = req.params.id;
  const { body, parent_id } = req.body;

  if (!body || !String(body).trim()) {
    return fail(res, 400, 'Comment body is required.');
  }
  if (String(body).trim().length > 1000) {
    return fail(res, 400, 'Comment must be 1000 characters or fewer.');
  }

  try {
    // Check pet exists
    const petCheck = await pool.query(`SELECT id FROM pets WHERE id = $1`, [petId]);
    if (!petCheck.rows.length) return fail(res, 404, 'Pet not found.');

    // If replying, check parent exists and belongs to same pet
    if (parent_id) {
      const parentCheck = await pool.query(
        `SELECT id FROM pet_comments WHERE id = $1 AND pet_id = $2`,
        [parent_id, petId]
      );
      if (!parentCheck.rows.length) return fail(res, 400, 'Parent comment not found.');
    }

    const { rows } = await pool.query(
      `INSERT INTO pet_comments (pet_id, user_id, parent_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [petId, req.user.id, parent_id || null, String(body).trim()]
    );

    // Return with author info
    const { rows: full } = await pool.query(
      `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM pet_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [rows[0].id]
    );

    return ok(res, { comment: { ...full[0], replies: [] } }, null, 201);
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

// DELETE /api/comments/:id
async function deleteComment(req, res) {
  const commentId = req.params.id;
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id FROM pet_comments WHERE id = $1`,
      [commentId]
    );
    if (!rows.length) return fail(res, 404, 'Comment not found.');
    if (rows[0].user_id !== req.user.id) {
      return fail(res, 403, 'You can only delete your own comments.');
    }
    await pool.query(`DELETE FROM pet_comments WHERE id = $1`, [commentId]);
    return ok(res, { deleted: true });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

// PATCH /api/comments/:id
async function editComment(req, res) {
  const commentId = req.params.id;
  const { body } = req.body;

  if (!body || !String(body).trim()) return fail(res, 400, 'Body is required.');
  if (String(body).trim().length > 1000) return fail(res, 400, 'Comment must be 1000 characters or fewer.');

  try {
    const { rows } = await pool.query(
      `SELECT id, user_id FROM pet_comments WHERE id = $1`,
      [commentId]
    );
    if (!rows.length) return fail(res, 404, 'Comment not found.');
    if (rows[0].user_id !== req.user.id) {
      return fail(res, 403, 'You can only edit your own comments.');
    }

    const { rows: updated } = await pool.query(
      `UPDATE pet_comments SET body = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [String(body).trim(), commentId]
    );

    const { rows: full } = await pool.query(
      `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM pet_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [updated[0].id]
    );

    return ok(res, { comment: { ...full[0], replies: [] } });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

module.exports = { listComments, addComment, deleteComment, editComment };