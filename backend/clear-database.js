const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './database.sqlite');

console.log('🗑️  بدء إفراغ قاعدة البيانات...');
console.log(`📁 مسار قاعدة البيانات: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
    process.exit(1);
  } else {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  }
});

// قائمة الجداول التي يجب إفراغها (باستثناء الجداول النظامية)
const tablesToClear = [
  'clients',
  'shipments', 
  'payment_records',
  'users',
  'ads',
  'settings',
  'customer_accounts', // إذا كان موجود
  'vessels', // إذا كان موجود
  'tracking_events', // إذا كان موجود
  'notifications' // إذا كان موجود
];

// دالة لإفراغ جدول معين
function clearTable(tableName) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ${tableName}`, function(err) {
      if (err) {
        // إذا كان الجدول غير موجود، لا نعتبره خطأ
        if (err.message.includes('no such table')) {
          console.log(`⚠️  الجدول ${tableName} غير موجود - تم تخطيه`);
          resolve();
        } else {
          console.error(`❌ خطأ في إفراغ الجدول ${tableName}:`, err.message);
          reject(err);
        }
      } else {
        console.log(`✅ تم إفراغ الجدول ${tableName} - ${this.changes} صف تم حذفه`);
        resolve();
      }
    });
  });
}

// دالة لإعادة تعيين AUTO_INCREMENT
function resetAutoIncrement(tableName) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`, function(err) {
      if (err) {
        // إذا لم يكن هناك AUTO_INCREMENT، لا نعتبره خطأ
        resolve();
      } else {
        console.log(`✅ تم إعادة تعيين AUTO_INCREMENT للجدول ${tableName}`);
        resolve();
      }
    });
  });
}

// دالة رئيسية لإفراغ قاعدة البيانات
async function clearDatabase() {
  try {
    console.log('\n📋 بدء إفراغ الجداول...');
    
    // إفراغ جميع الجداول
    for (const table of tablesToClear) {
      await clearTable(table);
    }
    
    console.log('\n🔄 إعادة تعيين AUTO_INCREMENT...');
    
    // إعادة تعيين AUTO_INCREMENT للجداول
    for (const table of tablesToClear) {
      await resetAutoIncrement(table);
    }
    
    console.log('\n✅ تم إفراغ قاعدة البيانات بنجاح!');
    console.log('📊 قاعدة البيانات الآن فارغة وجاهزة للاستخدام');
    
  } catch (error) {
    console.error('❌ خطأ في إفراغ قاعدة البيانات:', error);
    process.exit(1);
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

// تشغيل السكريبت
clearDatabase();

