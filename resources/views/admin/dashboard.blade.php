<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/js/entries/admin-dashboard.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <div class="admin-page-heading">
            <div><p class="admin-eyebrow">Seu negócio, de perto</p><h1 class="page-title">Boas histórias começam aqui.</h1><p class="page-desc">Uma visão clara dos seus resultados e do que precisa da sua atenção.</p></div>
            <a href="planos.html" class="admin-primary-link">Gerenciar planos <span aria-hidden="true">↗</span></a>
        </div>
        <div class="metrics-grid" aria-label="Resumo do negócio">
            <div class="metric-card primary"><div class="metric-header"><span class="metric-title">Receita total</span><span class="metric-icon" data-admin-icon="receita" aria-hidden="true"></span></div><div class="metric-value" id="metricReceita">—</div><div class="metric-trend">Compras aprovadas</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Compras realizadas</span><span class="metric-icon" data-admin-icon="compras" aria-hidden="true"></span></div><div class="metric-value" id="metricCompras">—</div><div class="metric-trend">Presentes com pagamento confirmado</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Reembolsos pendentes</span><span class="metric-icon" data-admin-icon="reembolsos" aria-hidden="true"></span></div><div class="metric-value" id="metricReembolsos">—</div><div class="metric-trend">Solicitações para analisar</div></div>
            <div class="metric-card"><div class="metric-header"><span class="metric-title">Atendimentos abertos</span><span class="metric-icon" data-admin-icon="suporte" aria-hidden="true"></span></div><div class="metric-value" id="metricTickets">—</div><div class="metric-trend">Clientes aguardando uma resposta</div></div>
        </div>
        <div class="admin-section-heading"><h2>Seu próximo passo</h2><span>Acesso rápido</span></div>
        <div class="admin-shortcuts">
            <a class="admin-shortcut" href="clientes.html"><span data-admin-icon="clientes" aria-hidden="true"></span><div><strong>Conheça seus clientes</strong><small>Contas, pedidos e histórico</small></div><span aria-hidden="true">↗</span></a>
            <a class="admin-shortcut" href="planos.html"><span data-admin-icon="planos" aria-hidden="true"></span><div><strong>Cuide da sua vitrine</strong><small>Planos, promoções e cupons</small></div><span aria-hidden="true">↗</span></a>
            <a class="admin-shortcut" href="suporte.html"><span data-admin-icon="suporte" aria-hidden="true"></span><div><strong>Esteja por perto</strong><small>Responda aos atendimentos</small></div><span aria-hidden="true">↗</span></a>
        </div>
        <div class="admin-section-heading"><h2>Acompanhe a operação</h2><span>Atividade recente</span></div>
        <div class="dashboard-panels">
            <section class="recent-panel" aria-labelledby="transactionsTitle"><p class="admin-eyebrow">Movimentações</p><h3 id="transactionsTitle">Últimas transações</h3><p>Os pagamentos aprovados mais recentes.</p><div class="recent-list" id="recentList" aria-live="polite">Carregando transações…</div></section>
            <section class="recent-panel" aria-labelledby="pixTitle"><p class="admin-eyebrow">Conferência manual</p><h3 id="pixTitle">Pix para conferir</h3><p>Confirme o crédito no banco antes de liberar o presente. Um comprovante sozinho não confirma o recebimento.</p><div class="recent-list" id="pendingPixList" aria-live="polite">Carregando solicitações…</div></section>
        </div>
    </main>
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>
</body>
</html>
