const axios = require('axios');

// Local server with production settings
const LOCAL_URL = 'http://localhost:3001';

async function testLocalProductionLogin() {
  console.log('🔍 اختبار تسجيل الدخول على السيرفر المحلي بإعدادات الإنتاج...\n');

  try {
    // Test health endpoint
    console.log('1️⃣ اختبار /api/health...');
    const healthResponse = await axios.get(`${LOCAL_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ السيرفر يعمل بشكل طبيعي');
    console.log('📊 الاستجابة:', healthResponse.data);

    // Test customer login with customer number
    console.log('\n2️⃣ اختبار تسجيل الدخول برقم العميل...');
    try {
      const loginResponse = await axios.post(`${LOCAL_URL}/api/customer-auth/login-customer-number`, {
        customerNumber: 'GH-249109',
        password: 'customer123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('📊 بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
    } catch (loginError) {
      console.log('❌ فشل تسجيل الدخول برقم العميل:');
      if (loginError.response) {
        console.log('   - كود الخطأ:', loginError.response.status);
        console.log('   - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
      } else {
        console.log('   - خطأ في الشبكة:', loginError.message);
      }
    }

    // Test customer login with tracking number
    console.log('\n3️⃣ اختبار تسجيل الدخول برقم التتبع...');
    try {
      const loginResponse = await axios.post(`${LOCAL_URL}/api/customer-auth/login`, {
        trackingNumber: 'TESTJCHWKXQ5',
        password: 'customer123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('📊 بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
    } catch (loginError) {
      console.log('❌ فشل تسجيل الدخول برقم التتبع:');
      if (loginError.response) {
        console.log('   - كود الخطأ:', loginError.response.status);
        console.log('   - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
      } else {
        console.log('   - خطأ في الشبكة:', loginError.message);
      }
    }

    // Test with wrong credentials
    console.log('\n4️⃣ اختبار بيانات خاطئة...');
    try {
      const loginResponse = await axios.post(`${LOCAL_URL}/api/customer-auth/login-customer-number`, {
        customerNumber: 'GH-249109',
        password: 'wrongpassword'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('⚠️ تم تسجيل الدخول بكلمة مرور خاطئة! هذا خطأ أمني');
    } catch (loginError) {
      console.log('✅ تم رفض كلمة المرور الخاطئة بشكل صحيح');
      if (loginError.response) {
        console.log('   - كود الخطأ:', loginError.response.status);
        console.log('   - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
      }
    }

    // Test with non-existent customer
    console.log('\n5️⃣ اختبار عميل غير موجود...');
    try {
      const loginResponse = await axios.post(`${LOCAL_URL}/api/customer-auth/login-customer-number`, {
        customerNumber: 'GH-999999',
        password: 'customer123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('⚠️ تم تسجيل الدخول لعميل غير موجود! هذا خطأ أمني');
    } catch (loginError) {
      console.log('✅ تم رفض العميل غير الموجود بشكل صحيح');
      if (loginError.response) {
        console.log('   - كود الخطأ:', loginError.response.status);
        console.log('   - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// Run the test
testLocalProductionLogin().catch(console.error);