const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const checkPermission = require('../middleware/rbac');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, checkPermission('changePassword'), authController.changePassword);
router.get('/permissions', authMiddleware, authController.getPermissionsForUser);

// User management routes (Admin/Manager only)
router.get('/users', authMiddleware, checkPermission('viewUsers'), authController.getAllUsers);
// Allow users to update their own role (no permission check needed)
router.put('/users/:userId/role', authMiddleware, authController.updateUserRole);

module.exports = router;
