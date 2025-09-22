#!/usr/bin/env node

const { DataSource } = require('typeorm');
require('dotenv').config();

console.log('🔍 Testing database connection...');

const databaseUrl = process.env.DATABASE_URL;
const isPg = !!databaseUrl || !!process.env.DB_HOST || process.env.DB_TYPE === 'postgres';

const dataSourceOptions = isPg
  ? databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=verify-full') ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : false,
      }
  : {
      type: 'sqlite',
      database: process.env.DB_PATH || './database.sqlite',
    };

const dataSource = new DataSource(dataSourceOptions);

async function testConnection() {
  try {
    await dataSource.initialize();
    console.log('✅ Database connection successful!');
    console.log(`📊 Connected to: ${isPg ? 'PostgreSQL' : 'SQLite'}`);
    if (isPg) {
      console.log(`🏠 Host: ${process.env.DB_HOST}`);
      console.log(`📁 Database: ${process.env.DB_NAME}`);
    }
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
