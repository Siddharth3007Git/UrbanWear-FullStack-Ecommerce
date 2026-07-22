/* ==========================================================
                    UrbanWear Profile Module
========================================================== */

/* ==========================================================
                    API CONFIGURATION
========================================================== */

const API = API_BASE_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/* ==========================================================
                    DOM ELEMENTS
========================================================== */

const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const profileForm = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");
const changePasswordBtn = document.getElementById("changePassword");
const profileImageUpload = document.getElementById("profileImageUpload");

/* Profile Card */

const profileImage = document.getElementById("profileImage");
const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");

/* Form */

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const genderInput = document.getElementById("gender");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");
const pincodeInput = document.getElementById("pincode");

/* Password */

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

/* ==========================================================
                    GLOBAL DATA
========================================================== */

let profile = {};

/* ==========================================================
                    INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);

if (profileImageUpload) {
    profileImageUpload.addEventListener(
        "change",
        handleProfileImageUpload
    );
}

if (profileImage) {
    profileImage.addEventListener("error", () => {
        profileImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' rx='120' fill='%23e2e8f0'/%3E%3Ccircle cx='120' cy='96' r='46' fill='%2394a3b8'/%3E%3Cpath d='M56 214c12-34 41-52 64-52s52 18 64 52' fill='%2394a3b8'/%3E%3C/svg%3E";
    });
}

function handleProfileImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file || !profileImage) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        profileImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

async function initializePage() {

    checkLogin();

    showLoader();

    await loadProfile();

    hideLoader();
}

/* ==========================================================
                    LOGIN CHECK
========================================================== */

function checkLogin() {
    const currentToken = localStorage.getItem("access_token") || localStorage.getItem("token");

    if (!currentToken) {
        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            if (typeof redirectToLogin === "function") {
                redirectToLogin();
            } else {
                window.location.replace("login.html");
            }
        }
    }
}

/* ==========================================================
                    LOADER
========================================================== */

function showLoader() {

    loader.classList.remove("hidden");

}

function hideLoader() {

    loader.classList.add("hidden");

}

/* ==========================================================
                    TOAST
========================================================== */

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.className = `toast ${type}`;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================================
                    LOAD PROFILE
========================================================== */

async function loadProfile() {

    try {

        const response = await fetch(

            `${API}${API_ENDPOINTS.PROFILE}`,

            {
                headers: getAuthHeaders()
            }

        );

        const contentType = response.headers.get("content-type") || "";
        let payload = {};

        if (contentType.includes("application/json")) {
            payload = await response.json();
        } else {
            const text = await response.text();
            payload = text ? { message: text } : {};
        }

        if (!response.ok) {
            throw new Error(payload.detail || payload.message || "Unable to load profile.");
        }

        profile = payload;

        renderProfile();

    }

    catch (error) {

        console.error(error);

        showToast(error.message, "error");

    }

}

/* ==========================================================
                    RENDER PROFILE
========================================================== */

function renderProfile() {

    customerName.textContent =
        profile.name || "Customer";

    customerEmail.textContent =
        profile.email || "";

    nameInput.value =
        profile.name || "";

    emailInput.value =
        profile.email || "";

    phoneInput.value =
        profile.phone || "";

    genderInput.value =
        profile.gender || "";

    cityInput.value =
        profile.city || "";

    stateInput.value =
        profile.state || "";

    countryInput.value =
        profile.country || "";

    pincodeInput.value =
        profile.pincode || "";

}

/* ==========================================================
                    VALIDATION
========================================================== */

function validateProfile() {

    if (nameInput.value.trim() === "") {

        showToast(
            "Name is required.",
            "warning"
        );

        nameInput.focus();

        return false;

    }

    if (

        phoneInput.value &&
        !/^[0-9]{10}$/.test(
            phoneInput.value.trim()
        )

    ) {

        showToast(
            "Invalid phone number.",
            "warning"
        );

        phoneInput.focus();

        return false;

    }

    if (

        pincodeInput.value &&
        !/^[0-9]{6}$/.test(
            pincodeInput.value.trim()
        )

    ) {

        showToast(
            "Invalid pincode.",
            "warning"
        );

        pincodeInput.focus();

        return false;

    }

    return true;

}
/* ==========================================================
                    UPDATE PROFILE
========================================================== */

profileForm.addEventListener(
    "submit",
    updateProfile
);

async function updateProfile(event) {

    event.preventDefault();

    if (!validateProfile()) {
        return;
    }

    showLoader();

    const body = {

        name: nameInput.value.trim(),

        phone: phoneInput.value.trim(),

        gender: genderInput.value,

        city: cityInput.value.trim(),

        state: stateInput.value.trim(),

        country: countryInput.value.trim(),

        pincode: pincodeInput.value.trim()

    };

    try {

        const response = await fetch(

            `${API}${API_ENDPOINTS.UPDATE_PROFILE}`,

            {

                method: "PUT",

                headers: getAuthHeaders(),

                body: JSON.stringify(body)

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.detail ||

                "Unable to update profile."

            );

        }

        profile = result;

        renderProfile();

        showToast(

            "Profile updated successfully."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally {

        hideLoader();

    }

}

/* ==========================================================
                    CHANGE PASSWORD
========================================================== */

changePasswordBtn.addEventListener(

    "click",

    changePassword

);

async function changePassword() {

    const current =

        currentPassword.value.trim();

    const updated =

        newPassword.value.trim();

    if (!current || !updated) {

        showToast(

            "Enter both passwords.",

            "warning"

        );

        return;

    }

    if (updated.length < 6) {

        showToast(

            "Password must be at least 6 characters.",

            "warning"

        );

        return;

    }

    showLoader();

    try {

        const response = await fetch(

            `${API}${API_ENDPOINTS.PROFILE}/change-password`,

            {

                method: "PUT",

                headers: getAuthHeaders(),

                body: JSON.stringify({

                    current_password: current,

                    new_password: updated

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.detail ||

                "Unable to change password."

            );

        }

        currentPassword.value = "";

        newPassword.value = "";

        showToast(

            result.message ||

            "Password changed successfully."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally {

        hideLoader();

    }

}

/* ==========================================================
                    LOGOUT
========================================================== */

logoutBtn.addEventListener(

    "click",

    logout

);

function logout() {

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmLogout) {

        return;

    }

    localStorage.removeItem(

        "access_token"

    );

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem(

        "selected_order"

    );

    showToast(

        "Logged out successfully."

    );

    setTimeout(() => {

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            if (typeof redirectToLogin === "function") {
                redirectToLogin();
            } else {
                window.location.replace("login.html");
            }
        }

    }, 800);

}

/* ==========================================================
                    RESET PASSWORD FORM
========================================================== */

function clearPasswordFields() {

    currentPassword.value = "";

    newPassword.value = "";

}

/* ==========================================================
                    REFRESH PROFILE
========================================================== */

async function refreshProfile() {

    await loadProfile();

}

/* ==========================================================
                    CONNECTION STATUS
========================================================== */

window.addEventListener(

    "offline",

    () => {

        showToast(

            "You are offline.",

            "warning"

        );

    }

);

window.addEventListener(

    "online",

    () => {

        showToast(

            "Connection restored."

        );

        refreshProfile();

    }

);

/* ==========================================================
                    GLOBAL ERROR HANDLING
========================================================== */

window.addEventListener(

    "error",

    function (event) {

        console.error(

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    function (event) {

        console.error(

            event.reason

        );

    }

);

/* ==========================================================
                    PAGE EVENTS
========================================================== */

window.addEventListener(

    "load",

    hideLoader

);

window.addEventListener(

    "beforeunload",

    () => {

        hideLoader();

    }

);

/* ==========================================================
                    END OF FILE
========================================================== */
