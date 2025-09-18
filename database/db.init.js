// db.init.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  try {
    // Database connection configuration
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',// Please modify according to actual situation
      multipleStatements: true // Allow multiple SQL statements
    };
    
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection(config);
    
    console.log('Reading SQL script...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Executing SQL script...');
    await connection.query(sqlScript);
    
    console.log('Database initialization successful!');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Execute initialization
initializeDatabase();