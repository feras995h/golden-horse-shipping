require('dotenv').config({ path: 'backend/.env' });

console.log('Loading environment from backend/.env:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

const { DataSource } = require('typeorm');

const databaseUrl = process.env.DATABASE_URL;
const isPg = !!databaseUrl || !!process.env.DB_HOST || process.env.DB_TYPE === 'postgres';

const dataSourceOptions = isPg
  ? { type: 'postgres', url: databaseUrl, ssl: false }
  : { type: 'sqlite', database: './backend/database.sqlite' };

console.log('Database type:', isPg ? 'PostgreSQL' : 'SQLite');

const dataSource = new DataSource(dataSourceOptions);

async function test() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connected successfully from NestJS-like config');
    await dataSource.query('SELECT 1 as test');
    console.log('✅ Query executed successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

test();
