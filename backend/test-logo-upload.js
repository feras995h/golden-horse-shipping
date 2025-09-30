const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// Test logo upload functionality
async function testLogoUpload() {
  console.log('🔍 Testing Logo Upload Functionality...\n');

  try {
    // Step 1: Admin login
    console.log('1️⃣ Admin Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (loginResponse.data && loginResponse.data.access_token) {
      authToken = loginResponse.data.access_token;
      console.log('✅ Admin login successful');
    } else {
      console.log('❌ Admin login failed');
      return;
    }

    // Step 2: Get current settings
    console.log('\n2️⃣ Getting current settings...');
    const settingsResponse = await axios.get(`${API_BASE_URL}/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Current settings retrieved');
    console.log('📍 Current logoUrl:', settingsResponse.data.logoUrl?.value);
    console.log('📍 Current logoAlt:', settingsResponse.data.logoAlt?.value);
    console.log('📍 Current faviconUrl:', settingsResponse.data.faviconUrl?.value);

    // Step 3: Create a test SVG logo
    console.log('\n3️⃣ Creating test logo...');
    const testLogoSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#FFD700"/>
  <text x="50" y="55" font-family="Arial" font-size="16" text-anchor="middle" fill="#000">LOGO</text>
</svg>`;
    
    const testLogoPath = path.join(__dirname, 'test-logo.svg');
    fs.writeFileSync(testLogoPath, testLogoSVG);
    console.log('✅ Test logo created');

    // Step 4: Upload logo using the API endpoint
    console.log('\n4️⃣ Uploading logo...');
    const formData = new FormData();
    formData.append('logo', fs.createReadStream(testLogoPath));
    formData.append('logoAlt', 'Test Logo - شعار تجريبي');

    const uploadResponse = await axios.post(`${API_BASE_URL}/settings/upload-logo`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    console.log('✅ Logo upload successful');
    console.log('📍 Upload response:', JSON.stringify(uploadResponse.data, null, 2));

    // Step 5: Verify settings were updated
    console.log('\n5️⃣ Verifying updated settings...');
    const updatedSettingsResponse = await axios.get(`${API_BASE_URL}/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Updated settings retrieved');
    console.log('📍 New logoUrl:', updatedSettingsResponse.data.logoUrl?.value);
    console.log('📍 New logoAlt:', updatedSettingsResponse.data.logoAlt?.value);

    // Step 6: Test public settings endpoint
    console.log('\n6️⃣ Testing public settings endpoint...');
    const publicSettingsResponse = await axios.get(`${API_BASE_URL}/settings/public`);
    
    console.log('✅ Public settings retrieved');
    console.log('📍 Public logoUrl:', publicSettingsResponse.data.logoUrl);
    console.log('📍 Public logoAlt:', publicSettingsResponse.data.logoAlt);

    // Step 7: Test if uploaded file is accessible
    console.log('\n7️⃣ Testing file accessibility...');
    const logoUrl = updatedSettingsResponse.data.logoUrl?.value;
    if (logoUrl && logoUrl.startsWith('/uploads/')) {
      try {
        const fileResponse = await axios.get(`http://localhost:3001${logoUrl}`);
        console.log('✅ Uploaded file is accessible');
        console.log('📍 File size:', fileResponse.data.length, 'bytes');
      } catch (error) {
        console.log('❌ Uploaded file is not accessible:', error.message);
      }
    }

    // Cleanup
    console.log('\n8️⃣ Cleaning up...');
    if (fs.existsSync(testLogoPath)) {
      fs.unlinkSync(testLogoPath);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Logo upload test completed successfully!');

  } catch (error) {
    console.error('❌ Logo upload test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testLogoUpload();