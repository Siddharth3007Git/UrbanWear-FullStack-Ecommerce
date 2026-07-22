/* ==========================================
   UrbanWear Authentication
========================================== */

/* ==========================================
   Token Management
========================================== */

function getToken() {
    return localStorage.getItem("token") || localStorage.getItem("access_token");
}

function setToken(token) {
    localStorage.setItem("token", token);
    localStorage.setItem("access_token", token);
}

function removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
}

/* ==========================================
   User Management
========================================== */

function getCurrentUser() {

    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;

}

function setCurrentUser(user) {

    localStorage.setItem(

        "user",

        JSON.stringify(user)

    );

}

function removeCurrentUser() {

    localStorage.removeItem("user");

}

/* ==========================================
   Page-aware navigation
========================================== */

function getPagePath(page) {
    const path = window.location.pathname.replace(/\\/g, "/");

    if (/\/pages\/admin(?:\/|$)/.test(path)) {
        return `../${page}`;
    }

    if (/\/pages(?:\/|$)/.test(path)) {
        return page;
    }

    return `pages/${page}`;
}

function redirectToLogin() {
    window.location.replace(getPagePath("login.html"));
}

/* ==========================================
   Authentication
========================================== */

function isAuthenticated() {

    return !!getToken();

}

/* ==========================================
   User Role
========================================== */

function getUserRole() {

    const user = getCurrentUser();

    if (!user) {

        return null;

    }

    return user.role || "customer";

}

function isAdmin() {

    return getUserRole() === "admin";

}

function isCustomer() {

    return getUserRole() === "customer";

}

/* ==========================================
   Login
========================================== */

async function login(email, password) {

    try {

        const response = await apiPost(

            API_ENDPOINTS.LOGIN,

            {

                email,

                password

            }

        );

        setToken(response.access_token);

        if (response.user) {

            setCurrentUser(response.user);

        }

        return response;

    }

    catch (error) {

        throw error;

    }

}

/* ==========================================
   Register
========================================== */

async function register(userData) {

    try {

        return await apiPost(

            API_ENDPOINTS.REGISTER,

            userData

        );

    }

    catch (error) {

        throw error;

    }

}

/* ==========================================
   Logout
========================================== */

function logout() {

    removeToken();

    removeCurrentUser();

    redirectToLogin();

}

/* ==========================================
   Route Protection
========================================== */

function requireLogin() {

    if (!isAuthenticated()) {

        redirectToLogin();

    }

}

function requireAdmin() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;

    }

    if (!isAdmin()) {

        window.location.replace(getPagePath("index.html"));

    }

}

function requireCustomer() {

    if (!isAuthenticated()) {

        redirectToLogin();

        return;

    }

    if (!isCustomer()) {

        window.location.replace(getPagePath("admin/dashboard.html"));

    }

}

/* ==========================================
   Auto Redirect
========================================== */

function redirectIfLoggedIn() {

    if (!isAuthenticated()) {

        return;

    }

    if (isAdmin()) {

        window.location.replace(getPagePath("admin/dashboard.html"));

    }

    else {

        window.location.replace(getPagePath("home.html"));

    }

}

// A browser can restore a protected page from its back/forward cache without
// running that page's initial guard again. Re-check the session on restore.
window.addEventListener("pageshow", (event) => {
    const publicPages = ["", "index.html", "login.html", "register.html"];
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();

    if (event.persisted && !publicPages.includes(currentPage) && !isAuthenticated()) {
        redirectToLogin();
    }
});

/* ==========================================
   Refresh User Profile
========================================== */

async function loadCurrentUser() {

    if (!isAuthenticated()) {

        return null;

    }

    try {

        const user = await apiGet(

            API_ENDPOINTS.PROFILE

        );

        setCurrentUser(user);

        return user;

    }

    catch (error) {

        console.error(error);

        logout();

    }

}

/* ==========================================
   Update Profile
========================================== */

async function updateProfile(data) {

    return await apiPut(

        API_ENDPOINTS.UPDATE_PROFILE,

        data

    );

}

/* ==========================================
   Check Token
========================================== */

async function validateToken() {

    if (!isAuthenticated()) {

        return false;

    }

    try {

        await apiGet(

            API_ENDPOINTS.PROFILE

        );

        return true;

    }

    catch {

        logout();

        return false;

    }

}

/* ==========================================
   Authorization Header
========================================== */

function authHeader() {

    const token = getToken();

    return token

        ? {

            Authorization: `Bearer ${token}`

        }

        : {};

}

/* ==========================================
   Global Export
========================================== */

window.login = login;

window.logout = logout;

window.register = register;

window.getToken = getToken;

window.setToken = setToken;

window.removeToken = removeToken;

window.getCurrentUser = getCurrentUser;

window.setCurrentUser = setCurrentUser;

window.removeCurrentUser = removeCurrentUser;

window.isAuthenticated = isAuthenticated;

window.isAdmin = isAdmin;

window.isCustomer = isCustomer;

window.requireLogin = requireLogin;

window.requireAdmin = requireAdmin;

window.requireCustomer = requireCustomer;

window.redirectIfLoggedIn = redirectIfLoggedIn;

window.loadCurrentUser = loadCurrentUser;

window.updateProfile = updateProfile;

window.validateToken = validateToken;

window.authHeader = authHeader;

window.getPagePath = getPagePath;

window.redirectToLogin = redirectToLogin;
