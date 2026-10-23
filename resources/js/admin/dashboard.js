(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("dashboard");

  const fmt = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (id) => document.getElementById(id);

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  try {
    const { kpis, recentes } = await window.ApiAdmin.summary();

    $("metricReceita").textContent = fmt(kpis.receita_cents);
    $("metricCompras").textContent = kpis.compras;
    $("metricReembolsos").textContent = kpis.reembolsos_pendentes;
    $("metricTickets").textContent = kpis.tickets_abertos;

    const list = $("recentList");
    if (!recentes.length) {
      list.innerHTML = `<p style="color:#8b717b;font-size:14px;">Nenhuma transação registrada.</p>`;
    } else {
      list.innerHTML = recentes.map(p => `
        <div class="recent-item">
          <div class="recent-info">
            <b>${escapeHtml(p.titulo || "Presente")}</b>
            <span>${escapeHtml(p.cliente_nome ?? "—")} • ${p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"}</span>
          </div>
          <div class="recent-value">${fmt(p.valor_cents)}</div>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("[admin dashboard]", err);
    $("metricReceita").textContent = "—";
    $("metricCompras").textContent = "—";
    $("metricReembolsos").textContent = "—";
    $("metricTickets").textContent = "—";
    $("recentList").innerHTML =
      `<p style="color:#b3263e;font-size:14px;">Não foi possível carregar métricas: ${escapeHtml(err.message)}</p>`;
  }
})();
