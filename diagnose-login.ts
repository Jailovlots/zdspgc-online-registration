#!/usr/bin/env node

/**
 * Login System Diagnostic Script
 * 
 * This script will diagnose why login/registration is not working
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./shared/schema.js";
import { eq } from "drizzle-orm";

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

async function diagnose() {
  log('═══════════════════════════════════════════════════════', colors.blue);
  log('  ZDSPGC Login System Diagnostic', colors.blue);
  log('═══════════════════════════════════════════════════════\n', colors.blue);

  // 1. Check Environment Variables
  log('1. Checking Environment Variables...', colors.blue);
  const dbUrl = process.env.DATABASE_URL;
  const port = process.env.PORT || '5000';
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  log(`   PORT: ${port}`, colors.yellow);
  log(`   NODE_ENV: ${nodeEnv}`, colors.yellow);
  
  if (dbUrl) {
    log(`   DATABASE_URL: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`, colors.yellow);
  } else {
    log('   DATABASE_URL: NOT SET!', colors.red);
  }

  // 2. Test Database Connection
  log('\n2. Testing Database Connection...', colors.blue);
  
  let db: any;
  let isPostgres = false;
  
  if (dbUrl && dbUrl.startsWith('postgres')) {
    isPostgres = true;
    log('   Database Type: PostgreSQL', colors.yellow);
    
    try {
      const pool = new Pool({ connectionString: dbUrl });
      const result = await pool.query('SELECT NOW() as now');
      log('   ✓ PostgreSQL connection successful', colors.green);
      log(`   Server Time: ${result.rows[0].now}`, colors.yellow);
      
      db = drizzlePg(pool, { schema });
    } catch (error: any) {
      log(`   ✗ PostgreSQL connection failed: ${error.message}`, colors.red);
      log('\n   Falling back to SQLite...', colors.yellow);
      isPostgres = false;
    }
  }
  
  if (!isPostgres) {
    log('   Database Type: SQLite', colors.yellow);
    try {
      const sqlite = new Database("sqlite.db");
      db = drizzleSqlite(sqlite, { schema });
      log('   ✓ SQLite connection successful', colors.green);
    } catch (error: any) {
      log(`   ✗ SQLite connection failed: ${error.message}`, colors.red);
      process.exit(1);
    }
  }

  // 3. Check Database Tables
  log('\n3. Checking Database Tables...', colors.blue);
  
  try {
    // Check users table
    const usersResult = await db.select().from(schema.users).limit(1);
    log('   ✓ Users table exists', colors.green);
    
    // Check students table
    const studentsResult = await db.select().from(schema.students).limit(1);
    log('   ✓ Students table exists', colors.green);
    
    // Check courses table
    const coursesResult = await db.select().from(schema.courses).limit(1);
    log('   ✓ Courses table exists', colors.green);
    
  } catch (error: any) {
    log(`   ✗ Table check failed: ${error.message}`, colors.red);
    log('\n   Please run: npm run db:push', colors.yellow);
    process.exit(1);
  }

  // 4. Check Admin User
  log('\n4. Checking Admin User...', colors.blue);
  
  try {
    const adminUser = await db.select().from(schema.users).where(eq(schema.users.username, "admin"));
    
    if (adminUser.length > 0) {
      log('   ✓ Admin user exists', colors.green);
      log(`   Username: ${adminUser[0].username}`, colors.yellow);
      log(`   Role: ${adminUser[0].role}`, colors.yellow);
    } else {
      log('   ✗ Admin user NOT found!', colors.red);
      log('\n   Creating admin user...', colors.yellow);
      
      await db.insert(schema.users).values({
        username: "admin",
        password: "admin123",
        role: "admin"
      });
      
      log('   ✓ Admin user created', colors.green);
      log('   Username: admin', colors.yellow);
      log('   Password: admin123', colors.yellow);
    }
  } catch (error: any) {
    log(`   ✗ Admin check failed: ${error.message}`, colors.red);
  }

  // 5. Check Courses Data
  log('\n5. Checking Courses Data...', colors.blue);
  
  try {
    const courses = await db.select().from(schema.courses);
    
    if (courses.length > 0) {
      log(`   ✓ ${courses.length} courses found`, colors.green);
      courses.forEach((c: any) => {
        log(`   - ${c.code}: ${c.name}`, colors.yellow);
      });
    } else {
      log('   ✗ No courses found', colors.red);
      log('   Run the server to seed courses', colors.yellow);
    }
  } catch (error: any) {
    log(`   ✗ Courses check failed: ${error.message}`, colors.red);
  }

  // 6. Test Login Simulation
  log('\n6. Testing Login Simulation...', colors.blue);
  
  try {
    const testUser = await db.select().from(schema.users).where(eq(schema.users.username, "admin"));
    
    if (testUser.length > 0 && testUser[0].password === "admin123") {
      log('   ✓ Admin credentials verified', colors.green);
      log('   Login should work with:', colors.yellow);
      log('   Username: admin', colors.yellow);
      log('   Password: admin123', colors.yellow);
    } else {
      log('   ✗ Admin credentials mismatch', colors.red);
    }
  } catch (error: any) {
    log(`   ✗ Login test failed: ${error.message}`, colors.red);
  }

  // Summary
  log('\n═══════════════════════════════════════════════════════', colors.blue);
  log('  Diagnostic Complete', colors.blue);
  log('═══════════════════════════════════════════════════════\n', colors.blue);
  
  log('Next Steps:', colors.blue);
  log('1. Start the server: npm run dev', colors.yellow);
  log('2. Visit: http://localhost:5000/login', colors.yellow);
  log('3. Try logging in with admin/admin123', colors.yellow);
  log('4. Check browser console for any errors\n', colors.yellow);
}

diagnose().catch(console.error);
