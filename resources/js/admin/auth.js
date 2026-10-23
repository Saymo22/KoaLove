/* Auth do admin — usa a API (cookie HttpOnly + role=admin). */
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
  await window.ApiAuth.logout();
  window.location.href = "login.html";
}

async function estaLogadoAdmin() {
  try {
    const user = await window.ApiAuth.me();
    return user.role === "admin";
  } catch { return false; }
}

async function protegerRotaAdmin() {
  const ok = await estaLogadoAdmin();
  if (!ok) { window.location.href = "login.html"; return false; }
  return true;
}
