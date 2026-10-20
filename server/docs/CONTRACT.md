# 🎯 Plano de Implementação — Servidor de Testes com Contrato Rígido

Vou entregar um **servidor Node.js zero-dependência** (só `http`, `crypto`, `fs` nativos) com banco em arquivo JSON, rate limiting real, e migração do frontend para consumir a API.

## Arquitetura da solução

```
┌─────────────────────────────────────────────────┐
│  Navegador (http://localhost:3000)              │
│  ┌──────────────────────────────────────────┐   │
│  │  *.html  *.css  *.js  (frontend estático)│   │
│  └──────────────────┬───────────────────────┘   │
│                     │ fetch /api/*              │
│                     ▼                           │
│  ┌──────────────────────────────────────────┐   │
│  │  server/index.js                         │   │
│  │   ├─ /api/auth/*      (login/register)   │   │
│  │   ├─ /api/config       (preços/temas)    │   │
│  │   ├─ /api/purchases/*  (CRUD compras)    │   │
│  │   ├─ /api/admin/*      (clients/purch)   │   │
│  │   └─ static files from ../               │   │
│  └──────────────────┬───────────────────────┘   │
│                     ▼                           │
│  ┌──────────────────────────────────────────┐   │
│  │  server/data/*.json  (file DB atômico)   │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Stack do servidor:** `http`, `crypto`, `fs`, `path`, `url` — só bibliotecas nativas. Nada de `npm install`.

---

## 📦 PASSO 1 — Backend (salve em `server/`)

### `server/package.json`

```json
{
  "name": "nossoamor-testserver",
  "version": "1.0.0",
  "private": true,
  "description": "Servidor local de testes para o projeto Nosso Amor. NÃO usar em produção.",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "seed": "node seed.js"
  },
  "engines": { "node": ">=18" }
}
```

### `server/config.js`

```js
/* Configuração central — TODAS as regras de negócio ficam aqui. */
const path = require("path");

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "127.0.0.1",

  // Diretório de dados (criado automaticamente)
  DATA_DIR: path.join(__dirname, "data"),

  // Frontend raiz (um nível acima de server/)
  FRONTEND_ROOT: path.resolve(__dirname, ".."),

  // Sessão
  SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000,          // 7 dias
  COOKIE_NAME: "nossoamor_sid",
  COOKIE_SECURE: false,                              // true apenas com HTTPS
  COOKIE_SAMESITE: "Strict",

  // Senhas
  SCRYPT_KEYLEN: 64,
  PASSWORD_MIN_LEN: 6,

  // Limites de requisição (OWASP A04/A07)
  RATE_LIMITS: {
    "POST /api/auth/login":    { limit: 5,   windowMs: 60_000 },
    "POST /api/auth/register": { limit: 3,   windowMs: 60_000 },
    "POST /api/auth/logout":   { limit: 30,  windowMs: 60_000 },
    "GET /api/auth/me":        { limit: 120, windowMs: 60_000 },
    "GET /api/config":         { limit: 120, windowMs: 60_000 },
    "POST /api/purchases":     { limit: 10,  windowMs: 60_000 },
    "GET /api/purchases":      { limit: 120, windowMs: 60_000 },
    "GET /api/admin":          { limit: 120, windowMs: 60_000 },
    "POST /api/admin":         { limit: 30,  windowMs: 60_000 },
    "*":                       { limit: 120, windowMs: 60_000 },
  },

  // Limite de payload JSON
  MAX_BODY_BYTES: 2 * 1024 * 1024,   // 2MB (metadados apenas; blobs ficam no IndexedDB)

  // Admin seed (SOBRESCREVA via env vars!)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@nossoamor.com",
  ADMIN_PASS:  process.env.ADMIN_PASS  || "admin123",

  // Extensões de arquivos estáticos permitidos
  STATIC_EXTS: new Set([
    ".html", ".css", ".js", ".svg", ".png", ".jpg", ".jpeg",
    ".webp", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".json"
  ]),
};
```

### `server/lib/db.js`

```js
/* File-based DB atômico — leitura em memória, escrita atômica via tmp+rename. */
const fs = require("fs/promises");
const path = require("path");
const config = require("../config");

class JsonStore {
  constructor(name) {
    this.path = path.join(config.DATA_DIR, name + ".json");
    this.data = null;
    this._writeQueue = Promise.resolve();
  }
  async load() {
    try {
      const raw = await fs.readFile(this.path, "utf8");
      this.data = JSON.parse(raw);
      if (!Array.isArray(this.data)) this.data = [];
    } catch (e) {
      if (e.code === "ENOENT") this.data = [];
      else throw new Error(`Falha ao carregar ${this.path}: ${e.message}`);
    }
  }
  async save() {
    // Serializa as gravações para evitar corrida
    this._writeQueue = this._writeQueue.then(async () => {
      const tmp = this.path + ".tmp";
      await fs.mkdir(path.dirname(this.path), { recursive: true });
      await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
      await fs.rename(tmp, this.path);
    });
    return this._writeQueue;
  }
  all()      { return this.data; }
  find(fn)   { return this.data.find(fn); }
  filter(fn) { return this.data.filter(fn); }
  async insert(item) { this.data.push(item); await this.save(); return item; }
  async update(id, patch) {
    const i = this.data.findIndex(x => x.id === id);
    if (i < 0) return null;
    this.data[i] = { ...this.data[i], ...patch, updated_at: Date.now() };
    await this.save();
    return this.data[i];
  }
  async remove(id) {
    const i = this.data.findIndex(x => x.id === id);
    if (i < 0) return false;
    this.data.splice(i, 1);
    await this.save();
    return true;
  }
}

const stores = {
  users:     new JsonStore("users"),
  sessions:  new JsonStore("sessions"),
  purchases: new JsonStore("purchases"),
  tickets:   new JsonStore("tickets"),
  refunds:   new JsonStore("refunds"),
  config:    new JsonStore("config"),     // array com 1 item de config
};

async function initAll() {
  await fs.mkdir(config.DATA_DIR, { recursive: true });
  for (const s of Object.values(stores)) await s.load();
}

module.exports = { stores, initAll };
```

### `server/lib/security.js`

```js
/* OWASP: hashing de senha (A02), tokens criptograficamente seguros (A02),
   comparação timing-safe (A02), headers de segurança (A05). */
const crypto = require("crypto");
const config = require("../config");

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, config.SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(plain, stored) {
  try {
    const [algo, salt, hash] = String(stored).split("$");
    if (algo !== "scrypt") return false;
    const computed = crypto.scryptSync(plain, salt, config.SCRYPT_KEYLEN).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(computed, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function randomId(prefix) {
  return prefix + "_" + crypto.randomBytes(6).toString("hex");
}

function emailHash(email) {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "img-src 'self' data: blob: https:; " +
    "media-src 'self' blob: https:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'",
};

module.exports = { hashPassword, verifyPassword, randomToken, randomId, emailHash, SECURITY_HEADERS };
```

### `server/lib/http.js`

```js
/* Helpers HTTP — todas as respostas seguem o envelope:
   { ok: true, data: X }   ou   { ok: false, error: { code, message, meta? } } */
const config = require("../config");

function applySecurityHeaders(res) {
  const { SECURITY_HEADERS } = require("./security");
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
}

function json(res, status, body, extraHeaders = {}) {
  applySecurityHeaders(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

function ok(res, data, extra)         { json(res, 200, { ok: true,  data }, extra); }
function created(res, data, extra)    { json(res, 201, { ok: true,  data }, extra); }
function fail(res, status, code, message, meta, extra) {
  json(res, status, { ok: false, error: { code, message, ...(meta ? { meta } : {}) } }, extra);
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", c => {
      size += c.length;
      if (size > config.MAX_BODY_BYTES) {
        req.destroy();
        reject(Object.assign(new Error("Payload muito grande"), { status: 413, code: "PAYLOAD_TOO_LARGE" }));
      } else chunks.push(c);
    });
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(Object.assign(new Error("JSON inválido"), { status: 400, code: "INVALID_JSON" }));
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function setSessionCookie(res, token) {
  const parts = [
    `${config.COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${config.COOKIE_SAMESITE}`,
    `Max-Age=${Math.floor(config.SESSION_TTL_MS / 1000)}`,
  ];
  if (config.COOKIE_SECURE) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${config.COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`);
}

function clientIp(req) {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

module.exports = {
  json, ok, created, fail, readJsonBody, parseCookies,
  setSessionCookie, clearSessionCookie, clientIp, applySecurityHeaders,
};
```

### `server/lib/ratelimit.js`

```js
/* Rate limiting em memória. Janela deslizante simples. */
const config = require("../config");

const buckets = new Map();   // key = `${ip}|${rule}` -> { hits: [timestamps] }

function pickRule(method, pathname) {
  // Match exato primeiro
  const exact = `${method} ${pathname}`;
  if (config.RATE_LIMITS[exact]) return { rule: exact, ...config.RATE_LIMITS[exact] };
  // Match por prefixo (ex: "GET /api/admin")
  const parts = pathname.split("/").filter(Boolean);
  for (let i = parts.length; i >= 2; i--) {
    const prefix = `${method} /${parts.slice(0, i).join("/")}`;
    if (config.RATE_LIMITS[prefix]) return { rule: prefix, ...config.RATE_LIMITS[prefix] };
  }
  return { rule: "*", ...config.RATE_LIMITS["*"] };
}

function check(req) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const { rule, limit, windowMs } = pickRule(req.method, req.url.split("?")[0]);
  const key = `${ip}|${rule}`;
  const now = Date.now();

  let b = buckets.get(key);
  if (!b) { b = { hits: [] }; buckets.set(key, b); }
  // Limpa janela
  b.hits = b.hits.filter(t => now - t < windowMs);

  const remaining = Math.max(0, limit - b.hits.length);
  const reset = b.hits.length ? Math.ceil((windowMs - (now - b.hits[0])) / 1000) : Math.ceil(windowMs / 1000);

  if (b.hits.length >= limit) {
    return {
      allowed: false,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(reset),
      },
    };
  }

  b.hits.push(now);
  return {
    allowed: true,
    headers: {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining - 1),
      "X-RateLimit-Reset": String(reset),
    },
  };
}

module.exports = { check };
```

### `server/lib/validate.js`

```js
/* Validadores reutilizáveis. Retornam { ok: true, value } ou { ok: false, code, message, field } */
function isString(v, { min = 1, max = 1000 } = {}) {
  if (typeof v !== "string") return false;
  const t = v.trim();
  return t.length >= min && t.length <= max;
}

function isEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function isOneOf(v, list) {
  return list.includes(v);
}

function sanitizeStr(v, max = 1000) {
  return String(v == null ? "" : v).trim().slice(0, max);
}

module.exports = { isString, isEmail, isOneOf, sanitizeStr };
```

### `server/lib/auth.js`

```js
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
```

### `server/routes/auth.js`

```js
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
    await stores.sessions.remove(ctx.session.token);
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
```

### `server/routes/config.js`

```js
/* GET /api/config — tudo de negócio que o frontend precisa.
   Nada de preço/tema/cupom hardcoded no front. */
const { stores } = require("../lib/db");
const http = require("../lib/http");

async function get(req, res) {
  const entry = stores.config.all()[0];
  if (!entry) return http.fail(res, 500, "CONFIG_MISSING", "Configuração não inicializada. Rode `node seed.js`.");
  http.ok(res, entry);
}

module.exports = { get };
```

### `server/routes/purchases.js`

```js
const { stores } = require("../lib/db");
const http = require("../lib/http");
const auth = require("../lib/auth");
const security = require("../lib/security");
const validate = require("../lib/validate");

// POST /api/purchases — cria um "rascunho" (status=pending)
async function create(req, res) {
  const user = auth.requireUser(req);
  if (!user) return http.fail(res, 401, "NOT_AUTHENTICATED", "Faça login para continuar.");

  const cfg = stores.config.all()[0] || {};
  const body = await http.readJsonBody(req);

  const tema = validate.sanitizeStr(body.tema, 40);
  if (!cfg.themes || !cfg.themes[tema])
    return http.fail(res, 400, "INVALID_THEME", "Tema inválido ou não configurado.", { field: "tema" });

  const titulo = validate.sanitizeStr(body.titulo, 80) || "Nós dois";
  const para   = validate.sanitizeStr(body.para, 60);
  if (!para) return http.fail(res, 400, "MISSING_RECIPIENT", "Informe o nome de quem recebe.", { field: "para" });

  const purchase = {
    id: security.randomId("p"),
    user_id: user.id,
    tema, titulo, para,
    de: validate.sanitizeStr(body.de, 60),
    inicio: validate.sanitizeStr(body.inicio, 20),
    carta: validate.sanitizeStr(body.carta, 2000),
    status: "pending",
    price_cents: cfg.price_cents,
    coupon: null,
    discount_percent: 0,
    amount_paid_cents: null,
    payment_method: null,
    created_at: Date.now(),
    paid_at: null,
    deleted: false,
    has_media: !!(body.has_media),
    preview_data_url: typeof body.preview_data_url === "string" && body.preview_data_url.length < 200_000
      ? body.preview_data_url
      : null,
  };

  await stores.purchases.insert(purchase);
  http.created(res, { purchase });
}

// GET /api/purchases — lista as compras do usuário logado
async function list(req, res) {
  const user = auth.requireUser(req);
  if (!user) return http.fail(res, 401, "NOT_AUTHENTICATED", "Faça login para continuar.");

  const list = stores.purchases
    .filter(p => p.user_id === user.id && !p.deleted)
    .sort((a, b) => b.created_at - a.created_at);
  http.ok(res, { purchases: list });
}

// GET /api/purchases/:id
async function getOne(req, res, id) {
  const user = auth.requireUser(req);
  if (!user) return http.fail(res, 401, "NOT_AUTHENTICATED", "Faça login.");

  const p = stores.purchases.find(x => x.id === id && !x.deleted);
  if (!p) return http.fail(res, 404, "NOT_FOUND", "Pedido não encontrado.");
  if (p.user_id !== user.id && user.role !== "admin")
    return http.fail(res, 403, "FORBIDDEN", "Sem permissão para acessar este pedido.");

  http.ok(res, { purchase: p });
}

// POST /api/purchases/:id/pay — simula aprovação (checkout em modo teste)
async function pay(req, res, id) {
  const user = auth.requireUser(req);
  if (!user) return http.fail(res, 401, "NOT_AUTHENTICATED", "Faça login.");

  const p = stores.purchases.find(x => x.id === id);
  if (!p) return http.fail(res, 404, "NOT_FOUND", "Pedido não encontrado.");
  if (p.user_id !== user.id) return http.fail(res, 403, "FORBIDDEN", "Sem permissão.");
  if (p.status === "paid") return http.fail(res, 409, "ALREADY_PAID", "Este pedido já foi pago.");

  const body = await http.readJsonBody(req);
  const metodo = body.metodo === "card" ? "card" : "pix";
  const cupom  = validate.sanitizeStr(body.cupom, 20).toUpperCase();
  const cfg    = stores.config.all()[0] || {};

  let discount = 0;
  if (cupom && cfg.coupons && cfg.coupons[cupom]) {
    discount = cfg.coupons[cupom].discount_percent;
  } else if (cupom) {
    return http.fail(res, 400, "INVALID_COUPON", "Cupom inválido ou expirado.", { field: "cupom" });
  }

  const amount = Math.round(p.price_cents * (1 - discount / 100));

  const updated = await stores.purchases.update(id, {
    status: "paid",
    paid_at: Date.now(),
    payment_method: metodo,
    coupon: cupom || null,
    discount_percent: discount,
    amount_paid_cents: amount,
  });

  http.ok(res, { purchase: updated });
}

module.exports = { create, list, getOne, pay };
```

### `server/routes/admin.js`

```js
/* Todos os endpoints /api/admin/* exigem role=admin. */
const { stores } = require("../lib/db");
const http = require("../lib/http");
const auth = require("../lib/auth");

// GET /api/admin/summary — métricas agregadas + últimas transações
async function summary(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito a administradores.");

  const paid = stores.purchases.filter(p => p.status === "paid");
  const receitaCents = paid.reduce((s, p) => s + (p.amount_paid_cents || 0), 0);

  const recent = [...paid]
    .sort((a, b) => (b.paid_at || 0) - (a.paid_at || 0))
    .slice(0, 6)
    .map(p => {
      const u = stores.users.find(x => x.id === p.user_id);
      return {
        id: p.id,
        titulo: p.titulo,
        cliente_nome: u ? u.name : "—",
        cliente_email: u ? u.email : "—",
        valor_cents: p.amount_paid_cents || 0,
        moeda: "BRL",
        paid_at: p.paid_at,
        metodo: p.payment_method,
      };
    });

  const abertos = stores.tickets.filter(t => t.status === "open").length;
  const pendentes = stores.refunds.filter(r => r.status === "pending").length;

  http.ok(res, {
    kpis: {
      receita_cents: receitaCents,
      compras: paid.length,
      tickets_abertos: abertos,
      reembolsos_pendentes: pendentes,
      clientes_total: stores.users.filter(u => u.role === "user").length,
    },
    recentes: recent,
  });
}

// GET /api/admin/clients — lista todos os clientes com agregados
async function clients(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const users = stores.users.filter(u => u.role === "user").map(u => {
    const minhas = stores.purchases.filter(p => p.user_id === u.id);
    const pagas  = minhas.filter(p => p.status === "paid");
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      purchases_count: minhas.length,
      total_spent_cents: pagas.reduce((s, p) => s + (p.amount_paid_cents || 0), 0),
      tickets_count: stores.tickets.filter(t => t.user_id === u.id).length,
      refunds_count: stores.refunds.filter(r => r.user_id === u.id).length,
    };
  }).sort((a, b) => b.total_spent_cents - a.total_spent_cents);

  http.ok(res, { clients: users });
}

// GET /api/admin/clients/:id — cliente + suas compras + tickets + reembolsos (dados associativos)
async function clientDetail(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const u = stores.users.find(x => x.id === id && x.role === "user");
  if (!u) return http.fail(res, 404, "CLIENT_NOT_FOUND", "Cliente não encontrado.");

  http.ok(res, {
    client: { id: u.id, name: u.name, email: u.email, created_at: u.created_at },
    purchases: stores.purchases.filter(p => p.user_id === u.id),
    tickets:   stores.tickets.filter(t => t.user_id === u.id),
    refunds:   stores.refunds.filter(r => r.user_id === u.id),
  });
}

// GET /api/admin/purchases
async function purchases(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.purchases.map(p => {
    const u = stores.users.find(x => x.id === p.user_id);
    return {
      ...p,
      cliente: u ? { id: u.id, name: u.name, email: u.email } : null,
    };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { purchases: enriched });
}

// GET /api/admin/refunds
async function refunds(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.refunds.map(r => {
    const u = stores.users.find(x => x.id === r.user_id);
    const p = stores.purchases.find(x => x.id === r.purchase_id);
    return {
      ...r,
      cliente: u ? { id: u.id, name: u.name, email: u.email } : null,
      purchase: p ? { id: p.id, titulo: p.titulo, valor_cents: p.amount_paid_cents } : null,
    };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { refunds: enriched });
}

// POST /api/admin/refunds/:id/decision — { status: "approved" | "rejected", note? }
async function refundDecision(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const refund = stores.refunds.find(r => r.id === id);
  if (!refund) return http.fail(res, 404, "REFUND_NOT_FOUND", "Solicitação de reembolso não encontrada.");
  if (refund.status !== "pending") return http.fail(res, 409, "ALREADY_DECIDED", "Esta solicitação já foi processada.");

  const body = await http.readJsonBody(req);
  if (body.status !== "approved" && body.status !== "rejected")
    return http.fail(res, 400, "INVALID_STATUS", "Status deve ser 'approved' ou 'rejected'.");

  await stores.refunds.update(id, {
    status: body.status,
    reviewed_at: Date.now(),
    review_note: typeof body.note === "string" ? body.note.slice(0, 500) : null,
  });

  if (body.status === "approved") {
    const p = stores.purchases.find(x => x.id === refund.purchase_id);
    if (p) await stores.purchases.update(p.id, { status: "refunded" });
  }

  http.ok(res, { ok: true });
}

// GET /api/admin/tickets
async function tickets(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.tickets.map(t => {
    const u = stores.users.find(x => x.id === t.user_id);
    return { ...t, cliente: u ? { id: u.id, name: u.name, email: u.email } : null };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { tickets: enriched });
}

// POST /api/admin/tickets/:id/reply — { text }
async function ticketReply(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const t = stores.tickets.find(x => x.id === id);
  if (!t) return http.fail(res, 404, "TICKET_NOT_FOUND", "Ticket não encontrado.");

  const body = await http.readJsonBody(req);
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 2000) : "";
  if (!text) return http.fail(res, 400, "MISSING_TEXT", "Resposta não pode ser vazia.");

  t.messages.push({ role: "admin", text, at: Date.now() });
  t.status = "answered";
  t.updated_at = Date.now();
  await stores.tickets.save();

  http.ok(res, { ticket: t });
}

module.exports = { summary, clients, clientDetail, purchases, refunds, refundDecision, tickets, ticketReply };
```

### `server/routes/index.js`

```js
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
```

### `server/index.js`

```js
/* Servidor de testes — API + arquivos estáticos na mesma origem. */
const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const config = require("./config");
const { initAll } = require("./lib/db");
const rateLimit = require("./lib/ratelimit");
const httpLib = require("./lib/http");
const apiRouter = require("./routes");

function log(req, status) {
  const ip = httpLib.clientIp(req);
  console.log(`[${new Date().toISOString()}] ${ip} ${req.method} ${req.url} → ${status}`);
}

async function serveStatic(req, res, pathname) {
  // Normaliza e evita path traversal
  let rel = decodeURIComponent(pathname);
  if (rel === "/") rel = "/home.html";
  rel = path.normalize(rel).replace(/^([\\/]?\.\.)+/, "");
  const abs = path.join(config.FRONTEND_ROOT, rel);

  // Bloqueia acesso ao diretório do servidor
  if (abs.startsWith(path.join(config.FRONTEND_ROOT, "server"))) {
    httpLib.fail(res, 403, "FORBIDDEN", "Acesso negado.");
    return;
  }
  if (!abs.startsWith(config.FRONTEND_ROOT)) {
    httpLib.fail(res, 403, "FORBIDDEN", "Acesso negado.");
    return;
  }

  const ext = path.extname(abs).toLowerCase();
  if (!config.STATIC_EXTS.has(ext)) {
    httpLib.fail(res, 404, "NOT_FOUND", "Arquivo não encontrado.");
    return;
  }

  try {
    const data = await fs.readFile(abs);
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css":  "text/css; charset=utf-8",
      ".js":   "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg":  "image/svg+xml",
      ".png":  "image/png",
      ".jpg":  "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif":  "image/gif",
      ".ico":  "image/x-icon",
      ".woff": "font/woff",
      ".woff2":"font/woff2",
      ".ttf":  "font/ttf",
    };
    res.statusCode = 200;
    httpLib.applySecurityHeaders(res);
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
    res.end(data);
    log(req, 200);
  } catch (e) {
    if (e.code === "ENOENT") {
      httpLib.fail(res, 404, "NOT_FOUND", "Arquivo não encontrado.");
      log(req, 404);
    } else {
      console.error("[static]", e);
      httpLib.fail(res, 500, "INTERNAL_ERROR", "Erro ao servir arquivo.");
      log(req, 500);
    }
  }
}

async function main() {
  await initAll();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    const pathname = url.pathname;

    // Rate limit (aplica globalmente, mas as regras específicas têm prioridade)
    const rl = rateLimit.check(req);
    for (const [k, v] of Object.entries(rl.headers)) res.setHeader(k, v);
    if (!rl.allowed) {
      log(req, 429);
      httpLib.fail(res, 429, "RATE_LIMITED",
        `Muitas requisições. Tente novamente em ${rl.headers["Retry-After"]}s.`,
        { retry_after_seconds: Number(rl.headers["Retry-After"]) },
        rl.headers);
      return;
    }

    if (pathname.startsWith("/api/")) {
      const wrappedRes = res;
      const origEnd = wrappedRes.end.bind(wrappedRes);
      wrappedRes.end = (...args) => {
        log(req, wrappedRes.statusCode);
        return origEnd(...args);
      };
      try {
        await apiRouter.handle(req, res);
      } catch (e) {
        console.error("[fatal]", e);
        if (!res.headersSent) httpLib.fail(res, 500, "INTERNAL_ERROR", "Erro fatal.");
      }
      return;
    }

    await serveStatic(req, res, pathname);
  });

  server.listen(config.PORT, config.HOST, () => {
    console.log("─".repeat(60));
    console.log(`✅ Servidor de testes rodando em http://${config.HOST}:${config.PORT}`);
    console.log(`   Frontend:   http://${config.HOST}:${config.PORT}/home.html`);
    console.log(`   Admin:      http://${config.HOST}:${config.PORT}/admin/login.html`);
    console.log(`   API:        http://${config.HOST}:${config.PORT}/api/config`);
    console.log("─".repeat(60));
    console.log(`⚠️  Admin padrão: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASS}`);
    console.log("   (Sobrescreva via env vars ADMIN_EMAIL e ADMIN_PASS)");
    console.log("─".repeat(60));
  });
}

main().catch(e => { console.error("Falha ao iniciar:", e); process.exit(1); });
```

### `server/seed.js`

```js
/* Inicializa config + admin + dados de exemplo. Idempotente. */
const { initAll, stores } = require("./lib/db");
const security = require("./lib/security");
const config = require("./config");

const THEMES = {
  namoro: { nome: "Namoro", emoji: "❤️", categoria: "classico", layout: "padrao",
    pequeno: "Uma história que continua...", sufixo: "de amor, risadas e momentos inesquecíveis.",
    amo: "O que eu amo em você",
    cores: { rosa: "#d96c8a", rosaClaro: "#f8dce5", pastel: "#fff1f5", vinho: "#7d3048", escuro: "#4d1e2d", texto: "#4b3740" } },
  casamento: { nome: "Casamento", emoji: "💍", categoria: "classico", layout: "padrao",
    pequeno: "Para sempre juntos...", sufixo: "de união, cumplicidade e amor.",
    amo: "O que eu amo em você",
    cores: { rosa: "#b8903f", rosaClaro: "#f1e4c3", pastel: "#fffaf0", vinho: "#5c4519", escuro: "#3a2c0f", texto: "#4a3f2a" } },
  amizade: { nome: "Amizade", emoji: "🤝", categoria: "classico", layout: "padrao",
    pequeno: "Amizade de verdade...", sufixo: "de parceria, histórias e boas risadas.",
    amo: "O que eu admiro em você",
    cores: { rosa: "#e08a3c", rosaClaro: "#fbe3c9", pastel: "#fff6ec", vinho: "#8a4a12", escuro: "#5a2f0a", texto: "#4d3b2c" } },
  familia: { nome: "Família", emoji: "🏡", categoria: "classico", layout: "padrao",
    pequeno: "Laços que não se desfazem...", sufixo: "de carinho, cuidado e memórias em família.",
    amo: "O que eu amo em você",
    cores: { rosa: "#4f9d7a", rosaClaro: "#d4eddf", pastel: "#f1faf5", vinho: "#1f5a41", escuro: "#12382a", texto: "#2f4a3e" } },
  aniversario: { nome: "Aniversário", emoji: "🎂", categoria: "classico", layout: "padrao",
    pequeno: "Hoje é o seu dia...", sufixo: "de histórias para celebrar.",
    amo: "O que eu admiro em você",
    cores: { rosa: "#7a6ad8", rosaClaro: "#e0dbfa", pastel: "#f6f4ff", vinho: "#3f3391", escuro: "#271f61", texto: "#3d3a57" } },
  "carta-antiga": { nome: "Carta Antiga", emoji: "✉️", categoria: "classico", layout: "carta-antiga",
    pequeno: "Uma carta guardada no tempo...", sufixo: "de palavras escritas com o coração.",
    amo: "O que guardei de você",
    cores: { rosa: "#b8860b", rosaClaro: "#e8d5a3", pastel: "#f5e6c8", vinho: "#4a3820", escuro: "#2d1f0f", texto: "#3a2f1a" } },
  scrapbook: { nome: "Scrapbook", emoji: "🎨", categoria: "classico", layout: "scrapbook",
    pequeno: "Recortes da nossa vida...", sufixo: "de memórias coladas com carinho.",
    amo: "Meus recortes favoritos",
    cores: { rosa: "#ff8fa3", rosaClaro: "#ffc2ce", pastel: "#fdf0e3", vinho: "#8b3a4a", escuro: "#5a2530", texto: "#4d3b2c" } },
  jardim: { nome: "Jardim Secreto", emoji: "🌿", categoria: "classico", layout: "jardim",
    pequeno: "Floresceu em meu coração...", sufixo: "de folhas, flores e amor.",
    amo: "Flores do meu jardim",
    cores: { rosa: "#c9a86a", rosaClaro: "#e8d5b0", pastel: "#f5f1e8", vinho: "#2d4a2d", escuro: "#1a2e1a", texto: "#3a4a3a" } },
  cinema: { nome: "Cinema Clássico", emoji: "🎬", categoria: "especial", layout: "cinema",
    pequeno: "Uma história digna de Oscar...", sufixo: "na tela da minha vida.",
    amo: "As cenas favoritas",
    cores: { rosa: "#d4af37", rosaClaro: "#f4e4c1", pastel: "#1a1a1a", vinho: "#f4e4c1", escuro: "#000000", texto: "#f4e4c1" } },
  retro: { nome: "Retrô Anos 80", emoji: "📼", categoria: "especial", layout: "retro",
    pequeno: "Rewind para o nosso amor...", sufixo: "de sintetizadores e neon.",
    amo: "Faixas do nosso mixtape",
    cores: { rosa: "#ff006e", rosaClaro: "#ff6ba5", pastel: "#0a0a1a", vinho: "#00d9ff", escuro: "#000000", texto: "#e0e0ff" } },
  netflix: { nome: "Netflix", emoji: "🎬", categoria: "especial", layout: "netflix",
    pequeno: "Uma série original", sufixo: "a temporada mais bonita da minha vida.",
    amo: "Destaques da temporada",
    cores: { rosa: "#e50914", rosaClaro: "#2a2a2a", pastel: "#0b0b0b", vinho: "#ffffff", escuro: "#000000", texto: "#e5e5e5" } },
  spotify: { nome: "Spotify", emoji: "🎧", categoria: "especial", layout: "spotify",
    pequeno: "Sua playlist", sufixo: "as músicas que contam a nossa história.",
    amo: "Faixas favoritas",
    cores: { rosa: "#1DB954", rosaClaro: "#191414", pastel: "#121212", vinho: "#ffffff", escuro: "#000000", texto: "#e5e5e5" } },
  vinil: { nome: "Vinil", emoji: "🎵", categoria: "especial", layout: "vinil",
    pequeno: "Edição de colecionador", sufixo: "o disco que toca no meu coração.",
    amo: "Faixas favoritas",
    cores: { rosa: "#d4a24e", rosaClaro: "#2d1810", pastel: "#1a0f08", vinho: "#f4ead5", escuro: "#0d0603", texto: "#e8dcc4" } },
};

async function seed() {
  await initAll();

  // 1) Config (preço + temas + cupons)
  if (stores.config.all().length === 0) {
    await stores.config.insert({
      id: "config",
      price_cents: 1990,
      currency: "BRL",
      coupons: {
        BEMVINDO10: { discount_percent: 10 },
        AMOR10:     { discount_percent: 10 },
        NAMORO15:   { discount_percent: 15 },
        ETERNO20:   { discount_percent: 20 },
      },
      themes: THEMES,
      refund_policy_days: 7,
    });
    console.log("✅ Config criada.");
  }

  // 2) Admin
  const adminEmailHash = security.emailHash(config.ADMIN_EMAIL);
  if (!stores.users.find(u => u.email_hash === adminEmailHash)) {
    await stores.users.insert({
      id: security.randomId("u"),
      email: config.ADMIN_EMAIL,
      email_hash: adminEmailHash,
      name: "Administrador",
      password_hash: security.hashPassword(config.ADMIN_PASS),
      role: "admin",
      created_at: Date.now(),
    });
    console.log(`✅ Admin criado: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASS}`);
  } else {
    console.log("ℹ️  Admin já existe.");
  }

  // 3) Dados de exemplo (só se não houver users comuns)
  const hasClients = stores.users.find(u => u.role === "user");
  if (!hasClients) {
    const cliente1 = {
      id: security.randomId("u"),
      email: "marina@exemplo.com",
      email_hash: security.emailHash("marina@exemplo.com"),
      name: "Marina Silva",
      password_hash: security.hashPassword("senha123"),
      role: "user",
      created_at: Date.now() - 86400_000 * 10,
    };
    const cliente2 = {
      id: security.randomId("u"),
      email: "joao@exemplo.com",
      email_hash: security.emailHash("joao@exemplo.com"),
      name: "João Pereira",
      password_hash: security.hashPassword("senha123"),
      role: "user",
      created_at: Date.now() - 86400_000 * 3,
    };
    await stores.users.insert(cliente1);
    await stores.users.insert(cliente2);

    // Compras
    const p1 = {
      id: security.randomId("p"), user_id: cliente1.id,
      tema: "namoro", titulo: "Nós dois", para: "Rafael", de: "Marina",
      inicio: "2022-08-13", carta: "Te amo.",
      status: "paid", price_cents: 1990, coupon: null, discount_percent: 0,
      amount_paid_cents: 1990, payment_method: "pix",
      created_at: Date.now() - 86400_000 * 9, paid_at: Date.now() - 86400_000 * 9,
      deleted: false, has_media: true, preview_data_url: null,
    };
    const p2 = {
      id: security.randomId("p"), user_id: cliente2.id,
      tema: "netflix", titulo: "Nosso seriado", para: "Ana", de: "João",
      inicio: "2020-01-01", carta: "Nossa história merece uma série.",
      status: "paid", price_cents: 1990, coupon: "AMOR10", discount_percent: 10,
      amount_paid_cents: 1791, payment_method: "card",
      created_at: Date.now() - 86400_000 * 2, paid_at: Date.now() - 86400_000 * 2,
      deleted: false, has_media: true, preview_data_url: null,
    };
    const p3 = {
      id: security.randomId("p"), user_id: cliente1.id,
      tema: "jardim", titulo: "Nosso jardim", para: "Mãe", de: "Marina",
      inicio: "2000-05-01", carta: "Obrigada por tudo.",
      status: "pending", price_cents: 1990, coupon: null, discount_percent: 0,
      amount_paid_cents: null, payment_method: null,
      created_at: Date.now() - 86400_000 * 1, paid_at: null,
      deleted: false, has_media: false, preview_data_url: null,
    };
    await stores.purchases.insert(p1);
    await stores.purchases.insert(p2);
    await stores.purchases.insert(p3);

    // Ticket
    await stores.tickets.insert({
      id: security.randomId("t"),
      user_id: cliente1.id,
      subject: "A música não toca no iPhone",
      status: "open",
      created_at: Date.now() - 3600_000,
      updated_at: Date.now() - 3600_000,
      messages: [{ role: "user", text: "Quando abro o presente no iPhone, a música não inicia.", at: Date.now() - 3600_000 }],
    });

    // Reembolso
    await stores.refunds.insert({
      id: security.randomId("r"),
      purchase_id: p2.id,
      user_id: cliente2.id,
      reason: "O link não abre no meu dispositivo.",
      status: "pending",
      created_at: Date.now() - 7200_000,
      reviewed_at: null,
      review_note: null,
    });

    console.log("✅ Dados de exemplo criados (clientes, compras, ticket, reembolso).");
    console.log("   Login cliente:  marina@exemplo.com / senha123");
    console.log("   Login cliente:  joao@exemplo.com / senha123");
  }

  console.log("\n🎉 Seed concluído.\n");
}

seed().catch(e => { console.error(e); process.exit(1); });
```

---

## 📋 PASSO 2 — Contrato (salve em `server/docs/CONTRACT.md`)

```markdown
# Contrato da API — Nosso Amor (Servidor de Testes)

> ⚠️ **Este é um servidor de TESTES.** Não usar em produção. O banco é um
> arquivo JSON local em `server/data/`. Nenhuma informação sobrevive se você
> apagar essa pasta.

## Regras globais

### Envelope de resposta (obrigatório)

**Sucesso:**
```json
{ "ok": true, "data": { ... } }
```

**Erro:**
```json
{
  "ok": false,
  "error": {
    "code": "IDENTIFICADOR_EM_MAIUSCULAS",
    "message": "Mensagem legível em português",
    "meta": { "field": "email" }
  }
}
```

O frontend **NUNCA** deve exibir erro sem ler `error.code` para decidir o
que fazer. Nada de `alert("Erro")` genérico — toda falha é explícita.

### Headers de rate limit (sempre presentes)

- `X-RateLimit-Limit` — limite da janela
- `X-RateLimit-Remaining` — restantes na janela
- `X-RateLimit-Reset` — segundos até resetar
- `Retry-After` — **só em 429**; segundos até liberar

Regras (por IP, janela de 60s):

| Endpoint | Limite |
|----------|--------|
| `POST /api/auth/login` | 5 / min |
| `POST /api/auth/register` | 3 / min |
| `POST /api/auth/logout` | 30 / min |
| `GET /api/auth/me` | 120 / min |
| `POST /api/purchases` | 10 / min |
| `GET /api/purchases` | 120 / min |
| `GET /api/admin/*` | 120 / min |
| `POST /api/admin/*` | 30 / min |
| `*` (fallback) | 120 / min |

**Comportamento esperado no frontend ao receber 429:**
1. Ler `Retry-After`
2. Salvar em `localStorage` a chave `rate_lock:<METHOD>:<PATH>` com `Date.now() + retryAfter*1000`
3. Bloquear novos envios até o tempo expirar
4. Mostrar countdown visível
5. NÃO recarregar a página em loop

### Códigos de erro esperados

| `error.code` | HTTP | Quando |
|-------------|------|--------|
| `INVALID_JSON` | 400 | Body não é JSON |
| `MISSING_CREDENTIALS` | 400 | Login sem email/senha |
| `INVALID_EMAIL` | 400 | Registro com email inválido |
| `INVALID_NAME` | 400 | Registro com nome inválido |
| `WEAK_PASSWORD` | 400 | Senha < 6 caracteres |
| `INVALID_THEME` | 400 | Compra com tema inexistente |
| `MISSING_RECIPIENT` | 400 | Compra sem `para` |
| `INVALID_COUPON` | 400 | Cupom inexistente |
| `INVALID_STATUS` | 400 | Decisão de reembolso inválida |
| `NOT_AUTHENTICATED` | 401 | Sem sessão válida |
| `INVALID_CREDENTIALS` | 401 | Login inválido (mesma msg para senha errada e conta inexistente) |
| `NOT_ADMIN` | 401 | Acesso a admin sem role admin |
| `FORBIDDEN` | 403 | Recurso de outro usuário |
| `NOT_FOUND` | 404 | Pedido/cliente/etc inexistente |
| `ENDPOINT_NOT_FOUND` | 404 | Rota inexistente |
| `EMAIL_TAKEN` | 409 | Registro com email já usado (mensagem neutra, sem confirmar existência) |
| `ALREADY_PAID` | 409 | Pagamento duplicado |
| `ALREADY_DECIDED` | 409 | Reembolso já processado |
| `PAYLOAD_TOO_LARGE` | 413 | Body > 2 MB |
| `RATE_LIMITED` | 429 | Excedeu limite (inclui `retry_after_seconds`) |
| `INTERNAL_ERROR` | 500 | Erro não esperado no servidor |

### Conta enumeration — IMPORTANTE

`POST /api/auth/login` retorna **SEMPRE** `INVALID_CREDENTIALS` (401) para
e-mail errado OU senha errada. Mensagem: *"E-mail ou senha incorretos."*

`POST /api/auth/register` retorna `EMAIL_TAKEN` (409) com mensagem neutra:
*"Não foi possível criar a conta. Verifique os dados e tente novamente."*
(na prática: o frontend deve tratar como "confira o que você digitou").

---

## Endpoints

### AUTH

#### `POST /api/auth/register`
```json
// req
{ "name": "Ana", "email": "ana@x.com", "password": "senha123" }
// 201
{ "ok": true, "data": { "user": { "id": "u_...", "name": "Ana", "email": "ana@x.com", "role": "user" } } }
```
Cookie `nossoamor_sid` é setado com `HttpOnly; SameSite=Strict`.

#### `POST /api/auth/login`
```json
{ "email": "ana@x.com", "password": "senha123" }
```
- 200 → `{ user }`
- 400 → `MISSING_CREDENTIALS`
- 401 → `INVALID_CREDENTIALS`
- 429 → `RATE_LIMITED` (Retry-After)

#### `POST /api/auth/logout` → 200 `{ logged_out: true }`

#### `GET /api/auth/me`
- 200 → `{ user }`
- 401 → `NOT_AUTHENTICATED`

---

### CONFIG

#### `GET /api/config`
```json
{ "ok": true, "data": {
  "price_cents": 1990,
  "currency": "BRL",
  "themes": { "namoro": { ... }, ... },
  "coupons": { "AMOR10": { "discount_percent": 10 }, ... },
  "refund_policy_days": 7
} }
```
**O frontend NÃO DEVE ter preço/tema/cupom hardcoded.** Tudo vem daqui.

---

### PURCHASES

#### `POST /api/purchases` (autenticado)
```json
{ "tema": "namoro", "titulo": "Nós dois", "para": "Rafael", "de": "Marina",
  "inicio": "2022-08-13", "carta": "...", "has_media": true,
  "preview_data_url": "data:image/jpeg;base64,..." }
```
- 201 → `{ purchase }` com `status: "pending"`
- 401 `NOT_AUTHENTICATED` / 400 `INVALID_THEME` / `MISSING_RECIPIENT`

#### `GET /api/purchases` (autenticado) → `{ purchases: [...] }`

#### `GET /api/purchases/:id` (dono ou admin)
- 200 → `{ purchase }`
- 401 / 403 / 404

#### `POST /api/purchases/:id/pay`
```json
{ "metodo": "pix" | "card", "cupom": "AMOR10" }
```
- 200 → `{ purchase }` com `status: "paid"`
- 400 `INVALID_COUPON`
- 409 `ALREADY_PAID`

---

### ADMIN (todos exigem `role=admin`)

#### `GET /api/admin/summary`
```json
{ "ok": true, "data": {
  "kpis": {
    "receita_cents": 3781,
    "compras": 2,
    "tickets_abertos": 1,
    "reembolsos_pendentes": 1,
    "clientes_total": 2
  },
  "recentes": [
    { "id": "p_...", "titulo": "...", "cliente_nome": "João",
      "cliente_email": "joao@x.com", "valor_cents": 1791, "paid_at": 1234,
      "metodo": "card" }
  ]
} }
```

#### `GET /api/admin/clients`
```json
{ "ok": true, "data": { "clients": [
  { "id": "u_...", "name": "Marina", "email": "...",
    "created_at": 1234, "purchases_count": 2, "total_spent_cents": 1990,
    "tickets_count": 1, "refunds_count": 0 }
] } }
```

#### `GET /api/admin/clients/:id` — **objeto associativo completo**
```json
{ "ok": true, "data": {
  "client": { "id": "u_...", "name": "Marina", "email": "...", "created_at": 1234 },
  "purchases": [ { ... } ],
  "tickets":   [ { ... } ],
  "refunds":   [ { ... } ]
} }
```
Regra: **se qualquer sub-array estiver vazio, retornar `[]` — nunca omitir a chave.**

#### `GET /api/admin/purchases` → `{ purchases: [...] }` (cada uma com `cliente` embutido)

#### `GET /api/admin/refunds` → `{ refunds: [...] }` (cada uma com `cliente` e `purchase` embutidos)

#### `POST /api/admin/refunds/:id/decision`
```json
{ "status": "approved" | "rejected", "note": "opcional" }
```
- 200 → `{ ok: true }`
- 404 / 409 `ALREADY_DECIDED`

#### `GET /api/admin/tickets` → `{ tickets: [...] }`

#### `POST /api/admin/tickets/:id/reply`
```json
{ "text": "Sua resposta" }
```

---

## Regras de integridade que o frontend DEVE respeitar

1. **Nunca assumir que um campo existe.** `user.name` pode faltar se um
   cliente antigo não tiver nome — usar `?? "—"` no render.
2. **Listas vazias são listas vazias.** Se `clients: []`, renderizar estado
   vazio — nunca "undefined" na tela.
3. **Sempre ler `error.code` primeiro.** Exibir `error.message` direto é OK,
   mas decisões (ex: bloquear botão em 429) dependem de `error.code`.
4. **Rate limit é sagrado.** Após um 429, o frontend **deve** bloquear
   novas requisições ao mesmo endpoint até `Retry-After` expirar.
5. **Sessão é cookie HttpOnly.** O frontend **NÃO** lê `document.cookie`
   do `nossoamor_sid` (é HttpOnly). Para saber se está logado: `GET /api/auth/me`.
6. **Cache local de usuário** (para renderização rápida) deve ser tratado
   como provisório — sempre reconciliar com `/api/auth/me`.
```

---

## 📡 PASSO 3 — Frontend API client (salve em `js/api/`)

### `js/core/config.js`

```js
window.APP_CONFIG = {
  API_BASE: "/api",           // same-origin
  RATE_LOCK_PREFIX: "rate_lock:",
  USER_CACHE_KEY: "nossoamor_user_cache",
};
```

### `js/api/client.js`

```js
/* Cliente HTTP unificado.
   - Sempre `credentials: include` (cookie de sessão)
   - Trata 429 com lock local persistente
   - Erro estruturado via ApiError
*/
(function () {
  const BASE = (window.APP_CONFIG?.API_BASE) || "/api";
  const LOCK_PREFIX = "rate_lock:";
  const USER_CACHE_KEY = "nossoamor_user_cache";

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

    // Bloqueio local por rate limit
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
        message: "Falha de conexão com o servidor.",
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
```

### `js/api/auth.js`

```js
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
```

### `js/api/admin.js`

```js
(function () {
  const { get, post } = window.ApiClient;
  window.ApiAdmin = {
    summary:        () => get("/admin/summary"),
    clients:        () => get("/admin/clients"),
    clientDetail:   (id) => get(`/admin/clients/${encodeURIComponent(id)}`),
    purchases:      () => get("/admin/purchases"),
    refunds:        () => get("/admin/refunds"),
    refundDecision: (id, status, note) => post(`/admin/refunds/${encodeURIComponent(id)}/decision`, { status, note }),
    tickets:        () => get("/admin/tickets"),
    ticketReply:    (id, text) => post(`/admin/tickets/${encodeURIComponent(id)}/reply`, { text }),
  };
})();
```

---

## 🔄 PASSO 4 — Migrações críticas (frontend)

### `js/pages/login.js` (reescrito — substitui o atual)

```js
document.addEventListener("DOMContentLoaded", async () => {
  // Se já logado, redireciona
  try {
    await window.ApiAuth.me();
    window.location.href = "minha-conta.html";
    return;
  } catch { /* não logado, ok */ }

  // Partículas (mantido)
  const particlesContainer = document.getElementById("particles");
  if (particlesContainer) {
    const symbols = ["♥", "♡", "✦", "✧"];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = (8 + Math.random() * 10) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      p.style.fontSize = (10 + Math.random() * 20) + "px";
      particlesContainer.appendChild(p);
    }
  }

  let isLogin = true;
  const btnToggle = document.getElementById("btnToggle");
  const toggleText = document.getElementById("toggleText");
  const groupName = document.getElementById("groupName");
  const inputName = document.getElementById("inputName");
  const inputEmail = document.getElementById("inputEmail");
  const inputPass = document.getElementById("inputPass");
  const authTitle = document.getElementById("authTitle");
  const authSub = document.getElementById("authSub");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnText = btnSubmit.querySelector(".btn-text");
  const form = document.getElementById("authForm");

  let erroEl = document.getElementById("authErro");
  if (!erroEl) {
    erroEl = document.createElement("div");
    erroEl.id = "authErro";
    erroEl.style.cssText = "color:#ff9ba8;font-size:13px;text-align:center;margin-top:4px;min-height:18px;font-weight:500;line-height:1.4;";
    btnSubmit.parentElement.insertBefore(erroEl, btnSubmit.nextSibling);
  }

  function limparErro() { erroEl.textContent = ""; }
  btnToggle.addEventListener("click", () => {
    isLogin = !isLogin;
    limparErro();
    if (isLogin) {
      authTitle.textContent = "Bem-vindo de volta";
      authSub.textContent = "Acesse sua conta para gerenciar suas surpresas.";
      btnText.textContent = "Entrar na conta";
      toggleText.textContent = "Ainda não tem uma conta?";
      btnToggle.textContent = "Criar conta";
      groupName.classList.add("hidden");
      inputName.required = false;
    } else {
      authTitle.textContent = "Crie sua conta";
      authSub.textContent = "Leva menos de um minuto para eternizar suas histórias.";
      btnText.textContent = "Criar minha conta";
      toggleText.textContent = "Já tem uma conta?";
      btnToggle.textContent = "Fazer login";
      groupName.classList.remove("hidden");
      inputName.required = true;
    }
  });

  [inputEmail, inputPass, inputName].forEach(el => el && el.addEventListener("input", limparErro));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();

    const email = inputEmail.value.trim().toLowerCase();
    const pass = inputPass.value;
    const name = inputName ? inputName.value.trim() : "";

    if (!email || !pass) { erroEl.textContent = "Preencha e-mail e senha."; return; }
    if (!isLogin && !name) { erroEl.textContent = "Preencha seu nome."; return; }
    if (pass.length < 6) { erroEl.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }

    const original = btnText.textContent;
    btnText.textContent = "Carregando...";
    btnSubmit.disabled = true;

    try {
      if (isLogin) await window.ApiAuth.login(email, pass);
      else await window.ApiAuth.register(name, email, pass);
      window.location.href = "minha-conta.html";
    } catch (err) {
      // Tratamento explícito por código
      if (err.code === "CLIENT_RATE_LIMITED" || err.code === "RATE_LIMITED") {
        erroEl.textContent = `Muitas tentativas. Aguarde ${err.retryAfter || 60}s antes de tentar de novo.`;
        // Cooldown visual
        let secs = err.retryAfter || 60;
        const itv = setInterval(() => {
          secs--;
          if (secs <= 0) {
            clearInterval(itv);
            erroEl.textContent = "";
            btnText.textContent = original;
            btnSubmit.disabled = false;
            return;
          }
          erroEl.textContent = `Aguarde ${secs}s.`;
        }, 1000);
        return; // Não reabilita o botão até o cooldown
      }
      erroEl.textContent = err.message || "Erro ao autenticar.";
      btnText.textContent = original;
      btnSubmit.disabled = false;
    }
  });
});
```

### `js/core/navbar.js` — patch mínimo

Substitua a função `getUser()` por:

```js
function getUser() {
  // Cache local para renderização instantânea
  try {
    const raw = localStorage.getItem("nossoamor_user_cache");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
```

E adicione no `init()` após `inject()`:

```js
// Reconcilia com a API em background
if (window.ApiAuth) {
  window.ApiAuth.me().then(() => {
    // Se mudou algo, re-injeta
    const current = getUser();
    const html = document.getElementById("navbar");
    if (html) inject();
  }).catch(() => {
    // 401 → estado deslogado
    localStorage.removeItem("nossoamor_user_cache");
    inject();
  });
}
```

Adicione também antes do `<script>` da navbar, na `login.html` e `minha-conta.html`:
```html
<script src="js/core/config.js"></script>
<script src="js/api/client.js"></script>
<script src="js/api/auth.js"></script>
```

### `js/admin/auth.js` — reescrito

```js
/* Auth do admin — usa API. */
async function fazerLoginAdmin(email, pass) {
  try {
    const user = await window.ApiAuth.login(email, pass);
    if (user.role !== "admin") {
      await window.ApiAuth.logout();
      return { ok: false, error: "Esta conta não tem permissão de administrador." };
    }
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: err.message, code: err.code };
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
```

### `admin/login.html` — script inline ajustado

Substitua o `<script>` final por:

```html
<script src="../js/core/config.js"></script>
<script src="../js/api/client.js"></script>
<script src="../js/api/auth.js"></script>
<script src="../js/admin/auth.js"></script>
<script>
(async () => {
  if (await estaLogadoAdmin()) { window.location.href = "dashboard.html"; return; }
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erro  = document.getElementById("erro");
    const btn   = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Entrando...";
    const res = await fazerLoginAdmin(email, senha);
    if (res.ok) { window.location.href = "dashboard.html"; return; }
    erro.textContent = res.code === "RATE_LIMITED" || res.code === "CLIENT_RATE_LIMITED"
      ? `Muitas tentativas. Aguarde ${res.error ? "" : ""}${60}s.`
      : res.error || "Credenciais incorretas.";
    erro.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Entrar no Painel";
  });
})();
</script>
```

### `js/admin/dashboard.js` — reescrito

```js
(async () => {
  const ok = await protegerRotaAdmin();
  if (!ok) return;
  renderAdminHeader("dashboard");

  const fmt = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (id) => document.getElementById(id);

  try {
    const { kpis, recentes } = await window.ApiAdmin.summary();

    $("metricReceita").textContent = fmt(kpis.receita_cents);
    $("metricCompras").textContent = kpis.compras;
    $("metricReembolsos").textContent = kpis.reembolsos_pendentes;
    $("metricTickets").textContent = kpis.tickets_abertos;

    const list = $("recentList");
    if (!recentes.length) {
      list.innerHTML = `<p style="color:#8b717b;font-size:14px;">Nenhuma transação registrada.</p>`;
    } else {
      list.innerHTML = recentes.map(p => `
        <div class="recent-item">
          <div class="recent-info">
            <b>${escapeHtml(p.titulo || "Presente")}</b>
            <span>${escapeHtml(p.cliente_nome)} • ${p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"}</span>
          </div>
          <div class="recent-value">${fmt(p.valor_cents)}</div>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("[admin dashboard]", err);
    $("metricReceita").textContent = "—";
    $("metricCompras").textContent = "—";
    $("metricReembolsos").textContent = "—";
    $("metricTickets").textContent = "—";
    $("recentList").innerHTML =
      `<p style="color:#b3263e;font-size:14px;">Não foi possível carregar métricas: ${escapeHtml(err.message)}</p>`;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
```

### `dashboard.html` — ajuste dos `<script>`

```html
<script src="../js/core/config.js"></script>
<script src="../js/api/client.js"></script>
<script src="../js/api/auth.js"></script>
<script src="../js/api/admin.js"></script>
<script src="../js/admin/auth.js"></script>
<script src="../js/admin/header.js"></script>
<script src="../js/admin/dashboard.js"></script>
```

E **remova** `<script src="../app.js">` e `<script src="../js/core/db.js">` (dashboard não usa mais IndexedDB).

### `js/admin/header.js` — adicione aba "Clientes"

```js
function renderAdminHeader(activeTab) {
  const header = document.getElementById("adminHeader");
  if (!header) return;
  header.innerHTML = `
    <div class="admin-header">
      <div class="admin-header-top">
        <a href="dashboard.html" class="admin-logo">Nosso Amor <span>ADMIN</span></a>
        <button class="btn-logout-admin" onclick="fazerLogoutAdmin()">Sair do Painel</button>
      </div>
      <div class="admin-tabs">
        <a href="dashboard.html" class="admin-tab ${activeTab === 'dashboard' ? 'active' : ''}">📊 Visão Geral</a>
        <a href="clientes.html"  class="admin-tab ${activeTab === 'clientes'  ? 'active' : ''}">👥 Clientes</a>
        <a href="reembolsos.html" class="admin-tab ${activeTab === 'reembolsos' ? 'active' : ''}">💸 Reembolsos</a>
        <a href="suporte.html"   class="admin-tab ${activeTab === 'suporte'   ? 'active' : ''}">🎧 Suporte</a>
      </div>
    </div>
  `;
}
```

### `js/admin/reembolsos.js` — reescrito

```js
(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("reembolsos");

  const tbody = document.getElementById("tabelaReembolsos");

  function toast(msg, ok = true) {
    const c = document.getElementById("toastContainer");
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = (ok ? "✅ " : "⚠️ ") + msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function badge(status) {
    if (status === "approved") return `<span class="badge badge-aprovado">Aprovado</span>`;
    if (status === "rejected") return `<span class="badge badge-recusado">Recusado</span>`;
    return `<span class="badge badge-pendente">Pendente</span>`;
  }

  async function load() {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Carregando…</td></tr>`;
    try {
      const { refunds } = await window.ApiAdmin.refunds();
      if (!refunds.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Nenhuma solicitação de reembolso.</td></tr>`;
        return;
      }
      tbody.innerHTML = refunds.map(r => `
        <tr>
          <td><strong>${r.purchase ? "#" + r.purchase.id.slice(0, 8) : "—"}</strong></td>
          <td>${r.cliente?.name || "—"}</td>
          <td>${new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
          <td>${escapeHtml(r.reason)}</td>
          <td>${badge(r.status)}</td>
          <td>
            ${r.status === "pending" ? `
              <button class="btn-action" data-id="${r.id}" data-act="approved">Aprovar</button>
              <button class="btn-action danger" data-id="${r.id}" data-act="rejected">Recusar</button>
            ` : "—"}
          </td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b3263e;">Erro: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.dataset.id, act = btn.dataset.act;
    btn.disabled = true;
    try {
      await window.ApiAdmin.refundDecision(id, act);
      toast(`Reembolso ${act === "approved" ? "aprovado" : "recusado"}.`);
      await load();
    } catch (err) {
      toast(err.message, false);
      btn.disabled = false;
    }
  });

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  await load();
})();
```

### `js/admin/suporte.js` — mesmo padrão (adapte)

```js
(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("suporte");
  const tbody = document.getElementById("tabelaSuporte");

  async function load() {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Carregando…</td></tr>`;
    try {
      const { tickets } = await window.ApiAdmin.tickets();
      if (!tickets.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Nenhum ticket aberto.</td></tr>`;
        return;
      }
      tbody.innerHTML = tickets.map(t => `
        <tr>
          <td><strong>${t.id.slice(0, 10)}</strong></td>
          <td>${t.cliente?.name || "—"}</td>
          <td>${escapeHtml(t.subject)}</td>
          <td>${new Date(t.created_at).toLocaleDateString("pt-BR")}</td>
          <td><span class="badge badge-${t.status === "open" ? "pendente" : "aprovado"}">${t.status === "open" ? "Aguardando" : "Respondido"}</span></td>
          <td><button class="btn-action" data-id="${t.id}" data-act="reply">Responder</button></td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b3263e;">Erro: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act='reply']");
    if (!btn) return;
    const text = prompt("Resposta para o cliente:");
    if (!text) return;
    try {
      await window.ApiAdmin.ticketReply(btn.dataset.id, text);
      alert("Resposta enviada.");
      await load();
    } catch (err) { alert("Erro: " + err.message); }
  });

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  await load();
})();
```

### `admin/reembolsos.html` e `admin/suporte.html` — ajuste dos `<script>`

```html
<script src="../js/core/config.js"></script>
<script src="../js/api/client.js"></script>
<script src="../js/api/auth.js"></script>
<script src="../js/api/admin.js"></script>
<script src="../js/admin/auth.js"></script>
<script src="../js/admin/header.js"></script>
<script src="../js/admin/reembolsos.js"></script>
```

---

## 🧪 PASSO 5 — Cenários de teste documentados

Crie `server/docs/TEST_SCENARIOS.md`:

```markdown
# Cenários de teste — verificação manual

## 1. Login e cadastro

### 1.1. Cadastro feliz
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"senha123"}'
```
Esperado: `201` + cookie `nossoamor_sid` + `{ ok: true }`.

### 1.2. Senha curta → 400 WEAK_PASSWORD
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"a@b.com","password":"123"}'
```

### 1.3. E-mail duplicado → 409 EMAIL_TAKEN (mensagem neutra)
Repita o 1.1. Esperado: `409`, `error.code = "EMAIL_TAKEN"` e mensagem **que não confirma** se o email existe ("Não foi possível criar a conta…").

### 1.4. Login inválido → 401 INVALID_CREDENTIALS
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@x.com","password":"errada"}'
```
Esperado: `401` com **a mesma mensagem** que senha errada em conta existente. Nada de "conta não encontrada".

### 1.5. Rate limit do login (5/min)
Envie 6 logins errados em < 1 min:
```bash
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"errada"}'
done
```
Esperado: `401 401 401 401 401 429` — o 429 terá `Retry-After: <N>`.

**Frontend:** ao receber 429, `js/api/client.js` salva `rate_lock:POST /auth/login = now+N*1000`. Um novo clique em <N segundos → `ApiError{ code: "CLIENT_RATE_LIMITED" }` sem rede.

---

## 2. Admin — dados reais

Pré-requisito: rodar `node seed.js` e logar como `admin@nossoamor.com` / `admin123`.

### 2.1. Summary
```bash
# Após login, guardar cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nossoamor.com","password":"admin123"}'

curl -b cookies.txt http://localhost:3000/api/admin/summary
```
Esperado: `receita_cents: 3781`, `compras: 2`, `recentes` com os 2 pedidos pagos (João e Marina).

### 2.2. Clientes (dados associativos)
```bash
curl -b cookies.txt http://localhost:3000/api/admin/clients
curl -b cookies.txt http://localhost:3000/api/admin/clients/<id_marina>
```
Esperado no detalhe: `{ client, purchases: [...], tickets: [...], refunds: [...] }` — **todos os campos presentes** mesmo que vazios (`[]`).

### 2.3. Sem admin → 401 NOT_ADMIN
Faça login como Marina (`marina@exemplo.com` / `senha123`) e tente `GET /api/admin/summary`:
```bash
curl -c c2.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marina@exemplo.com","password":"senha123"}'

curl -b c2.txt -i http://localhost:3000/api/admin/summary
```
Esperado: `401`, `error.code = "NOT_ADMIN"`.

### 2.4. Decisão de reembolso
```bash
# Pega o id do reembolso pendente
curl -b cookies.txt http://localhost:3000/api/admin/refunds
# POST decisão
curl -b cookies.txt -X POST http://localhost:3000/api/admin/refunds/<id>/decision \
  -H "Content-Type: application/json" -d '{"status":"approved"}'
```
Esperado: `200`, e a compra associada passa a `status: "refunded"`. Se repetir → `409 ALREADY_DECIDED`.

---

## 3. OWASP — verificação rápida

### 3.1. Account enumeration
Comparar resposta de:
- `{ email: "naoexiste@x", password: "errada" }`
- `{ email: "marina@exemplo.com", password: "errada" }`

**Ambos**: `401`, `INVALID_CREDENTIALS`, mensagem "E-mail ou senha incorretos.".

### 3.2. Timing leak
Ambos requests acima devem ter latência similar (delay artificial de 250ms é aplicado em falha).

### 3.3. Cookie HttpOnly
Abrir DevTools → Application → Cookies. `nossoamor_sid` deve ter ✅ HttpOnly, ✅ SameSite=Strict.

### 3.4. Headers de segurança
```bash
curl -I http://localhost:3000/home.html
```
Verificar presença de: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`, `Referrer-Policy: no-referrer`, `Permissions-Policy`.

### 3.5. Path traversal
```bash
curl -i "http://localhost:3000/../server/config.js"
curl -i "http://localhost:3000/server/config.js"
```
Esperado: `403` ou `404`.

### 3.6. Body grande (DoS)
```bash
python3 -c "print('{\"a\":\"' + 'x'*3000000 + '\"}')" > /tmp/big.json
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" --data @/tmp/big.json
```
Esperado: `413 PAYLOAD_TOO_LARGE`.

### 3.7. JSON inválido
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" -d '{not json'
```
Esperado: `400 INVALID_JSON`.
```

---

## 🚀 PASSO 6 — Como rodar

```bash
# 1. Primeira vez (cria server/data/, admin, dados de exemplo)
cd server
node seed.js

# 2. Subir servidor
node index.js

# 3. Abrir no navegador
# http://localhost:3000/home.html
# http://localhost:3000/admin/login.html (admin@nossoamor.com / admin123)
```

Para resetar o banco: `rm -rf server/data && node seed.js`.

---

## 📌 Resumo do que foi entregue

| Item | Status |
|------|--------|
| Servidor zero-dependency (Node nativo) | ✅ |
| File DB atômico (tmp+rename) | ✅ |
| Rate limiting por IP + regra por endpoint | ✅ |
| Headers OWASP (A05) | ✅ |
| Password scrypt + timing-safe compare (A02) | ✅ |
| Anti account-enumeration + timing delay (A07) | ✅ |
| Cookie HttpOnly + SameSite (A07) | ✅ |
| Validação de input por campo (A03) | ✅ |
| Payload size limit (A04) | ✅ |
| Path traversal blocking (A01/A05) | ✅ |
| Contrato documentado com envelope `{ok, data}` / `{ok, error}` | ✅ |
| Frontend API client com tratamento de 429 + lock local | ✅ |
| Login migrado (backend + frontend) | ✅ |
| Admin dashboard migrado (dados reais, sem hardcode) | ✅ |
| Admin reembolsos + suporte migrados | ✅ |
| Aba "Clientes" adicionada ao header admin | ✅ |
| Cenários de teste documentados | ✅ |

**Ainda pendente** (fora do escopo desta entrega, mas o padrão já está pronto para seguir):

1. **`admin/clientes.html`** — nova página (só o HTML; o JS pode reaproveitar o padrão de `reembolsos.js` chamando `ApiAdmin.clients()` e `ApiAdmin.clientDetail()`)
2. **`pagamento.html` / `resultado.html`** — migrar `buscarPedido(id)` (IndexedDB) para `GET /api/purchases/:id` + `POST /api/purchases/:id/pay`
3. **`minha-conta.js`** — trocar `listarTodosPedidos()` por `ApiAdmin`-like `GET /api/purchases`
4. **`criar.js`** — trocar `salvarPedido()` por `POST /api/purchases`
5. **`app.js`** — remover `THEMES` e `CONFIG.preco` (agora vem de `GET /api/config`); manter só os helpers de data

Quer que eu continue com o item **1 (admin/clientes.html)** ou **2 (migrar pagamento/resultado)** primeiro?