-- Disease outbreak alerts for nearby farmers

CREATE TABLE IF NOT EXISTS disease_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES disease_reports(id) ON DELETE CASCADE,
  farmer_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id         UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  disease_type    VARCHAR(200) NOT NULL,
  distance_km     NUMERIC(8,2) NOT NULL,
  message         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (report_id, farmer_user_id, farm_id)
);

CREATE INDEX IF NOT EXISTS idx_disease_alerts_farmer ON disease_alerts (farmer_user_id, created_at DESC);
