/* ==========================================
   UrbanWear API Configuration
========================================== */

function getApiBaseUrl() {
    const configured = (window.__URBANWEAR_API_BASE_URL__ || localStorage.getItem("api_base_url") || "").replace(/\/$/, "");

    if (configured) {
        return configured;
    }

    return "http://127.0.0.1:8000";
}

let API_BASE_URL = getApiBaseUrl();
window.API_BASE_URL = API_BASE_URL;

/* ==========================================
   API Endpoints
========================================== */

const API_ENDPOINTS = {

    // Authentication
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",

    // User
    PROFILE: "/profile",
    UPDATE_PROFILE: "/profile",

    // Products
    PRODUCTS: "/products",
    PRODUCT_DETAILS: (id) => `/products/${id}`,

    // Categories
    CATEGORIES: "/categories",

    // Cart
    CART: "/cart",
    CART_ITEM: (id) => `/cart/${id}`,

    // Wishlist
    WISHLIST: "/wishlist",
    WISHLIST_ITEM: (id) => `/wishlist/${id}`,

    // Orders
    ORDERS: "/orders",
    ORDER_DETAILS: (id) => `/orders/${id}`,

    // Checkout
    CHECKOUT: "/checkout",

    // Payments
    PAYMENT: "/payment",
    VERIFY_PAYMENT: "/payment/verify",

    // AI Chat
    CHAT: "/chat",

    // =========================
    // Admin
    // =========================

    ADMIN_DASHBOARD: "/admin/dashboard",

    ADMIN_PRODUCTS: "/admin/products",
    ADMIN_PRODUCT: (id) => `/admin/products/${id}`,

    ADMIN_CUSTOMERS: "/admin/customers",
    ADMIN_CUSTOMER: (id) => `/admin/customers/${id}`,

    ADMIN_ORDERS: "/admin/orders",
    ADMIN_ORDER: (id) => `/admin/orders/${id}`,

    ADMIN_TRANSACTIONS: "/admin/transactions",
    ADMIN_TRANSACTION: (id) => `/admin/transactions/${id}`

};

/* ==========================================
   Default Headers
========================================== */

function getHeaders() {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

async function requestJson(endpoint, options = {}, fallbackMessage = "Unable to load data. Please try again later.") {
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const requestUrl = `${API_BASE_URL}${normalizedEndpoint}`;

    const requestOptions = {
        ...options,
        headers: {
            ...getHeaders(),
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(requestUrl, requestOptions);
        const contentType = response.headers.get("content-type") || "";
        let data = {};

        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = text ? { message: text } : {};
        }

        if (!response.ok) {
            throw new Error(data.detail || data.message || fallbackMessage);
        }

        return data;
    } catch (error) {
        const message = error instanceof Error ? error.message : fallbackMessage;
        const friendlyMessage = /failed to fetch|network|fetch/i.test(message)
            ? fallbackMessage
            : message;

        console.error("[API Debug]", {
            endpoint: normalizedEndpoint,
            requestUrl,
            requestOptions,
            error: friendlyMessage
        });

        throw new Error(friendlyMessage);
    }
}

/* ==========================================
   GET Request
========================================== */

async function apiGet(endpoint) {
    return requestJson(endpoint, { method: "GET" }, "Unable to load data. Please try again later.");
}

/* ==========================================
   POST Request
========================================== */

async function apiPost(endpoint, data) {
    return requestJson(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
    }, "Unable to complete the request. Please try again later.");
}

/* ==========================================
   PUT Request
========================================== */

async function apiPut(endpoint, data) {
    return requestJson(endpoint, {
        method: "PUT",
        body: JSON.stringify(data)
    }, "Unable to update the resource. Please try again later.");
}

/* ==========================================
   PATCH Request
========================================== */

async function apiPatch(endpoint, data) {
    return requestJson(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data)
    }, "Unable to update the resource. Please try again later.");
}

/* ==========================================
   DELETE Request
========================================== */

async function apiDelete(endpoint) {
    return requestJson(endpoint, { method: "DELETE" }, "Unable to delete the resource. Please try again later.");
}

/* ==========================================
   Response Handler
========================================== */

async function handleResponse(response, fallbackMessage = "Something went wrong.") {
    const contentType = response.headers.get("content-type") || "";
    let result = {};

    try {
        if (contentType.includes("application/json")) {
            result = await response.json();
        } else {
            const text = await response.text();
            result = text ? { message: text } : {};
        }
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(result.detail || result.message || fallbackMessage);
    }

    return result;
}

/* ==========================================
   Upload File
========================================== */

async function uploadFile(endpoint, formData) {

    const token = localStorage.getItem("token");

    const headers = {};

    if (token) {

        headers["Authorization"] = `Bearer ${token}`;

    }

    const response = await fetch(

        API_BASE_URL + endpoint,

        {

            method: "POST",

            headers,

            body: formData

        }

    );

    return handleResponse(response);

}

/* ==========================================
   Download File
========================================== */

async function downloadFile(endpoint) {

    const response = await fetch(

        API_BASE_URL + endpoint,

        {

            headers: getHeaders()

        }

    );

    if (!response.ok) {

        throw new Error("Download failed.");

    }

    return response.blob();

}

/* ==========================================
   Export Globals
========================================== */

window.API_BASE_URL = API_BASE_URL;
window.API_ENDPOINTS = API_ENDPOINTS;
window.apiGet = apiGet;
window.requestJson = requestJson;

window.apiPost = apiPost;

window.apiPut = apiPut;

window.apiPatch = apiPatch;

window.apiDelete = apiDelete;

window.uploadFile = uploadFile;

window.downloadFile = downloadFile;

const API_URL = API_BASE_URL;
window.API_URL = API_URL;