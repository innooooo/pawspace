const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

const ALLOWED_FIELDS = ['name', 'phone', 'nairobi_area'];
const NAIROBI_AREAS = [
  'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Parklands',
  'Kasarani', 'Embakasi', 'Langata', 'South B', 'South C',
  'Kibera', 'Ruaka', 'Kileleshwa', 'Other',
];

async function updateMe(req, res) {
  const updates = {};

  for (const field of ALLOWED_FIELDS) {
    if (field in req.body) {
      const val = req.body[field];
      if (typeof val !== 'string') {
        return fail(res, 400, `${field} must be a string.`);
      }
      if ('phone' in updates) {
        const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
        if (!phoneRegex.test(updates.phone)) {
          return fail(res, 400, 'Invalid phone number.');
        }
      }
      if ('nairobi_area' in updates && !NAIROBI_AREAS.includes(updates.nairobi_area)) {
        return fail(res, 400, 'Invalid area selected.');
      }
      updates[field] = val.trim();
    }
  }

  if (!Object.keys(updates).length) {
    return fail(res, 400, 'No valid fields provided.');
  }

  const setClauses = Object.keys(updates).map((f, i) => `${f} = $${i + 1}`);
  const values = [...Object.values(updates), req.user.id];

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET ${setClauses.join(', ')}
       WHERE id = $${values.length}
       RETURNING id, name, phone, nairobi_area, email`,
      values
    );

    if (!rows.length) return fail(res, 404, 'User not found.');
    return ok(res, { user: rows[0] });
  } catch (err) {
    const { status, message } = mapPgError(err);
    if (err.code === '23505' && err.constraint === 'users_name_unique') {
      return { status: 409, message: 'That display name is already taken.' };
    }

    return fail(res, status, message);
  }
}

module.exports = { updateMe };