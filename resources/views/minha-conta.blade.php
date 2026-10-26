<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">


    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/minha-conta.css","resources/css/pages/minha-conta-extracted.css","resources/js/entries/minha-conta.js"])
</head>
<body>
    @include('partials.noscript')

    <!-- Fundo Premium -->
    <div class="world" aria-hidden="true">
        <div class="world__aurora"></div>
        <div class="world__aurora world__aurora--rose"></div>
        <div class="world__stardust" id="stardust"></div>
        <div class="world__grain"></div>
    </div>

    <!-- NAVBAR INJETADA -->
    <div id="navbar" data-variant="dashboard"></div>

    <main class="dash-main">
        <header class="user-header">
            <div class="user-greeting">
                <p class="eyebrow">Sua coleção exclusiva</p>
                <h1>Olá, <em id="greetingName">Usuário</em>.</h1>
                <p class="subtitle">Aqui estão todas as histórias que você já eternizou.</p>
            </div>
            <a href="criar.html" class="btn-create-hero">
                <span>✦</span> Criar novo presente
            </a>
        </header>

        <div class="dash-content">

            <!-- COLUNA ESQUERDA -->
            <div class="dash-main-col">
                <section class="dash-stats">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <span class="stat-num" id="statTotal">0</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✨</div>
                        <div class="stat-info">
                            <span class="stat-num" id="statPagos">0</span>
                            <span class="stat-label">Prontos</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✏️</div>
                        <div class="stat-info">
                            <span class="stat-num" id="statRascunhos">0</span>
                            <span class="stat-label">Rascunhos</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">↩</div>
                        <div class="stat-info">
                            <span class="stat-num" id="statReembolsados">0</span>
                            <span class="stat-label">Reembolsados</span>
                        </div>
                    </div>
                </section>

                <div class="toolbar">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="searchInput" placeholder="Buscar por título ou nome...">
                    </div>
                    <div class="filters">
                        <button class="filter-btn active" data-filter="all">Todos</button>
                        <button class="filter-btn" data-filter="pago">Pagos</button>
                        <button class="filter-btn" data-filter="rascunho">Rascunhos</button>
                        <button class="filter-btn" data-filter="reembolsado">Reembolsados</button>
                    </div>
                </div>

                <div id="giftsGrid" class="gifts-grid"></div>

                <div id="skeletonGrid" class="migrated-minha-conta-0 gifts-grid">
                    <div class="gift-skeleton"></div>
                    <div class="gift-skeleton"></div>
                    <div class="gift-skeleton"></div>
                </div>

                <div id="emptyState" class="migrated-minha-conta-1 empty-state">
                    <div class="empty-icon">💌</div>
                    <h3>Sua coleção está vazia</h3>
                    <p>Você ainda não criou nenhum presente. Que tal começar agora?</p>
                    <a href="criar.html" class="btn-primary">Criar meu primeiro presente</a>
                </div>

                <div id="noResults" class="migrated-minha-conta-2 empty-state">
                    <div class="empty-icon">🔎</div>
                    <h3>Nada encontrado</h3>
                    <p>Tente buscar por outro termo ou mudar o filtro.</p>
                </div>
            </div>

            <!-- COLUNA DIREITA (Histórico) -->
            <aside class="dash-side-col">
                <div class="history-card">
                    <div class="history-header">
                        <div class="history-icon">🧾</div>
                        <h3>Histórico de Pagamentos</h3>
                    </div>

                    <div class="timeline" id="paymentTimeline">
                        <!-- Injetado via JS -->
                    </div>
                </div>
            </aside>

        </div>
    </main>

    <dialog id="refundDialog" class="refund-dialog" aria-labelledby="refundDialogTitle" aria-describedby="refundIntro">
        <form id="refundForm">
            <span class="refund-kicker">Cuidado com a sua experiência</span>
            <h2 id="refundDialogTitle">Solicitar reembolso</h2>
            <p id="refundIntro">Garantia comercial: até 3 dias (72 horas) após o pagamento, enquanto o link compartilhado não tiver sido aberto.</p>
            <div class="refund-summary"><strong id="refundGiftTitle"></strong><span id="refundAmount"></span></div>
            <label for="refundReason">Motivo da solicitação</label>
            <textarea id="refundReason" minlength="5" maxlength="1000" rows="4" required placeholder="Como podemos ajudar?"></textarea>
            <p class="refund-note">O envio inicia a análise; o estorno depende da confirmação do reembolso.</p>
            <a class="refund-policy" href="reembolso.html" target="_blank" rel="noopener">Consultar política de reembolso ↗</a>
            <p id="refundError" role="alert"></p>
            <div class="refund-dialog-actions"><button type="button" id="cancelRefund">Cancelar</button><button type="submit" id="submitRefund">Enviar solicitação</button></div>
        </form>
    </dialog>

    <!-- Modal de Exclusão -->
    <div id="deleteModal" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-icon">🗑️</div>
            <h3>Excluir presente?</h3>
            <p id="deleteWarningText">Tem certeza que deseja apagar este presente? Essa ação não pode ser desfeita.</p>
            <div class="modal-actions">
                <button id="btnCancelDelete" class="btn-sec">Cancelar</button>
                <button id="btnConfirmDelete" class="btn-danger">Sim, excluir</button>
            </div>
        </div>
    </div>

    <!-- Modal de Comprovante de Pagamento -->
    <div id="receiptModal" class="modal-overlay">
        <div class="receipt-box">
            <div class="receipt-header">
                <div class="receipt-icon">✓</div>
                <h3 id="receiptTitle">Pagamento confirmado</h3>
                <p id="receiptSubtitle">Comprovante de compra</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-row"><span>Situação:</span><b id="recStatus"></b></div>
                <div class="receipt-row"><span>ID do Pedido:</span><b id="recId"></b></div>
                <div class="receipt-row"><span>Presente:</span><b id="recTitulo"></b></div>
                <div class="receipt-row"><span>Data:</span><b id="recData"></b></div>
                <div class="receipt-row"><span>Hora:</span><b id="recHora"></b></div>
                <div class="receipt-row"><span>Método:</span><b id="recMetodo"></b></div>
                <div class="receipt-row receipt-total"><span>Valor Pago:</span><b id="recValor"></b></div>
            </div>
            <div class="receipt-footer">
                <div class="receipt-barcode"></div>
                <p>Obrigado por eternizar suas histórias conosco!</p>
            </div>
            <div class="receipt-actions">
                <button id="btnCloseReceipt" class="btn-sec">Fechar</button>
                <button id="btnPrintReceipt" class="btn-primary">Imprimir / PDF</button>
            </div>
        </div>
    </div>

    <section class="privacy-settings" aria-labelledby="privacyTitle">
      <h2 id="privacyTitle">Seus dados</h2>
      <p>Exporte seus dados ou solicite a exclusão da conta. A exclusão desativa os links de presentes imediatamente e elimina os dados em até 30 dias.</p>
      <button type="button" id="exportData" class="btn-sec">Exportar meus dados</button>
      <form id="deleteAccountForm">
        <label for="deletePassword">Confirme sua senha para excluir a conta</label>
        <input id="deletePassword" type="password" autocomplete="current-password" maxlength="128" required>
        <button type="submit" class="btn-sec">Excluir minha conta</button>
      </form>
      <p id="privacyMessage" role="status"></p>
    </section>
    <div id="toastContainer" class="toast-container"></div>









    <!-- Script para gerar as estrelas do fundo -->

</body>
</html>
