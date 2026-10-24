/* js/pages/minha-conta.js
   - Sessão: GET /api/auth/me (cookie HttpOnly)
   - Compras: GET /api/purchases (backend)
   - Mídia/capa: IndexedDB local
   - Soft delete: confirmado no servidor; IDs locais antigos são migrados.
*/
document.addEventListener("DOMContentLoaded", async () => {
    const $ = (x) => document.getElementById(x);

    // ================= SESSÃO (API) =================
    let user = null;
    try {
        user = await window.ApiAuth.me();
    } catch (err) {
        if (err && err.code === "RATE_LIMITED") {
            const banner=document.createElement('div');banner.className='account-error';banner.textContent='Muitas tentativas. Aguarde '+(Number(err.retryAfter)||60)+'s e recarregue a página.';document.body.prepend(banner);
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

    function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
    function button(className,text,title){const el=node('button',className,text);el.type='button';if(title)el.title=title;return el;}
    const hasReceipt=p=>p.status==='paid'||p.status==='refunded';
    const statusInfo=p=>p.status==='paid'?{label:'Pago',className:'status-pago'}:p.status==='pending'?{label:'Rascunho',className:'status-rascunho'}:p.status==='refunded'?{label:'Reembolsado',className:'status-reembolsado'}:{label:'Indisponível',className:'status-indisponivel'};
    const photoURLs=[];
    function cleanPhotoURLs(){photoURLs.splice(0).forEach(url=>URL.revokeObjectURL(url));}
    window.addEventListener('pagehide',cleanPhotoURLs);
    function coverURL(value){
        if(value instanceof Blob){const url=URL.createObjectURL(value);photoURLs.push(url);return url;}
        if(typeof value!=='string')return '';
        if(/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value))return value;
        try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}
    }
    const isPago = (p) => p.status === "paid";
    const fmtCents = (cents) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    let filtroAtual = "all";
    let termoBusca = "";

    // ================= TOASTS =================
    function showToast(msg, icon = "✨") {
        const container = $("toastContainer");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.append(node('span','toast-icon',icon),document.createTextNode(' '+msg));
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

            // Migra exclusões antigas deste navegador para a conta autenticada.
            for(const pedido of todosPedidos){if(deletados.has(pedido.id)&&!pedido.deleted){await ApiPurchases.remove(pedido.id);pedido.deleted=true;}}
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
        const ativos = todosPedidos.filter(p => !p.deleted);
        $("statTotal").textContent = ativos.length;
        $('statReembolsados').textContent=ativos.filter(p=>p.status==='refunded').length;
        $("statPagos").textContent = ativos.filter(isPago).length;
        $("statRascunhos").textContent = ativos.filter(p => p.status==='pending').length;
    }

    // Renderiza a Coleção (ignora os removidos)
    function renderGifts() {
        const grid = $("giftsGrid");
        const skeleton = $("skeletonGrid");
        const empty = $("emptyState");
        const noResults = $("noResults");

        skeleton.style.display = "none";
        grid.replaceChildren();
        cleanPhotoURLs();

        const ativos = todosPedidos.filter(p => !p.deleted);

        if (ativos.length === 0) {
            grid.style.display = "none";
            empty.style.display = "block";
            return;
        }

        const filtrados = ativos.filter(p => {
            const matchFiltro = filtroAtual === "all" || (filtroAtual === "pago" && isPago(p)) || (filtroAtual === "rascunho" && p.status==='pending') || (filtroAtual === 'reembolsado' && p.status==='refunded');
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

            const midia=midiaPorId.get(pedido.id);
            const selected=pedido.fotos?.[pedido.fotoCapa||0]||pedido.preview_data_url||midia?.fotos?.[midia.fotoCapa||0];
            const bgURL=coverURL(selected);
            const cover=node('div','gift-cover'),picture=node('div','gift-cover-inner');
            if(bgURL)picture.style.backgroundImage='url('+JSON.stringify(bgURL)+')';
            else picture.style.background='linear-gradient(135deg, #e9a6b8, #7d3048)';
            const state=statusInfo(pedido);cover.append(picture,node('span','gift-status '+state.className,state.label));
            const info=node('div','gift-info'),title=node('h3','gift-title',pedido.titulo||'Sem título'),to=node('div','gift-to');
            to.append(document.createTextNode('Para '),node('b','',pedido.para||'Alguém'),document.createTextNode(' • '+new Date(pedido.created_at).toLocaleDateString('pt-BR')));
            const actions=node('div','gift-actions');
            const pago=isPago(pedido),pending=pedido.status==='pending';
            if(pago){const view=node('a','btn-view','Ver ↗');view.href=(pedido.content_version===1?'ver':'resultado')+'.html?id='+encodeURIComponent(pedido.id);view.target='_blank';view.rel='noopener';actions.append(view);}
            else {const view=button('btn-view',pedido.status==='refunded'?'Reembolsado':'Ver');view.disabled=true;actions.append(view);}
            if(pending){const edit=node('a','btn-edit','Editar');edit.href='criar.html?id='+encodeURIComponent(pedido.id);actions.append(edit);}
            if(pago&&pedido.content_version===1&&pedido.share_token){const share=button('btn-share','🔗','Copiar link');share.dataset.link=new URL('ver.html?token='+encodeURIComponent(pedido.share_token),location.href).href;actions.append(share);}
            if(hasReceipt(pedido)){const receipt=button('btn-receipt','🧾','Ver comprovante');receipt.dataset.id=pedido.id;actions.append(receipt);}
            const remove=button('btn-delete','🗑️','Excluir');remove.dataset.id=pedido.id;remove.dataset.status=pedido.status;actions.append(remove);
            info.append(title,to,actions);card.append(cover,info);

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
                const id = e.currentTarget.getAttribute("data-id");
                const status = e.currentTarget.getAttribute("data-status");
                abrirModalDelete(id, status);
            });
        });

        document.querySelectorAll(".btn-share").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const link = e.currentTarget.getAttribute("data-link");
                try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard indisponível');await navigator.clipboard.writeText(link);showToast('Link copiado!','🔗');}catch{prompt('Copie o link do presente:',link);}
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
        const pagos = todosPedidos.filter(hasReceipt);

        // Ordena do mais recente para o mais antigo
        pagos.sort((a, b) => (b.paid_at || b.created_at) - (a.paid_at || a.created_at));

        if (pagos.length === 0) {
            container.replaceChildren(node('div','tl-empty','Nenhum pagamento realizado ainda.'));
            return;
        }

        container.replaceChildren();

        // Mostra os últimos 5 pagamentos na timeline
        pagos.slice(0, 5).forEach(pedido => {
            const dataObj = new Date(pedido.paid_at || pedido.created_at);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const valor = typeof pedido.amount_paid_cents === "number"
                ? fmtCents(pedido.amount_paid_cents)
                : "—";

            const metodos = { pix: "Pix", card: "Cartão", mercadopago: "Mercado Pago" };
            const metodo = metodos[pedido.payment_method] || "Pix";

            // Aviso visual caso o presente tenha sido apagado da coleção
            const tlItem=button('tl-item','','Ver registro do pagamento');
            const title=node('div','tl-title',pedido.titulo||'Presente');title.title=pedido.titulo||'Presente';
            if(pedido.deleted)title.append(node('span','tl-removed',' (removido)'));
            const status=node('div','tl-status',pedido.status==='refunded'?'Reembolsado':'Pagamento aprovado');
            tlItem.append(node('div','tl-dot'),node('div','tl-date',dataFormatada+' • '+horaFormatada),title,node('div','tl-value',valor),node('div','tl-method',metodo),status);

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

        const metodos = { pix: "Pix", card: "Cartão de Crédito", mercadopago: "Mercado Pago" };
        const metodo = metodos[pedido.payment_method] || "Pix (Aprovação Imediata)";

        $('receiptTitle').textContent=pedido.status==='refunded'?'Pagamento reembolsado':'Pagamento confirmado';
        $('receiptSubtitle').textContent=pedido.status==='refunded'?'Registro da compra reembolsada':'Comprovante de compra';
        $('recStatus').textContent=pedido.status==='refunded'?'Reembolsado':'Aprovado';
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

    // ================= DELETE (confirmado no servidor) =================
    let idParaExcluir = null;
    let statusParaExcluir = null;
    const modal = $("deleteModal");

    function abrirModalDelete(id, status) {
        idParaExcluir = id;
        statusParaExcluir = status;

        const warning = $("deleteWarningText");
        if (status === 'paid'||status==='refunded') {
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

        try {
            await ApiPurchases.remove(idParaExcluir);
            if(pedido)pedido.deleted=true;
            await excluirPedidoDB(idParaExcluir).catch(()=>{});
            showToast('Presente excluído. O link foi desativado e o comprovante foi mantido.', '🛡️');
        } catch(err) {
            showToast(err.message||'Não foi possível excluir.', '⚠️');
            return;
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
