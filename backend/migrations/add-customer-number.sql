-- Add customer_number column to customer_accounts table
ALTER TABLE customer_accounts ADD COLUMN customer_number TEXT UNIQUE;

-- Create index for customer_number
CREATE UNIQUE INDEX idx_customer_accounts_customer_number ON customer_accounts(customer_number);

-- Update existing records with generated customer numbers in GH-XXXXXX format
UPDATE customer_accounts 
SET customer_number = 'GH-' || substr(abs(random()), 1, 6)
WHERE customer_number IS NULL;
