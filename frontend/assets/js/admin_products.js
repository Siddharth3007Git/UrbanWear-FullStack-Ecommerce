// ==========================================
// UrbanWear Admin - Products
// ==========================================

// API Base URL
const API = window.API_BASE_URL || "http://127.0.0.1:8000";

// ==========================================
// DOM Elements
// ==========================================

const productsTable =
    document.getElementById("productsTable");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const categoryFilter =
    document.getElementById("categoryFilter");

const loader =
    document.getElementById("loader");

const emptyState =
    document.getElementById("emptyState");

const toast =
    document.getElementById("toast");

const logoutBtn =
    document.getElementById("logoutBtn");

const totalProducts =
    document.getElementById("totalProducts");

const totalCategories =
    document.getElementById("totalCategories");

const totalStock =
    document.getElementById("totalStock");

const outOfStock =
    document.getElementById("outOfStock");

const pageInfo =
    document.getElementById("pageInfo");

const prevPage =
    document.getElementById("prevPage");

const nextPage =
    document.getElementById("nextPage");

const addProductBtn =
    document.getElementById("addProductBtn");

// ==========================================
// Variables
// ==========================================

let products = [];

let filteredProducts = [];

let currentPage = 1;

const rowsPerPage = 10;

// ==========================================
// Loader
// ==========================================

function showLoader() {

    loader.style.display = "flex";

}

function hideLoader() {

    loader.style.display = "none";

}

// ==========================================
// Toast
// ==========================================

function showToast(message, success = true) {

    toast.innerText = message;

    toast.style.display = "block";

    toast.style.background =
        success ? "#16a34a" : "#dc2626";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}

// ==========================================
// Logout
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        window.location.replace("../login.html");

    });

}

// ==========================================
// Add Product
// ==========================================

if (addProductBtn) {

    addProductBtn.addEventListener("click", () => {

        window.location.href =
            "add_product.html";

    });

}

// ==========================================
// Fetch Products
// ==========================================

async function fetchProducts() {

    showLoader();

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/products`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error(
                "Unable to fetch products."
            );

        }

        products = await response.json();

        filteredProducts = [...products];

        updateStatistics();

        renderProducts();

    }

    catch (error) {

        console.error(error);

        showToast(error.message, false);

    }

    finally {

        hideLoader();

    }

}
// ==========================================
// Render Products
// ==========================================

function renderProducts() {

    productsTable.innerHTML = "";

    if (filteredProducts.length === 0) {

        emptyState.style.display = "block";

        pageInfo.textContent = "Page 0 of 0";

        return;

    }

    emptyState.style.display = "none";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pageProducts = filteredProducts.slice(start, end);

    pageProducts.forEach((product, index) => {

        const stockClass =
            product.stock > 10
                ? "in-stock"
                : product.stock > 0
                ? "low-stock"
                : "out-stock";

        const stockText =
            product.stock > 10
                ? "In Stock"
                : product.stock > 0
                ? "Low Stock"
                : "Out of Stock";

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${start + index + 1}</td>

            <td>

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    width="60"
                    height="60"
                    style="border-radius:8px;object-fit:cover;">

            </td>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>₹${product.price}</td>

            <td>${product.stock}</td>

            <td>

                <span class="${stockClass}">

                    ${stockText}

                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="editProduct(${product.id})">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct(${product.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        productsTable.appendChild(row);

    });

    updatePagination();

}

// ==========================================
// Pagination
// ==========================================

function updatePagination() {

    const totalPages = Math.ceil(

        filteredProducts.length / rowsPerPage

    );

    pageInfo.textContent =
        `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled = currentPage === 1;

    nextPage.disabled =
        currentPage === totalPages;

}

prevPage.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        renderProducts();

    }

});

nextPage.addEventListener("click", () => {

    const totalPages = Math.ceil(

        filteredProducts.length / rowsPerPage

    );

    if (currentPage < totalPages) {

        currentPage++;

        renderProducts();

    }

});
// ==========================================
// Search & Filter Products
// ==========================================

searchBtn.addEventListener("click", filterProducts);

searchInput.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {

        filterProducts();

    }

});

categoryFilter.addEventListener("change", filterProducts);

function filterProducts() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const category = categoryFilter.value;

    filteredProducts = products.filter(product => {

        const matchesKeyword =

            product.name.toLowerCase().includes(keyword) ||

            product.category.toLowerCase().includes(keyword);

        const matchesCategory =

            category === "" ||

            product.category === category;

        return matchesKeyword && matchesCategory;

    });

    currentPage = 1;

    renderProducts();

}

// ==========================================
// Statistics
// ==========================================

function updateStatistics() {

    totalProducts.textContent =
        products.length;

    totalCategories.textContent =
        new Set(
            products.map(product => product.category)
        ).size;

    totalStock.textContent =
        products.reduce(
            (sum, product) => sum + Number(product.stock),
            0
        );

    outOfStock.textContent =
        products.filter(product => product.stock === 0).length;

    loadCategories();

}

// ==========================================
// Load Categories
// ==========================================

function loadCategories() {

    categoryFilter.innerHTML = `
        <option value="">All Categories</option>
    `;

    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}

// ==========================================
// Edit Product
// ==========================================

function editProduct(productId) {

    localStorage.setItem(
        "selectedProduct",
        productId
    );

    window.location.href =
        "edit_product.html?id=" + productId;

}

// ==========================================
// Delete Product
// ==========================================

async function deleteProduct(productId) {

    const confirmDelete = confirm(

        "Are you sure you want to delete this product?"

    );

    if (!confirmDelete) return;

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/products/${productId}`,

            {

                method: "DELETE",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error(
                "Unable to delete product."
            );

        }

        showToast(
            "Product deleted successfully."
        );

        fetchProducts();

    }

    catch (error) {

        console.error(error);

        showToast(error.message, false);

    }

}

// ==========================================
// Initialize Page
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    fetchProducts();

});
