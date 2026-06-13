// config/initDb.js
// Creates all tables directly in code (one CREATE per query) — no file parsing,
// no multi-statement tricks. This is the most robust approach for hosted DBs.
// Then seeds a little demo data so the live site isn't empty.
const db = require('./db');

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','admin') NOT NULL DEFAULT 'student',
    major VARCHAR(100) DEFAULT NULL,
    university VARCHAR(150) DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    dark_mode TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS password_resets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pr_token (token_hash)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    subject VARCHAR(100) NOT NULL,
    priority ENUM('high','medium','low') NOT NULL DEFAULT 'medium',
    due_date DATETIME NOT NULL,
    status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
    completed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user_due (user_id, due_date),
    INDEX idx_task_user_status (user_id, status),
    INDEX idx_task_subject (user_id, subject)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    category ENUM('assignment','exam','meeting','group_study') NOT NULL,
    event_date DATETIME NOT NULL,
    end_date DATETIME DEFAULT NULL,
    color VARCHAR(7) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_user_date (user_id, event_date)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    duration SMALLINT UNSIGNED NOT NULL,
    session_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pomo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pomo_user_date (user_id, session_date)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS study_groups (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(120) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    schedule VARCHAR(255) DEFAULT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_owner FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_group_subject (subject)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS group_members (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_member (group_id, user_id)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_group FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_msg_group_time (group_id, created_at)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS group_announcements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ann_group FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_ann_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ann_group (group_id, created_at)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS group_files (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_group FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_file_group (group_id)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type ENUM('deadline','exam','meeting','task','system') NOT NULL DEFAULT 'system',
    message VARCHAR(255) NOT NULL,
    link VARCHAR(255) DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read, created_at)
  ) ENGINE=InnoDB`,
];

async function initDb() {
  try {
    for (const sql of TABLES) {
      await db.query(sql);
    }
    console.log('✅ Tables ready.');
    await seedDemo();
  } catch (err) {
    console.error('initDb error:', err.message);
  }
}

async function seedDemo() {
  const bcrypt = require('bcryptjs');
  const [exists] = await db.query(`SELECT id FROM users WHERE email = 'admin@studybuddy.test'`);
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
    `INSERT INTO events (user_id, title, category, event_date) VALUES (?, 'Midterm exam Databases', 'exam', DATE_ADD(NOW(), INTERVAL 5 DAY))`,
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
