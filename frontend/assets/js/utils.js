/* ==========================================
   UrbanWear Utility Functions
========================================== */

/* ==========================================
   Toast Notification
========================================== */

function showToast(message, type = "success") {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.style.display = "block";

    switch (type) {

        case "success":

            toast.style.background = "#16a34a";

            break;

        case "error":

            toast.style.background = "#dc2626";

            break;

        case "warning":

            toast.style.background = "#f59e0b";

            break;

        default:

            toast.style.background = "#2563eb";

    }

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}

/* ==========================================
   Loader
========================================== */

function showLoader() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

}

/* ==========================================
   Currency
========================================== */

function formatCurrency(amount) {

    return new Intl.NumberFormat(

        "en-IN",

        {

            style: "currency",

            currency: "INR"

        }

    ).format(amount);

}

/* ==========================================
   Date Formatter
========================================== */

function formatDate(date) {

    return new Date(date).toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}

/* ==========================================
   Date & Time
========================================== */

function formatDateTime(date) {

    return new Date(date).toLocaleString(

        "en-IN"

    );

}

/* ==========================================
   Capitalize
========================================== */

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase()

        + text.slice(1);

}

/* ==========================================
   Debounce
========================================== */

function debounce(func, delay = 300) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            func(...args);

        }, delay);

    };

}

/* ==========================================
   Email Validation
========================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(email);

}

/* ==========================================
   Password Validation
========================================== */

function isStrongPassword(password) {

    return password.length >= 8;

}

/* ==========================================
   Phone Validation
========================================== */

function isValidPhone(phone) {

    return /^[6-9]\d{9}$/

        .test(phone);

}

/* ==========================================
   Empty Check
========================================== */

function isEmpty(value) {

    return value === null ||

        value === undefined ||

        value.trim() === "";

}

/* ==========================================
   Random ID
========================================== */

function generateId(length = 8) {

    const chars =

        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let id = "";

    for (let i = 0; i < length; i++) {

        id += chars.charAt(

            Math.floor(

                Math.random() * chars.length

            )

        );

    }

    return id;

}

/* ==========================================
   Copy To Clipboard
========================================== */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

        showToast("Copied to clipboard.");

    }

    catch {

        showToast(

            "Unable to copy.",

            "error"

        );

    }

}

/* ==========================================
   Confirm Dialog
========================================== */

function confirmAction(message) {

    return confirm(message);

}

/* ==========================================
   Sleep
========================================== */

function sleep(ms) {

    return new Promise(resolve =>

        setTimeout(resolve, ms)

    );

}

/* ==========================================
   URL Parameter
========================================== */

function getQueryParam(name) {

    const params = new URLSearchParams(

        window.location.search

    );

    return params.get(name);

}

/* ==========================================
   Redirect
========================================== */

function redirect(url) {

    window.location.href = url;

}

/* ==========================================
   Local Storage
========================================== */

function saveToStorage(key, value) {

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

}

function getFromStorage(key) {

    const data = localStorage.getItem(key);

    return data

        ? JSON.parse(data)

        : null;

}

function removeFromStorage(key) {

    localStorage.removeItem(key);

}

/* ==========================================
   Scroll To Top
========================================== */

function scrollTopPage() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
   Global Export
========================================== */

window.showToast = showToast;

window.showLoader = showLoader;

window.hideLoader = hideLoader;

window.formatCurrency = formatCurrency;

window.formatDate = formatDate;

window.formatDateTime = formatDateTime;

window.capitalize = capitalize;

window.debounce = debounce;

window.isValidEmail = isValidEmail;

window.isStrongPassword = isStrongPassword;

window.isValidPhone = isValidPhone;

window.isEmpty = isEmpty;

window.generateId = generateId;

window.copyText = copyText;

window.confirmAction = confirmAction;

window.sleep = sleep;

window.getQueryParam = getQueryParam;

window.redirect = redirect;

window.saveToStorage = saveToStorage;

window.getFromStorage = getFromStorage;

window.removeFromStorage = removeFromStorage;

window.scrollTopPage = scrollTopPage;