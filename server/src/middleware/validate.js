const { fail } = require('../utils/response');

/**
 * Require non-empty string fields on req.body (after trim).
 */
function requireBodyFields(...fieldNames) {
  return (req, res, next) => {
    const missing = [];
    for (const name of fieldNames) {
      const v = req.body[name];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        missing.push(name);
      }
    }
    if (missing.length) {
      return fail(res, 400, `Missing or empty required: ${missing.join(', ')}`);
    }
    next();
  };
}

/**
 * Optional: allow empty string but field must be present (use sparingly).
 */
function requireBodyKeysPresent(...fieldNames) {
  return (req, res, next) => {
    const missing = fieldNames.filter((name) => req.body[name] === undefined);
    if (missing.length) {
      return fail(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }
    next();
  };
}

module.exports = { requireBodyFields, requireBodyKeysPresent };
