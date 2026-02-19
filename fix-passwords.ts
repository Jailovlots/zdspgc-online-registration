import { db } from "./server/db";
import { users } from "./shared/schema";
import { hashPassword } from "./server/auth";
import { eq } from "drizzle-orm";

/**
 * Fix script to hash all plain text passwords in the database
 * This fixes the login issue where bcrypt.compare() fails on plain text passwords
 */
async function fixPlainTextPasswords() {
    console.log("[Fix] Starting password hash fix...");

    try {
        // Get all users
        const allUsers = await db.select().from(users);
        console.log(`[Fix] Found ${allUsers.length} users in database`);

        let fixedCount = 0;

        for (const user of allUsers) {
            // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
            const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');

            if (!isHashed) {
                console.log(`[Fix] Hashing plain text password for user: ${user.username}`);

                // Hash the plain text password
                const hashedPassword = await hashPassword(user.password);

                // Update the user with hashed password
                await db
                    .update(users)
                    .set({ password: hashedPassword })
                    .where(eq(users.id, user.id));

                fixedCount++;
                console.log(`[Fix] ✓ Updated password for: ${user.username}`);
            } else {
                console.log(`[Fix] ✓ Password already hashed for: ${user.username}`);
            }
        }

        console.log(`\n[Fix] ✅ Fix complete! Hashed ${fixedCount} plain text passwords.`);
        process.exit(0);
    } catch (error) {
        console.error("[Fix] ❌ Error fixing passwords:", error);
        process.exit(1);
    }
}

// Run the fix
fixPlainTextPasswords();
