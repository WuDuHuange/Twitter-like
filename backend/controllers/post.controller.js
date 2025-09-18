// post.controller.js
const db = require('../config/db.config');
const path = require('path');
const fs = require('fs');

// Get all posts (with pagination
exports.getAllPosts = async (req, res) => {
  try {
    // Pagination parameter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get the total number of posts
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM posts');
    const totalPosts = countResult[0].total;
    
    // Get the paginated post
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.avatar
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // Convert the image URL and avatar URL to the full path
    posts.forEach(post => {
      if (post.image_url) {
        // Check whether the complete URL is already included
        if (!post.image_url.startsWith('http')) {
          // If the file name already contains the uploads path, do not add it again
          if (post.image_url.includes('uploads/')) {
            post.image_url = `http://localhost:3000/${post.image_url}`;
          } else {
            post.image_url = `http://localhost:3000/uploads/${post.image_url}`;
          }
        }
      }
      
      if (post.avatar) {
        // Check whether the complete URL is already included
        if (!post.avatar.startsWith('http')) {
          post.avatar = `http://localhost:3000${post.avatar}`;
        }
      }
    });
    
    res.status(200).send({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).send({ message: 'There was a server error during the process of obtaining the post' });
  }
};

// Get a single post
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Get post information
    const [posts] = await db.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [postId]);
    
    if (posts.length === 0) {
      return res.status(404).send({ message: 'Could not find the post' });
    }
    
    // Convert the image URL to the full path
    if (posts[0].image_url) {
      // Check whether the complete URL is already included
      if (!posts[0].image_url.startsWith('http')) {
        // If the file name already contains the uploads path, do not add it again
        if (posts[0].image_url.includes('uploads/')) {
          posts[0].image_url = `http://localhost:3000/${posts[0].image_url}`;
        } else {
          posts[0].image_url = `http://localhost:3000/uploads/${posts[0].image_url}`;
        }
      }
    }
    
    res.status(200).send(posts[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).send({ message: 'A server error occurred during the process of obtaining the post' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.userId; // Extract from JWT
    let imageUrl = null;
    
    // Check if there are any files uploaded
    if (req.file) {
      imageUrl = req.file.filename;
    }
    
    if (!content && !imageUrl) {
      return res.status(400).send({ message: 'The content of the post cannot be empty' });
    }
    
    // Create a post
    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [userId, content, imageUrl]
    );
    
    // Obtain user information
    const [users] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
    
    // Build a complete image URL
    const fullImageUrl = imageUrl ? `http://localhost:3000/uploads/${imageUrl}` : null;
    
    res.status(201).send({
      message: 'The post was created successfully.',
      post: {
        id: result.insertId,
        user_id: userId,
        username: users[0].username,
        content,
        image_url: fullImageUrl,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error in creating a post:', error);
    res.status(500).send({ message: 'A server error occurred during the post creation process' });
  }
};

// Delete the post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId; // Extract from JWT
    
    // Check whether the post exists and belongs to the current user
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );
    
    if (posts.length === 0) {
      return res.status(403).send({ message: 'There is no permission to delete this post or the post does not exist' });
    }
    
    // Delete the post
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    
    res.status(200).send({ message: 'The post was successfully deleted.' });
  } catch (error) {
    console.error('Deleted post error:', error);
    res.status(500).send({ message: 'A server error occurred during the process of deleting the post' });
  }
};