// models/userModel.js
// All SQL touching the `users` and `password_resets` tables lives here.
// Controllers never write SQL directly.

const db = require('../config/db');

const UserModel = {
  async create({ name, email, passwordHash, major = null, university = null }) {
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, major, university)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, passwordHash, major, university]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, major, university, profile_image, dark_mode, created_at
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updatePassword(userId, passwordHash) {
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [passwordHash, userId]);
  },

  // ---------- Password reset tokens ----------

  async saveResetToken(userId, tokenHash, expiresAt) {
    await db.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidResetToken(tokenHash) {
    const [rows] = await db.query(
      `SELECT * FROM password_resets
       WHERE token_hash = ? AND used = 0 AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async markResetTokenUsed(id) {
    await db.query(`UPDATE password_resets SET used = 1 WHERE id = ?`, [id]);
  },
};

module.exports = UserModel;
