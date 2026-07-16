const API_URL = "http://127.0.0.1:8000";

async function registerUser() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    const registerBtn = document.getElementById("registerBtn");

    // clear old messages
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    // validation
    if (!name || !email || !password) {
        errorMsg.textContent = "Please fill all fields.";
        errorMsg.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        errorMsg.style.display = "block";
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "CREATING ACCOUNT...";

    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            successMsg.textContent = "Account created! Redirecting to login...";
            successMsg.style.display = "block";

            // redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = "/login-page";
            }, 2000);

        } else {
            errorMsg.textContent = data.detail || "Registration failed. Try again.";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Cannot connect to server. Make sure backend is running.";
        errorMsg.style.display = "block";
    }

    registerBtn.disabled = false;
    registerBtn.textContent = "CREATE ACCOUNT";
}

document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        registerUser();
    }
});