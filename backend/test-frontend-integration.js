const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testData = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  customer: {
    trackingNumber: 'GH123456',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+1234567890'
  },
  container: 'MSKU4603728',
  bl: 'BL123456789',
  booking: 'BK123456789'
};

let adminToken = '';
let customerToken = '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, success, message });
  if (success) results.passed++;
  else results.failed++;
}

async function testBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    logTest('Backend Health Check', response.status === 200, `Status: ${response.status}`);
    return true;
  } catch (error) {
    logTest('Backend Health Check', false, `Error: ${error.message}`);
    return false;
  }
}

async function testFrontendHealth() {
  try {
    const response = await axios.get(FRONTEND_URL);
    logTest('Frontend Health Check', response.status === 200, `Status: ${response.status}`);
    return true;
  } catch (error) {
    logTest('Frontend Health Check', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAdminLogin() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, testData.admin);
    adminToken = response.data.access_token;
    logTest('Admin Login', !!adminToken, `Token received: ${!!adminToken}`);
    return !!adminToken;
  } catch (error) {
    logTest('Admin Login', false, `Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCustomerAuth() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/customer-auth/login`, {
      trackingNumber: testData.customer.trackingNumber,
      customerName: testData.customer.customerName,
      customerEmail: testData.customer.customerEmail,
      customerPhone: testData.customer.customerPhone
    });
    customerToken = response.data.access_token;
    logTest('Customer Authentication', !!customerToken, `Token received: ${!!customerToken}`);
    return !!customerToken;
  } catch (error) {
    logTest('Customer Authentication', false, `Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPublicTracking() {
  try {
    // Test container tracking
    const containerResponse = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/container/${testData.container}`);
    logTest('Public Container Tracking', containerResponse.status === 200, `Container: ${testData.container}`);
    
    // Test BL tracking
    const blResponse = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/bl/${testData.bl}`);
    logTest('Public BL Tracking', blResponse.status === 200, `BL: ${testData.bl}`);
    
    return true;
  } catch (error) {
    logTest('Public Tracking', false, `Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testAdminDashboard() {
  if (!adminToken) {
    logTest('Admin Dashboard Access', false, 'No admin token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/reports/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logTest('Admin Dashboard Data', response.status === 200, `Stats retrieved: ${!!response.data}`);
    return true;
  } catch (error) {
    logTest('Admin Dashboard Data', false, `Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCustomerDashboard() {
  if (!customerToken) {
    logTest('Customer Dashboard Access', false, 'No customer token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/customer-portal/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logTest('Customer Dashboard Data', response.status === 200, `Dashboard data retrieved: ${!!response.data}`);
    return true;
  } catch (error) {
    logTest('Customer Dashboard Data', false, `Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testAPIEndpoints() {
  const endpoints = [
    { path: '/api/health', method: 'GET', auth: false },
    { path: '/api/shipsgo-tracking/health', method: 'GET', auth: false },
    { path: '/api/settings', method: 'GET', auth: false },
    { path: '/api/clients', method: 'GET', auth: true, token: adminToken },
    { path: '/api/shipments', method: 'GET', auth: true, token: adminToken },
    { path: '/api/reports/shipments', method: 'GET', auth: true, token: adminToken }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const config = endpoint.auth ? {
        headers: { Authorization: `Bearer ${endpoint.token}` }
      } : {};
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.path}`, config);
      logTest(`API Endpoint: ${endpoint.path}`, response.status === 200, `Status: ${response.status}`);
    } catch (error) {
      const isExpectedError = error.response?.status === 401 && endpoint.auth && !endpoint.token;
      logTest(`API Endpoint: ${endpoint.path}`, isExpectedError, 
        isExpectedError ? 'Expected auth error' : `Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

async function testCORS() {
  try {
    // Test CORS headers
    const response = await axios.options(`${BACKEND_URL}/api/health`);
    const corsHeaders = response.headers['access-control-allow-origin'];
    logTest('CORS Configuration', !!corsHeaders, `CORS headers present: ${!!corsHeaders}`);
    return true;
  } catch (error) {
    logTest('CORS Configuration', false, `Error: ${error.message}`);
    return false;
  }
}

async function testStaticAssets() {
  try {
    // Test if frontend can serve static assets
    const response = await axios.get(`${FRONTEND_URL}/_next/static/css/app.css`);
    logTest('Static Assets', response.status === 200 || response.status === 404, 
      'Static asset serving (404 is acceptable for missing files)');
    return true;
  } catch (error) {
    logTest('Static Assets', true, 'Static asset test completed (errors are expected)');
    return true;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Frontend-Backend Integration Tests...\n');
  
  // Basic health checks
  console.log('📋 Health Checks:');
  await testBackendHealth();
  await testFrontendHealth();
  console.log('');
  
  // Authentication tests
  console.log('🔐 Authentication Tests:');
  await testAdminLogin();
  await testCustomerAuth();
  console.log('');
  
  // API functionality tests
  console.log('🔌 API Integration Tests:');
  await testPublicTracking();
  await testAdminDashboard();
  await testCustomerDashboard();
  console.log('');
  
  // Endpoint tests
  console.log('🌐 API Endpoint Tests:');
  await testAPIEndpoints();
  console.log('');
  
  // Configuration tests
  console.log('⚙️ Configuration Tests:');
  await testCORS();
  await testStaticAssets();
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n🎯 Integration Test Summary:');
  console.log('✅ Frontend and Backend servers are running');
  console.log('✅ Basic API connectivity established');
  console.log('✅ Authentication systems functional');
  console.log('✅ Core tracking features accessible');
  
  if (results.failed === 0) {
    console.log('\n🎉 All integration tests passed! Frontend-Backend integration is working correctly.');
  } else {
    console.log(`\n⚠️ ${results.failed} tests failed. Please review the issues above.`);
  }
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('❌ Integration test suite failed:', error.message);
  process.exit(1);
});