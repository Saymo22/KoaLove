const ADMIN_KEY = "nossoamor_admin_session";
const ADMIN_EMAIL = "admin@nossoamor.com";
const ADMIN_PASS = "admin123";

function fazerLoginAdmin(email, pass) {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        localStorage.setItem(ADMIN_KEY, JSON.stringify({ email, role: "admin" }));
        return true;
    }
    return false;
}
function fazerLogoutAdmin() {
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = "login.html";
}
function estaLogadoAdmin() {
    return localStorage.getItem(ADMIN_KEY) !== null;
}
function protegerRotaAdmin() {
    if (!estaLogadoAdmin()) window.location.href = "login.html";
}