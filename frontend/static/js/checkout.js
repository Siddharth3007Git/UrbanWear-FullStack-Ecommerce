const API_URL = "http://127.0.0.1:8000";
let cartData = [];
let productsData = [];
let customerId = null;

window.onload = function () {

    const token = localStorage.getItem("token");

    // redirect to login if not logged in
    if (!token) {
        window.location.href = "/login-page";
        return;
    }

    // set sign out
    const authLink = document.getElementById("authLink");
    authLink.textContent = "Sign Out";
    authLink.href = "#";
    authLink.onclick = function () {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.href = "/login-page";
    };

    // get customer id from token
    const payload = JSON.parse(atob(token.split('.')[1]));
    customerId = payload.id;

    loadCheckout();
};

async function loadCheckout() {

    const token = localStorage.getItem("token");

    try {
        // get cart items
        const cartRes = await fetch(`${API_URL}/cart/${customerId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        cartData = await cartRes.json();

        // if cart empty go back to cart
        if (cartData.length === 0) {
            window.location.href = "cart.html";
            return;
        }

        // get products
        const prodRes = await fetch(`${API_URL}/products?page=1&limit=100`);
        const prodData = await prodRes.json();
        productsData = prodData.data;

        renderOrderItems();

    } catch (error) {
        console.error("Error loading checkout:", error);
    }
}

function renderOrderItems() {

    const orderItems = document.getElementById("orderItems");
    orderItems.innerHTML = "";
    let subtotal = 0;

    cartData.forEach(item => {

        const product = productsData.find(p => p.id === item.product_id);
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement("div");
        div.className = "order-item";
        div.innerHTML = `
            <div class="order-item-left">
                <img src="../static/images/${product.image}" alt="${product.name}" style="width:100px;height:120px;object-fit:cover;">
                <div>
                    <div class="order-item-name">${product.name}</div>
                    <div class="order-item-category">${product.category}</div>
                    <div class="order-item-qty">Qty: ${item.quantity}</div>
                </div>
            </div>
            <div class="order-item-price">₹${itemTotal}</div>
        `;
        orderItems.appendChild(div);
    });

    document.getElementById("subtotal").textContent = `₹${subtotal}`;
    document.getElementById("totalAmount").textContent = `₹${subtotal}`;
}

async function placeOrder() {

    const token = localStorage.getItem("token");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "PLACING ORDER...";

    try {
        // place one order for each cart item
        for (const item of cartData) {
            await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    status: "pending"
                })
            });

            // remove item from cart after order placed
            await fetch(`${API_URL}/cart/${item.cart_id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
        }

        successMsg.textContent = `Order placed successfully! Payment: ${paymentMethod}. Thank you for shopping with WearVerse!`;
        successMsg.style.display = "block";

        placeOrderBtn.style.display = "none";

        // redirect to home after 3 seconds
        setTimeout(() => {
            window.location.href = "home.html";
        }, 3000);

    } catch (error) {
        errorMsg.textContent = "Something went wrong. Please try again.";
        errorMsg.style.display = "block";

        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "PLACE ORDER";
    }
}