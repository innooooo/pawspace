const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

const PAGE_SIZE = 20;

// ── Internal trigger (not an HTTP handler) ────────────────────────────────────

async function createNotification(userId, { type, title, body, entityType, entityId }) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, title, body ?? null, entityType ?? null, entityId ?? null]
    );
  } catch (err) {
    // Never throw — notification failure must not break the calling action
    console.error('[notifications] createNotification failed:', err?.message ?? err);
  }
}

// ── HTTP handlers ─────────────────────────────────────────────────────────────

async function listNotifications(req, res) {
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, body, entity_type, entity_id, read_at, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY (read_at IS NOT NULL), created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, PAGE_SIZE, offset]
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1`,
      [userId]
    );
    const { rows: unreadRows } = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    const payload = {
      notifications: rows,
      total: parseInt(countRows[0].count),
      unread: parseInt(unreadRows[0].count),
      page,
      pageSize: PAGE_SIZE,
    }
    return ok(res, payload);
  } catch (err) {
    const { status, message } = mapPgError(err);
    console.log(err)
    return fail(res, status, message);
  }
}

async function markRead(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
      [id, userId]
    );
    if (rowCount === 0) return fail(res, 404, 'Notification not found or already read.');
    return ok(res, { success: true });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function markAllRead(req, res) {
  const userId = req.user.id;
  try {
    await pool.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    return ok(res, { success: true });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

module.exports = { createNotification, listNotifications, markRead, markAllRead };