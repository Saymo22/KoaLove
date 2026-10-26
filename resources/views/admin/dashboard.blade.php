<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/js/entries/admin-dashboard.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <h1 class="page-title">Visão Geral</h1>
        <p class="page-desc">Dados em tempo real extraídos diretamente do banco de dados local.</p>

        <div class="metrics-grid">
            <div class="metric-card primary">
                <div class="metric-header">
                    <span class="metric-title">Receita Total</span>
                    <div class="metric-icon">💰</div>
                </div>
                <div class="metric-value" id="metricReceita">R$ 0,00</div>
                <div class="metric-trend">Baseado em compras aprovadas</div>
            </div>

            <div class="metric-card success">
                <div class="metric-header">
                    <span class="metric-title">Compras Realizadas</span>
                    <div class="metric-icon">💳</div>
                </div>
                <div class="metric-value" id="metricCompras">0</div>
                <div class="metric-trend">Total de links gerados</div>
            </div>

            <div class="metric-card warning">
                <div class="metric-header">
                    <span class="metric-title">Reembolsos Pendentes</span>
                    <div class="metric-icon">💸</div>
                </div>
                <div class="metric-value" id="metricReembolsos">3</div>
                <div class="metric-trend down">Aguardando análise</div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Tickets em Aberto</span>
                    <div class="metric-icon">🎧</div>
                </div>
                <div class="metric-value" id="metricTickets">7</div>
                <div class="metric-trend down">Aguardando resposta</div>
            </div>
        </div>

        <div class="recent-panel">
            <h3>Últimas Transações</h3>
            <div class="recent-list" id="recentList">
                <!-- Injetado via JS -->
            </div>
        </div>
    </main>

    <div id="toastContainer" class="toast-container"></div>








</body>
</html>
