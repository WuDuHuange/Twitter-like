// db.config.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456', // 请根据实际情况修改
  database: process.env.DB_NAME || 'twitter_clone',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 将连接池导出为promise包装器
const promisePool = pool.promise();

module.exports = promisePool;