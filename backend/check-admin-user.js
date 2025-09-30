const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// الاتصال بقاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function checkAdminUser() {
  console.log('🔍 فحص المستخدم الإداري في قاعدة البيانات...\n');
  
  // البحث عن المستخدمين الإداريين
  db.all("SELECT id, username, email, password, role FROM users WHERE role = 'admin'", [], (err, rows) => {
    if (err) {
      console.error('❌ خطأ في قراءة قاعدة البيانات:', err.message);
      return;
    }
    
    if (rows.length === 0) {
      console.log('⚠️  لا يوجد مستخدمين إداريين في قاعدة البيانات');
      console.log('💡 يرجى تشغيل: node create-admin.js');
    } else {
      console.log(`✅ تم العثور على ${rows.length} مستخدم إداري:`);
      
      rows.forEach(async (row, index) => {
        console.log(`\n--- المستخدم ${index + 1} ---`);
        console.log(`🆔 المعرف: ${row.id}`);
        console.log(`👤 اسم المستخدم: ${row.username}`);
        console.log(`📧 البريد الإلكتروني: ${row.email}`);
        console.log(`🔐 كلمة المرور المشفرة: ${row.password.substring(0, 20)}...`);
        console.log(`👑 الدور: ${row.role}`);
        
        // اختبار كلمة المرور
        try {
          const isValidPassword = await bcrypt.compare('admin123', row.password);
          console.log(`🔑 كلمة المرور 'admin123' صحيحة: ${isValidPassword ? '✅ نعم' : '❌ لا'}`);
          
          if (!isValidPassword) {
            console.log('🔧 محاولة إعادة تعيين كلمة المرور...');
            const newHashedPassword = await bcrypt.hash('admin123', 10);
            
            db.run('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, row.id], function(updateErr) {
              if (updateErr) {
                console.error('❌ خطأ في تحديث كلمة المرور:', updateErr.message);
              } else {
                console.log('✅ تم تحديث كلمة المرور بنجاح!');
              }
            });
          }
        } catch (bcryptErr) {
          console.error('❌ خطأ في فحص كلمة المرور:', bcryptErr.message);
        }
      });
    }
    
    // إغلاق الاتصال
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('خطأ في إغلاق قاعدة البيانات:', err.message);
        } else {
          console.log('\n🎉 تم إنهاء الفحص بنجاح!');
        }
      });
    }, 2000);
  });
}

checkAdminUser().catch(console.error);