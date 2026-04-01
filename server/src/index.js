require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { fail } = require('./utils/response');
const { interestPatch } = require('./routes/interests');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Set it before production.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/interests', interestPatch);
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err.message === 'Only JPEG, PNG, WebP, or GIF images are allowed.') {
    return fail(res, 400, err.message);
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 400, 'Each file must be 5MB or smaller.');
  }
  console.error(err);
  return fail(res, 500, 'Something went wrong. Please try again.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PawSpace API listening on port ${PORT}`);
});
