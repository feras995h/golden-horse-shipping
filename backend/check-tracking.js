const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// الاتصال بقاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 فحص أرقام التتبع المتاحة...\n');

// الحصول على أرقام التتبع
db.all("SELECT tracking_number, status, client_id FROM shipments LIMIT 5", (err, rows) => {
  if (err) {
    console.error('❌ خطأ في استعلام قاعدة البيانات:', err.message);
  } else {
    console.log('📦 أرقام التتبع المتاحة:');
    console.log('==========================');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. رقم التتبع: ${row.tracking_number}`);
      console.log(`   الحالة: ${row.status}`);
      console.log(`   رقم العميل: ${row.client_id}`);
      console.log('   ---');
    });
  }
  
  // إغلاق الاتصال
  db.close((err) => {
    if (err) {
      console.error('خطأ في إغلاق قاعدة البيانات:', err.message);
    } else {
      console.log('\n🎉 تم إنهاء فحص أرقام التتبع!');
    }
  });
});
