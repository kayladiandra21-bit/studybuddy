// routes/notificationRoutes.js
const router = require('express').Router();
const NotificationController = require('../controllers/notificationController');
const verifyToken = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', NotificationController.list);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

module.exports = router;
