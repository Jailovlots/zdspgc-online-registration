
import { storage } from "./server/storage";

async function testAdminAuth() {
    console.log("Initializing storage...");
    await storage.seed();

    console.log("Testing Admin Login...");

    // Test 1: Correct Credentials
    const admin = await storage.getUserByUsername("admin");
    if (admin && admin.password === "admin123") {
        console.log("SUCCESS: Admin user found with correct password.");
    } else {
        console.error("FAILURE: Admin user not found or password incorrect.");
        if (admin) console.log("Admin found but password was:", admin.password);
        else console.log("Admin user 'admin' NOT found in storage.");
    }

    // Test 2: Case Sensitivity Check
    const adminUpper = await storage.getUserByUsername("Admin");
    if (adminUpper) {
        console.log("INFO: Username lookup is case-insensitive (User 'Admin' found).");
    } else {
        console.log("INFO: Username lookup is case-SENSITIVE (User 'Admin' NOT found).");
    }
}

testAdminAuth();
