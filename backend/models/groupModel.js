// models/groupModel.js
const db = require('../config/db');

const GroupModel = {
  /** All groups, with member count and whether the current user has joined */
  async findAll(userId, { search, subject } = {}) {
    let sql = `
      SELECT g.*, u.name AS owner_name,
             (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count,
             EXISTS(SELECT 1 FROM group_members m
                    WHERE m.group_id = g.id AND m.user_id = ?) AS is_member
      FROM study_groups g
      JOIN users u ON u.id = g.created_by
      WHERE 1 = 1`;
    const params = [userId];

    if (search) {
      sql += ` AND (g.group_name LIKE ? OR g.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (subject) {
      sql += ` AND g.subject = ?`;
      params.push(subject);
    }
    sql += ` ORDER BY g.created_at DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT g.*, u.name AS owner_name
       FROM study_groups g JOIN users u ON u.id = g.created_by
       WHERE g.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(userId, { group_name, subject, description, schedule }) {
    const [result] = await db.query(
      `INSERT INTO study_groups (group_name, subject, description, schedule, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [group_name, subject, description || null, schedule || null, userId]
    );
    // Creator automatically becomes the first member
    await db.query(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`, [
      result.insertId,
      userId,
    ]);
    return result.insertId;
  },

  async update(id, { group_name, subject, description, schedule }) {
    const [result] = await db.query(
      `UPDATE study_groups SET group_name = ?, subject = ?, description = ?, schedule = ?
       WHERE id = ?`,
      [group_name, subject, description || null, schedule || null, id]
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await db.query(`DELETE FROM study_groups WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  // ---------- Membership ----------

  async isMember(groupId, userId) {
    const [rows] = await db.query(
      `SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    return rows.length > 0;
  },

  async join(groupId, userId) {
    await db.query(`INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)`, [
      groupId,
      userId,
    ]);
  },

  async leave(groupId, userId) {
    await db.query(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`, [
      groupId,
      userId,
    ]);
  },

  async members(groupId) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.major, u.university, u.profile_image, m.joined_at
       FROM group_members m JOIN users u ON u.id = m.user_id
       WHERE m.group_id = ? ORDER BY m.joined_at`,
      [groupId]
    );
    return rows;
  },

  // ---------- Announcements ----------

  async announcements(groupId) {
    const [rows] = await db.query(
      `SELECT a.*, u.name AS author_name
       FROM group_announcements a JOIN users u ON u.id = a.user_id
       WHERE a.group_id = ? ORDER BY a.created_at DESC`,
      [groupId]
    );
    return rows;
  },

  async addAnnouncement(groupId, userId, { title, content }) {
    const [result] = await db.query(
      `INSERT INTO group_announcements (group_id, user_id, title, content)
       VALUES (?, ?, ?, ?)`,
      [groupId, userId, title, content]
    );
    return result.insertId;
  },

  // ---------- Files ----------

  async files(groupId) {
    const [rows] = await db.query(
      `SELECT f.*, u.name AS uploader_name
       FROM group_files f JOIN users u ON u.id = f.user_id
       WHERE f.group_id = ? ORDER BY f.uploaded_at DESC`,
      [groupId]
    );
    return rows;
  },

  async addFile(groupId, userId, { file_name, file_path, file_size }) {
    const [result] = await db.query(
      `INSERT INTO group_files (group_id, user_id, file_name, file_path, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [groupId, userId, file_name, file_path, file_size]
    );
    return result.insertId;
  },
};

module.exports = GroupModel;
