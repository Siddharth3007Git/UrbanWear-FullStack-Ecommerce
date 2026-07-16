const API_URL = "http://127.0.0.1:8000";
let cartData = [];
let productsData = [];

window.onload = function () {

    // check login
    const token = localStorage.getItem("token");
    const authLink = document.getElementById("authLink");

    if (!token) {
        window.location.href = "/login-page";
        return;
    }

    authLink.textContent = "Sign Out";
    authLink.href = "#";
    authLink.onclick = function () {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.href = "/login-page";
    };

    loadCart();
};

async function loadCart() {

    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split('.')[1]));
    const customerId = payload.id;

    try {
        // get cart items
        const cartRes = await fetch(`${API_URL}/cart/${customerId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        cartData = await cartRes.json();

        // get all products for details
        const prodRes = await fetch(`${API_URL}/products?page=1&limit=100`);
        const prodData = await prodRes.json();
        productsData = prodData.data;

        document.getElementById("loadingMsg").style.display = "none";

        if (cartData.length === 0) {
            document.getElementById("emptyCart").style.display = "block";
            return;
        }

        document.getElementById("cartCount").textContent = `${cartData.length} item(s) in your cart`;
        document.getElementById("orderSummary").style.display = "block";

        renderCart();

    } catch (error) {
        document.getElementById("loadingMsg").textContent = "Cannot connect to server.";
    }
}

function renderCart() {

    const cartItems = document.getElementById("cartItems");
    cartItems.innerHTML = "";
    let subtotal = 0;

    cartData.forEach(item => {

        // find product details
        const product = productsData.find(p => p.id === item.product_id);
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="../static/images/${product.image}" alt="${product.name}" style="width:100px;height:120px;object-fit:cover;">
            <div class="cart-item-details">
                <div class="cart-item-name">${product.name}</div>
                <div class="cart-item-category">${product.category}</div>
                <div class="cart-item-price">₹${product.price}</div>
                <div class="quantity-box">
                    <button onclick="updateQty(${item.cart_id}, ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQty(${item.cart_id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-remove" onclick="removeItem(${item.cart_id})">Remove</button>
            </div>
        `;
        cartItems.appendChild(div);
    });

    document.getElementById("subtotal").textContent = `₹${subtotal}`;
    document.getElementById("totalAmount").textContent = `₹${subtotal}`;
}

async function updateQty(cartId, newQty) {

    if (newQty < 1) return;

    const token = localStorage.getItem("token");

    try {
        await fetch(`${API_URL}/cart/${cartId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQty })
        });

        // update local data and re-render
        const item = cartData.find(i => i.cart_id === cartId);
        if (item) item.quantity = newQty;
        renderCart();

    } catch (error) {
        console.error("Error updating quantity");
    }
}

async function removeItem(cartId) {

    const token = localStorage.getItem("token");

    try {
        await fetch(`${API_URL}/cart/${cartId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // remove from local data and re-render
        cartData = cartData.filter(i => i.cart_id !== cartId);

        if (cartData.length === 0) {
            document.getElementById("cartItems").innerHTML = "";
            document.getElementById("orderSummary").style.display = "none";
            document.getElementById("emptyCart").style.display = "block";
            document.getElementById("cartCount").textContent = "";
            return;
        }

        renderCart();

    } catch (error) {
        console.error("Error removing item");
    }
}