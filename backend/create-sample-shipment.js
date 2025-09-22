const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Creating sample shipment for customer MSKU4603728...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

async function createSampleShipment() {
  try {
    // First, get the customer account ID
    const customerAccount = await new Promise((resolve, reject) => {
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
      console.error('Customer account not found for MSKU4603728');
      return;
    }

    console.log('Found customer account:', customerAccount.id);

    // Create a sample shipment
    const shipmentId = uuidv4();
    const trackingNumber = 'GH' + Math.random().toString(36).substr(2, 8).toUpperCase();
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
        'b8836d60-5b5c-4b03-97e3-beb3d63ac88d', // client_id (using existing client)
        customerAccount.id, // customer_account_id
        'Electronics and Personal Items from China',
        'sea',
        'in_transit',
        'Shanghai Port',
        'Benghazi Port',
        125.50,
        2.3,
        2500.00,
        'USD',
        350.00,
        'partial',
        '2024-09-15 10:00:00',
        '2024-10-05 14:00:00',
        'MSC OSCAR',
        '636019825',
        '9395044',
        'MSKU4603728',
        'MSCUBL123456789',
        'MSC240915001',
        'MSC',
        'MSC001E',
        1, // enable_tracking
        'Customer shipment with real-time tracking enabled',
        'Handle with care - contains electronics',
        new Date().toISOString(),
        new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Sample shipment created successfully');
          console.log('Shipment ID:', shipmentId);
          console.log('Tracking Number:', trackingNumber);
          console.log('Container Number:', 'MSKU4603728');
          resolve();
        }
      });
    });

    console.log('🎉 Sample shipment creation completed!');
    
  } catch (error) {
    console.error('❌ Failed to create sample shipment:', error.message);
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

createSampleShipment();
