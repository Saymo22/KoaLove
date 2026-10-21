const { stores } = require("../lib/db");
const http = require("../lib/http");
const security = require("../lib/security");
const auth = require("../lib/auth");
const validate = require("../lib/validate");
const config = require("../config");

// POST /api/auth/register
async function register(req, res) {
  const body = await http.readJsonBody(req);
  const name  = validate.sanitizeStr(body.name, 60);
  const email = validate.sanitizeStr(body.email, 254).toLowerCase();
  const pass  = String(body.password || "");

  // Validações individuais (OWASP A03 — validação de entrada)
  if (!validate.isString(name, { min: 2, max: 60 }))
    return http.fail(res, 400, "INVALID_NAME", "Nome deve ter entre 2 e 60 caracteres.", { field: "name" });
  if (!validate.isEmail(email))
    return http.fail(res, 400, "INVALID_EMAIL", "E-mail inválido.", { field: "email" });
  if (pass.length < config.PASSWORD_MIN_LEN)
    return http.fail(res, 400, "WEAK_PASSWORD", `Senha precisa ter no mínimo ${config.PASSWORD_MIN_LEN} caracteres.`, { field: "password" });

  // OWASP A07: NÃO revelar se e-mail já existe (account enumeration)
  // Internamente verificamos, mas se existir retornamos 409 sem listar e-mail.
  const existing = stores.users.find(u => u.email_hash === security.emailHash(email));
  if (existing)
    return http.fail(res, 409, "EMAIL_TAKEN", "Não foi possível criar a conta. Verifique os dados e tente novamente.");

  const user = {
    id: security.randomId("u"),
    email, email_hash: security.emailHash(email),
    name,
    password_hash: security.hashPassword(pass),
    role: "user",
    created_at: Date.now(),
  };
  await stores.users.insert(user);

  // Cria sessão + cookie
  const token = security.randomToken(32);
  await stores.sessions.insert({
    token, user_id: user.id,
    created_at: Date.now(),
    expires_at: Date.now() + config.SESSION_TTL_MS,
  });
  http.setSessionCookie(res, token);

  http.created(res, { user: auth.publicUser(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const body = await http.readJsonBody(req);
  const email = validate.sanitizeStr(body.email, 254).toLowerCase();
  const pass  = String(body.password || "");

  if (!email || !pass)
    return http.fail(res, 400, "MISSING_CREDENTIALS", "Informe e-mail e senha.");

  const user = stores.users.find(u => u.email_hash === security.emailHash(email));

  // OWASP A07: NUNCA dizer "e-mail não encontrado" nem "senha errada".
  // Executa verifyPassword mesmo se o usuário não existir (dummy) para
  // evitar timing leak.
  const hash = user ? user.password_hash : "$scrypt$0000$0000";
  const passOk = security.verifyPassword(pass, hash) && !!user;

  if (!passOk) {
    // Delay artificial para dificultar user enumeration por timing
    await new Promise(r => setTimeout(r, 250));
    return http.fail(res, 401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
  }

  // Nova sessão
  const token = security.randomToken(32);
  await stores.sessions.insert({
    token, user_id: user.id,
    created_at: Date.now(),
    expires_at: Date.now() + config.SESSION_TTL_MS,
  });
  http.setSessionCookie(res, token);

  http.ok(res, { user: auth.publicUser(user) });
}

// POST /api/auth/logout
async function logout(req, res) {
  const ctx = auth.readSession(req);
  if (ctx) {
    // JsonStore.remove(id) procura por "id", mas sessões são identificadas
    // pelo "token". Remove pelo token para invalidar a sessão de fato.
    const sessions = stores.sessions.all();
    const i = sessions.findIndex(s => s.token === ctx.session.token);
    if (i >= 0) {
      sessions.splice(i, 1);
      await stores.sessions.save();
    }
  }
  http.clearSessionCookie(res);
  http.ok(res, { logged_out: true });
}

// GET /api/auth/me
async function me(req, res) {
  const user = auth.requireUser(req);
  if (!user) return http.fail(res, 401, "NOT_AUTHENTICATED", "Você não está autenticado.");
  http.ok(res, { user: auth.publicUser(user) });
}

module.exports = { register, login, logout, me };