/**
 * Standard API envelope: { data, error, meta }
 */

function ok(res, data, meta = null, status = 200) {
  return res.status(status).json({
    data: data ?? null,
    error: null,
    meta: meta ?? null,
  });
}

function fail(res, status, message, meta = null) {
  return res.status(status).json({
    data: null,
    error: message,
    meta: meta ?? null,
  });
}

module.exports = { ok, fail };
