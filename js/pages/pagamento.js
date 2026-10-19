        const id = parametro("id");
        let pedido = null;
        let metodoSelecionado = "pix";
        const $ = (x) => document.getElementById(x);

        // NAVBAR SCROLL
        (function () {
            const progress = $("scrollProgress");
            const nav = $("nav");
            window.addEventListener("scroll", () => {
                const h = document.documentElement;
                progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
                nav.classList.toggle("scrolled", window.scrollY > 30);
            }, { passive: true });
        })();

        /* =====================================================
           BOOT
        ===================================================== */
        (async function () {
            pedido = id ? await buscarPedido(id) : null;
            if (!pedido) { location.href = "criar.html"; return; }
            if (pedido.status === "pago") { location.href = "resultado.html?id=" + id; return; }

            aplicarTema(pedido.tema);
            const t = THEMES[pedido.tema];

            /* Emoji do tema no card */
            $("pgEmoji").textContent = t.emoji || "🎁";

            /* Título + subtítulo */
            const tituloPresente = pedido.titulo || "Seu presente personalizado";
            $("pgTitulo").textContent = "🎁 " + tituloPresente;
            $("pgSubtitulo").textContent =
                "De " + (pedido.de || "você") + " para " + (pedido.para || "alguém especial");

            /* Monta as linhas do resumo */
            const linhas = [
                ["Tema", t.emoji + " " + t.nome, "🎨"],
                ["Para", pedido.para, "💌"],
                ["Fotos", pedido.fotos.length + (pedido.fotos.length === 1 ? " foto" : " fotos"), "📸"],
                ["Vídeos", pedido.videos.length + (pedido.videos.length === 1 ? " vídeo" : " vídeos"), "🎬"],
                ["Música", pedido.musica ? (pedido.musicaNome || "Incluída") : "—", "🎵"],
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

            /* Total com contagem animada */
            animarTotal(formatarPreco(CONFIG.preco));

            /* Modo teste */
            if (CONFIG.modoTeste) {
                $("avisoTeste").classList.add("on");
                $("btnPagarTxt").textContent = "✨ Simular pagamento aprovado";
            }
        })();

        /* =====================================================
           TOTAL ANIMADO
        ===================================================== */
        function animarTotal(valorFormatado) {
            const numero = Number(CONFIG.preco);
            const elemento = $("total");
            const inicio = performance.now();
            const dur = 900;
            function tick(now) {
                const p = Math.min((now - inicio) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const atual = numero * eased;
                elemento.textContent = atual.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });
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

                if (!CONFIG.modoTeste) {
                    $("btnPagarTxt").textContent = metodoSelecionado === "pix"
                        ? "🔒 Pagar com Pix"
                        : "🔒 Pagar com cartão";
                }
            });
        });

        /* =====================================================
           CUPOM
        ===================================================== */
        $("pgCupomBtn").addEventListener("click", () => {
            const codigo = $("pgCupom").value.trim().toUpperCase();
            const el = $("pgCupom");
            if (!codigo) {
                el.focus();
                el.style.borderColor = "#b3263e";
                setTimeout(() => el.style.borderColor = "", 900);
                return;
            }
            el.style.borderColor = "var(--ouro)";
            el.style.background = "linear-gradient(135deg, #fff8e6, #fffbe9)";
            $("pgCupomBtn").textContent = "✓ Aplicado";
            $("pgCupomBtn").style.background = "rgba(201, 168, 106, .15)";
            setTimeout(() => {
                $("pgCupomBtn").textContent = "Aplicar";
                $("pgCupomBtn").style.background = "";
            }, 2500);
        });

        /* =====================================================
           PAGAMENTO
        ===================================================== */
        async function pagar() {
            if (!CONFIG.modoTeste) {
                throw new Error("Gateway de pagamento ainda não integrado.");
            }
            pedido.status = "pago";
            pedido.pagoEm = Date.now();
            pedido.metodoPagamento = metodoSelecionado;
            await salvarPedido(pedido);
        }

        $("btnPagar").addEventListener("click", async (e) => {
            const btn = $("btnPagar");
            const txt = $("btnPagarTxt");

            /* Ripple */
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
            ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);

            /* Estado loading */
            btn.disabled = true;
            const textoOriginal = txt.textContent;
            txt.innerHTML = '<span class="pg-spinner"></span> Processando...';
            $("erro").textContent = "";

            try {
                await new Promise(r => setTimeout(r, 900));
                await pagar();

                confetes();

                txt.textContent = "✓ Pagamento aprovado!";
                setTimeout(() => {
                    location.href = "resultado.html?id=" + id;
                }, 900);
            } catch (err) {
                $("erro").textContent = err.message || "Falha no pagamento.";
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
