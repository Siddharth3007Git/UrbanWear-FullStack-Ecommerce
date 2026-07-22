/* ==========================================
        UrbanWear Cart Page
========================================== */

const API = API_BASE_URL;

// DOM Elements
const loader = document.getElementById("loader");
const cartSection = document.getElementById("cartSection");
const emptyCart = document.getElementById("emptyCart");

const cartItems = document.getElementById("cartItems");

const totalItems = document.getElementById("totalItems");
const totalPrice = document.getElementById("totalPrice");

const cartCount = document.getElementById("cartCount");

const checkoutBtn = document.getElementById("checkoutBtn");
const continueBtn = document.getElementById("continueBtn");
const logoutBtn = document.getElementById("logoutBtn");

let cart = [];

/* ==========================================
        PAGE LOAD
========================================== */


/* ==========================================
        CHECK LOGIN
========================================== */

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

/* ==========================================
        LOAD CART
========================================== */

/* ==========================================
        LOAD CART
========================================== */

async function loadCart() {

    loader.style.display = "flex";
    cartSection.style.display = "none";
    emptyCart.style.display = "none";

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API}/cart/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Unable to load cart.");
        }

        // Backend always returns:
        // {
        //    success: true,
        //    data: [...],
        //    total_items: ...,
        //    total_price: ...
        // }

        cart = Array.isArray(result.data) ? result.data : [];

        loader.style.display = "none";

        if (cart.length === 0) {
            emptyCart.style.display = "block";
            updateSummary();
            return;
        }

        cartSection.style.display = "block";

        renderCart();
        updateSummary();

    }

    catch (error) {

        console.error(error);

        loader.style.display = "none";

        emptyCart.style.display = "block";

        showToast(
            error.message,
            "error"
        );
    }
}
/* ==========================================
        RENDER CART ITEMS
========================================== */

function renderCart() {

    cartItems.innerHTML = "";

    cart.forEach(item => {

        const product = item.product;

        const image = product.image || "default-product.png";
        const name = product.name;
        const category = product.category;
        const price = Number(product.price);
        const stock = product.stock;

        const quantity = item.quantity;

        const subtotal = price * quantity;

        const card = document.createElement("div");

        card.className = "cart-item";

        card.innerHTML = `

        <div class="cart-item-image">
            <img
                src="../assets/images/${image}"
                alt="${name}"
                onerror="this.src='../assets/images/default-product.png'">
        </div>

        <div class="cart-item-details">

            <h3>${name}</h3>

            <p>${category}</p>

            <p>₹${price.toLocaleString("en-IN")}</p>

            <div class="quantity-wrapper">

                <button
                    class="quantity-btn"
                    onclick="decreaseQuantity(${item.cart_id})">
                    -
                </button>

                <input
                    class="quantity-input"
                    value="${quantity}"
                    readonly>

                <button
                    class="quantity-btn"
                    onclick="increaseQuantity(${item.cart_id}, ${stock})">
                    +
                </button>

            </div>

            <p>Total : ₹${subtotal.toLocaleString("en-IN")}</p>

            <button
                class="remove-btn"
                onclick="removeCartItem(${item.cart_id})">

                Remove

            </button>

        </div>

        `;

        cartItems.appendChild(card);

    });

}

/* ==========================================
        UPDATE SUMMARY
========================================== */

function updateSummary() {

    let items = 0;

    let total = 0;

    cart.forEach(item => {

        const product = item.product || item;

        const quantity = item.quantity || 1;

        const price = Number(product.price || 0);

        items += quantity;

        total += quantity * price;

    });

    totalItems.textContent = items;

    totalPrice.textContent =
        `₹${total.toLocaleString("en-IN")}`;

    if (cartCount) {

        cartCount.textContent = items;

    }

}
/* ==========================================
        INCREASE QUANTITY
========================================== */

async function increaseQuantity(cartId, stock) {

    const item = cart.find(item => item.cart_id === cartId);

    if (!item) return;

    if (item.quantity >= stock) {

        showToast(

            "Maximum stock reached.",

            "warning"

        );

        return;

    }

    await updateCartQuantity(

        cartId,

        item.quantity + 1

    );

}

/* ==========================================
        DECREASE QUANTITY
========================================== */

async function decreaseQuantity(cartId) {

    const item = cart.find(item => item.cart_id === cartId);

    if (!item) return;

    if (item.quantity <= 1) {

        return;

    }

    await updateCartQuantity(

        cartId,

        item.quantity - 1

    );

}

/* ==========================================
        UPDATE CART API
========================================== */

async function updateCartQuantity(cartId, quantity) {

    const token = localStorage.getItem("access_token");

    try {

        const response = await fetch(

            `${API}/cart/${cartId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${token}`

                },

                body: JSON.stringify({

                    quantity: quantity

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.detail ||

                "Unable to update cart."

            );

        }

        // Update local array

        const index = cart.findIndex(

            item => item.cart_id === cartId

        );

        if (index !== -1) {

            cart[index].quantity = quantity;

        }

        renderCart();

        updateSummary();

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

}

/* ==========================================
        REFRESH CART
========================================== */

function refreshCart() {

    loadCart();

}
/* ==========================================
        REMOVE CART ITEM
========================================== */

async function removeCartItem(cartId) {

    const confirmDelete = confirm(

        "Are you sure you want to remove this item?"

    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("access_token");

    try {

        const response = await fetch(

            `${API}/cart/${cartId}`,

            {

                method: "DELETE",

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.detail ||

                "Unable to remove item."

            );

        }

        showToast(

            "Item removed successfully.",

            "success"

        );

        cart = cart.filter(

            item => item.cart_id !== cartId

        );

        if (cart.length === 0) {

            cartSection.style.display = "none";

            emptyCart.style.display = "block";

        }

        renderCart();

        updateSummary();

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

}

/* ==========================================
        CLEAR CART
========================================== */

async function clearCart() {

    const confirmClear = confirm(

        "Are you sure you want to clear your cart?"

    );

    if (!confirmClear) return;

    const token = localStorage.getItem("access_token");

    try {

        const response = await fetch(

            `${API}/cart/clear`,

            {

                method: "DELETE",

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.detail ||

                "Unable to clear cart."

            );

        }

        cart = [];

        cartItems.innerHTML = "";

        cartSection.style.display = "none";

        emptyCart.style.display = "block";

        updateSummary();

        showToast(

            "Cart cleared successfully.",

            "success"

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

}

/* ==========================================
        CONTINUE SHOPPING
========================================== */

continueBtn.addEventListener("click", () => {

    window.location.href = "products.html";

});
/* ==========================================
        CHECKOUT
========================================== */

checkoutBtn.addEventListener("click", () => {

    if (!cart || cart.length === 0) {

        showToast(

            "Your cart is empty.",

            "warning"

        );

        return;

    }

    window.location.href = "checkout.html";

});

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
        LOAD USER INFORMATION
========================================== */

function loadUserInfo() {

    const user = JSON.parse(

        localStorage.getItem("user")

    );

    if (!user) return;

    const userName = document.getElementById("userName");

    const userEmail = document.getElementById("userEmail");

    if (userName) {

        userName.textContent =

            user.name || "User";

    }

    if (userEmail) {

        userEmail.textContent =

            user.email || "";

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
        REFRESH CART BADGE
========================================== */

function updateCartBadge() {

    let count = 0;

    cart.forEach(item => {

        count += item.quantity || 1;

    });

    if (cartCount) {

        cartCount.textContent = count;

    }

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
        REFRESH CART
========================================== */



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
        WINDOW FOCUS
========================================== */

window.addEventListener("focus", () => {

    loadCart();

});

/* ==========================================
        KEYBOARD SHORTCUT
========================================== */

// Ctrl + Shift + L → Logout

document.addEventListener("keydown", (event) => {

    if (

        event.ctrlKey &&

        event.shiftKey &&

        event.key === "L"

    ) {

        logout();

    }

});

/* ==========================================
        PAGE INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadUserInfo();

    loadCart();

});

/* ==========================================
        HANDLE UNAUTHORIZED
========================================== */

function handleUnauthorized() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    showToast(

        "Session expired. Please login again.",

        "error"

    );

    setTimeout(() => {

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            window.location.replace("login.html");
        }

    }, 1500);

}

/* ==========================================
        GLOBAL FETCH ERROR HANDLER
========================================== */

function checkResponse(response) {

    if (response.status === 401) {

        handleUnauthorized();

        return false;

    }

    return true;

}

/* ==========================================
        BEFORE UNLOAD
========================================== */

window.addEventListener("beforeunload", () => {

    console.log("Leaving Cart Page...");

});

/* ==========================================
        END OF FILE
========================================== */

console.log("UrbanWear Cart Page Loaded Successfully");
