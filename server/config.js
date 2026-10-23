/* Configuração central — TODAS as regras de negócio ficam aqui. */
const path = require("path");
const cloud = process.env.VERCEL === '1' || process.env.NA_STORAGE === 'postgres';

module.exports = {
  CLOUD: cloud,
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || "127.0.0.1",
  // Somente proxies explicitamente autorizados podem informar o IP do cliente.
  TRUSTED_PROXIES: (process.env.TRUSTED_PROXIES || '').split(',').map(ip => ip.trim()).filter(Boolean),
  PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN || '',
  SMTP: {
    host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '', from: process.env.SMTP_FROM || '',
  },

  // Diretório de dados (criado automaticamente)
  DATA_DIR: cloud ? path.join(require('os').tmpdir(), 'nossoamor') : process.env.NA_DATA_DIR ? path.resolve(process.env.NA_DATA_DIR) : path.join(__dirname, "data"),

  // Apenas os arquivos públicos do site são servidos por HTTP.
  FRONTEND_ROOT: path.resolve(__dirname, "../public"),

  // Sessão
  SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000,          // 7 dias
  COOKIE_NAME: "nossoamor_sid",
  COOKIE_SECURE: process.env.VERCEL === '1' || process.env.COOKIE_SECURE === 'true',
  COOKIE_SAMESITE: "Strict",

  // Senhas
  SCRYPT_KEYLEN: 64,
  PASSWORD_MIN_LEN: 6,

  // Limites de requisição (OWASP A04/A07)
  RATE_LIMITS: {
    "STATIC":                 { limit: 1200, windowMs: 60_000 },
    "MEDIA":                  { limit: 600, windowMs: 60_000 },
    "POST /api/auth/login":    { limit: 5,   windowMs: 60_000 },
    "POST /api/auth/register": { limit: 3,   windowMs: 60_000 },
    "POST /api/auth/forgot-password": { limit: 3, windowMs: 60_000 },
    "POST /api/auth/reset-password": { limit: 5, windowMs: 60_000 },
    "POST /api/auth/logout":   { limit: 30,  windowMs: 60_000 },
    "GET /api/auth/me":        { limit: 120, windowMs: 60_000 },
    "GET /api/config":         { limit: 120, windowMs: 60_000 },
    "POST /api/purchases":     { limit: 10,  windowMs: 60_000 },
    "POST /api/purchases/:id": { limit: 90,  windowMs: 60_000 },
    "GET /api/purchases":      { limit: 120, windowMs: 60_000 },
    "GET /api/admin":          { limit: 120, windowMs: 60_000 },
    "POST /api/admin":         { limit: 30,  windowMs: 60_000 },
    "*":                       { limit: 120, windowMs: 60_000 },
  },

  // Limite de payload JSON
  MAX_BODY_BYTES: 2 * 1024 * 1024,   // JSON; mídias usam upload binário separado

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
