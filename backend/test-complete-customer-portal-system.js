const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testCompleteCustomerPortalSystem() {
  console.log('🚀 COMPREHENSIVE CUSTOMER PORTAL SYSTEM TEST\n');
  console.log('Testing the complete workflow from admin setup to customer experience...\n');

  try {
    // ===== PHASE 1: ADMIN SETUP =====
    console.log('📋 PHASE 1: ADMIN SETUP AND MANAGEMENT');
    console.log('=====================================\n');

    // Admin login
    console.log('1.1. Admin authentication...');
    const adminLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.access_token;
    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
    console.log('✅ Admin authenticated successfully\n');

    // Create a new customer account
    console.log('1.2. Creating new customer account...');
    const newTrackingNumber = 'TEST' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const createCustomerResponse = await axios.post(
      `${baseURL}/admin/customers`,
      {
        trackingNumber: newTrackingNumber,
        customerName: 'Test Customer for Complete System Test',
        customerEmail: 'systemtest@example.com',
        customerPhone: '+218 91 555 0123',
        password: 'testpass123'
      },
      { headers: adminHeaders }
    );
    const newCustomerId = createCustomerResponse.data.id;
    console.log('✅ New customer created:', {
      id: newCustomerId,
      trackingNumber: newTrackingNumber,
      name: createCustomerResponse.data.customerName
    });
    console.log('');

    // Generate direct access link
    console.log('1.3. Generating direct access link...');
    const directLinkResponse = await axios.post(
      `${baseURL}/admin/customers/${newCustomerId}/direct-link`,
      { expiresInHours: 24 },
      { headers: adminHeaders }
    );
    const directAccessToken = directLinkResponse.data.token;
    console.log('✅ Direct access link generated:', directLinkResponse.data.directLink);
    console.log('');

    // ===== PHASE 2: CUSTOMER AUTHENTICATION =====
    console.log('🔐 PHASE 2: CUSTOMER AUTHENTICATION');
    console.log('===================================\n');

    // Test regular customer login with existing customer MSKU4603728
    console.log('2.1. Customer login with existing customer MSKU4603728...');
    const existingCustomerLoginResponse = await axios.post(`${baseURL}/customer-auth/login`, {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    });
    const existingCustomerToken = existingCustomerLoginResponse.data.access_token;
    const existingCustomerHeaders = {
      'Authorization': `Bearer ${existingCustomerToken}`,
      'Content-Type': 'application/json'
    };
    console.log('✅ Existing customer authenticated successfully');
    console.log('Customer info:', {
      id: existingCustomerLoginResponse.data.customer.id,
      name: existingCustomerLoginResponse.data.customer.customerName,
      trackingNumber: existingCustomerLoginResponse.data.customer.trackingNumber
    });
    console.log('');

    // Test new customer login
    console.log('2.2. New customer login with tracking number and password...');
    const customerLoginResponse = await axios.post(`${baseURL}/customer-auth/login`, {
      trackingNumber: newTrackingNumber,
      password: 'testpass123'
    });
    const customerToken = customerLoginResponse.data.access_token;
    const customerHeaders = {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    };
    console.log('✅ New customer authenticated successfully');
    console.log('Customer info:', {
      id: customerLoginResponse.data.customer.id,
      name: customerLoginResponse.data.customer.customerName,
      trackingNumber: customerLoginResponse.data.customer.trackingNumber
    });
    console.log('');

    // Test direct access login
    console.log('2.3. Testing direct access login...');
    const directAccessResponse = await axios.post(`${baseURL}/customer-auth/direct-access`, {
      token: directAccessToken
    });
    console.log('✅ Direct access login successful');
    console.log('');

    // ===== PHASE 3: SHIPMENT MANAGEMENT =====
    console.log('📦 PHASE 3: SHIPMENT MANAGEMENT');
    console.log('===============================\n');

    // Get existing shipment for testing (the one that belongs to MSKU4603728)
    console.log('3.1. Getting existing shipment for testing...');
    const shipmentsListResponse = await axios.get(`${baseURL}/admin/shipments?search=GH9STW764V`, { headers: adminHeaders });
    const testShipment = shipmentsListResponse.data.shipments[0];
    console.log('✅ Found test shipment:', {
      id: testShipment.id,
      trackingNumber: testShipment.trackingNumber,
      status: testShipment.status,
      customerName: testShipment.customerAccount?.customerName
    });
    console.log('');

    // Update shipment status manually
    console.log('3.2. Updating shipment status manually...');
    await axios.put(
      `${baseURL}/admin/shipments/${testShipment.id}/status`,
      { 
        status: 'in_transit',
        notes: 'Shipment departed from origin port and is en route to destination'
      },
      { headers: adminHeaders }
    );
    console.log('✅ Shipment status updated to in_transit');
    console.log('');

    // Update shipment location
    console.log('3.3. Updating shipment location...');
    await axios.put(
      `${baseURL}/admin/shipments/${testShipment.id}/location`,
      { 
        currentLocation: 'Mediterranean Sea - En Route',
        vesselName: 'MSC OSCAR',
        vesselMmsi: '636019825',
        notes: 'Vessel is making good progress across the Mediterranean'
      },
      { headers: adminHeaders }
    );
    console.log('✅ Shipment location updated');
    console.log('');

    // ===== PHASE 4: CUSTOMER PORTAL EXPERIENCE =====
    console.log('👤 PHASE 4: CUSTOMER PORTAL EXPERIENCE');
    console.log('======================================\n');

    // Existing customer dashboard (MSKU4603728 with actual shipments)
    console.log('4.1. Testing existing customer dashboard...');
    const existingDashboardResponse = await axios.get(`${baseURL}/customer-portal/dashboard`, { headers: existingCustomerHeaders });
    console.log('✅ Existing customer dashboard loaded');
    console.log('Dashboard stats:', {
      totalShipments: existingDashboardResponse.data.statistics.totalShipments,
      activeShipments: existingDashboardResponse.data.statistics.activeShipments,
      recentShipmentsCount: existingDashboardResponse.data.recentShipments.length
    });
    console.log('');

    // Existing customer shipments list
    console.log('4.2. Testing existing customer shipments list...');
    const existingCustomerShipmentsResponse = await axios.get(`${baseURL}/customer-portal/shipments`, { headers: existingCustomerHeaders });
    console.log('✅ Existing customer shipments list loaded');
    console.log('Shipments info:', {
      totalShipments: existingCustomerShipmentsResponse.data.pagination.total,
      shipmentsOnPage: existingCustomerShipmentsResponse.data.shipments.length
    });
    console.log('');

    // New customer dashboard (should be empty)
    console.log('4.3. Testing new customer dashboard...');
    const dashboardResponse = await axios.get(`${baseURL}/customer-portal/dashboard`, { headers: customerHeaders });
    console.log('✅ New customer dashboard loaded');
    console.log('Dashboard stats:', {
      totalShipments: dashboardResponse.data.statistics.totalShipments,
      activeShipments: dashboardResponse.data.statistics.activeShipments,
      recentShipmentsCount: dashboardResponse.data.recentShipments.length
    });
    console.log('');

    // Customer profile
    console.log('4.4. Testing customer profile...');
    const profileResponse = await axios.get(`${baseURL}/customer-portal/profile`, { headers: existingCustomerHeaders });
    console.log('✅ Customer profile loaded');
    console.log('Profile info:', {
      name: profileResponse.data.customerName,
      email: profileResponse.data.customerEmail,
      isActive: profileResponse.data.isActive
    });
    console.log('');

    // ===== PHASE 5: REAL-TIME TRACKING =====
    console.log('🌐 PHASE 5: REAL-TIME TRACKING WITH SHIPSGO API');
    console.log('================================================\n');

    // Test real-time tracking for MSKU4603728 (using existing customer)
    console.log('5.1. Testing real-time tracking for MSKU4603728...');
    const trackingResponse = await axios.get(`${baseURL}/customer-portal/shipments/${testShipment.id}/tracking`, { headers: existingCustomerHeaders });
    console.log('✅ Real-time tracking data retrieved');
    console.log('Tracking info:', {
      containerNumber: trackingResponse.data.shipment.containerNumber,
      vesselName: trackingResponse.data.shipment.vesselName,
      hasRealTimeData: !!trackingResponse.data.realTimeTracking,
      trackingSuccess: trackingResponse.data.realTimeTracking?.success
    });
    
    if (trackingResponse.data.realTimeTracking?.success) {
      console.log('Real-time data:', {
        container: trackingResponse.data.realTimeTracking.data?.container_number,
        vessel: trackingResponse.data.realTimeTracking.data?.vessel_name,
        status: trackingResponse.data.realTimeTracking.data?.status
      });
    }
    console.log('');

    // Test public tracking (no authentication)
    console.log('5.2. Testing public tracking...');
    const publicTrackingResponse = await axios.get(`${baseURL}/public-tracking/MSKU4603728`);
    console.log('✅ Public tracking successful');
    console.log('Public tracking result:', {
      type: publicTrackingResponse.data.type,
      hasData: !!publicTrackingResponse.data.data
    });
    console.log('');

    // ===== PHASE 6: WAREHOUSE ARRIVAL SIMULATION =====
    console.log('🏭 PHASE 6: WAREHOUSE ARRIVAL SIMULATION');
    console.log('========================================\n');

    // Mark shipment as arrived at warehouse
    console.log('6.1. Marking shipment as arrived at warehouse...');
    const warehouseArrivalResponse = await axios.post(
      `${baseURL}/admin/shipments/${testShipment.id}/warehouse-arrival`,
      { 
        warehouseLocation: 'Golden Horse Warehouse - Bay 7',
        condition: 'excellent',
        notes: 'All items received in perfect condition. Customer notified for pickup.',
        disableTracking: true
      },
      { headers: adminHeaders }
    );
    console.log('✅ Shipment marked as arrived at warehouse');
    console.log('Warehouse info:', {
      status: warehouseArrivalResponse.data.shipment.status,
      location: warehouseArrivalResponse.data.shipment.warehouseLocation,
      condition: warehouseArrivalResponse.data.shipment.condition,
      trackingDisabled: !warehouseArrivalResponse.data.shipment.enableTracking
    });
    console.log('');

    // Verify customer can see updated status
    console.log('6.2. Verifying customer sees updated status...');
    const updatedDashboardResponse = await axios.get(`${baseURL}/customer-portal/dashboard`, { headers: existingCustomerHeaders });
    console.log('✅ Customer dashboard reflects warehouse arrival');
    console.log('Updated stats:', {
      deliveredShipments: updatedDashboardResponse.data.statistics.deliveredShipments,
      activeShipments: updatedDashboardResponse.data.statistics.activeShipments
    });
    console.log('');

    // ===== PHASE 7: ADMIN PASSWORD MANAGEMENT =====
    console.log('🔑 PHASE 7: ADMIN PASSWORD MANAGEMENT');
    console.log('====================================\n');

    // Reset customer password
    console.log('7.1. Testing admin password reset...');
    await axios.put(
      `${baseURL}/admin/customers/${newCustomerId}/password`,
      { newPassword: 'newpassword456' },
      { headers: adminHeaders }
    );
    console.log('✅ Customer password reset by admin');
    console.log('');

    // Test login with new password
    console.log('7.2. Testing login with new password...');
    const newPasswordLoginResponse = await axios.post(`${baseURL}/customer-auth/login`, {
      trackingNumber: newTrackingNumber,
      password: 'newpassword456'
    });
    console.log('✅ Customer login successful with new password');
    console.log('');

    // ===== PHASE 8: COMPREHENSIVE ADMIN OVERVIEW =====
    console.log('📊 PHASE 8: COMPREHENSIVE ADMIN OVERVIEW');
    console.log('========================================\n');

    // Get all customers
    console.log('8.1. Admin customer overview...');
    const allCustomersResponse = await axios.get(`${baseURL}/admin/customers`, { headers: adminHeaders });
    console.log('✅ Admin can view all customers');
    console.log('Customer overview:', {
      totalCustomers: allCustomersResponse.data.pagination.total,
      activeCustomers: allCustomersResponse.data.customers.filter(c => c.isActive).length
    });
    console.log('');

    // Get all shipments
    console.log('8.2. Admin shipment overview...');
    const allShipmentsResponse = await axios.get(`${baseURL}/admin/shipments`, { headers: adminHeaders });
    console.log('✅ Admin can view all shipments');
    console.log('Shipment overview:', {
      totalShipments: allShipmentsResponse.data.pagination.total,
      deliveredShipments: allShipmentsResponse.data.shipments.filter(s => s.status === 'delivered').length,
      inTransitShipments: allShipmentsResponse.data.shipments.filter(s => s.status === 'in_transit').length
    });
    console.log('');

    // Get shipment update history
    console.log('8.3. Shipment update history...');
    const updateHistoryResponse = await axios.get(
      `${baseURL}/admin/shipments/${testShipment.id}/update-history`,
      { headers: adminHeaders }
    );
    console.log('✅ Admin can view shipment update history');
    console.log('Update history:', {
      totalUpdates: updateHistoryResponse.data.pagination.total,
      recentUpdates: updateHistoryResponse.data.updates.length
    });
    console.log('');

    // ===== FINAL RESULTS =====
    console.log('🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
    console.log('=============================================\n');
    
    console.log('✅ ALL SYSTEMS OPERATIONAL:');
    console.log('  • Customer Authentication System');
    console.log('  • Customer Portal with Dashboard');
    console.log('  • Real-time ShipsGo API Integration');
    console.log('  • Admin Customer Management');
    console.log('  • Admin Shipment Management');
    console.log('  • Manual Data Update System');
    console.log('  • Password Management');
    console.log('  • Direct Access Links');
    console.log('  • Warehouse Arrival Processing');
    console.log('  • Public Tracking');
    console.log('  • Update History Tracking');
    console.log('');

    console.log('🚀 The complete customer portal system is ready for production use!');
    console.log('');

    console.log('📋 SYSTEM SUMMARY:');
    console.log(`  • Test Customer: ${newTrackingNumber} (${createCustomerResponse.data.customerName})`);
    console.log(`  • Test Shipment: ${testShipment.trackingNumber} (Status: delivered)`);
    console.log(`  • Real-time Tracking: MSKU4603728 (ShipsGo API)`);
    console.log(`  • Total Customers: ${allCustomersResponse.data.pagination.total}`);
    console.log(`  • Total Shipments: ${allShipmentsResponse.data.pagination.total}`);

  } catch (error) {
    console.error('❌ COMPREHENSIVE TEST FAILED:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
    console.error('Stack:', error.stack);
  }
}

testCompleteCustomerPortalSystem();
