const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testAdminShipmentManagement() {
  console.log('🔍 Testing Admin Shipment Management APIs...\n');

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

    // Step 2: Get all shipments
    console.log('2. Testing get all shipments...');
    const shipmentsResponse = await axios.get(`${baseURL}/admin/shipments`, { headers });
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
        status: firstShipment.status,
        enableTracking: firstShipment.enableTracking,
        customerName: firstShipment.customerAccount?.customerName
      });
      console.log('');

      // Step 3: Get shipment details
      console.log('3. Testing get shipment details...');
      const shipmentDetailsResponse = await axios.get(
        `${baseURL}/admin/shipments/${firstShipment.id}`, 
        { headers }
      );
      console.log('✅ Shipment details received!');
      console.log('Shipment details preview:', {
        trackingNumber: shipmentDetailsResponse.data.trackingNumber,
        status: shipmentDetailsResponse.data.status,
        originPort: shipmentDetailsResponse.data.originPort,
        destinationPort: shipmentDetailsResponse.data.destinationPort,
        enableTracking: shipmentDetailsResponse.data.enableTracking
      });
      console.log('');

      // Step 4: Test status update
      console.log('4. Testing status update...');
      const statusUpdateResponse = await axios.put(
        `${baseURL}/admin/shipments/${firstShipment.id}/status`,
        { 
          status: 'at_port',
          notes: 'Shipment has arrived at destination port and is awaiting customs clearance'
        },
        { headers }
      );
      console.log('✅ Status updated successfully!');
      console.log('Status update result:', {
        message: statusUpdateResponse.data.message,
        newStatus: statusUpdateResponse.data.shipment.status,
        trackingNumber: statusUpdateResponse.data.shipment.trackingNumber
      });
      console.log('');

      // Step 5: Test location update
      console.log('5. Testing location update...');
      const locationUpdateResponse = await axios.put(
        `${baseURL}/admin/shipments/${firstShipment.id}/location`,
        { 
          currentLocation: 'Benghazi Port - Customs Area',
          vesselName: 'MSC OSCAR',
          vesselMmsi: '636019825',
          notes: 'Container moved to customs inspection area'
        },
        { headers }
      );
      console.log('✅ Location updated successfully!');
      console.log('Location update result:', {
        message: locationUpdateResponse.data.message,
        currentLocation: locationUpdateResponse.data.shipment.currentLocation,
        vesselName: locationUpdateResponse.data.shipment.vesselName
      });
      console.log('');

      // Step 6: Test warehouse arrival
      console.log('6. Testing warehouse arrival...');
      const warehouseArrivalResponse = await axios.post(
        `${baseURL}/admin/shipments/${firstShipment.id}/warehouse-arrival`,
        { 
          warehouseLocation: 'Warehouse A - Section 3',
          condition: 'excellent',
          notes: 'All items received in perfect condition. Ready for customer pickup.',
          disableTracking: true
        },
        { headers }
      );
      console.log('✅ Warehouse arrival marked successfully!');
      console.log('Warehouse arrival result:', {
        message: warehouseArrivalResponse.data.message,
        status: warehouseArrivalResponse.data.shipment.status,
        warehouseLocation: warehouseArrivalResponse.data.shipment.warehouseLocation,
        condition: warehouseArrivalResponse.data.shipment.condition,
        trackingDisabled: !warehouseArrivalResponse.data.shipment.enableTracking
      });
      console.log('');

      // Step 7: Test tracking settings update
      console.log('7. Testing tracking settings update...');
      const trackingSettingsResponse = await axios.put(
        `${baseURL}/admin/shipments/${firstShipment.id}/tracking-settings`,
        { 
          enableTracking: false,
          containerNumber: 'MSKU4603728',
          blNumber: 'MSCUBL123456789',
          bookingNumber: 'MSC240915001'
        },
        { headers }
      );
      console.log('✅ Tracking settings updated successfully!');
      console.log('Tracking settings result:', {
        message: trackingSettingsResponse.data.message,
        enableTracking: trackingSettingsResponse.data.shipment.enableTracking,
        containerNumber: trackingSettingsResponse.data.shipment.containerNumber,
        blNumber: trackingSettingsResponse.data.shipment.blNumber
      });
      console.log('');

      // Step 8: Test shipment update
      console.log('8. Testing shipment update...');
      const shipmentUpdateResponse = await axios.put(
        `${baseURL}/admin/shipments/${firstShipment.id}`,
        { 
          description: 'Electronics and Personal Items from China - Updated by Admin',
          weight: 130.0,
          volume: 2.5,
          specialInstructions: 'Handle with extra care - contains fragile electronics',
          notes: 'Updated shipment details after warehouse inspection'
        },
        { headers }
      );
      console.log('✅ Shipment updated successfully!');
      console.log('Shipment update result:', {
        message: shipmentUpdateResponse.data.message,
        updatedFields: shipmentUpdateResponse.data.updatedFields,
        description: shipmentUpdateResponse.data.shipment.description,
        weight: shipmentUpdateResponse.data.shipment.weight
      });
      console.log('');

      // Step 9: Test update history
      console.log('9. Testing update history...');
      const updateHistoryResponse = await axios.get(
        `${baseURL}/admin/shipments/${firstShipment.id}/update-history`,
        { headers }
      );
      console.log('✅ Update history retrieved successfully!');
      console.log('Update history preview:', {
        totalUpdates: updateHistoryResponse.data.pagination.total,
        updatesOnPage: updateHistoryResponse.data.updates.length,
        trackingNumber: updateHistoryResponse.data.shipment.trackingNumber
      });
      
      if (updateHistoryResponse.data.updates.length > 0) {
        console.log('Recent updates:');
        updateHistoryResponse.data.updates.slice(0, 3).forEach((update, index) => {
          console.log(`  ${index + 1}. ${update.content} (${update.timestamp})`);
        });
      }
      console.log('');
    }

    // Step 10: Test shipment search
    console.log('10. Testing shipment search...');
    const searchResponse = await axios.get(`${baseURL}/admin/shipments?search=MSKU`, { headers });
    console.log('✅ Shipment search completed!');
    console.log('Search results:', {
      totalFound: searchResponse.data.pagination.total,
      resultsOnPage: searchResponse.data.shipments.length
    });
    console.log('');

    // Step 11: Test status filter
    console.log('11. Testing status filter...');
    const statusFilterResponse = await axios.get(`${baseURL}/admin/shipments?status=delivered`, { headers });
    console.log('✅ Status filter completed!');
    console.log('Filter results:', {
      totalDelivered: statusFilterResponse.data.pagination.total,
      resultsOnPage: statusFilterResponse.data.shipments.length
    });
    console.log('');

    console.log('🎉 Admin Shipment Management API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testAdminShipmentManagement();
