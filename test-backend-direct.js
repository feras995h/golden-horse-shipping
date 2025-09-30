const http = require('http');

console.log('🔍 فحص الخادم الخلفي على المنفذ 3000...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ الخادم يعمل! رمز الاستجابة: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 استجابة الخادم:', data);
  });
});

req.on('error', (err) => {
  console.log(`❌ خطأ في الاتصال بالخادم: ${err.message}`);
});

req.on('timeout', () => {
  console.log('⏰ انتهت مهلة الاتصال بالخادم');
  req.destroy();
});

req.end();