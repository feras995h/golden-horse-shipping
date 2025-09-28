const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const CONTAINER_NUMBER = 'MSKU4603728';
const TRACKING_NUMBER = 'GH-MSKU-962018';

console.log('🧪 Testing Real Tracking System with MSKU4603728...\n');

async function testRealTracking() {
  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Public Container Tracking
  console.log('1️⃣ Testing Public Container Tracking...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/public-tracking/${CONTAINER_NUMBER}`);
    if (response.status === 200 && response.data) {
      console.log('✅ Public container tracking successful');
      console.log('📦 Container Data:', JSON.stringify(response.data, null, 2));
      results.tests.push({ name: 'Public Container Tracking', status: 'PASSED', data: response.data });
      results.passed++;
    } else {
      console.log('❌ Public container tracking failed - No data returned');
      results.tests.push({ name: 'Public Container Tracking', status: 'FAILED', error: 'No data returned' });
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Public container tracking failed:', error.response?.data?.message || error.message);
    results.tests.push({ name: 'Public Container Tracking', status: 'FAILED', error: error.response?.data?.message || error.message });
    results.failed++;
  }

  // Test 2: Public Tracking Number Search
  console.log('\n2️⃣ Testing Public Tracking Number Search...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipments/track/${TRACKING_NUMBER}`);
    if (response.status === 200 && response.data) {
      console.log('✅ Public tracking number search successful');
      console.log('📋 Tracking Data:', JSON.stringify(response.data, null, 2));
      results.tests.push({ name: 'Public Tracking Number Search', status: 'PASSED', data: response.data });
      results.passed++;
    } else {
      console.log('❌ Public tracking number search failed - No data returned');
      results.tests.push({ name: 'Public Tracking Number Search', status: 'FAILED', error: 'No data returned' });
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Public tracking number search failed:', error.response?.data?.message || error.message);
    results.tests.push({ name: 'Public Tracking Number Search', status: 'FAILED', error: error.response?.data?.message || error.message });
    results.failed++;
  }

  // Test 3: ShipsGo API Integration
  console.log('\n3️⃣ Testing ShipsGo API Integration...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipsgo-tracking/container/${CONTAINER_NUMBER}`);
    if (response.status === 200 && response.data) {
      console.log('✅ ShipsGo API integration successful');
      console.log('🚢 ShipsGo Data:', JSON.stringify(response.data, null, 2));
      results.tests.push({ name: 'ShipsGo API Integration', status: 'PASSED', data: response.data });
      results.passed++;
    } else {
      console.log('❌ ShipsGo API integration failed - No data returned');
      results.tests.push({ name: 'ShipsGo API Integration', status: 'FAILED', error: 'No data returned' });
      results.failed++;
    }
  } catch (error) {
    console.log('❌ ShipsGo API integration failed:', error.response?.data?.message || error.message);
    results.tests.push({ name: 'ShipsGo API Integration', status: 'FAILED', error: error.response?.data?.message || error.message });
    results.failed++;
  }

  // Test 4: Customer Portal Access
  console.log('\n4️⃣ Testing Customer Portal Access...');
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/customer-auth/login`, {
      trackingNumber: CONTAINER_NUMBER,
      password: 'customer123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.access_token) {
      console.log('✅ Customer portal access successful');
      console.log('🔑 Customer:', loginResponse.data.customer?.customerName || 'Unknown');
      results.tests.push({ name: 'Customer Portal Access', status: 'PASSED', data: { hasToken: true, customer: loginResponse.data.customer?.customerName } });
      results.passed++;
    } else {
      console.log('❌ Customer portal access failed - No token returned');
      results.tests.push({ name: 'Customer Portal Access', status: 'FAILED', error: 'No token returned' });
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Customer portal access failed:', error.response?.data?.message || error.message);
    results.tests.push({ name: 'Customer Portal Access', status: 'FAILED', error: error.response?.data?.message || error.message });
    results.failed++;
  }

  // Test 5: Real-time Tracking Data
  console.log('\n5️⃣ Testing Real-time Tracking Data...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/shipments/${TRACKING_NUMBER}/tracking`);
    if (response.status === 200 && response.data) {
      console.log('✅ Real-time tracking data successful');
      console.log('⏱️ Real-time Data:', JSON.stringify(response.data, null, 2));
      results.tests.push({ name: 'Real-time Tracking Data', status: 'PASSED', data: response.data });
      results.passed++;
    } else {
      console.log('❌ Real-time tracking data failed - No data returned');
      results.tests.push({ name: 'Real-time Tracking Data', status: 'FAILED', error: 'No data returned' });
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Real-time tracking data failed:', error.response?.data?.message || error.message);
    results.tests.push({ name: 'Real-time Tracking Data', status: 'FAILED', error: error.response?.data?.message || error.message });
    results.failed++;
  }

  results.total = results.passed + results.failed;

  // Generate Summary Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 REAL TRACKING TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`🎯 Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Detailed Results
  console.log('\n📋 DETAILED TEST RESULTS:');
  results.tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}: ${test.status}`);
    if (test.status === 'FAILED' && test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });

  // Save results to file
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    containerNumber: CONTAINER_NUMBER,
    trackingNumber: TRACKING_NUMBER,
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(1) + '%'
    },
    tests: results.tests
  };

  fs.writeFileSync('real-tracking-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Test report saved to: real-tracking-test-report.json');

  return results;
}

// Run the tests
testRealTracking().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});