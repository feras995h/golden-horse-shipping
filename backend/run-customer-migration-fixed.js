const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Running customer accounts migration (fixed)...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Create customer_accounts table
const createTableSQL = `
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
);`;

// Add customer_account_id column to shipments table
const addColumnSQL = `
ALTER TABLE shipments ADD COLUMN customer_account_id TEXT;`;

// Create indexes
const createIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_customer_accounts_tracking_number ON customer_accounts(tracking_number);`,
  `CREATE INDEX IF NOT EXISTS idx_customer_accounts_direct_token ON customer_accounts(direct_access_token);`,
  `CREATE INDEX IF NOT EXISTS idx_shipments_customer_account_id ON shipments(customer_account_id);`
];

async function runMigration() {
  try {
    // Create table
    await new Promise((resolve, reject) => {
      db.run(createTableSQL, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Customer accounts table created successfully');
          resolve();
        }
      });
    });

    // Add column to shipments table
    try {
      await new Promise((resolve, reject) => {
        db.run(addColumnSQL, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            reject(err);
          } else {
            console.log('✅ Customer account ID column added to shipments table');
            resolve();
          }
        });
      });
    } catch (err) {
      console.log('ℹ️ Customer account ID column already exists in shipments table');
    }

    // Create indexes
    for (const indexSQL of createIndexes) {
      await new Promise((resolve, reject) => {
        db.run(indexSQL, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Index created successfully');
            resolve();
          }
        });
      });
    }

    // Create sample customer account with hashed password
    const passwordHash = await bcrypt.hash('customer123', 10);
    const insertSQL = `
    INSERT OR IGNORE INTO customer_accounts (
        id,
        tracking_number,
        password_hash,
        customer_name,
        customer_email,
        customer_phone,
        is_active,
        notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await new Promise((resolve, reject) => {
      db.run(insertSQL, [
        'customer-msku4603728-001',
        'MSKU4603728',
        passwordHash,
        'Test Customer for MSKU4603728',
        'customer@example.com',
        '+1234567890',
        1,
        'Test customer account for tracking number MSKU4603728'
      ], (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Sample customer account created successfully');
          resolve();
        }
      });
    });

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

runMigration();
