<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/admin-login-premium.css","resources/js/entries/admin-login.js"])
</head>
<body class="admin-access">
    @include('partials.noscript')
    <main class="split-layout">
        <section class="brand-side" aria-label="KoaLove Administração">
            <div class="brand-content">
                <a href="../home.html"><img class="brand-wordmark" src="/branding/koalove-logo-admin.svg" width="210" height="74" alt="KoaLove"></a>
                <p class="brand-eyebrow">Administração premium</p>
                <h1 class="brand-title">Sua jornada<br>começa aqui.</h1>
                <p class="brand-desc">Gerencie seus planos, acompanhe resultados e cuide de cada história em um espaço pensado para você.</p>
            </div>
            <div class="decor-lines" aria-hidden="true"><span></span><span></span><span></span></div>
        </section>
        <section class="form-side" aria-label="Acesso ao painel">
            <div class="form-container">
                <a class="form-logo" href="../home.html" aria-label="KoaLove — voltar ao site"><img src="/branding/koalove-simbolo-principal.svg" width="58" height="58" alt=""></a>
                <div id="loginPane" class="pane active">
                    <h2 class="form-title" id="loginTitle">Bem-vindo de volta.</h2>
                    <p class="form-sub">Entre com sua conta de administrador para continuar.</p>
                    <div id="erro" class="msg-box" role="alert"></div>
                    <form id="loginForm" aria-labelledby="loginTitle">
                        <div class="input-group"><input id="email" name="email" type="email" placeholder=" " autocomplete="username" maxlength="254" required><label for="email">E-mail de administrador</label></div>
                        <div class="input-group"><input id="senha" name="password" type="password" placeholder=" " autocomplete="current-password" required><label for="senha">Sua senha</label><button class="toggle-pass" id="togglePassword" type="button" aria-label="Mostrar senha" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
                        <div class="form-options"><button class="link-btn" id="showRecovery" type="button">Esqueceu sua senha?</button></div>
                        <button class="btn-submit" id="btnLogin" type="submit"><span class="btn-text">Entrar no painel →</span><span class="spinner" aria-hidden="true"></span></button>
                    </form>
                </div>
                <div id="recoveryPane" class="pane active" hidden>
                    <h2 class="form-title" id="recoveryTitle" tabindex="-1">Recupere seu acesso.</h2>
                    <p class="form-sub">Enviaremos as instruções de recuperação para o seu e-mail.</p>
                    <div id="recoveryMessage" class="msg-box" role="status"></div>
                    <form id="recoveryForm" aria-labelledby="recoveryTitle">
                        <div class="input-group"><input id="recoveryEmail" type="email" placeholder=" " autocomplete="email" maxlength="254" required><label for="recoveryEmail">Seu e-mail</label></div>
                        <button class="btn-submit" type="submit"><span class="btn-text">Enviar instruções</span><span class="spinner" aria-hidden="true"></span></button>
                    </form>
                    <div class="form-footer"><button id="backToLogin" type="button">← Voltar para o login</button></div>
                </div>
                <div class="form-footer"><a href="../home.html">← Voltar para o site</a><small>Acesso exclusivo a administradores autorizados.<br>KoaLove · Cada história merece cuidado.</small></div>
            </div>
        </section>
    </main>
</body>
</html>
