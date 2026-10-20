/* Middleware de autenticação — lê o cookie, valida a sessão. */
const { stores } = require("./db");
const { parseCookies } = require("./http");
const config = require("../config");

function readSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[config.COOKIE_NAME];
  if (!token) return null;

  const now = Date.now();
  const session = stores.sessions.find(s => s.token === token && s.expires_at > now);
  if (!session) return null;

  const user = stores.users.find(u => u.id === session.user_id);
  if (!user) return null;

  return { session, user };
}

function requireUser(req) {
  const ctx = readSession(req);
  if (!ctx) return null;
  return ctx.user;
}

function requireAdmin(req) {
  const user = requireUser(req);
  if (!user || user.role !== "admin") return null;
  return user;
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, created_at: u.created_at };
}

module.exports = { readSession, requireUser, requireAdmin, publicUser };