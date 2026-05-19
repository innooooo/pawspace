const express = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/interestsController');

const petInterests = express.Router({ mergeParams: true });
petInterests.post('/', requireAuth, ctrl.expressInterest);
petInterests.get('/', requireAuth, ctrl.listPetInterests);

const interestPatch = express.Router();
interestPatch.use(requireAuth);
interestPatch.patch('/:id', ctrl.patchInterest);

module.exports = { petInterests, interestPatch };
