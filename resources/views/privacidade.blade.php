<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade — Nosso Amor</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/legal.css","resources/js/entries/privacidade.js"])
</head>
<body>

    <div id="navbar"></div>

    <header class="legal-hero">
        <div class="legal-eyebrow">Institucional</div>
        <h1 class="legal-title">Política de Privacidade</h1>
        <p class="legal-date">Última atualização: 23 de Outubro de 2026</p>
    </header>

    <main class="legal-container">

        <aside class="legal-sidebar">
            <h4>Nesta página</h4>
            <a href="#dados">1. Dados Coletados</a>
            <a href="#uso">2. Como Usamos</a>
            <a href="#armazenamento">3. Armazenamento</a>
            <a href="#compartilhamento">4. Compartilhamento</a>
            <a href="#seguranca">5. Segurança</a>
            <a href="#direitos">6. Seus Direitos (LGPD)</a>
            <div class="sidebar-divider"></div>
            <a href="termos.html">Termos de Uso →</a>
            <a href="reembolso.html">Política de Reembolso →</a>
        </aside>

        <article class="legal-content">
<h2 id="dados">1. Dados coletados</h2>
<p>Guardamos nome, e-mail, senha protegida por hash e o conteúdo fornecido para os presentes: fotos, vídeos, áudios, textos e datas. As sessões registram IP e navegador para segurança; a auditoria usa IP pseudonimizado, rota sem parâmetros, usuário interno, resultado e data.</p>
<h2 id="uso">2. Finalidades</h2>
<p>Usamos esses dados para autenticar sua conta, criar e entregar os presentes, recuperar acesso e prevenir abuso. O pagamento atual é uma demonstração; não coletamos dados de cartão nem cobramos valores reais.</p>
<h2 id="armazenamento">3. Armazenamento e retenção</h2>
<p>O conteúdo sincronizado e as mídias ficam no servidor, fora da pasta pública. O navegador também guarda rascunhos e cache em IndexedDB/localStorage. Você pode limpar essas cópias nas configurações do navegador.</p>
<ul><li>Conta e presentes ativos: enquanto a conta permanecer ativa e o serviço for oferecido.</li><li>Rascunhos não pagos: até 30 dias sem atualização.</li><li>Presente excluído: link revogado imediatamente e dados eliminados em até 30 dias.</li><li>Conta excluída: autenticação e links desativados imediatamente; dados e arquivos eliminados em até 30 dias.</li><li>Auditoria: 30 dias. Sessões: 120 minutos, com limpeza diária. Links de recuperação: 60 minutos.</li><li>Backups e logs da hospedagem: o operador deve limitar a retenção a 30 dias e reaplicar exclusões ao restaurar cópias.</li></ul>
<p>A limpeza depende da rotina diária monitorada pelo operador. A exclusão no servidor não elimina arquivos que você ou o destinatário já tenham copiado. Ao excluir a conta, tentamos limpar também os rascunhos deste navegador; outros dispositivos precisam ser limpos separadamente.</p>
<h2 id="compartilhamento">4. Terceiros e links</h2>
<p>Quem possui o link de um presente liberado pode visualizar seu conteúdo. O QR Code é gerado no navegador, sem enviar o link a um serviço externo. Não há AdSense, publicidade ou analytics integrados.</p>
<p>Fontes Google e imagens/mídias externas dos temas de demonstração recebem requisições do navegador, incluindo IP e informações técnicas. URLs externas escolhidas por você também são acessadas pelo navegador. O provedor de hospedagem armazena os dados; o provedor SMTP configurado pelo operador entrega e-mails de recuperação. Os provedores efetivos devem ser identificados antes da publicação.</p>
<h2 id="seguranca">5. Segurança</h2>
<p>Aplicamos controle de acesso, validação de uploads, recodificação de imagens, proteção de sessão e limites de requisição. As páginas de presentes sinalizam aos buscadores que não devem ser indexadas; isso não impede cópia ou compartilhamento por alguém com o link.</p>
<h2 id="direitos">6. Seus direitos e contato</h2>
<p>Na página Minha Conta, você pode exportar seus dados e confirmar a exclusão com sua senha. Para pedidos de confirmação, correção, informações sobre tratamento e outros direitos, use o contato do responsável.</p>
@if(config('gift.privacy_email'))
<p>Responsável: {{ config('gift.privacy_controller') }}. Contato: <a href="mailto:{{ config('gift.privacy_email') }}">{{ config('gift.privacy_email') }}</a>.</p>
@else
<p>Ambiente de desenvolvimento: identificação e contato do responsável ainda precisam ser configurados antes da publicação.</p>
@endif
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
