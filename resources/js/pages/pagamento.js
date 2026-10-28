const id = parametro("id");
let pedido = null;       // metadados do backend (GET /api/purchases/:id)
let midia = null;        // mídia local (IndexedDB)
let metodoSelecionado = "pix";
const $ = (x) => document.getElementById(x);

/* =====================================================
   CUPONS — validados no servidor para o pedido
===================================================== */
let descontoAtivo = null;
let precoOriginal = null; // CONFIG.preco (price_cents / 100)
let currentQuote = null;
async function refreshQuote(coupon = null) {
    const {quote}=await window.ApiPurchases.quote(id,coupon);
    currentQuote=quote;precoOriginal=quote.base_price_cents/100;
    animarTotal(formatarPreco(quote.amount_cents/100));
    const notice=$('pgCupomOk');notice.textContent=quote.discount_percent?`${quote.discount_percent}% de desconto aplicado. Você economiza ${formatarPreco((quote.base_price_cents-quote.amount_cents)/100)}.`:'';
    notice.style.display=quote.discount_percent?'block':'none';
    return quote;
}

/* =====================================================
   NAVBAR SCROLL
===================================================== */
(function () {
    const progress = $("scrollProgress");
    if (!progress) return;
    // A classe ".scrolled" da navbar é gerenciada por js/core/navbar.js.
    window.addEventListener("scroll", () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }, { passive: true });
})();

/* =====================================================
   BOOT (aguarda config da API)
===================================================== */
NA_CONFIG_READY.then(async () => {
    if (!id) { location.href = "/criar-presente"; return; }
    $('editarRascunho').href='/criar-presente?id='+encodeURIComponent(id);

    // Contrato: GET /api/purchases/:id (dono ou admin)
    try {
        ({ purchase: pedido } = await window.ApiPurchases.getOne(id));
    } catch (err) {
        if (err && (err.code === "NOT_AUTHENTICATED" || err.status === 401)) {
            location.href = '/entrar?next='+encodeURIComponent('/pagamento?id='+id);
            return;
        }
        location.href = "/criar-presente";
        return;
    }

    if (pedido.status === "paid") { location.href = "/resultado?id=" + id; return; }
    if (pedido.status === 'refunded') { $('erro').textContent = 'Este pedido foi reembolsado. Entre em contato com o suporte.'; $('btnPagar').disabled = true; return; }

    // Mídia local (fotos/vídeos/música) — blobs ficam no IndexedDB
    midia = await buscarPedido(id).catch(() => null);
    if (pedido.content_version !== 1) {
        $("erro").textContent = "Abra o rascunho e salve novamente para sincronizar as mídias antes do pagamento.";
    }

    precoOriginal = Number.isFinite(pedido.price_cents)?pedido.price_cents/100:CONFIG.preco;
    if (typeof precoOriginal !== "number") {
        $("erro").textContent = "Não foi possível carregar o preço. Verifique se o servidor está rodando.";
        return;
    }

    aplicarTema(pedido.tema);
    const t = THEMES[pedido.tema] || {};

    $("pgEmoji").textContent = t.emoji || "🎁";

    const tituloPresente = pedido.titulo || "Seu presente personalizado";
    $("pgTitulo").textContent = "🎁 " + tituloPresente;
    $("pgSubtitulo").textContent =
        "De " + (pedido.de || "você") + " para " + (pedido.para || "alguém especial");

    const fotos = pedido.content_version===1 ? pedido.fotos||[] : midia?.fotos||[];
    const videos = pedido.content_version===1 ? pedido.videos||[] : midia?.videos||[];
    const linhas = [
        ["Plano", pedido.plan?.name || "Presente completo", "🎁"],
        ["Tema", (t.emoji || "🎁") + " " + (t.nome || pedido.tema), "🎨"],
        ["Para", pedido.para, "💌"],
        ["Fotos", fotos.length + (fotos.length === 1 ? " foto" : " fotos"), "📸"],
        ["Vídeos", videos.length + (videos.length === 1 ? " vídeo" : " vídeos"), "🎬"],
        ["Música", (pedido.content_version===1?pedido.musica:midia?.musica) ? (pedido.musicaNome || midia?.musicaNome || "Incluída") : "—", "🎵"],
        ["Link + QR Code", "Incluído", "🔗"]
    ];

    $("resumo").innerHTML = "";
    linhas.forEach(([rotulo, valor, icone]) => {
        const li = document.createElement("li");
        li.innerHTML =
            '<span class="rot" data-icon="' + icone + '"></span>' +
            '<span class="val"></span>';
        li.querySelector(".rot").textContent = rotulo;
        li.querySelector(".val").textContent = valor;
        $("resumo").appendChild(li);
    });

    try { await refreshQuote(pedido.checkout?.coupon || null); }
    catch(error){$('erro').textContent=error.message;$('btnPagar').disabled=true;return;}

    // A disponibilidade vem do backend; retorno do provedor não prova aprovação.
    $("avisoTeste").classList.toggle("on",CONFIG.modoTeste);
    const disponivel = CONFIG.modoTeste || window.APP_CONFIG?.PAYMENTS?.configured;
    const manual = window.APP_CONFIG?.PAYMENTS?.provider === 'pix_manual';
    if (manual) {
        document.querySelectorAll('.pg-metodo').forEach(m => { if (m.dataset.metodo === 'card') m.hidden = true; });
        $('pixDescription').textContent = 'Conferência manual pelo responsável';
    }
    $("btnPagar").disabled = !disponivel || pedido.content_version !== 1;
    $("btnPagarTxt").textContent = CONFIG.modoTeste ? "✨ Simular pagamento aprovado" : disponivel ? manual ? 'Gerar Pix' : "🔒 Continuar no Mercado Pago" : "Pagamento indisponível";
    if (!disponivel) $("erro").textContent = "O pagamento ainda não foi habilitado. Tente novamente mais tarde.";
    if (pedido.checkout) {
        $('editarRascunho').href = '/minha-conta';
        $('editarRascunho').textContent = 'Ver meus presentes';
        metodoSelecionado = pedido.checkout.method;
        document.querySelectorAll('.pg-metodo').forEach(m => m.classList.toggle('sel', m.dataset.metodo === metodoSelecionado));
        $('pgCupom').value = pedido.checkout.coupon || '';
        $('pgCupom').disabled = $('pgCupomBtn').disabled = true;
        descontoAtivo = pedido.checkout.coupon ? {codigo:pedido.checkout.coupon} : null;
        animarTotal(formatarPreco(pedido.checkout.amount_cents / 100));
        if (disponivel && pedido.checkout.provider === 'pix_manual') await mostrarPix(pedido.checkout);
    }
    if (parametro('retorno') === '1' && pedido.checkout) verificarRetorno();
});

async function verificarRetorno(tentativa = 0) {
    try {
        const {purchase} = await window.ApiPurchases.getOne(id);
        if (purchase.status === 'paid') { location.href = '/resultado?id=' + encodeURIComponent(id); return; }
        const status = purchase.checkout?.status;
        if (purchase.checkout?.provider === 'pix_manual') {
            $('erro').textContent = purchase.status === 'refunded' ? 'O pagamento foi reembolsado. Entre em contato com o suporte.' : 'Aguardando conferência manual do Pix. O presente será liberado após confirmar o recebimento.';
            if (purchase.status === 'refunded') $('btnPagar').disabled = true;
            return;
        }
        $('erro').textContent = ['rejected','cancelled'].includes(status)
            ? 'O pagamento não foi aprovado. Você pode tentar novamente no Mercado Pago.'
            : ['refunded','partially_refunded','charged_back','in_mediation'].includes(status)
                ? 'O pagamento foi estornado ou está em análise. Entre em contato com o suporte.'
                : 'Aguardando a confirmação do Mercado Pago. O presente será liberado após a aprovação.';
        if (['refunded','partially_refunded','charged_back','in_mediation'].includes(status)) $('btnPagar').disabled = true;
        if (tentativa < 11 && !['rejected','cancelled','refunded','partially_refunded','charged_back','in_mediation'].includes(status)) setTimeout(() => verificarRetorno(tentativa + 1), 5000);
    } catch { $('erro').textContent = 'Não foi possível verificar o pagamento agora. Atualize esta página em alguns instantes.'; }
}

async function mostrarPix(checkout) {
    const pix = checkout.pix;
    $('pixManual').hidden = false;
    $('pixReceiver').textContent = pix.name;
    $('pixKey').textContent = pix.key;
    $('pixReference').textContent = pix.txid;
    $('pixPayload').value = pix.payload;
    $('btnPagarTxt').textContent = 'Verificar liberação do presente';
    $('btnPagar').disabled = false;
    $('pgCupom').disabled = $('pgCupomBtn').disabled = true;
    $('editarRascunho').href = '/minha-conta';
    $('editarRascunho').textContent = 'Ver meus presentes';
    $('erro').textContent = 'Aguardando pagamento e conferência manual. Se já pagou, aguarde a liberação.';
    try {
        const canvas = document.createElement('canvas');
        await NAQRCode.toCanvas(canvas,pix.payload,{width:240,margin:4,errorCorrectionLevel:'M'});
        canvas.setAttribute('role','img'); canvas.setAttribute('aria-label','QR Code para pagamento Pix');
        $('pixQr').replaceChildren(canvas);
    } catch { $('pixFeedback').textContent = 'Use o código Copia e Cola abaixo para pagar.'; }
}

$('pixCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('pixPayload').value); $('pixFeedback').textContent = 'Código Pix copiado.'; }
    catch { $('pixPayload').focus(); $('pixPayload').select(); $('pixFeedback').textContent = 'Selecione e copie o código Pix acima.'; }
});

/* =====================================================
   TOTAL ANIMADO
===================================================== */
function animarTotal(valorFormatado) {
    const elemento = $("total");
    const valorFinal = Number(valorFormatado.replace(/[^\d,]/g, "").replace(",", "."));
    const atual = Number(elemento.textContent.replace(/[^\d,]/g, "").replace(",", ".")) || valorFinal;
    const inicio = performance.now();
    const dur = 700;
    function tick(now) {
        const p = Math.min((now - inicio) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = atual + (valorFinal - atual) * eased;
        elemento.textContent = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        if (p < 1) requestAnimationFrame(tick);
        else elemento.textContent = valorFormatado;
    }
    requestAnimationFrame(tick);
}

/* =====================================================
   SELETOR DE MÉTODO
===================================================== */
document.querySelectorAll(".pg-metodo").forEach(m => {
    m.addEventListener("click", () => {
        if (pedido?.checkout) return;
        document.querySelectorAll(".pg-metodo").forEach(x => x.classList.remove("sel"));
        m.classList.add("sel");
        metodoSelecionado = m.dataset.metodo;
    });
});

/* =====================================================
   CUPOM (validado contra GET /api/config)
===================================================== */
$("pgCupomBtn").addEventListener("click", async () => {
    const code=$("pgCupom").value.trim().toUpperCase();
    if(!code){$("pgCupom").focus();return;}
    const remove=descontoAtivo?.codigo===code;
    $("pgCupomBtn").disabled=true;$("erro").textContent='';
    try{
        const quote=await refreshQuote(remove?null:code);
        descontoAtivo=remove?null:{codigo:quote.coupon};
        if(remove)$("pgCupom").value='';
        $("pgCupomBtn").textContent=remove?'Aplicar':'Remover';
    }catch(error){
        descontoAtivo=null;$("pgCupomBtn").textContent='Aplicar';$("erro").textContent=error.message;
        try{await refreshQuote();}catch{$('btnPagar').disabled=true;}
    }finally{$("pgCupomBtn").disabled=false;}
});

/* =====================================================
   PAGAMENTO (contrato: POST /api/purchases/:id/pay)
===================================================== */
async function pagar() {
    return window.ApiPurchases.pay(
        id,
        metodoSelecionado,
        descontoAtivo ? descontoAtivo.codigo : null,
        currentQuote?.amount_cents
    );
}

$("btnPagar").addEventListener("click", async (e) => {
    if (pedido?.checkout?.provider === 'pix_manual') { await verificarRetorno(); return; }
    const btn = $("btnPagar");
    const txt = $("btnPagarTxt");

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    btn.disabled = true;
    const textoOriginal = txt.textContent;
    txt.innerHTML = '<span class="pg-spinner"></span> Processando...';
    $("erro").textContent = "";

    try {
        const resposta = await pagar();
        pedido = resposta.purchase;
        if (resposta.checkout?.provider === 'pix_manual') {
            pedido.checkout = resposta.checkout;
            await mostrarPix(resposta.checkout);
            return;
        }
        if (pedido.status !== 'paid') {
            const url = resposta.checkout?.url;
            const destino = url ? new URL(url) : null;
            if (!destino || destino.protocol !== 'https:' || !['www.mercadopago.com.br','www.mercadopago.com','sandbox.mercadopago.com.br','sandbox.mercadopago.com'].includes(destino.hostname) || destino.username || destino.password || destino.port) throw new Error('O checkout não está disponível. Atualize a página para continuar.');
            location.assign(destino.href);
            return;
        }

        confetes();

        txt.textContent = "✓ Pagamento aprovado!";
        setTimeout(() => {
            location.href = "/resultado?id=" + id;
        }, 900);
    } catch (err) {
        if ((err.status===409 || err.status===422) && !pedido?.checkout) {
            try { await refreshQuote(descontoAtivo?.codigo || null); }
            catch { descontoAtivo=null;$('pgCupom').value='';$('pgCupomBtn').textContent='Aplicar';try{await refreshQuote();}catch{} }
        }
        if (err && (err.code === "RATE_LIMITED" || err.code === "CLIENT_RATE_LIMITED")) {
            $("erro").textContent = `Muitas tentativas. Aguarde ${err.retryAfter || 60}s e tente de novo.`;
        } else {
            $("erro").textContent = (err && err.message) || "Falha no pagamento.";
        }
        btn.disabled = false;
        txt.textContent = textoOriginal;
    }
});

/* =====================================================
   CONFETES
===================================================== */
function confetes() {
    const simbolos = ["♥", "♡", "✦", "✧", "❤️"];
    for (let i = 0; i < 26; i++) {
        const c = document.createElement("span");
        c.className = "pg-confete";
        c.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDelay = (Math.random() * 0.5) + "s";
        c.style.animationDuration = (2 + Math.random() * 1.5) + "s";
        c.style.fontSize = (14 + Math.random() * 14) + "px";
        c.style.color = Math.random() > .5 ? "#c9a86a" : "#d96c8a";
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3500);
    }
}
