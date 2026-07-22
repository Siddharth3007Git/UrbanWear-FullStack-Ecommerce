/* ==========================================
        UrbanWear Product Details
========================================== */

const API = API_URL;

// Product ID
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Quantity
let quantity = 1;

// DOM Elements
const loader = document.getElementById("loader");
const productSection = document.getElementById("productSection");
const errorSection = document.getElementById("errorSection");

const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productStock = document.getElementById("productStock");

const quantityInput = document.getElementById("quantity");

const increaseBtn = document.getElementById("increaseBtn");
const decreaseBtn = document.getElementById("decreaseBtn");

const addCartBtn = document.getElementById("addCartBtn");
const buyNowBtn = document.getElementById("buyNowBtn");

const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    if (!productId) {

        showError();

        return;

    }

    loadProduct();

});

// ==========================================
// CHECK LOGIN
// ==========================================

function checkLogin() {

    const token = localStorage.getItem("access_token");

    if (!token) {

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            window.location.replace("login.html");
        }

    }

}

// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProduct() {

    loader.style.display = "flex";

    productSection.style.display = "none";

    errorSection.style.display = "none";

    try {

        const response = await fetch(

            `${API}/products/${productId}`

        );

        if (!response.ok) {

            throw new Error("Product not found");

        }

        const product = await response.json();

        renderProduct(product);

        loader.style.display = "none";

        productSection.style.display = "block";

    }

    catch (error) {

        console.error(error);

        showError();

    }

}
/* ==========================================
        RENDER PRODUCT
========================================== */

function renderProduct(product) {

    // Product Image
    productImage.src = `../assets/images/${product.image}`;

    productImage.onerror = function () {

        this.src = "../assets/images/default-product.png";

    };

    // Product Name
    productName.textContent = product.name;

    // Category
    productCategory.textContent = product.category;

    // Price
    productPrice.textContent =
        `₹${Number(product.price).toLocaleString("en-IN")}`;

    // Stock
    if (product.stock > 0) {

        productStock.innerHTML =
            `<span class="stock in">
                In Stock (${product.stock})
            </span>`;

        addCartBtn.disabled = false;

        buyNowBtn.disabled = false;

    } else {

        productStock.innerHTML =
            `<span class="stock out">
                Out of Stock
            </span>`;

        addCartBtn.disabled = true;

        buyNowBtn.disabled = true;

    }

    // Reset Quantity
    quantity = 1;

    quantityInput.value = quantity;

}

/* ==========================================
        SHOW ERROR
========================================== */

function showError() {

    loader.style.display = "none";

    productSection.style.display = "none";

    errorSection.style.display = "block";

}

/* ==========================================
        BACK BUTTON
========================================== */

backBtn.addEventListener("click", () => {

    window.location.href = "products.html";

});
/* ==========================================
        QUANTITY CONTROLS
========================================== */

// Increase Quantity

increaseBtn.addEventListener("click", () => {

    // Get available stock from text
    const stockText = productStock.textContent;

    let maxStock = 1;

    const match = stockText.match(/\d+/);

    if (match) {

        maxStock = parseInt(match[0]);

    }

    if (quantity < maxStock) {

        quantity++;

        quantityInput.value = quantity;

    }

});

// Decrease Quantity

decreaseBtn.addEventListener("click", () => {

    if (quantity > 1) {

        quantity--;

        quantityInput.value = quantity;

    }

});

// Manual Quantity Input

quantityInput.addEventListener("input", () => {

    let value = parseInt(quantityInput.value);

    if (isNaN(value) || value < 1) {

        value = 1;

    }

    // Maximum Stock
    const stockText = productStock.textContent;

    let maxStock = 1;

    const match = stockText.match(/\d+/);

    if (match) {

        maxStock = parseInt(match[0]);

    }

    if (value > maxStock) {

        value = maxStock;

    }

    quantity = value;

    quantityInput.value = quantity;

});

/* ==========================================
        PREVENT INVALID KEYS
========================================== */

quantityInput.addEventListener("keydown", (event) => {

    // Prevent minus sign
    if (event.key === "-") {

        event.preventDefault();

    }

    // Prevent exponential notation (e/E)

    if (event.key === "e" || event.key === "E") {

        event.preventDefault();

    }

});

/* ==========================================
        VALIDATE ON BLUR
========================================== */

quantityInput.addEventListener("blur", () => {

    if (quantityInput.value === "") {

        quantity = 1;

        quantityInput.value = 1;

    }

});
/* ==========================================
        ADD TO CART
========================================== */

addCartBtn.addEventListener("click", addToCart);

async function addToCart() {

    const token = localStorage.getItem("access_token");

    if (!token) {

        showToast("Please login first.", "warning");

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

        return;

    }

    try {

        addCartBtn.disabled = true;

        addCartBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Adding...
        `;

        const response = await fetch(`${API}/cart/`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                product_id: Number(productId),

                quantity: quantity

            })

        });

        const result = await response.json();

        if (response.ok) {

            showToast(
                "Product added to cart successfully!",
                "success"
            );

            loadCartCount();

        }

        else if (response.status === 401) {

            showToast(
                "Session expired. Please login again.",
                "error"
            );

            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            setTimeout(() => {

                if (typeof redirectToLogin === "function") {
                    redirectToLogin();
                } else {
                    window.location.replace("login.html");
                }

            }, 1500);

        }

        else if (response.status === 404) {

            showToast(
                "Product not found.",
                "error"
            );

        }

        else if (response.status === 400) {

            showToast(
                result.detail || "Unable to add product.",
                "warning"
            );

        }

        else {

            showToast(
                result.detail || "Something went wrong.",
                "error"
            );

        }

    }

    catch (error) {

        console.error(error);

        showToast(
            "Network Error. Please try again.",
            "error"
        );

    }

    finally {

        addCartBtn.disabled = false;

        addCartBtn.innerHTML = `
            <i class="fa-solid fa-cart-shopping"></i>
            Add To Cart
        `;

    }

}

/* ==========================================
        BUY NOW
========================================== */

buyNowBtn.addEventListener("click", async () => {

    await addToCart();

    // Redirect to Cart page after adding
    window.location.href = "cart.html";

});
/* ==========================================
        LOAD USER INFORMATION
========================================== */

function loadUserInfo() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (userName) {

        userName.textContent = user.name || "User";

    }

    if (userEmail) {

        userEmail.textContent = user.email || "";

    }

}

/* ==========================================
        LOAD CART COUNT
========================================== */

async function loadCartCount() {

    const token = localStorage.getItem("access_token");

    if (!token) return;

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    try {

        const response = await fetch(`${API}/cart/`, {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        if (!response.ok) return;

        const result = await response.json();

        let totalItems = 0;

        if (Array.isArray(result)) {

            totalItems = result.length;

        }

        else if (Array.isArray(result.data)) {

            totalItems = result.data.length;

        }

        cartCount.textContent = totalItems;

    }

    catch (error) {

        console.error("Cart Count Error:", error);

    }

}

/* ==========================================
        TOAST MESSAGE
========================================== */

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

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
            window.location.replace("login.html");
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
        FORMAT PRICE
========================================== */

function formatPrice(price) {

    return Number(price).toLocaleString("en-IN", {

        style: "currency",

        currency: "INR",

        minimumFractionDigits: 0

    });

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
        PAGE INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadUserInfo();

    loadCartCount();

    if (!productId) {

        showError();

        return;

    }

    loadProduct();

});

/* ==========================================
        PAGE VISIBILITY
========================================== */

window.addEventListener("focus", () => {

    loadCartCount();

});

/* ==========================================
        PREVENT INVALID QUANTITY
========================================== */

quantityInput.addEventListener("paste", (event) => {

    event.preventDefault();

});

quantityInput.addEventListener("drop", (event) => {

    event.preventDefault();

});

/* ==========================================
        IMAGE FALLBACK
========================================== */

productImage.addEventListener("error", () => {

    productImage.src = "../assets/images/default-product.png";

});

/* ==========================================
        REFRESH CART AFTER ADDING PRODUCT
========================================== */

// This function is already called inside addToCart()
// Keeping this helper allows refreshing from anywhere.

function refreshCart() {

    loadCartCount();

}

/* ==========================================
        BACK BUTTON
========================================== */

if (backBtn) {

    backBtn.addEventListener("click", () => {

        history.back();

    });

}

/* ==========================================
        LOGOUT SHORTCUT
========================================== */

document.addEventListener("keydown", (event) => {

    // Ctrl + Shift + L

    if (event.ctrlKey && event.shiftKey && event.key === "L") {

        logout();

    }

});

/* ==========================================
        END OF FILE
========================================== */

console.log("UrbanWear Product Details Loaded Successfully");
