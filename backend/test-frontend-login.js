const http = require('http');

// Test login with frontend format
async function testFrontendLogin() {
  console.log('🔐 Testing Frontend Login Format...\n');

  // Test 1: Frontend format with username
  console.log('1. Testing with username (frontend format)...');
  try {
    const frontendLogin = await makeLoginRequest('admin', 'admin123', 'username');
    console.log('✅ Frontend Username Login Response:');
    console.log('   - Success:', frontendLogin.success);
    console.log('   - User Email:', frontendLogin.user?.email);
    console.log('   - User Name:', frontendLogin.user?.name);
    console.log('   - Token:', frontendLogin.token ? 'Generated' : 'Missing');
  } catch (error) {
    console.log('❌ Frontend Username Login Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Frontend format with email
  console.log('2. Testing with email (frontend format)...');
  try {
    const emailLogin = await makeLoginRequest('admin@goldenhorse.ly', 'admin123', 'username');
    console.log('✅ Frontend Email Login Response:');
    console.log('   - Success:', emailLogin.success);
    console.log('   - User Email:', emailLogin.user?.email);
    console.log('   - User Name:', emailLogin.user?.name);
    console.log('   - Token:', emailLogin.token ? 'Generated' : 'Missing');
  } catch (error) {
    console.log('❌ Frontend Email Login Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Backend format with email
  console.log('3. Testing with email (backend format)...');
  try {
    const backendLogin = await makeLoginRequest('admin@goldenhorse.ly', 'admin123', 'email');
    console.log('✅ Backend Email Login Response:');
    console.log('   - Success:', backendLogin.success);
    console.log('   - User Email:', backendLogin.user?.email);
    console.log('   - User Name:', backendLogin.user?.name);
    console.log('   - Token:', backendLogin.token ? 'Generated' : 'Missing');
  } catch (error) {
    console.log('❌ Backend Email Login Failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Invalid credentials
  console.log('4. Testing with invalid credentials...');
  try {
    const invalidLogin = await makeLoginRequest('wrong', 'wrongpass', 'username');
    console.log('❌ Invalid Login Should Have Failed:', invalidLogin);
  } catch (error) {
    console.log('✅ Invalid Login Properly Rejected:', error.message);
  }

  console.log('\n🎉 Frontend Login Testing Complete!');
  console.log('\n📋 Valid Login Credentials:');
  console.log('   Username: admin');
  console.log('   Email: admin@goldenhorse.ly');
  console.log('   Password: admin123');
}

// Helper function to make login requests with different formats
function makeLoginRequest(identifier, password, format = 'username') {
  return new Promise((resolve, reject) => {
    let postData;
    
    if (format === 'username') {
      // Frontend format
      postData = JSON.stringify({ username: identifier, password });
    } else {
      // Backend format
      postData = JSON.stringify({ email: identifier, password });
    }
    
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

// Run the test
testFrontendLogin().catch(console.error);
