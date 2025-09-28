const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const CONTAINER_NUMBER = 'MSKU4603728';

async function testCustomerLogin() {
  console.log('🧪 Testing Customer Login...\n');

  try {
    console.log('1️⃣ Testing customer login with tracking number...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/customer-auth/login`, {
      trackingNumber: CONTAINER_NUMBER,
      password: 'customer123'
    });
    
    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response Data:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.access_token) {
      console.log('✅ Login successful! Token received.');
      
      // Test accessing customer portal
      console.log('\n2️⃣ Testing customer portal access...');
      const portalResponse = await axios.get(`${BACKEND_URL}/api/customer-portal/shipments`, {
        headers: { Authorization: `Bearer ${loginResponse.data.access_token}` }
      });
      
      console.log('Portal Response Status:', portalResponse.status);
      console.log('Portal Response Data:', JSON.stringify(portalResponse.data, null, 2));
      
      if (portalResponse.data.shipments && portalResponse.data.shipments.length > 0) {
        const shipmentId = portalResponse.data.shipments[0].id;
        console.log('Found shipment ID:', shipmentId);
        
        // Test real-time tracking
        console.log('\n3️⃣ Testing real-time tracking...');
        const trackingResponse = await axios.get(
          `${BACKEND_URL}/api/customer-portal/shipments/${shipmentId}/tracking`,
          { headers: { Authorization: `Bearer ${loginResponse.data.access_token}` } }
        );
        
        console.log('Tracking Response Status:', trackingResponse.status);
        console.log('Tracking Response Data:', JSON.stringify(trackingResponse.data, null, 2));
        console.log('✅ Real-time tracking successful!');
      }
    } else {
      console.log('❌ Login failed - No token received');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testCustomerLogin();