// models/taskModel.js
const db = require('../config/db');

// Whitelist of sortable columns — prevents SQL injection via ?sort=
const SORTABLE = { due_date: 'due_date', priority: 'priority', created_at: 'created_at' };

const TaskModel = {
  /**
   * List a user's tasks with optional search, filters and sorting.
   * filters = { search, priority, subject, status, sort }
   */
  async findAll(userId, filters = {}) {
    let sql = `SELECT * FROM tasks WHERE user_id = ?`;
    const params = [userId];

    if (filters.search) {
      sql += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.priority) {
      sql += ` AND priority = ?`;
      params.push(filters.priority);
    }
    if (filters.subject) {
      sql += ` AND subject = ?`;
      params.push(filters.subject);
    }
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    const sortCol = SORTABLE[filters.sort] || 'due_date';
    sql += ` ORDER BY ${sortCol} ASC`;

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await db.query(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
    return rows[0] || null;
  },

  async create(userId, { title, description, subject, priority, due_date }) {
    const [result] = await db.query(
      `INSERT INTO tasks (user_id, title, description, subject, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, subject, priority || 'medium', due_date]
    );
    return result.insertId;
  },

  async update(id, userId, { title, description, subject, priority, due_date }) {
    const [result] = await db.query(
      `UPDATE tasks
       SET title = ?, description = ?, subject = ?, priority = ?, due_date = ?
       WHERE id = ? AND user_id = ?`,
      [title, description || null, subject, priority, due_date, id, userId]
    );
    return result.affectedRows > 0;
  },

  async setStatus(id, userId, status) {
    const completedAt = status === 'completed' ? new Date() : null;
    const [result] = await db.query(
      `UPDATE tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
      [status, completedAt, id, userId]
    );
    return result.affectedRows > 0;
  },

  async remove(id, userId) {
    const [result] = await db.query(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
    return result.affectedRows > 0;
  },

  /** Distinct subjects for the filter dropdown */
  async subjects(userId) {
    const [rows] = await db.query(
      `SELECT DISTINCT subject FROM tasks WHERE user_id = ? ORDER BY subject`,
      [userId]
    );
    return rows.map((r) => r.subject);
  },
};

module.exports = TaskModel;
