// config/db.js
// Single shared MySQL connection pool for the whole app.
// Using mysql2/promise so every query can be awaited.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studybuddy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATETIME as strings (easier for the frontend)
});

module.exports = pool;
