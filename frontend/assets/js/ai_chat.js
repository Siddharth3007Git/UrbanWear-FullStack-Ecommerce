/* ==========================================
   UrbanWear AI Shopping Assistant
   ai_chat.js
========================================== */

/* ==========================================
   API CONFIGURATION
========================================== */

const API = window.API_BASE_URL || "http://127.0.0.1:8000";

const CHAT_API = `${API}/chat`;
const CART_API = `${API}/cart/`;
const DEFAULT_PRODUCT_IMAGE = "../assets/images/default-product.png";

const token = localStorage.getItem("access_token");

/* ==========================================
   DOM ELEMENTS
========================================== */

const loader = document.getElementById("loader");

const chatMessages = document.getElementById("chatMessages");

const messageInput = document.getElementById("messageInput");

const sendButton = document.getElementById("sendBtn");

const typingIndicator = document.getElementById("typingIndicator");

const clearChatButton = document.getElementById("clearChat");

const suggestionButtons =
    document.querySelectorAll(".suggestion-btn");

const toast = document.getElementById("toast");

const toastText = document.getElementById("toastText");

const cartCount = document.getElementById("cartCount");

const logoutButton = document.getElementById("logoutBtn");

/* ==========================================
   GLOBAL VARIABLES
========================================== */

let chatHistory = [];

let isTyping = false;

/* ==========================================
   PAGE LOADER
========================================== */

window.addEventListener("load", () => {

    setTimeout(() => {

        if (loader) {

            loader.style.display = "none";

        }

    }, 700);

});

/* ==========================================
   TOKEN VALIDATION
========================================== */

function checkLogin() {

    if (!token) {

        if (typeof redirectToLogin === "function") {
            redirectToLogin();
        } else {
            window.location.replace("login.html");
        }

    }

}

/* ==========================================
   AUTO RESIZE TEXTAREA
========================================== */

function autoResizeTextarea() {

    messageInput.style.height = "auto";

    messageInput.style.height =
        messageInput.scrollHeight + "px";

}

/* ==========================================
   RESET TEXTAREA
========================================== */

function resetTextarea() {

    messageInput.value = "";

    messageInput.style.height = "60px";

}

/* ==========================================
   SHOW / HIDE TYPING
========================================== */

function showTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.remove("hidden");

    typingIndicator.style.display = "flex";

    isTyping = true;

}

function hideTyping() {

    if (!typingIndicator) return;

    typingIndicator.classList.add("hidden");

    typingIndicator.style.display = "none";

    isTyping = false;

}

/* ==========================================
   SCROLL CHAT
========================================== */

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

/* ==========================================
   LOAD CHAT HISTORY
========================================== */

function loadChatHistory() {

    const stored =
        localStorage.getItem("urbanwear_chat");

    if (!stored) return;

    try {

        chatHistory = JSON.parse(stored);

    }

    catch (error) {

        chatHistory = [];

    }

}

/* ==========================================
   SAVE CHAT HISTORY
========================================== */

function saveChatHistory() {

    localStorage.setItem(

        "urbanwear_chat",

        JSON.stringify(chatHistory)

    );

}

/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadChatHistory();

    autoResizeTextarea();

    hideTyping();

});
/* ==========================================
   CREATE TIMESTAMP
========================================== */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}

/* ==========================================
   CREATE MESSAGE HTML
========================================== */

function createMessage(type, message, time = getCurrentTime()) {

    const wrapper = document.createElement("div");

    wrapper.className = `message ${type}-message`;

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.innerHTML =

        type === "user"

            ? '<i class="fa-solid fa-user"></i>'

            : '<i class="fa-solid fa-robot"></i>';

    const content = document.createElement("div");

    content.className = "message-content";

    content.innerHTML = `

        <div class="message-text">

            ${message}

        </div>

        <span class="message-time">

            ${time}

        </span>

    `;

    wrapper.appendChild(avatar);

    wrapper.appendChild(content);

    chatMessages.appendChild(wrapper);

    scrollToBottom();

}

/* ==========================================
   USER MESSAGE
========================================== */

function addUserMessage(message) {

    createMessage("user", message);

    chatHistory.push({

        role: "user",

        message: message,

        time: getCurrentTime()

    });

    saveChatHistory();

}

/* ==========================================
   AI MESSAGE
========================================== */

function addAIMessage(message, products = []) {

    createMessage("ai", message);

    chatHistory.push({

        role: "assistant",

        message: message,
        products: products || [],
        time: getCurrentTime()

    });

    saveChatHistory();

}

/* ==========================================
   RENDER CHAT HISTORY
========================================== */

function renderChatHistory() {

    if (chatHistory.length === 0) {

        return;

    }

    chatMessages.innerHTML = "";

    chatHistory.forEach(chat => {

        if (chat.role === "user") {

            createMessage(

                "user",

                chat.message,

                chat.time

            );

        }

        else {

            createMessage(

                "ai",

                chat.message,

                chat.time

            );

        }

    });

}

/* ==========================================
   CLEAR CHAT HISTORY
========================================== */

function clearChatHistory() {

    chatHistory = [];

    localStorage.removeItem("urbanwear_chat");

    chatMessages.innerHTML = "";

    addAIMessage(

        "👋 Hello! I'm your AI Shopping Assistant. How can I help you today?"

    );

}

/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.innerText = text;

    return div.innerHTML;

}

/* ==========================================
   FORMAT AI RESPONSE
========================================== */

function formatAIResponse(text) {

    let formatted = escapeHTML(text);

    formatted = formatted.replace(/\n/g, "<br>");

    formatted = formatted.replace(

        /\*\*(.*?)\*\*/g,

        "<strong>$1</strong>"

    );

    formatted = formatted.replace(

        /`(.*?)`/g,

        "<code>$1</code>"

    );

    return formatted;

}

/* ==========================================
   SHOW WELCOME MESSAGE
========================================== */

if (chatHistory.length === 0) {

    addAIMessage(

        "👋 Welcome to <strong>UrbanWear AI Shopping Assistant</strong>! Ask me about products, recommendations, sizes, fashion tips, or anything related to your shopping."

    );

}
/* ==========================================
   SEND MESSAGE TO AI
========================================== */

async function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "" || isTyping) {

        return;

    }

    addUserMessage(message);

    resetTextarea();

    showTyping();

    sendButton.disabled = true;

    try {

        const response = await fetch(CHAT_API, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                message: message

            })

        });

        hideTyping();

        if (!response.ok) {

            throw new Error("Failed to get AI response.");

        }

        const data = await response.json();

        let aiReply = "";

        /* ------------------------------
           SUPPORT MULTIPLE RESPONSE TYPES
        ------------------------------ */

        if (typeof data === "string") {

            aiReply = data;

        }

        else if (data.reply) {

            aiReply = data.reply;

        }

        else if (data.response) {

            aiReply = data.response;

        }

        else if (data.message) {

            aiReply = data.message;

        }

        else {

            aiReply = JSON.stringify(data, null, 2);

        }

        addAIMessage(formatAIResponse(aiReply));

    if (Array.isArray(data.products) && data.products.length > 0) {

        renderProducts(data.products);

}

    }

    catch (error) {

        hideTyping();

        console.error(error);

        addAIMessage(

            "❌ Sorry, something went wrong while contacting the AI assistant."

        );

        showToast(

            "Unable to contact AI assistant.",

            "error"

        );

    }

    finally {

        sendButton.disabled = false;

        messageInput.focus();

    }

}

/* ==========================================
   SEND BUTTON CLICK
========================================== */

sendButton.addEventListener(

    "click",

    sendMessage

);

/* ==========================================
   INPUT AUTO RESIZE
========================================== */

messageInput.addEventListener(

    "input",

    autoResizeTextarea

);

/* ==========================================
   SHOW NETWORK STATUS
========================================== */

window.addEventListener(

    "offline",

    () => {

        showToast(

            "You are currently offline.",

            "warning"

        );

    }

);

window.addEventListener(

    "online",

    () => {

        showToast(

            "Connection restored.",

            "success"

        );

    }

);

/* ==========================================
   PREVENT EMPTY SUBMISSION
========================================== */

messageInput.addEventListener(

    "blur",

    () => {

        messageInput.value =

            messageInput.value.trim();

    }

);

/* ==========================================
   AUTO SCROLL AFTER RESPONSE
========================================== */

const observer = new MutationObserver(() => {

    scrollToBottom();

});

observer.observe(chatMessages, {

    childList: true,

    subtree: true

});
/* ==========================================
   SUGGESTED PROMPTS
========================================== */

suggestionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const prompt = button.textContent.trim();

        messageInput.value = prompt;

        autoResizeTextarea();

        messageInput.focus();

    });

});

/* ==========================================
   ENTER TO SEND
========================================== */

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();

    }

});

/* ==========================================
   CLEAR CHAT BUTTON
========================================== */

clearChatButton.addEventListener("click", () => {

    const confirmClear = confirm(

        "Are you sure you want to clear the chat history?"

    );

    if (!confirmClear) {

        return;

    }

    clearChatHistory();

    showToast(

        "Chat history cleared successfully.",

        "success"

    );

});

/* ==========================================
   RESTORE CHAT HISTORY
========================================== */

function restoreChat() {

    if (chatHistory.length === 0) {

        return;

    }

    renderChatHistory();

    scrollToBottom();

}

/* ==========================================
   SAVE CHAT AFTER EVERY CHANGE
========================================== */

function updateChatStorage() {

    saveChatHistory();

    scrollToBottom();

}

/* ==========================================
   COPY MESSAGE
========================================== */

chatMessages.addEventListener("dblclick", async (event) => {

    const bubble = event.target.closest(".message-content");

    if (!bubble) {

        return;

    }

    const text = bubble.querySelector(".message-text");

    if (!text) {

        return;

    }

    try {

        await navigator.clipboard.writeText(

            text.innerText

        );

        showToast(

            "Message copied to clipboard.",

            "success"

        );

    }

    catch (error) {

        showToast(

            "Unable to copy message.",

            "error"

        );

    }

});

/* ==========================================
   SCROLL TO LATEST MESSAGE
========================================== */

function scrollLatest() {

    requestAnimationFrame(() => {

        scrollToBottom();

    });

}

/* ==========================================
   WINDOW FOCUS
========================================== */

window.addEventListener("focus", () => {

    scrollLatest();

});

/* ==========================================
   PAGE VISIBILITY
========================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (!document.hidden) {

            scrollLatest();

        }

    }

);

/* ==========================================
   BEFORE UNLOAD
========================================== */

window.addEventListener(

    "beforeunload",

    () => {

        saveChatHistory();

    }

);

/* ==========================================
   INITIAL CHAT RESTORE
========================================== */

restoreChat();
/* ==========================================
   TOAST NOTIFICATION
========================================== */

function showToast(message, type = "info") {

    if (!toast || !toastText) return;

    toast.className = "toast";

    toast.classList.add(type);

    toast.classList.add("show");

    toastText.textContent = message;

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
   LOAD CART COUNT
========================================== */

async function loadCartCount() {

    if (!token || !cartCount) return;

    try {

        const response = await fetch(CART_API, {

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        if (!response.ok) {

            return;

        }

        const data = await response.json();

        let count = 0;

        if (Array.isArray(data)) {

            count = data.length;

        }

        else if (Array.isArray(data.items)) {

            count = data.items.length;

        }

        else if (typeof data.total_items === "number") {

            count = data.total_items;

        }

        cartCount.textContent = count;

    }

    catch (error) {

        console.error("Cart Count Error:", error);

    }

}

/* ==========================================
   LOGOUT
========================================== */

function logout() {

    localStorage.removeItem("access_token");

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("urbanwear_chat");

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

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        logout

    );

}

/* ==========================================
   PAGE SHORTCUTS
========================================== */

function initializeKeyboardShortcuts() {

    document.addEventListener("keydown", (event) => {

        if (event.ctrlKey && event.key === "/") {

            event.preventDefault();

            messageInput.focus();

        }

    });

}

/* ==========================================
   INITIAL PAGE SETUP
========================================== */

async function initializePage() {

    checkLogin();

    hideTyping();

    renderChatHistory();

    await loadCartCount();

    autoResizeTextarea();

    scrollToBottom();

}

/* ==========================================
   START APPLICATION
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await initializePage();

        initializeKeyboardShortcuts();

        console.log(

            "UrbanWear AI Shopping Assistant Loaded"

        );

    }

);

/* ==========================================
   EXPORT (OPTIONAL)
========================================== */

window.UrbanWearAI = {

    sendMessage,

    addAIMessage,

    addUserMessage,

    clearChatHistory,

    showToast,

    loadCartCount

};

function renderProducts(products) {

    if (!products || products.length === 0) return;

    const container = document.createElement("div");
    container.className = "ai-product-container";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "ai-product-card";
        const imageSrc = getProductImageUrl(product);

        card.innerHTML = `
            <img
                src="${imageSrc}"
                class="ai-product-image"
                alt="${escapeHtml(product.name || "Product image")}"
                onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}'"
            >

            <div class="ai-product-info">

                <h3>${product.name}</h3>

                <p class="price">
                    ₹${product.price}
                </p>

                <p>${product.category}</p>

                <button
                    onclick="window.location.href='product_details.html?id=${product.id}'"
                    class="btn-view">

                    View Product

                </button>

            </div>
        `;

        container.appendChild(card);

    });

    chatMessages.appendChild(container);

    scrollToBottom();
}

function getProductImageUrl(product) {
    const imageValue = product?.image_url || product?.image || "";

    if (!imageValue) {
        return DEFAULT_PRODUCT_IMAGE;
    }

    if (/^https?:\/\//i.test(imageValue)) {
        return imageValue;
    }

    if (imageValue.startsWith("/")) {
        return `${API}${imageValue}`;
    }

    if (imageValue.startsWith("../") || imageValue.startsWith("./")) {
        return imageValue;
    }

    if (imageValue.startsWith("assets/")) {
        return `../${imageValue}`;
    }

    return `../assets/images/${imageValue}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function addProductToCart(productId){

    try{

        const response = await fetch(CART_API,{

            method:"POST",

            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },

            body:JSON.stringify({
                product_id:productId,
                quantity:1
            })

        });

        if(response.ok){

            showToast("Added to cart","success");

            loadCartCount();

        }

        else{

            showToast("Unable to add to cart","error");

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================
   END OF FILE
========================================== */
