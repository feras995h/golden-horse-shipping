const { Client } = require('pg');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: 'backend/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  try {
    console.log('🔐 إنشاء مستخدم إداري في PostgreSQL...');

    await client.connect();

    // Check if admin user exists
    const existingUser = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (existingUser.rows.length > 0) {
      console.log('⚠️ المستخدم الإداري موجود بالفعل');
      const user = existingUser.rows[0];
      console.log('🔑 تحديث كلمة المرور...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      console.log('✅ تم تحديث كلمة المرور للمستخدم الإداري');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminData = {
      id: '990e8400-e29b-41d4-a716-446655440001',
      username: 'admin',
      email: 'admin@goldenhorse-shipping.com',
      password: hashedPassword,
      full_name: 'مدير النظام',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    };

    await client.query(`
      INSERT INTO users (id, username, email, password, full_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      adminData.id, adminData.username, adminData.email, adminData.password,
      adminData.full_name, adminData.role, adminData.created_at, adminData.updated_at
    ]);

    console.log('✅ تم إنشاء المستخدم الإداري بنجاح!');
    console.log('📧 البريد الإلكتروني:', adminData.email);
    console.log('🔑 كلمة المرور:', 'admin123');
    console.log('👤 اسم المستخدم:', adminData.username);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الإداري:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
