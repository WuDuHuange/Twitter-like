// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供上传文件的静态访问
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('欢迎使用Twitter克隆API');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口${PORT}`);
});

module.exports = app;