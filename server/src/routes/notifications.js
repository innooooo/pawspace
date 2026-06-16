const express = require('express')
const router = require('express').Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationsController');
const { getPreferences, updatePreferences } = require('../controllers/notificationPreferencesController');

// read-all MUST be before /:id/read — Express matches top-to-bottom
router.get('/', requireAuth, listNotifications);
router.patch('/read-all', requireAuth, markAllRead);
router.patch('/:id/read', requireAuth, markRead);


module.exports = router