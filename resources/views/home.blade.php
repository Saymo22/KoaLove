<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/home.css","resources/css/pages/home-extracted.css","resources/js/entries/home.js"])
</head>
<body>
    @include('partials.noscript')

    <div class="scroll-progress" id="scrollProgress"></div>

    <div class="migrated-home-0 heart">♥</div>
    <div class="migrated-home-1 heart">♡</div>
    <div class="migrated-home-2 heart">♥</div>
    <div class="migrated-home-3 heart">♡</div>
    <div class="migrated-home-4 heart">♥</div>

    <!-- ✅ NAVBAR INJETADA AQUI -->
    <div id="navbar"></div>

    <!-- HERO -->
    <header class="hero-home">
                <!-- Efeitos de Fundo: Palavras e Bolinhas -->
        <div class="hero-bg-effects" aria-hidden="true">
            <div class="hero-layer" id="heroLayerBack"></div>
            <div class="hero-layer" id="heroLayerMid"></div>
            <div class="hero-layer" id="heroLayerFront"></div>
            <div class="hero-stardust" id="heroStardust"></div>
        </div>
        <div class="hero-deco" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="wrap">
            <div>
                <div class="selo stagger">Presente digital exclusivo</div>
                <h1 class="stagger">
                    Uma história de amor<br>em <em class="shimmer-gold">uma página</em>
                </h1>
                <p class="lead stagger">Reúna fotos, vídeos, música e uma carta em uma página só dela, dele ou deles. Pronto em poucos minutos, entregue por link ou QR Code.</p>
                <div class="hero-cta stagger">
                    <a href="criar.html" class="b ouro magnetic">Criar meu presente</a>
                    <a href="#temas" class="b sec magnetic">Ver os temas</a>
                </div>
                <div class="hero-nota stagger">Crie sua conta para salvar o presente e acompanhar o pagamento.</div>
                <div class="hero-pontos stagger">
                    <span>Link e QR Code</span>
                    <span>Fotos, vídeos e música</span>
                    <span>Pronto em minutos</span>
                </div>
            </div>
            <div class="stagger">
                <div class="fone-wrap">
                    <div class="fone-glow"></div>
                    <div class="fone-chip chip-qr">
                        <svg viewBox="0 0 9 9" aria-hidden="true"><path fill="#4a1d2e" fill-rule="evenodd" d="M0 0h3v3H0zM1 1v1h1V1zM6 0h3v3H6zM7 1v1h1V1zM0 6h3v3H0zM1 7v1h1V7zM4 0h1v1H4zM4 2h2v1H5V2zM3 4h1v1H3zM5 4h2v1H5zM8 4h1v2H8zM4 6h1v1H4zM6 6h1v1H6zM5 7h1v2H5zM7 8h2v1H7zM4 8h1v1H4z"/></svg>
                        <div><b>Escaneie e abra</b><small>Link e QR Code</small></div>
                    </div>
                    <div class="fone-chip chip-musica">
                        <div class="eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                        <div><b>Nossa música</b><small>Tocando agora</small></div>
                    </div>
                    <div class="fone" id="phoneTilt">
                        <div class="pol-mini p1"><div></div></div>
                        <div class="pol-mini p2"><div></div></div>
                        <div class="fone-tela">
                            <video class="fone-video" autoplay muted loop playsinline preload="metadata" aria-label="Demonstração de um presente digital KoaLove">
                                <source src="{{ asset('media/home-preview.mp4') }}" type="video/mp4">
                                Seu navegador não suporta vídeos. <a href="{{ asset('media/home-preview.mp4') }}">Abra a demonstração em vídeo</a>.
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <a href="#como" class="hero-scroll" aria-label="Ver como funciona"><span>Role</span><i></i></a>
    </header>

    <!-- TRUST BAR -->
    <section class="trust-bar">
        <div class="wrap">
            <p class="trust-label">Aprovado por quem já emocionou alguém</p>
            <div class="trust-logos">
                <div class="trust-avatars" aria-hidden="true">
                    <span>L</span>
                    <span>C</span>
                    <span>R</span>
                    <span>M</span>
                    <span>+</span>
                </div>
                <div class="trust-rating">
                    <div class="stars">★★★★★</div>
                    <p><b>4.9 de 5</b> — 2.400+ avaliações reais</p>
                </div>
            </div>
        </div>
    </section>

    <!-- NÚMEROS -->
    <section class="migrated-home-5 bloco dark">
        <div class="orb orb-ouro orb-1"></div>
        <div class="orb orb-rosa orb-2"></div>
        <div class="wrap">
            <div class="numeros reveal">
                <div class="numero">
                    <div class="numero-icon">♡</div>
                    <strong data-count="4280" data-format="br">0</strong>
                    <span>Presentes criados</span>
                </div>
                <div class="numero">
                    <div class="numero-icon">✦</div>
                    <strong data-count="98" data-suffix="%">0</strong>
                    <span>Recomendam</span>
                </div>
                <div class="numero">
                    <div class="numero-icon">⚡</div>
                    <strong data-count="8" data-suffix="min">0</strong>
                    <span>Tempo médio</span>
                </div>
                <div class="numero">
                    <div class="numero-icon">∞</div>
                    <strong data-count="100" data-suffix="%">0</strong>
                    <span>Para sempre</span>
                </div>
            </div>
        </div>
    </section>

    <!-- COMO FUNCIONA -->
    <section class="bloco alt" id="como">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Simples assim</div>
                <h2 class="mask-reveal"><span>Como <em class="shimmer-gold">funciona</em></span></h2>
                <p>Três passos e o presente está nas mãos de quem você ama.</p>
            </div>
            <div class="passos" id="passosObs">
                <div class="passo-card reveal-left reveal">
                    <div class="passo-ico">🎨</div>
                    <div class="passo-num">1</div>
                    <h3>Escolha e personalize</h3>
                    <p>Escolha o tema, escreva a carta, monte a linha do tempo e envie suas fotos, vídeos e a música de vocês.</p>
                    <span class="passo-tag">Sem complicação</span>
                </div>
                <div class="passo-card reveal reveal-zoom">
                    <div class="passo-ico">💳</div>
                    <div class="passo-num">2</div>
                    <h3>Faça o pagamento</h3>
                    <p>Confira o resumo do pedido e pague. Assim que o pagamento é confirmado, o presente é liberado na hora.</p>
                    <span class="passo-tag">Liberação imediata</span>
                </div>
                <div class="passo-card reveal-right reveal">
                    <div class="passo-ico">💌</div>
                    <div class="passo-num">3</div>
                    <h3>Compartilhe</h3>
                    <p>Receba o link e o QR Code. Mande pelo WhatsApp, imprima em um cartão ou mostre pessoalmente.</p>
                    <span class="passo-tag">Link + QR Code</span>
                </div>
            </div>
        </div>
    </section>

    <!-- VEJA AO VIVO (PREVIEW) -->
    <section class="bloco preview-section">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Prévia real</div>
                <h2 class="mask-reveal"><span>Veja como <em class="shimmer-gold">fica</em></span></h2>
                <p>Uma espiada real no que quem você ama vai receber. Escolha um tema e veja a página ao vivo.</p>
            </div>

            <div class="preview-tabs reveal" id="previewTabs">
                <button class="preview-tab on" data-preview="namoro">💝 Namoro</button>
                <button class="preview-tab" data-preview="casamento">💍 Casamento</button>
                <button class="preview-tab" data-preview="aniversario">🎂 Aniversário</button>
                <button class="preview-tab" data-preview="netflix">🎬 Netflix</button>
            </div>

            <div class="preview-glow" aria-hidden="true"></div>

            <div class="preview-stage reveal reveal-zoom" id="previewStage">
                <div class="preview-browser">
                    <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
                    <div class="url">KoaLove / sua história</div>
                    <div class="live">Ao vivo</div>
                </div>

                <div class="preview-viewport" id="previewViewport">
                    <iframe id="previewIframe" src="ver.html?demo=1&tema=namoro" title="Prévia do presente"></iframe>
                </div>
            </div>

            <p class="migrated-home-6 exemplo-link reveal">
                Quer ver uma página completa? <a href="ver.html?demo=1&tema=namoro" target="_blank">Abra um exemplo pronto</a>.
            </p>
        </div>
    </section>

    <!-- TEMAS -->
    <section class="bloco alt" id="temas">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Escolha o seu</div>
                <h2 class="mask-reveal"><span>Temas para <em class="shimmer-gold">cada ocasião</em></span></h2>
                <p>Cada tema muda as cores, os textos e o estilo da página. Clique para começar já com ele escolhido.</p>
            </div>

            <div class="filtros reveal" id="filtros">
                <button class="filtro on" data-filtro="todos">✨ Todos <span class="cnt" id="cntTodos">0</span></button>
                <button class="filtro" data-filtro="classico">💝 Clássicos <span class="cnt" id="cntClassicos">0</span></button>
                <button class="filtro" data-filtro="especial">🎬 Especiais <span class="cnt" id="cntEspeciais">0</span></button>
            </div>

            <div class="categoria-titulo reveal" id="titClassicos">Temas Clássicos</div>
            <div class="temas-home" id="temasClassicos"></div>

            <div class="categoria-titulo reveal" id="titEspeciais">Temas Exclusivos</div>
            <div class="temas-home" id="temasEspeciais"></div>
        </div>
    </section>

    <!-- DIFERENCIAIS -->
    <section class="bloco">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Por que escolher</div>
                <h2 class="mask-reveal"><span>Feito com <em class="shimmer-gold">cuidado</em></span></h2>
                <p>Cada detalhe pensado para transformar sua história em algo inesquecível.</p>
            </div>
            <div class="difs">
                <div class="dif reveal"><div class="icon">💎</div><h3>Design Premium</h3><p>Temas exclusivos, tipografia fina e animações suaves em cada seção.</p></div>
                <div class="dif reveal"><div class="icon">⚡</div><h3>Pronto em minutos</h3><p>Você preenche e recebe o link na hora. Sem espera, sem burocracia.</p></div>
                <div class="dif reveal"><div class="icon">🔒</div><h3>Privacidade total</h3><p>Só quem tem o link consegue ver. Nada é indexado no Google.</p></div>
                <div class="dif reveal"><div class="icon">🎁</div><h3>Presente atemporal</h3><p>Fica guardado para sempre. Uma surpresa que se renova cada vez que abre.</p></div>
                <div class="dif reveal"><div class="icon">💌</div><h3>Personalização real</h3><p>Seu texto, suas fotos, sua música, sua história do jeito que merece.</p></div>
                <div class="dif reveal"><div class="icon">💛</div><h3>Suporte humano</h3><p>Qualquer dúvida, fale com a gente. Atendimento de verdade, feito por gente.</p></div>
            </div>
        </div>
    </section>

    <!-- DEPOIMENTOS -->
    <section class="bloco alt" id="depoimentos">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Quem já viveu</div>
                <h2 class="mask-reveal"><span>Histórias que <em class="shimmer-gold">emocionaram</em></span></h2>
                <p>Depoimentos reais de quem criou um presente com a gente.</p>
            </div>
            <div class="depoimentos">
                <div class="depo reveal">
                    <div class="depo-stars">★★★★★<span class="depo-verified">Verificado</span></div>
                    <p>Fiz para minha namorada no nosso aniversário de 3 anos. Ela chorou do início ao fim. Cada seção tinha um detalhe nosso. Não tem preço ver a reação dela.</p>
                    <div class="depo-autor">
                        <div class="depo-avatar">L</div>
                        <div class="depo-info"><b>Lucas M.</b><span>Namoro ❤️</span></div>
                    </div>
                </div>
                <div class="depo reveal">
                    <div class="depo-stars">★★★★★<span class="depo-verified">Verificado</span></div>
                    <p>Presenteei meus pais com o tema Família. Eles não sabiam que dava pra fazer algo assim com fotos antigas e a carta. Meu pai ficou sem palavras.</p>
                    <div class="depo-autor">
                        <div class="depo-avatar">C</div>
                        <div class="depo-info"><b>Carolina S.</b><span>Família 🏡</span></div>
                    </div>
                </div>
                <div class="depo reveal">
                    <div class="depo-stars">★★★★★<span class="depo-verified">Verificado</span></div>
                    <p>Usei o tema Vinil pro aniversário de 10 anos de casamento. A trilha sonora tocando junto com o disco girando foi o toque que fez ela se derreter.</p>
                    <div class="depo-autor">
                        <div class="depo-avatar">R</div>
                        <div class="depo-info"><b>Rafael T.</b><span>Casamento 💍</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- PROMO -->
    <section class="migrated-home-7 bloco">
        <div class="wrap">
            <div class="promo reveal reveal-zoom">
                <div class="promo-text">
                    <div class="promo-tag">Do seu jeito</div>
                    <h2>Transforme lembranças<br>em um <em>presente especial</em></h2>
                    <p>Escolha um tema, personalize e confira o resultado antes de continuar.</p>
                </div>
                <div class="promo-side">
                    <div class="promo-preco">
                        <span id="promoLabel">Preço do presente</span>
                        <span class="de" id="promoDe" hidden></span>
                        <span class="por" id="promoPor">Carregando…</span>
                    </div>
                    <div class="promo-countdown" id="promoCountdown" hidden>
                        <span>Oferta termina em</span><strong id="promoClock" aria-label="Tempo restante da promoção"></strong>
                    </div>
                    <a href="criar.html" id="promoLink" class="b ouro magnetic">Criar meu presente</a>
                </div>
            </div>
        </div>
    </section>

    <!-- PREÇO -->
    <section class="bloco alt" id="preco">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Sem assinatura</div>
                <h2 class="mask-reveal"><span><em class="shimmer-gold">Preços</em></span></h2>
                <p>Pagamento único. Sem mensalidade, sem letras miúdas, sem surpresas.</p>
            </div>

            <div class="preco-wrap reveal reveal-zoom" id="pricingCards">
                <div class="preco-box">
                    <div class="preco-badge">Mais escolhido</div>
                    <div class="preco-valor-wrap">
                        <span class="preco-tag">Pagamento único</span>
                        <div class="preco-valor" id="precoValor">
                            <span class="centavos">Consultando preço…</span>
                        </div>
                        <span class="preco-valor-sub">enquanto a conta e o serviço estiverem ativos</span>
                    </div>
                    <ul class="preco-lista">
                        <li>Todos os temas disponíveis (clássicos e especiais)</li>
                        <li>Até 12 fotos, 4 vídeos e 1 música</li>
                        <li>Linha do tempo, carta e contador personalizados</li>
                        <li>Link para compartilhar e QR Code para imprimir</li>
                        <li>Suporte humano por WhatsApp</li>
                    </ul>
                    <a href="criar.html" class="b ouro magnetic">Criar meu presente</a>
                    <a href="reembolso.html" class="preco-garantia">Garantia comercial de 3 dias · antes de abrir o link</a>
                </div>
            </div>
        </div>
    </section>

    <!-- TUDO INCLUSO -->
    <section class="bloco">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Sem pegadinha</div>
                <h2 class="mask-reveal"><span>Tudo <em class="shimmer-gold">incluso</em></span></h2>
                <p>Confira os recursos disponíveis e escolha os limites de fotos, vídeos e música no seu plano.</p>
            </div>

            <div class="incluso-grid">
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Até 12 fotos</b><span>Até 12 fotos em alta qualidade, com molduras e efeitos elegantes</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Vídeos especiais</b><span>Até 4 vídeos curtos para reviver os melhores momentos</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Trilha sonora</b><span>Uma música para tocar junto com a história de vocês</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Carta personalizada</b><span>Escreva e edite a carta até ficar exatamente do seu jeito</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Linha do tempo</b><span>Contador de dias, meses e horas desde o primeiro encontro</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Link + QR Code</b><span>Compartilhe no WhatsApp ou imprima em um cartão físico</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Hospedagem eterna</b><span>Sua página acessível enquanto a conta e o serviço estiverem ativos</span></div></div>
                <div class="incluso-item reveal"><div class="incluso-check">✓</div><div><b>Suporte humano</b><span>Atendimento por WhatsApp para qualquer dúvida</span></div></div>
            </div>
        </div>
    </section>

    <!-- BÔNUS EXCLUSIVOS -->
    <section class="migrated-home-8 bloco">
        <div class="wrap">
            <div class="bonus-box reveal">
                <div class="bonus-glow" aria-hidden="true"></div>
                <div class="bonus-content">
                    <div class="bonus-tag">🎁 Bônus exclusivos</div>
                    <h3>Você recebe <em>de presente</em> junto com o seu pedido</h3>
                    <div class="bonus-grid">
                        <div class="bonus-item"><div class="bonus-icon">📱</div><div><b>Cartão digital com QR Code</b><span>Imprima e presentee fisicamente</span></div></div>
                        <div class="bonus-item"><div class="bonus-icon">✉️</div><div><b>Mensagem de WhatsApp pronta</b><span>Texto sugerido para enviar o link</span></div></div>
                        <div class="bonus-item"><div class="bonus-icon">🎵</div><div><b>Trilha sonora curada</b><span>Sugestões de músicas para cada tema</span></div></div>
                        <div class="bonus-item"><div class="bonus-icon">♾️</div><div><b>Preservação das memórias</b><span>Conteúdo guardado enquanto a conta estiver ativa</span></div></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="bloco alt" id="duvidas">
        <div class="wrap">
            <div class="tit reveal">
                <div class="divisor">Ficou com dúvida?</div>
                <h2 class="mask-reveal"><span>Perguntas <em class="shimmer-gold">frequentes</em></span></h2>
            </div>
            <div class="faq reveal">
                <details><summary>Preciso criar uma conta?</summary><p>Sim. Você pode explorar os temas e preencher o formulário antes de entrar. Para salvar e gerenciar seus presentes, é necessário criar uma conta ou fazer login. Quem recebe o link não precisa de conta.</p></details>
                <details><summary>Quando posso enviar para a pessoa?</summary><p>Logo depois que o pagamento é confirmado. A tela final mostra o link, o QR Code e o botão de enviar pelo WhatsApp.</p></details>
                <details><summary>Posso mudar o texto depois?</summary><p>Você revisa tudo antes de pagar. Para alterar um presente já pago, entre em contato com o suporte.</p></details>
                <details><summary>Quais fotos, vídeos e músicas posso usar?</summary><p>Fotos comuns (JPG, PNG), vídeos de celular, de preferência na vertical, e músicas em MP3. Use apenas conteúdo seu ou que você tenha permissão para compartilhar.</p></details>
                <details><summary>Por quanto tempo a página fica no ar?</summary><p>Sua página fica no ar para sempre. Mesmo que o serviço mude no futuro, garantimos a permanência dos presentes já criados.</p></details>
            </div>
        </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="migrated-home-9 bloco">
        <div class="wrap">
            <div class="newsletter reveal reveal-zoom">
                <h2>Encontre seu próximo <em>presente</em></h2>
                <p>Explore os temas disponíveis e escolha a experiência que combina com a sua história.</p>
                <a class="b" href="#temas">Explorar os temas</a>
            </div>
        </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta-final" id="ctaFinal">
        <h2>Pronto para <em>emocionar alguém?</em></h2>
        <p>Leva poucos minutos e fica guardado para sempre.</p>
        <a href="criar.html" class="b magnetic">Criar meu presente</a>
    </section>

    <!-- RODAPÉ -->
    <footer class="rodape">
        <div class="rodape-grid">
            <div class="rodape-col">
                <div class="rodape-brand"><img class="brand-logo" src="/branding/koalove-logo-principal.svg" width="172" height="60" alt="KoaLove"></div>
                <p class="rodape-brand-desc">Presentes digitais que emocionam. Transformamos histórias em páginas especiais que ficam para sempre.</p>
                <div class="rodape-social">
                    <a href="#" title="Instagram">📷</a>
                    <a href="#" title="WhatsApp">💬</a>
                    <a href="#" title="TikTok">🎵</a>
                    <a href="#" title="E-mail">✉️</a>
                </div>
            </div>
            <div class="rodape-col">
                <h4>Navegar</h4>
                <a href="#como">Como funciona</a>
                <a href="#temas">Temas</a>
                <a href="#depoimentos">Depoimentos</a>
                <a href="#preco">Preço</a>
                <a href="#duvidas">Dúvidas</a>
            </div>
            <div class="rodape-col">
                <h4>Temas</h4>
                <a href="criar.html?tema=namoro">Namoro</a>
                <a href="criar.html?tema=casamento">Casamento</a>
                <a href="criar.html?tema=netflix">Netflix</a>
                <a href="criar.html?tema=spotify">Spotify</a>
                <a href="criar.html?tema=vinil">Vinil</a>
            </div>
            <div class="rodape-col">
                <h4>Suporte</h4>
                <a href="#" data-support-chat="help">Central de ajuda</a>
                <a href="#" data-support-chat="human">Fale conosco</a>
                <a href="termos.html">Termos de uso</a> <!-- ✅ Atualizado -->
                <a href="privacidade.html">Privacidade</a> <!-- ✅ Atualizado -->
                <a href="reembolso.html">Reembolso</a> <!-- ✅ Atualizado -->
            </div>
        </div>

        <div class="selos">
            <div class="selo-conf" data-icon="🔒">Pagamento seguro</div>
            <div class="selo-conf" data-icon="⚡">Liberação imediata</div>
            <div class="selo-conf" data-icon="💛">Feito no Brasil</div>
            <div class="selo-conf" data-icon="♾️">Acesso para sempre</div>
        </div>

        <p id="siteSupportContact" hidden></p>
        <div class="rodape-base">
            <div>© <span id="anoAtual"></span> <b id="siteStoreName">KoaLove</b> — feito com carinho para quem quer eternizar momentos.</div>
            <div class="rodape-base-links">
                <a href="termos.html">Termos</a> <!-- ✅ Atualizado -->
                <a href="privacidade.html">Privacidade</a> <!-- ✅ Atualizado -->
                <a href="#">Cookies</a>
            </div>
        </div>
    </footer>







</body>
</html>
