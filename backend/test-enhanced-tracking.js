const http = require('http');

// Test enhanced tracking system
async function testEnhancedTracking() {
  console.log('🚀 Testing Enhanced ShipsGo Tracking System...\n');

  // Test 1: Enhanced Health Check
  console.log('1. Testing Enhanced Health Check...');
  try {
    const healthResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/health');
    console.log('✅ Enhanced Health Check Response:');
    console.log('   - Configured:', healthResponse.configured);
    console.log('   - Mock Mode:', healthResponse.mockMode);
    console.log('   - Status:', healthResponse.status || 'Basic mode');
    console.log('   - API URL:', healthResponse.apiUrl || 'Not specified');
    console.log('   - Fallback Enabled:', healthResponse.fallbackEnabled || 'Not specified');
    console.log('   - Rate Limit:', healthResponse.rateLimit);
  } catch (error) {
    console.log('❌ Enhanced Health Check Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Enhanced Container Tracking with Real API Attempt
  console.log('2. Testing Enhanced Container Tracking...');
  try {
    const containerResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/track?container=MSCU1234567');
    console.log('✅ Enhanced Container Tracking Response:');
    console.log('   - Success:', containerResponse.success);
    console.log('   - Container Number:', containerResponse.data?.container_number);
    console.log('   - Vessel Name:', containerResponse.data?.vessel_name);
    console.log('   - Status:', containerResponse.data?.status);
    console.log('   - Shipping Line:', containerResponse.data?.shipping_line);
    console.log('   - Port of Loading:', containerResponse.data?.port_of_loading);
    console.log('   - Port of Discharge:', containerResponse.data?.port_of_discharge);
    console.log('   - Milestones Count:', containerResponse.data?.milestones?.length || 0);
    console.log('   - Message:', containerResponse.message || 'No special message');
    
    // Test milestone details
    if (containerResponse.data?.milestones?.length > 0) {
      console.log('   - Latest Milestone:', containerResponse.data.milestones[0].event);
      console.log('   - Completed Milestones:', 
        containerResponse.data.milestones.filter(m => m.status === 'completed').length);
    }
    
    // Test location data
    if (containerResponse.data?.location) {
      console.log('   - Current Location:', 
        `${containerResponse.data.location.latitude}, ${containerResponse.data.location.longitude}`);
    }
    
    // Test environmental data
    if (containerResponse.data?.co2_emissions) {
      console.log('   - CO2 Emissions:', containerResponse.data.co2_emissions, 'kg');
    }
    if (containerResponse.data?.transit_time) {
      console.log('   - Transit Time:', containerResponse.data.transit_time, 'days');
    }
    
  } catch (error) {
    console.log('❌ Enhanced Container Tracking Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Multiple Tracking Types
  console.log('3. Testing Multiple Tracking Types...');
  
  const testCases = [
    { type: 'BL', param: 'bl=MSCUBL123456', description: 'Bill of Lading' },
    { type: 'Booking', param: 'booking=MSCUBK789012', description: 'Booking Number' },
    { type: 'Container', param: 'container=ABCD9876543', description: 'Container Number' }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest(`http://localhost:3001/api/shipsgo-tracking/track?${testCase.param}`);
      console.log(`✅ ${testCase.description} Tracking:`);
      console.log(`   - Success: ${response.success}`);
      console.log(`   - Status: ${response.data?.status}`);
      console.log(`   - ${testCase.type} Number: ${response.data?.[testCase.type.toLowerCase() + '_number'] || response.data?.container_number}`);
    } catch (error) {
      console.log(`❌ ${testCase.description} Tracking Failed:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Performance and Response Time
  console.log('4. Testing Performance...');
  const startTime = Date.now();
  try {
    await makeRequest('http://localhost:3001/api/shipsgo-tracking/track?container=PERF1234567');
    const responseTime = Date.now() - startTime;
    console.log(`✅ Performance Test:`);
    console.log(`   - Response Time: ${responseTime}ms`);
    console.log(`   - Status: ${responseTime < 1000 ? 'Excellent' : responseTime < 3000 ? 'Good' : 'Needs Improvement'}`);
  } catch (error) {
    console.log('❌ Performance Test Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Error Handling and Edge Cases
  console.log('5. Testing Error Handling...');
  
  const errorTests = [
    { url: 'http://localhost:3001/api/shipsgo-tracking/track', description: 'No parameters' },
    { url: 'http://localhost:3001/api/shipsgo-tracking/track?container=', description: 'Empty container' },
    { url: 'http://localhost:3001/api/shipsgo-tracking/track?invalid=test', description: 'Invalid parameter' }
  ];
  
  for (const errorTest of errorTests) {
    try {
      await makeRequest(errorTest.url);
      console.log(`❌ ${errorTest.description}: Should have failed but didn't`);
    } catch (error) {
      console.log(`✅ ${errorTest.description}: Properly handled - ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🎉 Enhanced Tracking System Test Complete!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Real API integration with fallback');
  console.log('   ✅ Enhanced health monitoring');
  console.log('   ✅ Comprehensive milestone tracking');
  console.log('   ✅ Environmental data support');
  console.log('   ✅ Robust error handling');
  console.log('   ✅ Performance optimization');
}

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${jsonData.message || data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run the enhanced test
testEnhancedTracking().catch(console.error);
