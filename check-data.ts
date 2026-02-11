
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

async function checkData() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return;

    const pool = new Pool({ connectionString });
    try {
        const users = await pool.query("SELECT id, username, role FROM users");
        console.log("Users in database:", users.rows.length);
        users.rows.forEach(u => console.log(`- ${u.username} (${u.role})`));

        const students = await pool.query("SELECT id, first_name, last_name, user_id FROM students");
        console.log("\nStudents in database:", students.rows.length);
        students.rows.forEach(s => console.log(`- ${s.first_name} ${s.last_name} (User ID: ${s.user_id})`));
    } catch (err) {
        console.error("Error checking data:", err);
    } finally {
        await pool.end();
    }
}

checkData();
