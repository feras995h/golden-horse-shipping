/*
  Set or reset a customer's password by customer number (GH-XXXXXX) safely.
  Usage (PowerShell):
    $env:CUST_NUMBER="GH-590079"; $env:CUST_PASSWORD="yourPassword"; node backend/tools/set-customer-password.js

  This reads DATABASE_URL from your .env (dotenv) or environment.
*/

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  const customerNumber = process.env.CUST_NUMBER || process.argv[2];
  const newPassword = process.env.CUST_PASSWORD || process.argv[3];

  if (!customerNumber || !newPassword) {
    console.error('Usage: set CUST_NUMBER and CUST_PASSWORD env vars or pass args: node set-customer-password.js GH-XXXXXX myPass');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set. Please configure your .env with DATABASE_URL.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    console.log(`🔐 Updating password for ${customerNumber} ...`);
    await client.connect();

    // Ensure customer exists
    const findRes = await client.query(
      'SELECT id, tracking_number, customer_name, is_active, has_portal_access FROM customer_accounts WHERE customer_number = $1 LIMIT 1',
      [customerNumber]
    );

    let customer = findRes.rows[0];

    if (!customer) {
      console.log('ℹ️ Customer not found. Creating a new customer account with this number...');
      const randomTracking = 'AUTO' + Math.floor(Date.now() + Math.random() * 1000).toString(36).toUpperCase();
      const name = `Customer ${customerNumber}`;

      // Create minimal customer account so they can log in
      const insertRes = await client.query(
        `INSERT INTO customer_accounts (
           id, tracking_number, customer_number, password_hash,
           customer_name, customer_email, customer_phone,
           is_active, has_portal_access, created_at, updated_at
         ) VALUES (
           gen_random_uuid(), $1, $2, $3,
           $4, NULL, NULL,
           1, 1, NOW(), NOW()
         ) RETURNING id, tracking_number, customer_name`,
        [randomTracking, customerNumber, await bcrypt.hash(newPassword, 10), name]
      );

      customer = insertRes.rows[0];
      console.log(`✅ Created customer ${customer.customer_name} with tracking ${customer.tracking_number}`);
    } else {
      // Update password and ensure active + portal access
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await client.query(
        `UPDATE customer_accounts
         SET password_hash = $1,
             is_active = 1,
             has_portal_access = 1,
             updated_at = NOW()
         WHERE customer_number = $2`,
        [passwordHash, customerNumber]
      );
      console.log('✅ Password updated and account ensured active with portal access');
    }

    // Verify update by fetching and bcrypt compare
    const verifyRes = await client.query(
      'SELECT password_hash FROM customer_accounts WHERE customer_number = $1',
      [customerNumber]
    );
    const hash = verifyRes.rows[0]?.password_hash;
    const ok = await bcrypt.compare(newPassword, hash || '');
    console.log(`🔎 Password verification: ${ok ? '✅ valid' : '❌ invalid'}`);

    if (ok) {
      console.log('🎯 Customer can now log in using:');
      console.log(`   - Customer Number: ${customerNumber}`);
      console.log('   - Password: (the one you provided)');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();