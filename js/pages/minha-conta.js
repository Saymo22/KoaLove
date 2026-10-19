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

        } catch (err) {
            console.error(err);
            // Em vez de mostrar erro vermelho feio, mostra a tela de vazio elegante
            skeleton.style.display = "none";
            grid.style.display = "none";
            empty.style.display = "block";
            
            // Se quiser testar o layout com cards, descomente as linhas abaixo:
            /*
            empty.style.display = "none";
            grid.style.display = "grid";
            */
        }
    }

    function atualizarStats() {
        $("statTotal").textContent = todosPedidos.length;
        $("statPagos").textContent = todosPedidos.filter(p => p.status === 'pago').length;
        $("statRascunhos").textContent = todosPedidos.filter(p => p.status !== 'pago').length;
    }

    function renderGifts() {
        const grid = $("giftsGrid");
        const skeleton = $("skeletonGrid");
        const empty = $("emptyState");
        const noResults = $("noResults");
        
        skeleton.style.display = "none";
        grid.innerHTML = "";

        if (todosPedidos.length === 0) {
            grid.style.display = "none";
            empty.style.display = "block";
            return;
        }

        const filtrados = todosPedidos.filter(p => {
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
                        <button class="btn-delete" data-id="${pedido.id}" title="Excluir">🗑️</button>
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

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                abrirModalDelete(id);
            });
        });

        document.querySelectorAll(".btn-share").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const link = e.target.getAttribute("data-link");
                navigator.clipboard.writeText(link).then(() => {
                    showToast("Link copiado!", "🔗");
                });
            });
        });
    }

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

    let idParaExcluir = null;
    const modal = $("deleteModal");

    function abrirModalDelete(id) {
        idParaExcluir = id;
        modal.classList.add("on");
    }

    $("btnCancelDelete").addEventListener("click", () => {
        modal.classList.remove("on");
        idParaExcluir = null;
    });

    $("btnConfirmDelete").addEventListener("click", async () => {
        if (idParaExcluir && typeof excluirPedidoDB === "function") {
            modal.classList.remove("on");
            showToast("Excluindo...", "⏳");
            
            await excluirPedidoDB(idParaExcluir);
            
            todosPedidos = todosPedidos.filter(p => p.id !== idParaExcluir);
            atualizarStats();
            renderGifts();
            
            showToast("Presente excluído.", "🗑️");
            idParaExcluir = null;
        }
    });

    loadData();
});