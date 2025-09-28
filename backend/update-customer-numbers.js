const sqlite3 = require('sqlite3').verbose();

async function updateCustomerNumbers() {
  console.log('🔄 Updating customer numbers to new GH-XXXXXX format...');
  
  const db = new sqlite3.Database('./database.sqlite');
  
  try {
    // Get all customers
    const customers = await new Promise((resolve, reject) => {
      db.all('SELECT id, tracking_number, customer_name, customer_number FROM customer_accounts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Found ${customers.length} customers to update`);
    
    // Update each customer with a new GH-XXXXXX format customer number
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      
      // Generate new customer number in GH-XXXXXX format
      const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
      const customerNumber = `GH-${randomNum}`;
      
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE customer_accounts SET customer_number = ? WHERE id = ?',
          [customerNumber, customer.id],
          function(err) {
            if (err) {
              console.error(`Error updating customer ${customer.id}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Updated ${customer.customer_name}: ${customer.customer_number || 'NULL'} → ${customerNumber}`);
              resolve();
            }
          }
        );
      });
    }
    
    console.log('✅ All customer numbers updated to new GH-XXXXXX format!');
    
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
    console.error('❌ Error updating customer numbers:', error.message);
    db.close();
  }
}

updateCustomerNumbers();
