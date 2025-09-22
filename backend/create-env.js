const fs = require('fs');
const path = require('path');

console.log('إنشاء ملف .env...');

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
  fs.writeFileSync('.env', envContent, 'utf8');
  console.log('✅ تم إنشاء ملف .env بنجاح!');
  console.log('');
  console.log('📋 الخطوات التالية:');
  console.log('1. افتح ملف .env');
  console.log('2. استبدل "your-shipsgo-api-key-here" بمفتاح API الحقيقي من ShipsGo');
  console.log('3. أو اترك SHIPSGO_FALLBACK_TO_MOCK=true للاختبار');
  console.log('4. أعد تشغيل الخادم');
  console.log('');
  console.log('🚀 للاختبار السريع: اترك SHIPSGO_FALLBACK_TO_MOCK=true');
  console.log('🔑 للإنتاج: احصل على API key حقيقي من https://shipsgo.com');
} catch (error) {
  console.error('❌ خطأ في إنشاء ملف .env:', error.message);
  process.exit(1);
}
