const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Creating real shipment with container number MSKU4603728...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

async function createRealShipment() {
  try {
    // First, check if we have a customer account or use existing one
    let customerAccount = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM customer_accounts WHERE tracking_number = ?',
        ['MSKU4603728'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!customerAccount) {
      // Create a customer account only if it doesn't exist
      const customerId = uuidv4();
      const customerTrackingNumber = 'MSKU4603728';
      const customerToken = Math.random().toString(36).substr(2, 16);

      await new Promise((resolve, reject) => {
        const bcrypt = require('bcrypt');
        const passwordHash = bcrypt.hashSync('customer123', 10);
        
        const insertCustomerSQL = `
        INSERT INTO customer_accounts (
          id, customer_name, customer_email, customer_phone, 
          tracking_number, password_hash, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(insertCustomerSQL, [
          customerId,
          'Golden Horse Test Customer',
          'test@goldenhorse.ly',
          '+218912345678',
          customerTrackingNumber,
          passwordHash,
          1,
          new Date().toISOString(),
          new Date().toISOString()
        ], (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Customer account created');
            customerAccount = { id: customerId };
            resolve();
          }
        });
      });
    } else {
      console.log('✅ Using existing customer account for MSKU4603728');
    }

    console.log('Using customer account:', customerAccount.id);

    // Get or create a client
    let client = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM clients WHERE full_name = ?',
        ['Golden Horse Shipping Client'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!client) {
      const clientId = uuidv4();
      await new Promise((resolve, reject) => {
        const insertClientSQL = `
        INSERT INTO clients (
          id, client_id, full_name, email, phone, company, 
          address_line_1, city, country, isActive, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(insertClientSQL, [
          clientId,
          'GH-001',
          'Golden Horse Shipping Client',
          'client@goldenhorse.ly',
          '+218912345679',
          'Golden Horse Shipping Co.',
          'Benghazi Port Area',
          'Benghazi',
          'Libya',
          1,
          new Date().toISOString(),
          new Date().toISOString()
        ], (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Client created');
            client = { id: clientId };
            resolve();
          }
        });
      });
    }

    // Create the real shipment with MSKU4603728
    const shipmentId = uuidv4();
    const trackingNumber = 'GH-MSKU-' + Date.now().toString().slice(-6);
    const trackingToken = Math.random().toString(36).substr(2, 16);

    const insertShipmentSQL = `
    INSERT INTO shipments (
        id,
        tracking_number,
        tracking_token,
        client_id,
        customer_account_id,
        description,
        type,
        status,
        origin_port,
        destination_port,
        weight,
        volume,
        value,
        currency,
        totalCost,
        paymentStatus,
        estimated_departure,
        estimated_arrival,
        vessel_name,
        vessel_mmsi,
        vessel_imo,
        container_number,
        bl_number,
        booking_number,
        shipping_line,
        voyage,
        enable_tracking,
        notes,
        special_instructions,
        created_at,
        updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await new Promise((resolve, reject) => {
      db.run(insertShipmentSQL, [
        shipmentId,
        trackingNumber,
        trackingToken,
        client.id,
        customerAccount.id,
        'Real Container Shipment - Electronics and Consumer Goods',
        'sea',
        'in_transit',
        'Shanghai Port, China',
        'Benghazi Port, Libya',
        1850.75,
        28.5,
        15000.00,
        'USD',
        2500.00,
        'paid',
        '2024-09-20 08:00:00',
        '2024-10-15 16:00:00',
        'MSC OSCAR',
        '636019825',
        '9395044',
        'MSKU4603728', // Real container number
        'MSCUBL789456123',
        'MSC240920001',
        'MSC',
        'MSC002W',
        1, // enable_tracking
        'Real shipment with container MSKU4603728 - Full tracking enabled',
        'Fragile items - Handle with extreme care',
        new Date().toISOString(),
        new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Real shipment created successfully!');
          console.log('==========================================');
          console.log('Shipment Details:');
          console.log('- Shipment ID:', shipmentId);
          console.log('- Tracking Number:', trackingNumber);
          console.log('- Container Number: MSKU4603728');
          console.log('- BL Number: MSCUBL789456123');
          console.log('- Booking Number: MSC240920001');
          console.log('- Status: in_transit');
          console.log('- Origin: Shanghai Port, China');
          console.log('- Destination: Benghazi Port, Libya');
          console.log('- Vessel: MSC OSCAR');
          console.log('- Tracking Enabled: Yes');
          console.log('==========================================');
          resolve();
        }
      });
    });

    console.log('🎉 Real shipment creation completed successfully!');
    console.log('You can now test tracking with container number: MSKU4603728');
    
  } catch (error) {
    console.error('❌ Failed to create real shipment:', error.message);
    console.error('Error details:', error);
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

createRealShipment();