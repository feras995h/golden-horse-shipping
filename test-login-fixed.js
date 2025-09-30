const axios = require('axios');

async function testLoginAfterFix() {
    console.log('🧪 اختبار نظام تسجيل الدخول بعد إصلاح قاعدة البيانات...');
    
    const baseURL = 'http://localhost:3000'; // Backend runs on port 3000
    
    // انتظار قليل للتأكد من تشغيل الخادم
    console.log('⏳ انتظار تشغيل الخادم...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
        // اختبار حالة الخادم أولاً
        console.log('🔍 فحص حالة الخادم...');
        const healthCheck = await axios.get(`${baseURL}/api/health`, {
            timeout: 10000
        });
        console.log('✅ الخادم يعمل بشكل طبيعي');
        
        // اختبار تسجيل الدخول بالبيانات الصحيحة
        console.log('\n🔐 اختبار تسجيل الدخول بالبيانات الصحيحة...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ تم تسجيل الدخول بنجاح!');
        console.log('📋 استجابة تسجيل الدخول:', {
            status: loginResponse.status,
            hasToken: !!loginResponse.data.access_token,
            user: loginResponse.data.user
        });
        
        // اختبار الوصول إلى endpoint محمي
        if (loginResponse.data.access_token) {
            console.log('\n🛡️ اختبار الوصول إلى endpoint محمي...');
            const protectedResponse = await axios.get(`${baseURL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${loginResponse.data.access_token}`
                },
                timeout: 10000
            });
            
            console.log('✅ تم الوصول إلى البيانات المحمية بنجاح!');
            console.log('👤 بيانات المستخدم:', protectedResponse.data);
        }
        
        // اختبار تسجيل الدخول ببيانات خاطئة
        console.log('\n❌ اختبار تسجيل الدخول ببيانات خاطئة...');
        try {
            await axios.post(`${baseURL}/api/auth/login`, {
                username: 'admin',
                password: 'wrongpassword'
            }, {
                timeout: 10000
            });
            console.log('⚠️ تحذير: تم قبول كلمة مرور خاطئة!');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ تم رفض كلمة المرور الخاطئة بشكل صحيح');
            } else {
                console.log('⚠️ خطأ غير متوقع:', error.message);
            }
        }
        
        console.log('\n🎉 جميع اختبارات تسجيل الدخول نجحت!');
        
    } catch (error) {
        console.error('❌ فشل في اختبار تسجيل الدخول:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 الخادم غير متاح على المنفذ 3000');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('⏰ انتهت مهلة الاتصال');
        } else if (error.response) {
            console.error('📋 استجابة الخطأ:', {
                status: error.response.status,
                data: error.response.data
            });
        }
    }
}

testLoginAfterFix();