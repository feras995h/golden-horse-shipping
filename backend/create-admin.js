const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// الاتصال بقاعدة البيانات
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  console.log('إنشاء مستخدم إداري...');
  
  // تشفير كلمة المرور
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const adminData = {
    id: '990e8400-e29b-41d4-a716-446655440001',
    username: 'admin',
    email: 'admin@goldenhorse-shipping.com',
    password: hashedPassword,
    fullName: 'مدير النظام',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // حذف المستخدم الإداري إذا كان موجوداً
  db.run('DELETE FROM users WHERE username = ? OR email = ?', [adminData.username, adminData.email], function(err) {
    if (err) {
      console.error('خطأ في حذف المستخدم الموجود:', err.message);
    }
    
    // إضافة المستخدم الإداري الجديد
    const insertQuery = `
      INSERT INTO users (id, username, email, password, full_name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      adminData.id,
      adminData.username,
      adminData.email,
      adminData.password,
      adminData.fullName,
      adminData.role,
      adminData.createdAt,
      adminData.updatedAt
    ], function(err) {
      if (err) {
        console.error('خطأ في إنشاء المستخدم الإداري:', err.message);
      } else {
        console.log('✅ تم إنشاء المستخدم الإداري بنجاح!');
        console.log('📧 البريد الإلكتروني:', adminData.email);
        console.log('🔑 كلمة المرور:', password);
        console.log('👤 اسم المستخدم:', adminData.username);
      }
      
      // إغلاق الاتصال
      db.close((err) => {
        if (err) {
          console.error('خطأ في إغلاق قاعدة البيانات:', err.message);
        } else {
          console.log('🎉 تم إنهاء العملية بنجاح!');
        }
      });
    });
  });
}

createAdmin().catch(console.error);
