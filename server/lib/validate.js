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