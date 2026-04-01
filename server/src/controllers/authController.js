const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');
const { NAIROBI_AREAS } = require('../utils/constants');

function publicUser(row) {
  if (!row) return null;
  const { password_hash: _p, ...rest } = row;
  return rest;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

async function register(req, res) {
  const { name, email, password, phone, nairobi_area } = req.body;

  if (!password || String(password).length < 8) {
    return fail(res, 400, 'Password must be at least 8 characters.');
  }
  if (!isValidEmail(email)) {
    return fail(res, 400, 'Please provide a valid email address.');
  }
  if (!NAIROBI_AREAS.includes(nairobi_area)) {
    return fail(res, 400, 'Invalid nairobi_area.');
  }

  const password_hash = await bcrypt.hash(String(password), 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, nairobi_area)
       VALUES ($1, $2, $3, $4, 'both', $5)
       RETURNING id, name, email, phone, role, avatar_url, bio, nairobi_area, created_at, updated_at`,
      [String(name).trim(), String(email).trim().toLowerCase(), password_hash, phone || null, nairobi_area]
    );
    const user = rows[0];
    const token = signToken(user.id);
    return ok(res, { user, token }, null, 201);
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return fail(res, 400, 'Email and password are required.');
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash, phone, role, avatar_url, bio, nairobi_area, created_at, updated_at
       FROM users WHERE email = $1`,
      [String(email).trim().toLowerCase()]
    );
    if (!rows.length) {
      return fail(res, 401, 'Invalid email or password.');
    }
    const user = rows[0];
    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) {
      return fail(res, 401, 'Invalid email or password.');
    }
    const token = signToken(user.id);
    return ok(res, { user: publicUser(user), token });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function me(req, res) {
  return ok(res, { user: publicUser(req.user) });
}

module.exports = { register, login, me, publicUser, signToken };
