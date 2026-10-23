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
  // SAMEORIGIN (e não DENY): a home embute ver.html?demo=1 no iframe da
  // prévia ao vivo. Bloquear todo framing quebraria a prévia; SAMEORIGIN
  // continua impedindo clickjacking de outros domínios.
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "img-src 'self' data: blob: https:; " +
    "media-src 'self' blob: https:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://*.blob.vercel-storage.com https://blob.vercel-storage.com; " +
    "frame-ancestors 'self'",
};

module.exports = { hashPassword, verifyPassword, randomToken, randomId, emailHash, SECURITY_HEADERS };
