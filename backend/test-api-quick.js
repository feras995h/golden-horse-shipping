const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test customer login
    const loginResponse = await axios.post('http://localhost:3001/api/customer-auth/login', {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    });
    console.log('✅ Customer login successful:', {
      customerName: loginResponse.data.customer.customerName,
      trackingNumber: loginResponse.data.customer.trackingNumber
    });
    
    console.log('🎉 Backend API is working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI();
