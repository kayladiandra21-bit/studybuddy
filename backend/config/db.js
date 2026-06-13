// config/db.js
// MySQL connection pool. Works two ways:
//  - Locally: separate DB_HOST/DB_USER/DB_PASSWORD/DB_NAME from .env
//  - On Railway: a single MYSQL_URL connection string (set automatically)
// multipleStatements: true lets initDb run the whole schema.sql in one go.
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = process.env.MYSQL_URL
  ? mysql.createPool(process.env.MYSQL_URL + '?multipleStatements=true&dateStrings=true')
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studybuddy',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      multipleStatements: true,
    });

module.exports = pool;
