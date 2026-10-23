const id = parametro("id");
let pedido = null;       // metadados do backend (GET /api/purchases/:id)
let midia = null;        // mídia local (IndexedDB)
let metodoSelecionado = "pix";
const $ = (x) => document.getElementById(x);

/* =====================================================
   CUPONS — vêm de GET /api/config (nada hardcoded)
===================================================== */
let descontoAtivo = null;
let precoOriginal = null; // CONFIG.preco (price_cents / 100)

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
    if (!id) { location.href = "criar.html"; return; }
    $('editarRascunho').href='criar.html?id='+encodeURIComponent(id);

    // Contrato: GET /api/purchases/:id (dono ou admin)
    try {
        ({ purchase: pedido } = await window.ApiPurchases.getOne(id));
    } catch (err) {
        if (err && (err.code === "NOT_AUTHENTICATED" || err.status === 401)) {
            location.href = 'login.html?next='+encodeURIComponent('pagamento.html?id='+id);
            return;
        }
        location.href = "criar.html";
        return;
    }

    if (pedido.status === "paid") { location.href = "resultado.html?id=" + id; return; }

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

    animarTotal(formatarPreco(precoOriginal));

    // Checkout sempre em modo teste neste servidor (sem gateway integrado)
    $("avisoTeste").classList.toggle("on",CONFIG.modoTeste);
    $("btnPagarTxt").textContent = CONFIG.modoTeste ? "✨ Simular pagamento aprovado" : "Pagamento indisponível";
    if (!CONFIG.modoTeste) { $("btnPagar").disabled = true; $("erro").textContent = "O pagamento ainda não foi habilitado. Tente novamente mais tarde."; }
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
        document.querySelectorAll(".pg-metodo").forEach(x => x.classList.remove("sel"));
        m.classList.add("sel");
        metodoSelecionado = m.dataset.metodo;
    });
});

/* =====================================================
   CUPOM (validado contra GET /api/config)
===================================================== */
$("pgCupomBtn").addEventListener("click", () => {
    const codigo = $("pgCupom").value.trim().toUpperCase();
    const el = $("pgCupom");
    const btn = $("pgCupomBtn");
    const aviso = $("pgCupomOk");

    if (!codigo) {
        el.focus();
        el.style.borderColor = "#b3263e";
        setTimeout(() => el.style.borderColor = "", 900);
        return;
    }

    // Remove cupom já aplicado se clicar novamente
    if (descontoAtivo && descontoAtivo.codigo === codigo) {
        descontoAtivo = null;
        el.value = "";
        el.style.borderColor = "";
        el.style.background = "#faf6f1";
        btn.textContent = "Aplicar";
        btn.style.background = "";
        btn.style.color = "";
        aviso.style.display = "none";
        animarTotal(formatarPreco(precoOriginal));
        return;
    }

    const cupom = (CONFIG.coupons || {})[codigo];

    if (!cupom) {
        el.style.borderColor = "#b3263e";
        el.style.background = "#fde8ec";
        btn.textContent = "✕ Inválido";
        btn.style.background = "#fde8ec";
        btn.style.color = "#b3263e";
        aviso.style.display = "none";
        setTimeout(() => {
            el.style.borderColor = "";
            el.style.background = "#faf6f1";
            btn.textContent = "Aplicar";
            btn.style.background = "";
            btn.style.color = "";
        }, 1800);
        return;
    }

    // Aplicar (cálculo local apenas para preview; o servidor é a autoridade)
    const desc = cupom.discount_percent || 0;
    const novoPreco = precoOriginal * (1 - desc / 100);
    descontoAtivo = { codigo, desc, preco: novoPreco };

    el.style.borderColor = "var(--ouro)";
    el.style.background = "linear-gradient(135deg, #fff8e6, #fffbe9)";
    btn.textContent = "✓ " + desc + "% off";
    btn.style.background = "linear-gradient(135deg, #46d369, #2ea854)";
    btn.style.color = "#fff";

    animarTotal(formatarPreco(novoPreco));

    aviso.innerHTML = "🎉 Cupom aplicado! Você economizou " + formatarPreco(precoOriginal - novoPreco);
    aviso.style.display = "block";
});

/* =====================================================
   PAGAMENTO (contrato: POST /api/purchases/:id/pay)
===================================================== */
async function pagar() {
    const { purchase } = await window.ApiPurchases.pay(
        id,
        metodoSelecionado,
        descontoAtivo ? descontoAtivo.codigo : null
    );
    pedido = purchase;
}

$("btnPagar").addEventListener("click", async (e) => {
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
        await pagar();

        confetes();

        txt.textContent = "✓ Pagamento aprovado!";
        setTimeout(() => {
            location.href = "resultado.html?id=" + id;
        }, 900);
    } catch (err) {
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
