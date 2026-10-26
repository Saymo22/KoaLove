<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/css/admin-premium.css","resources/js/entries/admin-dashboard.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <div class="admin-page-heading">
            <div><p class="admin-eyebrow">Painel de controle</p><h1 class="page-title">Visão geral</h1><p class="page-desc">Resultados, movimentações e prioridades do seu negócio.</p></div>
            <button id="refreshDashboard" type="button" class="admin-primary-link">Atualizar dados ↻</button>
        </div>
        <p id="dashboardStatus" class="dashboard-status" role="status"></p>
        <div class="metrics-grid" aria-label="Resumo do negócio">
            <div class="metric-card primary"><div class="metric-header"><span class="metric-title">Receita total</span><span class="metric-icon" data-admin-icon="receita" aria-hidden="true"></span></div><div class="metric-value" id="metricReceita">—</div><div class="metric-trend">Compras aprovadas</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Compras realizadas</span><span class="metric-icon" data-admin-icon="compras" aria-hidden="true"></span></div><div class="metric-value" id="metricCompras">—</div><div class="metric-trend">Presentes com pagamento confirmado</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Reembolsos pendentes</span><span class="metric-icon" data-admin-icon="reembolsos" aria-hidden="true"></span></div><div class="metric-value" id="metricReembolsos">—</div><div class="metric-trend">Solicitações para analisar</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Atendimentos abertos</span><span class="metric-icon" data-admin-icon="suporte" aria-hidden="true"></span></div><div class="metric-value" id="metricTickets">—</div><div class="metric-trend">Clientes aguardando uma resposta</div></div>
        </div>
        <div class="dashboard-panels">
            <section class="recent-panel" aria-labelledby="transactionsTitle"><p class="admin-eyebrow">Movimentações</p><h3 id="transactionsTitle">Movimentações recentes</h3><p>Os pagamentos aprovados mais recentes.</p><div class="recent-list" id="recentList" aria-live="polite">Carregando transações…</div></section>
            <section class="recent-panel" aria-labelledby="pixTitle"><p class="admin-eyebrow">Conferência manual</p><h3 id="pixTitle">Pix para conferir</h3><p>Confirme o crédito no banco antes de liberar o presente. Um comprovante sozinho não confirma o recebimento.</p><div class="recent-list" id="pendingPixList" aria-live="polite">Carregando solicitações…</div></section>
        </div>
    </main>
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>
</body>
</html>
