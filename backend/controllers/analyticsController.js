// controllers/analyticsController.js
const db = require('../config/db');
const PomodoroModel = require('../models/pomodoroModel');

const AnalyticsController = {
  /**
   * GET /api/analytics/dashboard
   * Everything the dashboard cards need in ONE request.
   */
  async dashboard(req, res, next) {
    try {
      const userId = req.user.id;

      const [[taskCounts]] = await db.query(
        `SELECT
           SUM(status = 'pending')   AS pending,
           SUM(status = 'completed') AS completed,
           COUNT(*)                  AS total
         FROM tasks WHERE user_id = ?`,
        [userId]
      );

      const [upcoming] = await db.query(
        `SELECT id, title, subject, priority, due_date
         FROM tasks
         WHERE user_id = ? AND status = 'pending' AND due_date >= NOW()
         ORDER BY due_date ASC LIMIT 5`,
        [userId]
      );

      const [[weekFocus]] = await db.query(
        `SELECT COALESCE(SUM(duration), 0) AS minutes
         FROM pomodoro_sessions
         WHERE user_id = ? AND session_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
        [userId]
      );

      const streak = await PomodoroModel.streak(userId);

      res.json({
        cards: {
          pendingTasks: Number(taskCounts.pending) || 0,
          completedTasks: Number(taskCounts.completed) || 0,
          focusHoursThisWeek: +(weekFocus.minutes / 60).toFixed(1),
          studyStreak: streak,
        },
        upcomingDeadlines: upcoming,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/analytics/productivity
   * Data for all Chart.js charts on Dashboard + Analytics pages.
   */
  async productivity(req, res, next) {
    try {
      const userId = req.user.id;

      // Weekly focus hours (last 7 days)
      const weeklyFocus = await PomodoroModel.weekly(userId);

      // Tasks completed per month (last 6 months)
      const [monthlyCompleted] = await db.query(
        `SELECT DATE_FORMAT(completed_at, '%Y-%m') AS month, COUNT(*) AS completed
         FROM tasks
         WHERE user_id = ? AND status = 'completed'
           AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month ORDER BY month`,
        [userId]
      );

      // Subject distribution (tasks per subject)
      const [subjectDistribution] = await db.query(
        `SELECT subject, COUNT(*) AS total,
                SUM(status = 'completed') AS completed
         FROM tasks WHERE user_id = ?
         GROUP BY subject ORDER BY total DESC`,
        [userId]
      );

      // Headline stats
      const [[stats]] = await db.query(
        `SELECT COUNT(*) AS total_tasks,
                ROUND(100 * SUM(status = 'completed') / NULLIF(COUNT(*), 0)) AS completion_rate
         FROM tasks WHERE user_id = ?`,
        [userId]
      );
      const totals = await PomodoroModel.totals(userId);
      const streak = await PomodoroModel.streak(userId);

      // Average focus hours per active day
      const [[avg]] = await db.query(
        `SELECT COALESCE(AVG(day_minutes), 0) AS avg_minutes FROM (
           SELECT SUM(duration) AS day_minutes
           FROM pomodoro_sessions WHERE user_id = ?
           GROUP BY session_date
         ) d`,
        [userId]
      );

      res.json({
        charts: { weeklyFocus, monthlyCompleted, subjectDistribution },
        stats: {
          totalTasks: stats.total_tasks,
          completionRate: Number(stats.completion_rate) || 0,
          avgFocusHours: +((avg.avg_minutes || 0) / 60).toFixed(1),
          studyStreak: streak,
          totalSessions: totals.total_sessions,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AnalyticsController;
