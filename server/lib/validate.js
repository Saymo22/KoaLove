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

// Conteúdo dos controles de cada tema; somente dados, nunca HTML executável.
function themeData(value) {
  if (value === undefined || value === null) return { ok: true, value: {} };
  if (typeof value !== 'object' || Array.isArray(value) || JSON.stringify(value).length > 200_000)
    return { ok: false };
  function clean(node, depth = 0) {
    if (depth > 10) throw new Error('Conteúdo muito profundo');
    if (typeof node === 'string') return node.slice(0, 4000);
    if (typeof node === 'number') return Number.isFinite(node) ? node : 0;
    if (typeof node === 'boolean' || node === null) return node;
    if (Array.isArray(node)) return node.slice(0, 100).map(item => clean(item, depth + 1));
    if (typeof node !== 'object') throw new Error('Tipo inválido');
    const result = {};
    for (const [key, child] of Object.entries(node).slice(0, 300)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
      result[key.slice(0, 80)] = clean(child, depth + 1);
    }
    return result;
  }
  try { return { ok: true, value: clean(value) }; } catch { return { ok: false }; }
}
module.exports = { isString, isEmail, isOneOf, sanitizeStr, themeData };
