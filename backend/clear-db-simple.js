const fs = require('fs');
const path = require('path');

console.log('🗑️  بدء إفراغ قاعدة البيانات...');

const dbPath = path.resolve(__dirname, './database.sqlite');

// التحقق من وجود قاعدة البيانات
if (!fs.existsSync(dbPath)) {
  console.log('❌ قاعدة البيانات غير موجودة!');
  process.exit(1);
}

console.log('✅ تم العثور على قاعدة البيانات');

// إنشاء نسخة احتياطية
const backupPath = path.resolve(__dirname, './backups/database-backup-before-clear.sqlite');
const backupDir = path.dirname(backupPath);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  fs.copyFileSync(dbPath, backupPath);
  console.log('💾 تم إنشاء نسخة احتياطية:', backupPath);
} catch (error) {
  console.log('⚠️  لم يتم إنشاء نسخة احتياطية:', error.message);
}

// حذف قاعدة البيانات الحالية
try {
  fs.unlinkSync(dbPath);
  console.log('🗑️  تم حذف قاعدة البيانات الحالية');
} catch (error) {
  console.log('❌ خطأ في حذف قاعدة البيانات:', error.message);
  process.exit(1);
}

// إنشاء قاعدة بيانات فارغة جديدة
try {
  fs.writeFileSync(dbPath, '');
  console.log('✅ تم إنشاء قاعدة بيانات فارغة جديدة');
} catch (error) {
  console.log('❌ خطأ في إنشاء قاعدة البيانات الجديدة:', error.message);
  process.exit(1);
}

console.log('\n🎉 تم إفراغ قاعدة البيانات بنجاح!');
console.log('📊 قاعدة البيانات الآن فارغة وجاهزة للاستخدام');
console.log('💾 النسخة الاحتياطية محفوظة في:', backupPath);
