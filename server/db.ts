import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from the root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import Database from "better-sqlite3";
import { Pool } from "pg";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

let _db: any;
if (connectionString && connectionString.startsWith("postgres")) {
  console.log("[Database] Connecting to PostgreSQL...");
  const pool = new Pool({ connectionString });
  _db = drizzlePg(pool, { schema });

  // Verify connection
  pool.query('SELECT 1').then(() => {
    console.log("[Database] PostgreSQL connection verified successfully");
  }).catch((err) => {
    console.error("[Database] PostgreSQL connection failed:", err.message);
  });
} else {
  console.log("[Database] Falling back to SQLite (DATABASE_URL missing or invalid)");
  _db = drizzleSqlite(new Database("sqlite.db"), { schema });
}

export const db = _db;

