#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Tests connection to PostgreSQL database using both methods:
 * 1. DATABASE_URL
 * 2. Individual variables (DB_HOST, DB_PORT, etc.)
 */

const { Client } = require('pg');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabaseUrl() {
  log('\n📡 Testing DATABASE_URL connection...', colors.cyan);
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('❌ DATABASE_URL not set', colors.red);
    return false;
  }

  log(`   URL: ${databaseUrl.substring(0, 30)}...`, colors.blue);

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    log('✅ Successfully connected using DATABASE_URL!', colors.green);
    
    const result = await client.query('SELECT version()');
    log(`   PostgreSQL version: ${result.rows[0].version}`, colors.blue);
    
    await client.end();
    return true;
  } catch (error) {
    log(`❌ Failed to connect: ${error.message}`, colors.red);
    await client.end().catch(() => {});
    return false;
  }
}

async function testIndividualVars() {
  log('\n📡 Testing individual variables connection...', colors.cyan);
  
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || process.env.DB_DATABASE;

  log(`   Host: ${dbHost || 'NOT SET'}`, colors.blue);
  log(`   Port: ${dbPort}`, colors.blue);
  log(`   User: ${dbUser || 'NOT SET'}`, colors.blue);
  log(`   Database: ${dbName || 'NOT SET'}`, colors.blue);
  log(`   Password: ${dbPassword ? '***' : 'NOT SET'}`, colors.blue);

  if (!dbHost || !dbUser || !dbPassword || !dbName) {
    log('❌ Missing required variables', colors.red);
    return false;
  }

  const sslConfig = process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false;

  log(`   SSL: ${process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'}`, colors.blue);

  const client = new Client({
    host: dbHost,
    port: parseInt(dbPort, 10),
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: sslConfig,
  });

  try {
    await client.connect();
    log('✅ Successfully connected using individual variables!', colors.green);
    
    const result = await client.query('SELECT version()');
    log(`   PostgreSQL version: ${result.rows[0].version}`, colors.blue);
    
    // Test table creation
    try {
      await client.query('SELECT 1 FROM users LIMIT 1');
      log('✅ Users table exists', colors.green);
    } catch (err) {
      log('⚠️  Users table does not exist yet', colors.yellow);
      log('   This is normal for first deployment with DB_SYNCHRONIZE=true', colors.blue);
    }
    
    await client.end();
    return true;
  } catch (error) {
    log(`❌ Failed to connect: ${error.message}`, colors.red);
    
    if (error.code === 'ENOTFOUND') {
      log('   💡 Tip: Check DB_HOST - DNS resolution failed', colors.yellow);
    } else if (error.code === 'ECONNREFUSED') {
      log('   💡 Tip: Check DB_PORT and firewall settings', colors.yellow);
    } else if (error.code === '28P01') {
      log('   💡 Tip: Check DB_USERNAME and DB_PASSWORD', colors.yellow);
    }
    
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════╗', colors.bright);
  log('║  Golden Horse Shipping - Database Connection Test ║', colors.bright);
  log('╚════════════════════════════════════════════════════╝', colors.bright);

  log('\n🔍 Environment Variables Check:', colors.cyan);
  log(`   NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`, colors.blue);
  log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`, colors.blue);
  log(`   DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`, colors.blue);
  log(`   DB_TYPE: ${process.env.DB_TYPE || 'NOT SET'}`, colors.blue);

  const urlSuccess = await testDatabaseUrl();
  const varsSuccess = await testIndividualVars();

  log('\n' + '═'.repeat(56), colors.cyan);
  log('📊 Test Results Summary:', colors.bright);
  log('═'.repeat(56), colors.cyan);
  
  if (urlSuccess) {
    log('✅ DATABASE_URL method: SUCCESS', colors.green);
  } else {
    log('❌ DATABASE_URL method: FAILED', colors.red);
  }
  
  if (varsSuccess) {
    log('✅ Individual variables method: SUCCESS', colors.green);
  } else {
    log('❌ Individual variables method: FAILED', colors.red);
  }

  log('\n💡 Recommendation:', colors.cyan);
  if (varsSuccess) {
    log('   Use individual variables (DB_HOST, DB_PORT, etc.) in Coolify', colors.green);
  } else if (urlSuccess) {
    log('   Use DATABASE_URL in Coolify', colors.green);
  } else {
    log('   ⚠️  Both methods failed! Check your database configuration.', colors.red);
    log('   1. Verify database is running', colors.yellow);
    log('   2. Check firewall allows connections on port ' + (process.env.DB_PORT || '5432'), colors.yellow);
    log('   3. Verify credentials are correct', colors.yellow);
  }

  log('\n' + '═'.repeat(56) + '\n', colors.cyan);

  process.exit(varsSuccess || urlSuccess ? 0 : 1);
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

