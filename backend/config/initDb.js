// config/initDb.js
// On startup, create tables if the `users` table is missing.
// Lets the app set itself up on a fresh hosted database (Railway).
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDb() {
  try {
    const [tables] = await db.query(
      `SELECT COUNT(*) AS n FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'users'`
    );
    if (tables[0].n > 0) return; // already set up

    console.log('🔧 First run: creating tables…');
    let sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

    // Hosted DB already exists — drop CREATE/USE DATABASE lines
    sql = sql
      .split('\n')
      .filter((line) => {
        const l = line.trim().toUpperCase();
        return !l.startsWith('CREATE DATABASE') && !l.startsWith('USE ');
      })
      .join('\n');

    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      await db.query(stmt);
    }
    console.log('✅ Tables created.');
  } catch (err) {
    console.error('initDb error:', err.message);
  }
}

module.exports = initDb;
