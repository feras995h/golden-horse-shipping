const { Client } = require('pg');

// رابط الاتصال بقاعدة البيانات
const connectionString = 'postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres';

async function connectToDatabase() {
    const client = new Client({
        connectionString: connectionString,
        ssl: false // تعطيل SSL لأن الخادم لا يدعمه
    });

    try {
        console.log('🔄 جاري الاتصال بقاعدة البيانات...');
        await client.connect();
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
        
        // اختبار الاتصال
        const result = await client.query('SELECT version()');
        console.log('📊 إصدار PostgreSQL:', result.rows[0].version);
        
        // عرض معلومات قاعدة البيانات
        const dbInfo = await client.query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()');
        console.log('🗄️ اسم قاعدة البيانات:', dbInfo.rows[0].current_database);
        console.log('👤 المستخدم الحالي:', dbInfo.rows[0].current_user);
        console.log('🌐 عنوان الخادم:', dbInfo.rows[0].inet_server_addr);
        console.log('🔌 منفذ الخادم:', dbInfo.rows[0].inet_server_port);
        
        // عرض الجداول الموجودة
        console.log('\n📋 الجداول الموجودة في قاعدة البيانات:');
        const tables = await client.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        if (tables.rows.length > 0) {
            tables.rows.forEach((table, index) => {
                console.log(`${index + 1}. ${table.table_name} (${table.table_type})`);
            });
        } else {
            console.log('لا توجد جداول في المخطط العام (public schema)');
        }
        
        // عرض جميع المخططات
        console.log('\n🗂️ المخططات الموجودة:');
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name
        `);
        
        schemas.rows.forEach((schema, index) => {
            console.log(`${index + 1}. ${schema.schema_name}`);
        });
        
    } catch (error) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
        if (error.code) {
            console.error('🔍 رمز الخطأ:', error.code);
        }
    } finally {
        await client.end();
        console.log('🔚 تم إغلاق الاتصال بقاعدة البيانات');
    }
}

// تشغيل الاتصال
connectToDatabase();