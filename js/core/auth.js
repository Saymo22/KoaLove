/* js/core/auth.js */
const AUTH_KEY = "nossoamor_session";

function fazerLogin(name, email) {
    const user = { name, email, id: btoa(email), loginAt: Date.now() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
}

function fazerLogout() {
    localStorage.removeItem(AUTH_KEY);
}

function getUsuarioLogado() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
}

function estaLogado() {
    return getUsuarioLogado() !== null;
}