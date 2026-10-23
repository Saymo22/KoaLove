/* js/api/auth.js — autenticação via backend (cookie HttpOnly) */
(function () {
  const { get, post, setCachedUser } = window.ApiClient;

  async function me() {
    try {
      const { user } = await get("/auth/me");
      setCachedUser(user);
      return user;
    } catch (e) {
      if (e.status === 401) setCachedUser(null);
      throw e;
    }
  }
  async function login(email, password) {
    const { user } = await post("/auth/login", { email, password });
    setCachedUser(user);
    return user;
  }
  async function register(name, email, password) {
    const { user } = await post("/auth/register", { name, email, password });
    setCachedUser(user);
    return user;
  }
  async function logout() {
    try { await post("/auth/logout", {}); } catch {}
    setCachedUser(null);
  }

  window.ApiAuth = { me, login, register, logout };
})();
