const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

async function toggleLike(req, res) {
  const petId = req.params.id;
  try {
    const petResult = await pool.query(`SELECT id FROM pets WHERE id = $1`, [petId]);
    if (!petResult.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }

    const existing = await pool.query(
      `SELECT id FROM pet_likes WHERE pet_id = $1 AND user_id = $2`,
      [petId, req.user.id]
    );

    if (existing.rows.length) {
      await pool.query(`DELETE FROM pet_likes WHERE id = $1`, [existing.rows[0].id]);
      const countResult = await pool.query(
        `SELECT COUNT(*)::int AS c FROM pet_likes WHERE pet_id = $1`,
        [petId]
      );
      return ok(res, { liked: false, likeCount: countResult.rows[0].c });
    }

    await pool.query(
      `INSERT INTO pet_likes (pet_id, user_id) VALUES ($1, $2)`,
      [petId, req.user.id]
    );
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pet_likes WHERE pet_id = $1`,
      [petId]
    );
      return ok(res, { liked: true, likeCount: countResult.rows[0].c });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function getLikes(req, res) {
  const petId = req.params.id;
  try {
    const petResult = await pool.query(`SELECT id FROM pets WHERE id = $1`, [petId]);
    if (!petResult.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pet_likes WHERE pet_id = $1`,
      [petId]
    );
    const likeCount = countResult.rows[0].c;

    let likedByMe = false;
    if (req.user) {
      const mine = await pool.query(
        `SELECT 1 FROM pet_likes WHERE pet_id = $1 AND user_id = $2 LIMIT 1`,
        [petId, req.user.id]
      );
      likedByMe = mine.rows.length > 0;
    }

    return ok(res, { likeCount, likedByMe });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

module.exports = { toggleLike, getLikes };
