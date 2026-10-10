const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All store owner routes require authentication and STORE_OWNER role
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', ownerController.getDashboard);
router.get('/ratings', ownerController.getRatings);

module.exports = router;
