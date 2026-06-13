// config/initDb.js
// On startup, create tables if the `users` table is missing.
// Runs the entire schema.sql in a single multi-statement query (reliable),
// then seeds a little demo data so the hosted site isn't empty.
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDb() {
  try {
    const [tables] = await db.query(
      `SELECT COUNT(*) AS n FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = 'users'`
    );
    if (tables[0].n > 0) {
      console.log('Tables already exist — skipping schema creation.');
    } else {
      console.log('🔧 First run: creating tables…');
      let raw = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

      // Remove CREATE DATABASE / USE lines (hosted DB already exists).
      // Keep everything else intact and run it as ONE multi-statement query.
      const cleaned = raw
        .split('\n')
        .filter((line) => {
          const l = line.trim().toUpperCase();
          return !l.startsWith('CREATE DATABASE') && !l.startsWith('USE ');
        })
        .join('\n');

      await db.query(cleaned);
      console.log('✅ Tables created.');
    }

    try {
      await seedDemo();
    } catch (e) {
      console.log('seed skipped:', e.message);
    }
  } catch (err) {
    console.error('initDb error:', err.message);
  }
}

async function seedDemo() {
  const bcrypt = require('bcryptjs');
  const [exists] = await db.query(
    `SELECT id FROM users WHERE email = 'admin@studybuddy.test'`
  );
  if (exists.length > 0) {
    console.log('Demo data already present.');
    return;
  }

  console.log('🌱 Seeding demo data…');
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashStudent = await bcrypt.hash('password123', 10);

  await db.query(
    `INSERT INTO users (name, email, password, role) VALUES ('Admin StudyBuddy','admin@studybuddy.test',?,'admin')`,
    [hashAdmin]
  );
  const [budi] = await db.query(
    `INSERT INTO users (name, email, password, major, university) VALUES ('Budi Santoso','budi@student.test',?,'Informatics','Universitas Padjadjaran')`,
    [hashStudent]
  );
  const budiId = budi.insertId;

  await db.query(
    `INSERT INTO tasks (user_id, title, subject, priority, due_date, status, completed_at) VALUES
     (?, 'Web Dev assignment: REST API', 'Web Development', 'high', DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', NULL),
     (?, 'Read chapter 5 Normalization', 'Databases', 'medium', DATE_ADD(NOW(), INTERVAL 4 DAY), 'pending', NULL),
     (?, 'Quiz prep SQL joins', 'Databases', 'high', DATE_SUB(NOW(), INTERVAL 3 DAY), 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY))`,
    [budiId, budiId, budiId]
  );
  await db.query(
    `INSERT INTO events (user_id, title, category, event_date) VALUES
     (?, 'Midterm exam Databases', 'exam', DATE_ADD(NOW(), INTERVAL 5 DAY))`,
    [budiId]
  );
  for (let d = 5; d >= 0; d--) {
    await db.query(
      `INSERT INTO pomodoro_sessions (user_id, duration, session_date) VALUES (?, 25, DATE_SUB(CURDATE(), INTERVAL ? DAY))`,
      [budiId, d]
    );
  }
  console.log('✅ Demo data seeded (admin@studybuddy.test / admin123, budi@student.test / password123).');
}

module.exports = initDb;
