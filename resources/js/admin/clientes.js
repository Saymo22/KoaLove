(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("clientes");

  const tbody = document.getElementById("tabelaClientes");
  const panel = document.getElementById("clientDetailPanel");

  const fmt = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function load() {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b717b;">Carregando…</td></tr>`;
    try {
      const { clients } = await window.ApiAdmin.clients();
      if (!clients.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b717b;">Nenhum cliente cadastrado.</td></tr>`;
        return;
      }
      tbody.innerHTML = clients.map(c => `
        <tr>
          <td><strong>${escapeHtml(c.name ?? "—")}</strong></td>
          <td>${escapeHtml(c.email ?? "—")}</td>
          <td>${c.created_at ? new Date(c.created_at).toLocaleDateString("pt-BR") : "—"}</td>
          <td>${c.purchases_count ?? 0}</td>
          <td>${fmt(c.total_spent_cents || 0)}</td>
          <td>${c.tickets_count ?? 0}</td>
          <td>${c.refunds_count ?? 0}</td>
          <td><button class="btn-action" data-id="${escapeHtml(c.id)}" data-act="detail">Detalhes</button></td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#b3263e;">Erro: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  function badge(status) {
    if (status === "paid") return `<span class="badge badge-aprovado">Pago</span>`;
    if (status === "refunded") return `<span class="badge badge-recusado">Reembolsado</span>`;
    return `<span class="badge badge-pendente">Pendente</span>`;
  }

  async function abrirDetalhe(id) {
    panel.style.display = "block";
    panel.innerHTML = `<p style="color:#8b717b;font-size:14px;">Carregando detalhes…</p>`;
    try {
      const { client, purchases, tickets, refunds } = await window.ApiAdmin.clientDetail(id);
      // Contrato: sub-arrays sempre presentes (nunca omitidos)
      const lista = (arr, txt) => arr.length
        ? arr.map(x => `<li>${txt(x)}</li>`).join("")
        : `<li class="admin-empty">Nenhum registro por enquanto.</li>`;

      panel.innerHTML = `
        <div class="table-container">
          <div class="client-detail-head"><p class="admin-eyebrow">Histórico do cliente</p><h3>${escapeHtml(client.name ?? "—")}</h3><span>${escapeHtml(client.email ?? "—")}</span>
          <p>Cliente desde ${client.created_at ? new Date(client.created_at).toLocaleDateString("pt-BR") : "—"}</p></div>

          <div class="client-detail-grid"><section><h4>Compras <span>${purchases.length}</span></h4>
          <ul>
            ${lista(purchases, p => `<b>#${escapeHtml(String(p.id).slice(0, 8))}</b> — ${escapeHtml(p.titulo ?? "Presente")} — ${fmt(p.amount_paid_cents || 0)} ${badge(p.status)}`)}
          </ul></section>

          <section><h4>Atendimentos <span>${tickets.length}</span></h4>
          <ul>
            ${lista(tickets, t => `<b>${escapeHtml(String(t.id).slice(0, 10))}</b> — ${escapeHtml(t.subject)} (${t.status === "open" ? "aberto" : "respondido"})`)}
          </ul></section>

          <section><h4>Reembolsos <span>${refunds.length}</span></h4>
          <ul>
            ${lista(refunds, r => `<b>#${escapeHtml(String(r.id).slice(0, 8))}</b> — ${escapeHtml(r.reason)} (${r.status})`)}
          </ul></section></div>
        </div>
      `;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      panel.innerHTML = `<p style="color:#b3263e;font-size:14px;">Erro ao carregar detalhes: ${escapeHtml(err.message)}</p>`;
    }
  }

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act='detail']");
    if (!btn) return;
    abrirDetalhe(btn.dataset.id);
  });

  await load();
})();
