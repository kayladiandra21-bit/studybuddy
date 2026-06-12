// models/pomodoroModel.js
const db = require('../config/db');

const PomodoroModel = {
  async create(userId, duration) {
    const [result] = await db.query(
      `INSERT INTO pomodoro_sessions (user_id, duration, session_date)
       VALUES (?, ?, CURDATE())`,
      [userId, duration]
    );
    return result.insertId;
  },

  /** Today's totals — also powers Bronze/Silver/Gold achievements */
  async today(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS sessions, COALESCE(SUM(duration), 0) AS minutes
       FROM pomodoro_sessions
       WHERE user_id = ? AND session_date = CURDATE()`,
      [userId]
    );
    return rows[0];
  },

  /** Minutes per day for the last 7 days (weekly chart) */
  async weekly(userId) {
    const [rows] = await db.query(
      `SELECT session_date, SUM(duration) AS minutes, COUNT(*) AS sessions
       FROM pomodoro_sessions
       WHERE user_id = ? AND session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY session_date
       ORDER BY session_date`,
      [userId]
    );
    return rows;
  },

  async totals(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total_sessions, COALESCE(SUM(duration), 0) AS total_minutes
       FROM pomodoro_sessions WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  },

  /**
   * Study streak: consecutive days (ending today or yesterday)
   * with at least one completed session. Computed, never stored.
   */
  async streak(userId) {
    const [rows] = await db.query(
      `SELECT DISTINCT session_date FROM pomodoro_sessions
       WHERE user_id = ? ORDER BY session_date DESC LIMIT 365`,
      [userId]
    );
    if (rows.length === 0) return 0;

    const days = rows.map((r) => new Date(r.session_date).setHours(0, 0, 0, 0));
    const today = new Date().setHours(0, 0, 0, 0);
    const oneDay = 24 * 60 * 60 * 1000;

    // Streak is alive if the latest session was today or yesterday
    if (today - days[0] > oneDay) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i - 1] - days[i] === oneDay) streak++;
      else break;
    }
    return streak;
  },
};

module.exports = PomodoroModel;
