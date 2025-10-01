const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkCustomerAccounts() {
  console.log('🔍 Checking Customer Accounts in Database...\n');

  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    // Check if customer_accounts table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='customer_accounts'", (err, row) => {
      if (err) {
        console.error('❌ Error checking table:', err.message);
        db.close();
        reject(err);
        return;
      }

      if (!row) {
        console.log('❌ customer_accounts table does not exist');
        db.close();
        resolve();
        return;
      }

      console.log('✅ customer_accounts table exists');

      // Get table schema
      db.all("PRAGMA table_info(customer_accounts)", (err, columns) => {
        if (err) {
          console.error('❌ Error getting table schema:', err.message);
          db.close();
          reject(err);
          return;
        }

        console.log('\n📋 Table Schema:');
        columns.forEach(col => {
          console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
        });

        // Get all customer accounts
        db.all("SELECT * FROM customer_accounts ORDER BY created_at DESC LIMIT 10", (err, customers) => {
          if (err) {
            console.error('❌ Error fetching customers:', err.message);
            db.close();
            reject(err);
            return;
          }

          console.log(`\n📊 Found ${customers.length} customer accounts:`);
          console.log('='.repeat(80));

          customers.forEach((customer, index) => {
            console.log(`${index + 1}. Customer Account:`);
            console.log(`   ID: ${customer.id}`);
            console.log(`   Tracking Number: ${customer.tracking_number || customer.trackingNumber}`);
            console.log(`   Customer Name: ${customer.customer_name || customer.customerName}`);
            console.log(`   Customer Number: ${customer.customer_number || customer.customerNumber || 'N/A'}`);
            console.log(`   Email: ${customer.customer_email || customer.customerEmail || 'N/A'}`);
            console.log(`   Phone: ${customer.customer_phone || customer.customerPhone || 'N/A'}`);
            console.log(`   Is Active: ${customer.is_active || customer.isActive}`);
            console.log(`   Has Portal Access: ${customer.has_portal_access || customer.hasPortalAccess}`);
            console.log(`   Has Password: ${customer.password_hash || customer.passwordHash ? 'Yes' : 'No'}`);
            console.log(`   Created: ${customer.created_at || customer.createdAt}`);
            console.log(`   Last Login: ${customer.last_login || customer.lastLogin || 'Never'}`);
            console.log('   ' + '-'.repeat(60));
          });

          // Check for MSKU4603728 specifically
          console.log('\n🔍 Checking for MSKU4603728 specifically...');
          db.get("SELECT * FROM customer_accounts WHERE tracking_number = 'MSKU4603728' OR trackingNumber = 'MSKU4603728'", (err, mskuCustomer) => {
            if (err) {
              console.error('❌ Error checking MSKU4603728:', err.message);
            } else if (mskuCustomer) {
              console.log('✅ Found MSKU4603728 customer:');
              console.log(`   ID: ${mskuCustomer.id}`);
              console.log(`   Name: ${mskuCustomer.customer_name || mskuCustomer.customerName}`);
              console.log(`   Is Active: ${mskuCustomer.is_active || mskuCustomer.isActive}`);
              console.log(`   Has Portal Access: ${mskuCustomer.has_portal_access || mskuCustomer.hasPortalAccess}`);
              console.log(`   Has Password: ${mskuCustomer.password_hash || mskuCustomer.passwordHash ? 'Yes' : 'No'}`);
            } else {
              console.log('❌ MSKU4603728 customer not found');
            }

            db.close();
            console.log('\n✅ Database connection closed');
            resolve();
          });
        });
      });
    });
  });
}

checkCustomerAccounts().catch(console.error);