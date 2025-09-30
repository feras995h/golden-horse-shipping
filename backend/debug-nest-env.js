require('dotenv').config({ path: './.env' });

console.log('🔍 NestJS Environment Debug (from backend):');
console.log('Process.cwd():', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_TYPE:', process.env.DB_TYPE);

const { ConfigService } = require('@nestjs/config');

const configService = new ConfigService();
const databaseUrl = configService.get('DATABASE_URL');
const nodeEnv = configService.get('NODE_ENV', 'development');
const isPostgres = !!databaseUrl || !!configService.get('DB_HOST') || configService.get('DB_TYPE') === 'postgres';

console.log('\n🔧 ConfigService check:');
console.log('databaseUrl from ConfigService:', databaseUrl ? 'SET (' + databaseUrl.substring(0, 20) + '...)' : 'NOT SET');
console.log('nodeEnv from ConfigService:', nodeEnv);
console.log('isPostgres logic:', isPostgres);

// Also check if .env file exists and can be read
const fs = require('fs');
const path = require('path');
const envPath = path.resolve('./.env');
console.log('Checking .env file at:', envPath);
console.log('File exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('DATABASE_URL in file:', envContent.includes('DATABASE_URL') ? 'YES' : 'NO');
}
