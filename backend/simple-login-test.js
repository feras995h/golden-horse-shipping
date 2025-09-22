const http = require('http');

console.log('🔐 Simple Login Test...\n');

// Test with username format (like frontend)
const postData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

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

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Request body:', postData);

const request = http.request(options, (response) => {
  let data = '';
  
  console.log('Response status:', response.statusCode);
  console.log('Response headers:', response.headers);
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    console.log('Response body:', data);
    
    try {
      const jsonData = JSON.parse(data);
      if (response.statusCode === 200) {
        console.log('✅ Login successful!');
        console.log('   - User:', jsonData.user?.name);
        console.log('   - Email:', jsonData.user?.email);
        console.log('   - Token:', jsonData.token ? 'Generated' : 'Missing');
      } else {
        console.log('❌ Login failed');
        console.log('   - Message:', jsonData.message);
        console.log('   - Error:', jsonData.error);
        if (jsonData.debug) {
          console.log('   - Debug:', jsonData.debug);
        }
      }
    } catch (error) {
      console.log('❌ Failed to parse response:', error.message);
    }
  });
});

request.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
});

request.setTimeout(5000, () => {
  request.destroy();
  console.log('❌ Request timeout');
});

request.write(postData);
request.end();
