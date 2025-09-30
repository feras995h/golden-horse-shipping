const { Client } = require('pg');

// رابط الاتصال بقاعدة البيانات
const connectionString = 'postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres';

async function exploreDatabase() {
    const client = new Client({
        connectionString: connectionString,
        ssl: false
    });

    try {
        await client.connect();
        console.log('✅ متصل بقاعدة البيانات');
        
        // الحصول على قائمة الجداول
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('\n🔍 استكشاف بنية قاعدة البيانات:\n');
        
        for (const table of tables.rows) {
            const tableName = table.table_name;
            console.log(`\n📋 جدول: ${tableName}`);
            console.log('='.repeat(50));
            
            // الحصول على بنية الجدول
            const columns = await client.query(`
                SELECT 
                    column_name, 
                    data_type, 
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1 
                ORDER BY ordinal_position
            `, [tableName]);
            
            console.log('\n🏗️ بنية الجدول:');
            columns.rows.forEach((col, index) => {
                const nullable = col.is_nullable === 'YES' ? 'يمكن أن يكون فارغ' : 'مطلوب';
                const length = col.character_maximum_length ? ` (${col.character_maximum_length})` : '';
                const defaultVal = col.column_default ? ` | افتراضي: ${col.column_default}` : '';
                console.log(`  ${index + 1}. ${col.column_name}: ${col.data_type}${length} - ${nullable}${defaultVal}`);
            });
            
            // عدد السجلات
            const count = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
            console.log(`\n📊 عدد السجلات: ${count.rows[0].count}`);
            
            // عرض عينة من البيانات (أول 3 سجلات)
            if (parseInt(count.rows[0].count) > 0) {
                const sample = await client.query(`SELECT * FROM ${tableName} LIMIT 3`);
                console.log('\n📄 عينة من البيانات:');
                
                if (sample.rows.length > 0) {
                    sample.rows.forEach((row, index) => {
                        console.log(`\n  السجل ${index + 1}:`);
                        Object.keys(row).forEach(key => {
                            let value = row[key];
                            if (value === null) {
                                value = 'NULL';
                            } else if (typeof value === 'string' && value.length > 50) {
                                value = value.substring(0, 50) + '...';
                            } else if (value instanceof Date) {
                                value = value.toISOString();
                            }
                            console.log(`    ${key}: ${value}`);
                        });
                    });
                }
            } else {
                console.log('  الجدول فارغ');
            }
            
            console.log('\n' + '-'.repeat(50));
        }
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        await client.end();
        console.log('\n🔚 تم إغلاق الاتصال');
    }
}

// تشغيل الاستكشاف
exploreDatabase();