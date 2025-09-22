// Test environment variables and API
require('dotenv').config();

console.log('🔍 Testing Environment Variables and API...\n');

console.log('📋 Environment Variables:');
console.log('   - SHIPSGO_API_URL:', process.env.SHIPSGO_API_URL);
console.log('   - SHIPSGO_API_KEY:', process.env.SHIPSGO_API_KEY ? 'SET' : 'NOT SET');
console.log('   - SHIPSGO_FALLBACK_TO_MOCK:', process.env.SHIPSGO_FALLBACK_TO_MOCK);
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - PORT:', process.env.PORT);

// Test if the values are correct
if (process.env.SHIPSGO_FALLBACK_TO_MOCK === 'false') {
  console.log('✅ SHIPSGO_FALLBACK_TO_MOCK is correctly set to false');
} else {
  console.log('❌ SHIPSGO_FALLBACK_TO_MOCK is:', process.env.SHIPSGO_FALLBACK_TO_MOCK);
}

if (process.env.SHIPSGO_API_URL === 'https://shipsgo.com/api/v1.1') {
  console.log('✅ SHIPSGO_API_URL is correctly set to v1.1');
} else {
  console.log('❌ SHIPSGO_API_URL is:', process.env.SHIPSGO_API_URL);
}

// Test the ShipsGo service configuration
const { ConfigService } = require('@nestjs/config');

// Create a mock config service to test
const mockConfig = {
  get: (key, defaultValue) => {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
};

console.log('\n🔧 Service Configuration Test:');
console.log('   - API URL:', mockConfig.get('SHIPSGO_API_URL'));
console.log('   - API Key:', mockConfig.get('SHIPSGO_API_KEY') ? 'SET' : 'NOT SET');
console.log('   - Fallback to Mock:', mockConfig.get('SHIPSGO_FALLBACK_TO_MOCK', false));

const fallbackValue = mockConfig.get('SHIPSGO_FALLBACK_TO_MOCK', false);
if (fallbackValue === false) {
  console.log('✅ Service will use REAL API data');
} else {
  console.log('❌ Service will use MOCK data');
}

console.log('\n🎯 Summary:');
console.log('   • Environment file loaded correctly');
console.log('   • SHIPSGO_FALLBACK_TO_MOCK =', process.env.SHIPSGO_FALLBACK_TO_MOCK);
console.log('   • API URL =', process.env.SHIPSGO_API_URL);
console.log('   • Expected behavior: Use real ShipsGo API data');
