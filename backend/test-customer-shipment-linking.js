const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let adminToken = '';
let testCustomerId = '';
let testShipmentId = '';

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    adminToken = response.data.access_token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestCustomer() {
  try {
    console.log('\n👤 Creating test customer...');
    const customerData = {
      trackingNumber: `TEST${Date.now()}`,
      customerName: 'Test Customer for Shipment Linking',
      customerEmail: `test.shipment.${Date.now()}@example.com`,
      customerPhone: '+1234567890',
      password: 'testpass123'
    };

    const response = await axios.post(
      `${API_BASE_URL}/admin/customers`,
      customerData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    testCustomerId = response.data.id;
    console.log('✅ Test customer created successfully');
    console.log('Customer ID:', testCustomerId);
    console.log('Tracking Number:', response.data.trackingNumber);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create test customer:', error.response?.data || error.message);
    return null;
  }
}

async function createTestShipment(customerAccountId) {
  try {
    console.log('\n📦 Creating test shipment...');
    const shipmentData = {
      clientId: '2a76dc53-a758-4d4a-9216-05d56bb31550', // Using existing client ID
      customerAccountId: customerAccountId, // Link to customer
      description: 'Test Shipment for Customer Linking',
      type: 'sea',
      originPort: 'Shanghai Port',
      destinationPort: 'Benghazi Port',
      weight: 100.5,
      volume: 2.0,
      value: 1500.00,
      currency: 'USD',
      totalCost: 250.00,
      containerNumber: 'TEST123456',
      blNumber: 'BL123456789',
      bookingNumber: 'BK123456',
      shippingLine: 'Test Shipping Line',
      voyage: 'TEST001',
      enableTracking: true,
      notes: 'Test shipment for customer linking verification'
    };

    const response = await axios.post(
      `${API_BASE_URL}/shipments`,
      shipmentData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    testShipmentId = response.data.id;
    console.log('✅ Test shipment created successfully');
    console.log('Shipment ID:', testShipmentId);
    console.log('Tracking Number:', response.data.trackingNumber);
    console.log('Customer Account ID:', response.data.customerAccountId);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create test shipment:', error.response?.data || error.message);
    return null;
  }
}

async function testCustomerLogin(trackingNumber, password) {
  try {
    console.log('\n🔑 Testing customer login...');
    const response = await axios.post(`${API_BASE_URL}/customer-auth/login`, {
      trackingNumber: trackingNumber,
      password: password
    });

    console.log('✅ Customer login successful');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Customer login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCustomerShipmentAccess(customerToken) {
  try {
    console.log('\n📋 Testing customer shipment access...');
    const response = await axios.get(
      `${API_BASE_URL}/customer-portal/shipments`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    console.log('✅ Customer can access shipments');
    console.log('Total shipments:', response.data.total);
    console.log('Shipments found:', response.data.shipments.length);
    
    if (response.data.shipments.length > 0) {
      const shipment = response.data.shipments[0];
      console.log('First shipment details:');
      console.log('- ID:', shipment.id);
      console.log('- Tracking Number:', shipment.trackingNumber);
      console.log('- Description:', shipment.description);
      console.log('- Status:', shipment.status);
    }

    return response.data.shipments;
  } catch (error) {
    console.error('❌ Customer shipment access failed:', error.response?.data || error.message);
    return null;
  }
}

async function testShipmentDetails(customerToken, shipmentId) {
  try {
    console.log('\n🔍 Testing shipment details access...');
    const response = await axios.get(
      `${API_BASE_URL}/customer-portal/shipments/${shipmentId}`,
      {
        headers: { Authorization: `Bearer ${customerToken}` }
      }
    );

    console.log('✅ Customer can access shipment details');
    console.log('Shipment details:');
    console.log('- ID:', response.data.id);
    console.log('- Tracking Number:', response.data.trackingNumber);
    console.log('- Description:', response.data.description);
    console.log('- Customer Account ID:', response.data.customerAccountId);
    return response.data;
  } catch (error) {
    console.error('❌ Shipment details access failed:', error.response?.data || error.message);
    return null;
  }
}

async function verifyShipmentInAdmin() {
  try {
    console.log('\n🔧 Verifying shipment in admin panel...');
    const response = await axios.get(
      `${API_BASE_URL}/admin/shipments?customerId=${testCustomerId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ Admin can see customer shipments');
    console.log('Total shipments for customer:', response.data.total);
    
    if (response.data.shipments.length > 0) {
      const shipment = response.data.shipments[0];
      console.log('Shipment in admin:');
      console.log('- ID:', shipment.id);
      console.log('- Tracking Number:', shipment.trackingNumber);
      console.log('- Customer Account ID:', shipment.customerAccountId);
      console.log('- Customer Name:', shipment.customerAccount?.fullName);
    }

    return response.data.shipments;
  } catch (error) {
    console.error('❌ Admin shipment verification failed:', error.response?.data || error.message);
    return null;
  }
}

async function cleanup() {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test shipment
    if (testShipmentId) {
      await axios.delete(
        `${API_BASE_URL}/admin/shipments/${testShipmentId}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('✅ Test shipment deleted');
    }

    // Delete test customer
    if (testCustomerId) {
      await axios.delete(
        `${API_BASE_URL}/admin/customers/${testCustomerId}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log('✅ Test customer deleted');
    }
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.response?.data || error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Customer-Shipment Linking Test...\n');

  try {
    // Step 1: Login as admin
    const adminLoginSuccess = await loginAsAdmin();
    if (!adminLoginSuccess) {
      console.log('❌ Test failed: Cannot login as admin');
      return;
    }

    // Step 2: Create test customer
    const customer = await createTestCustomer();
    if (!customer) {
      console.log('❌ Test failed: Cannot create test customer');
      return;
    }

    // Step 3: Create test shipment linked to customer
    const shipment = await createTestShipment(customer.id);
    if (!shipment) {
      console.log('❌ Test failed: Cannot create test shipment');
      await cleanup();
      return;
    }

    // Step 4: Test customer login
    const customerToken = await testCustomerLogin(customer.trackingNumber, 'testpass123');
    if (!customerToken) {
      console.log('❌ Test failed: Customer cannot login');
      await cleanup();
      return;
    }

    // Step 5: Test customer shipment access
    const customerShipments = await testCustomerShipmentAccess(customerToken);
    if (!customerShipments) {
      console.log('❌ Test failed: Customer cannot access shipments');
      await cleanup();
      return;
    }

    // Step 6: Test shipment details access
    const shipmentDetails = await testShipmentDetails(customerToken, testShipmentId);
    if (!shipmentDetails) {
      console.log('❌ Test failed: Customer cannot access shipment details');
      await cleanup();
      return;
    }

    // Step 7: Verify shipment in admin panel
    const adminShipments = await verifyShipmentInAdmin();
    if (!adminShipments) {
      console.log('❌ Test failed: Admin cannot see customer shipments');
      await cleanup();
      return;
    }

    // Step 8: Verify linking is correct
    console.log('\n✅ VERIFICATION RESULTS:');
    console.log('- Customer can login:', !!customerToken);
    console.log('- Customer can see shipments:', customerShipments.length > 0);
    console.log('- Shipment is linked to customer:', shipmentDetails.customerAccountId === customer.id);
    console.log('- Admin can filter by customer:', adminShipments.length > 0);

    if (customerShipments.length > 0 && 
        shipmentDetails.customerAccountId === customer.id && 
        adminShipments.length > 0) {
      console.log('\n🎉 ALL TESTS PASSED! Customer-Shipment linking is working correctly.');
    } else {
      console.log('\n❌ SOME TESTS FAILED! Customer-Shipment linking has issues.');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    // Cleanup
    await cleanup();
    console.log('\n🏁 Test completed.');
  }
}

// Run the test
runTest().catch(console.error);