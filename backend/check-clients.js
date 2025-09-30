const axios = require('axios');

async function checkAndCreateClient() {
  try {
    // Login as admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    
    // Check existing clients
    const clientsResponse = await axios.get('http://localhost:3001/api/clients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Existing clients:', clientsResponse.data.length);
    
    if (clientsResponse.data.length > 0) {
      console.log('First client ID:', clientsResponse.data[0].id);
      console.log('First client clientId:', clientsResponse.data[0].clientId);
    } else {
      // Create a test client
      const newClient = await axios.post('http://localhost:3001/api/clients', {
        fullName: 'Test Client for Shipments',
        email: 'testclient@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        addressLine1: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        isActive: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Created new client ID:', newClient.data.id);
      console.log('Created new client clientId:', newClient.data.clientId);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkAndCreateClient();