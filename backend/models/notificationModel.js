// models/notificationModel.js
const db = require('../config/db');

const NotificationModel = {
  async findByUser(userId, { unreadOnly = false } = {}) {
    let sql = `SELECT * FROM notifications WHERE user_id = ?`;
    if (unreadOnly) sql += ` AND is_read = 0`;
    sql += ` ORDER BY created_at DESC LIMIT 100`;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  },

  async unreadCount(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    return rows[0].count;
  },

  async create(userId, { type = 'system', message, link = null }) {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)`,
      [userId, type, message, link]
    );
    return result.insertId;
  },

  async markRead(id, userId) {
    const [result] = await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async markAllRead(userId) {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
  },

  /** Used by the reminder cron to avoid sending the same reminder twice */
  async existsSimilarToday(userId, message) {
    const [rows] = await db.query(
      `SELECT 1 FROM notifications
       WHERE user_id = ? AND message = ? AND DATE(created_at) = CURDATE()`,
      [userId, message]
    );
    return rows.length > 0;
  },
};

module.exports = NotificationModel;
