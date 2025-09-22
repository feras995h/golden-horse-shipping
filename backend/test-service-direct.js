const axios = require('axios');

async function testServiceDirect() {
  console.log('🔍 Testing Service Direct...\n');
  
  try {
    console.log('1️⃣ Testing container tracking endpoint...');
    const response = await axios.get('http://localhost:3001/api/shipsgo-tracking/container/MSKU4603728', {
      timeout: 15000
    });
    
    console.log('Response received:');
    console.log('Success:', response.data.success);
    console.log('Container:', response.data.data.container_number);
    console.log('Status:', response.data.data.status);
    console.log('Vessel:', response.data.data.vessel_name);
    console.log('Route:', response.data.data.port_of_loading, '→', response.data.data.port_of_discharge);
    console.log('Message:', response.data.message);
    
    // Check if it's real data
    if (response.data.data.vessel_name === 'MAERSK CAMPTON') {
      console.log('✅ SUCCESS: Using REAL ShipsGo API data!');
    } else if (response.data.data.vessel_name === 'MSC OSCAR') {
      console.log('❌ PROBLEM: Still using MOCK data');
      console.log('   Expected vessel: MAERSK CAMPTON');
      console.log('   Expected route: NINGBO → MISRATAH');
      console.log('   Expected status: Sailing');
    } else {
      console.log('⚠️  Unknown vessel:', response.data.data.vessel_name);
    }
    
  } catch (error) {
    console.log('❌ Error testing service:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testServiceDirect();
