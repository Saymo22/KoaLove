<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/admin.css","resources/css/pages/admin-login-extracted.css","resources/js/entries/admin-login.js"])
</head>
<body class="admin-login-body">
    @include('partials.noscript')
    <section class="admin-login-story" aria-label="Nosso Amor Administração">
        <a href="../home.html" class="admin-logo"><span class="admin-monogram">na.</span><span><span class="admin-brand-name">Nosso Amor</span><span class="admin-brand-caption">Administração</span></span></a>
        <div class="admin-login-copy"><p class="admin-eyebrow">Por trás de cada presente</p><h1>Cada história<br>merece <em>cuidado.</em></h1><p>Seu espaço para acompanhar o negócio, cuidar dos clientes e criar novas possibilidades.</p></div>
        <span class="admin-login-footer">Histórias reais. Experiências especiais.</span>
    </section>
    <main class="admin-login-area"><div class="admin-login-card">
        <p class="admin-eyebrow">Acesso exclusivo</p><h2>Bem-vindo de volta.</h2><p>Entre com sua conta de administrador para continuar de onde parou.</p>
        <form id="loginForm">
            <label for="email">E-mail de administrador</label><input type="email" id="email" class="admin-input" placeholder="seu@email.com" autocomplete="username" required>
            <label for="senha">Senha</label><input type="password" id="senha" class="admin-input" placeholder="Sua senha" autocomplete="current-password" required>
            <div id="erro" class="migrated-admin-login-0" role="alert"></div>
            <button type="submit" class="btn-admin-login">Entrar no painel <span aria-hidden="true">→</span></button>
        </form>
        <a class="admin-login-back" href="../home.html">← Voltar para o site</a><div class="admin-login-note">Área restrita a administradores autorizados.<br>Use suas credenciais pessoais para acessar.</div>
    </div></main>
</body>
</html>
