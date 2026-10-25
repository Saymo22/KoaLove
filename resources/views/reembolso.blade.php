<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/legal.css","resources/js/entries/reembolso.js"])
</head>
<body>
    @include('partials.noscript')

    <div id="navbar"></div>

    <header class="legal-hero">
        <div class="legal-eyebrow">Institucional</div>
        <h1 class="legal-title">Política de Reembolso</h1>
        <p class="legal-date">Última atualização: 24 de outubro de 2026</p>
    </header>

    <main class="legal-container">

        <aside class="legal-sidebar">
            <h4>Nesta página</h4>
            <a href="#garantia">1. Garantia Comercial de 3 Dias</a>
            <a href="#solicitar">2. Como Solicitar</a>
            <a href="#estorno">3. Processamento</a>
            <a href="#excecoes">4. Direitos Legais</a>
            <a href="#suporte">5. Acompanhamento</a>
            <div class="sidebar-divider"></div>
            <a href="termos.html">Termos de Uso →</a>
            <a href="privacidade.html">Política de Privacidade →</a>
        </aside>

        <article class="legal-content">
            <p>Esta política distingue a garantia comercial do <strong>Nosso Amor</strong> dos direitos legais do consumidor. Enviar uma solicitação inicia a análise; não confirma nem executa automaticamente um estorno.</p>

            <h2 id="garantia">1. Garantia Comercial de 3 Dias</h2>
            <p>A garantia comercial permite solicitar reembolso por até <strong>3 dias (72 horas) após a confirmação do pagamento</strong>, desde que o <strong>link compartilhado ainda não tenha sido aberto</strong>. Ao completar 72 horas ou ocorrer o primeiro acesso ao conteúdo compartilhado, o botão dessa garantia fica indisponível.</p>
            <p>A consulta do criador pela prévia privada da própria conta não conta como abertura do link compartilhado. O registro não permite reconstruir acessos anteriores à sua ativação; nesses casos, a solicitação segue para análise individual.</p>

            <h2 id="solicitar">2. Como Solicitar</h2>
            <ol>
                <li>Acesse <a href="minha-conta.html">Minha Conta</a> e encontre o presente pago.</li>
                <li>Se a garantia comercial estiver disponível, clique em <strong>Reembolso</strong>.</li>
                <li>Descreva o motivo e envie a solicitação. O card mostrará o andamento da análise.</li>
            </ol>
            <p>Mesmo após o prazo comercial ou a abertura do link, você pode usar <strong>Solicitar análise de direitos legais</strong>, no mesmo card. Esse canal recebe pedidos para avaliação individual, sem negar automaticamente direitos previstos em lei.</p>

            <h2 id="estorno">3. Processamento do Estorno</h2>
            <p>Depois da análise, uma devolução aprovada precisa ser confirmada pelo meio de pagamento. Para compras pelo Mercado Pago, o sistema aguarda a confirmação do provedor. Para Pix manual, o responsável confere a devolução antes de registrá-la no painel.</p>
            <p>O prazo para o valor aparecer depende do meio de pagamento, banco ou operadora. A solicitação, por si só, não altera o estado do pagamento. Quando o estorno é confirmado, o presente deixa de estar disponível pelo link.</p>

            <h2 id="excecoes">4. Direitos Legais Preservados</h2>
            <p>A garantia comercial de 3 dias não reduz nem substitui direitos legais obrigatórios. Quando aplicável, o <a href="https://planalto.gov.br/ccivil_03/leis/l8078compilado.htm" target="_blank" rel="noopener">artigo 49 do Código de Defesa do Consumidor</a> prevê prazo de 7 dias para arrependimento nas contratações fora do estabelecimento. A abertura do link não elimina, por si só, os direitos previstos em lei.</p>
            <p>Pedidos por vícios, falhas na prestação ou outras situações protegidas pela legislação podem ser apresentados pelo canal de análise de direitos legais em Minha Conta. A equipe avalia o caso e o fundamento informado; não há recusa automática com base apenas no prazo comercial ou na abertura do link.</p>

            <h2 id="suporte">5. Acompanhamento</h2>
            <p>O card do presente informa se a solicitação está em análise, foi aprovada ou não aprovada. Solicitações já registradas e decisões anteriores permanecem no histórico. Se uma solicitação comercial não for aprovada, o canal de análise de direitos legais continua disponível para avaliação específica.</p>
        </article>
    </main>

    <!-- FOOTER -->
    <footer class="rodape">
        <div class="rodape-grid">
            <div class="rodape-col">
                <div class="rodape-brand">Nosso Amor</div>
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
                <a href="home.html#como">Como funciona</a>
                <a href="home.html#temas">Temas</a>
                <a href="home.html#depoimentos">Depoimentos</a>
                <a href="home.html#preco">Preço</a>
                <a href="home.html#duvidas">Dúvidas</a>
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
                <a href="termos.html">Termos de uso</a>
                <a href="privacidade.html">Privacidade</a>
                <a href="reembolso.html">Reembolso</a>
            </div>
        </div>

        <div class="selos">
            <div class="selo-conf" data-icon="🔒">Pagamento seguro</div>
            <div class="selo-conf" data-icon="⚡">Liberação imediata</div>
            <div class="selo-conf" data-icon="💛">Feito no Brasil</div>
            <div class="selo-conf" data-icon="♾️">Acesso para sempre</div>
        </div>

        <div class="rodape-base">
            <div>© <span id="anoAtual"></span> <b>Nosso Amor</b> — feito com carinho.</div>
            <div class="rodape-base-links">
                <a href="termos.html">Termos</a>
                <a href="privacidade.html">Privacidade</a>
                <a href="#">Cookies</a>
            </div>
        </div>
    </footer>






</body>
</html>
