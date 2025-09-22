const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testCustomerAuth() {
  console.log('🔍 Testing Customer Authentication System...\n');

  try {
    // Test 1: Customer login with tracking number and password
    console.log('1. Testing customer login...');
    const loginResponse = await axios.post(`${baseURL}/customer-auth/login`, {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    });
    
    console.log('✅ Customer login successful!');
    console.log('Customer data:', JSON.stringify(loginResponse.data.customer, null, 2));
    
    const customerToken = loginResponse.data.access_token;
    console.log('🔑 Customer token received\n');

    // Test 2: Test invalid login
    console.log('2. Testing invalid login...');
    try {
      await axios.post(`${baseURL}/customer-auth/login`, {
        trackingNumber: 'MSKU4603728',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      console.log('✅ Invalid login correctly rejected:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Test ShipsGo tracking with the real tracking number
    console.log('3. Testing ShipsGo tracking for MSKU4603728...');
    const trackingResponse = await axios.get(`${baseURL}/shipsgo-tracking/track?container=MSKU4603728`);
    console.log('✅ ShipsGo tracking successful!');
    console.log('Tracking data preview:', {
      success: trackingResponse.data.success,
      container: trackingResponse.data.data?.container_number,
      vessel: trackingResponse.data.data?.vessel_name,
      status: trackingResponse.data.data?.status
    });
    console.log('');

    // Test 4: Test admin endpoints (should require admin token)
    console.log('4. Testing admin endpoints...');
    try {
      await axios.get(`${baseURL}/customer-auth/customers`);
      console.log('❌ Should have failed without admin token');
    } catch (error) {
      console.log('✅ Admin endpoint correctly protected:', error.response?.status === 401 ? 'Unauthorized' : error.message);
    }
    console.log('');

    console.log('🎉 Customer authentication system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCustomerAuth();
