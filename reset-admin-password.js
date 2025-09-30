const { Client } = require('pg');
const bcrypt = require('bcrypt');

// رابط الاتصال بقاعدة البيانات
const connectionString = 'postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres';

// كلمة المرور الجديدة
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
    const client = new Client({
        connectionString: connectionString,
        ssl: false
    });

    try {
        console.log('🔄 جاري الاتصال بقاعدة البيانات...');
        await client.connect();
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
        
        // البحث عن المستخدم الإداري
        console.log('\n🔍 البحث عن المستخدم الإداري...');
        const adminUser = await client.query(`
            SELECT id, username, email, role 
            FROM users 
            WHERE role = 'ADMIN' OR username = 'admin'
            LIMIT 1
        `);
        
        if (adminUser.rows.length === 0) {
            console.log('❌ لم يتم العثور على مستخدم إداري');
            return;
        }
        
        const admin = adminUser.rows[0];
        console.log('👤 تم العثور على المستخدم الإداري:');
        console.log(`   - المعرف: ${admin.id}`);
        console.log(`   - اسم المستخدم: ${admin.username}`);
        console.log(`   - البريد الإلكتروني: ${admin.email}`);
        console.log(`   - الدور: ${admin.role}`);
        
        // تشفير كلمة المرور الجديدة
        console.log('\n🔐 جاري تشفير كلمة المرور الجديدة...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, saltRounds);
        console.log('✅ تم تشفير كلمة المرور بنجاح');
        
        // تحديث كلمة المرور
        console.log('\n💾 جاري تحديث كلمة المرور في قاعدة البيانات...');
        const updateResult = await client.query(`
            UPDATE users 
            SET password = $1, updated_at = NOW()
            WHERE id = $2
        `, [hashedPassword, admin.id]);
        
        if (updateResult.rowCount > 0) {
            console.log('✅ تم تحديث كلمة المرور بنجاح!');
            
            // التحقق من التحديث
            console.log('\n🔍 التحقق من التحديث...');
            const updatedUser = await client.query(`
                SELECT username, email, updated_at 
                FROM users 
                WHERE id = $1
            `, [admin.id]);
            
            if (updatedUser.rows.length > 0) {
                const user = updatedUser.rows[0];
                console.log('📋 معلومات المستخدم المحدثة:');
                console.log(`   - اسم المستخدم: ${user.username}`);
                console.log(`   - البريد الإلكتروني: ${user.email}`);
                console.log(`   - آخر تحديث: ${user.updated_at}`);
            }
            
            // اختبار كلمة المرور الجديدة
            console.log('\n🧪 اختبار كلمة المرور الجديدة...');
            const testUser = await client.query(`
                SELECT password FROM users WHERE id = $1
            `, [admin.id]);
            
            if (testUser.rows.length > 0) {
                const isPasswordValid = await bcrypt.compare(NEW_PASSWORD, testUser.rows[0].password);
                if (isPasswordValid) {
                    console.log('✅ كلمة المرور الجديدة تعمل بشكل صحيح!');
                } else {
                    console.log('❌ خطأ في كلمة المرور الجديدة');
                }
            }
            
        } else {
            console.log('❌ فشل في تحديث كلمة المرور');
        }
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        if (error.code) {
            console.error('🔍 رمز الخطأ:', error.code);
        }
    } finally {
        await client.end();
        console.log('\n🔚 تم إغلاق الاتصال بقاعدة البيانات');
    }
}

console.log('🚀 بدء عملية إعادة تعيين كلمة مرور المدير');
console.log(`🔑 كلمة المرور الجديدة: ${NEW_PASSWORD}`);
console.log('=' .repeat(50));

// تشغيل السكريبت
resetAdminPassword();