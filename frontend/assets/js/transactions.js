// ==========================================
// UrbanWear Admin - Transactions
// ==========================================

// API Base URL
const API = window.API_BASE_URL || "http://127.0.0.1:8000";

// ==========================================
// DOM Elements
// ==========================================

const transactionsTable =
    document.getElementById("transactionsTable");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const statusFilter =
    document.getElementById("statusFilter");

const loader =
    document.getElementById("loader");

const emptyState =
    document.getElementById("emptyState");

const toast =
    document.getElementById("toast");

const logoutBtn =
    document.getElementById("logoutBtn");

const totalTransactions =
    document.getElementById("totalTransactions");

const completedPayments =
    document.getElementById("completedPayments");

const pendingPayments =
    document.getElementById("pendingPayments");

const totalRevenue =
    document.getElementById("totalRevenue");

const pageInfo =
    document.getElementById("pageInfo");

const prevPage =
    document.getElementById("prevPage");

const nextPage =
    document.getElementById("nextPage");

// ==========================================
// Variables
// ==========================================

let transactions = [];

let filteredTransactions = [];

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
// Fetch Transactions
// ==========================================

async function fetchTransactions() {

    showLoader();

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/transactions`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error(
                "Failed to load transactions."
            );

        }

        transactions = await response.json();

        filteredTransactions =
            [...transactions];

        updateStatistics();

        renderTransactions();

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
// Render Transactions
// ==========================================

function renderTransactions() {

    transactionsTable.innerHTML = "";

    if (filteredTransactions.length === 0) {

        emptyState.style.display = "block";

        pageInfo.textContent = "Page 0 of 0";

        return;

    }

    emptyState.style.display = "none";

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const pageTransactions =
        filteredTransactions.slice(start, end);

    pageTransactions.forEach((transaction, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${start + index + 1}</td>

            <td>${transaction.transaction_id}</td>

            <td>#${transaction.order_id}</td>

            <td>${transaction.customer_name}</td>

            <td>₹${transaction.amount}</td>

            <td>

                <span class="method">

                    ${transaction.payment_method}

                </span>

            </td>

            <td>

                <span class="status ${transaction.payment_status.toLowerCase()}">

                    ${transaction.payment_status}

                </span>

            </td>

            <td>

                ${new Date(
                    transaction.transaction_date
                ).toLocaleDateString()}

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewTransaction('${transaction.transaction_id}')">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    class="action-btn refund-btn"
                    onclick="refundTransaction('${transaction.transaction_id}')">

                    <i class="fa-solid fa-rotate-left"></i>

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteTransaction('${transaction.transaction_id}')">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        transactionsTable.appendChild(row);

    });

    updatePagination();

}

// ==========================================
// Pagination
// ==========================================

function updatePagination() {

    const totalPages = Math.ceil(

        filteredTransactions.length / rowsPerPage

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

        renderTransactions();

    }

});

nextPage.addEventListener("click", () => {

    const totalPages = Math.ceil(

        filteredTransactions.length / rowsPerPage

    );

    if (currentPage < totalPages) {

        currentPage++;

        renderTransactions();

    }

});
// ==========================================
// Search Transactions
// ==========================================

searchBtn.addEventListener("click", searchTransactions);

searchInput.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {

        searchTransactions();

    }

});

statusFilter.addEventListener("change", searchTransactions);

function searchTransactions() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const status = statusFilter.value;

    filteredTransactions = transactions.filter(transaction => {

        const matchesKeyword =

            transaction.transaction_id.toLowerCase().includes(keyword) ||

            String(transaction.order_id).toLowerCase().includes(keyword) ||

            transaction.customer_name.toLowerCase().includes(keyword);

        const matchesStatus =

            status === "" ||

            transaction.payment_status === status;

        return matchesKeyword && matchesStatus;

    });

    currentPage = 1;

    renderTransactions();

}

// ==========================================
// Statistics
// ==========================================

function updateStatistics() {

    totalTransactions.textContent =
        transactions.length;

    completedPayments.textContent =
        transactions.filter(t =>
            t.payment_status === "Completed"
        ).length;

    pendingPayments.textContent =
        transactions.filter(t =>
            t.payment_status === "Pending"
        ).length;

    const revenue = transactions
        .filter(t => t.payment_status === "Completed")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    totalRevenue.textContent =
        "₹" + revenue.toLocaleString();

}

// ==========================================
// View Transaction
// ==========================================

function viewTransaction(transactionId) {

    localStorage.setItem(
        "selectedTransaction",
        transactionId
    );

    window.location.href =
        "transaction_details.html?id=" +
        transactionId;

}

// ==========================================
// Refund Transaction
// ==========================================

async function refundTransaction(transactionId) {

    const confirmRefund = confirm(

        "Are you sure you want to refund this payment?"

    );

    if (!confirmRefund) return;

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/transactions/${transactionId}/refund`,

            {

                method: "PUT",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error(
                "Refund failed."
            );

        }

        showToast(
            "Refund processed successfully."
        );

        fetchTransactions();

    }

    catch (error) {

        console.error(error);

        showToast(error.message, false);

    }

}

// ==========================================
// Delete Transaction
// ==========================================

async function deleteTransaction(transactionId) {

    const confirmDelete = confirm(

        "Delete this transaction?"

    );

    if (!confirmDelete) return;

    try {

        const token =
            localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/transactions/${transactionId}`,

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
                "Unable to delete transaction."
            );

        }

        showToast(
            "Transaction deleted successfully."
        );

        fetchTransactions();

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

    fetchTransactions();

});
