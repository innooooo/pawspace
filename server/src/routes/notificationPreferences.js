const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getPreferences, updatePreferences } = require('../controllers/notificationPreferencesController')

router.get('/me/notification-preferences', requireAuth, getPreferences)
router.patch('/me/notification-preferences', requireAuth, updatePreferences)

module.exports = router