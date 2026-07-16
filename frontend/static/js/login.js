const API_URL = "http://127.0.0.1:8000";

async function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const loginBtn = document.getElementById("loginBtn");

    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    if (!email || !password) {
        errorMsg.textContent = "Please enter email and password.";
        errorMsg.style.display = "block";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "SIGNING IN...";

    try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("email", email);
            window.location.href = "home.html";
        } else {
            errorMsg.textContent = data.detail || "Invalid email or password.";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Cannot connect to server. Make sure backend is running.";
        errorMsg.style.display = "block";
    }

    loginBtn.disabled = false;
    loginBtn.textContent = "SIGN IN";
}

document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        loginUser();
    }
});