-- Add customer_number column to customer_accounts table
ALTER TABLE customer_accounts ADD COLUMN customer_number TEXT UNIQUE;

-- Create index for customer_number
CREATE UNIQUE INDEX idx_customer_accounts_customer_number ON customer_accounts(customer_number);

-- Update existing records with generated customer numbers
UPDATE customer_accounts 
SET customer_number = 'CUST-' || substr(id, 1, 8) 
WHERE customer_number IS NULL;
