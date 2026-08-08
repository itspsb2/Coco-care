-- Store last admin-assigned plain password for support lookup.
-- Login still uses password_hash only; this column is admin-only.

ALTER TABLE farmers
  ADD COLUMN IF NOT EXISTS admin_password TEXT;

ALTER TABLE officers
  ADD COLUMN IF NOT EXISTS admin_password TEXT;

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS admin_password TEXT;

-- Demo / seed accounts use the shared default password when still untagged.
UPDATE farmers SET admin_password = 'password' WHERE admin_password IS NULL;
UPDATE officers SET admin_password = 'password' WHERE admin_password IS NULL;
UPDATE admins SET admin_password = 'password' WHERE admin_password IS NULL;
