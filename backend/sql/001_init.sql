-- Coco Care initial schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('farmer', 'officer', 'admin');
CREATE TYPE report_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  phone           VARCHAR(20),
  role            user_role NOT NULL,
  officer_id      VARCHAR(50),
  assigned_region VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  location    VARCHAR(100) NOT NULL,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  acreage     NUMERIC(6,2) NOT NULL,
  tree_count  INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE disease_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID NOT NULL REFERENCES farms(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  image_url       TEXT,
  symptoms        JSONB NOT NULL DEFAULT '{}',
  image_result    VARCHAR(200),
  symptom_result  VARCHAR(200),
  final_result    VARCHAR(200),
  confidence      NUMERIC(4,3),
  advice          TEXT,
  status          report_status DEFAULT 'pending',
  review_comment  TEXT,
  reviewed_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_disease_reports_status ON disease_reports(status);
CREATE INDEX idx_disease_reports_farm_id ON disease_reports(farm_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
