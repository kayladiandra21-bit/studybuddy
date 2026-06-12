// seed.js — fills the database with realistic demo data.
// Run once:  npm run seed
// Demo accounts:
//   admin@studybuddy.test  / admin123   (admin)
//   budi@student.test      / password123
//   sari@student.test      / password123

const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  // Abort if demo data already exists (so it never duplicates)
  const [existing] = await db.query(
    `SELECT id FROM users WHERE email = 'admin@studybuddy.test'`
  );
  if (existing.length > 0) {
    console.log('⚠️  Demo data already exists — nothing to do.');
    process.exit(0);
  }

  console.log('🌱 Seeding demo data…');
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashStudent = await bcrypt.hash('password123', 10);

  // ---------- Users ----------
  const [admin] = await db.query(
    `INSERT INTO users (name, email, password, role, major, university)
     VALUES ('Admin StudyBuddy', 'admin@studybuddy.test', ?, 'admin', NULL, NULL)`,
    [hashAdmin]
  );
  const [budi] = await db.query(
    `INSERT INTO users (name, email, password, major, university)
     VALUES ('Budi Santoso', 'budi@student.test', ?, 'Informatics', 'Universitas Padjadjaran')`,
    [hashStudent]
  );
  const [sari] = await db.query(
    `INSERT INTO users (name, email, password, major, university)
     VALUES ('Sari Putri', 'sari@student.test', ?, 'Information Systems', 'ITB')`,
    [hashStudent]
  );
  const budiId = budi.insertId;
  const sariId = sari.insertId;

  // ---------- Tasks (mix of completed, pending, overdue, upcoming) ----------
  await db.query(
    `INSERT INTO tasks (user_id, title, description, subject, priority, due_date, status, completed_at) VALUES
     (?, 'Web Dev assignment: REST API', 'Build CRUD endpoints with Express', 'Web Development', 'high',
        DATE_ADD(NOW(), INTERVAL 2 DAY), 'pending', NULL),
     (?, 'Read chapter 5 — Normalization', 'Up to 3NF', 'Databases', 'medium',
        DATE_ADD(NOW(), INTERVAL 4 DAY), 'pending', NULL),
     (?, 'Calculus problem set 3', 'Integrals 1–20', 'Calculus', 'low',
        DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending', NULL),
     (?, 'Prepare UX wireframes', 'Figma mockups for mini project', 'UI/UX Design', 'medium',
        DATE_SUB(NOW(), INTERVAL 1 DAY), 'pending', NULL),
     (?, 'Quiz prep: SQL joins', 'Practice INNER/LEFT/RIGHT joins', 'Databases', 'high',
        DATE_SUB(NOW(), INTERVAL 3 DAY), 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
     (?, 'Setup Git repository', 'Push starter project', 'Web Development', 'medium',
        DATE_SUB(NOW(), INTERVAL 10 DAY), 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
     (?, 'Essay draft: Tech ethics', '800 words minimum', 'Ethics', 'low',
        DATE_SUB(NOW(), INTERVAL 35 DAY), 'completed', DATE_SUB(NOW(), INTERVAL 34 DAY))`,
    [budiId, budiId, budiId, budiId, budiId, budiId, budiId]
  );

  // ---------- Events ----------
  await db.query(
    `INSERT INTO events (user_id, title, description, category, event_date, end_date) VALUES
     (?, 'Midterm exam — Databases', 'Room B204, closed book', 'exam',
        DATE_ADD(NOW(), INTERVAL 5 DAY), NULL),
     (?, 'Project meeting with team', 'Discuss API contract', 'meeting',
        DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY)),
     (?, 'Group study: Web Dev', 'Library, 2nd floor', 'group_study',
        DATE_ADD(NOW(), INTERVAL 3 DAY), NULL),
     (?, 'Submit assignment draft', 'Upload to LMS before midnight', 'assignment',
        DATE_ADD(NOW(), INTERVAL 6 DAY), NULL)`,
    [budiId, budiId, budiId, budiId]
  );

  // ---------- Pomodoro sessions (a believable 2-week history) ----------
  const sessions = [];
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    // skip a couple of days so the data looks human
    if (daysAgo === 9 || daysAgo === 4) continue;
    const count = 1 + ((daysAgo * 7) % 4); // 1–4 sessions per day
    for (let i = 0; i < count; i++) {
      sessions.push(
        db.query(
          `INSERT INTO pomodoro_sessions (user_id, duration, session_date)
           VALUES (?, 25, DATE_SUB(CURDATE(), INTERVAL ? DAY))`,
          [budiId, daysAgo]
        )
      );
    }
  }
  await Promise.all(sessions);

  // ---------- Study group + members ----------
  const [group] = await db.query(
    `INSERT INTO study_groups (group_name, subject, description, schedule, created_by)
     VALUES ('Web Dev Warriors', 'Web Development',
             'Weekly study group for the web development course. All levels welcome!',
             'Tue & Thu, 19:00', ?)`,
    [budiId]
  );
  const groupId = group.insertId;
  await db.query(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?), (?, ?)`, [
    groupId, budiId, groupId, sariId,
  ]);

  // ---------- Chat history ----------
  await db.query(
    `INSERT INTO messages (group_id, user_id, content, created_at) VALUES
     (?, ?, 'Halo semua! Siap buat midterm minggu depan? 😄', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
     (?, ?, 'Halo Budi! Aku masih bingung bagian JOIN sih 😅', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
     (?, ?, 'Tenang, Kamis kita bahas bareng. Aku share latihan soalnya ya', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
     (?, ?, 'Mantap, makasih! 🙌', DATE_SUB(NOW(), INTERVAL 45 MINUTE))`,
    [groupId, budiId, groupId, sariId, groupId, budiId, groupId, sariId]
  );

  // ---------- Announcement ----------
  await db.query(
    `INSERT INTO group_announcements (group_id, user_id, title, content) VALUES
     (?, ?, 'Study session moved to Thursday',
      'This week we meet Thursday 19:00 at the library (2nd floor). Bring your JOIN practice questions!')`,
    [groupId, budiId]
  );

  // ---------- Notifications ----------
  await db.query(
    `INSERT INTO notifications (user_id, type, message, link, is_read) VALUES
     (?, 'deadline', 'Deadline soon: "Web Dev assignment: REST API" is due within 48 hours.', '/tasks', 0),
     (?, 'exam', 'Upcoming exam: "Midterm exam — Databases" in 5 days. Good luck!', '/calendar', 0),
     (?, 'meeting', 'Reminder: "Project meeting with team" is tomorrow.', '/calendar', 1)`,
    [budiId, budiId, budiId]
  );

  console.log('✅ Done! Demo accounts:');
  console.log('   admin@studybuddy.test / admin123   (admin)');
  console.log('   budi@student.test     / password123 (has tasks, groups, stats)');
  console.log('   sari@student.test     / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
