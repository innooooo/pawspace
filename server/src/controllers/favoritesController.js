const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

async function getSaved(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         pl.id,
         pl.created_at AS saved_at,
         p.id          AS pet_id,
         p.name,
         p.species,
         p.nairobi_area,
         p.adoption_status
       FROM pet_likes pl
       JOIN pets p ON p.id = pl.pet_id
       WHERE pl.user_id = $1
       ORDER BY pl.created_at DESC`,
      [req.user.id]
    );

    const pets = rows.map(r => ({
      id: r.id,
      saved_at: r.saved_at,
      pet: {
        id: r.pet_id,
        name: r.name,
        species: r.species,
        nairobi_area: r.nairobi_area,
        adoption_status: r.adoption_status
      },
    }));

    return ok(res, { pets });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function getInterests(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         ai.id,
         ai.status,
         ai.created_at,
         p.id          AS pet_id,
         p.name,
         p.species,
         p.nairobi_area,
         p.adoption_status
       FROM adoption_interests ai
       JOIN pets p ON p.id = ai.pet_id
       WHERE ai.adopter_id = $1
       ORDER BY ai.created_at DESC`,
      [req.user.id]
    );

    const interests = rows.map(r => ({
      id: r.id,
      status: r.status,
      created_at: r.created_at,
      pet: {
        id: r.pet_id,
        name: r.name,
        species: r.species,
        nairobi_area: r.nairobi_area,
        adoption_status: r.adoption_status
      },
    }));

    return ok(res, { interests });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function getCommented(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.species,
         p.nairobi_area,
         p.adoption_status,
         MAX(c.created_at) AS last_commented_at
       FROM pet_comments c
       JOIN pets p ON p.id = c.pet_id
       WHERE c.user_id = $1
       GROUP BY p.id, p.name, p.species, p.nairobi_area, p.adoption_status
       ORDER BY last_commented_at DESC`,
      [req.user.id]
    );

    const pets = rows.map(r => ({
      id: r.id,
      last_commented_at: r.last_commented_at,
      pet: {
        id: r.id,
        name: r.name,
        species: r.species,
        nairobi_area: r.nairobi_area,
        adoption_status: r.adoption_status
      },
    }));

    return ok(res, { pets });
  } catch (err) {
    const { status, message } = mapPgError(err);
    console.log(err);
    return fail(res, status, message);
  }
}

module.exports = { getSaved, getInterests, getCommented };