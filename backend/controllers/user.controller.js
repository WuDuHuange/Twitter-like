// user.controller.js
const db = require('../config/db.config');

// 获取用户信息
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 获取用户信息，但不包括密码
    const [users] = await db.query(
      'SELECT id, username, wallet_address, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '找不到用户' });
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
      'SELECT id, username, wallet_address, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '找不到用户' });
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