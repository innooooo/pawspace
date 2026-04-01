const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

const MAX_PHOTOS_PER_PET = 5;

function publicBaseUrl(req) {
  const env = process.env.PUBLIC_API_URL || process.env.API_BASE_URL;
  if (env) return env.replace(/\/$/, '');
  const host = req.get('host') || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${proto}://${host}`;
}

function filePathFromStorageKey(storageKey) {
  const uploadsRoot = path.join(__dirname, '../../uploads');
  const basename = path.basename(storageKey);
  return path.join(uploadsRoot, basename);
}

async function assertPetOwner(petId, userId) {
  const { rows } = await pool.query(`SELECT owner_id FROM pets WHERE id = $1`, [petId]);
  if (!rows.length) return { error: 'not_found' };
  if (rows[0].owner_id !== userId) return { error: 'forbidden' };
  return { ok: true };
}

async function uploadPhotos(req, res) {
  const petId = req.params.id;
  const files = req.files;
  if (!files || !files.length) {
    return fail(res, 400, 'No image files uploaded. Use field name "photos".');
  }

  try {
    const gate = await assertPetOwner(petId, req.user.id);
    if (gate.error === 'not_found') return fail(res, 404, 'Pet not found.');
    if (gate.error === 'forbidden') return fail(res, 403, 'You can only add photos to your own pet listings.');

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pet_photos WHERE pet_id = $1`,
      [petId]
    );
    const current = countRows[0].c;
    if (current + files.length > MAX_PHOTOS_PER_PET) {
      return fail(res, 400, `Each pet can have at most ${MAX_PHOTOS_PER_PET} photos.`);
    }

    const { rows: orderRows } = await pool.query(
      `SELECT COALESCE(MAX(display_order), -1)::int AS m FROM pet_photos WHERE pet_id = $1`,
      [petId]
    );
    let order = orderRows[0].m + 1;

    const base = publicBaseUrl(req);
    const inserted = [];
    let assignPrimaryToNext = current === 0;

    for (const file of files) {
      const storage_key = file.filename;
      const url = `${base}/uploads/${encodeURIComponent(file.filename)}`;
      const is_primary = assignPrimaryToNext;
      assignPrimaryToNext = false;

      const { rows } = await pool.query(
        `INSERT INTO pet_photos (pet_id, url, storage_key, display_order, is_primary)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [petId, url, storage_key, order, is_primary]
      );
      inserted.push(rows[0]);
      order += 1;
    }

    return ok(res, { photos: inserted }, null, 201);
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function deletePhoto(req, res) {
  const petId = req.params.id;
  const { photoId } = req.params;

  try {
    const gate = await assertPetOwner(petId, req.user.id);
    if (gate.error === 'not_found') return fail(res, 404, 'Pet not found.');
    if (gate.error === 'forbidden') return fail(res, 403, 'You can only delete photos from your own pet listings.');

    const { rows } = await pool.query(
      `SELECT id, storage_key, is_primary FROM pet_photos WHERE id = $1 AND pet_id = $2`,
      [photoId, petId]
    );
    if (!rows.length) {
      return fail(res, 404, 'Photo not found.');
    }
    const row = rows[0];

    await pool.query(`DELETE FROM pet_photos WHERE id = $1`, [photoId]);

    const fp = filePathFromStorageKey(row.storage_key);
    fs.unlink(fp, () => {});

    if (row.is_primary) {
      const { rows: nextRows } = await pool.query(
        `SELECT id FROM pet_photos WHERE pet_id = $1 ORDER BY display_order ASC, created_at ASC LIMIT 1`,
        [petId]
      );
      if (nextRows.length) {
        await pool.query(`UPDATE pet_photos SET is_primary = true WHERE id = $1`, [nextRows[0].id]);
      }
    }

    return ok(res, { deleted: true });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function setPrimaryPhoto(req, res) {
  const petId = req.params.id;
  const { photoId } = req.params;

  const client = await pool.connect();
  try {
    const gate = await assertPetOwner(petId, req.user.id);
    if (gate.error === 'not_found') return fail(res, 404, 'Pet not found.');
    if (gate.error === 'forbidden') return fail(res, 403, 'You can only update photos on your own pet listings.');

    const { rows } = await client.query(
      `SELECT id FROM pet_photos WHERE id = $1 AND pet_id = $2`,
      [photoId, petId]
    );
    if (!rows.length) {
      return fail(res, 404, 'Photo not found.');
    }

    await client.query('BEGIN');
    await client.query(`UPDATE pet_photos SET is_primary = false WHERE pet_id = $1`, [petId]);
    await client.query(`UPDATE pet_photos SET is_primary = true WHERE id = $1`, [photoId]);
    await client.query('COMMIT');

    const { rows: updated } = await pool.query(`SELECT * FROM pet_photos WHERE id = $1`, [photoId]);
    return ok(res, { photo: updated[0] });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  } finally {
    client.release();
  }
}

module.exports = { uploadPhotos, deletePhoto, setPrimaryPhoto };
