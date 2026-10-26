<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/js/entries/admin-suporte.js"])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main">
        <p class="admin-eyebrow">Sempre por perto</p><h1 class="page-title">Um bom atendimento importa.</h1><p class="page-desc">Acompanhe as conversas e ajude cada cliente a criar uma experiência especial.</p>

        <section class="table-container" aria-label="Central de atendimento"><div class="admin-table-heading"><div><h2>Central de atendimento</h2><p>Dúvidas, sugestões e pedidos de ajuda em um só lugar.</p></div><span data-admin-icon="suporte" aria-hidden="true"></span></div><div class="admin-table-scroll" role="region" aria-label="Central de atendimento" tabindex="0">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID Ticket</th>
                        <th>Cliente</th>
                        <th>Assunto</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody id="tabelaSuporte"></tbody>
            </table>
        </div></section>
    </main>
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>







</body>
</html>
