<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin — Nosso Amor</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/css/pages/admin-login-extracted.css","resources/js/entries/admin-login.js"])
</head>
<body class="admin-login-body">

    <div class="admin-login-card">
        <a href="#" class="admin-logo">Nosso Amor<span>ADMIN</span></a>
        <h2>Acesso Restrito</h2>

        <form id="loginForm">
            <input type="email" id="email" class="admin-input" placeholder="E-mail de Administrador" required>
            <input type="password" id="senha" class="admin-input" placeholder="Senha" required>
            <div id="erro" class="migrated-admin-login-0"></div>
            <button type="submit" class="btn-admin-login">Entrar no Painel</button>
        </form>
    </div>






</body>
</html>
