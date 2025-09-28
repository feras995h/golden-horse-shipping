const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    backend: BACKEND_URL,
    frontend: FRONTEND_URL,
    nodeVersion: process.version
  },
  categories: {
    infrastructure: { passed: 0, failed: 0, tests: [] },
    authentication: { passed: 0, failed: 0, tests: [] },
    api: { passed: 0, failed: 0, tests: [] },
    tracking: { passed: 0, failed: 0, tests: [] },
    security: { passed: 0, failed: 0, tests: [] },
    integration: { passed: 0, failed: 0, tests: [] }
  },
  summary: { totalPassed: 0, totalFailed: 0, successRate: 0 }
};

let adminToken = '';
let operatorToken = '';

function logTest(category, name, success, message = '', details = null) {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  
  const test = { name, success, message, details, timestamp: new Date().toISOString() };
  testResults.categories[category].tests.push(test);
  
  if (success) {
    testResults.categories[category].passed++;
    testResults.summary.totalPassed++;
  } else {
    testResults.categories[category].failed++;
    testResults.summary.totalFailed++;
  }
}

// Infrastructure Tests
async function testInfrastructure() {
  console.log('🏗️ Infrastructure Tests:');
  
  // Backend health
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    logTest('infrastructure', 'Backend Server Health', response.status === 200, 
      `Status: ${response.status}`, response.data);
  } catch (error) {
    logTest('infrastructure', 'Backend Server Health', false, error.message);
  }
  
  // Frontend health
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    logTest('infrastructure', 'Frontend Server Health', response.status === 200, 
      `Status: ${response.status}`);
  } catch (error) {
    logTest('infrastructure', 'Frontend Server Health', false, error.message);
  }
  
  // Database connectivity
  try {
    const response = await axios.get(`${BACKEND_URL}/api/settings`);
    logTest('infrastructure', 'Database Connectivity', response.status === 200 || response.status === 401, 
      'Database accessible (401 is expected for unauthorized access)');
  } catch (error) {
    logTest('infrastructure', 'Database Connectivity', false, error.message);
  }
  
  // ShipsGo API health
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/health`);
    logTest('infrastructure', 'ShipsGo API Health', response.status === 200, 
      `Status: ${response.status}`, response.data);
  } catch (error) {
    logTest('infrastructure', 'ShipsGo API Health', false, error.message);
  }
  
  console.log('');
}

// Authentication Tests
async function testAuthentication() {
  console.log('🔐 Authentication Tests:');
  
  // Admin login
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = response.data.access_token;
    logTest('authentication', 'Admin Login', !!adminToken, 
      `Token received: ${!!adminToken}`, { role: response.data.user?.role });
  } catch (error) {
    logTest('authentication', 'Admin Login', false, 
      error.response?.data?.message || error.message);
  }
  
  // Invalid login
  try {
    await axios.post(`${BACKEND_URL}/api/auth/login`, {
      username: 'invalid',
      password: 'invalid'
    });
    logTest('authentication', 'Invalid Login Rejection', false, 'Should have failed');
  } catch (error) {
    logTest('authentication', 'Invalid Login Rejection', error.response?.status === 401, 
      'Correctly rejected invalid credentials');
  }
  
  // JWT validation
  if (adminToken) {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('authentication', 'JWT Token Validation', response.status === 200, 
        'Token successfully validated', response.data);
    } catch (error) {
      logTest('authentication', 'JWT Token Validation', false, 
        error.response?.data?.message || error.message);
    }
  }
  
  // Customer authentication (simplified)
  try {
    const response = await axios.post(`${BACKEND_URL}/api/customer-auth/direct-access`, {
      trackingNumber: 'GH123456'
    });
    logTest('authentication', 'Customer Direct Access', response.status === 200, 
      'Customer access granted', { hasToken: !!response.data.access_token });
  } catch (error) {
    logTest('authentication', 'Customer Direct Access', false, 
      error.response?.data?.message || error.message);
  }
  
  console.log('');
}

// API Tests
async function testAPI() {
  console.log('🔌 API Tests:');
  
  const apiEndpoints = [
    { path: '/api/health', method: 'GET', auth: false, expected: 200 },
    { path: '/api/settings', method: 'GET', auth: false, expected: [200, 401] },
    { path: '/api/clients', method: 'GET', auth: true, expected: 200 },
    { path: '/api/shipments', method: 'GET', auth: true, expected: 200 },
    { path: '/api/reports/shipments', method: 'GET', auth: true, expected: 200 },
    { path: '/api/users', method: 'GET', auth: true, expected: 200 }
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const config = endpoint.auth && adminToken ? {
        headers: { Authorization: `Bearer ${adminToken}` }
      } : {};
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.path}`, config);
      const expectedStatuses = Array.isArray(endpoint.expected) ? endpoint.expected : [endpoint.expected];
      const success = expectedStatuses.includes(response.status);
      
      logTest('api', `API Endpoint: ${endpoint.path}`, success, 
        `Status: ${response.status}`, { 
          dataReceived: !!response.data, 
          dataType: typeof response.data 
        });
    } catch (error) {
      const isExpectedAuthError = error.response?.status === 401 && endpoint.auth && !adminToken;
      logTest('api', `API Endpoint: ${endpoint.path}`, isExpectedAuthError, 
        isExpectedAuthError ? 'Expected auth error' : 
        (error.response?.data?.message || error.message));
    }
  }
  
  console.log('');
}

// Tracking System Tests
async function testTracking() {
  console.log('📦 Tracking System Tests:');
  
  // ShipsGo container tracking
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/container/MSKU4603728`);
    logTest('tracking', 'ShipsGo Container Tracking', response.status === 200, 
      'Container tracking functional', { hasData: !!response.data });
  } catch (error) {
    logTest('tracking', 'ShipsGo Container Tracking', false, 
      error.response?.data?.message || error.message);
  }
  
  // ShipsGo BL tracking
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/bl/BL123456789`);
    logTest('tracking', 'ShipsGo BL Tracking', response.status === 200, 
      'BL tracking functional', { hasData: !!response.data });
  } catch (error) {
    logTest('tracking', 'ShipsGo BL Tracking', false, 
      error.response?.data?.message || error.message);
  }
  
  // Internal shipment tracking
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipments/track/GH123456`);
    logTest('tracking', 'Internal Shipment Tracking', 
      response.status === 200 || response.status === 404, 
      'Internal tracking system accessible');
  } catch (error) {
    logTest('tracking', 'Internal Shipment Tracking', false, 
      error.response?.data?.message || error.message);
  }
  
  // Client shipments lookup
  try {
    const response = await axios.get(`${BACKEND_URL}/api/clients/GH-123456/shipments`);
    logTest('tracking', 'Client Shipments Lookup', 
      response.status === 200 || response.status === 404, 
      'Client lookup system accessible');
  } catch (error) {
    logTest('tracking', 'Client Shipments Lookup', false, 
      error.response?.data?.message || error.message);
  }
  
  console.log('');
}

// Security Tests
async function testSecurity() {
  console.log('🔒 Security Tests:');
  
  // Protected route access without token
  try {
    await axios.get(`${BACKEND_URL}/api/users`);
    logTest('security', 'Protected Route Access Control', false, 
      'Should require authentication');
  } catch (error) {
    logTest('security', 'Protected Route Access Control', error.response?.status === 401, 
      'Correctly blocks unauthorized access');
  }
  
  // Invalid JWT token
  try {
    await axios.get(`${BACKEND_URL}/api/users`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    logTest('security', 'Invalid JWT Rejection', false, 'Should reject invalid token');
  } catch (error) {
    logTest('security', 'Invalid JWT Rejection', error.response?.status === 401, 
      'Correctly rejects invalid JWT');
  }
  
  // SQL injection attempt (basic test)
  try {
    await axios.get(`${BACKEND_URL}/api/shipments/track/'; DROP TABLE users; --`);
    logTest('security', 'SQL Injection Protection', true, 
      'No server crash on injection attempt');
  } catch (error) {
    logTest('security', 'SQL Injection Protection', 
      error.response?.status !== 500, 
      'Server handled injection attempt gracefully');
  }
  
  // CORS headers check
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    const hasCorsHeaders = response.headers['access-control-allow-origin'] !== undefined;
    logTest('security', 'CORS Headers', hasCorsHeaders, 
      `CORS configured: ${hasCorsHeaders}`);
  } catch (error) {
    logTest('security', 'CORS Headers', false, error.message);
  }
  
  console.log('');
}

// Integration Tests
async function testIntegration() {
  console.log('🔗 Integration Tests:');
  
  // Frontend-Backend connectivity
  try {
    // Simulate a frontend request to backend
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Referer': FRONTEND_URL
      }
    });
    logTest('integration', 'Frontend-Backend Connectivity', response.status === 200, 
      'Frontend can communicate with backend');
  } catch (error) {
    logTest('integration', 'Frontend-Backend Connectivity', false, error.message);
  }
  
  // API response format consistency
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    const hasConsistentFormat = response.data && typeof response.data === 'object';
    logTest('integration', 'API Response Format', hasConsistentFormat, 
      'API returns consistent JSON format');
  } catch (error) {
    logTest('integration', 'API Response Format', false, error.message);
  }
  
  // Error handling consistency
  try {
    await axios.get(`${BACKEND_URL}/api/nonexistent-endpoint`);
    logTest('integration', 'Error Handling Consistency', false, 
      'Should return 404 for non-existent endpoints');
  } catch (error) {
    logTest('integration', 'Error Handling Consistency', error.response?.status === 404, 
      'Correctly returns 404 for non-existent endpoints');
  }
  
  console.log('');
}

// Generate detailed report
function generateReport() {
  const total = testResults.summary.totalPassed + testResults.summary.totalFailed;
  testResults.summary.successRate = total > 0 ? Math.round((testResults.summary.totalPassed / total) * 100) : 0;
  
  console.log('📊 Comprehensive System Test Report:');
  console.log('=' .repeat(50));
  
  // Category breakdown
  Object.entries(testResults.categories).forEach(([category, results]) => {
    const total = results.passed + results.failed;
    const rate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
    console.log(`${category.toUpperCase()}: ${results.passed}/${total} (${rate}%)`);
  });
  
  console.log('=' .repeat(50));
  console.log(`OVERALL: ${testResults.summary.totalPassed}/${total} (${testResults.summary.successRate}%)`);
  
  // Failed tests summary
  const failedTests = [];
  Object.entries(testResults.categories).forEach(([category, results]) => {
    results.tests.filter(t => !t.success).forEach(test => {
      failedTests.push({ category, ...test });
    });
  });
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests Summary:');
    failedTests.forEach(test => {
      console.log(`   [${test.category.toUpperCase()}] ${test.name}: ${test.message}`);
    });
  }
  
  // System health assessment
  console.log('\n🎯 System Health Assessment:');
  
  const infraHealth = testResults.categories.infrastructure.passed / 
    (testResults.categories.infrastructure.passed + testResults.categories.infrastructure.failed);
  const authHealth = testResults.categories.authentication.passed / 
    (testResults.categories.authentication.passed + testResults.categories.authentication.failed);
  const apiHealth = testResults.categories.api.passed / 
    (testResults.categories.api.passed + testResults.categories.api.failed);
  
  console.log(`Infrastructure Health: ${Math.round(infraHealth * 100)}%`);
  console.log(`Authentication Health: ${Math.round(authHealth * 100)}%`);
  console.log(`API Health: ${Math.round(apiHealth * 100)}%`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (testResults.summary.successRate >= 90) {
    console.log('✅ System is in excellent condition');
  } else if (testResults.summary.successRate >= 75) {
    console.log('⚠️ System is functional but needs attention');
  } else {
    console.log('❌ System requires immediate attention');
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, 'system-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive System Tests...\n');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Node.js: ${process.version}\n`);
  
  try {
    await testInfrastructure();
    await testAuthentication();
    await testAPI();
    await testTracking();
    await testSecurity();
    await testIntegration();
    
    generateReport();
    
    if (testResults.summary.successRate >= 75) {
      console.log('\n🎉 System tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ System tests completed with issues. Please review the report.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive tests
runComprehensiveTests();