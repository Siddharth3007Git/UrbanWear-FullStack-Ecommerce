/* ==========================================
        API CONFIGURATION
========================================== */

const API = API_BASE_URL;
/* ==========================================
        DOM ELEMENTS
========================================== */

const loader = document.getElementById("loader");

const checkoutForm = document.getElementById("checkoutForm");

const checkoutItems = document.getElementById("checkoutItems");

const totalItems = document.getElementById("totalItems");

const subtotal = document.getElementById("subtotal");

const grandTotal = document.getElementById("grandTotal");

const cartCount = document.getElementById("cartCount");

const placeOrderBtn = document.getElementById("placeOrderBtn");

const logoutBtn = document.getElementById("logoutBtn");

/* ==========================================
        GLOBAL VARIABLES
========================================== */

let cart = [];

let totalQuantity = 0;

let totalPrice = 0;

/* ==========================================
        PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadUserInfo();

    loadCheckout();

});

/* ==========================================
        LOGIN CHECK
========================================== */

function checkLogin() {

    const token = localStorage.getItem("access_token");

    if (!token) {

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

/* ==========================================
        LOAD CHECKOUT
========================================== */

async function loadCheckout() {

    loader.style.display = "flex";

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(

            `${API}/cart/`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error("Unable to load cart.");

        }

        const result = await response.json();

        cart = result.data || result;

        loader.style.display = "none";

        if (!cart || cart.length === 0) {

            showToast(

                "Your cart is empty.",

                "warning"

            );

            setTimeout(() => {

        window.location.href = "cart.html";

            }, 1500);

            return;

        }

        renderCheckoutItems();

        updateSummary();

    }

    catch (error) {

        console.error(error);

        loader.style.display = "none";

        showToast(

            "Failed to load checkout.",

            "error"

        );

    }

}

/* ==========================================
        LOAD USER INFORMATION
========================================== */

function loadUserInfo() {

    const user = JSON.parse(

        localStorage.getItem("user")

    );

    if (!user) return;

    if (document.getElementById("fullName")) {

        document.getElementById("fullName").value =

            user.name || "";

    }

    if (document.getElementById("email")) {

        document.getElementById("email").value =

            user.email || "";

    }

    if (document.getElementById("phone")) {

        document.getElementById("phone").value =

            user.phone || "";

    }

}
/* ==========================================
        RENDER CHECKOUT ITEMS
========================================== */

function renderCheckoutItems() {

    checkoutItems.innerHTML = "";

    totalQuantity = 0;

    totalPrice = 0;

    cart.forEach(item => {

        const product = item.product || item;

        const image = product.image || "default-product.png";

        const name = product.name || "Product";

        const category = product.category || "Category";

        const price = Number(product.price || 0);

        const quantity = Number(item.quantity || 1);

        totalQuantity += quantity;

        totalPrice += price * quantity;

        const card = document.createElement("div");

        card.className = "checkout-item";

        card.innerHTML = `

            <img
                src="../assets/images/${image}"
                alt="${name}"
                onerror="this.src='../assets/images/default-product.png'">

            <div class="item-info">

                <h4>${name}</h4>

                <p>${category}</p>

                <span class="item-qty">

                    Qty : ${quantity}

                </span>

            </div>

            <div class="item-price">

                ₹${(price * quantity).toLocaleString("en-IN")}

            </div>

        `;

        checkoutItems.appendChild(card);

    });

}

/* ==========================================
        UPDATE ORDER SUMMARY
========================================== */

function updateSummary() {

    totalItems.textContent = totalQuantity;

    subtotal.textContent =

        `₹${totalPrice.toLocaleString("en-IN")}`;

    grandTotal.textContent =

        `₹${totalPrice.toLocaleString("en-IN")}`;

    updateCartBadge();

}

/* ==========================================
        UPDATE CART BADGE
========================================== */



/* ==========================================
        FORMAT PRICE
========================================== */

function formatPrice(price) {

    return Number(price).toLocaleString(

        "en-IN",

        {

            style: "currency",

            currency: "INR",

            minimumFractionDigits: 0

        }

    );

}

/* ==========================================
        REFRESH CHECKOUT
========================================== */


/* ==========================================
        VALIDATE CHECKOUT FORM
========================================== */

function validateForm() {

    const fullName = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const address = document.getElementById("address").value.trim();

    const city = document.getElementById("city").value.trim();

    const state = document.getElementById("state").value.trim();

    const pincode = document.getElementById("pincode").value.trim();

    const country = document.getElementById("country").value.trim();

    if (
        !fullName ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode ||
        !country
    ) {

        showToast(
            "Please fill all required fields.",
            "warning"
        );

        return false;

    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        showToast(
            "Enter a valid email address.",
            "warning"
        );

        return false;

    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {

        showToast(
            "Enter a valid 10-digit mobile number.",
            "warning"
        );

        return false;

    }

    const pinRegex = /^[0-9]{6}$/;

    if (!pinRegex.test(pincode)) {

        showToast(
            "Enter a valid 6-digit pincode.",
            "warning"
        );

        return false;

    }

    return true;

}

/* ==========================================
        PAYMENT METHOD
========================================== */

function getPaymentMethod() {

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    );

    return payment
        ? payment.value
        : "cod";

}

/* ==========================================
        PREPARE ORDER DATA
========================================== */

function prepareOrderData() {

    const shippingAddress = {

        full_name: document.getElementById("fullName").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        address: document.getElementById("address").value.trim(),

        city: document.getElementById("city").value.trim(),

        state: document.getElementById("state").value.trim(),

        pincode: document.getElementById("pincode").value.trim(),

        country: document.getElementById("country").value.trim()

    };

    return {

        payment_method: getPaymentMethod(),

        shipping_address: shippingAddress

    };

}

/* ==========================================
        PLACE ORDER BUTTON
========================================== */


/* ==========================================
        PLACE ORDER
========================================== */

async function placeOrder() {

    const token = localStorage.getItem("access_token");

    placeOrderBtn.disabled = true;

    placeOrderBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Placing Order...
    `;

    try {

        const response = await fetch(

            `${API}/orders/`,

            {

                method: "POST",

                headers: {

                    "Authorization": `Bearer ${token}`,

                    "Accept": "application/json"

                }

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result || "Unable to place order."

            );

        }

        showToast(

            "Order placed successfully!",

            "success"

        );

        setTimeout(() => {

        window.location.href = "orders.html";

        }, 1500);

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally {

        placeOrderBtn.disabled = false;

        placeOrderBtn.innerHTML = `
            <i class="fa-solid fa-lock"></i>
            Place Order
        `;

    }

}
/* ==========================================
        LOGOUT
========================================== */

function logout() {

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmLogout) return;

    localStorage.removeItem("access_token");

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    showToast(

        "Logged out successfully.",

        "success"

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

    }, 1000);

}

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        logout

    );

}

/* ==========================================
        TOAST NOTIFICATION
========================================== */

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.className = `toast ${type}`;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
        REFRESH CHECKOUT
========================================== */

function refreshCheckout() {

    loadCheckout();

}

/* ==========================================
        FORMAT PRICE
========================================== */



/* ==========================================
        SCROLL TO TOP
========================================== */

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
        UPDATE CART BADGE
========================================== */

function updateCartBadge() {

    if (cartCount) {

        cartCount.textContent = totalQuantity;

    }

}
/* ==========================================
        HANDLE UNAUTHORIZED
========================================== */

function handleUnauthorized() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    showToast(

        "Session expired. Please login again.",

        "error"

    );

    setTimeout(() => {

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            window.location.replace("login.html");
        }

    }, 1500);

}

/* ==========================================
        CHECK API RESPONSE
========================================== */

function checkResponse(response) {

    if (response.status === 401) {

        handleUnauthorized();

        return false;

    }

    return true;

}

/* ==========================================
        WINDOW EVENTS
========================================== */

window.addEventListener("focus", () => {

    refreshCheckout();

});

window.addEventListener("beforeunload", () => {

    console.log("Leaving Checkout Page...");

});

/* ==========================================
        KEYBOARD SHORTCUT
========================================== */

// Ctrl + Shift + L  → Logout

document.addEventListener("keydown", (event) => {

    if (

        event.ctrlKey &&

        event.shiftKey &&

        event.key === "L"

    ) {

        logout();

    }

});

/* ==========================================
        PREVENT MULTIPLE SUBMITS
========================================== */

let isSubmitting = false;

placeOrderBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    console.log("STEP 1");

    console.log(validateForm());

    console.log("STEP 2");

    await placeOrder();

    console.log("STEP 3");

});

/* ==========================================
        INITIALIZE PAGE
========================================== */





/* ==========================================
        END OF FILE
========================================== */

console.log("UrbanWear Checkout Page Loaded Successfully");
