const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';
const dbPath = path.join(__dirname, 'database.sqlite');

console.log('🔍 Detailed Customer Authentication Debug...\n');

async function debugCustomerAuth() {
  // Step 1: Check database directly
  console.log('1️⃣ Checking database directly...');
  const db = new sqlite3.Database(dbPath);
  
  const customer = await new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM customer_accounts WHERE tracking_number = ?",
      ['MSKU4603728'],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (!customer) {
    console.log('❌ Customer not found in database');
    db.close();
    return;
  }
  
  console.log('✅ Customer found in database:');
  console.log(`   ID: ${customer.id}`);
  console.log(`   Tracking Number: ${customer.tracking_number}`);
  console.log(`   Customer Name: ${customer.customer_name}`);
  console.log(`   Is Active: ${customer.is_active}`);
  console.log(`   Has Portal Access: ${customer.has_portal_access}`);
  console.log(`   Password Hash Length: ${customer.password_hash?.length || 'No hash'}`);
  
  // Step 2: Test password hash manually
  console.log('\n2️⃣ Testing password hash manually...');
  const passwordValid = await bcrypt.compare('customer123', customer.password_hash);
  console.log(`   Password 'customer123' valid: ${passwordValid ? '✅' : '❌'}`);
  
  db.close();
  
  // Step 3: Check if backend server is running
  console.log('\n3️⃣ Checking backend server...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend server is running');
    console.log(`   Status: ${healthResponse.status}`);
  } catch (error) {
    console.log('❌ Backend server not accessible:', error.message);
    return;
  }
  
  // Step 4: Test the exact API endpoint
  console.log('\n4️⃣ Testing customer login API endpoint...');
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/customer-auth/login`, {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API login successful!');
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ API login failed:');
    console.log(`   Status: ${error.response?.status || 'No status'}`);
    console.log(`   Status Text: ${error.response?.statusText || 'No status text'}`);
    console.log(`   Error Message: ${error.response?.data?.message || error.message}`);
    console.log(`   Full Error Data:`, error.response?.data || 'No data');
    
    // Step 5: Check if it's a validation error
    if (error.response?.status === 400) {
      console.log('\n🔍 Checking for validation errors...');
      console.log('Request payload:', {
        trackingNumber: 'MSKU4603728',
        password: 'customer123'
      });
    }
    
    // Step 6: Test with different approaches
    console.log('\n5️⃣ Testing alternative approaches...');
    
    // Try with customer number if available
    if (customer.customer_number) {
      console.log('   Testing with customer number...');
      try {
        const customerNumberResponse = await axios.post(`${API_BASE_URL}/customer-auth/login-customer-number`, {
          customerNumber: customer.customer_number,
          password: 'customer123'
        });
        console.log('✅ Customer number login successful!');
        console.log('Response:', JSON.stringify(customerNumberResponse.data, null, 2));
      } catch (cnError) {
        console.log('❌ Customer number login also failed:', cnError.response?.data?.message || cnError.message);
      }
    }
    
    // Try direct access if token exists
    if (customer.direct_access_token) {
      console.log('   Testing with direct access token...');
      try {
        const directAccessResponse = await axios.post(`${API_BASE_URL}/customer-auth/direct-access`, {
          token: customer.direct_access_token
        });
        console.log('✅ Direct access login successful!');
        console.log('Response:', JSON.stringify(directAccessResponse.data, null, 2));
      } catch (daError) {
        console.log('❌ Direct access login also failed:', daError.response?.data?.message || daError.message);
      }
    }
  }
  
  // Step 6: Check TypeORM entity mapping
  console.log('\n6️⃣ Checking if there are any entity mapping issues...');
  console.log('   Database column names:');
  console.log(`   - tracking_number: ${customer.tracking_number}`);
  console.log(`   - password_hash: ${customer.password_hash ? 'Present' : 'Missing'}`);
  console.log(`   - is_active: ${customer.is_active}`);
  console.log(`   - has_portal_access: ${customer.has_portal_access}`);
  
  console.log('\n🔍 Debug Summary:');
  console.log('================');
  console.log(`✅ Customer exists in database: ${!!customer}`);
  console.log(`✅ Password hash valid: ${passwordValid}`);
  console.log(`✅ Customer is active: ${customer.is_active === 1}`);
  console.log(`✅ Customer has portal access: ${customer.has_portal_access === 1}`);
  console.log(`❌ API login fails despite valid credentials`);
  console.log('\n💡 Possible issues:');
  console.log('   - TypeORM entity mapping mismatch');
  console.log('   - Database connection issues in the API');
  console.log('   - Authentication service logic error');
  console.log('   - Request/response middleware interference');
}

debugCustomerAuth().catch(console.error);