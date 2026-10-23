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
  // A Vercel pode entregar o corpo já interpretado; não espere um stream consumido.
  if(req.body !== undefined) {
    const raw=Buffer.isBuffer(req.body)?req.body:typeof req.body==='string'?Buffer.from(req.body):Buffer.from(JSON.stringify(req.body));
    if(raw.length>config.MAX_BODY_BYTES)throw Object.assign(new Error('Payload muito grande'),{status:413,code:'PAYLOAD_TOO_LARGE'});
    try{return raw.length?JSON.parse(raw.toString('utf8')):{};}
    catch{throw Object.assign(new Error('JSON inválido'),{status:400,code:'INVALID_JSON'});}
  }
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
    try { out[k] = decodeURIComponent(v); } catch { /* Cookie inválido não autentica. */ }
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
  const { isIP } = require('node:net');
  const normalize = ip => ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  const peer = normalize(req.socket.remoteAddress || 'unknown');
  // Cabeçalho preenchido pela borda Vercel, que substitui o valor do cliente.
  if(process.env.VERCEL === '1') {
    const edgeIp=String(req.headers['x-vercel-forwarded-for']||'').split(',')[0].trim();
    return isIP(edgeIp)?normalize(edgeIp):peer;
  }
  const trusted = new Set(config.TRUSTED_PROXIES.map(normalize));
  if (!trusted.has(peer)) return peer;
  const chain = String(req.headers['x-forwarded-for'] || '').split(',').map(ip => normalize(ip.trim()));
  let current = peer;
  for (let i = chain.length - 1; i >= 0 && trusted.has(current); i--) {
    if (!isIP(chain[i])) return peer;
    current = chain[i];
  }
  return current;
}

module.exports = {
  json, ok, created, fail, readJsonBody, parseCookies,
  setSessionCookie, clearSessionCookie, clientIp, applySecurityHeaders,
};
