const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// Function to login as admin
async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.access_token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Function to create customer via API
async function createCustomerViaAPI(customerData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/customers`,
      customerData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Customer creation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Function to create customer account via customer auth API
async function createCustomerAccountViaAPI(accountData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/customer-auth/create-account`,
      accountData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Customer account creation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Function to get all customers
async function getAllCustomers() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/customers`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get customers:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testAPICustomerCreation() {
  try {
    console.log('🧪 Testing customer creation via API...');
    
    // Login as admin
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed without admin authentication');
      return;
    }
    
    // Test 1: Create customer via admin API
    console.log('\n📝 Test 1: Creating customer via admin API...');
    
    const adminCustomerData = {
      fullName: 'API Test Customer Admin',
      email: 'api-admin-test@example.com',
      phone: '+966123456789',
      company: 'Test Company',
      addressLine1: 'Test Address 1',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      notes: 'Created via admin API test'
    };
    
    try {
      const adminCustomer = await createCustomerViaAPI(adminCustomerData);
      console.log(`   ✅ Admin API Customer created: ${adminCustomer.customerNumber || 'No customer number'}`);
      console.log(`   📧 Email: ${adminCustomer.email}`);
      console.log(`   📱 Phone: ${adminCustomer.phone}`);
    } catch (error) {
      console.log('   ❌ Admin API customer creation failed');
    }
    
    // Test 2: Create customer account via customer auth API
    console.log('\n📝 Test 2: Creating customer account via customer auth API...');
    
    const customerAccountData = {
      trackingNumber: 'TEST' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      password: 'testpassword123',
      customerName: 'API Test Customer Auth',
      customerEmail: 'api-auth-test@example.com',
      customerPhone: '+966987654321'
    };
    
    try {
      const customerAccount = await createCustomerAccountViaAPI(customerAccountData);
      console.log(`   ✅ Customer Auth API Account created: ${customerAccount.customerNumber || 'No customer number'}`);
      console.log(`   🎫 Tracking Number: ${customerAccount.trackingNumber}`);
      console.log(`   📧 Email: ${customerAccount.customerEmail}`);
    } catch (error) {
      console.log('   ❌ Customer Auth API account creation failed');
    }
    
    // Test 3: Verify all customers have GH-XXXXXX format
    console.log('\n🔍 Test 3: Verifying customer numbers via API...');
    
    try {
      const customers = await getAllCustomers();
      console.log(`   📊 Total customers found: ${customers.length}`);
      
      const ghFormatRegex = /^GH-\d{6}$/;
      let validCount = 0;
      let invalidCount = 0;
      let noNumberCount = 0;
      
      customers.forEach(customer => {
        if (customer.customerNumber) {
          if (ghFormatRegex.test(customer.customerNumber)) {
            validCount++;
            console.log(`   ✅ Valid: ${customer.customerNumber} - ${customer.fullName || customer.customerName}`);
          } else {
            invalidCount++;
            console.log(`   ❌ Invalid: ${customer.customerNumber} - ${customer.fullName || customer.customerName}`);
          }
        } else {
          noNumberCount++;
          console.log(`   ⚠️  No number: ${customer.fullName || customer.customerName}`);
        }
      });
      
      console.log(`\n📊 API validation results:`);
      console.log(`   ✅ Valid GH-XXXXXX format: ${validCount}`);
      console.log(`   ❌ Invalid format: ${invalidCount}`);
      console.log(`   ⚠️  No customer number: ${noNumberCount}`);
      
    } catch (error) {
      console.log('   ❌ Failed to retrieve customers for validation');
    }
    
    console.log('\n🎉 API tests completed!');
    console.log('✅ Customer number generation system tested via API');
    
  } catch (error) {
    console.error('❌ Error during API testing:', error.message);
  }
}

// Check if server is running
async function checkServerStatus() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    try {
      // Try alternative endpoint
      await axios.get(`${API_BASE_URL}`);
      return true;
    } catch (error2) {
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting API customer creation tests...');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('❌ Server is not running at ' + API_BASE_URL);
    console.log('💡 Please make sure the backend server is running with: npm run start:dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  await testAPICustomerCreation();
}

main();