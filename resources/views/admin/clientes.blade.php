<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/css/pages/admin-clientes-extracted.css","resources/js/entries/admin-clientes.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <p class="admin-eyebrow">Relacionamentos</p><h1 class="page-title">Cada cliente, uma história.</h1><p class="page-desc">Encontre as contas e acompanhe cada pedido, atendimento e solicitação.</p>

        <section class="table-container" aria-label="Diretório de clientes"><div class="admin-table-heading"><div><h2>Diretório de clientes</h2><p>O histórico completo de quem escolheu o KoaLove.</p></div><span data-admin-icon="clientes" aria-hidden="true"></span></div><div class="admin-table-scroll" role="region" aria-label="Diretório de clientes" tabindex="0">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>E-mail</th>
                        <th>Cliente desde</th>
                        <th>Compras</th>
                        <th>Total gasto</th>
                        <th>Tickets</th>
                        <th>Reembolsos</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody id="tabelaClientes"></tbody>
            </table>
        </div></section>

        <div id="clientDetailPanel" class="migrated-admin-clientes-0"></div>
    </main>
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>







</body>
</html>
