const sqlite3 = require('sqlite3').verbose();

async function updateCustomerNumbers() {
  console.log('🔄 Updating customer numbers...');
  
  const db = new sqlite3.Database('./database.sqlite');
  
  try {
    // Get all customers without customer numbers
    const customers = await new Promise((resolve, reject) => {
      db.all('SELECT id, tracking_number, customer_name FROM customer_accounts WHERE customer_number IS NULL', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Found ${customers.length} customers without customer numbers`);
    
    // Update each customer with a generated customer number
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const customerNumber = `CUST-${String(i + 1).padStart(4, '0')}`;
      
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE customer_accounts SET customer_number = ? WHERE id = ?',
          [customerNumber, customer.id],
          function(err) {
            if (err) {
              console.error(`Error updating customer ${customer.id}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Updated ${customer.customer_name}: ${customerNumber}`);
              resolve();
            }
          }
        );
      });
    }
    
    console.log('✅ All customer numbers updated successfully!');
    
    // Verify the updates
    db.all('SELECT id, tracking_number, customer_number, customer_name FROM customer_accounts', (err, rows) => {
      if (err) {
        console.error('Error verifying updates:', err.message);
      } else {
        console.log('\n📋 Updated customer accounts:');
        console.table(rows);
      }
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    db.close();
    process.exit(1);
  }
}

updateCustomerNumbers();
