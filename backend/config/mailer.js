// config/mailer.js
// Nodemailer transport. Email is OPTIONAL: if SMTP isn't configured in .env,
// the app keeps working — reminders just stay in-app only.

const nodemailer = require('nodemailer');

let transporter = null;

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an email. Silently no-ops (with a console note) if SMTP isn't set up,
 * so missing email config never crashes a feature.
 */
async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[MAIL skipped — SMTP not configured] To: ${to} | ${subject}`);
    return false;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
  return true;
}

module.exports = { sendMail, isConfigured };
