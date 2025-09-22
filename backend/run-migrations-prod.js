#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running database migrations for production...');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create it from .env.prod.example');
  process.exit(1);
}

console.log('📝 Loading environment variables...');

// Check database configuration
const databaseUrl = process.env.DATABASE_URL;
const hasIndividualVars = process.env.DB_HOST && process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_NAME;

if (!databaseUrl && !hasIndividualVars) {
  console.error('❌ Database configuration missing. Please set either:');
  console.error('   - DATABASE_URL for connection string');
  console.error('   - Or DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME for individual variables');
  process.exit(1);
}

console.log(`📊 Using database: ${databaseUrl ? 'DATABASE_URL' : 'Individual variables'}`);

// Run migrations using TypeORM
try {
  console.log('🔄 Running migrations...');
  execSync('npm run migration:run', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
