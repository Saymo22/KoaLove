(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("suporte");
  const tbody = document.getElementById("tabelaSuporte");

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function load() {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Carregando…</td></tr>`;
    try {
      const { tickets } = await window.ApiAdmin.tickets();
      if (!tickets.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b717b;">Nenhum ticket aberto.</td></tr>`;
        return;
      }
      tbody.innerHTML = tickets.map(t => `
        <tr>
          <td><strong>${escapeHtml(String(t.id).slice(0, 10))}</strong></td>
          <td>${escapeHtml(t.cliente?.name ?? "—")}</td>
          <td>${escapeHtml(t.subject)}</td>
          <td>${new Date(t.created_at).toLocaleDateString("pt-BR")}</td>
          <td><span class="badge badge-${t.status === "open" ? "pendente" : "aprovado"}">${t.status === "open" ? "Aguardando" : "Respondido"}</span></td>
          <td><button class="btn-action" data-id="${escapeHtml(t.id)}" data-act="reply">Responder</button></td>
        </tr>
      `).join("");
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b3263e;">Erro: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act='reply']");
    if (!btn) return;
    const text = await adminReplyDialog();
    if (!text) return;
    btn.disabled = true;
    try {
      await window.ApiAdmin.ticketReply(btn.dataset.id, text);
      adminNotify("Resposta enviada.");
      await load();
    } catch (err) { adminNotify("Não foi possível enviar: " + err.message); }
    finally { btn.disabled=false; }
  });

  await load();
})();
