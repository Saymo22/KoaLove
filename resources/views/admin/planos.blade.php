<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('partials.seo')
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/base.css','resources/css/admin.css','resources/css/admin-pricing.css','resources/js/entries/admin-planos.js'])
</head>
<body class="admin-body">
    @include('partials.noscript')
    <header id="adminHeader"></header>
    <main class="admin-main pricing-admin">
        <p class="admin-eyebrow">Sua vitrine</p><h1 class="page-title">Ofertas que fazem sentido.</h1>
        <p class="page-desc">As alterações aparecem automaticamente na home. Pagamentos já iniciados mantêm o valor combinado.</p>
        <p id="pricingStatus" role="status" aria-live="polite"></p>
        <section class="pricing-panel pricing-catalog" aria-labelledby="plansTitle">
            <h2 id="plansTitle">Planos</h2>
            <p>Até três planos ativos na vitrine. Desative para retirar da venda, preservando os pedidos existentes.</p>
            <div id="plansList" class="pricing-records"></div>
            <form id="planForm" class="pricing-form">
                <input name="id" type="hidden">
                <label>Nome<input name="name" required maxlength="60"></label>
                <label>Preço (R$)<input name="price" required inputmode="decimal" placeholder="19,90"></label>
                <label class="wide">Descrição<input name="description" maxlength="240"></label>
                <label class="wide">Benefícios — um por linha<textarea name="features" rows="5" required maxlength="2000"></textarea></label>
                <label>Fotos (1 a 12)<input name="photos_limit" type="number" min="1" max="12" value="12" required></label>
                <label>Vídeos (0 a 4)<input name="videos_limit" type="number" min="0" max="4" value="4" required></label>
                <label>Músicas (0 ou 1)<input name="music_limit" type="number" min="0" max="1" value="1" required></label>
                <label>Ordem na vitrine<input name="sort_order" type="number" min="0" max="999" value="0" required></label>
                <label class="check"><input name="active" type="checkbox" checked> Disponível para venda</label>
                <label class="check"><input name="featured" type="checkbox"> Destacar como mais escolhido e padrão</label>
                <div class="pricing-actions wide"><button type="submit" class="btn-action">Salvar plano</button><button type="button" data-new="planForm" class="btn-action">Novo plano</button></div>
            </form>
        </section>
        <div class="pricing-offers-grid">
            <section class="pricing-panel" aria-labelledby="promotionsTitle">
                <h2 id="promotionsTitle">Promoções e temporizador</h2>
                <p>O banner mostra a promoção vigente do plano em destaque. O desconto encerra no prazo informado.</p>
                <div id="promotionsList" class="pricing-records"></div>
                <form id="promotionForm" class="pricing-form" data-kind="promotions">
                    <input name="id" type="hidden">
                    <label class="wide">Nome da promoção<input name="name" required maxlength="80"></label>
                    <label>Plano<select name="plan_id" class="pricing-plan-options"></select></label>
                    <label>Desconto (%)<input name="discount_percent" type="number" min="1" max="95" required></label>
                    <label>Início<input name="starts_at" type="datetime-local" required></label>
                    <label>Fim<input name="ends_at" type="datetime-local" required></label>
                    <p class="wide">Datas no horário do seu dispositivo. Não há acúmulo de descontos.</p>
                    <label class="check wide"><input name="active" type="checkbox" checked> Promoção habilitada</label>
                    <div class="pricing-actions wide"><button type="submit" class="btn-action">Salvar promoção</button><button type="button" data-new="promotionForm" class="btn-action">Nova promoção</button></div>
                </form>
            </section>
            <section class="pricing-panel" aria-labelledby="couponsTitle">
                <h2 id="couponsTitle">Cupons</h2>
                <p>Cupons não são divulgados na home. O servidor aplica o maior desconto válido, sem somar com a promoção.</p>
                <div id="couponsList" class="pricing-records"></div>
                <form id="couponForm" class="pricing-form" data-kind="coupons">
                    <input name="id" type="hidden">
                    <label class="wide">Código<input name="code" required minlength="3" maxlength="20" pattern="[A-Za-z0-9][A-Za-z0-9_\-]{2,19}" placeholder="AMOR10"></label>
                    <label>Plano<select name="plan_id" class="pricing-plan-options"></select></label>
                    <label>Desconto (%)<input name="discount_percent" type="number" min="1" max="95" required></label>
                    <label>Início (opcional)<input name="starts_at" type="datetime-local"></label>
                    <label>Fim (opcional)<input name="ends_at" type="datetime-local"></label>
                    <label class="check wide"><input name="active" type="checkbox" checked> Cupom habilitado</label>
                    <div class="pricing-actions wide"><button type="submit" class="btn-action">Salvar cupom</button><button type="button" data-new="couponForm" class="btn-action">Novo cupom</button></div>
                </form>
            </section>
        </div>
    </main>
</body>
</html>
