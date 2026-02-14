
// Verified login script
async function testLogin() {
    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "admin123" })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Login Successful:", data.user ? data.user.username : "No user data");
        } else {
            console.log("Login Failed:", response.status, await response.text());
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

testLogin();
