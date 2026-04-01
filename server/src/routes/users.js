const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listMyInterests } = require('../controllers/interestsController');

router.get('/me/interests', requireAuth, listMyInterests);

module.exports = router;
