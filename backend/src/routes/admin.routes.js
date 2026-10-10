const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createUserSchema } = require('../validators/user.validator');
const { createStoreSchema } = require('../validators/store.validator');

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.get('/users/:id', adminController.getUserById);

router.get('/stores', adminController.getStores);
router.post('/stores', validate(createStoreSchema), adminController.createStore);

module.exports = router;
