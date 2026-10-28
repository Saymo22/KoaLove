    const id = parametro("id");
    const $ = (x) => document.getElementById(x);
    $('btnBaixar').disabled = true;

    // NAVBAR SCROLL
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
       BOOT (contrato: GET /api/purchases/:id)
    ===================================================== */
    (async function () {
        if (!id) { location.href = "/criar-presente"; return; }

        let pedido = null;
        try {
            ({ purchase: pedido } = await window.ApiPurchases.getOne(id));
        } catch (err) {
            if (err && (err.code === "NOT_AUTHENTICATED" || err.status === 401)) {
                location.href = "/entrar";
                return;
            }
            location.href = "/criar-presente";
            return;
        }
        if (pedido.status !== "paid") { location.href = "/pagamento?id=" + id; return; }

        if(pedido.content_version!==1){
          try {
            const local=await buscarPedido(id);
            if(!local?.fotos?.length)throw new Error('Abra esta página no navegador onde criou o presente antigo para sincronizar suas fotos.');
            ({purchase:pedido}=await NAGift.sync(NAGift.prepare({...local,...pedido,fotos:local.fotos,videos:local.videos||[],musica:local.musica||null,themeData:local.themeData||pedido.themeData}),id,true));
          }catch(err){$('link').value=err.message;return;}
        }
        // Temas vêm de GET /api/config
        try { await window.NA_CONFIG_READY; } catch {}
        aplicarTema(pedido.tema);

        const url = new URL("/presente?token=" + encodeURIComponent(pedido.share_token), location.href).href;
        $("link").value = url;
        $("btnVer").href = url;
        $("btnWpp").href = "https://wa.me/?text=" + encodeURIComponent("Fiz uma surpresa para você ❤️ " + url);

        /* ---- Preview inline (modo embed = sem intro, sem float controls) ---- */
        const iframe = $("rsPreviewIframe");
        const btnFull = $("btnFullPreview");
        if (iframe) iframe.src = "/presente?id=" + id + "&embed=1";
        if (btnFull) btnFull.href = url;

        /* ---- QR Code ---- */
        try {
            await GiftQrCode.render($('qr'), url);
            $('btnBaixar').disabled = false;
        } catch (e) {
            $('qr').textContent = 'Não foi possível gerar o QR Code. Copie o link do presente abaixo.';
        }

        setTimeout(() => celebrar(), 500);
    })();

    /* =====================================================
       COPIAR LINK
    ===================================================== */
    async function copiarLink(btn, textoOriginal) {
        const url = $("link").value;
        try {
            await navigator.clipboard.writeText(url);
        } catch (e) {
            $("link").select();
            document.execCommand("copy");
        }
        btn.classList.add("ok");
        const alvo = btn.querySelector("span:last-child") || btn;
        const backup = textoOriginal || alvo.textContent;
        alvo.textContent = "✓ Copiado!";
        setTimeout(() => {
            btn.classList.remove("ok");
            alvo.textContent = backup;
        }, 2000);
    }

    $("btnCopiar").addEventListener("click", (e) => {
        ripple(e, $("btnCopiar"));
        copiarLink($("btnCopiar"), "Copiar");
    });

    $("btnCopiar2").addEventListener("click", (e) => {
        e.preventDefault();
        ripple(e, $("btnCopiar2"));
        const span = $("btnCopiar2").querySelector("span:last-child");
        copiarLink($("btnCopiar2"), span.textContent);
    });

    /* =====================================================
       BAIXAR QR
    ===================================================== */
    $("btnBaixar").addEventListener("click", (e) => {
        ripple(e, $("btnBaixar"));
        const canvas = $("qr").querySelector("canvas");
        const img = $("qr").querySelector("img");
        if (!canvas && !img) return;
        const a = document.createElement("a");
        a.download = "qrcode-presente.png";
        a.href = canvas ? canvas.toDataURL("image/png") : (img ? img.src : "");
        if (a.href) a.click();
    });

    /* =====================================================
       RIPPLE GENÉRICO
    ===================================================== */
    function ripple(e, el) {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const r = document.createElement("span");
        r.className = "ripple";
        r.style.width = r.style.height = size + "px";
        r.style.left = (e.clientX - rect.left - size / 2) + "px";
        r.style.top = (e.clientY - rect.top - size / 2) + "px";
        el.appendChild(r);
        setTimeout(() => r.remove(), 600);
    }
    document.querySelectorAll(".rs-btn.wpp").forEach(b => {
        b.addEventListener("click", (e) => ripple(e, b));
    });

    /* =====================================================
       CONFETES
    ===================================================== */
    function celebrar() {
        const simbolos = ["♥", "♡", "✦", "✧", "❤️", "🎉", "✨"];
        for (let i = 0; i < 30; i++) {
            const c = document.createElement("span");
            c.className = "rs-confete";
            c.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
            c.style.left = Math.random() * 100 + "vw";
            c.style.animationDelay = (Math.random() * 0.6) + "s";
            c.style.animationDuration = (2.4 + Math.random() * 1.6) + "s";
            c.style.fontSize = (12 + Math.random() * 16) + "px";
            c.style.color = Math.random() > .5 ? "#c9a86a" : "#d96c8a";
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 4500);
        }
    }
