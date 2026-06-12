// routes/authRoutes.js
const router = require('express').Router();
const AuthController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/auth');

router.post('/register', validate(['name', 'email', 'password']), AuthController.register);
router.post('/login', validate(['email', 'password']), AuthController.login);
router.get('/me', verifyToken, AuthController.me);
router.post('/forgot-password', validate(['email']), AuthController.forgotPassword);
router.post('/reset-password', validate(['token', 'newPassword']), AuthController.resetPassword);

module.exports = router;
