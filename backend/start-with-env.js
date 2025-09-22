// Explicitly load .env file
const path = require('path');
const fs = require('fs');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Found .env file at:', envPath);
  require('dotenv').config({ path: envPath });
} else {
  console.log('❌ .env file not found at:', envPath);
  process.exit(1);
}

console.log('🚀 Starting Golden Horse Shipping Backend with Real ShipsGo API...');
console.log('🔧 Environment Variables:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - SHIPSGO_API_URL:', process.env.SHIPSGO_API_URL);
console.log('   - SHIPSGO_API_KEY:', process.env.SHIPSGO_API_KEY ? 'SET' : 'NOT SET');
console.log('   - SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);
console.log('   - DATABASE_URL:', process.env.DATABASE_URL);

// Verify critical settings
if (process.env.SHIPSGO_FALLBACK_TO_MOCK === 'true') {
  console.log('⚠️  WARNING: SHIPSGO_FALLBACK_TO_MOCK is set to true - will use mock data!');
} else {
  console.log('✅ SHIPSGO_FALLBACK_TO_MOCK is false - will use real API data!');
}

if (!process.env.SHIPSGO_API_KEY) {
  console.log('❌ SHIPSGO_API_KEY is not set!');
  process.exit(1);
}

console.log('🌐 Starting NestJS application...\n');

try {
  require('./dist/main.js');
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  console.error('📋 Stack trace:', error.stack);
  process.exit(1);
}
