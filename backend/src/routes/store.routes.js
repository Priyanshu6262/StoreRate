const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { ratingSchema } = require('../validators/rating.validator');

// All store endpoints require authentication
router.use(authenticate);

// Get list of stores with optional search, sorting, pagination
router.get('/', storeController.getStores);

// Get store details
router.get('/:id', storeController.getStoreById);

// Submit rating (Normal User or Admin)
router.post(
  '/:id/rating',
  authorize('USER', 'ADMIN'),
  validate(ratingSchema),
  storeController.submitRating
);

// Modify rating
router.put(
  '/:id/rating',
  authorize('USER', 'ADMIN'),
  validate(ratingSchema),
  storeController.submitRating
);

module.exports = router;
