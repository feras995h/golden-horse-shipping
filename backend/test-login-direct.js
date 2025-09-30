const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🔐 اختبار تسجيل الدخول للمدير...\n');
  
  const loginData = {
    username: 'admin',
    password: 'admin123'
  };
  
  try {
    console.log('📤 إرسال طلب تسجيل الدخول...');
    console.log('🌐 الرابط:', `${BASE_URL}/auth/login`);
    console.log('📋 البيانات:', loginData);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('\n✅ نجح تسجيل الدخول!');
    console.log('📊 حالة الاستجابة:', response.status);
    console.log('📄 بيانات الاستجابة:', JSON.stringify(response.data, null, 2));
    
    if (response.data.access_token) {
      console.log('\n🎫 تم الحصول على رمز الوصول بنجاح!');
      console.log('🔑 الرمز:', response.data.access_token.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.log('\n❌ فشل في تسجيل الدخول!');
    
    if (error.response) {
      console.log('📊 حالة الخطأ:', error.response.status);
      console.log('📄 رسالة الخطأ:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('🌐 لم يتم الحصول على استجابة من الخادم');
      console.log('📡 تفاصيل الطلب:', error.message);
    } else {
      console.log('⚠️  خطأ في إعداد الطلب:', error.message);
    }
  }
  
  // اختبار بيانات خاطئة
  console.log('\n🔍 اختبار بيانات خاطئة...');
  
  try {
    const wrongData = {
      username: 'admin',
      password: 'wrongpassword'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/login`, wrongData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('⚠️  تم قبول كلمة مرور خاطئة! هذا خطأ أمني.');
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ تم رفض كلمة المرور الخاطئة بشكل صحيح');
    } else {
      console.log('❌ خطأ غير متوقع:', error.message);
    }
  }
}

testLogin().catch(console.error);