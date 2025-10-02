const { Client } = require('pg');

const DATABASE_URL = 'postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@72.60.92.146:5433/postgres';

async function checkDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Check all tables
    console.log('📋 Checking tables...\n');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    
    console.log(`Found ${result.rows.length} tables:\n`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Expected tables
    const expectedTables = [
      'user',
      'client',
      'shipment',
      'payment_record',
      'ad',
      'setting',
      'customer_account'
    ];

    console.log('\n\n🔍 Checking expected tables...\n');
    
    const existingTables = result.rows.map(r => r.table_name);
    
    for (const table of expectedTables) {
      const exists = existingTables.includes(table);
      console.log(`${exists ? '✅' : '❌'} ${table}`);
      
      if (exists) {
        // Get row count
        const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`   └─ Rows: ${countResult.rows[0].count}`);
        
        // Get columns
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [table]);
        
        console.log(`   └─ Columns (${columnsResult.rows.length}):`);
        columnsResult.rows.forEach(col => {
          console.log(`      - ${col.column_name} (${col.data_type})`);
        });
        console.log('');
      }
    }

    // Check for migrations table
    console.log('\n📦 Checking migrations...\n');
    const migrationsCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'migrations'
    `);
    
    if (migrationsCheck.rows.length > 0) {
      const migrationsResult = await client.query('SELECT * FROM migrations ORDER BY id DESC LIMIT 5');
      console.log(`✅ Migrations table exists (${migrationsResult.rows.length} migrations found)`);
      migrationsResult.rows.forEach(m => {
        console.log(`   - ${m.name} (${new Date(m.timestamp).toLocaleString()})`);
      });
    } else {
      console.log('⚠️  No migrations table found');
    }

    // Database statistics
    console.log('\n\n📊 Database Statistics:\n');
    const statsQuery = `
      SELECT 
        schemaname,
        COUNT(*) as table_count,
        SUM(n_tup_ins) as total_inserts,
        SUM(n_tup_upd) as total_updates,
        SUM(n_tup_del) as total_deletes
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      GROUP BY schemaname;
    `;
    
    const stats = await client.query(statsQuery);
    if (stats.rows.length > 0) {
      const s = stats.rows[0];
      console.log(`Tables: ${s.table_count}`);
      console.log(`Total Inserts: ${s.total_inserts || 0}`);
      console.log(`Total Updates: ${s.total_updates || 0}`);
      console.log(`Total Deletes: ${s.total_deletes || 0}`);
    }

    console.log('\n✅ Database check completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

checkDatabase();
