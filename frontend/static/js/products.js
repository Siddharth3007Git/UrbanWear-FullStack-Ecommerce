const API_URL = "http://127.0.0.1:8000";

let currentPage = 1;
const limit = 9;

// on page load
window.onload = function () {

    // check login
    const token = localStorage.getItem("token");
    const authLink = document.getElementById("authLink");
    if (token) {
        authLink.textContent = "Sign Out";
        authLink.href = "#";
        authLink.onclick = function () {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            window.location.reload();
        };
    }

    // check if category passed from home page
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
        document.getElementById("categoryFilter").value = category;
    }

    loadProducts();
};

// load products from API
async function loadProducts() {

    const grid = document.getElementById("productGrid");
    grid.innerHTML = `<div class="loading">LOADING...</div>`;

    const category = document.getElementById("categoryFilter").value;
    const name = document.getElementById("searchInput").value.trim();
    const minPrice = document.getElementById("minPrice").value;
    const maxPrice = document.getElementById("maxPrice").value;

    let url = `${API_URL}/products?page=${currentPage}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (name) url += `&name=${name}`;
    if (minPrice) url += `&min_price=${minPrice}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // show total count
        document.getElementById("totalCount").textContent = `${data.total} products found`;

        grid.innerHTML = "";

        if (data.data.length === 0) {
            grid.innerHTML = `<div class="no-products">No products found.</div>`;
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        // render products
        data.data.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.onclick = () => {
                window.location.href = `product_details.html?id=${product.id}`;
            };

            card.innerHTML = `
                <img src="../static/images/${product.image}" alt="${product.name}" style="width:100%;height:240px;object-fit:cover;object-position:top;" onerror="this.style.background='#e8e8e8'">
                <div class="product-card-info">
                    <div class="product-card-name">${product.name}</div>
                    <div class="product-card-category">${product.category}</div>
                    <div class="product-card-price">₹${product.price}</div>
                </div>
            `;
            grid.appendChild(card);
        });

        // render pagination
        renderPagination(data.total);

    } catch (error) {
        grid.innerHTML = `<div class="no-products">Cannot connect to server.</div>`;
    }
}

// pagination buttons
function renderPagination(total) {
    const totalPages = Math.ceil(total / limit);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `page-btn ${i === currentPage ? "active" : ""}`;
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            loadProducts();
            window.scrollTo(0, 0);
        };
        pagination.appendChild(btn);
    }
}

// apply filters
function applyFilters() {
    currentPage = 1;
    loadProducts();
}

// clear filters
function clearFilters() {
    document.getElementById("categoryFilter").value = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    currentPage = 1;
    loadProducts();
}