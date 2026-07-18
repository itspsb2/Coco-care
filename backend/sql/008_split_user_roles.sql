-- 008: Split the single users table into farmers / officers / admins.
-- Existing UUIDs are preserved when copying rows, so FK values stay valid;
-- only the constraints are re-pointed to the new tables.

BEGIN;

-- 1. Create the three role tables
CREATE TABLE IF NOT EXISTS farmers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS officers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20),
  officer_id      VARCHAR(50),
  assigned_region VARCHAR(100),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Copy rows from users, preserving ids
INSERT INTO farmers (id, username, password_hash, name, email, phone, is_active, created_at, updated_at)
SELECT id, username, password_hash, name, email, phone, COALESCE(is_active, TRUE), created_at, updated_at
FROM users WHERE role = 'farmer'
ON CONFLICT (id) DO NOTHING;

INSERT INTO officers (id, username, password_hash, name, email, phone, officer_id, assigned_region, is_active, created_at, updated_at)
SELECT id, username, password_hash, name, email, phone, officer_id, assigned_region, COALESCE(is_active, TRUE), created_at, updated_at
FROM users WHERE role = 'officer'
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (id, username, password_hash, name, email, phone, is_active, created_at, updated_at)
SELECT id, username, password_hash, name, email, phone, COALESCE(is_active, TRUE), created_at, updated_at
FROM users WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- 3a. Farmer-owned rows → farmers(id) ON DELETE CASCADE
-- Defensive cleanup: drop rows that would violate the new FKs
DELETE FROM farms WHERE user_id NOT IN (SELECT id FROM farmers);
DELETE FROM disease_reports WHERE user_id NOT IN (SELECT id FROM farmers);
DELETE FROM chat_messages WHERE user_id NOT IN (SELECT id FROM farmers);
DELETE FROM chat_conversations WHERE user_id NOT IN (SELECT id FROM farmers);
DELETE FROM disease_alerts WHERE farmer_user_id NOT IN (SELECT id FROM farmers);

ALTER TABLE farms
  DROP CONSTRAINT IF EXISTS farms_user_id_fkey;
ALTER TABLE farms
  ADD CONSTRAINT farms_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES farmers(id) ON DELETE CASCADE;

ALTER TABLE disease_reports
  DROP CONSTRAINT IF EXISTS disease_reports_user_id_fkey;
ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES farmers(id) ON DELETE CASCADE;

ALTER TABLE chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES farmers(id) ON DELETE CASCADE;

ALTER TABLE chat_conversations
  DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey;
ALTER TABLE chat_conversations
  ADD CONSTRAINT chat_conversations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES farmers(id) ON DELETE CASCADE;

ALTER TABLE disease_alerts
  DROP CONSTRAINT IF EXISTS disease_alerts_farmer_user_id_fkey;
ALTER TABLE disease_alerts
  ADD CONSTRAINT disease_alerts_farmer_user_id_fkey
  FOREIGN KEY (farmer_user_id) REFERENCES farmers(id) ON DELETE CASCADE;

-- 3b. notifications.created_by → admins(id) ON DELETE SET NULL
UPDATE notifications SET created_by = NULL
WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM admins);

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_created_by_fkey;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL;

-- 3c. Split disease_reports.reviewed_by into officer/admin columns
ALTER TABLE disease_reports
  ADD COLUMN IF NOT EXISTS reviewed_by_officer UUID,
  ADD COLUMN IF NOT EXISTS reviewed_by_admin UUID;

UPDATE disease_reports dr
SET reviewed_by_officer = dr.reviewed_by
FROM officers o
WHERE dr.reviewed_by = o.id;

UPDATE disease_reports dr
SET reviewed_by_admin = dr.reviewed_by
FROM admins a
WHERE dr.reviewed_by = a.id;

ALTER TABLE disease_reports
  DROP CONSTRAINT IF EXISTS disease_reports_reviewed_by_fkey;
ALTER TABLE disease_reports
  DROP COLUMN IF EXISTS reviewed_by;

ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_reviewed_by_officer_fkey
  FOREIGN KEY (reviewed_by_officer) REFERENCES officers(id) ON DELETE SET NULL;
ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_reviewed_by_admin_fkey
  FOREIGN KEY (reviewed_by_admin) REFERENCES admins(id) ON DELETE SET NULL;

ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_single_reviewer_check
  CHECK (reviewed_by_officer IS NULL OR reviewed_by_admin IS NULL);

-- 3d. notification_reads spans all three role tables: add user_role, drop FK
ALTER TABLE notification_reads
  ADD COLUMN IF NOT EXISTS user_role user_role;

UPDATE notification_reads nr
SET user_role = u.role
FROM users u
WHERE nr.user_id = u.id AND nr.user_role IS NULL;

DELETE FROM notification_reads WHERE user_role IS NULL;

ALTER TABLE notification_reads
  ALTER COLUMN user_role SET NOT NULL;

ALTER TABLE notification_reads
  DROP CONSTRAINT IF EXISTS notification_reads_user_id_fkey;
ALTER TABLE notification_reads
  DROP CONSTRAINT IF EXISTS notification_reads_pkey;
ALTER TABLE notification_reads
  ADD PRIMARY KEY (notification_id, user_id, user_role);

-- 4. Drop the old users table (keep the user_role enum: it is still used
-- by notification_reads.user_role)
DROP TABLE users;

COMMIT;
