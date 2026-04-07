const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');
const { INTEREST_STATUS } = require('../utils/constants');

async function expressInterest(req, res) {
  const petId = req.params.id;
  const { message } = req.body;

  try {
    const petResult = await pool.query(`SELECT id, owner_id FROM pets WHERE id = $1`, [petId]);
    if (!petResult.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }
    const { owner_id: ownerId } = petResult.rows[0];
    if (ownerId === req.user.id) {
      return fail(res, 400, 'You cannot express interest in your own pet listing.');
    }

    const dup = await pool.query(
      `SELECT id FROM adoption_interests WHERE pet_id = $1 AND adopter_id = $2`,
      [petId, req.user.id]
    );
    if (dup.rows.length) {
      return fail(res, 409, 'You have already expressed interest in this pet.');
    }

    const { rows } = await pool.query(
      `INSERT INTO adoption_interests (pet_id, adopter_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [petId, req.user.id, message != null && message !== '' ? String(message).trim() : null]
    );
    return ok(res, { interest: rows[0] }, null, 201);
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function listPetInterests(req, res) {
  const petId = req.params.id;
  try {
    const petResult = await pool.query(`SELECT owner_id FROM pets WHERE id = $1`, [petId]);
    if (!petResult.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }
    if (petResult.rows[0].owner_id !== req.user.id) {
      return fail(res, 403, 'Only the pet owner can view interest requests.');
    }

    const { rows } = await pool.query(
      `SELECT ai.*, u.id AS adopter_user_id, u.name AS adopter_name, u.email AS adopter_email,
              u.phone AS adopter_phone, u.nairobi_area AS adopter_nairobi_area
       FROM adoption_interests ai
       JOIN users u ON u.id = ai.adopter_id
       WHERE ai.pet_id = $1
       ORDER BY ai.created_at DESC`,
      [petId]
    );

    const interests = rows.map((r) => ({
      id: r.id,
      pet_id: r.pet_id,
      adopter_id: r.adopter_id,
      message: r.message,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      adopter: {
        id: r.adopter_user_id,
        name: r.adopter_name,
        email: r.adopter_email,
        phone: r.adopter_phone,
        nairobi_area: r.adopter_nairobi_area,
      },
    }));

    return ok(res, { interests });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function listMyInterests(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT ai.*,
              p.id AS pet_id_full, p.name AS pet_name, p.species, p.adoption_status,
              p.nairobi_area AS pet_nairobi_area, p.created_at AS pet_created_at
       FROM adoption_interests ai
       JOIN pets p ON p.id = ai.pet_id
       WHERE ai.adopter_id = $1
       ORDER BY ai.created_at DESC`,
      [req.user.id]
    );

    const interests = rows.map((r) => ({
      id: r.id,
      pet_id: r.pet_id,
      adopter_id: r.adopter_id,
      message: r.message,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      pet: {
        id: r.pet_id_full,
        name: r.pet_name,
        species: r.species,
        adoption_status: r.adoption_status,
        nairobi_area: r.pet_nairobi_area,
        created_at: r.pet_created_at,
      },
    }));

    return ok(res, { interests });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function patchInterest(req, res) {
  const interestId = req.params.id;
  const { status: nextStatus } = req.body;

  if (!nextStatus || !INTEREST_STATUS.includes(nextStatus) || nextStatus === 'pending') {
    return fail(res, 400, 'status must be accepted or rejected.');
  }

  const client = await pool.connect();
  try {
    // Fetch interest + pet ownership in one go
    const { rows } = await client.query(
      `SELECT ai.id, ai.pet_id, p.owner_id, p.adoption_status
       FROM adoption_interests ai
       JOIN pets p ON p.id = ai.pet_id
       WHERE ai.id = $1`,
      [interestId]
    );
    if (!rows.length) {
      return fail(res, 404, 'Interest request not found.');
    }
    const interest = rows[0];
    if (interest.owner_id !== req.user.id) {
      return fail(res, 403, 'Only the pet owner can update this interest request.');
    }

    await client.query('BEGIN');

    // Update the interest status
    const { rows: updated } = await client.query(
      `UPDATE adoption_interests SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [nextStatus, interestId]
    );

    // If accepted, move pet to pending (only if currently available)
    if (nextStatus === 'accepted' && interest.adoption_status === 'available') {
      await client.query(
        `UPDATE pets SET adoption_status = 'pending', updated_at = NOW()
         WHERE id = $1`,
        [interest.pet_id]
      );
    }

    await client.query('COMMIT');

    return ok(res, {
      interest: updated[0],
      pet_status_updated: nextStatus === 'accepted' && interest.adoption_status === 'available',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  } finally {
    client.release();
  }
}

module.exports = {
  expressInterest,
  listPetInterests,
  listMyInterests,
  patchInterest,
};