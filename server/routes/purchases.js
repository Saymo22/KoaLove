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
  const themeData = validate.themeData(body.themeData);
  if (!themeData.ok) return http.fail(res, 400, "INVALID_THEME_DATA", "Revise os detalhes do tema: conteúdo inválido ou muito extenso.", { field: "themeData" });
  const para   = validate.sanitizeStr(body.para, 60);
  if (!para) return http.fail(res, 400, "MISSING_RECIPIENT", "Informe o nome de quem recebe.", { field: "para" });

  const purchase = {
    id: security.randomId("p"),
    user_id: user.id,
    tema, titulo, para,
    themeData: themeData.value,
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
