// routes/groupRoutes.js
const router = require('express').Router();
const GroupController = require('../controllers/groupController');
const verifyToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { uploadGroupFile } = require('../utils/upload');

router.use(verifyToken);

router.get('/', GroupController.list);
router.post('/', validate(['group_name', 'subject']), GroupController.create);
router.get('/:id', GroupController.getOne);
router.put('/:id', validate(['group_name', 'subject']), GroupController.update);
router.delete('/:id', GroupController.remove);

router.post('/:id/join', GroupController.join);
router.delete('/:id/leave', GroupController.leave);

router.get('/:id/announcements', GroupController.announcements);
router.post('/:id/announcements', validate(['title', 'content']), GroupController.addAnnouncement);

router.get('/:id/files', GroupController.files);
router.post('/:id/files', uploadGroupFile.single('file'), GroupController.uploadFile);

router.get('/:id/messages', GroupController.messages);

module.exports = router;
