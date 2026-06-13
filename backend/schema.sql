-- ============================================================
-- StudyBuddy — MySQL Schema
-- Run:  mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS studybuddy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE studybuddy;

-- Drop in dependency order so the script is re-runnable
DROP TABLE IF EXISTS group_files;
DROP TABLE IF EXISTS group_announcements;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS study_groups;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pomodoro_sessions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- USERS
-- role drives RBAC: 'student' (default) or 'admin'
-- ------------------------------------------------------------
CREATE TABLE users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(150)  NOT NULL UNIQUE,
  password       VARCHAR(255)  NOT NULL,            -- bcrypt hash
  role           ENUM('student','admin') NOT NULL DEFAULT 'student',
  major          VARCHAR(100)  DEFAULT NULL,
  university     VARCHAR(150)  DEFAULT NULL,
  profile_image  VARCHAR(255)  DEFAULT NULL,        -- path under /uploads
  dark_mode      TINYINT(1)    NOT NULL DEFAULT 0,  -- persisted theme preference
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PASSWORD RESETS  (Forgot Password flow)
-- A hashed one-time token emailed to the user, with expiry.
-- ------------------------------------------------------------
CREATE TABLE password_resets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  CHAR(64)     NOT NULL,                -- sha256 of token
  expires_at  DATETIME     NOT NULL,
  used        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pr_token (token_hash)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TASKS
-- ------------------------------------------------------------
CREATE TABLE tasks (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  title        VARCHAR(150) NOT NULL,
  description  TEXT         DEFAULT NULL,
  subject      VARCHAR(100) NOT NULL,
  priority     ENUM('high','medium','low') NOT NULL DEFAULT 'medium',
  due_date     DATETIME     NOT NULL,
  status       ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  completed_at DATETIME     DEFAULT NULL,           -- powers completion analytics
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_task_user_due    (user_id, due_date),
  INDEX idx_task_user_status (user_id, status),
  INDEX idx_task_subject     (user_id, subject)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- EVENTS  (academic calendar; tasks are merged in at API level)
-- ------------------------------------------------------------
CREATE TABLE events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  category    ENUM('assignment','exam','meeting','group_study') NOT NULL,
  event_date  DATETIME NOT NULL,                    -- start
  end_date    DATETIME DEFAULT NULL,                -- optional end (FullCalendar)
  color       VARCHAR(7) DEFAULT NULL,              -- optional custom label color
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_event_user_date (user_id, event_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- POMODORO SESSIONS
-- Streaks and Bronze/Silver/Gold achievements are computed
-- from this table; they are never stored, so they can't go stale.
-- ------------------------------------------------------------
CREATE TABLE pomodoro_sessions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  duration      SMALLINT UNSIGNED NOT NULL,         -- focus minutes completed
  session_date  DATE NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pomo_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pomo_user_date (user_id, session_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- STUDY GROUPS
-- ------------------------------------------------------------
CREATE TABLE study_groups (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_name  VARCHAR(120) NOT NULL,
  subject     VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  schedule    VARCHAR(255) DEFAULT NULL,            -- e.g. "Tue & Thu, 19:00"
  created_by  INT UNSIGNED NOT NULL,                -- group owner / moderator
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_group_owner FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_group_subject (subject)
) ENGINE=InnoDB;

CREATE TABLE group_members (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id  INT UNSIGNED NOT NULL,
  user_id   INT UNSIGNED NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gm_group FOREIGN KEY (group_id)
    REFERENCES study_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_gm_user  FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_member (group_id, user_id)          -- can't join twice
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- MESSAGES  (real-time chat, persisted by Socket.io handler)
-- ------------------------------------------------------------
CREATE TABLE messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id   INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_group FOREIGN KEY (group_id)
    REFERENCES study_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_user  FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_msg_group_time (group_id, created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- GROUP ANNOUNCEMENTS
-- ------------------------------------------------------------
CREATE TABLE group_announcements (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id   INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,                 -- author
  title      VARCHAR(150) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ann_group FOREIGN KEY (group_id)
    REFERENCES study_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_ann_user  FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ann_group (group_id, created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- GROUP FILES  (file sharing section)
-- ------------------------------------------------------------
CREATE TABLE group_files (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id    INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,                -- uploader
  file_name   VARCHAR(255) NOT NULL,                -- original name
  file_path   VARCHAR(255) NOT NULL,                -- stored path under /uploads
  file_size   INT UNSIGNED NOT NULL DEFAULT 0,      -- bytes
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_file_group FOREIGN KEY (group_id)
    REFERENCES study_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_file_user  FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_file_group (group_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- type lets the bell render the right icon and link target.
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  type       ENUM('deadline','exam','meeting','task','system')
             NOT NULL DEFAULT 'system',
  message    VARCHAR(255) NOT NULL,
  link       VARCHAR(255) DEFAULT NULL,             -- in-app route, e.g. /tasks
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read, created_at)
) ENGINE=InnoDB;
