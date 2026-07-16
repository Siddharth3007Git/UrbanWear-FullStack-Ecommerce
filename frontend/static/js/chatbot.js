const CHAT_API_URL = "http://127.0.0.1:8000";
let currentMode = "query";

// toggle chat window open/close
function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.classList.toggle("open");
}

// set mode - query, policy, agent
function setMode(mode) {
    currentMode = mode;

    // update active button
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    document.getElementById("btn-" + mode).classList.add("active");

    // clear messages
    const messages = document.getElementById("chatMessages");
    messages.innerHTML = "";

    // show welcome message based on mode
    if (mode === "query") {
        addBotMessage("Ask me about products! Example: 'Show me jeans under ₹500'");
    } else if (mode === "policy") {
        addBotMessage("Ask me about our policies! Example: 'What is return policy?'");
    } else if (mode === "agent") {
        addBotMessage("Ask me about your orders! Example: 'Check status of my order 59'");
    }
}

// send message
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    // show user message
    addUserMessage(message);
    input.value = "";

    // show loading
    addLoadingMessage();

    try {
        let endpoint = "";
        if (currentMode === "query") endpoint = "/chat/query";
        else if (currentMode === "policy") endpoint = "/chat/policy";
        else if (currentMode === "agent") endpoint = "/chat/agent";

        const response = await fetch(`${CHAT_API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        // remove loading message
        removeLoadingMessage();

        if (currentMode === "query") {
            // show products
            if (data.response.length === 0) {
                addBotMessage("No products found for your query.");
            } else {
                let productText = "Here are the products I found:<br><br>";
                data.response.forEach(product => {
                    productText += `👕 <b>${product.name}</b><br>`;
                    productText += `💰 ₹${product.price} | ${product.category}<br><br>`;
                });
                addBotMessage(productText);
            }
        } else {
            // show text response
            addBotMessage(data.response);
        }

    } catch (error) {
        removeLoadingMessage();
        addBotMessage("Cannot connect to server. Please try again.");
    }
}

// add bot message
function addBotMessage(text) {
    const messages = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "msg msg-bot";
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// add user message
function addUserMessage(text) {
    const messages = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "msg msg-user";
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// add loading message
function addLoadingMessage() {
    const messages = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "msg msg-loading";
    div.id = "loadingMsg";
    div.textContent = "Thinking...";
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// remove loading message
function removeLoadingMessage() {
    const loading = document.getElementById("loadingMsg");
    if (loading) loading.remove();
}

// press enter to send
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}