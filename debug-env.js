require('dotenv').config();

console.log('🔍 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_TYPE:', process.env.DB_TYPE);

const databaseUrl = process.env.DATABASE_URL;
const isPg = !!databaseUrl || !!process.env.DB_HOST || process.env.DB_TYPE === 'postgres';

console.log('isPg condition:', isPg);
console.log('Conditions:');
console.log('  !!databaseUrl:', !!databaseUrl);
console.log('  !!process.env.DB_HOST:', !!process.env.DB_HOST);
console.log('  process.env.DB_TYPE === "postgres":', process.env.DB_TYPE === 'postgres');
