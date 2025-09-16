// auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');
// 导入Web3
const { Web3 } = require('web3');
// 导入简化的认证处理
const SimpleAuthHandler = require('../utils/simpleAuth');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).send({ message: '用户名和密码为必填项' });
    }
    
    // 检查用户名是否已存在
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).send({ message: '用户名已存在' });
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).send({
      message: '用户注册成功',
      user: {
        id: result.insertId,
        username
      },
      accessToken: token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).send({ message: '注册过程中出现服务器错误' });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).send({ message: '用户名和密码为必填项' });
    }
    
    // 查找用户
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(404).send({ message: '用户不存在' });
    }
    
    const user = users[0];
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).send({ message: '密码无效' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).send({
      user: {
        id: user.id,
        username: user.username,
        walletAddress: user.wallet_address
      },
      accessToken: token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).send({ message: '登录过程中出现服务器错误' });
  }
};

// 获取Metamask登录消息
exports.getMetamaskMessage = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).send({ message: '钱包地址为必填项' });
    }
    
    // 创建一个随机消息让用户签名
    const message = SimpleAuthHandler.generateMessage(address);
    
    // 存储消息以便后续验证（在实际应用中，应存储在数据库或缓存中）
    // 这里简化处理，将消息作为JWT返回
    const token = jwt.sign(
      { address, message },
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // 短暂有效期
    );
    
    res.status(200).send({ message, token });
  } catch (error) {
    console.error('Metamask消息错误:', error);
    res.status(500).send({ message: '生成消息过程中出现服务器错误' });
  }
};

// 验证Metamask签名
exports.verifyMetamaskSignature = async (req, res) => {
  try {
    const { signature, token } = req.body;
    
    if (!signature || !token) {
      return res.status(400).send({ message: '签名和令牌为必填项' });
    }
    
    // 验证并解码临时令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send({ message: '令牌无效或已过期' });
    }
    
    const { address, message } = decoded;
    
    // 首先尝试使用Web3验证签名
    try {
      console.log('开始验证签名...');
      console.log('地址:', address);
      console.log('消息:', message);
      console.log('签名:', signature);
      
      let isSignatureValid = false;
      let recoveredAddress = null;
      
      try {
        // 尝试使用Web3.js
        const web3 = new Web3();
        recoveredAddress = web3.eth.accounts.recover(message, signature);
        console.log('恢复的地址 (web3方式):', recoveredAddress);
        isSignatureValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      } catch (web3Error) {
        console.error('Web3签名验证失败，切换到简化验证:', web3Error);
        
        // 使用简化的验证逻辑作为备选
        isSignatureValid = SimpleAuthHandler.verifySignature(message, signature, address);
        recoveredAddress = isSignatureValid ? address : null;
      }
      
      // 如果验证失败
      if (!isSignatureValid) {
        return res.status(401).send({ message: '签名验证失败' });
      }
      
      // 验证通过，继续处理
      console.log('签名验证通过');
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).send({ message: '签名验证失败' });
      }
    } catch (error) {
      console.error('验证签名出错:', error);
      return res.status(500).send({ message: '验证签名过程中出现技术错误' });
    }
    
    // 检查用户是否存在
    const [users] = await db.query(
      'SELECT * FROM users WHERE wallet_address = ?',
      [address]
    );
    
    let user;
    
    if (users.length === 0) {
      // 创建新用户
      const username = `user_${address.substring(2, 8)}`;
      const [result] = await db.query(
        'INSERT INTO users (username, wallet_address) VALUES (?, ?)',
        [username, address]
      );
      
      user = {
        id: result.insertId,
        username,
        walletAddress: address
      };
    } else {
      user = {
        id: users[0].id,
        username: users[0].username,
        walletAddress: users[0].wallet_address
      };
    }
    
    // 生成JWT令牌
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).send({
      user,
      accessToken
    });
  } catch (error) {
    console.error('Metamask验证错误:', error);
    console.error('错误堆栈:', error.stack);
    
    // 尝试获取更多错误信息
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
    
    console.log('详细错误信息:', JSON.stringify(errorDetails, null, 2));
    
    res.status(500).send({ 
      message: '验证签名过程中出现服务器错误',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
};