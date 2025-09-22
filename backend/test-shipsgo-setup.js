const fs = require('fs');
const path = require('path');

console.log('🔍 فحص إعداد ShipsGo...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ ملف .env غير موجود');
  console.log('💡 الحل: شغل node create-env.js');
  process.exit(1);
}

console.log('✅ ملف .env موجود');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for required variables
const requiredVars = [
  'SHIPSGO_API_URL',
  'SHIPSGO_API_KEY',
  'SHIPSGO_FALLBACK_TO_MOCK'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (envContent.includes(varName)) {
    console.log(`✅ ${varName} موجود`);
  } else {
    console.log(`❌ ${varName} مفقود`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ بعض المتغيرات المطلوبة مفقودة');
  console.log('💡 الحل: شغل node create-env.js');
  process.exit(1);
}

// Check if API key is set to default
if (envContent.includes('SHIPSGO_API_KEY=your-shipsgo-api-key-here')) {
  console.log('⚠️  SHIPSGO_API_KEY لم يتم تحديثه');
  console.log('💡 الحل: استبدل بمفتاح API حقيقي أو اترك SHIPSGO_FALLBACK_TO_MOCK=true');
}

// Check fallback setting
if (envContent.includes('SHIPSGO_FALLBACK_TO_MOCK=true')) {
  console.log('✅ SHIPSGO_FALLBACK_TO_MOCK=true (سيستخدم Mock Data)');
  console.log('💡 هذا مثالي للاختبار');
} else if (envContent.includes('SHIPSGO_FALLBACK_TO_MOCK=false')) {
  console.log('✅ SHIPSGO_FALLBACK_TO_MOCK=false (سيستخدم API حقيقي)');
  console.log('💡 تأكد من أن SHIPSGO_API_KEY صحيح');
}

console.log('\n🎉 إعداد ShipsGo جاهز!');
console.log('📋 الخطوات التالية:');
console.log('1. أعد تشغيل الخادم: npm run start:dev');
console.log('2. اختبر API: curl http://localhost:3001/api/shipsgo-tracking/health');
console.log('3. اختبر التتبع من الواجهة الأمامية');

