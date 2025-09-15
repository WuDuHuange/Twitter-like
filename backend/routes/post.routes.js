// post.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/uploads.middleware');

// 获取所有帖子（带分页）
router.get('/', postController.getAllPosts);

// 获取单个帖子
router.get('/:id', postController.getPostById);

// 创建新帖子（需要验证）- 添加单图片上传
router.post('/', authMiddleware.verifyToken, upload.single('image'), postController.createPost);

// 删除帖子（需要验证）
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

module.exports = router;