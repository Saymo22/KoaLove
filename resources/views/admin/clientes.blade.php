<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clientes — Admin</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/css/pages/admin-clientes-extracted.css","resources/js/entries/admin-clientes.js"])
</head>
<body class="admin-body">
    <header id="adminHeader"></header>
    <main class="admin-main">
        <h1 class="page-title">Clientes</h1>
        <p class="page-desc">Todos os clientes cadastrados, com compras, tickets e reembolsos associados.</p>

        <div class="table-container">
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
        </div>

        <div id="clientDetailPanel" class="migrated-admin-clientes-0"></div>
    </main>
    <div id="toastContainer" class="toast-container"></div>







</body>
</html>
