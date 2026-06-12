// routes/eventRoutes.js
const router = require('express').Router();
const EventController = require('../controllers/eventController');
const verifyToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');

router.use(verifyToken);

router.get('/', EventController.list); // merged events + tasks calendar feed
router.post('/', validate(['title', 'category', 'event_date']), EventController.create);
router.put('/:id', validate(['title', 'category', 'event_date']), EventController.update);
router.delete('/:id', EventController.remove);

module.exports = router;
