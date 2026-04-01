const express = require('express');
const router = express.Router();
const pets = require('../controllers/petsController');
const photosRouter = require('./photos');
const { petInterests } = require('./interests');
const likesRouter = require('./likes');
const { requireAuth } = require('../middleware/auth');

router.get('/', pets.listPets);
router.post('/', requireAuth, pets.createPet);
router.use('/:id/photos', photosRouter);
router.use('/:id/interests', petInterests);
router.use('/:id', likesRouter);
router.get('/:id', pets.getPet);
router.patch('/:id', requireAuth, pets.updatePet);
router.delete('/:id', requireAuth, pets.deletePet);

module.exports = router;
