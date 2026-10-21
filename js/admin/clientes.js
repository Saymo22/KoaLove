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
        : `<li style="color:#8b717b;">— nenhum —</li>`;

      panel.innerHTML = `
        <div class="table-container">
          <h3 style="margin-bottom:8px;">${escapeHtml(client.name ?? "—")} <span style="font-weight:400;color:#8b717b;">(${escapeHtml(client.email ?? "—")})</span></h3>
          <p style="font-size:13px;color:#8b717b;margin-bottom:16px;">Cliente desde ${client.created_at ? new Date(client.created_at).toLocaleDateString("pt-BR") : "—"}</p>

          <h4 style="margin-bottom:6px;">🎁 Compras (${purchases.length})</h4>
          <ul style="font-size:13px;margin-bottom:16px;line-height:1.8;">
            ${lista(purchases, p => `<b>#${escapeHtml(String(p.id).slice(0, 8))}</b> — ${escapeHtml(p.titulo ?? "Presente")} — ${fmt(p.amount_paid_cents || 0)} ${badge(p.status)}`)}
          </ul>

          <h4 style="margin-bottom:6px;">🎧 Tickets (${tickets.length})</h4>
          <ul style="font-size:13px;margin-bottom:16px;line-height:1.8;">
            ${lista(tickets, t => `<b>${escapeHtml(String(t.id).slice(0, 10))}</b> — ${escapeHtml(t.subject)} (${t.status === "open" ? "aberto" : "respondido"})`)}
          </ul>

          <h4 style="margin-bottom:6px;">💸 Reembolsos (${refunds.length})</h4>
          <ul style="font-size:13px;line-height:1.8;">
            ${lista(refunds, r => `<b>#${escapeHtml(String(r.id).slice(0, 8))}</b> — ${escapeHtml(r.reason)} (${r.status})`)}
          </ul>
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
