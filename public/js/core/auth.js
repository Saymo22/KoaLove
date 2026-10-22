/* js/core/auth.js — compat (legado).
   A autenticação real é feita pela API (js/api/auth.js) com cookie HttpOnly.
   Aqui só expomos o cache local de usuário para renderização rápida.
   O estado real deve sempre ser reconciliado com GET /api/auth/me. */

function getUsuarioLogado() {
    try {
        const raw = localStorage.getItem("nossoamor_user_cache");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function estaLogado() {
    return getUsuarioLogado() !== null;
}

function fazerLogout() {
    if (window.ApiAuth) return window.ApiAuth.logout();
    try { localStorage.removeItem("nossoamor_user_cache"); } catch (e) {}
}
