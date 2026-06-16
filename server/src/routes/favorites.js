const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getSaved, getInterests, getCommented } = require('../controllers/favoritesController');

router.get('/saved', requireAuth, getSaved);
router.get('/interests', requireAuth, getInterests);
router.get('/commented', requireAuth, getCommented);

module.exports = router;