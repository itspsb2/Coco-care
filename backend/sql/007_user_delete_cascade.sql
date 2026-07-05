-- Allow user deletion to cascade related disease report rows

ALTER TABLE disease_reports
  DROP CONSTRAINT IF EXISTS disease_reports_user_id_fkey;

ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE disease_reports
  DROP CONSTRAINT IF EXISTS disease_reports_reviewed_by_fkey;

ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE disease_reports
  DROP CONSTRAINT IF EXISTS disease_reports_farm_id_fkey;

ALTER TABLE disease_reports
  ADD CONSTRAINT disease_reports_farm_id_fkey
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE;
