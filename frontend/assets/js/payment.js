// ===============================
// UrbanWear Payment
// ===============================

const API_BASE = "http://127.0.0.1:8000"; // Change if your backend URL is different

// Get order_id from URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order_id");

if (!orderId) {
    alert("Order ID not found.");
    window.location.href = "checkout.html";
}

// Demo values (replace later with actual order details from backend)
 

// Populate page
document.getElementById("productName").innerText = orderData.product;
document.getElementById("quantity").innerText = orderData.quantity;
document.getElementById("productPrice").innerText = "₹" + orderData.subtotal;
document.getElementById("subtotal").innerText = "₹" + orderData.subtotal;
document.getElementById("shipping").innerText = "₹" + orderData.shipping;
document.getElementById("gst").innerText = "₹" + orderData.gst;
document.getElementById("totalAmount").innerText = "₹" + orderData.total;

// ===============================
// Pay Button
// ===============================

document.getElementById("payBtn").addEventListener("click", createOrder);

// ===============================
// Create Razorpay Order
// ===============================

async function createOrder() {

    try {

        const response = await fetch(`${API_BASE}/payment/create-order`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                order_id: Number(orderId)
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to create order.");
        }

        openRazorpay(data);

    } catch (error) {

        alert(error.message);

    }

}

// ===============================
// Razorpay Checkout
// ===============================

function openRazorpay(data) {

    const options = {

        key: data.key,

        amount: data.amount * 100,

        currency: data.currency,

        name: "UrbanWear",

        description: "Secure Payment",

        order_id: data.razorpay_order_id,

        handler: async function (response) {

            verifyPayment(response);

        },

        theme: {

            color: "#198754"

        }

    };

    const razorpay = new Razorpay(options);

    razorpay.open();

}

// ===============================
// Verify Payment
// ===============================

async function verifyPayment(payment) {

    try {

        const response = await fetch(`${API_BASE}/payment/verify`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                order_id: Number(orderId),

                razorpay_order_id: payment.razorpay_order_id,

                razorpay_payment_id: payment.razorpay_payment_id,

                razorpay_signature: payment.razorpay_signature

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Payment verification failed.");
        }

        window.location.href =
            `payment_success.html?order_id=${orderId}&payment_id=${payment.razorpay_payment_id}`;

    }

    catch (error) {

        window.location.href = "payment_failed.html";

    }

}