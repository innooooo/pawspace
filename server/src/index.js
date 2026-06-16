require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { fail } = require('./utils/response');
const { interestPatch } = require('./routes/interests');

const app = express();

/**
 * =========================
 * Ensure uploads directory
 * =========================
 */
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * =========================
 * ENV CHECK (optional safety)
 * =========================
 */
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET is not set.');
}

/**
 * =========================
 * CORS CONFIG (FIXED)
 * =========================
 */
const allowedOrigins = [
  'http://localhost:5173',
  'https://pawspace-kappa.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * =========================
 * CORE MIDDLEWARE
 * =========================
 */
app.use(express.json());

/**
 * =========================
 * STATIC FILES
 * =========================
 */

app.use('/uploads', express.static(uploadsDir));

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/interests', interestPatch);
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notification-preferences', require('./routes/notificationPreferences'));
app.use('/api/favorites', require('./routes/favorites'));

/**
 * =========================
 * GLOBAL ERROR HANDLER
 * =========================
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('🔥 Server Error:', err);

  if (err.message === 'Only JPEG, PNG, WebP, or GIF images are allowed.') {
    return fail(res, 400, err.message);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 400, 'Each file must be 5MB or smaller.');
  }

  return fail(res, 500, 'Something went wrong. Please try again.');
});

/**
 * =========================
 * START SERVER
 * =========================
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 PawSpace API running on port ${PORT}`);
  console.log('🌍 Allowed origins:', allowedOrigins);
});
