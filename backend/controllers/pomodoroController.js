// controllers/pomodoroController.js
const PomodoroModel = require('../models/pomodoroModel');

// Achievement thresholds (sessions per day)
const ACHIEVEMENTS = [
  { tier: 'gold', threshold: 20 },
  { tier: 'silver', threshold: 10 },
  { tier: 'bronze', threshold: 5 },
];

function achievementFor(sessionsToday) {
  const hit = ACHIEVEMENTS.find((a) => sessionsToday >= a.threshold);
  return hit ? hit.tier : null;
}

const PomodoroController = {
  // POST /api/pomodoro/sessions   body: { duration } (focus minutes completed)
  async logSession(req, res, next) {
    try {
      const duration = Number(req.body.duration);
      if (!duration || duration < 1 || duration > 240) {
        return res.status(400).json({ message: 'Duration must be between 1 and 240 minutes.' });
      }
      await PomodoroModel.create(req.user.id, duration);

      const today = await PomodoroModel.today(req.user.id);
      res.status(201).json({
        message: 'Session logged.',
        today,
        achievement: achievementFor(today.sessions),
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/pomodoro/stats
  async stats(req, res, next) {
    try {
      const [today, weekly, totals, streak] = await Promise.all([
        PomodoroModel.today(req.user.id),
        PomodoroModel.weekly(req.user.id),
        PomodoroModel.totals(req.user.id),
        PomodoroModel.streak(req.user.id),
      ]);

      res.json({
        today: {
          ...today,
          hours: +(today.minutes / 60).toFixed(1),
          achievement: achievementFor(today.sessions),
        },
        weekly, // [{ session_date, minutes, sessions }]
        totals: {
          ...totals,
          total_hours: +(totals.total_minutes / 60).toFixed(1),
        },
        streak,
        achievements: ACHIEVEMENTS,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PomodoroController;
