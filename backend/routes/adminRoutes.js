// routes/adminRoutes.js
const router = require('express').Router();
const AdminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');

router.use(verifyToken, requireRole('admin')); // admin only

router.get('/stats', AdminController.stats);
router.get('/users', AdminController.users);
router.delete('/users/:id', AdminController.deleteUser);

module.exports = router;
