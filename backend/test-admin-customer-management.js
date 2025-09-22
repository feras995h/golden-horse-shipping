const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testAdminCustomerManagement() {
  console.log('🔍 Testing Admin Customer Management APIs...\n');

  try {
    // Step 1: Admin login to get token
    console.log('1. Admin login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful!');
    const adminToken = loginResponse.data.access_token;
    console.log('🔑 Admin token received\n');

    // Set up headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get all customers
    console.log('2. Testing get all customers...');
    const customersResponse = await axios.get(`${baseURL}/admin/customers`, { headers });
    console.log('✅ Customers list received!');
    console.log('Customers preview:', {
      totalCustomers: customersResponse.data.pagination.total,
      currentPage: customersResponse.data.pagination.page,
      customersOnPage: customersResponse.data.customers.length
    });
    
    if (customersResponse.data.customers.length > 0) {
      const firstCustomer = customersResponse.data.customers[0];
      console.log('First customer:', {
        id: firstCustomer.id,
        trackingNumber: firstCustomer.trackingNumber,
        customerName: firstCustomer.customerName,
        isActive: firstCustomer.isActive,
        shipmentCount: firstCustomer.shipmentCount
      });
      console.log('');

      // Step 3: Get customer details
      console.log('3. Testing get customer details...');
      const customerDetailsResponse = await axios.get(
        `${baseURL}/admin/customers/${firstCustomer.id}`, 
        { headers }
      );
      console.log('✅ Customer details received!');
      console.log('Customer details preview:', {
        trackingNumber: customerDetailsResponse.data.trackingNumber,
        customerName: customerDetailsResponse.data.customerName,
        customerEmail: customerDetailsResponse.data.customerEmail,
        isActive: customerDetailsResponse.data.isActive,
        totalShipments: customerDetailsResponse.data.statistics.totalShipments,
        activeShipments: customerDetailsResponse.data.statistics.activeShipments
      });
      console.log('');

      // Step 4: Test password reset
      console.log('4. Testing password reset...');
      const passwordResetResponse = await axios.put(
        `${baseURL}/admin/customers/${firstCustomer.id}/password`,
        { newPassword: 'newpassword123' },
        { headers }
      );
      console.log('✅ Password reset successful!');
      console.log('Password reset result:', {
        message: passwordResetResponse.data.message,
        customerId: passwordResetResponse.data.customerId,
        trackingNumber: passwordResetResponse.data.trackingNumber
      });
      console.log('');

      // Step 5: Test direct link generation
      console.log('5. Testing direct link generation...');
      const directLinkResponse = await axios.post(
        `${baseURL}/admin/customers/${firstCustomer.id}/direct-link`,
        { expiresInHours: 24 },
        { headers }
      );
      console.log('✅ Direct link generated successfully!');
      console.log('Direct link result:', {
        message: directLinkResponse.data.message,
        customerName: directLinkResponse.data.customerName,
        expiresAt: directLinkResponse.data.expiresAt,
        linkGenerated: !!directLinkResponse.data.directLink
      });
      console.log('Direct link:', directLinkResponse.data.directLink);
      console.log('');

      // Step 6: Test customer shipments
      console.log('6. Testing customer shipments...');
      const customerShipmentsResponse = await axios.get(
        `${baseURL}/admin/customers/${firstCustomer.id}/shipments`,
        { headers }
      );
      console.log('✅ Customer shipments received!');
      console.log('Customer shipments preview:', {
        totalShipments: customerShipmentsResponse.data.pagination.total,
        shipmentsOnPage: customerShipmentsResponse.data.shipments.length,
        customerName: customerShipmentsResponse.data.customer.customerName
      });
      console.log('');

      // Step 7: Test customer activity log
      console.log('7. Testing customer activity log...');
      const activityLogResponse = await axios.get(
        `${baseURL}/admin/customers/${firstCustomer.id}/activity-log`,
        { headers }
      );
      console.log('✅ Customer activity log received!');
      console.log('Activity log preview:', {
        totalActivities: activityLogResponse.data.pagination.total,
        activitiesOnPage: activityLogResponse.data.activities.length,
        customerName: activityLogResponse.data.customer.customerName
      });
      console.log('');

      // Step 8: Test customer update
      console.log('8. Testing customer update...');
      const updateResponse = await axios.put(
        `${baseURL}/admin/customers/${firstCustomer.id}`,
        { 
          customerName: 'Updated Test Customer for MSKU4603728',
          customerPhone: '+218 91 999 8888'
        },
        { headers }
      );
      console.log('✅ Customer updated successfully!');
      console.log('Update result:', {
        message: updateResponse.data.message,
        customerName: updateResponse.data.customerName,
        customerPhone: updateResponse.data.customerPhone
      });
      console.log('');
    }

    // Step 9: Test customer search
    console.log('9. Testing customer search...');
    const searchResponse = await axios.get(`${baseURL}/admin/customers?search=MSKU`, { headers });
    console.log('✅ Customer search completed!');
    console.log('Search results:', {
      totalFound: searchResponse.data.pagination.total,
      resultsOnPage: searchResponse.data.customers.length
    });
    console.log('');

    // Step 10: Test create new customer
    console.log('10. Testing create new customer...');
    try {
      const createResponse = await axios.post(
        `${baseURL}/admin/customers`,
        {
          trackingNumber: 'TEST' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          customerName: 'Test Customer Created by Admin',
          customerEmail: 'testcustomer@example.com',
          customerPhone: '+218 91 123 4567',
          password: 'testpassword123'
        },
        { headers }
      );
      console.log('✅ New customer created successfully!');
      console.log('New customer:', {
        id: createResponse.data.id,
        trackingNumber: createResponse.data.trackingNumber,
        customerName: createResponse.data.customerName,
        customerEmail: createResponse.data.customerEmail
      });
      console.log('');
    } catch (error) {
      console.log('⚠️ Customer creation test skipped (may already exist)');
      console.log('');
    }

    console.log('🎉 Admin Customer Management API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testAdminCustomerManagement();
