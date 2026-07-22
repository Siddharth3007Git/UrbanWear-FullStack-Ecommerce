// ======================================================
// UrbanWear Admin Dashboard
// dashboard.js
// Part 1
// ======================================================

// -------------------------------
// API CONFIG
// -------------------------------

const API_BASE_URL = "http://127.0.0.1:8000";

// -------------------------------
// JWT TOKEN
// -------------------------------

const token = localStorage.getItem("access_token");

if (!token) {
    window.location.replace("../login.html");
}

// -------------------------------
// COMMON HEADERS
// -------------------------------

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

// -------------------------------
// DASHBOARD CARDS
// -------------------------------

const totalUsers = document.getElementById("totalUsers");
const totalProducts = document.getElementById("totalProducts");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");

// -------------------------------
// CHARTS
// -------------------------------

const revenueChartCanvas = document.getElementById("revenueChart");
const orderChartCanvas = document.getElementById("orderChart");

let revenueChart = null;
let orderChart = null;

// -------------------------------
// TABLES
// -------------------------------

const bestSellingTable =
    document.getElementById("bestSellingTable");

const lowStockTable =
    document.getElementById("lowStockTable");

// -------------------------------
// RECENT ACTIVITY
// -------------------------------

const activityList =
    document.getElementById("activityList");

// -------------------------------
// BUTTONS
// -------------------------------

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const scrollTopBtn =
    document.getElementById("scrollTopBtn");

// -------------------------------
// TOAST
// -------------------------------

const toast =
    document.getElementById("toast");

// ======================================================
// TOAST MESSAGE
// ======================================================

function showToast(message, type = "success") {

    if (!toast) return;

    toast.textContent = message;

    toast.className = `toast ${type}`;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);
}

// ======================================================
// LOADER
// ======================================================

function showLoader() {

    document.body.style.cursor = "wait";

}

function hideLoader() {

    document.body.style.cursor = "default";

}

// ======================================================
// API HELPER
// ======================================================

async function apiRequest(endpoint) {

    try {

        showLoader();

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "GET",
                headers
            }
        );

        if (response.status === 401) {

            localStorage.removeItem("access_token");

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.replace("../login.html");

            return null;
        }

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to connect to server.",
            "error"
        );

        return null;

    } finally {

        hideLoader();

    }
}

// ======================================================
// FORMAT CURRENCY
// ======================================================

function formatCurrency(value) {

    return "₹" + Number(value).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}

// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {

    return Number(value).toLocaleString("en-IN");

}

// ======================================================
// CLEAR TABLE
// ======================================================

function clearTable(table) {

    if (table) {

        table.innerHTML = "";

    }

}
// ======================================================
// LOAD DASHBOARD STATISTICS
// ======================================================

async function loadDashboard() {

    const data = await apiRequest("/admin/dashboard");

    if (!data) return;

    totalUsers.textContent =
        formatNumber(data.total_customers ?? 0);

    totalProducts.textContent =
        formatNumber(data.total_products ?? 0);

    totalOrders.textContent =
        formatNumber(data.total_orders ?? 0);

    totalRevenue.textContent =
        formatCurrency(data.total_revenue ?? 0);

    console.log("Dashboard:", data);
}


// ======================================================
// LOAD REVENUE SUMMARY
// ======================================================

async function loadRevenueSummary() {

    const data = await apiRequest("/admin/revenue");

    if (!data) return;

    console.log("Revenue Summary:", data);

    const revenueCard =
        document.getElementById("revenueSummary");

    if (!revenueCard) return;

    revenueCard.innerHTML = `
        <div class="summary-item">
            <span>Total Revenue</span>
            <strong>${formatCurrency(data.total_revenue)}</strong>
        </div>

        <div class="summary-item">
            <span>Total Orders</span>
            <strong>${formatNumber(data.total_orders)}</strong>
        </div>

        <div class="summary-item">
            <span>Average Order Value</span>
            <strong>${formatCurrency(data.average_order_value)}</strong>
        </div>

        <div class="summary-item">
            <span>Highest Order</span>
            <strong>${formatCurrency(data.highest_order)}</strong>
        </div>

        <div class="summary-item">
            <span>Lowest Order</span>
            <strong>${formatCurrency(data.lowest_order)}</strong>
        </div>
    `;
}


// ======================================================
// REFRESH DASHBOARD
// ======================================================

async function refreshDashboard() {

    await Promise.all([
        loadDashboard(),
        loadRevenueSummary()
    ]);

    showToast("Dashboard updated successfully.");
}


// ======================================================
// REFRESH BUTTON
// ======================================================

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        refreshDashboard();

    });

}
// ======================================================
// LOAD MONTHLY REVENUE CHART
// ======================================================

async function loadRevenueChart() {

    const data = await apiRequest("/admin/monthly-revenue");

    if (!data || !revenueChartCanvas) return;

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(revenueChartCanvas, {
        type: "line",

        data: {
            labels: data.labels,

            datasets: [
                {
                    label: "Monthly Revenue",

                    data: data.revenue,

                    borderWidth: 3,

                    tension: 0.35,

                    fill: true
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: true
                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}


// ======================================================
// LOAD MONTHLY ORDER CHART
// ======================================================

async function loadOrderChart() {

    const data = await apiRequest("/admin/monthly-orders");

    if (!data || !orderChartCanvas) return;

    if (orderChart) {
        orderChart.destroy();
    }

    orderChart = new Chart(orderChartCanvas, {

        type: "bar",

        data: {

            labels: data.labels,

            datasets: [

                {

                    label: "Monthly Orders",

                    data: data.orders,

                    borderWidth: 1

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    precision: 0

                }

            }

        }

    });

}


// ======================================================
// LOAD ALL CHARTS
// ======================================================

async function loadCharts() {

    await Promise.all([

        loadRevenueChart(),

        loadOrderChart()

    ]);

}
// ======================================================
// LOAD BEST SELLING PRODUCTS
// ======================================================

async function loadBestSellingProducts() {

    const data = await apiRequest("/admin/best-selling");

    if (!data || !bestSellingTable) return;

    clearTable(bestSellingTable);

    if (data.products.length === 0) {

        bestSellingTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No Data Available
                </td>
            </tr>
        `;

        return;
    }

    data.products.forEach(product => {

        bestSellingTable.innerHTML += `
            <tr>
                <td>${product.product_id}</td>

                <td>${product.product_name}</td>

                <td>${product.category}</td>

                <td>${formatNumber(product.total_sold)}</td>

                <td>${formatCurrency(product.total_revenue)}</td>

                <td>${formatCurrency(product.price)}</td>
            </tr>
        `;

    });

}



// ======================================================
// LOW STOCK PRODUCTS
// ======================================================

async function loadLowStockProducts() {

    const data = await apiRequest("/admin/low-stock");

    if (!data || !lowStockTable) return;

    clearTable(lowStockTable);

    if (data.products.length === 0) {

        lowStockTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No Low Stock Products
                </td>
            </tr>
        `;

        return;
    }

    data.products.forEach(product => {

        let badge = "";

        switch (product.status) {

            case "Out of Stock":
                badge = `<span class="badge badge-danger">${product.status}</span>`;
                break;

            case "Critical":
                badge = `<span class="badge badge-warning">${product.status}</span>`;
                break;

            default:
                badge = `<span class="badge badge-info">${product.status}</span>`;
        }

        lowStockTable.innerHTML += `
            <tr>

                <td>${product.id}</td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>${product.stock}</td>

                <td>${formatCurrency(product.price)}</td>

                <td>${badge}</td>

            </tr>
        `;

    });

}



// ======================================================
// LOAD PRODUCT TABLES
// ======================================================

async function loadProductTables() {

    await Promise.all([

        loadBestSellingProducts(),

        loadLowStockProducts()

    ]);

}
// ======================================================
// RECENT ORDERS
// ======================================================

async function loadRecentOrders() {

    const data = await apiRequest("/admin/recent-orders");

    if (!data) return [];

    return data.orders || [];

}


// ======================================================
// RECENT TRANSACTIONS
// ======================================================

async function loadRecentTransactions() {

    const data = await apiRequest("/admin/recent-transactions");

    if (!data) return [];

    return data.transactions || [];

}


// ======================================================
// RECENT ACTIVITY
// ======================================================

async function loadRecentActivity() {

    if (!activityList) return;

    activityList.innerHTML = "";

    const orders = await loadRecentOrders();

    const transactions = await loadRecentTransactions();

    const activities = [];

    // ---------------- Orders ----------------

    orders.forEach(order => {

        activities.push({

            date: order.created_at,

            html: `
                <li class="activity-item">
                    <strong>📦 Order #${order.order_id}</strong><br>

                    Customer :
                    <b>${order.customer_name}</b><br>

                    Amount :
                    <b>${formatCurrency(order.total_amount)}</b><br>

                    Status :
                    <b>${order.status}</b><br>

                    <small>${order.created_at}</small>
                </li>
            `
        });

    });

    // ---------------- Transactions ----------------

    transactions.forEach(transaction => {

        activities.push({

            date: transaction.transaction_date,

            html: `
                <li class="activity-item">
                    <strong>💳 Transaction #${transaction.transaction_id}</strong><br>

                    Customer :
                    <b>${transaction.customer_name}</b><br>

                    Amount :
                    <b>${formatCurrency(transaction.amount)}</b><br>

                    Payment :
                    <b>${transaction.payment_status}</b><br>

                    <small>${transaction.transaction_date}</small>
                </li>
            `
        });

    });

    // ---------------- Latest First ----------------

    activities.sort((a, b) => {

        return new Date(b.date) - new Date(a.date);

    });

    if (activities.length === 0) {

        activityList.innerHTML = `
            <li class="activity-item">
                No Recent Activity
            </li>
        `;

        return;

    }

    activities.forEach(item => {

        activityList.innerHTML += item.html;

    });

}
// ======================================================
// LOAD COMPLETE DASHBOARD
// ======================================================

async function loadDashboardData() {

    try {

        await Promise.all([

            loadDashboard(),
            loadRevenueSummary(),

            loadRevenueChart(),
            loadOrderChart(),

            loadBestSellingProducts(),
            loadLowStockProducts(),

            loadRecentActivity()

        ]);

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load dashboard.",
            "error"
        );

    }

}



// ======================================================
// REFRESH
// ======================================================

if (refreshBtn) {

    refreshBtn.addEventListener("click", async () => {

        await loadDashboardData();

        showToast("Dashboard refreshed.");

    });

}



// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        localStorage.removeItem("access_token");

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.replace("../login.html");

    });

}



// ======================================================
// AUTO REFRESH
// ======================================================

// Refresh dashboard every 60 seconds

setInterval(() => {

    loadDashboardData();

}, 60000);



// ======================================================
// SCROLL TO TOP
// ======================================================

window.addEventListener("scroll", () => {

    if (!scrollTopBtn) return;

    if (window.scrollY > 300) {

        scrollTopBtn.style.display = "flex";

    } else {

        scrollTopBtn.style.display = "none";

    }

});


if (scrollTopBtn) {

    scrollTopBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}



// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadDashboardData();

    console.log(
        "UrbanWear Admin Dashboard Loaded Successfully"
    );

});
