/* js/core/auth.js */
const AUTH_KEY = "nossoamor_session";
const USERS_KEY = "nossoamor_usuarios";

/* ---------- USUÁRIOS ---------- */
function getUsuarios() {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function salvarUsuarios(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ---------- SESSÃO ---------- */
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

/* ---------- CRIAÇÃO E LOGIN ---------- */
function criarConta(name, email, pass) {
    const users = getUsuarios();
    if (users[email]) {
        return { ok: false, error: "Este e-mail já está cadastrado. Faça login." };
    }
    users[email] = { name, email, pass: btoa(pass), criadoEm: Date.now() };
    salvarUsuarios(users);
    fazerLogin(name, email);
    return { ok: true };
}

function tentarLogin(email, pass) {
    const users = getUsuarios();
    const u = users[email];
    if (!u) return { ok: false, error: "Conta não encontrada. Crie uma conta." };
    if (u.pass !== btoa(pass)) return { ok: false, error: "Senha incorreta." };
    fazerLogin(u.name, email);
    return { ok: true };
}