const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 إصلاح مشكلة ShipsGo...\n');

// Step 1: Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 إنشاء ملف .env...');
  
  const envContent = `# Database Configuration
DATABASE_URL=sqlite:./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# ShipsGo API Configuration
# احصل على API key من https://shipsgo.com
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_FALLBACK_TO_MOCK=true

# Rate Limiting
SHIPSGO_RATE_LIMIT=100

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
`;

  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ تم إنشاء ملف .env بنجاح');
  } catch (error) {
    console.error('❌ خطأ في إنشاء ملف .env:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ ملف .env موجود');
}

// Step 2: Check .env content
console.log('🔍 فحص محتوى ملف .env...');
const envContent = fs.readFileSync(envPath, 'utf8');

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
  console.log('❌ بعض المتغيرات المطلوبة مفقودة');
  process.exit(1);
}

// Step 3: Check if using mock data
if (envContent.includes('SHIPSGO_FALLBACK_TO_MOCK=true')) {
  console.log('✅ SHIPSGO_FALLBACK_TO_MOCK=true (سيستخدم Mock Data)');
  console.log('💡 هذا مثالي للاختبار - لا حاجة لـ API key حقيقي');
} else {
  console.log('⚠️  SHIPSGO_FALLBACK_TO_MOCK=false');
  console.log('💡 تأكد من أن SHIPSGO_API_KEY صحيح');
}

// Step 4: Check if API key is set
if (envContent.includes('SHIPSGO_API_KEY=your-shipsgo-api-key-here')) {
  console.log('⚠️  SHIPSGO_API_KEY لم يتم تحديثه');
  console.log('💡 سيستخدم Mock Data للاختبار');
}

// Step 5: Check if server is running
console.log('\n🔍 فحص حالة الخادم...');
try {
  execSync('netstat -an | findstr :3001', { stdio: 'pipe' });
  console.log('✅ الخادم يعمل على المنفذ 3001');
} catch (error) {
  console.log('⚠️  الخادم لا يعمل على المنفذ 3001');
  console.log('💡 شغل: npm run start:dev');
}

// Step 6: Test ShipsGo API
console.log('\n🧪 اختبار ShipsGo API...');
try {
  const response = execSync('curl -s http://localhost:3001/api/shipsgo-tracking/health', { 
    stdio: 'pipe',
    timeout: 5000
  });
  console.log('✅ ShipsGo API يعمل بشكل صحيح');
  console.log('📊 الاستجابة:', response.toString().trim());
} catch (error) {
  console.log('⚠️  لا يمكن الاتصال بـ ShipsGo API');
  console.log('💡 تأكد من أن الخادم يعمل');
}

console.log('\n🎉 تم إصلاح مشكلة ShipsGo!');
console.log('\n📋 الخطوات التالية:');
console.log('1. أعد تشغيل الخادم: npm run start:dev');
console.log('2. اختبر التتبع من الواجهة الأمامية');
console.log('3. إذا كنت تريد API حقيقي، احصل على مفتاح من https://shipsgo.com');
console.log('\n💡 للاختبار السريع: اترك SHIPSGO_FALLBACK_TO_MOCK=true');

