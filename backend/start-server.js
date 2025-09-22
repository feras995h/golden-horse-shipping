console.log('Starting server...');
console.log('Current directory:', process.cwd());
console.log('Environment variables:');
console.log('- SHIPSGO_API_URL:', process.env.SHIPSGO_API_URL);
console.log('- SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);

try {
  require('./dist/main.js');
} catch (error) {
  console.error('Error starting server:', error.message);
  console.error('Stack:', error.stack);
}
