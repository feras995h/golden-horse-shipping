const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const migrationPath = path.join(__dirname, 'migrations', 'add-portal-access-to-customers.sql');

console.log('🔄 Running customer portal access migration...\n');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Read migration file
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Execute migration
db.exec(migrationSQL, (err) => {
  if (err) {
    console.error('❌ Migration failed:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log('✅ Migration completed successfully');
  
  // Verify the changes
  db.all("PRAGMA table_info(customer_accounts)", (err, rows) => {
    if (err) {
      console.error('❌ Error checking table:', err.message);
    } else {
      console.log('\n📋 Customer accounts table schema:');
      const portalAccessField = rows.find(row => row.name === 'has_portal_access');
      
      if (portalAccessField) {
        console.log(`  ✅ has_portal_access (${portalAccessField.type})`);
      } else {
        console.log('  ⚠️  has_portal_access field not found');
      }
    }
    
    // Check customer data
    db.all("SELECT id, tracking_number, customer_name, has_portal_access FROM customer_accounts LIMIT 5", (err, customers) => {
      if (err) {
        console.error('❌ Error checking customers:', err.message);
      } else {
        console.log('\n👥 Sample customer accounts:');
        customers.forEach(customer => {
          console.log(`  - ${customer.tracking_number}: ${customer.customer_name} (Portal Access: ${customer.has_portal_access})`);
        });
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('\n🎉 Migration completed successfully!');
        }
      });
    });
  });
});