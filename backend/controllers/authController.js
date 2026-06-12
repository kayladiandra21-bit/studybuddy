// controllers/authController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const AuthController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { name, email, password, major, university } = req.body;

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({ name, email, passwordHash, major, university });
      const user = await UserModel.findById(userId);

      const token = generateToken(user);
      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password, rememberMe = false } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Same message for wrong email vs wrong password (don't leak which one)
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = generateToken(user, rememberMe);
      const safeUser = await UserModel.findById(user.id); // without password hash
      res.json({ token, user: safeUser });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me  (used by the frontend to restore a session)
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await UserModel.findByEmail(email);

      // Always respond the same way so attackers can't probe which emails exist
      const genericResponse = {
        message: 'If that email is registered, a reset link has been sent.',
      };

      if (!user) return res.json(genericResponse);

      // Raw token goes to the user; only its hash is stored in the DB
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await UserModel.saveResetToken(user.id, tokenHash, expiresAt);

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

      // Email sending is wired up in Step 4 (Nodemailer).
      // Until then we log the link so you can test the full flow locally.
      try {
        const { sendMail } = require('../config/mailer');
        await sendMail({
          to: user.email,
          subject: 'StudyBuddy - Reset your password',
          html: `<p>Hi ${user.name},</p>
                 <p>Click the link below to reset your password (valid for 1 hour):</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>`,
        });
      } catch (mailErr) {
        console.log('[DEV] Password reset link:', resetLink);
      }

      res.json(genericResponse);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/reset-password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const record = await UserModel.findValidResetToken(tokenHash);
      if (!record) {
        return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(record.user_id, passwordHash);
      await UserModel.markResetTokenUsed(record.id);

      res.json({ message: 'Password updated. You can now log in.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
