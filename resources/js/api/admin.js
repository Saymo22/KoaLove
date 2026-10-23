/* js/api/admin.js — endpoints administrativos (exigem role=admin) */
(function () {
  const { get, post } = window.ApiClient;
  window.ApiAdmin = {
    summary:        () => get("/admin/summary"),
    clients:        () => get("/admin/clients"),
    clientDetail:   (id) => get(`/admin/clients/${encodeURIComponent(id)}`),
    purchases:      () => get("/admin/purchases"),
    refunds:        () => get("/admin/refunds"),
    refundDecision: (id, status, note) => post(`/admin/refunds/${encodeURIComponent(id)}/decision`, { status, note }),
    tickets:        () => get("/admin/tickets"),
    ticketReply:    (id, text) => post(`/admin/tickets/${encodeURIComponent(id)}/reply`, { text }),
  };
})();
