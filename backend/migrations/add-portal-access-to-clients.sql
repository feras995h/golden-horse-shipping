-- Add portal access fields to clients table
ALTER TABLE clients ADD COLUMN tracking_number TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN password_hash TEXT;
ALTER TABLE clients ADD COLUMN last_login DATETIME;
ALTER TABLE clients ADD COLUMN direct_access_token TEXT;
ALTER TABLE clients ADD COLUMN token_expires_at DATETIME;
ALTER TABLE clients ADD COLUMN has_portal_access BOOLEAN DEFAULT 0;

-- Create indexes for portal access fields
CREATE INDEX IF NOT EXISTS idx_clients_tracking_number ON clients(tracking_number);
CREATE INDEX IF NOT EXISTS idx_clients_has_portal_access ON clients(has_portal_access);

-- Update existing clients to have portal access disabled by default
UPDATE clients SET has_portal_access = 0 WHERE has_portal_access IS NULL;
