/* ==========================================
   UrbanWear Navbar
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeNavbar();
});

/* ==========================================
   Initialize Navbar
========================================== */

function initializeNavbar() {
    setupMobileMenu();
    setupDropdown();
    setActiveLink();
    updateUserSection();
    updateCartBadge();
    setupLogout();
}

/* ==========================================
   Mobile Menu
========================================== */

function setupMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navActions = document.querySelector(".nav-actions");

    if (!menuToggle || !navActions) return;

    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        navActions.classList.toggle("open");
    });
}

/* ==========================================
   User Dropdown
========================================== */

function setupDropdown() {
    const profileButton = document.querySelector(".profile-pill");
    const dropdown = document.querySelector(".dropdown");

    if (!profileButton || !dropdown) return;

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const expanded = profileButton.getAttribute("aria-expanded") === "true";
        profileButton.setAttribute("aria-expanded", String(!expanded));
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        profileButton.setAttribute("aria-expanded", "false");
        dropdown.classList.remove("show");
    });
}

/* ==========================================
   Active Navigation
========================================== */

function setActiveLink() {
    const page = window.location.pathname.split("/").pop().toLowerCase();

    document.querySelectorAll(".nav-links a").forEach((link) => {
        const href = link.getAttribute("href")?.toLowerCase();
        if (href && href.includes(page)) {
            link.classList.add("active");
        }
    });
}

/* ==========================================
   Update User
========================================== */

function updateUserSection() {
    const user = getCurrentUser();
    const profileArea = document.getElementById("profileArea");
    const username = document.getElementById("username");
    const profileAvatar = document.getElementById("profileAvatar");

    if (!user) {
        if (profileArea) profileArea.style.display = "none";
        return;
    }

    if (profileArea) profileArea.style.display = "flex";

    if (username) {
        const fullName = user.name || user.full_name || user.email || "Guest";
        username.textContent = fullName.split(" ")[0];
    }

    if (profileAvatar) {
        const initials = (user.name || user.full_name || user.email || "Guest")
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
        profileAvatar.textContent = initials || "U";
    }
}

/* ==========================================
   Cart Badge
========================================== */

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    const cart = getFromStorage("cart") || [];
    const count = Array.isArray(cart) ? cart.length : 0;

    badge.textContent = count;
    badge.style.display = count ? "inline-flex" : "inline-flex";
    badge.classList.remove("animate");

    if (count > 0) {
        void badge.offsetWidth;
        badge.classList.add("animate");
    }
}

/* ==========================================
   Logout
========================================== */

function setupLogout() {
    const logoutButton = document.getElementById("logoutBtn");
    const dropdownLogout = document.querySelector(".dropdown-logout");

    [logoutButton, dropdownLogout].forEach((button) => {
        if (!button) return;

        button.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                logout();
            }
        });
    });
}

/* ==========================================
   Scroll Effect
========================================== */

window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* ==========================================
   Admin Navigation
========================================== */

function highlightAdminMenu() {
    const current = window.location.pathname.split("/").pop();

    document.querySelectorAll(".sidebar a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.includes(current)) {
            link.classList.add("active");
        }
    });
}

highlightAdminMenu();