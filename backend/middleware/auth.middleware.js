// auth.middleware.js
const jwt = require('jsonwebtoken');

// 验证JWT令牌
const verifyToken = (req, res, next) => {
  console.log('验证请求头:', req.method, req.url);
  console.log('Authorization标头:', req.headers['authorization']);
  
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    console.log('请求中未提供令牌');
    return res.status(403).send({
      message: '未提供令牌'
    });
  }
  
  console.log('收到令牌:', token.substring(0, 20) + '...');

  // 移除Bearer前缀（如果存在）
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
  
  try {
    // 检查JWT密钥是否存在
    if (!process.env.JWT_SECRET) {
      console.error('错误: JWT_SECRET环境变量未设置!');
      return res.status(500).send({
        message: '服务器配置错误'
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    console.log('令牌验证成功, 用户ID:', decoded.id);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('令牌验证失败:', error.message);
    return res.status(401).send({
      message: '未授权！令牌无效或已过期',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken
};