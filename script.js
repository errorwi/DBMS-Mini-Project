document.getElementById("registerForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const password = document.getElementById("pwd").value;
    const confirmPassword = document.getElementById("repwd").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match! Please try again.");
        return;
    }

    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: password
    };

    try {
        const response = await fetch("http://localhost:5000/register", {  // ✅ Correct API URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
    }
});

// Login User
document.getElementById("loginForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("pwd").value
    };

    const response = await fetch("http://localhost:5000/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
        alert("Login successful!");
        window.location.href = "home.html"; // Redirect to game lobby
    } else {
        alert(result.error);
    }
});
