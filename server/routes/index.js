/* Roteador principal — toda URL /api/* cai aqui. */
const http = require("../lib/http");
const auth = require("./auth");
const cfg = require("./config");
const purchases = require("./purchases");
const admin = require("./admin");

function match(method, pattern, pathname) {
  const pp = pattern.split("/").filter(Boolean);
  const hp = pathname.split("/").filter(Boolean);
  if (pp.length !== hp.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = decodeURIComponent(hp[i]);
    else if (pp[i] !== hp[i]) return null;
  }
  return params;
}

async function handle(req, res) {
  const url = new URL(req.url, "http://x");
  const pathname = url.pathname;
  const method = req.method;

  try {
    // AUTH
    if (method === "POST" && pathname === "/api/auth/register") return await auth.register(req, res);
    if (method === "POST" && pathname === "/api/auth/login")    return await auth.login(req, res);
    if (method === "POST" && pathname === "/api/auth/logout")   return await auth.logout(req, res);
    if (method === "GET"  && pathname === "/api/auth/me")       return await auth.me(req, res);

    // CONFIG
    if (method === "GET"  && pathname === "/api/config")        return await cfg.get(req, res);

    // PURCHASES
    if (method === "POST" && pathname === "/api/purchases")     return await purchases.create(req, res);
    if (method === "GET"  && pathname === "/api/purchases")     return await purchases.list(req, res);
    let m;
    if (method === "GET"  && (m = match(method, "/api/purchases/:id", pathname)))       return await purchases.getOne(req, res, m.id);
    if (method === "POST" && (m = match(method, "/api/purchases/:id/pay", pathname)))   return await purchases.pay(req, res, m.id);

    // ADMIN
    if (method === "GET"  && pathname === "/api/admin/summary")  return await admin.summary(req, res);
    if (method === "GET"  && pathname === "/api/admin/clients")  return await admin.clients(req, res);
    if (method === "GET"  && (m = match(method, "/api/admin/clients/:id", pathname)))   return await admin.clientDetail(req, res, m.id);
    if (method === "GET"  && pathname === "/api/admin/purchases") return await admin.purchases(req, res);
    if (method === "GET"  && pathname === "/api/admin/refunds")   return await admin.refunds(req, res);
    if (method === "POST" && (m = match(method, "/api/admin/refunds/:id/decision", pathname))) return await admin.refundDecision(req, res, m.id);
    if (method === "GET"  && pathname === "/api/admin/tickets")   return await admin.tickets(req, res);
    if (method === "POST" && (m = match(method, "/api/admin/tickets/:id/reply", pathname)))    return await admin.ticketReply(req, res, m.id);

    // 404
    http.fail(res, 404, "ENDPOINT_NOT_FOUND", `Endpoint ${method} ${pathname} não existe.`);
  } catch (err) {
    console.error("[api] Erro em", method, pathname, "→", err);
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = status >= 500 ? "Erro interno do servidor." : err.message;
    if (!res.headersSent) http.fail(res, status, code, message);
  }
}

module.exports = { handle };