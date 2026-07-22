// ==========================================
// UrbanWear Admin - Customers
// ==========================================

// API URL
const API = window.API_BASE_URL || "http://127.0.0.1:8000";

// DOM Elements
const customersTable = document.getElementById("customersTable");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");

const totalCustomers = document.getElementById("totalCustomers");
const activeCustomers = document.getElementById("activeCustomers");
const blockedCustomers = document.getElementById("blockedCustomers");
const newCustomers = document.getElementById("newCustomers");

const pageInfo = document.getElementById("pageInfo");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

// ==========================================
// Variables
// ==========================================

let customers = [];
let filteredCustomers = [];

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

    toast.style.background = success
        ? "#16a34a"
        : "#dc2626";

    toast.style.display = "block";

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
// Fetch Customers
// ==========================================

async function fetchCustomers() {

    showLoader();

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API}/admin/customers`, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error("Failed to load customers.");

        }

        customers = await response.json();

        filteredCustomers = [...customers];

        updateStatistics();

        renderCustomers();

    } catch (error) {

        console.error(error);

        showToast(error.message, false);

    } finally {

        hideLoader();

    }

}
// ==========================================
// Render Customers
// ==========================================

function renderCustomers() {

    customersTable.innerHTML = "";

    if (filteredCustomers.length === 0) {

        emptyState.style.display = "block";
        pageInfo.textContent = "Page 0 of 0";

        return;

    }

    emptyState.style.display = "none";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageCustomers = filteredCustomers.slice(start, end);

    pageCustomers.forEach((customer, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${start + index + 1}</td>

            <td>

                <div class="customer">

                    <img src="${customer.profile_image || 'https://via.placeholder.com/50'}"
                         alt="Customer">

                    <div>

                        <h4>${customer.name}</h4>

                        <span>ID : ${customer.id}</span>

                    </div>

                </div>

            </td>

            <td>${customer.email}</td>

            <td>${customer.phone || "-"}</td>

            <td>${customer.total_orders || 0}</td>

            <td>₹${customer.total_spent || 0}</td>

            <td>

                <span class="status ${customer.is_active ? "active" : "blocked"}">

                    ${customer.is_active ? "Active" : "Blocked"}

                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewCustomer(${customer.id})">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteCustomer(${customer.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

                <button
                    class="action-btn"
                    style="background:${customer.is_active ? '#f59e0b' : '#16a34a'}"
                    onclick="toggleCustomer(${customer.id})">

                    <i class="fa-solid ${customer.is_active ? "fa-user-slash" : "fa-user-check"}"></i>

                </button>

            </td>

        `;

        customersTable.appendChild(row);

    });

    updatePagination();

}

// ==========================================
// Pagination
// ==========================================

function updatePagination() {

    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled = currentPage === 1;

    nextPage.disabled = currentPage === totalPages;

}

prevPage.addEventListener("click", () => {

    if (currentPage > 1) {

        currentPage--;

        renderCustomers();

    }

});

nextPage.addEventListener("click", () => {

    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

    if (currentPage < totalPages) {

        currentPage++;

        renderCustomers();

    }

});
// ==========================================
// Search Customers
// ==========================================

searchBtn.addEventListener("click", searchCustomers);

searchInput.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {

        searchCustomers();

    }

});

function searchCustomers() {

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === "") {

        filteredCustomers = [...customers];

    } else {

        filteredCustomers = customers.filter(customer =>

            customer.name.toLowerCase().includes(keyword) ||

            customer.email.toLowerCase().includes(keyword)

        );

    }

    currentPage = 1;

    renderCustomers();

}

// ==========================================
// Statistics
// ==========================================

function updateStatistics() {

    totalCustomers.textContent = customers.length;

    activeCustomers.textContent =

        customers.filter(customer => customer.is_active).length;

    blockedCustomers.textContent =

        customers.filter(customer => !customer.is_active).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    newCustomers.textContent = customers.filter(customer => {

        if (!customer.created_at) return false;

        const joined = new Date(customer.created_at);

        return joined.getMonth() === currentMonth &&
               joined.getFullYear() === currentYear;

    }).length;

}

// ==========================================
// View Customer
// ==========================================

function viewCustomer(customerId) {

    localStorage.setItem("selectedCustomer", customerId);

    window.location.href =
        "customer_details.html?id=" + customerId;

}

// ==========================================
// Delete Customer
// ==========================================

async function deleteCustomer(customerId) {

    const confirmDelete = confirm(
        "Delete this customer?"
    );

    if (!confirmDelete) return;

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/customers/${customerId}`,

            {

                method: "DELETE",

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error("Unable to delete customer.");

        }

        showToast("Customer deleted successfully.");

        fetchCustomers();

    }

    catch (error) {

        console.error(error);

        showToast(error.message, false);

    }

}

// ==========================================
// Block / Unblock Customer
// ==========================================

async function toggleCustomer(customerId) {

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(

            `${API}/admin/customers/${customerId}/toggle-status`,

            {

                method: "PUT",

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            throw new Error("Unable to update status.");

        }

        showToast("Customer status updated.");

        fetchCustomers();

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

    fetchCustomers();

});
