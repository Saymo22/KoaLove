/* Todos os endpoints /api/admin/* exigem role=admin. */
const { stores, transactionAcross } = require("../lib/db");
const http = require("../lib/http");
const auth = require("../lib/auth");

// GET /api/admin/summary — métricas agregadas + últimas transações
async function summary(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito a administradores.");

  const paid = stores.purchases.filter(p => p.status === "paid");
  const receitaCents = paid.reduce((s, p) => s + (p.amount_paid_cents || 0), 0);

  const recent = [...paid]
    .sort((a, b) => (b.paid_at || 0) - (a.paid_at || 0))
    .slice(0, 6)
    .map(p => {
      const u = stores.users.find(x => x.id === p.user_id);
      return {
        id: p.id,
        titulo: p.titulo,
        cliente_nome: u ? u.name : "—",
        cliente_email: u ? u.email : "—",
        valor_cents: p.amount_paid_cents || 0,
        moeda: "BRL",
        paid_at: p.paid_at,
        metodo: p.payment_method,
      };
    });

  const abertos = stores.tickets.filter(t => t.status === "open").length;
  const pendentes = stores.refunds.filter(r => r.status === "pending").length;

  http.ok(res, {
    kpis: {
      receita_cents: receitaCents,
      compras: paid.length,
      tickets_abertos: abertos,
      reembolsos_pendentes: pendentes,
      clientes_total: stores.users.filter(u => u.role === "user").length,
    },
    recentes: recent,
  });
}

// GET /api/admin/clients — lista todos os clientes com agregados
async function clients(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const users = stores.users.filter(u => u.role === "user").map(u => {
    const minhas = stores.purchases.filter(p => p.user_id === u.id);
    const pagas  = minhas.filter(p => p.status === "paid");
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      purchases_count: minhas.length,
      total_spent_cents: pagas.reduce((s, p) => s + (p.amount_paid_cents || 0), 0),
      tickets_count: stores.tickets.filter(t => t.user_id === u.id).length,
      refunds_count: stores.refunds.filter(r => r.user_id === u.id).length,
    };
  }).sort((a, b) => b.total_spent_cents - a.total_spent_cents);

  http.ok(res, { clients: users });
}

// GET /api/admin/clients/:id — cliente + suas compras + tickets + reembolsos (dados associativos)
async function clientDetail(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const u = stores.users.find(x => x.id === id && x.role === "user");
  if (!u) return http.fail(res, 404, "CLIENT_NOT_FOUND", "Cliente não encontrado.");

  http.ok(res, {
    client: { id: u.id, name: u.name, email: u.email, created_at: u.created_at },
    purchases: stores.purchases.filter(p => p.user_id === u.id),
    tickets:   stores.tickets.filter(t => t.user_id === u.id),
    refunds:   stores.refunds.filter(r => r.user_id === u.id),
  });
}

// GET /api/admin/purchases
async function purchases(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.purchases.all().map(p => {
    const u = stores.users.find(x => x.id === p.user_id);
    return {
      ...p,
      cliente: u ? { id: u.id, name: u.name, email: u.email } : null,
    };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { purchases: enriched });
}

// GET /api/admin/refunds
async function refunds(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.refunds.all().map(r => {
    const u = stores.users.find(x => x.id === r.user_id);
    const p = stores.purchases.find(x => x.id === r.purchase_id);
    return {
      ...r,
      cliente: u ? { id: u.id, name: u.name, email: u.email } : null,
      purchase: p ? { id: p.id, titulo: p.titulo, valor_cents: p.amount_paid_cents } : null,
    };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { refunds: enriched });
}

// POST /api/admin/refunds/:id/decision — { status: "approved" | "rejected", note? }
async function refundDecision(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const body = await http.readJsonBody(req);
  if (body.status !== "approved" && body.status !== "rejected")
    return http.fail(res, 400, "INVALID_STATUS", "Status deve ser 'approved' ou 'rejected'.");

  await transactionAcross(['refunds','purchases'], rows => {
    const refund = rows.refunds.find(r => r.id === id);
    const fail = (status, code, message) => {throw Object.assign(new Error(message), {status,code});};
    if(!refund) fail(404,'REFUND_NOT_FOUND','Solicitação de reembolso não encontrada.');
    if(refund.status !== 'pending') {
      if(refund.status === body.status) return; // Retry da mesma decisão é idempotente.
      fail(409,'ALREADY_DECIDED','Esta solicitação já foi processada.');
    }
    const purchase = rows.purchases.find(p => p.id === refund.purchase_id);
    if(body.status === 'approved' && (!purchase || !['paid','refunded'].includes(purchase.status))) fail(409,'INVALID_PURCHASE','A compra não está disponível para reembolso.');
    Object.assign(refund, {status:body.status, reviewed_at:Date.now(), reviewed_by:admin.id,
      review_note:typeof body.note === 'string' ? body.note.slice(0,500) : null});
    if(body.status === 'approved') Object.assign(purchase, {status:'refunded',updated_at:Date.now()});
  });

  http.ok(res, { ok: true });
}

// GET /api/admin/tickets
async function tickets(req, res) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const enriched = stores.tickets.all().map(t => {
    const u = stores.users.find(x => x.id === t.user_id);
    return { ...t, cliente: u ? { id: u.id, name: u.name, email: u.email } : null };
  }).sort((a, b) => b.created_at - a.created_at);

  http.ok(res, { tickets: enriched });
}

// POST /api/admin/tickets/:id/reply — { text }
async function ticketReply(req, res, id) {
  const admin = auth.requireAdmin(req);
  if (!admin) return http.fail(res, 401, "NOT_ADMIN", "Acesso restrito.");

  const t = stores.tickets.find(x => x.id === id);
  if (!t) return http.fail(res, 404, "TICKET_NOT_FOUND", "Ticket não encontrado.");

  const body = await http.readJsonBody(req);
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 2000) : "";
  if (!text) return http.fail(res, 400, "MISSING_TEXT", "Resposta não pode ser vazia.");

  const ticket = await stores.tickets.transaction(rows => {
    const current = rows.find(x => x.id === id);
    current.messages.push({ role: "admin", text, at: Date.now() });
    current.status = "answered";
    current.updated_at = Date.now();
    return current;
  });
  http.ok(res, { ticket });
}

module.exports = { summary, clients, clientDetail, purchases, refunds, refundDecision, tickets, ticketReply };
