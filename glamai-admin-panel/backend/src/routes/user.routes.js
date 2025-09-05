const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

// Get all users (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);

// Get user by ID
router.get('/:id', authorize('admin'), userController.getUserById);

// Update user
router.put(
  '/:id',
  authorize('admin'),
  validate([
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['admin', 'sub-admin', 'viewer']),
    body('permissions').optional().isArray(),
    body('isActive').optional().isBoolean()
  ]),
  userController.updateUser
);

// Delete user
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Update user permissions
router.put('/:id/permissions', authorize('admin'), userController.updatePermissions);

// Reset user password
router.post('/:id/reset-password', authorize('admin'), userController.resetUserPassword);

// Get user activity
router.get('/:id/activity', authorize('admin'), userController.getUserActivity);

module.exports = router;