/* Cliente HTTP unificado.
   - Sempre `credentials: include` (cookie de sessão HttpOnly)
   - Trata 429 com lock local persistente (rate_lock:<METHOD>:<PATH>)
   - Erro estruturado via ApiError (ler err.code antes de decidir!) */
(function () {
  const BASE = (window.APP_CONFIG?.API_BASE) || "/api";
  const LOCK_PREFIX = (window.APP_CONFIG?.RATE_LOCK_PREFIX) || "rate_lock:";
  const USER_CACHE_KEY = (window.APP_CONFIG?.USER_CACHE_KEY) || "nossoamor_user_cache";

  class ApiError extends Error {
    constructor({ code, message, status, retryAfter, meta }) {
      super(message);
      this.name = "ApiError";
      this.code = code;
      this.status = status;
      this.retryAfter = retryAfter;
      this.meta = meta;
    }
  }

  function keyFor(method, path) { return `${LOCK_PREFIX}${method} ${path}`; }

  function getLock(method, path) {
    try {
      const raw = localStorage.getItem(keyFor(method, path));
      if (!raw) return null;
      const until = Number(raw);
      if (!Number.isFinite(until) || until <= Date.now()) {
        localStorage.removeItem(keyFor(method, path));
        return null;
      }
      return until;
    } catch { return null; }
  }

  function setLock(method, path, untilMs) {
    try { localStorage.setItem(keyFor(method, path), String(untilMs)); } catch {}
  }

  async function request(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();

    // Bloqueio local por rate limit (contrato: rate limit é sagrado)
    const lock = getLock(method, path);
    if (lock) {
      const secs = Math.ceil((lock - Date.now()) / 1000);
      throw new ApiError({
        code: "CLIENT_RATE_LIMITED",
        message: `Muitas tentativas. Aguarde ${secs}s.`,
        status: 429,
        retryAfter: secs,
      });
    }

    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const init = { method, headers, credentials: "include" };
    if (options.body !== undefined) init.body = JSON.stringify(options.body);
    if (options.signal) init.signal = options.signal;

    let res;
    try {
      res = await fetch(BASE + path, init);
    } catch (netErr) {
      throw new ApiError({
        code: "NETWORK_ERROR",
        message: "Falha de conexão com o servidor. Verifique se ele está rodando.",
        status: 0,
      });
    }

    const retryAfter = Number(res.headers.get("Retry-After")) || null;

    let body = null;
    try { body = await res.json(); } catch {}

    if (!res.ok || !body || body.ok === false) {
      if (res.status === 429 && retryAfter) {
        setLock(method, path, Date.now() + retryAfter * 1000);
      }
      throw new ApiError({
        code: body?.error?.code || "UNKNOWN_ERROR",
        message: body?.error?.message || `Erro ${res.status}`,
        status: res.status,
        retryAfter,
        meta: body?.error?.meta,
      });
    }

    return body.data;
  }

  function getCachedUser() {
    try {
      const raw = localStorage.getItem(USER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function setCachedUser(u) {
    try {
      if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_CACHE_KEY);
    } catch {}
  }

  window.ApiClient = {
    request,
    get:  (p, o = {}) => request(p, { ...o, method: "GET" }),
    post: (p, body, o = {}) => request(p, { ...o, method: "POST", body }),
    ApiError,
    getCachedUser, setCachedUser,
  };
})();
