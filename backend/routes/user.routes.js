// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadAvatar = require('../middleware/avatarUpload.middleware');

// Get user information
router.get('/:id', userController.getUserById);

// Get current user information (requires auth)
router.get('/me', authMiddleware.verifyToken, userController.getCurrentUser);

// Get user posts
router.get('/:id/posts', userController.getUserPosts);

// Update user profile (requires auth)
router.put('/:id/profile', authMiddleware.verifyToken, uploadAvatar.single('avatar'), userController.updateProfile);

module.exports = router;