/* Rate limiting em memória. Janela deslizante simples. */
const config = require("../config");

const buckets = new Map();   // key = `${ip}|${rule}` -> { hits: [timestamps] }

function pickRule(method, pathname) {
  if(!pathname.startsWith('/api/'))return {rule:'STATIC',...config.RATE_LIMITS.STATIC};
  if(['GET','HEAD'].includes(method)&&/^\/api\/(purchases|shared)\/[^/]+\/media\/[^/]+$/.test(pathname))return {rule:'MEDIA',...config.RATE_LIMITS.MEDIA};
  // Match exato primeiro
  const exact = `${method} ${pathname}`;
  if (config.RATE_LIMITS[exact]) return { rule: exact, ...config.RATE_LIMITS[exact] };
  // Uploads e atualização não consomem o limite de criação de pedidos.
  if(method === 'POST' && /^\/api\/purchases\/[^/]+\//.test(pathname)) {
    const rule = 'POST /api/purchases/:id';
    return {rule, ...config.RATE_LIMITS[rule]};
  }
  // Match por prefixo (ex: "GET /api/admin")
  const parts = pathname.split("/").filter(Boolean);
  for (let i = parts.length; i >= 2; i--) {
    const prefix = `${method} /${parts.slice(0, i).join("/")}`;
    if (config.RATE_LIMITS[prefix]) return { rule: prefix, ...config.RATE_LIMITS[prefix] };
  }
  return { rule: "*", ...config.RATE_LIMITS["*"] };
}

function check(req) {
  const ip = require('./http').clientIp(req);
  const { rule, limit, windowMs } = pickRule(req.method, req.url.split("?")[0]);
  const key = `${ip}|${rule}`;
  if(config.CLOUD)return require('./postgres-db').rateLimit(key,limit,windowMs);
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
