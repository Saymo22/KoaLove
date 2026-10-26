<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/js/entries/admin-reembolsos.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <p class="admin-eyebrow">Cuidado e confiança</p><h1 class="page-title">Reembolsos, com atenção.</h1><p class="page-desc">Analise cada solicitação e acompanhe o andamento das devoluções.</p>

        <section class="table-container" aria-label="Solicitações de reembolso"><div class="admin-table-heading"><div><h2>Solicitações de reembolso</h2><p>Consulte os motivos e registre sua decisão com segurança.</p></div><span data-admin-icon="reembolsos" aria-hidden="true"></span></div><div class="admin-table-scroll" role="region" aria-label="Solicitações de reembolso" tabindex="0">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID do Pedido</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Motivo</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaReembolsos"></tbody>
            </table>
        </div></section>
    </main>
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>







</body>
</html>
