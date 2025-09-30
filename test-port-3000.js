const net = require('net');

console.log('🔍 فحص المنفذ 3000...');

const client = new net.Socket();

client.setTimeout(5000);

client.connect(3000, 'localhost', () => {
  console.log('✅ المنفذ 3000 مفتوح ومتاح!');
  client.destroy();
});

client.on('error', (err) => {
  console.log(`❌ خطأ في الاتصال بالمنفذ 3000: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.log('🔴 المنفذ 3000 مغلق أو لا يوجد خادم يعمل عليه');
  }
});

client.on('timeout', () => {
  console.log('⏰ انتهت مهلة الاتصال بالمنفذ 3000');
  client.destroy();
});

client.on('close', () => {
  console.log('🔚 تم إغلاق الاتصال');
});