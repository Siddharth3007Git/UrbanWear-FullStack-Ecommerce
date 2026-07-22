/* ==========================================
        API CONFIGURATION
========================================== */

const API = API_BASE_URL;

const loginPage = window.location.pathname.includes("/pages/admin/")
    ? "../login.html"
    : "login.html";

/* ==========================================
        DOM ELEMENTS
========================================== */

const loader = document.getElementById("loader");

const ordersContainer =
    document.getElementById("ordersContainer");

const emptyOrders =
    document.getElementById("emptyOrders");

const searchInput =
    document.getElementById("searchOrder");

const searchBtn =
    document.getElementById("searchBtn");

const cartCount =
    document.getElementById("cartCount");

const logoutBtn =
    document.getElementById("logoutBtn");

/* ==========================================
        GLOBAL DATA
========================================== */

let orders = [];

let filteredOrders = [];

/* ==========================================
        PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadOrders();

});

/* ==========================================
        LOGIN CHECK
========================================== */

function checkLogin() {

    const token = localStorage.getItem("access_token");

    if (!token) {

        window.location.replace(loginPage);

    }

}

/* ==========================================
        LOAD ORDERS
========================================== */

async function loadOrders() {

    loader.style.display = "flex";

    ordersContainer.style.display = "none";

    emptyOrders.style.display = "none";

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(

            `${API}/orders/`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error("Unable to load orders.");

        }

        const result = await response.json();

        orders = result.data || result;

        filteredOrders = [...orders];

        loader.style.display = "none";

        if (!orders || orders.length === 0) {

            emptyOrders.style.display = "block";

            return;

        }

        ordersContainer.style.display = "flex";

        renderOrders();

    }

    catch (error) {

        console.error(error);

        loader.style.display = "none";

        showToast(

            "Failed to load orders.",

            "error"

        );

    }

}
/* ==========================================
        RENDER ORDERS
========================================== */

function renderOrders(data = filteredOrders) {

    ordersContainer.innerHTML = "";

    if (!data.length) {

        ordersContainer.style.display = "none";

        emptyOrders.style.display = "block";

        return;

    }

    emptyOrders.style.display = "none";

    ordersContainer.style.display = "flex";

    data.forEach(order => {

        const card = document.createElement("div");

        card.className = "order-card";

        card.innerHTML = `

            <div class="order-header">

                <div>

                    <div class="order-id">

                        Order #${order.id}

                    </div>

                    <div class="order-date">

                        ${formatDate(order.created_at)}

                    </div>

                </div>

            </div>

            <div class="order-body">

                <img
                    src="../assets/images/${order.image || 'no-image.png'}"
                    class="order-image"
                    alt="${order.name || 'Product'}"
                >

                <div class="order-details">

                    <h3>

                        ${order.name || "Product"}

                    </h3>

                    <p>

                        Quantity :
                        <strong>${order.quantity || 1}</strong>

                    </p>

                    <p class="order-price">

                        ₹${order.total || order.price || 0}

                    </p>

                    <div class="order-status ${getStatusClass(order.status)}">

                        ${order.status || "Pending"}

                    </div>

                    <br>

                    <div class="payment-status ${getPaymentClass(order.payment_status)}">

                        ${order.payment_status || "Pending"}

                    </div>

                </div>

            </div>

            <div class="order-footer">

                <div class="order-summary">

                    <span>

                        Total :
                        <strong>

                            ₹${order.total || order.price || 0}

                        </strong>

                    </span>

                </div>

                <div class="order-actions">

                    <button
                        class="details-btn"
                        onclick="viewOrder(${order.id})">

                        <i class="fa-solid fa-eye"></i>

                        View Details

                    </button>

                    <button
                        class="cancel-btn"
                        onclick="cancelOrder(${order.id})"
                        ${order.status === "Cancelled" ? "disabled" : ""}>

                        <i class="fa-solid fa-ban"></i>

                        Cancel

                    </button>

                </div>

            </div>

        `;

        ordersContainer.appendChild(card);

    });

}

/* ==========================================
        SEARCH
========================================== */

searchBtn.addEventListener("click", searchOrders);

searchInput.addEventListener("keyup", e => {

    if (e.key === "Enter") {

        searchOrders();

    }

});

function searchOrders() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    if (!keyword) {

        filteredOrders = [...orders];

        renderOrders();

        return;

    }

    filteredOrders = orders.filter(order => {

        return (

            String(order.id)
                .includes(keyword)

            ||

            (order.name || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (order.status || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    renderOrders();

}
/* ==========================================
        VIEW ORDER DETAILS
========================================== */

async function viewOrder(orderId) {

    try {

        loader.style.display = "flex";

        const token = localStorage.getItem("access_token");

        const response = await fetch(

            `${API}/orders/${orderId}`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        loader.style.display = "none";

        if (!response.ok) {

            throw new Error("Unable to fetch order details.");

        }

        const order = await response.json();

        localStorage.setItem(

            "selected_order",

            JSON.stringify(order)

        );

        window.location.href = "order_details.html";

    }

    catch (error) {

        loader.style.display = "none";

        console.error(error);

        showToast(

            "Unable to load order details.",

            "error"

        );

    }

}

/* ==========================================
        CANCEL ORDER
========================================== */

async function cancelOrder(orderId) {

    const confirmCancel = confirm(

        "Are you sure you want to cancel this order?"

    );

    if (!confirmCancel) return;

    try {

        loader.style.display = "flex";

        const token = localStorage.getItem("access_token");

        const response = await fetch(

            `${API}/orders/${orderId}/cancel`,

            {

                method: "PUT",

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        loader.style.display = "none";

        if (!response.ok) {

            throw new Error("Failed to cancel order.");

        }

        showToast(

            "Order cancelled successfully.",

            "success"

        );

        await loadOrders();

    }

    catch (error) {

        loader.style.display = "none";

        console.error(error);

        showToast(

            "Unable to cancel order.",

            "error"

        );

    }

}

/* ==========================================
        REFRESH ORDERS
========================================== */

async function refreshOrders() {

    await loadOrders();

}
/* ==========================================
        FORMAT DATE
========================================== */

function formatDate(dateString) {

    if (!dateString) return "N/A";

    const options = {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    };

    return new Date(dateString).toLocaleString(

        "en-IN",

        options

    );

}

/* ==========================================
        ORDER STATUS CLASS
========================================== */

function getStatusClass(status) {

    if (!status) return "status-pending";

    switch (status.toLowerCase()) {

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

    if (!status) return "payment-pending";

    switch (status.toLowerCase()) {

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
        UPDATE CART COUNT
========================================== */

async function updateCartCount() {

    try {

        const token = localStorage.getItem("access_token");

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

        console.error("Cart Count:", error);

    }

}

/* ==========================================
        INITIALIZE CART COUNT
========================================== */

updateCartCount();
/* ==========================================
        TOAST NOTIFICATION
========================================== */

function showToast(message, type = "info") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.className = `toast ${type}`;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
        LOADER HELPERS
========================================== */

function showLoader() {

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    if (loader) {

        loader.style.display = "none";

    }

}

/* ==========================================
        LOGOUT
========================================== */

logoutBtn.addEventListener("click", logout);

function logout() {

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if (!confirmLogout) return;

    localStorage.removeItem("access_token");

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("selected_order");

    localStorage.removeItem("customer");

    showToast(

        "Logged out successfully.",

        "success"

    );

    setTimeout(() => {

        window.location.replace(loginPage);

    }, 1000);

}

/* ==========================================
        REFRESH PAGE
========================================== */

function refreshPage() {

    window.location.reload();

}

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
        KEYBOARD SHORTCUTS
========================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        searchInput.value = "";

        filteredOrders = [...orders];

        renderOrders();

    }

    if (event.key === "F5") {

        updateCartCount();

    }

});

/* ==========================================
        WINDOW EVENTS
========================================== */

window.addEventListener("focus", () => {

    updateCartCount();

});
/* ==========================================
        AUTO REFRESH
========================================== */

setInterval(() => {

    if (document.visibilityState === "visible") {

        updateCartCount();

    }

}, 30000);

/* ==========================================
        PAGE VISIBILITY
========================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            document.visibilityState === "visible"

        ) {

            updateCartCount();

        }

    }

);

/* ==========================================
        GLOBAL ERROR HANDLER
========================================== */

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Unhandled Promise:",

            event.reason

        );

    }

);

window.addEventListener(

    "error",

    (event) => {

        console.error(

            "JavaScript Error:",

            event.error

        );

    }

);

/* ==========================================
        INITIAL PAGE SETUP
========================================== */

function initializePage() {

    updateCartCount();

    searchInput.value = "";

    filteredOrders = [];

}

initializePage();

/* ==========================================
        CLEANUP
========================================== */

window.addEventListener(

    "beforeunload",

    () => {

        searchInput.value = "";

    }

);

/* ==========================================
        END OF FILE
========================================== */
