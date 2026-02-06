
import { insertUserSchema, insertStudentSchema } from "./shared/schema";
import { z } from "zod";

async function testValidation() {
    console.log("Testing Validation Logic...");

    const mockBody = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        studentId: "2024-1234",
        yearLevel: 1
    };

    try {
        console.log("1. Testing User Schema...");
        const userData = insertUserSchema.parse({
            username: mockBody.email,
            password: mockBody.password,
            role: "student"
        });
        console.log("User Data Valid:", userData);
    } catch (error) {
        console.error("User Validation Failed:", error);
    }

    try {
        console.log("\n2. Testing Student Schema...");
        // This simulates exactly what routes.ts does: passing everything + userId
        const studentData = insertStudentSchema.parse({
            ...mockBody,
            userId: 123
        });
        console.log("Student Data Valid:", studentData);
    } catch (error) {
        console.error("Student Validation Failed:", error);
    }
}

testValidation();
