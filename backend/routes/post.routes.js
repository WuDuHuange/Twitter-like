// post.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/uploads.middleware');

// Get all posts (with pagination)
router.get('/', postController.getAllPosts);

// Get single post
router.get('/:id', postController.getPostById);

// Create new post (requires auth) - with single image upload
router.post('/', authMiddleware.verifyToken, upload.single('image'), postController.createPost);

// Delete post (requires auth)
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

module.exports = router;