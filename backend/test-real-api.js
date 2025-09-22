const axios = require('axios');

async function testRealShipsGoAPI() {
  try {
    console.log('🚢 Testing Real ShipsGo Container API v1.1 with MSKU4603728...\n');
    
    // Step 1: Create tracking request
    const postData = new URLSearchParams({
      authCode: 'b0fa5419120c2c74847084a67d1b03be',
      containerNumber: 'MSKU4603728',
      shippingLine: 'OTHERS'
    });

    console.log('📝 Step 1: Creating tracking request...');
    const postResponse = await axios.post(
      'https://shipsgo.com/api/v1.1/ContainerService/PostContainerInfo',
      postData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log('✅ POST Response:', postResponse.data);
    
    // Step 2: Get tracking data
    const requestId = postResponse.data.requestId || postResponse.data.RequestId || 'MSKU4603728';
    
    console.log('\n📊 Step 2: Getting tracking data with requestId:', requestId);
    const getResponse = await axios.get(
      'https://shipsgo.com/api/v1.1/ContainerService/GetContainerInfo/',
      {
        params: {
          authCode: 'b0fa5419120c2c74847084a67d1b03be',
          requestId: requestId,
          mapPoint: 'true',
          co2: 'true',
          containerType: 'true'
        },
        headers: {
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );
    
    console.log('✅ GET Response:');
    console.log(JSON.stringify(getResponse.data, null, 2));
    
    // Step 3: Transform data like our service does
    const data = Array.isArray(getResponse.data) ? getResponse.data[0] : getResponse.data;
    
    console.log('\n🔄 Transformed Data:');
    const transformedData = {
      success: true,
      message: data.Message || 'Tracking data retrieved successfully',
      data: {
        container_number: data.ContainerNumber || data.BLReferenceNo || '',
        bl_number: data.BLReferenceNo || '',
        shipping_line: data.ShippingLine || '',
        vessel_name: data.Vessel || '',
        vessel_imo: data.VesselIMO || '',
        port_of_loading: data.Pol || '',
        port_of_discharge: data.Pod || '',
        loading_country: data.FromCountry || '',
        discharge_country: data.ToCountry || '',
        status: data.Status || 'Unknown',
        status_id: data.StatusId || null,
        eta: data.ETA || null,
        first_eta: data.FirstETA || null,
        container_type: data.ContainerType || '',
        container_teu: data.ContainerTEU || '',
        transit_time: data.FormatedTransitTime || '',
        co2_emissions: data.Co2Emission || null,
        live_map_url: data.LiveMapUrl || '',
      },
      timestamp: new Date().toISOString(),
    };
    
    console.log(JSON.stringify(transformedData, null, 2));
    
    console.log('\n🎉 SUCCESS: Real ShipsGo API is working perfectly!');
    console.log('📍 Container Status:', data.Status);
    console.log('🚢 Vessel:', data.Vessel);
    console.log('🌍 Route:', data.Pol, '→', data.Pod);
    console.log('⏱️ Transit Time:', data.FormatedTransitTime);
    console.log('🌱 CO2 Emission:', data.Co2Emission, 'tons');
    
  } catch (error) {
    console.log('❌ ShipsGo Container API Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    console.log('Response:', error.response?.data);
  }
}

testRealShipsGoAPI();
