const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// الاتصال بقاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 فحص قاعدة البيانات...\n');

// فحص عدد السجلات في كل جدول
const queries = [
  { name: 'العملاء', table: 'clients' },
  { name: 'الشحنات', table: 'shipments' },
  { name: 'الإعلانات', table: 'ads' },
  { name: 'الإعدادات', table: 'settings' },
  { name: 'المستخدمين', table: 'users' }
];

let completed = 0;
const results = {};

queries.forEach(({ name, table }) => {
  db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
    if (err) {
      console.error(`❌ خطأ في فحص جدول ${name}:`, err.message);
      results[name] = 'خطأ';
    } else {
      results[name] = row.count;
      console.log(`📊 ${name}: ${row.count} سجل`);
    }
    
    completed++;
    if (completed === queries.length) {
      console.log('\n📈 ملخص قاعدة البيانات:');
      console.log('================================');
      Object.entries(results).forEach(([name, count]) => {
        const status = count === 'خطأ' ? '❌' : count > 0 ? '✅' : '⚠️';
        console.log(`${status} ${name}: ${count}`);
      });
      
      // فحص بعض البيانات التفصيلية
      console.log('\n🔍 فحص تفصيلي:');
      console.log('================');
      
      // فحص المستخدم الإداري
      db.get("SELECT username, email, role FROM users WHERE role = 'admin'", (err, row) => {
        if (err) {
          console.error('❌ خطأ في فحص المستخدم الإداري:', err.message);
        } else if (row) {
          console.log(`✅ المستخدم الإداري: ${row.username} (${row.email})`);
        } else {
          console.log('⚠️ لا يوجد مستخدم إداري');
        }
        
        // فحص الإعدادات المهمة
        db.get("SELECT value FROM settings WHERE key = 'site_name'", (err, row) => {
          if (err) {
            console.error('❌ خطأ في فحص إعدادات الموقع:', err.message);
          } else if (row) {
            console.log(`✅ اسم الموقع: ${row.value}`);
          } else {
            console.log('⚠️ لم يتم العثور على اسم الموقع');
          }
          
          // إغلاق الاتصال
          db.close((err) => {
            if (err) {
              console.error('خطأ في إغلاق قاعدة البيانات:', err.message);
            } else {
              console.log('\n🎉 تم إنهاء فحص قاعدة البيانات بنجاح!');
            }
          });
        });
      });
    }
  });
});
