// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// 获取用户信息
router.get('/:id', userController.getUserById);

// 获取当前用户信息（需要验证）
router.get('/me', authMiddleware.verifyToken, userController.getCurrentUser);

// 获取用户的帖子
router.get('/:id/posts', userController.getUserPosts);

module.exports = router;