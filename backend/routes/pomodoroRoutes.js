// routes/pomodoroRoutes.js
const router = require('express').Router();
const PomodoroController = require('../controllers/pomodoroController');
const verifyToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.use(verifyToken);

router.post('/sessions', validate(['duration']), PomodoroController.logSession);
router.get('/stats', PomodoroController.stats);

module.exports = router;
