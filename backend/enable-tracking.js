const axios = require('axios');

async function enableTracking() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.access_token;
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
    
    const enableResponse = await axios.put(
      'http://localhost:3001/api/admin/shipments/97542dfa-0f9c-469d-bd1b-4c529ef9783d/tracking-settings',
      { 
        enableTracking: true,
        containerNumber: 'MSKU4603728'
      },
      { headers }
    );
    
    console.log('Tracking enabled successfully:', enableResponse.data.message);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

enableTracking();
