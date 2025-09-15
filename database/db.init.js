// db.init.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  try {
    // 数据库连接配置
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      multipleStatements: true // 允许多条SQL语句
    };
    
    console.log('正在连接到MySQL服务器...');
    const connection = await mysql.createConnection(config);
    
    console.log('正在读取SQL脚本...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('正在执行SQL脚本...');
    await connection.query(sqlScript);
    
    console.log('数据库初始化成功！');
    await connection.end();
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 执行初始化
initializeDatabase();