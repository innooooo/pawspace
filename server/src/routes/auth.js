const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { requireBodyFields } = require('../middleware/validate');

router.post(
  '/register',
  requireBodyFields('name', 'email', 'password', 'nairobi_area'),
  ctrl.register
);
router.post('/login', requireBodyFields('email', 'password'), ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
