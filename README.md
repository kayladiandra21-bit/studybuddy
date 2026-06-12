# 📚 StudyBuddy — Smart Academic Planner

A full-stack productivity platform that helps university students organize assignments, deadlines, focus sessions, and collaborate with classmates in real time.

> Built for a Web Development course — a dynamic web application with a database, user accounts, real-time features, and role-based access control.

## ✨ Features

**For students**
- 📊 **Dashboard** — pending/completed tasks, weekly focus hours, study streak, completion rate, upcoming deadlines
- ✅ **Task management** — create, edit, delete, mark complete, search, filter by priority/subject, sort by deadline
- 🗓️ **Academic calendar** (FullCalendar) — month/week/day views, color-coded categories (assignment, exam, meeting, group study); task deadlines appear automatically
- ⏱️ **Pomodoro timer** — start/pause/resume/reset, custom durations, daily & weekly stats, Bronze/Silver/Gold achievements (5/10/20 sessions per day), automatic study-streak tracking
- 👥 **Study groups** — create/join/leave groups, **real-time chat (Socket.io)**, file sharing, announcements, member list
- 🔔 **Notifications** — automatic reminders for deadlines (<24h), exams, meetings, and overdue tasks; in-app bell with unread badge; optional email via Nodemailer
- 📈 **Analytics** — weekly focus chart, monthly completed tasks, subject distribution (Chart.js)
- 👤 **Profile** — edit details, upload profile picture, change password, dark mode

**For admins**
- 🛠️ Platform statistics (total/active users, groups, tasks, focus hours)
- User management with search, pagination, and delete (cascades all user data)

## 🧰 Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, Tailwind CSS, FullCalendar, Chart.js, Socket.io-client, Axios |
| Backend  | Node.js, Express, Socket.io, JWT (jsonwebtoken), bcryptjs, Multer, node-cron, Nodemailer |
| Database | MySQL 8 (mysql2 connection pool, raw parameterized SQL) |

## 🗂 Project Structure

```
studybuddy/
├── database/
│   └── schema.sql          # 11 tables, FKs with ON DELETE CASCADE, indexes
├── backend/
│   ├── server.js           # Express + Socket.io entry point
│   ├── seed.js             # demo data generator (npm run seed)
│   ├── config/             # db pool, mailer
│   ├── middlewares/        # JWT auth, role guard, validation, error handler
│   ├── models/             # all SQL (one file per table group)
│   ├── controllers/        # business logic
│   ├── routes/             # /api/* endpoints
│   ├── sockets/            # real-time chat handler
│   └── utils/              # JWT helper, file uploads, reminder cron
└── frontend/
    └── src/
        ├── contexts/       # Auth (JWT + remember me), Theme (dark mode)
        ├── services/       # axios API layer (one file per resource)
        ├── hooks/          # useFetch, useDebounce, usePomodoro, useSocket
        ├── layouts/        # app shell (sidebar/navbar), auth layout
        ├── components/     # ui primitives, charts, tasks, calendar, groups
        └── pages/          # all routes incl. admin
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- MySQL 8

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in DB_PASSWORD (and SMTP_* if you want email)
npm run seed           # optional: demo accounts + sample data
npm run dev            # → http://localhost:5001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # → http://localhost:5173
```

### Demo accounts (after `npm run seed`)

| Email | Password | Role |
|---|---|---|
| admin@studybuddy.test | admin123 | admin |
| budi@student.test | password123 | student (with sample data) |
| sari@student.test | password123 | student |

## 🔌 API Overview

All endpoints are prefixed with `/api` and (except auth) require `Authorization: Bearer <JWT>`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `POST /auth/forgot-password` · `POST /auth/reset-password` |
| Tasks | `GET/POST /tasks` · `PUT/DELETE /tasks/:id` · `PATCH /tasks/:id/status` · `GET /tasks/subjects` |
| Events | `GET/POST /events` (feed merges tasks) · `PUT/DELETE /events/:id` |
| Pomodoro | `POST /pomodoro/sessions` · `GET /pomodoro/stats` |
| Groups | `GET/POST /groups` · `PUT/DELETE /groups/:id` · `join` / `leave` · `announcements` · `files` · `messages` |
| Notifications | `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` |
| Analytics | `GET /analytics/dashboard` · `GET /analytics/productivity` |
| Profile | `GET/PUT /profile` · `PUT /profile/password` · `POST /profile/picture` |
| Admin | `GET /admin/stats` · `GET /admin/users` · `DELETE /admin/users/:id` |

**Socket.io events:** `join_group`, `leave_group`, `send_message`, `receive_message` (JWT-authenticated handshake).

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT** auth with "remember me" (1d vs 30d expiry); identical error messages on login to avoid leaking which field was wrong
- Password-reset tokens are **SHA-256 hashed** in the DB, single-use, expire in 1 hour
- Every SQL query is **parameterized** (no SQL injection); sort columns are whitelisted
- **Role-based access control** middleware protects all admin routes
- Per-user data isolation (`WHERE user_id = ?` on every query)
- File uploads restricted by type and size (avatars 2 MB, group files 10 MB)

## 📄 License

Created as a university course project.
