(async () => {
  if (!(await protegerRotaAdmin())) return;
  renderAdminHeader("dashboard");

  const fmt = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (id) => document.getElementById(id);

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function loadPix() {
    const list = $('pendingPixList');
    try {
      const {purchases} = await window.ApiAdmin.purchases();
      const pending = purchases.filter(p => p.status === 'pending' && !p.deleted && p.checkout?.provider === 'pix_manual');
      list.replaceChildren();
      if (!pending.length) { list.textContent = 'Nenhum Pix aguardando conferência.'; return; }
      for (const p of pending) {
        const item = document.createElement('div'); item.className = 'recent-item pix-review';
        const info = document.createElement('div'); info.className = 'recent-info';
        const title = document.createElement('b'); title.textContent = `${p.cliente?.name || 'Cliente'} — ${fmt(p.checkout.amount_cents)}`;
        const detail = document.createElement('span'); detail.textContent = `Pedido ${p.id} • Referência Pix ${(p.checkout.pix?.txid || '—')}`;
        const bank = document.createElement('input'); bank.placeholder = 'ID da transação recebida (EndToEndId)'; bank.setAttribute('aria-label', 'ID da transação recebida no banco'); bank.maxLength = 64;
        const button = document.createElement('button'); button.type = 'button'; button.className = 'btn-action'; button.textContent = 'Confirmar recebimento e liberar';
        const feedback = document.createElement('span'); feedback.setAttribute('role','status');
        button.addEventListener('click', async () => {
          const reference = bank.value.trim();
          if (!/^[A-Za-z0-9-]{8,64}$/.test(reference)) { feedback.textContent = 'Informe o identificador da transação no extrato.'; bank.focus(); return; }
          if (!confirm(`Confirme somente se recebeu ${fmt(p.checkout.amount_cents)} no banco para o pedido ${p.id}. Já conferiu o crédito e o pagador?`)) return;
          button.disabled = true;
          try { await window.ApiAdmin.confirmPix(p.id,p.checkout.amount_cents,reference); await Promise.all([loadPix(), loadSummary()]); }
          catch (err) { feedback.textContent = err.message; button.disabled = false; }
        });
        info.append(title,detail,bank,feedback); item.append(info,button); list.append(item);
      }
    } catch (err) { list.textContent = 'Não foi possível carregar os Pix: ' + err.message; }
  }
  async function loadSummary() {
    try {
      const { kpis, recentes } = await window.ApiAdmin.summary();

      $("metricReceita").textContent = fmt(kpis.receita_cents);
      $("metricCompras").textContent = kpis.compras;
      $("metricReembolsos").textContent = kpis.reembolsos_pendentes;
      $("metricTickets").textContent = kpis.tickets_abertos;

      const list = $("recentList");
      if (!recentes.length) {
        list.innerHTML = `<p class="dashboard-empty">Nenhuma transação registrada.</p>`;
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
      $("metricReceita").textContent = "—";
      $("metricCompras").textContent = "—";
      $("metricReembolsos").textContent = "—";
      $("metricTickets").textContent = "—";
      $("recentList").textContent = "Não foi possível carregar métricas: " + err.message;
    }
  }
  async function refresh() {
    const button = $('refreshDashboard');
    button.disabled = true; button.setAttribute('aria-busy', 'true');
    $('dashboardStatus').textContent = 'Consultando os dados do servidor…';
    try { await Promise.all([loadPix(), loadSummary()]); }
    finally { button.disabled = false; button.setAttribute('aria-busy', 'false'); $('dashboardStatus').textContent = ''; }
  }
  $('refreshDashboard').addEventListener('click', refresh);
  await refresh();
})();
