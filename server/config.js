/* Configuração central — TODAS as regras de negócio ficam aqui. */
const path = require("path");

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "127.0.0.1",

  // Diretório de dados (criado automaticamente)
  DATA_DIR: path.join(__dirname, "data"),

  // Apenas os arquivos públicos do site são servidos por HTTP.
  FRONTEND_ROOT: path.resolve(__dirname, "../public"),

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
    ".webp", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".json",
    ".mp3", ".wav", ".ogg", ".m4a", ".mp4", ".webm", ".mov"
  ]),
};
