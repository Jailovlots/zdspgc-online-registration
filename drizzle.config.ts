import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: databaseUrl ? "postgresql" : "sqlite",
  dbCredentials: {
    url: databaseUrl || "./sqlite.db",
  },
});
