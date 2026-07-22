/* ==========================================
   UrbanWear - Login
========================================== */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loading = document.getElementById("loading");
const messageBox = document.getElementById("messageBox");
const rememberMe = document.getElementById("rememberMe");
const togglePassword = document.getElementById("togglePassword");

/* ==========================================
        CHECK LOGIN
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("access_token");

    if (token) {

        window.location.href = "home.html";

    }

});

/* ==========================================
        LOGIN FORM
========================================== */

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {

        showMessage("Please fill all fields.", "error");

        return;

    }

    loginBtn.disabled = true;
    loading.style.display = "block";

    try {

        const response = await fetch(`${API_BASE_URL}/auth/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({

                username: email,
                password: password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.detail || "Login failed.");

        }

        localStorage.setItem(
            "access_token",
            data.access_token
        );

        localStorage.setItem(
            "token",
            data.access_token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        if (rememberMe.checked) {

            localStorage.setItem(
                "remember_email",
                email
            );

        } else {

            localStorage.removeItem(
                "remember_email"
            );

        }

        showMessage(
            "Login Successful!",
            "success"
        );

        setTimeout(() => {

            window.location.href = "home.html";

        }, 1000);

    }

    catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }

    finally {

        loading.style.display = "none";
        loginBtn.disabled = false;

    }

});

/* ==========================================
        SHOW / HIDE PASSWORD
========================================== */

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    }

    else {

        passwordInput.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

/* ==========================================
        REMEMBER EMAIL
========================================== */

window.addEventListener("load", () => {

    const rememberedEmail =
        localStorage.getItem("remember_email");

    if (rememberedEmail) {

        emailInput.value = rememberedEmail;

        rememberMe.checked = true;

    }

});

/* ==========================================
        MESSAGE
========================================== */

function showMessage(message, type) {

    messageBox.style.display = "block";

    messageBox.className = type;

    messageBox.innerText = message;

    setTimeout(() => {

        messageBox.style.display = "none";

    }, 3000);

}