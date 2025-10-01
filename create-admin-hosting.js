#!/usr/bin/env node

/**
 * سكريبت إنشاء مستخدم إداري للاستضافة
 * Admin User Creation Script for Hosting
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

// إعدادات قاعدة البيانات من متغيرات البيئة
// Database configuration from environment variables
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'golden_horse_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
};

// بيانات المستخدم الإداري
// Admin user data
const adminData = {
  username: 'admin',
  email: 'admin@goldenhorse-shipping.com',
  password: 'admin123',
  role: 'ADMIN'
};

async function createAdminUser() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    console.log('🔗 Connecting to database...');
    
    await client.connect();
    
    console.log('✅ تم الاتصال بنجاح');
    console.log('✅ Connected successfully');
    
    // فحص وجود المستخدم
    // Check if user exists
    console.log('🔍 فحص وجود المستخدم الإداري...');
    console.log('🔍 Checking if admin user exists...');
    
    const existingUser = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [adminData.username, adminData.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  المستخدم الإداري موجود بالفعل');
      console.log('⚠️  Admin user already exists');
      
      // تحديث كلمة المرور
      // Update password
      console.log('🔄 تحديث كلمة المرور...');
      console.log('🔄 Updating password...');
      
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      await client.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE username = $2',
        [hashedPassword, adminData.username]
      );
      
      console.log('✅ تم تحديث كلمة المرور بنجاح');
      console.log('✅ Password updated successfully');
    } else {
      // إنشاء مستخدم جديد
      // Create new user
      console.log('👤 إنشاء مستخدم إداري جديد...');
      console.log('👤 Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const userId = require('crypto').randomUUID();
      
      await client.query(`
        INSERT INTO users (id, username, email, password, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [userId, adminData.username, adminData.email, hashedPassword, adminData.role]);
      
      console.log('✅ تم إنشاء المستخدم الإداري بنجاح');
      console.log('✅ Admin user created successfully');
    }
    
    // عرض بيانات تسجيل الدخول
    // Display login credentials
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 اسم المستخدم / Username: ${adminData.username}`);
    console.log(`🔑 كلمة المرور / Password: ${adminData.password}`);
    console.log(`📧 البريد الإلكتروني / Email: ${adminData.email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // اختبار تسجيل الدخول
    // Test login
    console.log('\n🧪 اختبار تسجيل الدخول...');
    console.log('🧪 Testing login...');
    
    const testUser = await client.query(
      'SELECT id, username, email, role FROM users WHERE username = $1',
      [adminData.username]
    );
    
    if (testUser.rows.length > 0) {
      const user = testUser.rows[0];
      console.log('✅ تم العثور على المستخدم:');
      console.log('✅ User found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الإداري:');
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    
    // معلومات إضافية للتشخيص
    // Additional diagnostic information
    console.log('\n🔍 معلومات التشخيص:');
    console.log('🔍 Diagnostic Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Database Config:');
    console.log(`  Host: ${dbConfig.host}`);
    console.log(`  Port: ${dbConfig.port}`);
    console.log(`  Database: ${dbConfig.database}`);
    console.log(`  User: ${dbConfig.user}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
    console.log('🔌 Database connection closed');
  }
}

// تشغيل السكريبت
// Run script
if (require.main === module) {
  console.log('🚀 بدء إنشاء المستخدم الإداري للاستضافة...');
  console.log('🚀 Starting admin user creation for hosting...');
  console.log('═══════════════════════════════════════════════════════════');
  
  createAdminUser()
    .then(() => {
      console.log('\n🎉 تم إنهاء العملية بنجاح!');
      console.log('🎉 Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 فشل في إنهاء العملية:');
      console.error('💥 Process failed:');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };