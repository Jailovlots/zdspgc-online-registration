
import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
    console.log("--- Testing Student Creation via API ---");

    // 1. Login as Admin
    console.log("Logging in as admin...");
    const loginRes = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
    });

    if (!loginRes.ok) {
        console.error("Failed to login as admin:", await loginRes.text());
        process.exit(1);
    }

    const cookie = loginRes.headers.get("set-cookie");
    console.log("Admin logged in. Cookie:", cookie);

    // 2. Create Student
    const testEmail = `teststudent${Date.now()}@example.com`;
    const testPassword = "password123";

    console.log(`Creating student ${testEmail}...`);
    const createRes = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie || ""
        },
        body: JSON.stringify({
            email: testEmail,
            password: testPassword,
            firstName: "Test",
            lastName: "Student",
            yearLevel: 1,
            status: "pending",
            // ... other required fields?
        }),
    });

    if (!createRes.ok) {
        console.error("Failed to create student:", await createRes.text());
        // If validation fails, we might need more fields.
        // Let's check schema.
    } else {
        console.log("Student created successfully via API.");
    }

    // 3. Verify in DB
    console.log("Verifying password hash in DB...");
    const [user] = await db.select().from(users).where(eq(users.username, testEmail));

    if (!user) {
        console.error("User not found in DB!");
        process.exit(1);
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Password Hash in DB: ${user.password}`);

    const isHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
    console.log(`Is Hashed? ${isHashed}`);

    if (isHashed) {
        console.log("SUCCESS: Password is hashed.");
    } else {
        console.error("FAILURE: Password is NOT hashed. Server might be running old code.");
    }

    process.exit(0);
}

run().catch(console.error);
