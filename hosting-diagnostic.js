#!/usr/bin/env node

/**
 * سكريبت تشخيص مشاكل الاستضافة
 * Hosting Environment Diagnostic Script
 */

const { Client } = require('pg');
const https = require('https');
const http = require('http');

// إعدادات قاعدة البيانات
// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'golden_horse_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
};

// إعدادات الخادم
// Server configuration
const serverConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  frontendUrl: process.env.NEXT_PUBLIC_VPS_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

class HostingDiagnostic {
  constructor() {
    this.results = {
      database: { status: 'unknown', details: [] },
      environment: { status: 'unknown', details: [] },
      api: { status: 'unknown', details: [] },
      users: { status: 'unknown', details: [] },
      overall: 'unknown'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const symbols = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    
    console.log(`${symbols[type]} [${timestamp}] ${message}`);
  }

  async checkDatabase() {
    this.log('فحص الاتصال بقاعدة البيانات...', 'info');
    this.log('Checking database connection...', 'info');
    
    const client = new Client(dbConfig);
    
    try {
      await client.connect();
      this.results.database.status = 'connected';
      this.results.database.details.push('Database connection successful');
      this.log('تم الاتصال بقاعدة البيانات بنجاح', 'success');
      
      // فحص الجداول
      // Check tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      this.results.database.details.push(`Found ${tables.rows.length} tables`);
      this.log(`تم العثور على ${tables.rows.length} جدول`, 'success');
      
      // فحص جدول المستخدمين
      // Check users table
      try {
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        const adminCount = await client.query("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'");
        
        this.results.database.details.push(`Total users: ${userCount.rows[0].count}`);
        this.results.database.details.push(`Admin users: ${adminCount.rows[0].count}`);
        
        this.log(`إجمالي المستخدمين: ${userCount.rows[0].count}`, 'info');
        this.log(`المستخدمين الإداريين: ${adminCount.rows[0].count}`, 'info');
        
        if (parseInt(adminCount.rows[0].count) === 0) {
          this.results.users.status = 'no_admin';
          this.results.users.details.push('No admin users found');
          this.log('لا يوجد مستخدمين إداريين!', 'warning');
        } else {
          this.results.users.status = 'admin_exists';
          this.results.users.details.push('Admin users found');
          this.log('تم العثور على مستخدمين إداريين', 'success');
        }
        
      } catch (error) {
        this.results.database.details.push(`Users table error: ${error.message}`);
        this.log(`خطأ في جدول المستخدمين: ${error.message}`, 'error');
      }
      
    } catch (error) {
      this.results.database.status = 'error';
      this.results.database.details.push(`Connection failed: ${error.message}`);
      this.log(`فشل الاتصال بقاعدة البيانات: ${error.message}`, 'error');
    } finally {
      await client.end();
    }
  }

  checkEnvironmentVariables() {
    this.log('فحص متغيرات البيئة...', 'info');
    this.log('Checking environment variables...', 'info');
    
    const requiredVars = [
      'DATABASE_HOST',
      'DATABASE_PORT', 
      'DATABASE_NAME',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'JWT_SECRET',
      'CORS_ORIGIN',
      'NEXT_PUBLIC_API_URL'
    ];
    
    const missingVars = [];
    const presentVars = [];
    
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        presentVars.push(varName);
        this.log(`✓ ${varName}: ${varName.includes('PASSWORD') || varName.includes('SECRET') ? '[HIDDEN]' : process.env[varName]}`, 'success');
      } else {
        missingVars.push(varName);
        this.log(`✗ ${varName}: غير موجود / Not found`, 'warning');
      }
    });
    
    this.results.environment.details.push(`Present variables: ${presentVars.length}/${requiredVars.length}`);
    this.results.environment.details.push(`Missing variables: ${missingVars.join(', ')}`);
    
    if (missingVars.length === 0) {
      this.results.environment.status = 'complete';
      this.log('جميع متغيرات البيئة موجودة', 'success');
    } else {
      this.results.environment.status = 'incomplete';
      this.log(`متغيرات مفقودة: ${missingVars.join(', ')}`, 'warning');
    }
  }

  async checkApiEndpoint() {
    this.log('فحص نقطة نهاية API...', 'info');
    this.log('Checking API endpoint...', 'info');
    
    const apiUrl = serverConfig.apiUrl.replace('/api', '') + '/api/health';
    
    return new Promise((resolve) => {
      const protocol = apiUrl.startsWith('https') ? https : http;
      
      const req = protocol.get(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            this.results.api.status = 'healthy';
            this.results.api.details.push(`API responding with status ${res.statusCode}`);
            this.log(`API يستجيب بحالة ${res.statusCode}`, 'success');
          } else {
            this.results.api.status = 'unhealthy';
            this.results.api.details.push(`API returned status ${res.statusCode}`);
            this.log(`API أرجع حالة ${res.statusCode}`, 'warning');
          }
          resolve();
        });
      });
      
      req.on('error', (error) => {
        this.results.api.status = 'error';
        this.results.api.details.push(`API connection failed: ${error.message}`);
        this.log(`فشل الاتصال بـ API: ${error.message}`, 'error');
        resolve();
      });
      
      req.setTimeout(10000, () => {
        this.results.api.status = 'timeout';
        this.results.api.details.push('API request timed out');
        this.log('انتهت مهلة طلب API', 'warning');
        req.destroy();
        resolve();
      });
    });
  }

  generateReport() {
    this.log('إنشاء تقرير التشخيص...', 'info');
    this.log('Generating diagnostic report...', 'info');
    
    // تحديد الحالة العامة
    // Determine overall status
    const statuses = [
      this.results.database.status,
      this.results.environment.status,
      this.results.api.status,
      this.results.users.status
    ];
    
    if (statuses.every(s => ['connected', 'complete', 'healthy', 'admin_exists'].includes(s))) {
      this.results.overall = 'healthy';
    } else if (statuses.some(s => ['error', 'timeout'].includes(s))) {
      this.results.overall = 'critical';
    } else {
      this.results.overall = 'warning';
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 تقرير التشخيص النهائي / Final Diagnostic Report');
    console.log('═'.repeat(60));
    
    console.log(`\n🏥 الحالة العامة / Overall Status: ${this.getStatusEmoji(this.results.overall)} ${this.results.overall.toUpperCase()}`);
    
    console.log('\n📋 تفاصيل الفحص / Check Details:');
    console.log('━'.repeat(40));
    
    Object.entries(this.results).forEach(([key, result]) => {
      if (key === 'overall') return;
      
      console.log(`\n${this.getCategoryEmoji(key)} ${key.toUpperCase()}:`);
      console.log(`   Status: ${this.getStatusEmoji(result.status)} ${result.status}`);
      
      if (result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   • ${detail}`);
        });
      }
    });
    
    console.log('\n' + '═'.repeat(60));
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('💡 التوصيات / Recommendations:');
    console.log('━'.repeat(40));
    
    if (this.results.users.status === 'no_admin') {
      console.log('🔧 إنشاء مستخدم إداري:');
      console.log('   node create-admin-hosting.js');
      console.log('   أو / or:');
      console.log('   docker exec -it golden-horse-backend node create-admin.js');
    }
    
    if (this.results.database.status === 'error') {
      console.log('🔧 فحص إعدادات قاعدة البيانات:');
      console.log('   - تحقق من متغيرات البيئة');
      console.log('   - تأكد من تشغيل خدمة قاعدة البيانات');
      console.log('   - فحص إعدادات الشبكة');
    }
    
    if (this.results.api.status !== 'healthy') {
      console.log('🔧 فحص خدمة API:');
      console.log('   - تأكد من تشغيل الخادم الخلفي');
      console.log('   - فحص إعدادات المنافذ');
      console.log('   - تحقق من إعدادات CORS');
    }
    
    if (this.results.environment.status === 'incomplete') {
      console.log('🔧 إكمال متغيرات البيئة:');
      console.log('   - نسخ .env.example إلى .env');
      console.log('   - تحديث القيم المطلوبة');
      console.log('   - إعادة تشغيل الخدمات');
    }
    
    console.log('\n🆘 للدعم الفوري / For immediate support:');
    console.log('   راجع ملف: HOSTING_FIX_GUIDE.md');
    console.log('   Check file: HOSTING_FIX_GUIDE.md');
  }

  getStatusEmoji(status) {
    const emojis = {
      'connected': '✅',
      'complete': '✅',
      'healthy': '✅',
      'admin_exists': '✅',
      'no_admin': '⚠️',
      'incomplete': '⚠️',
      'unhealthy': '⚠️',
      'warning': '⚠️',
      'error': '❌',
      'timeout': '❌',
      'critical': '❌',
      'unknown': '❓'
    };
    
    return emojis[status] || '❓';
  }

  getCategoryEmoji(category) {
    const emojis = {
      'database': '🗄️',
      'environment': '🌍',
      'api': '🔌',
      'users': '👥'
    };
    
    return emojis[category] || '📋';
  }

  async runDiagnostic() {
    console.log('🚀 بدء تشخيص بيئة الاستضافة...');
    console.log('🚀 Starting hosting environment diagnostic...');
    console.log('═'.repeat(60));
    
    try {
      // فحص متغيرات البيئة
      this.checkEnvironmentVariables();
      
      // فحص قاعدة البيانات
      await this.checkDatabase();
      
      // فحص API
      await this.checkApiEndpoint();
      
      // إنشاء التقرير
      this.generateReport();
      
    } catch (error) {
      this.log(`خطأ في التشخيص: ${error.message}`, 'error');
      console.error('Diagnostic error:', error);
    }
  }
}

// تشغيل التشخيص
// Run diagnostic
if (require.main === module) {
  const diagnostic = new HostingDiagnostic();
  diagnostic.runDiagnostic()
    .then(() => {
      console.log('\n🏁 انتهى التشخيص');
      console.log('🏁 Diagnostic completed');
    })
    .catch((error) => {
      console.error('💥 فشل التشخيص:', error);
      console.error('💥 Diagnostic failed:', error);
      process.exit(1);
    });
}

module.exports = HostingDiagnostic;