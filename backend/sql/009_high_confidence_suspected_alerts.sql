ALTER TABLE disease_alerts
  ADD COLUMN IF NOT EXISTS alert_type VARCHAR(30) NOT NULL DEFAULT 'verified';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'disease_alerts_alert_type_check'
  ) THEN
    ALTER TABLE disease_alerts
      ADD CONSTRAINT disease_alerts_alert_type_check
      CHECK (alert_type IN ('verified', 'ai_suspected'));
  END IF;
END $$;

UPDATE disease_reports
SET status = 'pending',
    review_comment = COALESCE(
      review_comment,
      'Awaiting officer/admin verification after AI confidence rule update'
    )
WHERE status = 'verified'
  AND reviewed_by_officer IS NULL
  AND reviewed_by_admin IS NULL;

UPDATE disease_alerts da
SET alert_type = 'ai_suspected',
    message = 'AI-suspected case of '
      || COALESCE(dr.final_result, da.disease_type, 'Unknown disease')
      || ' reported approximately '
      || ROUND(da.distance_km::numeric, 2)::text
      || ' km from your farm. This has not been officer verified yet.'
FROM disease_reports dr
WHERE da.report_id = dr.id
  AND dr.status = 'pending'
  AND COALESCE(dr.confidence, 0) > 0.9;

UPDATE disease_alerts da
SET alert_type = 'verified'
FROM disease_reports dr
WHERE da.report_id = dr.id
  AND dr.status = 'verified'
  AND (dr.reviewed_by_officer IS NOT NULL OR dr.reviewed_by_admin IS NOT NULL);

DELETE FROM disease_alerts da
USING disease_reports dr
WHERE da.report_id = dr.id
  AND dr.status = 'rejected';
