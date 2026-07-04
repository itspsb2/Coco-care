CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    VARCHAR(255) PRIMARY KEY,
  applied_at  TIMESTAMPTZ DEFAULT NOW()
);
