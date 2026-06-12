// routes/analyticsRoutes.js
const router = require('express').Router();
const AnalyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middlewares/auth');

router.use(verifyToken);

router.get('/dashboard', AnalyticsController.dashboard);
router.get('/productivity', AnalyticsController.productivity);

module.exports = router;
