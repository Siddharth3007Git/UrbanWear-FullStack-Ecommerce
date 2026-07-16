const API_URL = "http://127.0.0.1:8000";

// check if user is logged in
window.onload = function () {
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

    loadFeaturedProducts();
};

// load first 4 products from API
async function loadFeaturedProducts() {
    try {
        const response = await fetch(`${API_URL}/products?page=1&limit=4`);
        const data = await response.json();

        const grid = document.getElementById("featuredProducts");

        if (data.data.length === 0) {
            grid.innerHTML = "<p style='color:#aaa;font-size:13px;'>No products found.</p>";
            return;
        }

        data.data.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.onclick = () => {
                window.location.href = `product_details.html?id=${product.id}`;
            };

            card.innerHTML = `
                <img src="../static/images/${product.image}" alt="${product.name}" style="width:100%;height:220px;object-fit:cover;background:#f5f5f5;" onerror="this.style.background='#e8e8e8'">
                <div class="product-card-info">
                    <div class="product-card-name">${product.name}</div>
                    <div class="product-card-category">${product.category}</div>
                    <div class="product-card-price">₹${product.price}</div>
                </div>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading products:", error);
    }
}