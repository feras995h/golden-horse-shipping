// Quick start server with proper environment
require('dotenv').config();

console.log('🚀 Quick Starting Server...');
console.log('Environment check:');
console.log('- SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);

// Start the server
require('./dist/main.js');
