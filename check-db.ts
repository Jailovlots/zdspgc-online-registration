
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

async function checkDb() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found");
        return;
    }

    const pool = new Pool({ connectionString });
    try {
        const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables in database:");
        res.rows.forEach(row => console.log(`- ${row.table_name}`));

        if (res.rows.length > 0) {
            for (const row of res.rows) {
                const columns = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [row.table_name]);
                console.log(`\nColumns for ${row.table_name}:`);
                columns.rows.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
            }
        } else {
            console.log("No tables found in public schema.");
        }
    } catch (err) {
        console.error("Error checking db:", err);
    } finally {
        await pool.end();
    }
}

checkDb();
