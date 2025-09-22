// Load environment variables
require('dotenv').config();

console.log('🚀 Starting Golden Horse Shipping Backend Server...');
console.log('📍 Current directory:', process.cwd());
console.log('🔧 Environment Configuration:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);
console.log('   - SHIPSGO_API_URL:', process.env.SHIPSGO_API_URL);
console.log('   - SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);
console.log('   - Database:', process.env.DATABASE_URL);

try {
  // Start the NestJS application
  require('./dist/main.js');
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  console.error('📋 Stack trace:', error.stack);
  process.exit(1);
}
