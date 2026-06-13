// server.js — StudyBuddy API entry point
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);

// ---------- Global middlewares ----------
// CLIENT_URL can be one origin or several (comma-separated) for production.
const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'StudyBuddy API', time: new Date().toISOString() });
});

// ---------- Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/pomodoro', require('./routes/pomodoroRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ---------- 404 + error handling (keep these LAST) ----------
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use(errorHandler);

// ---------- Socket.io (real-time group chat) ----------
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: allowedOrigins.includes('*') ? '*' : allowedOrigins },
});
require('./sockets/chatSocket')(io);

// ---------- Scheduled reminders (in-app + email) ----------
require('./utils/reminderJob')();

// ---------- Start ----------
const initDb = require('./config/initDb');
const PORT = process.env.PORT || 5000;

initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ StudyBuddy API running on port ${PORT}`);
  });
});
