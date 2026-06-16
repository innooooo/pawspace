const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getPreferences, updatePreferences } = require('../controllers/notificationPreferencesController')

router.get('/me', requireAuth, getPreferences)
router.patch('/me', requireAuth, updatePreferences)

module.exports = router