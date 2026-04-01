const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { fail } = require('../utils/response');

function getBearerToken(req) {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return fail(res, 401, 'Authentication required.');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.userId;
    if (!userId) {
      return fail(res, 401, 'Invalid token.');
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, bio, nairobi_area, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (!rows.length) {
      return fail(res, 401, 'User no longer exists.');
    }
    req.user = rows[0];
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return fail(res, 401, 'Session expired. Please sign in again.');
    }
    if (e.name === 'JsonWebTokenError') {
      return fail(res, 401, 'Invalid token.');
    }
    next(e);
  }
}

async function optionalAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.userId;
    if (!userId) {
      req.user = null;
      return next();
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, bio, nairobi_area, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    req.user = rows.length ? rows[0] : null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

module.exports = { requireAuth, optionalAuth, getBearerToken };
