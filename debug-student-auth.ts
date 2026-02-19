
import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { users } from "./shared/schema";
import { hashPassword, comparePasswords } from "./server/auth";
import { eq, desc } from "drizzle-orm";

async function run() {
    console.log("--- Debugging Student Auth ---");

    // 1. Check last created student user
    console.log("Fetching last created student user...");
    const lastUsers = await db.select().from(users).where(eq(users.role, "student")).orderBy(desc(users.id)).limit(1);

    if (lastUsers.length === 0) {
        console.log("No student users found.");
    } else {
        const user = lastUsers[0];
        console.log(`User found: ID ${user.id}, Username: ${user.username}`);
        console.log(`Password Hash: ${user.password}`);
        const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
        console.log(`Is Hashed? ${isHashed}`);

        if (!isHashed) {
            console.error("CRITICAL: Password is NOT hashed!");
        } else {
            console.log("Password appears to be hashed.");
        }
    }

    // 2. Simulation of routes.ts logic
    console.log("\n--- Simulating Creation Flow ---");
    const testPassword = "password123";
    const hashedPassword = await hashPassword(testPassword);
    console.log(`Test Password: ${testPassword}`);
    console.log(`Generated Hash: ${hashedPassword}`);

    const match = await comparePasswords(testPassword, hashedPassword);
    console.log(`Compare Result: ${match}`);

    if (match) {
        console.log("Hashing/Comparison logic is CORRECT.");
    } else {
        console.error("Hashing/Comparison logic FAILED.");
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
