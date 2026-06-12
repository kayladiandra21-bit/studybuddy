// controllers/notificationController.js
const NotificationModel = require('../models/notificationModel');

const NotificationController = {
  // GET /api/notifications?unread=1
  async list(req, res, next) {
    try {
      const notifications = await NotificationModel.findByUser(req.user.id, {
        unreadOnly: req.query.unread === '1',
      });
      const unreadCount = await NotificationModel.unreadCount(req.user.id);
      res.json({ notifications, unreadCount });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/notifications/:id/read
  async markRead(req, res, next) {
    try {
      const ok = await NotificationModel.markRead(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Notification not found.' });
      res.json({ message: 'Marked as read.' });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/notifications/read-all
  async markAllRead(req, res, next) {
    try {
      await NotificationModel.markAllRead(req.user.id);
      res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = NotificationController;
