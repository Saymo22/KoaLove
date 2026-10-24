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
        <h1 class="page-title">Atendimento ao Cliente</h1>
        <p class="page-desc">Responda às dúvidas, problemas técnicos e sugestões.</p>

        <div class="table-container">
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
        </div>
    </main>
    <div id="toastContainer" class="toast-container"></div>







</body>
</html>
