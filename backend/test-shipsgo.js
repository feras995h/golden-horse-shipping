// اختبار ShipsGo API
const axios = require('axios');

const testShipsGo = async () => {
  try {
    console.log('🔍 اختبار ShipsGo API...');
    
    // اختبار صحة التكامل
    const healthResponse = await axios.get('http://localhost:3001/api/shipsgo-tracking/health');
    console.log('✅ صحة التكامل:', healthResponse.data);
    
    // اختبار تتبع حاوية وهمية
    const testContainer = 'ABCD1234567';
    console.log(`🔍 اختبار تتبع الحاوية: ${testContainer}`);
    
    try {
      const trackingResponse = await axios.get(`http://localhost:3001/api/shipsgo-tracking/track?container=${testContainer}`);
      console.log('✅ بيانات التتبع:', JSON.stringify(trackingResponse.data, null, 2));
    } catch (error) {
      console.log('❌ خطأ في التتبع:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.message);
  }
};

testShipsGo();

