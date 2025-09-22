const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// قراءة ملف SQL
const seedDataPath = path.join(__dirname, 'seed-data.sql');
const seedData = fs.readFileSync(seedDataPath, 'utf8');

// الاتصال بقاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('بدء تطبيق البيانات التجريبية...');

// تقسيم الاستعلامات
const queries = seedData.split(';').filter(query => query.trim().length > 0);

// تطبيق كل استعلام
let completed = 0;
const total = queries.length;

queries.forEach((query, index) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    db.run(trimmedQuery, function(err) {
      if (err) {
        console.error(`خطأ في الاستعلام ${index + 1}:`, err.message);
        console.error('الاستعلام:', trimmedQuery.substring(0, 100) + '...');
      } else {
        console.log(`✓ تم تطبيق الاستعلام ${index + 1}/${total}`);
      }
      
      completed++;
      if (completed === total) {
        console.log('\n✅ تم تطبيق جميع البيانات التجريبية بنجاح!');
        
        // التحقق من البيانات
        db.get("SELECT COUNT(*) as count FROM clients", (err, row) => {
          if (!err) {
            console.log(`📊 عدد العملاء: ${row.count}`);
          }
        });
        
        db.get("SELECT COUNT(*) as count FROM shipments", (err, row) => {
          if (!err) {
            console.log(`📦 عدد الشحنات: ${row.count}`);
          }
        });
        
        db.get("SELECT COUNT(*) as count FROM ads", (err, row) => {
          if (!err) {
            console.log(`📢 عدد الإعلانات: ${row.count}`);
          }
        });
        
        db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
          if (!err) {
            console.log(`⚙️ عدد الإعدادات: ${row.count}`);
          }
          
          // إغلاق الاتصال
          db.close((err) => {
            if (err) {
              console.error('خطأ في إغلاق قاعدة البيانات:', err.message);
            } else {
              console.log('\n🎉 تم إنهاء العملية بنجاح!');
            }
          });
        });
      }
    });
  }
});
