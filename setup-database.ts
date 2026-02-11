#!/usr/bin/env node

/**
 * PostgreSQL Setup and Test Script for ZDSPGC Online Enrollment
 * 
 * This script will:
 * 1. Test PostgreSQL connection
 * 2. Create database if it doesn't exist
 * 3. Push schema using Drizzle
 * 4. Seed initial data
 */

import dotenv from "dotenv";
import { Pool } from "pg";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();

const execAsync = promisify(exec);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testConnection() {
  log('\n1. Testing PostgreSQL Connection...', colors.blue);
  
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in .env file');
    }

    // Parse connection string to get database name
    const url = new URL(connectionString);
    const dbName = url.pathname.slice(1);
    
    log(`   Database: ${dbName}`, colors.yellow);
    log(`   Host: ${url.hostname}:${url.port}`, colors.yellow);
    log(`   User: ${url.username}`, colors.yellow);

    // Test connection to postgres database first
    const adminUrl = connectionString.replace(`/${dbName}`, '/postgres');
    const adminPool = new Pool({ connectionString: adminUrl });
    
    await adminPool.query('SELECT NOW()');
    log('   ✓ PostgreSQL server is running', colors.green);
    
    // Check if database exists
    const res = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (res.rows.length === 0) {
      log(`   Database '${dbName}' does not exist. Creating...`, colors.yellow);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      log(`   ✓ Database '${dbName}' created`, colors.green);
    } else {
      log(`   ✓ Database '${dbName}' exists`, colors.green);
    }
    
    await adminPool.end();
    
    // Test connection to actual database
    const pool = new Pool({ connectionString });
    await pool.query('SELECT NOW()');
    await pool.end();
    
    log('   ✓ Connection successful!\n', colors.green);
    return true;
  } catch (error: any) {
    log(`   ✗ Connection failed: ${error.message}`, colors.red);
    log('\n   Troubleshooting:', colors.yellow);
    log('   1. Make sure PostgreSQL is installed and running');
    log('   2. Check your .env file DATABASE_URL');
    log('   3. Verify PostgreSQL password is correct');
    log('   4. On Windows, check if PostgreSQL service is running in Services');
    return false;
  }
}

async function pushSchema() {
  log('2. Pushing Database Schema...', colors.blue);
  
  try {
    const { stdout, stderr } = await execAsync('npm run db:push');
    if (stderr && !stderr.includes('injecting env')) {
      console.log(stderr);
    }
    log('   ✓ Schema pushed successfully\n', colors.green);
    return true;
  } catch (error: any) {
    log(`   ✗ Schema push failed: ${error.message}`, colors.red);
    return false;
  }
}

async function seedDatabase() {
  log('3. Seeding Database...', colors.blue);
  
  try {
    // Import storage dynamically
    const { storage } = await import('./server/storage.js');
    await storage.seed();
    log('   ✓ Database seeded with initial data', colors.green);
    log('   ✓ Admin user created (username: admin, password: admin123)\n', colors.green);
    return true;
  } catch (error: any) {
    log(`   ✗ Seeding failed: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log('═══════════════════════════════════════════════════════', colors.blue);
  log('  ZDSPGC PostgreSQL Setup', colors.blue);
  log('═══════════════════════════════════════════════════════\n', colors.blue);

  const connectionOk = await testConnection();
  if (!connectionOk) {
    log('\n❌ Setup failed at connection test', colors.red);
    log('\nPlease fix the connection issue and try again.\n', colors.yellow);
    process.exit(1);
  }

  const schemaOk = await pushSchema();
  if (!schemaOk) {
    log('\n❌ Setup failed at schema push', colors.red);
    process.exit(1);
  }

  const seedOk = await seedDatabase();
  if (!seedOk) {
    log('\n❌ Setup failed at seeding', colors.red);
    process.exit(1);
  }

  log('═══════════════════════════════════════════════════════', colors.green);
  log('  ✓ PostgreSQL Setup Complete!', colors.green);
  log('═══════════════════════════════════════════════════════\n', colors.green);
  
  log('Next steps:', colors.blue);
  log('1. Start the server: npm run dev');
  log('2. Visit: http://localhost:5000');
  log('3. Login with admin credentials:');
  log('   Username: admin');
  log('   Password: admin123\n');
}

main().catch(console.error);
