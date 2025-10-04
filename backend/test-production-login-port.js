const axios = require('axios');

// Production server configuration - try different ports
const PRODUCTION_URLS = [
  'http://72.60.92.146:3001',  // Backend port
  'http://72.60.92.146:3000',  // Frontend port
  'http://72.60.92.146',       // Default port 80
];

async function testProductionAPI() {
  console.log('🔍 اختبار API الإنتاج على منافذ مختلفة...\n');

  for (const baseUrl of PRODUCTION_URLS) {
    console.log(`\n🌐 اختبار: ${baseUrl}`);
    
    try {
      // Test health endpoint
      console.log('   - اختبار /api/health...');
      const healthResponse = await axios.get(`${baseUrl}/api/health`, {
        timeout: 10000
      });
      console.log('   ✅ السيرفر يعمل بشكل طبيعي');
      console.log('   📊 الاستجابة:', healthResponse.data);

      // Test customer login with customer number
      console.log('   - اختبار تسجيل الدخول برقم العميل...');
      try {
        const loginResponse = await axios.post(`${baseUrl}/api/customer-auth/login-customer-number`, {
          customerNumber: 'GH-249109',
          password: 'customer123'
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('   ✅ تم تسجيل الدخول بنجاح!');
        console.log('   📊 بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
      } catch (loginError) {
        console.log('   ❌ فشل تسجيل الدخول:');
        if (loginError.response) {
          console.log('     - كود الخطأ:', loginError.response.status);
          console.log('     - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
        } else {
          console.log('     - خطأ في الشبكة:', loginError.message);
        }
      }

      // Test customer login with tracking number
      console.log('   - اختبار تسجيل الدخول برقم التتبع...');
      try {
        const loginResponse = await axios.post(`${baseUrl}/api/customer-auth/login`, {
          trackingNumber: 'TESTJCHWKXQ5',
          password: 'customer123'
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('   ✅ تم تسجيل الدخول بنجاح!');
        console.log('   📊 بيانات الاستجابة:', JSON.stringify(loginResponse.data, null, 2));
      } catch (loginError) {
        console.log('   ❌ فشل تسجيل الدخول:');
        if (loginError.response) {
          console.log('     - كود الخطأ:', loginError.response.status);
          console.log('     - رسالة الخطأ:', JSON.stringify(loginError.response.data, null, 2));
        } else {
          console.log('     - خطأ في الشبكة:', loginError.message);
        }
      }

      // If we reach here, this URL works
      console.log(`\n🎉 العنوان الصحيح للـ API: ${baseUrl}`);
      break;

    } catch (error) {
      console.log('   ❌ السيرفر لا يستجيب على هذا المنفذ');
      if (error.response) {
        console.log('     - كود الخطأ:', error.response.status);
      } else {
        console.log('     - خطأ في الشبكة:', error.message);
      }
    }
  }
}

// Test different customer credentials from the database
async function testWithDifferentCredentials() {
  console.log('\n\n🔐 اختبار بيانات اعتماد مختلفة...\n');
  
  const testCredentials = [
    { customerNumber: 'GH-249109', trackingNumber: 'TESTJCHWKXQ5', password: 'customer123' },
    { customerNumber: 'GH-485194', trackingNumber: 'TEST1759229245657', password: 'customer123' },
    { customerNumber: 'GH-971289', trackingNumber: 'TEST1759229110913', password: 'customer123' }
  ];

  const baseUrl = 'http://72.60.92.146:3001'; // Assuming this is the correct URL

  for (const creds of testCredentials) {
    console.log(`\n👤 اختبار العميل: ${creds.customerNumber}`);
    
    // Test with customer number
    try {
      const response = await axios.post(`${baseUrl}/api/customer-auth/login-customer-number`, {
        customerNumber: creds.customerNumber,
        password: creds.password
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('   ✅ تسجيل الدخول برقم العميل نجح');
    } catch (error) {
      console.log('   ❌ تسجيل الدخول برقم العميل فشل');
      if (error.response) {
        console.log('     - كود الخطأ:', error.response.status);
        console.log('     - رسالة الخطأ:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test with tracking number
    try {
      const response = await axios.post(`${baseUrl}/api/customer-auth/login`, {
        trackingNumber: creds.trackingNumber,
        password: creds.password
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('   ✅ تسجيل الدخول برقم التتبع نجح');
    } catch (error) {
      console.log('   ❌ تسجيل الدخول برقم التتبع فشل');
      if (error.response) {
        console.log('     - كود الخطأ:', error.response.status);
        console.log('     - رسالة الخطأ:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run the tests
async function runAllTests() {
  await testProductionAPI();
  await testWithDifferentCredentials();
}

runAllTests().catch(console.error);