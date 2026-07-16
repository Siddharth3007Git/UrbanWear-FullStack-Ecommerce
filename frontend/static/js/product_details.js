const API_URL = "http://127.0.0.1:8000";
let quantity = 1;
let productData = null;

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

    // get product id from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        window.location.href = "/products-page";
        return;
    }

    loadProduct(productId);
};

async function loadProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products?page=1&limit=100`);
        const data = await response.json();

        // find product by id
        productData = data.data.find(p => p.id == productId);

        if (!productData) {
            window.location.href = "/products-page";
            return;
        }

        // show product
        document.getElementById("productCategory").textContent = productData.category;
        document.getElementById("productName").textContent = productData.name;
        document.getElementById("productPrice").textContent = `₹${productData.price}`;
        document.getElementById("productStock").textContent = `${productData.stock} items in stock`;

        // show image
        document.querySelector(".image-placeholder").outerHTML = `<img src="../static/images/${productData.image}" alt="${productData.name}" style="width:100%;height:500px;object-fit:cover;object-position:top;" onerror="this.style.background='#e8e8e8'">`;

        // hide loading, show product
        document.getElementById("loadingMsg").style.display = "none";
        document.getElementById("productWrapper").style.display = "flex";

    } catch (error) {
        document.getElementById("loadingMsg").textContent = "Cannot connect to server.";
    }
}

function increaseQty() {
    if (productData && quantity < productData.stock) {
        quantity++;
        document.getElementById("qtyValue").textContent = quantity;
    }
}

function decreaseQty() {
    if (quantity > 1) {
        quantity--;
        document.getElementById("qtyValue").textContent = quantity;
    }
}

async function addToCart() {

    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    const addCartBtn = document.getElementById("addCartBtn");

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    // check login
    if (!token) {
        errorMsg.textContent = "Please sign in to add items to cart.";
        errorMsg.style.display = "block";
        setTimeout(() => {
            window.location.href = "/login-page";
        }, 2000);
        return;
    }

    addCartBtn.disabled = true;
    addCartBtn.textContent = "ADDING...";

    try {
        // get customer id from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const customerId = payload.id;

        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                customer_id: customerId,
                product_id: productData.id,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            successMsg.textContent = "Item added to cart successfully!";
            successMsg.style.display = "block";
        } else {
            errorMsg.textContent = data.detail || "Failed to add to cart.";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        errorMsg.textContent = "Cannot connect to server.";
        errorMsg.style.display = "block";
    }

    addCartBtn.disabled = false;
    addCartBtn.textContent = "ADD TO CART";
}