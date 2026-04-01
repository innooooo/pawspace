const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { fail } = require('../utils/response');
const ctrl = require('../controllers/photosController');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okMime = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
    if (!okMime) {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'));
      return;
    }
    cb(null, true);
  },
});

function handleMulterError(err, req, res, next) {
  if (!err) return next();
  if (err.message === 'Only JPEG, PNG, WebP, or GIF images are allowed.') {
    return fail(res, 400, err.message);
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 400, 'Each file must be 5MB or smaller.');
  }
  return next(err);
}

router.post(
  '/',
  requireAuth,
  upload.array('photos', 5),
  handleMulterError,
  ctrl.uploadPhotos
);
router.patch('/:photoId/primary', requireAuth, ctrl.setPrimaryPhoto);
router.delete('/:photoId', requireAuth, ctrl.deletePhoto);

module.exports = router;
