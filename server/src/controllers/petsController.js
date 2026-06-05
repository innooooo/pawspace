const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');
const { publicUser } = require('./authController');
const {
  SPECIES,
  ADOPTION_STATUS,
  SEX,
  SIZE,
  NAIROBI_AREAS,
} = require('../utils/constants');

const PAGE_SIZE = 12;

function canOwnPets(user) {
  return user && (user.role === 'owner' || user.role === 'both');
}

function validatePetPayload(body, partial) {
  const errors = [];
  const check = (cond, msg) => {
    if (!cond) errors.push(msg);
  };

  if (!partial || body.name !== undefined) check(body.name && String(body.name).trim(), 'name is required');
  if (!partial || body.species !== undefined) {
    check(body.species && SPECIES.includes(body.species), 'species must be dog, cat, rabbit, bird, or other');
  }
  if (!partial || body.sex !== undefined) {
    check(body.sex && SEX.includes(body.sex), 'sex must be male, female, or unknown');
  }
  if (!partial || body.size !== undefined) {
    check(body.size && SIZE.includes(body.size), 'size must be small, medium, or large');
  }
  if (!partial || body.description !== undefined) {
    check(body.description && String(body.description).trim(), 'description is required');
  }
  if (!partial || body.adoption_status !== undefined) {
    check(
      body.adoption_status && ADOPTION_STATUS.includes(body.adoption_status),
      'adoption_status must be available, pending, or adopted'
    );
  }
  if (!partial || body.nairobi_area !== undefined) {
    check(body.nairobi_area && NAIROBI_AREAS.includes(body.nairobi_area), 'invalid nairobi_area');
  }

  if (body.age_years !== undefined && body.age_years !== null && body.age_years !== '') {
    const n = Number(body.age_years);
    check(Number.isInteger(n) && n >= 0 && n <= 40, 'age_years must be an integer 0–40');
  }
  if (body.age_months !== undefined && body.age_months !== null && body.age_months !== '') {
    const n = Number(body.age_months);
    check(Number.isInteger(n) && n >= 0 && n <= 11, 'age_months must be an integer 0–11');
  }
  if (body.is_vaccinated !== undefined && typeof body.is_vaccinated !== 'boolean') {
    errors.push('is_vaccinated must be boolean');
  }
  if (body.is_neutered !== undefined && typeof body.is_neutered !== 'boolean') {
    errors.push('is_neutered must be boolean');
  }

  return errors.length ? errors.join('; ') : null;
}

async function createPet(req, res) {
  if (!canOwnPets(req.user)) {
    return fail(res, 403, 'Only owners can create pet listings. Update your profile role to owner or both.');
  }

  const errMsg = validatePetPayload(req.body, false);
  if (errMsg) return fail(res, 400, errMsg);

  const {
    name,
    species,
    breed,
    age_years,
    age_months,
    sex,
    size,
    description,
    adoption_status,
    nairobi_area,
    is_vaccinated,
    is_neutered,
  } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO pets (
        owner_id, name, species, breed, age_years, age_months, sex, size, description,
        adoption_status, nairobi_area, is_vaccinated, is_neutered
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        req.user.id,
        String(name).trim(),
        species,
        breed != null && breed !== '' ? String(breed).trim() : null,
        age_years === '' || age_years == null ? null : Number(age_years),
        age_months === '' || age_months == null ? null : Number(age_months),
        sex,
        size,
        String(description).trim(),
        adoption_status,
        nairobi_area,
        Boolean(is_vaccinated),
        Boolean(is_neutered),
      ]
    );
    return ok(res, { pet: rows[0] }, null, 201);
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function listPets(req, res) {
  //disabling caching
  res.set('Cache-Control', 'no-store');

  const species = req.query.species;
  const adoption_status = req.query.adoption_status;
  const nairobi_area = req.query.nairobi_area;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = [];
  where.push(`p.adoption_status != 'archived' `);
  const params = [];
  let i = 1;

  if (species) {
    if (!SPECIES.includes(species)) {
      return fail(res, 400, 'Invalid species filter.');
    }
    where.push(`p.species = $${i++}`);
    params.push(species);
  }
  if (adoption_status) {
    if (!ADOPTION_STATUS.includes(adoption_status)) {
      return fail(res, 400, 'Invalid adoption_status filter.');
    }
    where.push(`p.adoption_status = $${i++}`);
    params.push(adoption_status);
  }
  if (nairobi_area) {
    if (!NAIROBI_AREAS.includes(nairobi_area)) {
      return fail(res, 400, 'Invalid nairobi_area filter.');
    }
    where.push(`p.nairobi_area = $${i++}`);
    params.push(nairobi_area);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pets p ${whereSql}`,
      params
    );

    const total = countResult.rows?.[0]?.c ?? 0;

    const queryParams = [...params, PAGE_SIZE, offset];

    const listSql = `
      SELECT p.*, pp.url AS primary_photo_url,
        (SELECT COUNT(*)::int FROM pet_likes pl WHERE pl.pet_id = p.id) AS like_count
      FROM pets p
      LEFT JOIN pet_photos pp ON pp.pet_id = p.id AND pp.is_primary = true
      ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const { rows } = await pool.query(listSql, queryParams);

    const hasMore = offset + rows.length < total;
    

    return ok(res, { pets: rows }, { page, limit: PAGE_SIZE, total, hasMore });
  } catch (err) {
  return fail(res, 500, err.message, err.stack);
}
}

async function listMyPets(req, res) {
  const species = req.query.species;
  const adoption_status = req.query.adoption_status;
  const nairobi_area = req.query.nairobi_area;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const where = ['p.owner_id = $1'];
  const params = [req.user.id];
  let i = 2;

  if (species) {
    if (!SPECIES.includes(species)) {
      return fail(res, 400, 'Invalid species filter.');
    }
    where.push(`p.species = $${i++}`);
    params.push(species);
  }
  if (adoption_status) {
    if (!ADOPTION_STATUS.includes(adoption_status)) {
      return fail(res, 400, 'Invalid adoption_status filter.');
    }
    where.push(`p.adoption_status = $${i++}`);
    params.push(adoption_status);
  }
  if (nairobi_area) {
    if (!NAIROBI_AREAS.includes(nairobi_area)) {
      return fail(res, 400, 'Invalid nairobi_area filter.');
    }
    where.push(`p.nairobi_area = $${i++}`);
    params.push(nairobi_area);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pets p ${whereSql}`,
      params
    );

    const total = countResult.rows?.[0]?.c ?? 0;

    const queryParams = [...params, PAGE_SIZE, offset];

    const listSql = `
      SELECT p.*, pp.url AS primary_photo_url,
        (SELECT COUNT(*)::int FROM pet_likes pl WHERE pl.pet_id = p.id) AS like_count
      FROM pets p
      LEFT JOIN pet_photos pp ON pp.pet_id = p.id AND pp.is_primary = true
      ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const { rows } = await pool.query(listSql, queryParams);
    const hasMore = offset + rows.length < total;
    return ok(res, { pets: rows }, { page, limit: PAGE_SIZE, total, hasMore });
  } catch (err) {
  return fail(res, 500, err.message, err.stack);
}
}

async function getPet(req, res) {
  const { id } = req.params;
  try {
    const petResult = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);
    if (!petResult.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }
    const pet = petResult.rows[0];

    const ownerResult = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, bio, nairobi_area, created_at, updated_at
       FROM users WHERE id = $1`,
      [pet.owner_id]
    );

    const photosResult = await pool.query(
      `SELECT id, pet_id, url, storage_key, display_order, is_primary, created_at
       FROM pet_photos WHERE pet_id = $1 ORDER BY display_order ASC, created_at ASC`,
      [id]
    );

    return ok(res, {
      pet,
      owner: publicUser(ownerResult.rows[0]),
      photos: photosResult.rows,
    });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function updatePet(req, res) {
  const { id } = req.params;

  const action = req.body.action; // 'archive' | 'adopt' | 'delete' | undefined (normal edit)
  const allowedEditFields = [
    'name',
    'species',
    'breed',
    'age_years',
    'age_months',
    'sex',
    'size',
    'description',
    'adoption_status',
    'nairobi_area',
    'is_vaccinated',
    'is_neutered',
  ];

  try {
    // Fetch existing pet
    const existing = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);
    if (!existing.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }
    const pet = existing.rows[0];

    if (pet.owner_id !== req.user.id) {
      return fail(res, 403, 'You can only update your own pet listings.');
    }

    // Handle archive action
    if (action === 'archive') {
      await pool.query(
        `UPDATE pets SET adoption_status = 'archived' WHERE id = $1 RETURNING *`,
        [id]
      );
      const { rows } = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);
      return ok(res, { pet: rows[0], message: 'Listing archived.' });
    }

    //Handle listing reactivation
    if (action === 'reactivate') {
      const { rows } = await pool.query(
        `UPDATE pets SET adoption_status = 'available' WHERE id = $1 RETURNING *`,
        [id]
      );
      return ok(res, { pet: rows[0], message: 'Listing reactivated.' });
    }

    // Handle adopt action
    if (action === 'adopt') {
      const successNote = req.body.success_note;
      if (successNote != null) {
        if (typeof successNote !== 'string' || successNote.length > 300) {
          return fail(res, 400, 'success_note must be a string with max 300 characters.');
        }
      }
      const successPhoto = req.body.success_photo_url; // assume URL or null

      await pool.query(
        `UPDATE pets 
         SET adoption_status = 'adopted', 
             success_note = $2, 
             success_photo_url = $3 
         WHERE id = $1 
         RETURNING *`,
        [id, successNote ?? null, successPhoto ?? null]
      );
      const { rows } = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);
      return ok(res, { pet: rows[0], message: 'Pet marked as adopted.' });
    }

    // Normal edit: only if no special action
    if (action != null && action !== 'edit') {
      return fail(res, 400, `Invalid action: ${action}. Use 'archive', 'adopt', 'delete', or omit for edit.`);
    }

    const errMsg = validatePetPayload(req.body, true);
    if (errMsg) return fail(res, 400, errMsg);

    // Build dynamic UPDATE for allowed fields
    const sets = [];
    const values = [];
    let idx = 1;

    //SQL injection prevention
    for (const key of allowedEditFields) {
      if (req.body[key] === undefined) continue;
      let v = req.body[key];
      
      //Data validation per field
      if (key === 'name' || key === 'description' || key === 'breed') {
        v = v != null ? String(v).trim() : v;
        if (key === 'breed' && v === '') v = null;
      }
      if (key === 'age_years' || key === 'age_months') {
        v = v === '' || v == null ? null : Number(v);
      }
      if (key === 'is_vaccinated' || key === 'is_neutered') {
        v = Boolean(v);
      }

      // Prevent changing adoption_status via normal edit; only via actions
      if (key === 'adoption_status') continue;

      sets.push(`${key} = $${idx++}`);
      values.push(v);
    }

    if (!sets.length && !req.body.success_note && !req.body.success_photo) {
      // Allow edit-only if there are real fields; otherwise no-op
      return fail(res, 400, 'No valid fields to update.');
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE pets SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return ok(res, { pet: rows[0] });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

function uploadsFilePath(storageKey) {
  const basename = path.basename(storageKey);
  return path.join(__dirname, '../../uploads', basename);
}

async function deletePet(req, res) {
  const { id } = req.params;
  try {
    const existing = await pool.query(`SELECT owner_id FROM pets WHERE id = $1`, [id]);
    if (!existing.rows.length) {
      return fail(res, 404, 'Pet not found.');
    }
    if (existing.rows[0].owner_id !== req.user.id) {
      return fail(res, 403, 'You can only delete your own pet listings.');
    }
    const photos = await pool.query(`SELECT storage_key FROM pet_photos WHERE pet_id = $1`, [id]);
    await pool.query(`DELETE FROM pets WHERE id = $1`, [id]);
    for (const row of photos.rows) {
      fs.unlink(uploadsFilePath(row.storage_key), () => {});
    }
    return ok(res, { deleted: true });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

module.exports = {
  createPet,
  listPets,
  listMyPets,
  getPet,
  updatePet,
  deletePet,
  canOwnPets,
};
