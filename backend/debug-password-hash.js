const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Production database configuration
const DATABASE_CONFIG = {
  user: 'postgres',
  host: '72.60.92.146',
  database: 'postgres',
  password: 'A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l',
  port: 5433,
};

async function debugPasswordHashes() {
  console.log('🔍 فحص تشفير كلمات المرور في قاعدة البيانات الإنتاجية...\n');

  try {
    const client = new Client(DATABASE_CONFIG);
    await client.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Get customer data with password hashes
    console.log('\n1️⃣ جلب بيانات العملاء مع كلمات المرور المشفرة...');
    const customersQuery = await client.query(`
      SELECT 
        id, 
        tracking_number, 
        customer_number, 
        customer_name, 
        password_hash,
        is_active,
        has_portal_access,
        created_at
      FROM customer_accounts 
      WHERE customer_number IN ('GH-249109', 'GH-485194', 'GH-971289')
      ORDER BY created_at DESC
    `);

    if (customersQuery.rows.length === 0) {
      console.log('❌ لم يتم العثور على العملاء المطلوبين');
      await client.end();
      return;
    }

    console.log(`✅ تم العثور على ${customersQuery.rows.length} عملاء`);

    for (const customer of customersQuery.rows) {
      console.log(`\n👤 العميل: ${customer.customer_name}`);
      console.log(`   - رقم العميل: ${customer.customer_number}`);
      console.log(`   - رقم التتبع: ${customer.tracking_number}`);
      console.log(`   - نشط: ${customer.is_active}`);
      console.log(`   - له صلاحية الدخول: ${customer.has_portal_access}`);
      console.log(`   - تاريخ الإنشاء: ${customer.created_at}`);
      
      if (customer.password_hash) {
        console.log(`   - كلمة المرور مشفرة: نعم (${customer.password_hash.substring(0, 20)}...)`);
        
        // Test password verification
        const testPasswords = ['customer123', 'password123', 'admin123', '123456'];
        
        for (const testPassword of testPasswords) {
          try {
            const isValid = await bcrypt.compare(testPassword, customer.password_hash);
            if (isValid) {
              console.log(`   ✅ كلمة المرور الصحيحة: "${testPassword}"`);
              break;
            }
          } catch (error) {
            console.log(`   ❌ خطأ في فحص كلمة المرور "${testPassword}":`, error.message);
          }
        }
      } else {
        console.log(`   - كلمة المرور مشفرة: لا`);
        
        // Create a password hash for this customer
        console.log(`   🔧 إنشاء كلمة مرور مشفرة جديدة...`);
        const newPasswordHash = await bcrypt.hash('customer123', 10);
        
        await client.query(`
          UPDATE customer_accounts 
          SET password_hash = $1, updated_at = NOW()
          WHERE id = $2
        `, [newPasswordHash, customer.id]);
        
        console.log(`   ✅ تم تحديث كلمة المرور المشفرة`);
      }
    }

    // Test creating a new customer with proper password hash
    console.log('\n2️⃣ إنشاء عميل تجريبي جديد بكلمة مرور مشفرة...');
    const testPasswordHash = await bcrypt.hash('customer123', 10);
    
    try {
      const insertResult = await client.query(`
        INSERT INTO customer_accounts (
          id, tracking_number, customer_number, password_hash, 
          customer_name, customer_email, customer_phone, 
          is_active, has_portal_access, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'TEST' || EXTRACT(EPOCH FROM NOW())::bigint, 
          'GH-' || (RANDOM() * 900000 + 100000)::int, $1,
          'Test Customer - Password Debug', 'test@example.com', '+1234567890',
          true, true, NOW(), NOW()
        ) RETURNING id, tracking_number, customer_number, customer_name
      `, [testPasswordHash]);
      
      console.log('✅ تم إنشاء عميل تجريبي جديد:', insertResult.rows[0]);
      
      // Verify the new password works
      const newCustomer = insertResult.rows[0];
      const verifyQuery = await client.query(`
        SELECT password_hash FROM customer_accounts WHERE id = $1
      `, [newCustomer.id]);
      
      const isPasswordValid = await bcrypt.compare('customer123', verifyQuery.rows[0].password_hash);
      console.log(`✅ فحص كلمة المرور للعميل الجديد: ${isPasswordValid ? 'صحيحة' : 'خاطئة'}`);
      
    } catch (error) {
      console.log('❌ فشل في إنشاء العميل التجريبي:', error.message);
    }

    await client.end();
    console.log('\n✅ تم الانتهاء من فحص كلمات المرور');

  } catch (error) {
    console.error('❌ خطأ في فحص كلمات المرور:', error.message);
  }
}

// Run the debug
debugPasswordHashes().catch(console.error);