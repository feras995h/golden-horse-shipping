const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testCustomerPortal() {
  console.log('🔍 Testing Customer Portal APIs...\n');

  try {
    // Step 1: Customer login to get token
    console.log('1. Customer login...');
    const loginResponse = await axios.post(`${baseURL}/customer-auth/login`, {
      trackingNumber: 'MSKU4603728',
      password: 'customer123'
    });
    
    console.log('✅ Customer login successful!');
    const customerToken = loginResponse.data.access_token;
    const customerId = loginResponse.data.customer.id;
    console.log('Customer ID:', customerId);
    console.log('🔑 Customer token received\n');

    // Set up headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test customer dashboard
    console.log('2. Testing customer dashboard...');
    const dashboardResponse = await axios.get(`${baseURL}/customer-portal/dashboard`, { headers });
    console.log('✅ Dashboard data received!');
    console.log('Dashboard preview:', {
      customerName: dashboardResponse.data.customer.customerName,
      totalShipments: dashboardResponse.data.statistics.totalShipments,
      activeShipments: dashboardResponse.data.statistics.activeShipments,
      recentShipmentsCount: dashboardResponse.data.recentShipments.length
    });
    console.log('');

    // Step 3: Test customer shipments list
    console.log('3. Testing customer shipments list...');
    const shipmentsResponse = await axios.get(`${baseURL}/customer-portal/shipments`, { headers });
    console.log('✅ Shipments list received!');
    console.log('Shipments preview:', {
      totalShipments: shipmentsResponse.data.pagination.total,
      currentPage: shipmentsResponse.data.pagination.page,
      shipmentsOnPage: shipmentsResponse.data.shipments.length
    });
    
    if (shipmentsResponse.data.shipments.length > 0) {
      const firstShipment = shipmentsResponse.data.shipments[0];
      console.log('First shipment:', {
        id: firstShipment.id,
        trackingNumber: firstShipment.trackingNumber,
        description: firstShipment.description,
        status: firstShipment.status,
        containerNumber: firstShipment.containerNumber
      });
      console.log('');

      // Step 4: Test shipment details
      console.log('4. Testing shipment details...');
      const shipmentDetailsResponse = await axios.get(
        `${baseURL}/customer-portal/shipments/${firstShipment.id}`, 
        { headers }
      );
      console.log('✅ Shipment details received!');
      console.log('Shipment details preview:', {
        trackingNumber: shipmentDetailsResponse.data.shipment.trackingNumber,
        status: shipmentDetailsResponse.data.shipment.status,
        originPort: shipmentDetailsResponse.data.shipment.originPort,
        destinationPort: shipmentDetailsResponse.data.shipment.destinationPort,
        enableTracking: shipmentDetailsResponse.data.shipment.enableTracking
      });
      console.log('');

      // Step 5: Test real-time tracking
      if (shipmentDetailsResponse.data.shipment.enableTracking) {
        console.log('5. Testing real-time tracking...');
        const trackingResponse = await axios.get(
          `${baseURL}/customer-portal/shipments/${firstShipment.id}/tracking`, 
          { headers }
        );
        console.log('✅ Real-time tracking data received!');
        console.log('Tracking preview:', {
          containerNumber: trackingResponse.data.shipment.containerNumber,
          vesselName: trackingResponse.data.shipment.vesselName,
          hasRealTimeData: !!trackingResponse.data.realTimeTracking,
          trackingError: trackingResponse.data.trackingError
        });
        
        if (trackingResponse.data.realTimeTracking) {
          console.log('Real-time tracking data:', {
            success: trackingResponse.data.realTimeTracking.success,
            container: trackingResponse.data.realTimeTracking.data?.container_number,
            vessel: trackingResponse.data.realTimeTracking.data?.vessel_name,
            status: trackingResponse.data.realTimeTracking.data?.status
          });
        }
        console.log('');
      }
    }

    // Step 6: Test customer profile
    console.log('6. Testing customer profile...');
    const profileResponse = await axios.get(`${baseURL}/customer-portal/profile`, { headers });
    console.log('✅ Customer profile received!');
    console.log('Profile preview:', {
      trackingNumber: profileResponse.data.trackingNumber,
      customerName: profileResponse.data.customerName,
      customerEmail: profileResponse.data.customerEmail,
      isActive: profileResponse.data.isActive
    });
    console.log('');

    // Step 7: Test public tracking (no authentication required)
    console.log('7. Testing public tracking...');
    const publicTrackingResponse = await axios.get(`${baseURL}/public-tracking/MSKU4603728`);
    console.log('✅ Public tracking data received!');
    console.log('Public tracking preview:', {
      type: publicTrackingResponse.data.type,
      hasData: !!publicTrackingResponse.data.data
    });
    console.log('');

    console.log('🎉 Customer Portal API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testCustomerPortal();
