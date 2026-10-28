<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/pagamento.css","resources/js/entries/pagamento.js"])
</head>
<body class="app">
    @include('partials.noscript')

    <div class="scroll-progress" id="scrollProgress"></div>

    <!-- ✅ NAVBAR INJETADA -->
    <div id="navbar"></div>

    <main class="pg-wrap">

        <div class="pg-hero">
            <div class="pg-eyebrow">
                <span class="dot"></span>
                Último passo
            </div>
            <h1>Falta pouco para o seu <em>presente ficar pronto</em></h1>
            <p>Revise o resumo e faça o pagamento. O link será liberado após a confirmação.</p>
        </div>

        <div class="pg-card">
            <div class="pg-card-titulo">Resumo do pedido</div>

            <div class="pg-resumo">
                <div class="pg-resumo-emoji" id="pgEmoji">🎁</div>
                <div class="pg-resumo-txt">
                    <b id="pgTitulo">Seu presente personalizado</b>
                    <span id="pgSubtitulo">Feito com carinho para alguém especial</span>
                </div>
            </div>

            <ul class="pg-lista" id="resumo"></ul>

            <div class="pg-total">
                <span>Total a pagar</span>
                <strong id="total">R$ 19,90</strong>
            </div>
        </div>

        <div class="pg-card">
            <div class="pg-card-titulo">Forma de pagamento</div>
            <div class="pg-metodos" id="pgMetodos">
                <div class="pg-metodo sel" data-metodo="pix">
                    <span class="pg-metodo-icone">⚡</span>
                    <div class="pg-metodo-nome">Pix</div>
                    <div class="pg-metodo-desc" id="pixDescription">Liberação após confirmação</div>
                </div>
                <div class="pg-metodo" data-metodo="card">
                    <span class="pg-metodo-icone">💳</span>
                    <div class="pg-metodo-nome">Cartão</div>
                    <div class="pg-metodo-desc">Opções disponíveis no checkout</div>
                </div>
            </div>
        </div>

        <div class="pg-card">
            <div class="pg-card-titulo">Cupom de desconto</div>
            <div class="pg-cupom">
                <input type="text" id="pgCupom" placeholder="Digite seu código" maxlength="20" autocomplete="off">
                <button type="button" id="pgCupomBtn">Aplicar</button>
                <div class="pg-cupom-ok" id="pgCupomOk"></div>
            </div>
        </div>

        <div class="pg-teste" id="avisoTeste">
            <div class="pg-teste-icone">⚡</div>
            <div class="pg-teste-txt">
                <b>Modo de demonstração</b>
                Nenhum pagamento real será cobrado. Clique abaixo para simular a aprovação e ver o resultado final.
            </div>
        </div>

        <div class="pg-cta-wrap">
            <button class="btn-pagar" id="btnPagar" type="button" disabled>
                <span id="btnPagarTxt">🔒 Pagar agora com segurança</span>
            </button>
            <div class="pg-erro" id="erro" role="status" aria-live="polite"></div>
        </div>

        <section class="pg-card pg-pix" id="pixManual" hidden aria-labelledby="pixManualTitle">
            <h2 class="pg-card-titulo" id="pixManualTitle">Pague com Pix</h2>
            <p>Confira o recebedor e o valor no aplicativo do banco antes de confirmar.</p>
            <div id="pixQr"></div>
            <p><strong>Recebedor:</strong> <span id="pixReceiver"></span></p>
            <p><strong>Chave Pix:</strong> <span id="pixKey"></span></p>
            <p><strong>Referência do pedido:</strong> <span id="pixReference"></span></p>
            <label for="pixPayload">Pix Copia e Cola</label>
            <textarea id="pixPayload" readonly rows="4"></textarea>
            <button type="button" class="btn-pagar" id="pixCopy">Copiar código Pix</button>
            <p>Após pagar, aguarde a conferência manual. Pagar novamente não acelera a liberação. Guarde o comprovante e o identificador da transação.</p>
            <p id="pixFeedback" role="status" aria-live="polite"></p>
        </section>

        <div class="pg-selos">
            <div class="pg-selo" data-icon="🔒">Pagamento seguro</div>
            <div class="pg-selo" data-icon="⚡">Liberação após confirmação</div>
            <div class="pg-selo" data-icon="💛">Feito no Brasil</div>
        </div>

        <div class="pg-voltar">
            <a id="editarRascunho" href="/criar-presente">Voltar e editar</a>
        </div>

    </main>








</body>
</html>
