const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testData = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  invalidUser: {
    username: 'invalid',
    password: 'wrong'
  },
  newUser: {
    username: 'testoperator',
    email: 'operator@test.com',
    password: 'testpass123',
    fullName: 'Test Operator',
    role: 'operator'
  }
};

let adminToken = null;
let operatorToken = null;

console.log('🔐 Testing Security & Authentication System...\n');

// Test 1: Admin Login
async function testAdminLogin() {
  console.log('1. Testing admin login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testData.admin);
    
    if (response.data.access_token) {
      adminToken = response.data.access_token;
      console.log('✅ Admin login successful!');
      console.log(`Admin user: ${response.data.user.username} (${response.data.user.role})`);
      return true;
    } else {
      console.log('❌ Admin login failed: No token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Invalid Login
async function testInvalidLogin() {
  console.log('\n2. Testing invalid login...');
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, testData.invalidUser);
    console.log('❌ Invalid login should have failed');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid login correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Test 3: Protected Route Access
async function testProtectedRouteAccess() {
  console.log('\n3. Testing protected route access...');
  
  // Test without token
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`);
    console.log('❌ Protected route should require authentication');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Protected route correctly requires authentication');
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
  
  // Test with valid token
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.username) {
      console.log('✅ Protected route accessible with valid token');
      console.log(`Profile: ${response.data.username} (${response.data.role})`);
      return true;
    } else {
      console.log('❌ Protected route response invalid');
      return false;
    }
  } catch (error) {
    console.log('❌ Protected route access failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 4: User Creation (Admin Only)
async function testUserCreation() {
  console.log('\n4. Testing user creation (admin only)...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testData.newUser, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.id) {
      console.log('✅ User creation successful!');
      console.log(`New user: ${response.data.username} (${response.data.role})`);
      return true;
    } else {
      console.log('❌ User creation failed: No user data received');
      return false;
    }
  } catch (error) {
    console.log('❌ User creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Operator Login
async function testOperatorLogin() {
  console.log('\n5. Testing operator login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: testData.newUser.username,
      password: testData.newUser.password
    });
    
    if (response.data.access_token) {
      operatorToken = response.data.access_token;
      console.log('✅ Operator login successful!');
      console.log(`Operator user: ${response.data.user.username} (${response.data.user.role})`);
      return true;
    } else {
      console.log('❌ Operator login failed: No token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Operator login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Role-Based Access Control
async function testRoleBasedAccess() {
  console.log('\n6. Testing role-based access control...');
  
  // Test admin-only endpoint with admin token
  try {
    const response = await axios.get(`${BASE_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin can access admin-only endpoints');
  } catch (error) {
    console.log('❌ Admin access to admin-only endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
  
  // Test admin-only endpoint with operator token
  try {
    await axios.get(`${BASE_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    console.log('❌ Operator should not access admin-only endpoints');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Operator correctly denied access to admin-only endpoints');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Test 7: JWT Token Validation
async function testJWTValidation() {
  console.log('\n7. Testing JWT token validation...');
  
  // Test with invalid token
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    console.log('❌ Invalid token should be rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token correctly rejected');
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
  
  // Test with malformed token
  try {
    await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: 'InvalidFormat' }
    });
    console.log('❌ Malformed token should be rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Malformed token correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Test 8: Password Change
async function testPasswordChange() {
  console.log('\n8. Testing password change...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/change-password`, {
      currentPassword: testData.newUser.password,
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    
    console.log('✅ Password change successful');
    
    // Test login with new password
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: testData.newUser.username,
      password: 'newpassword123'
    });
    
    if (loginResponse.data.access_token) {
      console.log('✅ Login with new password successful');
      return true;
    } else {
      console.log('❌ Login with new password failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Password change failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 9: Customer Authentication
async function testCustomerAuth() {
  console.log('\n9. Testing customer authentication...');
  try {
    const response = await axios.post(`${BASE_URL}/api/customer-auth/login`, {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    });
    
    if (response.data.access_token) {
      console.log('✅ Customer authentication successful!');
      console.log(`Customer: ${response.data.customer.customerName}`);
      return true;
    } else {
      console.log('❌ Customer authentication failed: No token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Customer authentication failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 10: Security Headers and CORS
async function testSecurityHeaders() {
  console.log('\n10. Testing security headers...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const headers = response.headers;
    let securityScore = 0;
    
    // Check for security headers
    if (headers['x-frame-options']) {
      console.log('✅ X-Frame-Options header present');
      securityScore++;
    } else {
      console.log('⚠️ X-Frame-Options header missing');
    }
    
    if (headers['x-content-type-options']) {
      console.log('✅ X-Content-Type-Options header present');
      securityScore++;
    } else {
      console.log('⚠️ X-Content-Type-Options header missing');
    }
    
    if (headers['x-xss-protection']) {
      console.log('✅ X-XSS-Protection header present');
      securityScore++;
    } else {
      console.log('⚠️ X-XSS-Protection header missing');
    }
    
    console.log(`Security headers score: ${securityScore}/3`);
    return securityScore >= 1; // At least one security header should be present
  } catch (error) {
    console.log('❌ Security headers test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runSecurityTests() {
  const tests = [
    { name: 'Admin Login', test: testAdminLogin },
    { name: 'Invalid Login', test: testInvalidLogin },
    { name: 'Protected Route Access', test: testProtectedRouteAccess },
    { name: 'User Creation', test: testUserCreation },
    { name: 'Operator Login', test: testOperatorLogin },
    { name: 'Role-Based Access', test: testRoleBasedAccess },
    { name: 'JWT Validation', test: testJWTValidation },
    { name: 'Password Change', test: testPasswordChange },
    { name: 'Customer Authentication', test: testCustomerAuth },
    { name: 'Security Headers', test: testSecurityHeaders }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} test crashed:`, error.message);
      failed++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Security & Authentication Test Complete!');
  console.log('\n📊 Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (passed >= 8) {
    console.log('\n🔒 Security system is functioning well!');
  } else if (passed >= 6) {
    console.log('\n⚠️ Security system has some issues that need attention.');
  } else {
    console.log('\n🚨 Security system has critical issues that must be fixed!');
  }
}

// Start the tests
runSecurityTests().catch(console.error);