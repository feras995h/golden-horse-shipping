const http = require('http');

// Test login functionality
async function testLogin() {
  console.log('🔐 Testing Login Functionality...\n');

  // Test 1: Valid credentials
  console.log('1. Testing with valid credentials...');
  try {
    const validLogin = await makeLoginRequest('admin@goldenhorse.ly', 'admin123');
    console.log('✅ Valid Login Response:');
    console.log('   - Success:', validLogin.success);
    console.log('   - User Email:', validLogin.user?.email);
    console.log('   - User Name:', validLogin.user?.name);
    console.log('   - User Role:', validLogin.user?.role);
    console.log('   - Token:', validLogin.token ? 'Generated' : 'Missing');
    console.log('   - Expires In:', validLogin.expiresIn);
  } catch (error) {
    console.log('❌ Valid Login Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Invalid credentials
  console.log('2. Testing with invalid credentials...');
  try {
    const invalidLogin = await makeLoginRequest('wrong@email.com', 'wrongpass');
    console.log('❌ Invalid Login Should Have Failed:', invalidLogin);
  } catch (error) {
    console.log('✅ Invalid Login Properly Rejected:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Missing credentials
  console.log('3. Testing with missing credentials...');
  try {
    const missingLogin = await makeLoginRequest('', '');
    console.log('❌ Missing Credentials Should Have Failed:', missingLogin);
  } catch (error) {
    console.log('✅ Missing Credentials Properly Rejected:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Profile endpoint with token
  console.log('4. Testing profile endpoint...');
  try {
    const validLogin = await makeLoginRequest('admin@goldenhorse.ly', 'admin123');
    if (validLogin.token) {
      const profile = await makeProfileRequest(validLogin.token);
      console.log('✅ Profile Response:');
      console.log('   - Success:', profile.success);
      console.log('   - User Email:', profile.user?.email);
      console.log('   - User Name:', profile.user?.name);
      console.log('   - User Role:', profile.user?.role);
    }
  } catch (error) {
    console.log('❌ Profile Request Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Profile endpoint without token
  console.log('5. Testing profile endpoint without token...');
  try {
    const profile = await makeProfileRequest('');
    console.log('❌ Profile Without Token Should Have Failed:', profile);
  } catch (error) {
    console.log('✅ Profile Without Token Properly Rejected:', error.message);
  }

  console.log('\n🎉 Login Testing Complete!');
  console.log('\n📋 Login Credentials for Testing:');
  console.log('   Email: admin@goldenhorse.ly');
  console.log('   Password: admin123');
}

// Helper function to make login requests
function makeLoginRequest(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = http.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (response.statusCode === 200) {
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
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.write(postData);
    request.end();
  });
}

// Helper function to make profile requests
function makeProfileRequest(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };

    const request = http.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (response.statusCode === 200) {
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
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

// Run the test
testLogin().catch(console.error);
