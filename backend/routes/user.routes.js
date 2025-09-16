// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadAvatar = require('../middleware/avatarUpload.middleware');

// 获取用户信息
router.get('/:id', userController.getUserById);

// 获取当前用户信息（需要验证）
router.get('/me', authMiddleware.verifyToken, userController.getCurrentUser);

// 获取用户的帖子
router.get('/:id/posts', userController.getUserPosts);

// 更新用户个人资料（需要验证）
router.put('/:id/profile', authMiddleware.verifyToken, uploadAvatar.single('avatar'), userController.updateProfile);

module.exports = router;