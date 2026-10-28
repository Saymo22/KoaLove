<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/login.css","resources/js/entries/login.js"])
</head>
<body>
    @include('partials.noscript')

    <!-- Cursor customizado -->
    <div class="cursor" id="cursor"></div>

    <!-- Fundo 3D com palavras e Aurora -->
    <div class="world" id="world" aria-hidden="true">
        <div class="world__aurora"></div>
        <div class="world__aurora world__aurora--rose"></div>
        <div class="world__layer" id="layerBack"></div>
        <div class="world__layer" id="layerMid"></div>
        <div class="world__layer" id="layerFront"></div>
        <div class="world__stardust" id="stardust"></div>
        <div class="world__grain"></div>
    </div>

    <div id="navbar"></div>

    <main class="experience">

        <!-- LADO ESQUERDO: EDITORIAL -->
        <section class="editorial">
            <div class="editorial__content">
                <p class="editorial__eyebrow">Bem-vindo à eternidade</p>
                <h1 class="editorial__title">
                    <span class="editorial__line">Onde o</span>
                    <span class="editorial__line"><em>amor</em> se</span>
                    <span class="editorial__line">eterniza.</span>
                </h1>
                <p class="editorial__desc">
                    Transforme memórias em um legado visual. Um espaço feito para os apaixonados que acreditam que o "para sempre" existe.
                </p>
            </div>
            <div class="editorial__footer">
                <span>✦</span> Design exclusivo para o seu amor
            </div>
        </section>

        <!-- CONEXÃO CENTRAL (Golden Thread) -->
        <div class="golden-thread" aria-hidden="true">
            <div class="thread-line thread-line--top"></div>
            <div class="thread-orb">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2L15 12L12 22L9 12L12 2Z"/>
                </svg>
            </div>
            <div class="thread-line thread-line--bottom"></div>
        </div>

        <!-- LADO DIREITO: FORMULÁRIO EM VIDRO -->
        <section class="portal">
            <article class="glass-card">
                <div class="glass-card__reflection"></div>

                <!-- Tabs Minimalistas -->
                <nav class="glass-tabs">
                    <button class="glass-tab is-active" data-mode="login" type="button">Entrar</button>
                    <button class="glass-tab" data-mode="register" type="button">Criar conta</button>
                    <span class="glass-tabs__indicator"></span>
                </nav>

                <header class="glass-header">
                    <h2 class="glass-title" id="title">Que bom te ver</h2>
                    <p class="glass-sub" id="sub">Sua história continua de onde parou.</p>

                    <!-- Novo: Prova Social (Estrelas) -->
                    <div class="glass-rating">
                        <span class="stars">★★★★★</span>
                        <span>Avaliado por 5.000+ casais</span>
                    </div>
                </header>

                <form class="glass-form" id="form" novalidate>

                    <div class="gfield is-hidden" id="fieldName">
                        <input type="text" id="inputName" placeholder=" " autocomplete="name" disabled>
                        <label for="inputName">Seu nome</label>
                        <span class="gfield__border"></span>
                    </div>

                    <div class="gfield" id="fieldEmail">
                        <input type="email" id="inputEmail" placeholder=" " autocomplete="email" required>
                        <label for="inputEmail">Seu e-mail</label>
                        <span class="gfield__border"></span>
                    </div>

                    <div class="gfield" id="fieldPass">
                        <input type="password" id="inputPass" placeholder=" " autocomplete="current-password" required minlength="8">
                        <label for="inputPass">Sua senha</label>
                        <span class="gfield__border"></span>
                        <button type="button" class="gfield__peek" id="peek" aria-label="Mostrar senha">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>

                        <!-- Novo: Esqueceu a senha -->
                        <a href="#recuperar" id="forgotPassword" class="gfield__forgot">Esqueceu a senha?</a>
                    </div>

                    <div class="gfield" id="fieldConfirm" hidden>
                        <input type="password" id="confirmPass" placeholder=" " autocomplete="new-password" disabled>
                        <label for="confirmPass">Confirme a nova senha</label><span class="gfield__border"></span>
                    </div>
                    <p class="glass-error" id="erro" role="alert" aria-live="polite"></p>

                    <button type="submit" class="btn-magnetic" id="seal">
                        <span class="btn-magnetic__bg"></span>
                        <span class="btn-magnetic__text" id="sealText">Entrar</span>
                        <span class="btn-magnetic__spinner"></span>
                    </button>
                    <a href="#entrar" class="gfield__forgot" id="recoveryBack" hidden>← Voltar para entrar</a>
                </form>

                <div id="alternateLogin">
                <div class="glass-divider">
                    <span>Outras formas de acesso</span>
                </div>

                <div class="glass-socials">
                    <button type="button" class="g-social" id="btnGoogle" aria-label="Entrar com Google — verificando disponibilidade" disabled aria-describedby="socialStatus">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.077c1.83 0 3.477.635 4.773 1.69l3.486-3.486C18.218.998 15.318 0 12 0 7.355 0 3.318 2.664 1.345 6.555l3.92 3.21z"/><path fill="currentColor" d="M23.909 12.273c0-.818-.068-1.609-.195-2.373H12v4.582h6.691a5.724 5.724 0 0 1-2.482 3.755v3.118h4.018c2.35-2.164 3.682-5.345 3.682-9.082z"/><path fill="currentColor" d="M5.266 14.235a7.077 7.077 0 0 1 0-4.47L1.345 6.555A11.99 11.99 0 0 0 0 12c0 1.936.464 3.764 1.345 5.445l3.92-3.21z"/><path fill="currentColor" d="M12 24c3.318 0 6.109-1.09 8.145-2.973l-4.018-3.118c-1.118.75-2.545 1.2-4.127 1.2-3.164 0-5.845-2.136-6.8-5.009L1.28 17.31C3.245 21.273 7.318 24 12 24z"/></svg>
                    </button>
                    <button type="button" class="g-social" id="btnApple" aria-label="Apple — indisponível" disabled aria-describedby="socialStatus">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.73 3.6-.8 1.66-.07 2.93.6 3.76 1.68-3.35 1.87-2.75 6.44.4 7.81-.55 1.56-1.38 2.87-2.84 3.48zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    </button>
                </div>

                <p class="social-status" id="socialStatus">Verificando disponibilidade do login Google. Apple ainda não está disponível.</p>

                </div>
                <footer class="glass-footer">
                    <p class="glass-footer__quote">"O amor é a única loucura digna de ser vivida."</p>
                    <p>Ao continuar, você concorda com nossos <a href="termos.html">Termos</a> e <a href="privacidade.html">Privacidade</a>.</p>
                </footer>
            </article>
        </section>
    </main>







</body>
</html>
