// routes/profileRoutes.js
const router = require('express').Router();
const ProfileController = require('../controllers/profileController');
const verifyToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { uploadAvatar } = require('../utils/upload');

router.use(verifyToken);

router.get('/', ProfileController.get);
router.put('/', validate(['name']), ProfileController.update);
router.put('/password', validate(['currentPassword', 'newPassword']), ProfileController.changePassword);
router.post('/picture', uploadAvatar.single('image'), ProfileController.uploadPicture);

module.exports = router;
