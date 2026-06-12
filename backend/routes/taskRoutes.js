// routes/taskRoutes.js
const router = require('express').Router();
const TaskController = require('../controllers/taskController');
const verifyToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.use(verifyToken); // every task route requires login

router.get('/', TaskController.list);
router.get('/subjects', TaskController.subjects);
router.get('/:id', TaskController.getOne);
router.post('/', validate(['title', 'subject', 'due_date']), TaskController.create);
router.put('/:id', validate(['title', 'subject', 'due_date']), TaskController.update);
router.patch('/:id/status', validate(['status']), TaskController.setStatus);
router.delete('/:id', TaskController.remove);

module.exports = router;
