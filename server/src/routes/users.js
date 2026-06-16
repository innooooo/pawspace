const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listMyInterests } = require('../controllers/interestsController');
const { updateMe } = require('../controllers/usersController');

router.get('/me/interests', requireAuth, listMyInterests);
router.patch('/me', requireAuth, updateMe);

module.exports = router;
