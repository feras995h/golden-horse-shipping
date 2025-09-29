const { DataSource } = require('typeorm');

async function testTypeORMConnection() {
  console.log('🔍 Testing TypeORM connection with PostgreSQL...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    url: 'postgres://postgres:A93zhpdV6icewK6rxbBQRScmxZvyWAhjvXg2QJApIKzU0gVx8CzubNgvo2O97n1l@r8ks0cwc8wk0w8swsggs4wg0:5432/postgres',
    entities: [
      './dist/entities/*.js'
    ],
    synchronize: true, // This will create tables automatically
    logging: true,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Initializing DataSource...');
    await dataSource.initialize();
    console.log('✅ TypeORM DataSource initialized successfully');
    
    // Test a simple query
    const result = await dataSource.query('SELECT version()');
    console.log('✅ Database query successful');
    console.log('PostgreSQL version:', result[0].version);
    
    // Check if tables exist
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    await dataSource.destroy();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ TypeORM connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testTypeORMConnection();