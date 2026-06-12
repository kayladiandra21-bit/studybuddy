// controllers/profileController.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const UserModel = require('../models/userModel');

const ProfileController = {
  // GET /api/profile
  async get(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/profile   body: { name, major, university, dark_mode }
  async update(req, res, next) {
    try {
      const { name, major, university, dark_mode } = req.body;
      await db.query(
        `UPDATE users SET name = ?, major = ?, university = ?, dark_mode = ? WHERE id = ?`,
        [name, major || null, university || null, dark_mode ? 1 : 0, req.user.id]
      );
      res.json({ user: await UserModel.findById(req.user.id) });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/profile/password   body: { currentPassword, newPassword }
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }

      const [rows] = await db.query(`SELECT password FROM users WHERE id = ?`, [req.user.id]);
      const match = await bcrypt.compare(currentPassword || '', rows[0].password);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      const hash = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(req.user.id, hash);
      res.json({ message: 'Password changed.' });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/profile/picture  (multipart/form-data, field name: "image")
  async uploadPicture(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
      const imagePath = `/uploads/avatars/${req.file.filename}`;
      await db.query(`UPDATE users SET profile_image = ? WHERE id = ?`, [
        imagePath,
        req.user.id,
      ]);
      res.json({ profile_image: imagePath });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ProfileController;
