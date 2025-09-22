const sqlite3 = require('sqlite3').verbose();

console.log('🗑️  بدء إفراغ قاعدة البيانات...');

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ خطأ:', err.message);
    return;
  }
  console.log('✅ تم الاتصال بقاعدة البيانات');
});

// قائمة الجداول
const tables = [
  'clients',
  'shipments', 
  'payment_records',
  'users',
  'ads',
  'settings',
  'customer_accounts',
  'vessels',
  'tracking_events',
  'notifications'
];

let completed = 0;

tables.forEach(table => {
  db.run(`DELETE FROM ${table}`, function(err) {
    if (err) {
      if (err.message.includes('no such table')) {
        console.log(`⚠️  الجدول ${table} غير موجود`);
      } else {
        console.error(`❌ خطأ في ${table}:`, err.message);
      }
    } else {
      console.log(`✅ تم حذف ${this.changes} صف من ${table}`);
    }
    
    completed++;
    if (completed === tables.length) {
      console.log('\n✅ تم إفراغ قاعدة البيانات بنجاح!');
      db.close();
    }
  });
});
