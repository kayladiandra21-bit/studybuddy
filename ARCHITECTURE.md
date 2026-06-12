# StudyBuddy — Project Architecture

> Smart academic planner for university students.
> Stack: React + Tailwind CSS · Node.js + Express · MySQL · Socket.io · JWT · Nodemailer

---

## 1. High-Level Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐
│        FRONTEND         │  HTTPS  │         BACKEND          │
│  React + Tailwind CSS   │ ──────► │    Node.js + Express     │
│  (Vite dev server /     │  REST   │                          │
│   static build)         │ ◄────── │  JWT auth middleware     │
│                         │         │  Role-based access       │
│  FullCalendar           │   WS    │  Socket.io server        │
│  Chart.js               │ ◄─────► │  Nodemailer (cron jobs)  │
│  Socket.io-client       │         │                          │
└─────────────────────────┘         └────────────┬─────────────┘
                                                 │ mysql2 (pool)
                                                 ▼
                                    ┌──────────────────────────┐
                                    │          MySQL           │
                                    │   studybuddy database    │
                                    └──────────────────────────┘
```

**Key architectural decisions**

| Decision | Choice | Why |
|---|---|---|
| API style | REST (JSON) | Simple, course-friendly, easy to test with Postman |
| Auth | JWT access token (httpOnly-capable) + bcrypt hashing | Stateless, supports "remember me" via longer expiry |
| DB access | `mysql2/promise` connection pool + thin model layer | No heavy ORM; you see and learn the SQL |
| Real-time | Socket.io namespaced rooms per study group | Standard for chat; auth via JWT handshake |
| Reminders | `node-cron` job → Nodemailer + in-app notifications | One scheduler covers deadline/exam/meeting reminders |
| Frontend state | React Contexts (Auth, Theme) + custom hooks | Right-sized; no Redux overhead for this scope |
| Styling | Tailwind + CSS variables for dark mode | `class`-strategy dark mode toggle stored per user |

---

## 2. Repository / Folder Structure

```
studybuddy/                          # ← Git repository root (push this to GitHub)
│
├── README.md                        # Setup, run, deploy instructions (Step 8)
├── ARCHITECTURE.md                  # This file
├── .gitignore                       # node_modules, .env, build output
│
├── database/
│   ├── schema.sql                   # Table creation script (Step 1) ✅
│   └── seed.sql                     # Sample dummy data (Step 8)
│
├── backend/
│   ├── package.json
│   ├── .env.example                 # DB creds, JWT secret, SMTP config template
│   ├── server.js                    # Entry point: Express + Socket.io bootstrap
│   │
│   ├── config/
│   │   ├── db.js                    # mysql2 connection pool
│   │   └── mailer.js                # Nodemailer transport
│   │
│   ├── middlewares/
│   │   ├── auth.js                  # verifyToken — validates JWT
│   │   ├── roles.js                 # requireRole('admin') — RBAC guard
│   │   ├── validate.js              # request body validation helper
│   │   └── errorHandler.js          # central error handler (no try/catch soup)
│   │
│   ├── models/                      # SQL queries only — no business logic
│   │   ├── userModel.js
│   │   ├── taskModel.js
│   │   ├── eventModel.js
│   │   ├── pomodoroModel.js
│   │   ├── groupModel.js            # groups + members + announcements + files
│   │   ├── messageModel.js
│   │   └── notificationModel.js
│   │
│   ├── controllers/                 # business logic — calls models
│   │   ├── authController.js        # register, login, forgot/reset password
│   │   ├── taskController.js
│   │   ├── eventController.js
│   │   ├── pomodoroController.js    # sessions + stats + achievements
│   │   ├── groupController.js
│   │   ├── notificationController.js
│   │   ├── analyticsController.js   # dashboard + analytics aggregates
│   │   ├── profileController.js
│   │   └── adminController.js
│   │
│   ├── routes/                      # one file per resource, mounted in server.js
│   │   ├── authRoutes.js            #   /api/auth
│   │   ├── taskRoutes.js            #   /api/tasks
│   │   ├── eventRoutes.js           #   /api/events
│   │   ├── pomodoroRoutes.js        #   /api/pomodoro
│   │   ├── groupRoutes.js           #   /api/groups
│   │   ├── notificationRoutes.js    #   /api/notifications
│   │   ├── analyticsRoutes.js       #   /api/analytics
│   │   ├── profileRoutes.js         #   /api/profile
│   │   └── adminRoutes.js           #   /api/admin
│   │
│   ├── sockets/
│   │   └── chatSocket.js            # group chat rooms, message persistence
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── reminderJob.js           # node-cron: scans deadlines → notify + email
│   │
│   └── uploads/                     # profile pictures & group files (gitignored)
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── tailwind.config.js           # dark mode 'class', design tokens
    ├── vite.config.js
    │
    └── src/
        ├── main.jsx                 # mounts providers + router
        ├── App.jsx                  # route table + protected routes
        │
        ├── contexts/
        │   ├── AuthContext.jsx      # user, token, login/logout, remember-me
        │   └── ThemeContext.jsx     # dark mode toggle
        │
        ├── services/                # ONE axios instance + per-resource APIs
        │   ├── api.js               # baseURL + JWT interceptor
        │   ├── authService.js
        │   ├── taskService.js
        │   ├── eventService.js
        │   ├── pomodoroService.js
        │   ├── groupService.js
        │   ├── notificationService.js
        │   └── analyticsService.js
        │
        ├── hooks/
        │   ├── useFetch.js          # loading/error/data wrapper
        │   ├── usePomodoro.js       # timer state machine
        │   ├── useSocket.js         # socket lifecycle per group
        │   └── useDebounce.js       # search inputs
        │
        ├── layouts/
        │   ├── AppLayout.jsx        # Sidebar + Navbar + <Outlet/>
        │   └── AuthLayout.jsx       # centered card for login/register
        │
        ├── components/
        │   ├── ui/                  # Button, Card, Modal, Badge, Table,
        │   │                        # Pagination, SearchBar, Spinner, Toast
        │   ├── NotificationBell.jsx
        │   ├── StatCard.jsx
        │   ├── charts/              # Chart.js wrappers
        │   ├── tasks/               # TaskForm, TaskRow, TaskFilters
        │   ├── calendar/            # CalendarView, EventModal
        │   ├── pomodoro/            # TimerCircle, AchievementBadge
        │   └── groups/              # GroupCard, ChatWindow, FilePanel,
        │                            # AnnouncementList, MemberList
        │
        └── pages/
            ├── Landing.jsx
            ├── auth/                # Login, Register, ForgotPassword, ResetPassword
            ├── Dashboard.jsx
            ├── Tasks.jsx
            ├── Calendar.jsx
            ├── Pomodoro.jsx
            ├── Groups.jsx           # list + create/join
            ├── GroupDetail.jsx      # chat, files, announcements, schedule
            ├── Analytics.jsx
            ├── Notifications.jsx
            ├── Profile.jsx
            └── admin/
                ├── AdminDashboard.jsx
                └── AdminUsers.jsx
```

---

## 3. API Surface (planned — implemented in Steps 2–4)

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password` |
| Tasks | `GET/POST /api/tasks` · `GET/PUT/DELETE /api/tasks/:id` · `PATCH /api/tasks/:id/status` — supports `?search=&priority=&subject=&sort=due_date` |
| Events | `GET/POST /api/events` · `PUT/DELETE /api/events/:id` (tasks are merged into the calendar feed server-side) |
| Pomodoro | `POST /api/pomodoro/sessions` · `GET /api/pomodoro/stats` |
| Groups | `GET/POST /api/groups` · `PUT/DELETE /api/groups/:id` · `POST /api/groups/:id/join` · `DELETE /api/groups/:id/leave` · members, announcements, files, messages sub-routes |
| Notifications | `GET /api/notifications` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all` |
| Analytics | `GET /api/analytics/dashboard` · `GET /api/analytics/productivity` |
| Profile | `GET/PUT /api/profile` · `PUT /api/profile/password` |
| Admin | `GET /api/admin/stats` · `GET /api/admin/users` · `DELETE /api/admin/users/:id` |

**Socket.io events:** `join_group`, `leave_group`, `send_message`, `receive_message`, `notification`.

---

## 4. Database Design Notes

The schema in `database/schema.sql` follows your spec with a few deliberate upgrades a reviewer will appreciate:

1. **Foreign keys with `ON DELETE CASCADE`** — deleting a user/group cleans up children automatically (needed by the Admin "delete user" feature).
2. **ENUMs for fixed vocabularies** (`role`, `priority`, `status`, event `category`, notification `type`) — data integrity at the DB level.
3. **`created_at` / `updated_at` timestamps** on every table — required for "recent activity", streaks, and sorting.
4. **Extra tables your feature list implies but the table list missed:**
   - `password_resets` — Forgot Password flow needs a token store.
   - `group_announcements` and `group_files` — the Study Group module lists both.
   - `study_groups.created_by` — someone must own/moderate a group.
5. **Indexes** on every common filter (`user_id + due_date`, `is_read`, etc.).
6. **Streak & achievements are computed, not stored** — derived from `pomodoro_sessions` and `tasks` so they can never go stale.

---

## 5. Next Step

**Step 2** scaffolds the backend: `server.js`, DB pool, and the complete authentication module (register, login with bcrypt, JWT issuing, remember-me expiry, forgot/reset password, role middleware).
