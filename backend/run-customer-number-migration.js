const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Running customer number migration...');
  
  const db = new sqlite3.Database('./database.sqlite');
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add-customer-number.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await new Promise((resolve, reject) => {
          db.run(statement.trim(), function(err) {
            if (err) {
              console.error('Error executing statement:', statement);
              console.error('Error:', err.message);
              reject(err);
            } else {
              console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
              resolve();
            }
          });
        });
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the migration
    db.all('SELECT id, tracking_number, customer_number, customer_name FROM customer_accounts LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Error verifying migration:', err.message);
      } else {
        console.log('\n📋 Sample customer accounts after migration:');
        console.table(rows);
      }
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    db.close();
    process.exit(1);
  }
}

runMigration();
