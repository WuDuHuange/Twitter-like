// user.controller.js
const db = require('../config/db.config');
const fs = require('fs');
const path = require('path');

// 获取用户信息
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 获取用户信息，但不包括密码
    const [users] = await db.query(
      'SELECT id, username, wallet_address, created_at, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '找不到用户' });
    }
    
    // 处理头像路径
    if (users[0].avatar) {
      users[0].avatar = `http://localhost:3000${users[0].avatar}`;
    }
    
    res.status(200).send(users[0]);
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).send({ message: '获取用户过程中出现服务器错误' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // 从JWT中提取
    
    // 获取用户信息，但不包括密码
    const [users] = await db.query(
      'SELECT id, username, wallet_address, created_at, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '找不到用户' });
    }
    
    // 处理头像路径
    if (users[0].avatar) {
      users[0].avatar = `http://localhost:3000${users[0].avatar}`;
    }
    
    res.status(200).send(users[0]);
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).send({ message: '获取用户过程中出现服务器错误' });
  }
};

// 获取用户的帖子
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取用户帖子总数
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM posts WHERE user_id = ?',
      [userId]
    );
    const totalPosts = countResult[0].total;
    
    // 获取分页的用户帖子
    const [posts] = await db.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
    
    res.status(200).send({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts
    });
  } catch (error) {
    console.error('获取用户帖子错误:', error);
    res.status(500).send({ message: '获取用户帖子过程中出现服务器错误' });
  }
};

// 更新用户个人资料
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 验证操作者是否是资料所有者
    if (req.userId != userId) {
      return res.status(403).send({ message: '您没有权限修改此用户的资料' });
    }
    
    // 检查用户是否存在
    const [users] = await db.query(
      'SELECT id, username, wallet_address, avatar FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '用户不存在' });
    }
    
    const user = users[0];
    let updateFields = [];
    let queryParams = [];
    let updatedData = {};
    
    // 处理用户名更新
    if (req.body.username && user.username !== req.body.username) {
      // 如果是MetaMask用户，不允许更改用户名
      if (user.wallet_address && user.wallet_address.length > 0) {
        return res.status(403).send({ message: 'MetaMask账户不能修改用户名' });
      }
      
      // 验证用户名是否已存在
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [req.body.username, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).send({ message: '用户名已被使用' });
      }
      
      updateFields.push('username = ?');
      queryParams.push(req.body.username);
      updatedData.username = req.body.username;
    }
    
    // 处理头像上传
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // 如果用户之前有头像，删除旧文件
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      updateFields.push('avatar = ?');
      queryParams.push(avatarUrl);
      
      // 保存数据库路径，但返回完整URL
      updatedData.avatar = `http://localhost:3000${avatarUrl}`;
    }
    
    // 如果没有要更新的字段
    if (updateFields.length === 0) {
      return res.status(400).send({ message: '没有提供任何要更新的信息' });
    }
    
    // 更新用户信息
    queryParams.push(userId);
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );
    
    // 返回更新后的用户数据
    res.status(200).send({
      id: userId,
      ...updatedData
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).send({ message: '更新用户资料过程中出现服务器错误' });
  }
};