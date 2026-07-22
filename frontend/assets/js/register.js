/* ==========================================
   UrbanWear - Register
========================================== */

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const registerBtn = document.getElementById("registerBtn");
const loading = document.getElementById("loading");
const messageBox = document.getElementById("messageBox");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

/* ==========================================
        REGISTER FORM
========================================== */

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!name || !email || !password || !confirmPassword) {

        showMessage("Please fill all fields.", "error");
        return;

    }

    if (password !== confirmPassword) {

        showMessage("Passwords do not match.", "error");
        return;

    }

    if (password.length < 6) {

        showMessage("Password must be at least 6 characters.", "error");
        return;

    }

    registerBtn.disabled = true;
    loading.style.display = "block";

    try {

        const response = await fetch(`${API_BASE_URL}/auth/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name: name,
                email: email,
                password: password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                "Registration failed."
            );

        }

        showMessage(
            "Registration Successful! Redirecting...",
            "success"
        );

        registerForm.reset();

        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);

    }

    catch (error) {

        showMessage(error.message, "error");

    }

    finally {

        loading.style.display = "none";
        registerBtn.disabled = false;

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

    } else {

        passwordInput.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

/* ==========================================
   SHOW / HIDE CONFIRM PASSWORD
========================================== */

toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        confirmPasswordInput.type = "password";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

/* ==========================================
        MESSAGE BOX
========================================== */

function showMessage(message, type) {

    messageBox.style.display = "block";
    messageBox.className = type;
    messageBox.textContent = message;

    setTimeout(() => {

        messageBox.style.display = "none";

    }, 3000);

}