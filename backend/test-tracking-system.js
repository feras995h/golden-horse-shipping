const http = require('http');

// Test tracking system
async function testTrackingSystem() {
  console.log('🔍 Testing ShipsGo Tracking System...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/health');
    console.log('✅ Health Check Response:', JSON.stringify(healthResponse, null, 2));
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Track by Container
  console.log('2. Testing Container Tracking...');
  try {
    const containerResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/track?container=ABCD1234567');
    console.log('✅ Container Tracking Response:');
    console.log('   - Success:', containerResponse.success);
    console.log('   - Container Number:', containerResponse.data?.container_number);
    console.log('   - Vessel Name:', containerResponse.data?.vessel_name);
    console.log('   - Status:', containerResponse.data?.status);
    console.log('   - Milestones Count:', containerResponse.data?.milestones?.length || 0);
  } catch (error) {
    console.log('❌ Container Tracking Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Track by BL
  console.log('3. Testing BL Tracking...');
  try {
    const blResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/track?bl=BL123456789');
    console.log('✅ BL Tracking Response:');
    console.log('   - Success:', blResponse.success);
    console.log('   - BL Number:', blResponse.data?.bl_number);
    console.log('   - Shipping Line:', blResponse.data?.shipping_line);
  } catch (error) {
    console.log('❌ BL Tracking Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Track by Booking
  console.log('4. Testing Booking Tracking...');
  try {
    const bookingResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/track?booking=BK123456789');
    console.log('✅ Booking Tracking Response:');
    console.log('   - Success:', bookingResponse.success);
    console.log('   - Booking Number:', bookingResponse.data?.booking_number);
    console.log('   - Port of Loading:', bookingResponse.data?.port_of_loading);
    console.log('   - Port of Discharge:', bookingResponse.data?.port_of_discharge);
  } catch (error) {
    console.log('❌ Booking Tracking Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Error Handling
  console.log('5. Testing Error Handling...');
  try {
    const errorResponse = await makeRequest('http://localhost:3001/api/shipsgo-tracking/track');
    console.log('❌ Should have failed but got:', errorResponse);
  } catch (error) {
    console.log('✅ Error Handling Works:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 Tracking System Test Complete!');
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

// Run the test
testTrackingSystem().catch(console.error);
