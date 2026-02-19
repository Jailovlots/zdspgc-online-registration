
import { db } from "./server/db";
import { students, enrollments, subjects, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("--- Debugging Schedule Data ---");

    // 1. List all students
    const allStudents = await db.select().from(students);
    console.log(`Found ${allStudents.length} students.`);

    if (allStudents.length === 0) {
        console.log("No students found.");
        return;
    }

    for (const s of allStudents) {
        console.log(`Student: ${s.firstName} ${s.lastName} (ID: ${s.id}, Email: ${s.email})`);

        // 2. Check enrollments for each student
        const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.studentId, s.id));
        console.log(`  Enrollments: ${studentEnrollments.length}`);

        if (studentEnrollments.length > 0) {
            for (const e of studentEnrollments) {
                const [subject] = await db.select().from(subjects).where(eq(subjects.id, e.subjectId));
                console.log(`    - Subject: ${subject?.code} (${subject?.name}) | Schedule: ${subject?.schedule}`);
            }
        } else {
            console.log("    - No enrollments found.");
        }
    }

    // 3. Check if we have subjects
    const allSubjects = await db.select().from(subjects);
    console.log(`\nTotal Subjects in DB: ${allSubjects.length}`);

    process.exit(0);
}

main().catch(console.error);
