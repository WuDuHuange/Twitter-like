// user.controller.js
const db = require('../config/db.config');
const fs = require('fs');
const path = require('path');

// Get user information
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user information, but exclude password
    const [users] = await db.query(
      'SELECT id, username, wallet_address, created_at, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    // Handle avatar path
    if (users[0].avatar) {
      users[0].avatar = `http://localhost:3000${users[0].avatar}`;
    }
    
    res.status(200).send(users[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).send({ message: 'Server error while retrieving user' });
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // get from JWT

    // Get user information, but exclude password
    const [users] = await db.query(
      'SELECT id, username, wallet_address, created_at, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Handle avatar path
    if (users[0].avatar) {
      users[0].avatar = `http://localhost:3000${users[0].avatar}`;
    }
    
    res.status(200).send(users[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).send({ message: 'Server error while retrieving user' });
  }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total number of user posts
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM posts WHERE user_id = ?',
      [userId]
    );
    const totalPosts = countResult[0].total;

    // Get paginated user posts
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.avatar
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // Convert image URLs and avatar URLs to complete paths
    posts.forEach(post => {
      if (post.image_url) {
        // Check if it already contains the complete URL
        if (!post.image_url.startsWith('http')) {
          // If the filename already contains the uploads path, do not add it again
          if (post.image_url.includes('uploads/')) {
            post.image_url = `http://localhost:3000/${post.image_url}`;
          } else {
            post.image_url = `http://localhost:3000/uploads/${post.image_url}`;
          }
        }
      }
      
      if (post.avatar) {
        // Check if it already contains the complete URL
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
    console.error('Error getting user posts:', error);
    res.status(500).send({ message: 'Server error while retrieving user posts' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify that the operator is the owner of the profile
    if (req.userId != userId) {
      return res.status(403).send({ message: 'You do not have permission to modify this user\'s profile' });
    }

    // Check if the user exists
    const [users] = await db.query(
      'SELECT id, username, wallet_address, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    const user = users[0];
    let updateFields = [];
    let queryParams = [];
    let updatedData = {};
    
    // Handle username update
    if (req.body.username && user.username !== req.body.username) {
      // If it's a MetaMask user, do not allow username change
      if (user.wallet_address && user.wallet_address.length > 0) {
        return res.status(403).send({ message: 'MetaMask accounts cannot change their username' });
      }

      // Check if the username already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [req.body.username, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).send({ message: 'Username is already taken' });
      }
      
      updateFields.push('username = ?');
      queryParams.push(req.body.username);
      updatedData.username = req.body.username;
    }

    // Handle avatar upload
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // If the user previously had an avatar, delete the old file
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      updateFields.push('avatar = ?');
      queryParams.push(avatarUrl);

      // Save the database path but return the complete URL
      updatedData.avatar = `http://localhost:3000${avatarUrl}`;
    }

    // If there are no fields to update
    if (updateFields.length === 0) {
      return res.status(400).send({ message: 'No information to be updated provided' });
    }

    // Update user information
    queryParams.push(userId);
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );

    // Return the updated user data
    res.status(200).send({
      id: userId,
      ...updatedData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send({ message: 'Server error while updating user profile' });
  }
};