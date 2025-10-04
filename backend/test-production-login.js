const axios = require('axios');
const { Client } = require('pg');

// Production server configuration
const PRODUCTION_URL = 'http://72.60.92.146';
const DATABASE_CONFIG = {
  user: 'postgres',
  host: '72.60.92.146',
  database: 'postgres',
  password: 'A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l',
  port: 5433,
};

async function testProductionLogin() {
  console.log('🔍 اختبار تسجيل الدخول في البيئة الإنتاجية...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ اختبار الاتصال بقاعدة البيانات الإنتاجية...');
    const client = new Client(DATABASE_CONFIG);
    await client.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // 2. Check if customer_accounts table exists
    console.log('\n2️⃣ فحص وجود جدول customer_accounts...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_accounts'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ جدول customer_accounts موجود');
    } else {
      console.log('❌ جدول customer_accounts غير موجود');
      await client.end();
      return;
    }

    // 3. Check for existing customers
    console.log('\n3️⃣ فحص العملاء الموجودين...');
    const customersQuery = await client.query(`
      SELECT id, tracking_number, customer_number, customer_name, is_active, has_portal_access
      FROM customer_accounts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (customersQuery.rows.length === 0) {
      console.log('❌ لا توجد حسابات عملاء في قاعدة البيانات الإنتاجية');
      
      // Create a test customer
      console.log('\n4️⃣ إنشاء عميل تجريبي...');
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('customer123', 10);
      
      const insertResult = await client.query(`
        INSERT INTO customer_accounts (
          id, tracking_number, customer_number, password_hash, 
          customer_name, customer_email, customer_phone, 
          is_active, has_portal_access, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'MSKU4603728', 'GH-324737', $1,
          'Test Customer for Production', 'customer@example.com', '+1234567890',
          true, true, NOW(), NOW()
        ) RETURNING id, tracking_number, customer_number, customer_name
      `, [passwordHash]);
      
      console.log('✅ تم إنشاء عميل تجريبي:', insertResult.rows[0]);
    } else {
      console.log('✅ تم العثور على العملاء التاليين:');
      customersQuery.rows.forEach(customer => {
        console.log(`   - ID: ${customer.id}`);
        console.log(`   - رقم التتبع: ${customer.tracking_number}`);
        console.log(`   - رقم العميل: ${customer.customer_number}`);
        console.log(`   - اسم العميل: ${customer.customer_name}`);
        console.log(`   - نشط: ${customer.is_active}`);
        console.log(`   - له صلاحية الدخول: ${customer.has_portal_access}`);
        console.log('   ---');
      });
    }

    await client.end();

    // 5. Test production API
    console.log('\n5️⃣ اختبار API الإنتاج...');
    
    // Test server health
    try {
      const healthResponse = await axios.get(`${PRODUCTION_URL}/api/health`, {
        timeout: 10000
      });
      console.log('✅ السيرفر يعمل بشكل طبيعي');
    } catch (error) {
      console.log('❌ السيرفر لا يستجيب:', error.message);
      return;
    }

    // Test customer login with customer number
    console.log('\n6️⃣ اختبار تسجيل الدخول برقم العميل...');
    try {
      const loginResponse = await axios.post(`${PRODUCTION_URL}/api/customer-auth/login-customer-number`, {
        customerNumber: 'GH-324737',
        password: 'customer123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
    } catch (error) {
      console.log('❌ فشل تسجيل الدخول:');
      if (error.response) {
        console.log('   - كود الخطأ:', error.response.status);
        console.log('   - رسالة الخطأ:', error.response.data);
      } else {
        console.log('   - خطأ في الشبكة:', error.message);
      }
    }

    // Test customer login with tracking number
    console.log('\n7️⃣ اختبار تسجيل الدخول برقم التتبع...');
    try {
      const loginResponse = await axios.post(`${PRODUCTION_URL}/api/customer-auth/login`, {
        trackingNumber: 'MSKU4603728',
        password: 'customer123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
    } catch (error) {
      console.log('❌ فشل تسجيل الدخول:');
      if (error.response) {
        console.log('   - كود الخطأ:', error.response.status);
        console.log('   - رسالة الخطأ:', error.response.data);
      } else {
        console.log('   - خطأ في الشبكة:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// Run the test
testProductionLogin().catch(console.error);