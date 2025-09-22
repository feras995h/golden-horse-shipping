-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS customer_accounts (
    id TEXT PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    direct_access_token TEXT,
    token_expires_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create a sample customer account for testing with MSKU4603728
INSERT OR IGNORE INTO customer_accounts (
    id,
    tracking_number,
    password_hash,
    customer_name,
    customer_email,
    customer_phone,
    is_active,
    notes
) VALUES (
    'customer-msku4603728-001',
    'MSKU4603728',
    '$2b$10$rQJ8YnM9Wq7KzGx5vN2.8eH1pL3mR6sT9uA4bC7dE0fF2gH5iJ8kL',  -- password: 'customer123'
    'Test Customer for MSKU4603728',
    'customer@example.com',
    '+1234567890',
    1,
    'Test customer account for tracking number MSKU4603728'
);
