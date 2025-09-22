// Set environment variables explicitly
process.env.SHIPSGO_API_URL = 'https://shipsgo.com/api/v1.1';
process.env.SHIPSGO_API_KEY = 'b0fa5419120c2c74847084a67d1b03be';
process.env.SHIPSGO_FALLBACK_TO_MOCK = 'false';
process.env.DATABASE_URL = 'sqlite:./database.sqlite';
process.env.PORT = '3001';
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'golden-horse-shipping-secret-key-2024';
process.env.JWT_EXPIRES_IN = '7d';
process.env.ADMIN_EMAIL = 'admin@goldenhorse.ly';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.ADMIN_NAME = 'System Administrator';

console.log('🚀 Starting server with REAL ShipsGo API...');
console.log('🔧 Environment Variables Set:');
console.log('   - SHIPSGO_API_URL:', process.env.SHIPSGO_API_URL);
console.log('   - SHIPSGO_API_KEY:', process.env.SHIPSGO_API_KEY ? 'SET' : 'NOT SET');
console.log('   - SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);
console.log('   - PORT:', process.env.PORT);

// Start the server
require('./dist/main.js');
