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