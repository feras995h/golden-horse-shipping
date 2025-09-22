-- Initialize Golden Horse Shipping Database
-- This script creates the initial database structure and seed data

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default admin user (password: admin123)
-- Note: In production, this should be changed immediately
INSERT INTO users (id, username, email, password, full_name, role, is_active, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@goldenhorse.ly',
  '$2b$10$XOPbrlUPQdGBFBQf0f6gHOehHGlhZaOv1aUAh4/KjU8sXjqk6Wn8.',
  'System Administrator',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Insert sample client for testing
INSERT INTO clients (id, client_id, full_name, email, phone, company, address_line_1, city, country, is_active, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'GH-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  'أحمد محمد علي',
  'ahmed@example.com',
  '+218-21-1234567',
  'شركة التجارة الليبية',
  'شارع الجمهورية',
  'طرابلس',
  'ليبيا',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients(client_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_client_id ON shipments(client_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_start_end_date ON ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_shipment_id ON payment_records(shipment_id);
