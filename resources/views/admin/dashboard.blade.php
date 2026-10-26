<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">@include('partials.seo')<meta name="csrf-token" content="{{ csrf_token() }}"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">@vite(['resources/css/admin-workspace.css','resources/js/entries/admin-dashboard.js'])</head><body class="admin-workspace workspace-pending">@include('partials.noscript')
<div id="workspaceLoading" class="workspace-loading" role="status">Carregando painel…</div>
<div class="app" id="app" inert>
  <button class="workspace-backdrop" type="button" aria-label="Fechar menu"></button><aside id="workspaceSidebar" class="sidebar" aria-label="Navegação principal">
    <div class="brand">
      <div><img class="workspace-logo" src="/branding/koalove-logo-admin.svg" width="200" height="70" alt="KoaLove"><div class="brand-sub">Painel Premium</div></div>
    </div>

    <nav class="nav" id="nav">
      <div class="nav-label">Principal</div>
      <button class="nav-item active" data-view="overview">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
        <span>Visão geral</span><span class="nav-badge" id="badgePix"></span>
      </button>
      <button class="nav-item" data-view="clients">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Clientes</span>
      </button>
      <button class="nav-item" data-view="plans">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.2"/></svg>
        <span>Planos e descontos</span>
      </button>
      <button class="nav-item" data-view="refunds">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
        <span>Reembolso</span><span class="nav-badge" id="badgeRefund"></span>
      </button>
      <button class="nav-item" data-view="support">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
        <span>Atendimento</span><span class="nav-badge" id="badgeTickets"></span>
      </button>
      <div class="nav-label">Sistema</div>
      <button class="nav-item" data-view="themes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.3"/><circle cx="17.5" cy="10.5" r="1.3"/><circle cx="8.5" cy="7.5" r="1.3"/><circle cx="6.5" cy="12.5" r="1.3"/><path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8Z"/></svg>
        <span>Configuração de Temas</span>
      </button>
      <button class="nav-item" data-view="activity">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <span>Registro de atividades</span>
      </button>
    </nav>

    <div class="sidebar-foot">
      <div class="user-chip">
        <img class="avatar" src="/branding/koalove-simbolo-sobre-rose.svg" width="44" height="44" alt="">
        <div><div class="u-name" id="uName"></div><div class="u-role" id="uRole"></div></div>
      </div>
      <button class="logout" id="logoutBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        <span>Sair do painel</span>
      </button>
    </div>
  </aside>

  <main class="main">
    <header class="topbar">
      <div><h1 id="topTitle">Visão geral</h1><p id="topSub">Resumo estratégico do seu negócio</p></div>

      <div class="search-wrap">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="text" id="gSearch" placeholder="Buscar cliente, pedido, cupom…" autocomplete="off" aria-label="Busca global">
          <span class="kbd">Ctrl K</span>
        </div>
        <div class="sresults" id="sResults"></div>
      </div>

      <button class="icon-btn mobile-menu" id="mobileMenu" aria-label="Abrir menu" aria-expanded="false">☰</button><button class="icon-btn" id="btnTheme" title="Alternar modo escuro" aria-label="Alternar modo escuro"></button>

      <div class="dropdown-wrap">
        <button class="icon-btn" id="btnNotif" title="Notificações" aria-label="Notificações">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span class="workspace-inline-1 dot" id="notifDot"></span>
        </button>
        <div class="dropdown" id="ddNotif">
          <div class="dd-head"><h4>Notificações</h4><button data-command="markNotifRead()">Marcar lidas</button></div>
          <div class="dd-list" id="notifList"></div>
        </div>
      </div>

      <button class="icon-btn" id="btnConfig" title="Configurações" aria-label="Configurações">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
      </button>
    </header>

    <div class="banner" id="maintBanner">🛠 Modo de manutenção ativo — os clientes estão temporariamente bloqueados. <button class="workspace-inline-2 btn sm ghost" data-command="setSetting('maintenance',false)">Desativar</button></div>

    <div class="content" id="content">

      <!-- VISÃO GERAL -->
      <section class="view active" id="view-overview">
        <div class="view-head">
          <div><h2>Visão geral</h2><p>Resumo estratégico do seu negócio em tempo real</p></div>
          <div class="grow"></div>
          <button class="btn ghost" data-command="exportLedger()">⬇ Exportar movimentações</button>
        </div>

        <div class="grid stats" id="statsGrid"></div>

        <div class="workspace-inline-3 grid">
          <div class="card panel">
            <div class="panel-head"><h3>Movimentações</h3><button class="link-btn" data-command="exportLedger()">Exportar CSV →</button></div>
            <div class="movs" id="movList"></div>
          </div>
          <div class="card panel">
            <div class="panel-head">
              <div><h3>Conferência manual de PIX</h3><div class="sub" id="pixCount">0 pendentes</div></div>
              <div class="workspace-inline-4">
                <div class="tabs" id="pixTabs"></div>
                <button class="btn ok sm" id="pixAllBtn" data-command="confirmAllPix()">✓ Confirmar todos</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Cliente</th><th>Valor</th><th>Pedido / referência</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody id="pixBody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- CLIENTES -->
      <section class="view" id="view-clients">
        <div class="view-head">
          <div><h2>Diretório de clientes</h2><p>Gerencie sua base e acompanhe o histórico individual</p></div>
          <div class="grow"></div>
          <button class="btn ghost" data-command="exportClients()">⬇ Exportar CSV</button>
        </div>
        <div class="card panel">
          <div class="toolbar">
            <div class="tinput">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input id="clientQ" placeholder="Filtrar por nome, e-mail ou ID" >
            </div>
            <div class="tabs" id="clientTabs"></div>
          </div>
          <div class="table-wrap">
            <table>
              <thead id="clientsHead"></thead>
              <tbody id="clientsBody"></tbody>
            </table>
          </div>
          <div class="pager" id="clientsPager"></div>
        </div>
      </section>

      <!-- PLANOS -->
      <section class="view" id="view-plans">
        <div class="view-head">
          <div><h2>Planos, descontos e cupons</h2><p>Crie, edite e destaque suas ofertas</p></div>
          <div class="grow"></div>
          <button class="btn primary" data-command="openCreateMenu()">+ Criar novo</button>
        </div>

        <div class="workspace-inline-5 panel-head"><div><h3 class="workspace-inline-6">Planos</h3><div class="sub">Clique em "Editar" para gerenciar detalhes, destaque e status</div></div></div>
        <div class="plans-list" id="plansList"></div>

        <div class="workspace-inline-7 panel-head">
          <div><h3 class="workspace-inline-8">Promoções &amp; temporizador</h3><div class="sub">Contagem regressiva em tempo real</div></div>
          <button class="btn ghost" data-command="openPromoForm()">+ Nova promoção</button>
        </div>
        <div class="card panel">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Promoção</th><th>Plano</th><th>Desconto</th><th>Início</th><th>Fim</th><th>Temporizador</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody id="promoBody"></tbody>
            </table>
          </div>
        </div>

        <div class="workspace-inline-9 panel-head">
          <div><h3 class="workspace-inline-10">Cupons</h3><div class="sub">Códigos promocionais com limite de uso e validade</div></div>
          <button class="btn ghost" data-command="openCouponForm()">+ Novo cupom</button>
        </div>
        <div class="card panel">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Código</th><th>Plano</th><th>Desconto</th><th>Validade</th><th>Uso</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody id="couponBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- REEMBOLSO -->
      <section class="view" id="view-refunds">
        <div class="view-head">
          <div><h2>Solicitações de reembolso</h2><p>Analise, aprove ou recuse com registro da decisão</p></div>
          <div class="grow"></div>
          <button class="btn ghost" data-command="exportRefunds()">⬇ Exportar CSV</button>
        </div>
        <div class="card panel">
          <div class="toolbar"><div class="tabs" id="refundTabs"></div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID do Pedido</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Motivo</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody id="refundBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ATENDIMENTO -->
      <section class="view" id="view-support">
        <div class="view-head">
          <div><h2>Central de atendimento</h2><p>Converse com seus clientes e controle prioridade e status</p></div>
          <div class="grow"></div>
        </div>
        <div class="card panel">
          <div class="toolbar"><div class="tabs" id="ticketTabs"></div></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID Ticket</th><th>Cliente</th><th>Assunto</th><th>Data</th><th>Prioridade</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody id="ticketBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TEMAS -->
      <section class="view" id="view-themes">
        <div class="view-head">
          <div><h2>Configuração de temas</h2><p>Ative ou desative os temas visuais do site</p></div>
        </div>
        <div class="theme-grid" id="themeGrid"></div>
      </section>

      <!-- ATIVIDADE -->
      <section class="view" id="view-activity">
        <div class="view-head">
          <div><h2>Registro de atividades</h2><p>Tudo o que foi feito no painel, para auditoria</p></div>
          <div class="grow"></div>
          <button class="btn ghost" data-command="exportLogs()">⬇ Exportar CSV</button>
          <button class="btn no" data-command="clearLogs()">Limpar registro</button>
        </div>
        <div class="card panel">
          <div class="toolbar"><div class="tabs" id="logTabs"></div></div>
          <div class="timeline" id="logList"></div>
        </div>
      </section>

    </div>
  </main>
</div>

<div class="overlay" id="overlay" aria-hidden="true"><div class="modal" id="modal" role="dialog" aria-modal="true"></div></div>
<div class="overlay confirm" id="cOverlay" aria-hidden="true"><div class="modal sm" id="cBox" role="alertdialog" aria-modal="true"></div></div>
<div class="toasts" id="toasts" aria-live="polite"></div>


</body></html>