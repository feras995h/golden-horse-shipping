const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './database.sqlite');

console.log('🔍 فحص حالة قاعدة البيانات...');
console.log(`📁 مسار قاعدة البيانات: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
    process.exit(1);
  } else {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  }
});

// دالة لفحص محتوى جدول معين
function checkTableContent(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, rows) => {
      if (err) {
        if (err.message.includes('no such table')) {
          console.log(`⚠️  الجدول ${tableName} غير موجود`);
          resolve(0);
        } else {
          reject(err);
        }
      } else {
        const count = rows[0].count;
        console.log(`📊 الجدول ${tableName}: ${count} صف`);
        resolve(count);
      }
    });
  });
}

// دالة لفحص جميع الجداول
async function checkDatabaseStatus() {
  try {
    console.log('\n📋 فحص الجداول الموجودة...');
    
    // الحصول على قائمة الجداول
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
    
    console.log(`\n📋 الجداول الموجودة: ${tables.length}`);
    tables.forEach(table => console.log(`  - ${table}`));
    
    // فحص محتوى الجداول المهمة
    const importantTables = [
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
    
    console.log('\n📊 فحص محتوى الجداول المهمة...');
    let totalRecords = 0;
    
    for (const table of importantTables) {
      if (tables.includes(table)) {
        const count = await checkTableContent(table);
        totalRecords += count;
      }
    }
    
    console.log(`\n📈 إجمالي السجلات: ${totalRecords}`);
    
    if (totalRecords > 0) {
      console.log('\n⚠️  قاعدة البيانات تحتوي على بيانات!');
      console.log('💡 يمكنك تشغيل clear-database.js لإفراغها');
    } else {
      console.log('\n✅ قاعدة البيانات فارغة بالفعل');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ خطأ في إغلاق قاعدة البيانات:', err.message);
      } else {
        console.log('🔒 تم إغلاق قاعدة البيانات');
      }
      process.exit(0);
    });
  }
}

// تشغيل الفحص
checkDatabaseStatus();

