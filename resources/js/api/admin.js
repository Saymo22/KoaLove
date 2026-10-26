/* js/api/admin.js — endpoints administrativos (exigem role=admin) */
(function () {
  const { get, post } = window.ApiClient;
  window.ApiAdmin = {
    summary:        () => get("/admin/summary"),
    clients:        () => get("/admin/clients"),
    clientDetail:   (id) => get(`/admin/clients/${encodeURIComponent(id)}`),
    purchases:      () => get("/admin/purchases"),
    confirmPix:     (id, amount_cents, bank_reference) => post(`/admin/purchases/${encodeURIComponent(id)}/confirm-pix`, {amount_cents, bank_reference, received:true}),
    refunds:        () => get("/admin/refunds"),
    refundDecision: (id, status, note, refund_sent = false) => post(`/admin/refunds/${encodeURIComponent(id)}/decision`, { status, note, refund_sent }),
    tickets:        () => get("/admin/tickets"),
    ticketReply:    (id, text) => post(`/admin/tickets/${encodeURIComponent(id)}/reply`, { text }),
  };
})();
