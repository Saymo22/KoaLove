/* =====================================================
   app.js — configuração global + helpers compartilhados
   (contrato: docs/API.md)
   - Preços, temas e cupons NÃO são hardcoded: vêm de
     GET /api/config e ficam em cache local.
   - Mídia local serve como rascunho/cache; a cópia de entrega fica no servidor.
   ===================================================== */
window.NA = window.NA || {};

const CONFIG = { preco: null, currency: "BRL", modoTeste: true, coupons: {} };
const THEMES = {};

const CONFIG_CACHE_KEY = "nossoamor_config_cache";

function _aplicarConfig(data) {
  if (!data || typeof data !== "object") return;
  window.APP_CONFIG ||= {};
  window.APP_CONFIG.DIRECT_UPLOADS = data.media_upload === 'direct';
  window.APP_CONFIG.MEDIA_STORAGE_CONFIGURED = data.media_storage?.configured;
  window.APP_CONFIG.MEDIA_LIMITS = data.media_storage?.limits;
  if (typeof data.price_cents === "number") CONFIG.preco = data.price_cents / 100;
  if (typeof data.simulation === 'boolean') CONFIG.modoTeste = data.simulation;
  if (data.currency) CONFIG.currency = data.currency;
  if (data.coupons && typeof data.coupons === "object") CONFIG.coupons = data.coupons;
  if (data.themes && typeof data.themes === "object") Object.assign(THEMES, data.themes);
}

/* Promessa global: aguardar antes de usar THEMES ou CONFIG.preco */
window.NA_CONFIG_READY = (async () => {
  const base = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "/api";
  try {
    const res = await fetch(base + "/config", { credentials: "include" });
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error((body && body.error && body.error.message) || "Falha ao carregar configuração.");
    _aplicarConfig(body.data);
    try { localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ data: body.data, at: Date.now() })); } catch {}
    return body.data;
  } catch (err) {
    // Fallback: cache local (renderização rápida; sempre reconciliar com a API)
    try {
      const raw = localStorage.getItem(CONFIG_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        _aplicarConfig(cached.data);
        return cached.data;
      }
    } catch {}
    console.error("[config] Não foi possível carregar /api/config:", err);
    return null;
  }
})();

/* =====================================================
   PERSISTÊNCIA DE MÍDIA (IndexedDB)
   Rascunhos locais e cache opcional; a entrega usa o conteúdo do servidor.
   ===================================================== */

const DB_NAME = "presente-db",
  STORE = "pedidos";
function abrirDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function salvarPedido(pedido) {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(pedido);
    tx.oncomplete = () => res(pedido);
    tx.onerror = () => rej(tx.error);
  });
}
async function buscarPedido(id) {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  });
}
async function listarTodosPedidos() {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}
async function excluirPedidoDB(id) {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* =====================================================
   HELPERS
   ===================================================== */
function novoId() {
  return (
    Math.random().toString(36).slice(2, 6) +
    Math.random().toString(36).slice(2, 6)
  );
}
function parametro(nome) {
  return new URLSearchParams(location.search).get(nome);
}
function formatarPreco(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: CONFIG.currency || "BRL" });
}
function aplicarTema(chave) {
  const t = (THEMES[chave] || THEMES.namoro || {}).cores;
  if (!t) return;
  const s = document.documentElement.style;
  s.setProperty("--rosa", t.rosa);
  s.setProperty("--rosa-claro", t.rosaClaro);
  s.setProperty("--rosa-pastel", t.pastel);
  s.setProperty("--vinho", t.vinho);
  s.setProperty("--vinho-escuro", t.escuro);
  s.setProperty("--texto", t.texto);
}
function temaEscuro(chave) {
  const t = THEMES[chave] || THEMES.namoro;
  if (!t) return false;
  return (
    t.categoria === "especial" ||
    t.cores.pastel === "#1a1a1a" ||
    t.cores.pastel === "#0a0a1a"
  );
}
function tempoJuntos(inicioISO) {
  const ini = new Date(inicioISO + "T00:00:00"),
    agora = new Date();
  let meses =
    (agora.getFullYear() - ini.getFullYear()) * 12 +
    (agora.getMonth() - ini.getMonth());
  if (agora.getDate() < ini.getDate()) meses--;
  meses = Math.max(0, meses);
  const ms = Math.max(0, agora - ini);
  return {
    anos: Math.floor(meses / 12),
    meses,
    dias: Math.floor(ms / 864e5),
    horas: Math.floor(ms / 36e5),
  };
}
function textoDuracao(t) {
  const a = Math.floor(t.meses / 12),
    m = t.meses % 12,
    p = [];
  if (a) p.push(a + (a === 1 ? " ano" : " anos"));
  if (m) p.push(m + (m === 1 ? " mês" : " meses"));
  return p.length ? p.join(" e ") : t.dias + (t.dias === 1 ? " dia" : " dias");
}
