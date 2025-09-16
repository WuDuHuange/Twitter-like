// post.controller.js
const db = require('../config/db.config');
const path = require('path');
const fs = require('fs');

// 获取所有帖子（带分页）
exports.getAllPosts = async (req, res) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取帖子总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM posts');
    const totalPosts = countResult[0].total;
    
    // 获取分页的帖子
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.avatar
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    // 转换图片URL和头像URL为完整路径
    posts.forEach(post => {
      if (post.image_url) {
        // 检查是否已经包含完整URL
        if (!post.image_url.startsWith('http')) {
          // 如果文件名已经包含uploads路径，则不重复添加
          if (post.image_url.includes('uploads/')) {
            post.image_url = `http://localhost:3000/${post.image_url}`;
          } else {
            post.image_url = `http://localhost:3000/uploads/${post.image_url}`;
          }
        }
      }
      
      if (post.avatar) {
        // 检查是否已经包含完整URL
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
    console.error('获取帖子错误:', error);
    res.status(500).send({ message: '获取帖子过程中出现服务器错误' });
  }
};

// 获取单个帖子
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // 获取帖子信息
    const [posts] = await db.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [postId]);
    
    if (posts.length === 0) {
      return res.status(404).send({ message: '找不到帖子' });
    }
    
    // 转换图片URL为完整路径
    if (posts[0].image_url) {
      // 检查是否已经包含完整URL
      if (!posts[0].image_url.startsWith('http')) {
        // 如果文件名已经包含uploads路径，则不重复添加
        if (posts[0].image_url.includes('uploads/')) {
          posts[0].image_url = `http://localhost:3000/${posts[0].image_url}`;
        } else {
          posts[0].image_url = `http://localhost:3000/uploads/${posts[0].image_url}`;
        }
      }
    }
    
    res.status(200).send(posts[0]);
  } catch (error) {
    console.error('获取帖子错误:', error);
    res.status(500).send({ message: '获取帖子过程中出现服务器错误' });
  }
};

// 创建新帖子
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.userId; // 从JWT中提取
    let imageUrl = null;
    
    // 检查是否有文件上传
    if (req.file) {
      imageUrl = req.file.filename;
    }
    
    if (!content && !imageUrl) {
      return res.status(400).send({ message: '帖子内容不能为空' });
    }
    
    // 创建帖子
    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [userId, content, imageUrl]
    );
    
    // 获取用户信息
    const [users] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
    
    // 构建完整的图片URL
    const fullImageUrl = imageUrl ? `http://localhost:3000/uploads/${imageUrl}` : null;
    
    res.status(201).send({
      message: '帖子创建成功',
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
    console.error('创建帖子错误:', error);
    res.status(500).send({ message: '创建帖子过程中出现服务器错误' });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId; // 从JWT中提取
    
    // 检查帖子是否存在并且属于当前用户
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );
    
    if (posts.length === 0) {
      return res.status(403).send({ message: '没有权限删除此帖子或帖子不存在' });
    }
    
    // 删除帖子
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    
    res.status(200).send({ message: '帖子删除成功' });
  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).send({ message: '删除帖子过程中出现服务器错误' });
  }
};