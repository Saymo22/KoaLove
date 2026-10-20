/* js/pages/minha-conta.js */
document.addEventListener("DOMContentLoaded", () => {
    if (!estaLogado()) {
        window.location.href = "login.html";
        return;
    }

    const user = getUsuarioLogado();
    const $ = (x) => document.getElementById(x);

    // Preencher dados do usuário
    $("navAvatar").textContent = user.name.charAt(0).toUpperCase();
    $("navUserName").textContent = user.name;
    $("greetingName").textContent = user.name;

    // Logout
    $("btnLogout").addEventListener("click", () => {
        fazerLogout();
        window.location.href = "login.html";
    });

    // ================= ESTADO GLOBAL =================
    let todosPedidos = [];
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
            if (typeof listarTodosPedidos !== "function") {
                throw new Error("A função listarTodosPedidos não existe no db.js");
            }
            
            await new Promise(r => setTimeout(r, 600)); // Delay para o Skeleton

            todosPedidos = await listarTodosPedidos();
            todosPedidos.sort((a, b) => b.criadoEm - a.criadoEm);

            atualizarStats();
            renderGifts();
            renderTimeline();

        } catch (err) {
            console.error(err);
            skeleton.style.display = "none";
            grid.style.display = "none";
            empty.style.display = "block";
        }
    }

    // Atualiza apenas os cards visíveis (ignora os deletados)
    function atualizarStats() {
        const ativos = todosPedidos.filter(p => !p.deletado);
        $("statTotal").textContent = ativos.length;
        $("statPagos").textContent = ativos.filter(p => p.status === 'pago').length;
        $("statRascunhos").textContent = ativos.filter(p => p.status !== 'pago').length;
    }

    // Renderiza a Coleção (ignora os deletados)
    function renderGifts() {
        const grid = $("giftsGrid");
        const skeleton = $("skeletonGrid");
        const empty = $("emptyState");
        const noResults = $("noResults");
        
        skeleton.style.display = "none";
        grid.innerHTML = "";

        const ativos = todosPedidos.filter(p => !p.deletado);

        if (ativos.length === 0) {
            grid.style.display = "none";
            empty.style.display = "block";
            return;
        }

        const filtrados = ativos.filter(p => {
            const matchFiltro = filtroAtual === "all" || (filtroAtual === "pago" && p.status === "pago") || (filtroAtual === "rascunho" && p.status !== "pago");
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

            let bgImage = "";
            if (pedido.fotos && pedido.fotos.length > 0) {
                const fotoCapa = pedido.fotos[pedido.fotoCapa || 0];
                const url = typeof fotoCapa === "string" ? fotoCapa : URL.createObjectURL(fotoCapa);
                bgImage = `background-image: url('${url}');`;
            } else {
                bgImage = "background: linear-gradient(135deg, #e9a6b8, #7d3048);";
            }

            const dataCriacao = new Date(pedido.criadoEm).toLocaleDateString('pt-BR');
            const statusClass = pedido.status === 'pago' ? 'status-pago' : 'status-rascunho';
            const statusText = pedido.status === 'pago' ? 'Pago' : 'Rascunho';
            
            const btnViewDisabled = pedido.status !== 'pago' ? 'disabled' : '';
            const btnViewTag = pedido.status !== 'pago' ? 'button' : 'a';
            const btnViewHref = pedido.status === 'pago' ? `href="ver.html?id=${pedido.id}" target="_blank"` : '';

            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            const linkCompartilhar = `${baseUrl}ver.html?id=${pedido.id}`;

            const btnReceipt = pedido.status === 'pago' 
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
                        <${btnViewTag} class="btn-view" ${btnViewHref} ${btnViewDisabled}>Ver ${pedido.status === 'pago' ? '↗' : ''}</${btnViewTag}>
                        <a href="criar.html?id=${pedido.id}" class="btn-edit">Editar</a>
                        ${pedido.status === 'pago' ? `<button class="btn-share" data-link="${linkCompartilhar}" title="Copiar Link">🔗</button>` : ''}
                        ${btnReceipt}
                        <button class="btn-delete" data-id="${pedido.id}" data-status="${pedido.status}" title="Excluir">🗑️</button>
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

    // Renderiza a Timeline (Mantém os pagos deletados!)
    function renderTimeline() {
        const container = $("paymentTimeline");
        
        // Pega TODOS os pagos, ignorando a flag "deletado"
        const pagos = todosPedidos.filter(p => p.status === 'pago');
        
        // Ordena do mais recente para o mais antigo
        pagos.sort((a, b) => (b.pagoEm || b.criadoEm) - (a.pagoEm || a.criadoEm));

        if (pagos.length === 0) {
            container.innerHTML = `<div class="tl-empty">Nenhum pagamento realizado ainda.</div>`;
            return;
        }

        container.innerHTML = "";

        // Mostra os últimos 5 pagamentos na timeline
        pagos.slice(0, 5).forEach(pedido => {
            const dataObj = new Date(pedido.pagoEm || pedido.criadoEm);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const valor = pedido.valorPago 
                ? pedido.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                : "R$ 19,90";

            const metodos = { pix: "Pix", cartao: "Cartão" };
            const metodo = metodos[pedido.metodoPagamento] || "Pix";
            
            // Aviso visual caso o presente tenha sido apagado da coleção
            const badgeRemovido = pedido.deletado ? `<span style="font-size:10px; font-weight:400; color:#a08a93;">(removido)</span>` : "";

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
        const dataObj = new Date(pedido.pagoEm || pedido.criadoEm);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const valor = pedido.valorPago 
            ? pedido.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
            : "R$ 19,90";

        const metodos = { pix: "Pix", cartao: "Cartão de Crédito" };
        const metodo = metodos[pedido.metodoPagamento] || "Pix (Aprovação Imediata)";

        $("recId").textContent = pedido.id.toUpperCase();
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

    // ================= DELETE =================
    let idParaExcluir = null;
    let statusParaExcluir = null;
    const modal = $("deleteModal");

    function abrirModalDelete(id, status) {
        idParaExcluir = id;
        statusParaExcluir = status;
        
        const warning = $("deleteWarningText");
        if (status === 'pago') {
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
        if (idParaExcluir && typeof excluirPedidoDB === "function") {
            modal.classList.remove("on");
            showToast("Processando...", "⏳");
            
            const pedido = todosPedidos.find(p => p.id === idParaExcluir);
            
            if (pedido && pedido.status === 'pago') {
                pedido.deletado = true;
                await salvarPedido(pedido);
                showToast("Presente removido. O comprovante foi mantido no histórico.", "🛡️");
            } else {
                await excluirPedidoDB(idParaExcluir);
                showToast("Rascunho excluído.", "🗑️");
            }
            
            if (pedido && pedido.status === 'pago') {
                const idx = todosPedidos.findIndex(p => p.id === idParaExcluir);
                if (idx > -1) todosPedidos[idx].deletado = true;
            } else {
                todosPedidos = todosPedidos.filter(p => p.id !== idParaExcluir);
            }
            
            atualizarStats();
            renderGifts();
            renderTimeline();
            
            idParaExcluir = null;
            statusParaExcluir = null;
        }
    });

    // Init
    loadData();
});