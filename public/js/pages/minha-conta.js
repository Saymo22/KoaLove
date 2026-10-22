/* js/pages/minha-conta.js
   - Sessão: GET /api/auth/me (cookie HttpOnly)
   - Compras: GET /api/purchases (backend)
   - Mídia/capa: IndexedDB local
   - Soft delete: lista local de ids removidos (localStorage)
*/
document.addEventListener("DOMContentLoaded", async () => {
    const $ = (x) => document.getElementById(x);

    // ================= SESSÃO (API) =================
    let user = null;
    try {
        user = await window.ApiAuth.me();
    } catch (err) {
        if (err && err.code === "RATE_LIMITED") {
            document.body.insertAdjacentHTML("afterbegin",
                `<div style="background:#b3263e;color:#fff;padding:10px;text-align:center;font-size:13px;">
                    Muitas tentativas. Aguarde ${err.retryAfter || 60}s e recarregue a página.
                </div>`);
            return;
        }
        window.location.href = "login.html";
        return;
    }

    // Preencher dados do usuário
    $("navAvatar").textContent = (user.name || "U").charAt(0).toUpperCase();
    $("navUserName").textContent = user.name ?? "Usuário";
    $("greetingName").textContent = user.name ?? "usuário";

    // Logout via API
    $("btnLogout").addEventListener("click", async () => {
        await window.ApiAuth.logout();
        window.location.href = "login.html";
    });

    // ================= ESTADO GLOBAL =================
    let todosPedidos = [];       // compras do backend (metadados)
    let midiaPorId = new Map();  // mídia local (IndexedDB) por id
    const DELETED_KEY = "nossoamor_deleted_ids";
    let deletados = new Set();
    try { deletados = new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || "[]")); } catch {}

    const isPago = (p) => p.status === "paid";
    const fmtCents = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let filtroAtual = "all";
    let termoBusca = "";

    // ================= TOASTS =================
    function showToast(msg, icon = "✨") {
        const container = $("toastContainer");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<span class="toast-icon">${icon}</span> ${msg}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("out");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ================= CARREGAR DADOS =================
    async function loadData() {
        const grid = $("giftsGrid");
        const skeleton = $("skeletonGrid");
        const empty = $("emptyState");
        const noResults = $("noResults");

        grid.style.display = "none";
        empty.style.display = "none";
        noResults.style.display = "none";
        skeleton.style.display = "grid";

        try {
            await new Promise(r => setTimeout(r, 400)); // Delay para o Skeleton

            // Compras reais do backend
            ({ purchases: todosPedidos } = await window.ApiPurchases.list());

            // Mídia local (capa, fotos etc.) — blobs ficam no IndexedDB
            const locais = await Promise.all(
                todosPedidos.map(p => buscarPedido(p.id).catch(() => null))
            );
            midiaPorId = new Map(
                todosPedidos.map((p, i) => [p.id, locais[i]]).filter(([, m]) => m)
            );

            atualizarStats();
            renderGifts();
            renderTimeline();

        } catch (err) {
            console.error(err);
            skeleton.style.display = "none";
            grid.style.display = "none";
            if (err && err.code === "NOT_AUTHENTICATED") {
                window.location.href = "login.html";
                return;
            }
            empty.style.display = "block";
            const msg = empty.querySelector("p");
            if (msg && err && err.message) msg.textContent = err.message;
        }
    }

    // Atualiza apenas os cards visíveis (ignora os removidos localmente)
    function atualizarStats() {
        const ativos = todosPedidos.filter(p => !deletados.has(p.id));
        $("statTotal").textContent = ativos.length;
        $("statPagos").textContent = ativos.filter(isPago).length;
        $("statRascunhos").textContent = ativos.filter(p => !isPago(p)).length;
    }

    // Renderiza a Coleção (ignora os removidos)
    function renderGifts() {
        const grid = $("giftsGrid");
        const skeleton = $("skeletonGrid");
        const empty = $("emptyState");
        const noResults = $("noResults");

        skeleton.style.display = "none";
        grid.innerHTML = "";

        const ativos = todosPedidos.filter(p => !deletados.has(p.id));

        if (ativos.length === 0) {
            grid.style.display = "none";
            empty.style.display = "block";
            return;
        }

        const filtrados = ativos.filter(p => {
            const matchFiltro = filtroAtual === "all" || (filtroAtual === "pago" && isPago(p)) || (filtroAtual === "rascunho" && !isPago(p));
            const matchBusca = (p.titulo || "").toLowerCase().includes(termoBusca.toLowerCase()) ||
                               (p.para || "").toLowerCase().includes(termoBusca.toLowerCase());
            return matchFiltro && matchBusca;
        });

        if (filtrados.length === 0) {
            grid.style.display = "none";
            noResults.style.display = "block";
            return;
        }

        grid.style.display = "grid";
        empty.style.display = "none";
        noResults.style.display = "none";

        filtrados.forEach((pedido, index) => {
            const card = document.createElement("div");
            card.className = "gift-card";
            card.style.animationDelay = (index * 0.08) + "s";

            const midia = midiaPorId.get(pedido.id);
            let bgImage = "";
            if (midia && midia.fotos && midia.fotos.length > 0) {
                const fotoCapa = midia.fotos[midia.fotoCapa || 0];
                const url = typeof fotoCapa === "string" ? fotoCapa : URL.createObjectURL(fotoCapa);
                bgImage = `background-image: url('${url}');`;
            } else if (pedido.preview_data_url) {
                bgImage = `background-image: url('${pedido.preview_data_url}');`;
            } else {
                bgImage = "background: linear-gradient(135deg, #e9a6b8, #7d3048);";
            }

            const dataCriacao = new Date(pedido.created_at).toLocaleDateString('pt-BR');
            const pago = isPago(pedido);
            const statusClass = pago ? 'status-pago' : 'status-rascunho';
            const statusText = pago ? 'Pago' : 'Rascunho';

            const btnViewDisabled = !pago ? 'disabled' : '';
            const btnViewTag = !pago ? 'button' : 'a';
            const btnViewHref = pago ? `href="ver.html?id=${pedido.id}" target="_blank"` : '';

            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            const linkCompartilhar = `${baseUrl}ver.html?id=${pedido.id}`;

            const btnReceipt = pago
                ? `<button class="btn-receipt" data-id="${pedido.id}" title="Ver Comprovante">🧾</button>`
                : '';

            card.innerHTML = `
                <div class="gift-cover">
                    <div class="gift-cover-inner" style="${bgImage}"></div>
                    <span class="gift-status ${statusClass}">${statusText}</span>
                </div>
                <div class="gift-info">
                    <h3 class="gift-title">${pedido.titulo || 'Sem título'}</h3>
                    <div class="gift-to">Para <b>${pedido.para || 'Alguém'}</b> • ${dataCriacao}</div>
                    <div class="gift-actions">
                        <${btnViewTag} class="btn-view" ${btnViewHref} ${btnViewDisabled}>Ver ${pago ? '↗' : ''}</${btnViewTag}>
                        <a href="criar.html?id=${pedido.id}" class="btn-edit">Editar</a>
                        ${pago ? `<button class="btn-share" data-link="${linkCompartilhar}" title="Copiar Link">🔗</button>` : ''}
                        ${btnReceipt}
                        <button class="btn-delete" data-id="${pedido.id}" data-status="${pago ? 'paid' : 'pending'}" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;

            if (!window.matchMedia("(pointer: coarse)").matches) {
                card.addEventListener("mousemove", (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px) scale(1.02)`;
                });
                card.addEventListener("mouseleave", () => {
                    card.style.transform = "";
                });
            }

            grid.appendChild(card);
        });

        // Eventos do Card
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const status = e.target.getAttribute("data-status");
                abrirModalDelete(id, status);
            });
        });

        document.querySelectorAll(".btn-share").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const link = e.target.getAttribute("data-link");
                navigator.clipboard.writeText(link).then(() => showToast("Link copiado!", "🔗"));
            });
        });

        document.querySelectorAll(".btn-receipt").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const pedido = todosPedidos.find(p => p.id === id);
                if (pedido) abrirModalComprovante(pedido);
            });
        });
    }

    // Renderiza a Timeline (mantém os pagos removidos!)
    function renderTimeline() {
        const container = $("paymentTimeline");

        // Pega TODOS os pagos, incluindo os removidos da coleção
        const pagos = todosPedidos.filter(isPago);

        // Ordena do mais recente para o mais antigo
        pagos.sort((a, b) => (b.paid_at || b.created_at) - (a.paid_at || a.created_at));

        if (pagos.length === 0) {
            container.innerHTML = `<div class="tl-empty">Nenhum pagamento realizado ainda.</div>`;
            return;
        }

        container.innerHTML = "";

        // Mostra os últimos 5 pagamentos na timeline
        pagos.slice(0, 5).forEach(pedido => {
            const dataObj = new Date(pedido.paid_at || pedido.created_at);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const valor = typeof pedido.amount_paid_cents === "number"
                ? fmtCents(pedido.amount_paid_cents)
                : "—";

            const metodos = { pix: "Pix", card: "Cartão" };
            const metodo = metodos[pedido.payment_method] || "Pix";

            // Aviso visual caso o presente tenha sido apagado da coleção
            const badgeRemovido = deletados.has(pedido.id) ? `<span style="font-size:10px; font-weight:400; color:#a08a93;">(removido)</span>` : "";

            const tlItem = document.createElement("div");
            tlItem.className = "tl-item";
            tlItem.innerHTML = `
                <div class="tl-dot"></div>
                <div class="tl-date">${dataFormatada} • ${horaFormatada}</div>
                <div class="tl-title" title="${pedido.titulo || 'Presente'}">${pedido.titulo || 'Presente'} ${badgeRemovido}</div>
                <div class="tl-value">${valor}</div>
                <div class="tl-method">${metodo}</div>
            `;

            // Clicar na timeline abre o comprovante
            tlItem.addEventListener("click", () => abrirModalComprovante(pedido));
            container.appendChild(tlItem);
        });
    }

    // ================= COMPROVANTE =================
    function abrirModalComprovante(pedido) {
        const dataObj = new Date(pedido.paid_at || pedido.created_at);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const valor = typeof pedido.amount_paid_cents === "number"
            ? fmtCents(pedido.amount_paid_cents)
            : "—";

        const metodos = { pix: "Pix", card: "Cartão de Crédito" };
        const metodo = metodos[pedido.payment_method] || "Pix (Aprovação Imediata)";

        $("recId").textContent = String(pedido.id).toUpperCase();
        $("recTitulo").textContent = pedido.titulo || "Presente Personalizado";
        $("recData").textContent = dataFormatada;
        $("recHora").textContent = horaFormatada;
        $("recMetodo").textContent = metodo;
        $("recValor").textContent = valor;

        $("receiptModal").classList.add("on");
    }

    $("btnCloseReceipt").addEventListener("click", () => $("receiptModal").classList.remove("on"));
    $("btnPrintReceipt").addEventListener("click", () => window.print());

    // ================= FILTROS E BUSCA =================
    $("searchInput").addEventListener("input", (e) => {
        termoBusca = e.target.value;
        renderGifts();
    });

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroAtual = btn.getAttribute("data-filter");
            renderGifts();
        });
    });

    // ================= DELETE (soft delete local) =================
    let idParaExcluir = null;
    let statusParaExcluir = null;
    const modal = $("deleteModal");

    function abrirModalDelete(id, status) {
        idParaExcluir = id;
        statusParaExcluir = status;

        const warning = $("deleteWarningText");
        if (status === 'paid') {
            warning.innerHTML = "Tem certeza que deseja apagar este presente?<br><br><b>Nota:</b> O comprovante continuará seguro no seu Histórico de Pagamentos.";
        } else {
            warning.innerHTML = "Tem certeza que deseja apagar este rascunho? Essa ação não pode ser desfeita.";
        }

        modal.classList.add("on");
    }

    $("btnCancelDelete").addEventListener("click", () => {
        modal.classList.remove("on");
        idParaExcluir = null;
        statusParaExcluir = null;
    });

    $("btnConfirmDelete").addEventListener("click", async () => {
        if (!idParaExcluir) return;
        modal.classList.remove("on");
        showToast("Processando...", "⏳");

        const pedido = todosPedidos.find(p => p.id === idParaExcluir);

        // Marca como removido na coleção (o comprovante/timeline fica)
        deletados.add(idParaExcluir);
        try { localStorage.setItem(DELETED_KEY, JSON.stringify([...deletados])); } catch {}

        if (pedido && !isPago(pedido)) {
            // Rascunho: apaga também a mídia local
            await excluirPedidoDB(idParaExcluir).catch(() => {});
            showToast("Rascunho excluído.", "🗑️");
        } else {
            showToast("Presente removido. O comprovante foi mantido no histórico.", "🛡️");
        }

        atualizarStats();
        renderGifts();
        renderTimeline();

        idParaExcluir = null;
        statusParaExcluir = null;
    });

    // Init
    loadData();
});
