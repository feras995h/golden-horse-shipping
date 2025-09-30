const http = require('http');

console.log('🔍 اختبار نقطة نهاية الصحة...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ استجابة الخادم: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 البيانات المستلمة:', data);
    
    // اختبار تسجيل الدخول
    console.log('\n🔐 اختبار تسجيل الدخول...');
    testLogin();
  });
});

req.on('error', (err) => {
  console.log(`❌ خطأ في الاتصال: ${err.message}`);
});

req.on('timeout', () => {
  console.log('⏰ انتهت مهلة الاتصال');
  req.destroy();
});

req.end();

function testLogin() {
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    },
    timeout: 5000
  };

  const loginReq = http.request(loginOptions, (res) => {
    console.log(`🔐 استجابة تسجيل الدخول: ${res.statusCode}`);
    
    let loginResponse = '';
    res.on('data', (chunk) => {
      loginResponse += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 استجابة تسجيل الدخول:', loginResponse);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ تم تسجيل الدخول بنجاح!');
      } else {
        console.log('❌ فشل في تسجيل الدخول');
      }
    });
  });

  loginReq.on('error', (err) => {
    console.log(`❌ خطأ في تسجيل الدخول: ${err.message}`);
  });

  loginReq.on('timeout', () => {
    console.log('⏰ انتهت مهلة تسجيل الدخول');
    loginReq.destroy();
  });

  loginReq.write(loginData);
  loginReq.end();
}