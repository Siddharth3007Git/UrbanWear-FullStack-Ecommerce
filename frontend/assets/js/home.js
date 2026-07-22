/* ==========================================
   UrbanWear - Home Page
========================================== */

const featuredProducts = document.getElementById("featuredProducts");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filterSelect = document.getElementById("filterSelect");
const siteSearch = document.getElementById("siteSearch");
const searchSuggestions = document.getElementById("searchSuggestions");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const toast = document.getElementById("toast");
const newsletterForm = document.getElementById("newsletterForm");
const API = typeof API_URL !== "undefined" ? API_URL : "";
const PRODUCT_LIMIT = 12;
let allProducts = [];
let debounceTimer = null;

/* ==========================================
        PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    initializeHomeExperience();
    loadProducts();
});

/* ==========================================
        INITIALIZE UX
========================================== */

function initializeHomeExperience() {
    bindNavigation();
    bindSearch();
    bindScrollTop();
    bindNewsletter();
}

function bindNavigation() {
    if (navToggle && navPanel) {
        navToggle.addEventListener("click", () => {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!expanded));
            navPanel.classList.toggle("open");
        });
    }

    document.querySelectorAll(".profile-trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const expanded = trigger.getAttribute("aria-expanded") === "true";
            trigger.setAttribute("aria-expanded", String(!expanded));
        });
    });
}

function bindSearch() {
    const runSearch = (query = "") => {
        const normalized = query.trim().toLowerCase();
        const filtered = allProducts.filter((product) => {
            const name = (product?.name || "").toLowerCase();
            const category = (product?.category || "").toLowerCase();
            return name.includes(normalized) || category.includes(normalized);
        });
        renderProducts(filtered);
    };

    [searchInput, siteSearch].forEach((input) => {
        if (!input) return;

        input.addEventListener("input", (event) => {
            const value = event.target.value;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                runSearch(value);
                renderSuggestions(value);
            }, 220);
        });
    });

    [searchInput, siteSearch].forEach((input) => {
        if (!input) return;
        input.addEventListener("focus", () => renderSuggestions(input.value));
        input.addEventListener("blur", () => setTimeout(() => {
            if (searchSuggestions) searchSuggestions.classList.remove("show");
        }, 160));
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => renderProducts(getFilteredProducts()));
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", () => renderProducts(getFilteredProducts()));
    }
}

function getFilteredProducts() {
    const query = (searchInput?.value || siteSearch?.value || "").trim().toLowerCase();
    const sortValue = sortSelect?.value || "featured";
    const filterValue = filterSelect?.value || "all";

    let filtered = [...allProducts];

    if (query) {
        filtered = filtered.filter((product) => {
            const name = (product?.name || "").toLowerCase();
            const category = (product?.category || "").toLowerCase();
            return name.includes(query) || category.includes(query);
        });
    }

    if (filterValue !== "all") {
        filtered = filtered.filter((product) => (product?.category || "").includes(filterValue));
    }

    if (sortValue === "price-low") {
        filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    } else if (sortValue === "price-high") {
        filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    } else if (sortValue === "rating") {
        filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
    }

    return filtered;
}

function renderSuggestions(query) {
    if (!searchSuggestions) return;

    if (!query || !allProducts.length) {
        searchSuggestions.classList.remove("show");
        searchSuggestions.innerHTML = "";
        return;
    }

    const matches = allProducts
        .filter((product) => (product?.name || "").toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

    if (!matches.length) {
        searchSuggestions.classList.remove("show");
        searchSuggestions.innerHTML = "";
        return;
    }

    searchSuggestions.innerHTML = "";
    matches.forEach((product) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = product?.name || "Product";
        btn.addEventListener("click", () => {
            if (searchInput) searchInput.value = product?.name || "";
            if (siteSearch) siteSearch.value = product?.name || "";
            renderProducts(getFilteredProducts());
            searchSuggestions.classList.remove("show");
        });
        searchSuggestions.appendChild(btn);
    });

    searchSuggestions.classList.add("show");
}

function bindScrollTop() {
    window.addEventListener("scroll", () => {
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle("show", window.scrollY > 420);
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

function bindNewsletter() {
    if (!newsletterForm) return;
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = newsletterForm.querySelector("input")?.value || "";
        if (!email) {
            showToast("Please enter a valid email.", "error");
            return;
        }
        showToast("Thanks for subscribing!", "success");
        newsletterForm.reset();
    });
}

/* ==========================================
        CHECK LOGIN
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
        LOAD PRODUCTS
========================================== */

async function loadProducts() {
    if (!featuredProducts) return;

    featuredProducts.innerHTML = "";
    const skeletonCount = 8;
    featuredProducts.innerHTML = Array.from({ length: skeletonCount }, () => `
        <div class="skeleton-card">
            <div class="skeleton-shine" style="height: 240px"></div>
        </div>
    `).join("");

    try {
        const result = await fetchJson(`${API}/products/?page=1&limit=${PRODUCT_LIMIT}`);
        allProducts = Array.isArray(result?.data) ? result?.data : [];
        renderProducts(getFilteredProducts());
    } catch (error) {
        featuredProducts.innerHTML = `<div class="section-title"><h3>${error.message}</h3></div>`;
        showToast(error.message, "error");
        console.error(error);
    }
}

/* ==========================================
        RENDER PRODUCTS
========================================== */

function renderProducts(products) {
    if (!featuredProducts) return;

    featuredProducts.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
        featuredProducts.innerHTML = "<div class=\"section-title\"><h3>No products available.</h3></div>";
        return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
        fragment.appendChild(createProductCard(product));
    });

    featuredProducts.appendChild(fragment);
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = product?.discount ? `${product.discount}% OFF` : "New";

    const image = document.createElement("img");
    image.src = getProductImagePath(product?.image);
    image.alt = product?.name || "Product image";
    image.className = "product-image";
    image.loading = "lazy";
    image.onerror = function () {
        this.src = "../assets/images/default-product.png";
    };

    const info = document.createElement("div");
    info.className = "product-info";

    const meta = document.createElement("div");
    meta.className = "product-meta";
    meta.innerHTML = `<span>${product?.brand || "UrbanWear"}</span><span>${product?.rating || 4.8} ★</span>`;

    const title = document.createElement("h3");
    title.textContent = product?.name || "Product";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product?.category || "Unknown Category";

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `₹${product?.price ?? 0}`;

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const viewButton = document.createElement("button");
    viewButton.className = "btn-secondary";
    viewButton.type = "button";
    viewButton.textContent = "Quick View";
    viewButton.addEventListener("click", () => viewProduct(product?.id));

    const addButton = document.createElement("button");
    addButton.className = "btn-primary";
    addButton.type = "button";
    addButton.textContent = "Add to Cart";
    addButton.addEventListener("click", () => addToCart(product?.id));

    actions.appendChild(viewButton);
    actions.appendChild(addButton);

    info.appendChild(meta);
    info.appendChild(title);
    info.appendChild(category);
    info.appendChild(price);
    info.appendChild(actions);

    card.appendChild(badge);
    card.appendChild(image);
    card.appendChild(info);

    return card;
}

function getProductImagePath(imageName) {
    if (!imageName) {
        return "../assets/images/default-product.png";
    }

    return `../assets/images/${imageName}`;
}

/* ==========================================
        VIEW PRODUCT
========================================== */

function viewProduct(id) {
    window.location.href = `product_details.html?id=${id}`;
}

/* ==========================================
        ADD TO CART
========================================== */

async function addToCart(productId) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        showToast("Please login first.", "error");
        return;
    }

    try {
        await fetchJson(`${API}/cart/`, {
            method: "POST",
            headers: getAuthHeaders(token),
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        showToast("Product added successfully.", "success");
    } catch (error) {
        showToast(error.message, "error");
    }
}

function getAuthHeaders(token) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Unable to process request.");
    }

    return data;
}

function showToast(message, type = "success") {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
        toast.className = "toast";
    }, 2400);
}

/* ==========================================
        LOGOUT
========================================== */

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            if (typeof redirectToLogin === "function") {
                redirectToLogin();
            } else {
                window.location.replace("login.html");
            }
        }
    });
}
