// models/eventModel.js
const db = require('../config/db');

const EventModel = {
  /** Events in a date range (FullCalendar sends ?start=&end=) */
  async findAll(userId, { start, end } = {}) {
    let sql = `SELECT * FROM events WHERE user_id = ?`;
    const params = [userId];
    if (start && end) {
      sql += ` AND event_date BETWEEN ? AND ?`;
      params.push(start, end);
    }
    sql += ` ORDER BY event_date ASC`;
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await db.query(`SELECT * FROM events WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
    return rows[0] || null;
  },

  async create(userId, { title, description, category, event_date, end_date, color }) {
    const [result] = await db.query(
      `INSERT INTO events (user_id, title, description, category, event_date, end_date, color)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, category, event_date, end_date || null, color || null]
    );
    return result.insertId;
  },

  async update(id, userId, { title, description, category, event_date, end_date, color }) {
    const [result] = await db.query(
      `UPDATE events
       SET title = ?, description = ?, category = ?, event_date = ?, end_date = ?, color = ?
       WHERE id = ? AND user_id = ?`,
      [title, description || null, category, event_date, end_date || null, color || null, id, userId]
    );
    return result.affectedRows > 0;
  },

  async remove(id, userId) {
    const [result] = await db.query(`DELETE FROM events WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = EventModel;
