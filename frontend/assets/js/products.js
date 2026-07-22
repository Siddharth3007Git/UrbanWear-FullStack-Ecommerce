/* ==========================================
   UrbanWear - Products Page
========================================== */

const API = API_BASE_URL;

// Pagination
let currentPage = 1;
const limit = 10;

// DOM Elements
const productsContainer = document.getElementById("productsContainer");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const minPriceInput = document.getElementById("minPrice");

const maxPriceInput = document.getElementById("maxPrice");

const filterBtn = document.getElementById("filterBtn");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const pageNumber = document.getElementById("pageNumber");

const logoutBtn = document.getElementById("logoutBtn");

// =========================================
// PAGE LOAD
// =========================================


// =========================================
// CHECK LOGIN
// =========================================

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

// =========================================
// LOAD PRODUCTS
// =========================================

async function loadProducts() {

    productsContainer.innerHTML =

        `<div class="loading">

            Loading Products...

        </div>`;

    try {

        const params = new URLSearchParams({

            page: currentPage,

            limit: limit

        });

        if (searchInput.value.trim()) {

            params.append(

                "name",

                searchInput.value.trim()

            );

        }

        if (categoryFilter.value) {

            params.append(

                "category",

                categoryFilter.value

            );

        }

        if (minPriceInput.value) {

            params.append(

                "min_price",

                minPriceInput.value

            );

        }

        if (maxPriceInput.value) {

            params.append(

                "max_price",

                maxPriceInput.value

            );

        }

        const response = await fetch(

            `${API}/products/?${params.toString()}`

        );

        if (!response.ok) {

            throw new Error(

                "Unable to load products."

            );

        }

        const result = await response.json();
        
        renderProducts(result.data);

        updatePagination(result);

    }

    catch (error) {

        productsContainer.innerHTML =

            `<div class="no-products">

                ${error.message}

            </div>`;

    }

}
/* ==========================================
        RENDER PRODUCTS
========================================== */

function renderProducts(products) {

    productsContainer.innerHTML = "";

    if (!products || products.length === 0) {

        productsContainer.innerHTML = `

            <div class="no-products">

                <h2>No Products Found</h2>

                <p>Try changing your search or filters.</p>

            </div>

        `;

        return;

    }

    products.forEach(product => {

        const imagePath = product.image
    ? `../assets/images/${product.image}`
    : "../assets/images/default-product.png";

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

            <img
                src="${imagePath}"
                alt="${product.name}"
                class="product-image"
                onerror="this.src='../assets/images/default-product.png'">

            <div class="product-info">

                <h3>${product.name}</h3>

                <p class="product-category">

                    ${product.category}

                </p>

                <p class="product-price">

                    ₹${product.price.toLocaleString()}

                </p>

                <p class="product-stock">

                    ${
                        product.stock > 0
                        ? `<span class="stock-available">
                            In Stock (${product.stock})
                           </span>`
                        : `<span class="stock-out">
                            Out of Stock
                           </span>`
                    }

                </p>

                <div class="product-actions">

                    <button
                        class="view-btn"
                        onclick="viewProduct(${product.id})">

                        <i class="fa-solid fa-eye"></i>

                        View Details

                    </button>

                    <button
                        class="cart-btn"
                        onclick="addToCart(${product.id})"
                        ${product.stock === 0 ? "disabled" : ""}>

                        <i class="fa-solid fa-cart-shopping"></i>

                        Add To Cart

                    </button>

                </div>

            </div>

        `;

        productsContainer.appendChild(card);

    });

}

/* ==========================================
        VIEW PRODUCT
========================================== */

function viewProduct(productId) {

    window.location.href =

        `product_details.html?id=${productId}`;

}
/* ==========================================
        SEARCH & FILTERS
========================================== */

// Apply Filters Button

filterBtn.addEventListener("click", () => {

    currentPage = 1;

    loadProducts();

});

// Live Search

searchInput.addEventListener("keyup", (event) => {

    if (event.key === "Enter") {

        currentPage = 1;

        loadProducts();

    }

});

// Category Filter

categoryFilter.addEventListener("change", () => {

    currentPage = 1;

    loadProducts();

});

// Minimum Price Filter

minPriceInput.addEventListener("change", () => {

    currentPage = 1;

    loadProducts();

});

// Maximum Price Filter

maxPriceInput.addEventListener("change", () => {

    currentPage = 1;

    loadProducts();

});

/* ==========================================
        CLEAR FILTERS
========================================== */

function clearFilters() {

    searchInput.value = "";

    categoryFilter.value = "";

    minPriceInput.value = "";

    maxPriceInput.value = "";

    currentPage = 1;

    loadProducts();

}

/* ==========================================
        OPTIONAL: SEARCH WITH DELAY
========================================== */

// Uncomment this block if you want automatic
// searching while typing instead of pressing Enter.

/*
let searchTimer;

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        currentPage = 1;

        loadProducts();

    }, 500);

});
*/
/* ==========================================
        PAGINATION
========================================== */

function updatePagination(result) {

    // Update current page number
    pageNumber.textContent = `Page ${result.page}`;

    // Previous button
    if (result.page <= 1) {

        prevBtn.disabled = true;

        prevBtn.classList.add("disabled");

    } else {

        prevBtn.disabled = false;

        prevBtn.classList.remove("disabled");

    }

    // Next button
    const totalPages = Math.ceil(result.total / result.limit);

    if (result.page >= totalPages) {

        nextBtn.disabled = true;

        nextBtn.classList.add("disabled");

    } else {

        nextBtn.disabled = false;

        nextBtn.classList.remove("disabled");

    }

}

/* ==========================================
        PREVIOUS PAGE
========================================== */

prevBtn.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        loadProducts();

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

});

/* ==========================================
        NEXT PAGE
========================================== */

nextBtn.addEventListener("click", () => {

    currentPage++;

    loadProducts();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

/* ==========================================
        GO TO SPECIFIC PAGE
========================================== */

function goToPage(page) {

    if (page < 1) return;

    currentPage = page;

    loadProducts();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
/* ==========================================
        ADD TO CART
========================================== */

async function addToCart(productId) {

    const token = localStorage.getItem("access_token");

    if (!token) {

        alert("Please login first.");

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            if (typeof redirectToLogin === "function") {
                redirectToLogin();
            } else {
                window.location.replace("login.html");
            }
        }

        return;

    }

    try {

        // Disable button while request is processing
        const cartButtons = document.querySelectorAll(".cart-btn");

        cartButtons.forEach(btn => {

            if (btn.getAttribute("onclick") === `addToCart(${productId})`) {

                btn.disabled = true;

                btn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Adding...
                `;

            }

        });

        const response = await fetch(`${API}/cart/`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                product_id: productId,

                quantity: 1

            })

        });

        const result = await response.json();

        if (response.ok) {

            showToast(

                "Product added to cart successfully!",

                "success"

            );

        }

        else {

            if (response.status === 401) {

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
                        if (typeof redirectToLogin === "function") {
                            redirectToLogin();
                        } else {
                            window.location.replace("login.html");
                        }
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

    }

    catch (error) {

        console.error(error);

        showToast(

            "Network Error. Please try again.",

            "error"

        );

    }

    finally {

        // Restore button
        const cartButtons = document.querySelectorAll(".cart-btn");

        cartButtons.forEach(btn => {

            if (btn.getAttribute("onclick") === `addToCart(${productId})`) {

                btn.disabled = false;

                btn.innerHTML = `
                    <i class="fa-solid fa-cart-shopping"></i>
                    Add To Cart
                `;

            }

        });

    }

}

/* ==========================================
        TOAST MESSAGE
========================================== */

function showToast(message, type = "success") {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.className = `toast ${type}`;

    toast.innerHTML = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}
/* ==========================================
        USER INFORMATION
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
        CART COUNT
========================================== */

async function loadCartCount() {

    const token = localStorage.getItem("access_token");

    if (!token) return;

    const cartBadge = document.getElementById("cartCount");

    if (!cartBadge) return;

    try {

        const response = await fetch(`${API}/cart/`, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        if (!response.ok) return;

        const result = await response.json();

        let count = 0;

        if (Array.isArray(result)) {

            count = result.length;

        }

        else if (Array.isArray(result.data)) {

            count = result.data.length;

        }

        cartBadge.textContent = count;

    }

    catch (error) {

        console.error("Cart Count Error:", error);

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

    logoutBtn.addEventListener("click", logout);

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

    loadProducts();

});

/* ==========================================
        REFRESH CART COUNT AFTER ADD TO CART
========================================== */

// Replace this line inside addToCart()
// showToast("Product added to cart successfully!", "success");

// With these two lines:

// showToast("Product added to cart successfully!", "success");
// loadCartCount();

/* ==========================================
        END OF FILE
========================================== */
