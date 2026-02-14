
async function reproduce() {
    const baseUrl = "http://localhost:5000";

    // 1. Register a new student (will be pending by default)
    const email = `test_student_${Date.now()}@example.com`;
    console.log("Registering student:", email);

    const regRes = await fetch(`${baseUrl}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: "Test",
            lastName: "Student",
            email: email,
            password: "password123",
            yearLevel: 1,
            studentId: `ID-${Date.now()}`,
            // required fields based on schema defaults/not-nulls
            courseId: null, // or 1 if needed
        })
    });

    if (!regRes.ok) {
        console.error("Registration failed:", await regRes.text());
        return;
    }
    const studentUser = await regRes.json();
    const studentId = studentUser.student.id;
    console.log("Registered student ID:", studentId);

    // 2. Login as Admin
    console.log("Logging in as admin...");
    const loginRes = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" })
    });

    if (!loginRes.ok) {
        console.error("Admin login failed:", await loginRes.text());
        return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Admin logged in.");

    // 3. Accept Student (Update status to 'enrolled')
    console.log("Accepting student...");
    const updateRes = await fetch(`${baseUrl}/api/students/${studentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "enrolled" })
    });

    if (!updateRes.ok) {
        console.error("Update failed:", await updateRes.text());
        return;
    }

    const updatedStudent = await updateRes.json();
    console.log("Student status updated:", updatedStudent.status);

    if (updatedStudent.status === "enrolled") {
        console.log("SUCCESS: Student accepted successfully.");
    } else {
        console.log("FAILURE: Student status did not change.");
    }
}

reproduce();
