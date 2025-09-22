const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔄 تشغيل migration للبوابة الإلكترونية...\n');

const dbPath = path.join(__dirname, 'database.sqlite');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ قاعدة البيانات غير موجودة:', dbPath);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  }
  console.log('✅ تم الاتصال بقاعدة البيانات');
});

// Read migration file
const migrationPath = path.join(__dirname, 'migrations', 'add-portal-access-to-clients.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Execute migration
db.exec(migrationSQL, (err) => {
  if (err) {
    console.error('❌ خطأ في تشغيل migration:', err.message);
    db.close();
    process.exit(1);
  }
  
  console.log('✅ تم تشغيل migration بنجاح');
  
  // Verify the changes
  db.all("PRAGMA table_info(clients)", (err, rows) => {
    if (err) {
      console.error('❌ خطأ في فحص الجدول:', err.message);
    } else {
      console.log('\n📋 الحقول الجديدة في جدول العملاء:');
      const newFields = rows.filter(row => 
        ['tracking_number', 'password_hash', 'last_login', 'direct_access_token', 'token_expires_at', 'has_portal_access'].includes(row.name)
      );
      
      if (newFields.length > 0) {
        newFields.forEach(field => {
          console.log(`  ✅ ${field.name} (${field.type})`);
        });
      } else {
        console.log('  ⚠️  لم يتم العثور على الحقول الجديدة');
      }
    }
    
    db.close((err) => {
      if (err) {
        console.error('❌ خطأ في إغلاق قاعدة البيانات:', err.message);
      } else {
        console.log('\n🎉 تم الانتهاء من migration بنجاح!');
        console.log('\n📋 الخطوات التالية:');
        console.log('1. أعد تشغيل الخادم: npm run start:dev');
        console.log('2. اختبر إنشاء عميل جديد مع Portal Access');
        console.log('3. تحقق من قائمة العملاء');
      }
    });
  });
});
