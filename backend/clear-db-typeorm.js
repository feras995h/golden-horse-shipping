const { DataSource } = require('typeorm');
const path = require('path');

// إعدادات قاعدة البيانات
const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(__dirname, './database.sqlite'),
  entities: [
    path.resolve(__dirname, './dist/entities/*.js')
  ],
  synchronize: false,
  logging: false
});

async function clearDatabase() {
  try {
    console.log('🗑️  بدء إفراغ قاعدة البيانات...');
    
    // الاتصال بقاعدة البيانات
    await AppDataSource.initialize();
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // قائمة الجداول
    const tables = [
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
    
    // إفراغ كل جدول
    for (const table of tables) {
      try {
        const result = await AppDataSource.query(`DELETE FROM ${table}`);
        console.log(`✅ تم حذف البيانات من ${table}`);
      } catch (error) {
        if (error.message.includes('no such table')) {
          console.log(`⚠️  الجدول ${table} غير موجود - تم تخطيه`);
        } else {
          console.error(`❌ خطأ في ${table}:`, error.message);
        }
      }
    }
    
    // إعادة تعيين AUTO_INCREMENT
    for (const table of tables) {
      try {
        await AppDataSource.query(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
        console.log(`✅ تم إعادة تعيين AUTO_INCREMENT للجدول ${table}`);
      } catch (error) {
        // تجاهل الأخطاء
      }
    }
    
    console.log('\n✅ تم إفراغ قاعدة البيانات بنجاح!');
    console.log('📊 قاعدة البيانات الآن فارغة وجاهزة للاستخدام');
    
  } catch (error) {
    console.error('❌ خطأ في إفراغ قاعدة البيانات:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 تم إغلاق قاعدة البيانات');
    }
    process.exit(0);
  }
}

// تشغيل السكريبت
clearDatabase();

