/* ==========================================
        API CONFIGURATION
========================================== */

const API = API_URL;

/* ==========================================
        DOM ELEMENTS
========================================== */

const loader = document.getElementById("loader");

const cartCount = document.getElementById("cartCount");

const logoutBtn = document.getElementById("logoutBtn");

const backBtn = document.getElementById("backBtn");

const cancelBtn = document.getElementById("cancelBtn");

/* ==========================================
        GLOBAL VARIABLES
========================================== */

let order = null;

/* ==========================================
        PAGE LOAD
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        checkLogin();

        initializePage();

    }

);

/* ==========================================
        LOGIN CHECK
========================================== */

function checkLogin() {

    const token = localStorage.getItem(

        "access_token"

    );

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
        INITIALIZE PAGE
========================================== */

async function initializePage() {

    showLoader();

    loadStoredOrder();

    await updateCartCount();

    hideLoader();

}

/* ==========================================
        LOAD ORDER
========================================== */

function loadStoredOrder() {

    const storedOrder = localStorage.getItem(

        "selected_order"

    );

    if (!storedOrder) {

        showToast(

            "Order not found.",

            "error"

        );

        setTimeout(() => {

            window.location.href = "orders.html";

        }, 1000);

        return;

    }

    order = JSON.parse(storedOrder);

    renderOrder();

}
/* ==========================================
        RENDER ORDER DETAILS
========================================== */

function renderOrder() {

    document.getElementById("orderId").textContent =

        `Order #${order.id}`;

    document.getElementById("orderDate").textContent =

        formatDate(order.created_at);

    document.getElementById("productName").textContent =

        order.name || "Product";

    document.getElementById("productCategory").textContent =

        order.category || "N/A";

    document.getElementById("productQuantity").textContent =

        order.quantity || 1;

    document.getElementById("productPrice").textContent =

        `₹${order.price || 0}`;

    document.getElementById("productTotal").textContent =

        `₹${order.total || order.price || 0}`;

    document.getElementById("subtotal").textContent =

        `₹${order.total || order.price || 0}`;

    document.getElementById("shippingCharge").textContent =

        `₹${order.shipping_charge || 0}`;

    document.getElementById("taxAmount").textContent =

        `₹${order.tax || 0}`;

    document.getElementById("grandTotal").textContent =

        `₹${order.grand_total || order.total || order.price || 0}`;

    document.getElementById("productImage").src =

        `../assets/images/${order.image || "no-image.png"}`;

    document.getElementById("productImage").alt =

        order.name || "Product";

    document.getElementById("shippingAddress").textContent =

        order.shipping_address ||

        "Address not available";

    document.getElementById("paymentMethod").textContent =

        order.payment_method ||

        "N/A";

    document.getElementById("deliveryDate").textContent =

        order.delivery_date ||

        "Not Available";

    document.getElementById("trackingId").textContent =

        order.tracking_id ||

        "Not Available";

    updateOrderStatus();

    updatePaymentStatus();

    updateCancelButton();

}

/* ==========================================
        ORDER STATUS
========================================== */

function updateOrderStatus() {

    const badge =

        document.getElementById("orderStatus");

    const status =

        order.status || "Pending";

    badge.textContent = status;

    badge.className =

        `order-status ${getStatusClass(status)}`;

}

/* ==========================================
        PAYMENT STATUS
========================================== */

function updatePaymentStatus() {

    const badge =

        document.getElementById("paymentStatus");

    const payment =

        order.payment_status || "Pending";

    badge.textContent = payment;

    badge.className =

        `payment-status ${getPaymentClass(payment)}`;

}

/* ==========================================
        CANCEL BUTTON
========================================== */

function updateCancelButton() {

    const status =

        (order.status || "").toLowerCase();

    cancelBtn.disabled =

        status === "cancelled" ||

        status === "canceled" ||

        status === "delivered";

}
/* ==========================================
        REFRESH ORDER FROM API
========================================== */

async function fetchLatestOrder() {

    try {

        const token = localStorage.getItem(

            "access_token"

        );

        const response = await fetch(

            `${API}/orders/${order.id}`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error(

                "Unable to fetch latest order."

            );

        }

        const result = await response.json();

        order = result.data || result;

        localStorage.setItem(

            "selected_order",

            JSON.stringify(order)

        );

        renderOrder();

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================
        CANCEL ORDER
========================================== */

cancelBtn.addEventListener(

    "click",

    cancelOrder

);

async function cancelOrder() {

    const confirmCancel = confirm(

        "Are you sure you want to cancel this order?"

    );

    if (!confirmCancel) return;

    try {

        showLoader();

        const token = localStorage.getItem(

            "access_token"

        );

        const response = await fetch(

            `${API}/orders/${order.id}/cancel`,

            {

                method:"PUT",

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );

        hideLoader();

        if(!response.ok){

            throw new Error(

                "Failed to cancel order."

            );

        }

        await fetchLatestOrder();

        showToast(

            "Order cancelled successfully.",

            "success"

        );

    }

    catch(error){

        hideLoader();

        console.error(error);

        showToast(

            "Unable to cancel order.",

            "error"

        );

    }

}

/* ==========================================
        BACK BUTTON
========================================== */

backBtn.addEventListener(

    "click",

    () => {

        window.location.href =

            "orders.html";

    }

);
/* ==========================================
        UPDATE CART COUNT
========================================== */

async function updateCartCount() {

    try {

        const token = localStorage.getItem(

            "access_token"

        );

        if (!token) return;

        const response = await fetch(

            `${API}/cart/`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        if (!response.ok) return;

        const result = await response.json();

        const cart = result.data || result || [];

        let total = 0;

        cart.forEach(item => {

            total += Number(item.quantity || 0);

        });

        cartCount.textContent = total;

    }

    catch (error) {

        console.error(

            "Cart Count:",

            error

        );

    }

}

/* ==========================================
        FORMAT DATE
========================================== */

function formatDate(dateString) {

    if (!dateString) {

        return "N/A";

    }

    const options = {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    };

    return new Date(dateString)

        .toLocaleString(

            "en-IN",

            options

        );

}

/* ==========================================
        ORDER STATUS CLASS
========================================== */

function getStatusClass(status) {

    if (!status) {

        return "status-pending";

    }

    switch (

        status.toLowerCase()

    ) {

        case "pending":

            return "status-pending";

        case "processing":

            return "status-processing";

        case "shipped":

            return "status-shipped";

        case "delivered":

            return "status-delivered";

        case "cancelled":

        case "canceled":

            return "status-cancelled";

        default:

            return "status-pending";

    }

}

/* ==========================================
        PAYMENT STATUS CLASS
========================================== */

function getPaymentClass(status) {

    if (!status) {

        return "payment-pending";

    }

    switch (

        status.toLowerCase()

    ) {

        case "paid":

            return "payment-paid";

        case "pending":

            return "payment-pending";

        case "failed":

            return "payment-failed";

        default:

            return "payment-pending";

    }

}
/* ==========================================
        TOAST NOTIFICATION
========================================== */

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.className = `toast ${type}`;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
        LOADER
========================================== */

function showLoader() {

    loader.classList.remove("hidden");

}

function hideLoader() {

    loader.classList.add("hidden");

}

/* ==========================================
        LOGOUT
========================================== */

logoutBtn.addEventListener(

    "click",

    logout

);

function logout() {

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmLogout) return;

    localStorage.removeItem(

        "access_token"

    );

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem(

        "selected_order"

    );

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

    }, 800);

}

/* ==========================================
        PAGE HELPERS
========================================== */

function refreshPage() {

    fetchLatestOrder();

}

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

/* ==========================================
        WINDOW EVENTS
========================================== */

window.addEventListener(

    "focus",

    () => {

        if (order) {

            fetchLatestOrder();

        }

    }

);

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            !document.hidden &&

            order

        ) {

            fetchLatestOrder();

        }

    }

);

/* ==========================================
        KEYBOARD SHORTCUTS
========================================== */

document.addEventListener(

    "keydown",

    (event) => {

        if (

            event.key === "Escape"

        ) {

            window.location.href =

                "orders.html";

        }

        if (

            event.ctrlKey &&

            event.key.toLowerCase() === "r"

        ) {

            event.preventDefault();

            refreshPage();

        }

    }

);
/* ==========================================
        AUTO REFRESH
========================================== */

let refreshInterval = setInterval(() => {

    if (order) {

        fetchLatestOrder();

    }

}, 60000);

/* ==========================================
        GLOBAL ERROR HANDLERS
========================================== */

window.addEventListener(

    "error",

    (event) => {

        console.error(

            "Application Error:",

            event.error

        );

        showToast(

            "Something went wrong.",

            "error"

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Promise Rejection:",

            event.reason

        );

        showToast(

            "Network request failed.",

            "error"

        );

    }

);

/* ==========================================
        CLEANUP
========================================== */

window.addEventListener(

    "beforeunload",

    () => {

        clearInterval(

            refreshInterval

        );

    }

);

/* ==========================================
        CONNECTION STATUS
========================================== */

window.addEventListener(

    "offline",

    () => {

        showToast(

            "You are offline.",

            "error"

        );

    }

);

window.addEventListener(

    "online",

    () => {

        showToast(

            "Connection restored.",

            "success"

        );

        if (order) {

            fetchLatestOrder();

        }

    }

);

/* ==========================================
        IMAGE FALLBACK
========================================== */

const productImage =

    document.getElementById(

        "productImage"

    );

if (productImage) {

    productImage.addEventListener(

        "error",

        function () {

            this.src =

                "../assets/images/no-image.png";

        }

    );

}

/* ==========================================
        PAGE READY
========================================== */

window.addEventListener(

    "load",

    () => {

        hideLoader();

    }

);

/* ==========================================
        END OF FILE
========================================== */
