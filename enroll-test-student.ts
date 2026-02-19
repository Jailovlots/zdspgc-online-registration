
import { db } from "./server/db";
import { students, enrollments, subjects, users, type Student } from "@shared/schema";
import { eq, like } from "drizzle-orm";

async function main() {
    console.log("--- Enrolling Test Student ---");

    // 1. Find a test student - prefer "Test Student", fallback to any student
    const allStudents = (await db.select().from(students)) as Student[];
    let student = allStudents.find(s => s.email === "teststudent@example.com" || s.firstName === "Test Student");

    if (!student) {
        if (allStudents.length > 0) {
            // Pick a student with high ID (likely recent)
            student = allStudents.sort((a, b) => b.id - a.id)[0];
            console.log(`Preferred test student not found, using last created student: ${student.email}`);
        } else {
            console.error("No students found in database. Please run student creation script first.");
            process.exit(1);
        }
    }

    console.log(`Found Student: ${student.firstName} ${student.lastName} (ID: ${student.id}, Email: ${student.email})`);

    // 2. Clear existing enrollments to avoid duplicates
    await db.delete(enrollments).where(eq(enrollments.studentId, student.id));
    console.log("Cleared existing enrollments.");

    // 3. Find some subjects to enroll in
    const bsisSubjects = await db.select().from(subjects).where(like(subjects.code, "IS%"));
    const genEdSubjects = await db.select().from(subjects).where(like(subjects.code, "GE%"));

    const subjectsToEnroll = [...bsisSubjects.slice(0, 3), ...genEdSubjects.slice(0, 2)];

    if (subjectsToEnroll.length === 0) {
        console.log("No subjects found to enroll.");
        return;
    }

    // 4. Enroll
    for (const subject of subjectsToEnroll) {
        await db.insert(enrollments).values({
            studentId: student.id,
            subjectId: subject.id,
            status: "enrolled"
        });
        console.log(`Enrolled in: ${subject.code} - ${subject.name} (${subject.schedule})`);
    }

    console.log("\nEnrollment complete. The student should now see these subjects in their schedule.");
    process.exit(0);
}

main().catch(console.error);
