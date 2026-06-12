// utils/reminderJob.js
// Scheduled reminders (node-cron). Runs every hour, and:
//   1. Deadline reminder        → pending tasks due in the next 24h
//   2. Upcoming exam reminder   → 'exam' events in the next 24h
//   3. Group meeting reminder   → 'meeting'/'group_study' events in the next 24h
//   4. Incomplete task reminder → overdue tasks still pending (sent once/day at 18:00)
//
// Each reminder is created as an in-app notification, and also emailed
// when SMTP is configured. existsSimilarToday() prevents duplicates.

const cron = require('node-cron');
const db = require('../config/db');
const NotificationModel = require('../models/notificationModel');
const { sendMail } = require('../config/mailer');

async function notify(user, { type, message, link, emailSubject }) {
  const dup = await NotificationModel.existsSimilarToday(user.id, message);
  if (dup) return;

  await NotificationModel.create(user.id, { type, message, link });

  await sendMail({
    to: user.email,
    subject: emailSubject,
    html: `<p>Hi ${user.name},</p><p>${message}</p>
           <p>— StudyBuddy</p>`,
  }).catch((e) => console.error('[mail]', e.message));
}

async function deadlineReminders() {
  const [rows] = await db.query(
    `SELECT t.id, t.title, t.due_date, u.id AS user_id, u.name, u.email
     FROM tasks t JOIN users u ON u.id = t.user_id
     WHERE t.status = 'pending'
       AND t.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`
  );
  for (const r of rows) {
    await notify(
      { id: r.user_id, name: r.name, email: r.email },
      {
        type: 'deadline',
        message: `Deadline soon: "${r.title}" is due within 24 hours.`,
        link: '/tasks',
        emailSubject: 'StudyBuddy — Deadline reminder',
      }
    );
  }
}

async function eventReminders() {
  const [rows] = await db.query(
    `SELECT e.id, e.title, e.category, e.event_date, u.id AS user_id, u.name, u.email
     FROM events e JOIN users u ON u.id = e.user_id
     WHERE e.category IN ('exam', 'meeting', 'group_study')
       AND e.event_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`
  );
  for (const r of rows) {
    const isExam = r.category === 'exam';
    await notify(
      { id: r.user_id, name: r.name, email: r.email },
      {
        type: isExam ? 'exam' : 'meeting',
        message: isExam
          ? `Upcoming exam: "${r.title}" is within 24 hours. Good luck!`
          : `Reminder: "${r.title}" is scheduled within 24 hours.`,
        link: '/calendar',
        emailSubject: isExam
          ? 'StudyBuddy — Upcoming exam'
          : 'StudyBuddy — Upcoming meeting',
      }
    );
  }
}

async function incompleteTaskReminders() {
  const [rows] = await db.query(
    `SELECT u.id AS user_id, u.name, u.email, COUNT(*) AS overdue
     FROM tasks t JOIN users u ON u.id = t.user_id
     WHERE t.status = 'pending' AND t.due_date < NOW()
     GROUP BY u.id, u.name, u.email`
  );
  for (const r of rows) {
    await notify(
      { id: r.user_id, name: r.name, email: r.email },
      {
        type: 'task',
        message: `You have ${r.overdue} overdue task(s). A little progress today helps!`,
        link: '/tasks',
        emailSubject: 'StudyBuddy — Incomplete tasks',
      }
    );
  }
}

function startReminderJob() {
  // Every hour at minute 0 → deadline + event reminders
  cron.schedule('0 * * * *', async () => {
    try {
      await deadlineReminders();
      await eventReminders();
    } catch (err) {
      console.error('[reminders]', err.message);
    }
  });

  // Once a day at 18:00 → overdue task nudge
  cron.schedule('0 18 * * *', async () => {
    try {
      await incompleteTaskReminders();
    } catch (err) {
      console.error('[reminders]', err.message);
    }
  });

  console.log('⏰ Reminder job scheduled (hourly + daily 18:00)');
}

module.exports = startReminderJob;
