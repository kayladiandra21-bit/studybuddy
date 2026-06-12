// models/messageModel.js
const db = require('../config/db');

const MessageModel = {
  /** Chat history, oldest first (with simple pagination) */
  async findByGroup(groupId, { limit = 50, before = null } = {}) {
    let sql = `
      SELECT m.*, u.name AS sender_name, u.profile_image AS sender_image
      FROM messages m JOIN users u ON u.id = m.user_id
      WHERE m.group_id = ?`;
    const params = [groupId];

    if (before) {
      sql += ` AND m.id < ?`;
      params.push(before);
    }
    sql += ` ORDER BY m.id DESC LIMIT ?`;
    params.push(Number(limit));

    const [rows] = await db.query(sql, params);
    return rows.reverse(); // oldest → newest for the chat window
  },

  async create(groupId, userId, content) {
    const [result] = await db.query(
      `INSERT INTO messages (group_id, user_id, content) VALUES (?, ?, ?)`,
      [groupId, userId, content]
    );
    const [rows] = await db.query(
      `SELECT m.*, u.name AS sender_name, u.profile_image AS sender_image
       FROM messages m JOIN users u ON u.id = m.user_id WHERE m.id = ?`,
      [result.insertId]
    );
    return rows[0];
  },
};

module.exports = MessageModel;
