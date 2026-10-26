(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("reembolsos");

  const tbody = document.getElementById("tabelaReembolsos");

  function toast(msg, ok = true) {
    const c = document.getElementById("toastContainer");
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = (ok ? "✅ " : "⚠️ ") + msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function badge(status) {
    if (status === "approved") return `<span class="badge badge-aprovado">Aprovado</span>`;
    if (status === "rejected") return `<span class="badge badge-recusado">Recusado</span>`;
    return `<span class="badge badge-pendente">Pendente</span>`;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function load() {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Carregando…</td></tr>`;
    try {
      const { refunds } = await window.ApiAdmin.refunds();
      if (!refunds.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Nenhuma solicitação de reembolso.</td></tr>`;
        return;
      }
      tbody.innerHTML = refunds.map(r => `
        <tr>
          <td><strong>${r.purchase ? "#" + escapeHtml(String(r.purchase.id).slice(0, 8)) : "—"}</strong></td>
          <td>${escapeHtml(r.cliente?.name ?? "—")}</td>
          <td>${new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
          <td><span class="refund-kind">${r.request_kind==='legal_review'?'Análise de direitos legais':r.request_kind==='commercial'?'Garantia comercial · 3 dias':'Solicitação anterior'}</span>${escapeHtml(r.reason)}</td>
          <td>${badge(r.status)}</td>
          <td>
            ${r.status === "pending" ? `
              <button class="btn-action" data-id="${escapeHtml(r.id)}" data-act="approved">Aprovar</button>
              <button class="btn-action danger" data-id="${escapeHtml(r.id)}" data-act="rejected">Recusar</button>
            ` : "—"}
          </td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b3263e;">Erro: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.dataset.id, act = btn.dataset.act;
    btn.disabled = true;
    try {
      if (act === 'approved' && !confirm('Para Pix manual, faça a devolução no aplicativo do banco antes de aprovar. A aprovação aqui só registra a devolução e revoga o presente. Deseja continuar?')) { btn.disabled = false; return; }
      await window.ApiAdmin.refundDecision(id, act, undefined, act === 'approved');
      toast(`Reembolso ${act === "approved" ? "aprovado" : "recusado"}.`);
      await load();
    } catch (err) {
      toast(err.message, false);
      btn.disabled = false;
    }
  });

  await load();
})();
