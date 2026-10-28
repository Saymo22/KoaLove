/* Auth do admin — usa a API (cookie HttpOnly + role=admin). */
let adminSessionUser = null;
function obterAdminAtual() { return adminSessionUser; }
async function fazerLoginAdmin(email, pass) {
  try {
    const user = await window.ApiAuth.login(email, pass);
    if (user.role !== "admin") {
      await window.ApiAuth.logout();
      return { ok: false, error: "Esta conta não tem permissão de administrador." };
    }
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message, code: err.code, retryAfter: err.retryAfter };
  }
}

async function fazerLogoutAdmin() {
  await window.ApiClient.post('/auth/logout', {});
  window.ApiClient.setCachedUser(null);
  adminSessionUser = null;
  window.location.href = "/admin/entrar";
}

async function estaLogadoAdmin() {
  try {
    const user = await window.ApiAuth.me();
    adminSessionUser = user.role === 'admin' ? user : null;
    return user.role === "admin";
  } catch { adminSessionUser = null; return false; }
}

async function protegerRotaAdmin() {
  const ok = await estaLogadoAdmin();
  if (!ok) { window.location.href = "/admin/entrar"; return false; }
  return true;
}
