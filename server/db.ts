import dotenv from "dotenv";
dotenv.config();

import Database from "better-sqlite3";
import { Pool } from "pg";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

// Export a concretely-typed `db` to avoid union overload incompatibilities
// during compile time. In local dev with a DATABASE_URL set this will be
// a Postgres Drizzle instance. We cast to `any` to keep the runtime
// behavior unchanged while satisfying callers.
let _db: any;
if (connectionString) {
	_db = drizzlePg(new Pool({ connectionString }), { schema });
} else {
	_db = drizzleSqlite(new Database("sqlite.db"), { schema });
}

export const db = _db;
