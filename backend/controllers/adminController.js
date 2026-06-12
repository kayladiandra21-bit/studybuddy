// controllers/adminController.js
// Every route using this controller is protected by requireRole('admin').
const db = require('../config/db');

const AdminController = {
  // GET /api/admin/stats — platform-wide overview
  async stats(req, res, next) {
    try {
      const [[users]] = await db.query(
        `SELECT COUNT(*) AS total,
                SUM(role = 'student') AS students,
                SUM(role = 'admin')   AS admins
         FROM users`
      );

      // "Active" = logged a pomodoro session OR created/completed a task in the last 7 days
      const [[active]] = await db.query(
        `SELECT COUNT(DISTINCT user_id) AS active FROM (
           SELECT user_id FROM pomodoro_sessions
             WHERE session_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
           UNION
           SELECT user_id FROM tasks
             WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         ) a`
      );

      const [[groups]] = await db.query(`SELECT COUNT(*) AS total FROM study_groups`);

      const [[tasks]] = await db.query(
        `SELECT COUNT(*) AS total,
                SUM(status = 'completed') AS completed,
                ROUND(100 * SUM(status = 'completed') / NULLIF(COUNT(*), 0)) AS completion_rate
         FROM tasks`
      );

      const [[focus]] = await db.query(
        `SELECT COALESCE(SUM(duration), 0) AS total_minutes FROM pomodoro_sessions`
      );

      // Signups per month for the admin chart (last 6 months)
      const [signups] = await db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS users
         FROM users
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month ORDER BY month`
      );

      res.json({
        users: { ...users, active: active.active },
        groups: groups.total,
        tasks,
        totalFocusHours: +(focus.total_minutes / 60).toFixed(1),
        signupsPerMonth: signups,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/users?search=&page=&limit=
  async users(req, res, next) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Number(req.query.limit) || 10);
      const offset = (page - 1) * limit;
      const search = req.query.search ? `%${req.query.search}%` : null;

      let where = '';
      const params = [];
      if (search) {
        where = `WHERE name LIKE ? OR email LIKE ?`;
        params.push(search, search);
      }

      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) AS total FROM users ${where}`,
        params
      );
      const [users] = await db.query(
        `SELECT id, name, email, role, major, university, created_at
         FROM users ${where}
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/users/:id
  // ON DELETE CASCADE in the schema cleans up all the user's data.
  async deleteUser(req, res, next) {
    try {
      const targetId = Number(req.params.id);
      if (targetId === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own account.' });
      }
      const [result] = await db.query(`DELETE FROM users WHERE id = ?`, [targetId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({ message: 'User deleted.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AdminController;
