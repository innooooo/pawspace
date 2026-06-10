const { pool } = require('../config/db');
const { ok, fail } = require('../utils/response');
const { mapPgError } = require('../utils/dbErrors');

const DEFAULTS = {
  email_new_interest: true,
  email_interest_accepted: true,
  email_new_message: true,
  email_pet_likes_digest: false,
};

async function getPreferences(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT preferences FROM user_notification_preferences WHERE user_id = $1`,
      [req.user.id]
    );
    return ok(res, { preferences: { ...DEFAULTS, ...rows[0]?.preferences } });
  } catch (err) {
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

async function updatePreferences(req, res) {
  const allowed = Object.keys(DEFAULTS);
  const update = {};

  for (const key of allowed) {
    if (key in req.body) {
      if (typeof req.body[key] !== 'boolean') {
        return fail(res, 400, `${key} must be a boolean.`);
      }
      update[key] = req.body[key];
    }
  }

  if (!Object.keys(update).length) {
    return fail(res, 400, 'No valid preference keys provided.');
  }

  try {
    await pool.query(
      `INSERT INTO user_notification_preferences (user_id, preferences)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET preferences = user_notification_preferences.preferences || $2::jsonb`,
      [req.user.id, JSON.stringify(update)]
    );
    const { rows } = await pool.query(
      `SELECT preferences FROM user_notification_preferences WHERE user_id = $1`,
      [req.user.id]
    );
    console.log("Successfully saved...")
    return ok(res, { preferences: { ...DEFAULTS, ...rows[0].preferences } });
  } catch (err) {
    console.log(err)
    const { status, message } = mapPgError(err);
    return fail(res, status, message);
  }
}

// Internal helper — used by notificationsController to check before sending email
async function getUserEmailPrefs(userId) {
  try {
    const { rows } = await pool.query(
      `SELECT preferences FROM user_notification_preferences WHERE user_id = $1`,
      [userId]
    );
    return { ...DEFAULTS, ...rows[0]?.preferences };
  } catch {
    return { ...DEFAULTS };
  }
}

module.exports = { getPreferences, updatePreferences, getUserEmailPrefs };