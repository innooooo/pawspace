const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/likesController');

router.get('/likes', optionalAuth, ctrl.getLikes);
router.post('/like', requireAuth, ctrl.toggleLike);

module.exports = router;
