const API_URL = "";

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const messageBox = document.getElementById("message");

// =====================================
// ADMIN LOGIN
// =====================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    // Clear previous message
    messageBox.className = "";
    messageBox.textContent = "";

    // Basic validation
    if (!username || !password) {
        messageBox.className = "error";
        messageBox.textContent =
            "❌ Username and password are required";
        return;
    }

    // Disable button
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        // =====================================
        // SEND LOGIN REQUEST
        // =====================================

        const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        // Convert response to JSON
        const data = await response.json();

        console.log("Login response:", data);

        // =====================================
        // CHECK LOGIN RESPONSE
        // =====================================

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Invalid username or password"
            );
        }

        // =====================================
        // CHECK TOKEN
        // =====================================

        if (!data.token) {
            throw new Error(
                "Login successful but token was not received"
            );
        }

        // =====================================
        // SAVE ADMIN TOKEN
        // =====================================

        localStorage.setItem(
            "adminToken",
            data.token
        );

        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );

        // =====================================
        // SUCCESS MESSAGE
        // =====================================

        messageBox.className = "success";

        messageBox.textContent =
            "✅ Login successful!";

        // =====================================
        // REDIRECT TO ADMIN DASHBOARD
        // =====================================

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 700);

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        messageBox.className = "error";

        messageBox.textContent =
            `❌ ${error.message}`;

    } finally {
        // Enable button again
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});