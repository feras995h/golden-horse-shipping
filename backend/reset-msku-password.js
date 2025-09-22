const axios = require('axios');

async function resetPassword() {
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
    
    const resetResponse = await axios.put(
      'http://localhost:3001/api/admin/customers/customer-msku4603728-001/password',
      { newPassword: 'customer123' },
      { headers }
    );
    
    console.log('Password reset successful:', resetResponse.data.message);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

resetPassword();
