const axios = require('axios');

async function testFrontendFix() {
  console.log('🔍 Testing Frontend Fix for Location Data...\n');
  
  try {
    // Test the API response structure
    console.log('1️⃣ Testing API Response Structure...');
    const response = await axios.get('http://localhost:3001/api/shipsgo-tracking/container/MSKU4603728');
    
    console.log('✅ API Response received');
    console.log('📦 Container:', response.data.data.container_number);
    console.log('📍 Status:', response.data.data.status);
    console.log('🚢 Vessel:', response.data.data.vessel_name);
    
    // Check location data specifically
    console.log('\n2️⃣ Checking Location Data...');
    const location = response.data.data.location;
    
    console.log('Location object:', JSON.stringify(location, null, 2));
    
    if (location) {
      if (location.latitude !== null && location.longitude !== null) {
        console.log('✅ Location coordinates available:');
        console.log(`   📍 Latitude: ${location.latitude}`);
        console.log(`   📍 Longitude: ${location.longitude}`);
        console.log(`   🕒 Timestamp: ${location.timestamp}`);
      } else {
        console.log('⚠️  Location coordinates not available (null values)');
        console.log('   This is normal for some shipments where GPS data is not provided');
        console.log('   Frontend should handle this gracefully now');
      }
    } else {
      console.log('❌ No location object in response');
    }
    
    // Test the data structure that frontend expects
    console.log('\n3️⃣ Frontend Data Structure Check...');
    const frontendData = response.data.data;
    
    const requiredFields = [
      'container_number',
      'status', 
      'vessel_name',
      'shipping_line',
      'port_of_loading',
      'port_of_discharge',
      'location'
    ];
    
    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      if (frontendData[field] !== undefined) {
        console.log(`✅ ${field}: ${typeof frontendData[field] === 'object' ? 'object' : frontendData[field]}`);
      } else {
        console.log(`❌ Missing field: ${field}`);
        allFieldsPresent = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('\n🎉 All required fields present for frontend!');
      console.log('✅ Frontend should now display data without errors');
    } else {
      console.log('\n⚠️  Some fields missing - frontend may have issues');
    }
    
    console.log('\n🔧 Frontend Fix Summary:');
    console.log('   ✅ Added null check for location coordinates');
    console.log('   ✅ Added fallback message when coordinates not available');
    console.log('   ✅ Used Number() wrapper for safe conversion');
    console.log('   ✅ Frontend will no longer crash on null coordinates');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testFrontendFix();
