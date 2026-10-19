/* =====================================================
   HELPERS GLOBAIS E PROTEÇÃO DE TELA
===================================================== */
const $ = (x) => document.getElementById(x);
let hasMusic = false, activeAudioId = null, pedidoAtual = null, _pvnSlideInterval = null;

const isDemo = new URLSearchParams(location.search).get("demo") === "1";
const isEmbed = new URLSearchParams(location.search).get("embed") === "1";
const demoTema = new URLSearchParams(location.search).get("tema") || "namoro";

function getFotoURL(f) { return typeof f === "string" ? f : URL.createObjectURL(f); }

// Função que ESCONDE a tela de intro APENAS se houver erro.
function forcarFimDoIntro() {
    const ov = $("introOverlay");
    if (ov) { 
        ov.classList.add("done"); 
        ov.style.display = "none"; 
    }
    const skel = $("skeletonLoader");
    if (skel) skel.classList.remove("on", "out");
}

function mostrarMensagem(txt) {
    forcarFimDoIntro(); // Impede o bug do "coração infinito"
    const msgEl = $("msg");
    msgEl.innerHTML = txt;
    msgEl.classList.add("on");
    $("conteudo").style.display = "none";
}

function mostrarErro(etapa, err) {
    forcarFimDoIntro();
    const detalhe = err ? (err.message || String(err)) : "";
    const msgEl = $("msg");
    msgEl.innerHTML =
        "<div>" +
            "<div style='font-size:42px;margin-bottom:16px'>⚠️</div>" +
            "<div style='font-size:26px;margin-bottom:14px'>" + etapa + "</div>" +
            (detalhe ? "<div style='font-size:13px;font-family:monospace;background:rgba(0,0,0,.06);padding:12px 18px;border-radius:8px;max-width:520px;line-height:1.6;word-break:break-word;margin:0 auto'>" + detalhe + "</div>" : "") +
            "<div style='font-size:13px;margin-top:24px;opacity:.7;font-family:Poppins,sans-serif'>Abra o DevTools (F12) → Console para mais detalhes.</div>" +
        "</div>";
    msgEl.classList.add("on");
    console.error("[ver] Erro em:", etapa, err);
}

/* =====================================================
   INTRO (CORTAÇÃO E ANIMAÇÃO DOS NOMES)
===================================================== */
function mostrarIntro(p) {
    const overlay = $("introOverlay");
    
    // Se for demo, embed ou o usuário desativou a intro, apenas fecha
    if (p.usarIntro === false || isDemo || isEmbed) {
        overlay.classList.add("done");
        if (!isDemo && !isEmbed) setTimeout(gerarCoracoesAmbiente, 300);
        return;
    }
    
    // Preenche os nomes
    const paraEl = overlay.querySelector(".intro-para");
    const deEl = overlay.querySelector(".intro-de");
    const lineEl = overlay.querySelector(".intro-line");
    
    paraEl.textContent = "Para " + (p.para || "você");
    deEl.textContent = "de " + (p.de || "quem te ama");
    
    // Força a animação a recomeçar AGORA que os nomes estão preenchidos
    paraEl.style.animation = 'none';
    deEl.style.animation = 'none';
    lineEl.style.animation = 'none';
    void paraEl.offsetWidth; // Truque para forçar o navegador a recalcular o layout
    
    paraEl.classList.add("animate");
    deEl.classList.add("animate");
    lineEl.classList.add("animate");
    
    // Esconde o coração depois que a animação terminar
    setTimeout(() => { 
        overlay.classList.add("done"); 
        setTimeout(gerarCoracoesAmbiente, 800); 
    }, 3200);
}

function gerarCoracoesAmbiente() {
    const simbolos = ["♥", "♡", "✦", "✧"];
    for (let i = 0; i < 6; i++) {
        const h = document.createElement("div");
        h.className = "ambient-heart";
        h.textContent = simbolos[i % simbolos.length];
        h.style.left = (Math.random() * 100) + "vw";
        h.style.animationDelay = (Math.random() * 10) + "s";
        h.style.animationDuration = (10 + Math.random() * 8) + "s";
        h.style.fontSize = (14 + Math.random() * 14) + "px";
        document.body.appendChild(h);
    }
}

/* =====================================================
   SCROLL E CONTROLES FLUTUANTES
===================================================== */
(function () {
    const progress = $("scrollProgress"), controls = $("floatControls");
    window.addEventListener("scroll", () => {
        const h = document.documentElement;
        const st = h.scrollTop || document.body.scrollTop;
        const sh = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
        progress.style.width = (st / sh) * 100 + "%";
        controls.classList.toggle("on", window.scrollY > 300);
    }, { passive: true });
})();

$("btnTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
$("btnShare").addEventListener("click", async () => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title: document.title, url }); } catch(e) {} }
    else { try { await navigator.clipboard.writeText(url); $("btnShare").textContent = "✓"; setTimeout(() => $("btnShare").textContent = "↗", 1500); } catch(e) { prompt("Copie o link:", url); } }
});

/* =====================================================
   MÚSICA
===================================================== */
function getActiveAudio() {
    const ids = ["audio", "spAudio", "lvAudio", "nfAudio", "ciAudio", "reAudio", "caAudio", "scAudio", "jaAudio"];
    for (const id of ids) { const el = document.getElementById(id); if (el && el.src) return el; }
    return null;
}
function atualizarBotaoMusica() {
    const btn = $("btnMusic");
    if (!hasMusic || isDemo) { btn.style.display = "none"; return; }
    btn.style.display = "flex";
    const audio = getActiveAudio();
    if (audio && !audio.paused) { btn.classList.add("playing"); btn.textContent = "❚❚"; }
    else { btn.classList.remove("playing"); btn.textContent = "🎵"; }
}
$("btnMusic").addEventListener("click", () => {
    const audio = getActiveAudio();
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
});
document.addEventListener("play", (e) => {
    if (e.target.tagName === "AUDIO") {
        atualizarBotaoMusica();
        document.querySelectorAll("video").forEach(v => { if (!v.paused) v.pause(); });
    }
}, true);
document.addEventListener("pause", (e) => {
    if (e.target.tagName === "AUDIO") atualizarBotaoMusica();
}, true);
document.addEventListener("play", (e) => {
    if (e.target.tagName === "VIDEO") {
        const audio = getActiveAudio();
        if (audio && !audio.paused) audio.pause();
    }
}, true);

/* =====================================================
   LIGHTBOX
===================================================== */
const lb = { el: $("lightbox"), img: $("lbImg"), lista: [], idx: 0 };
function getActiveLayout() { return [...document.querySelectorAll("#layoutPadrao, #layoutCartaAntiga, #layoutScrapbook, #layoutJardim, #layoutCinema, #layoutRetro, #layoutNetflix, #layoutSpotify, #layoutVinil")].find(el => el.style.display !== "none"); }
function getLightboxImages() {
    const layout = getActiveLayout();
    if (!layout) return [];
    return [...layout.querySelectorAll("img")].filter(img => {
        if (img.closest(".story-header, #qr, .pvsp-player, .pvn-nav, .story-card")) return false;
        const r = img.getBoundingClientRect();
        return r.width >= 40 && r.height >= 40;
    });
}
function abrirLightbox(lista, idx) { lb.lista = lista; lb.idx = idx; atualizarLightbox(); lb.el.classList.add("on"); document.body.style.overflow = "hidden"; }
function atualizarLightbox() {
    const img = lb.lista[lb.idx];
    if (!img) return;
    lb.img.src = img.src; lb.img.alt = img.alt || "Foto";
    const lbLeg = $("lbLegenda");
    let legenda = "";
    const idxLeg = img.dataset.idxLegenda;
    if (idxLeg !== undefined && pedidoAtual && Array.isArray(pedidoAtual.legendas)) legenda = pedidoAtual.legendas[Number(idxLeg)] || "";
    lbLeg.textContent = legenda;
    lbLeg.classList.toggle("on", !!legenda);
}
function fecharLightbox() { lb.el.classList.remove("on"); document.body.style.overflow = ""; }

$("lbClose").addEventListener("click", fecharLightbox);
$("lbPrev").addEventListener("click", () => { lb.idx = (lb.idx - 1 + lb.lista.length) % lb.lista.length; atualizarLightbox(); });
$("lbNext").addEventListener("click", () => { lb.idx = (lb.idx + 1) % lb.lista.length; atualizarLightbox(); });
lb.el.addEventListener("click", (e) => { if (e.target === lb.el) fecharLightbox(); });
document.addEventListener("keydown", (e) => {
    if (!lb.el.classList.contains("on")) return;
    if (e.key === "Escape") fecharLightbox();
    if (e.key === "ArrowLeft") $("lbPrev").click();
    if (e.key === "ArrowRight") $("lbNext").click();
});
document.addEventListener("click", (e) => {
    if (lb.el.classList.contains("on")) return;
    const img = e.target.closest("img");
    if (!img || img.id === "lbImg" || !img.closest("#conteudo")) return;
    const lista = getLightboxImages();
    const idx = lista.indexOf(img);
    if (idx === -1) return;
    e.preventDefault();
    abrirLightbox(lista, idx);
});

/* =====================================================
   REVEAL E EFEITOS
===================================================== */
function initReveal() {
    const els = document.querySelectorAll(".rv");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("revealed")); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    els.forEach(el => io.observe(el));
}

function initTilt() {
    const fotos = document.querySelectorAll("#layoutPadrao .foto");
    if (window.matchMedia("(pointer: coarse)").matches) return;
    fotos.forEach(foto => {
        foto.addEventListener("mousemove", (e) => {
            const rect = foto.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const cx = rect.width / 2, cy = rect.height / 2;
            foto.style.transform = `perspective(1000px) rotateX(${((y - cy) / cy) * -10}deg) rotateY(${((x - cx) / cx) * 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        foto.addEventListener("mouseleave", () => { foto.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"; });
    });
}

function initCounters() {
    const numeros = document.querySelectorAll("#layoutPadrao .tempo strong");
    if (!numeros.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                const el = en.target;
                const final = parseInt(el.dataset.final || el.textContent.replace(/\D/g, ""), 10);
                const format = el.id === "dias" || el.id === "horas";
                const dur = 1800, t0 = performance.now();
                (function tick(now) {
                    const p = Math.min((now - t0) / dur, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    const val = Math.round(final * eased);
                    el.textContent = format ? val.toLocaleString("pt-BR") : val;
                    if (p < 1) requestAnimationFrame(tick);
                })(t0);
                io.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    numeros.forEach(n => io.observe(n));
}

let parallaxRAF = null;
window.addEventListener("scroll", () => {
    if (parallaxRAF) return;
    parallaxRAF = requestAnimationFrame(() => {
        parallaxRAF = null;
        const hero = $("hero");
        if (hero && hero.offsetParent) hero.style.backgroundPositionY = `calc(50% + ${window.scrollY * 0.35}px)`;
    });
}, { passive: true });

/* =====================================================
   HELPERS DE RENDERIZAÇÃO COMPARTILHADOS
===================================================== */
function _fillContador(prefixo, t) {
    $(prefixo + "Anos").textContent = t.anos;
    $(prefixo + "Meses").textContent = t.meses;
    $(prefixo + "Dias").textContent = t.dias.toLocaleString("pt-BR");
    $(prefixo + "Horas").textContent = t.horas.toLocaleString("pt-BR");
}
function _renderEventos(containerId, eventos, template, incluirHoje, t) {
    const wrap = $(containerId); wrap.innerHTML = "";
    const all = [...eventos];
    if (incluirHoje && t) all.push({ data: new Date().toLocaleDateString("pt-BR"), titulo: "Hoje", texto: textoDuracao(t) + " construindo nossa história." });
    all.forEach(ev => wrap.insertAdjacentHTML("beforeend", template(ev)));
}
function _renderGaleria(containerId, urls, classes) {
    const wrap = $(containerId); wrap.innerHTML = "";
    if (!urls.length) { wrap.style.display = "none"; return; }
    urls.slice(0, 6).forEach((u, i) => {
        const d = document.createElement("div");
        d.className = classes.foto;
        const img = document.createElement("img");
        img.src = u; img.alt = "Foto " + (i + 1); img.dataset.idxLegenda = i;
        d.appendChild(img);
        if (classes.legenda) {
            const leg = document.createElement("div");
            leg.className = classes.legenda;
            leg.textContent = (pedidoAtual && pedidoAtual.legendas && pedidoAtual.legendas[i]) || "";
            d.appendChild(leg);
        }
        wrap.appendChild(d);
    });
}
function _renderChips(containerId, chipClass, amo) {
    const wrap = $(containerId); wrap.innerHTML = "";
    if (!amo || !amo.length) { wrap.style.display = "none"; return; }
    amo.forEach(txt => { const c = document.createElement("div"); c.className = chipClass; c.textContent = txt; wrap.appendChild(c); });
}

/* =====================================================
   RENDERIZADORES DOS TEMAS
===================================================== */
function renderPadrao(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    const capaIdx = Math.min(p.fotoCapa || 0, urls.length - 1);
    $("hero").style.background = "linear-gradient(rgba(80,25,43,.35),rgba(80,25,43,.55)), url('" + (urls[capaIdx] || urls[0]) + "') center/cover";
    $("pequeno").textContent = tema.pequeno;
    $("titulo").textContent = p.titulo;
    $("duracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    document.querySelectorAll(".pol").forEach((img, i) => img.src = urls[(i + 1) % urls.length]);
    $("anos").dataset.final = t.anos; $("meses").dataset.final = t.meses; $("dias").dataset.final = t.dias; $("horas").dataset.final = t.horas;
    function addEvento(data, titulo, texto) {
        const d = document.createElement("div");
        d.className = "evento rv";
        d.innerHTML = '<div class="evento-data"></div><h3></h3><p></p>';
        if (data) d.children[0].textContent = data; else d.children[0].remove();
        d.querySelector("h3").textContent = titulo; d.querySelector("p").textContent = texto;
        $("timeline").appendChild(d);
    }
    (p.eventos || []).forEach(e => addEvento(e.data, e.titulo || "", e.texto || ""));
    addEvento(new Date().toLocaleDateString("pt-BR"), "Hoje", "E depois de tudo isso, estamos aqui.\n" + textoDuracao(t) + " construindo nossa história.");
    urls.forEach((u, i) => {
        const d = document.createElement("div");
        d.className = "foto rv-scale rv"; d.style.transitionDelay = (i * 0.1) + "s";
        d.innerHTML = '<img alt="Nossa foto">'; d.firstChild.src = u; d.firstChild.dataset.idxLegenda = i;
        $("galeria").appendChild(d);
    });
    const amo = p.amo || [];
    if (!amo.length) $("secMomentos").style.display = "none";
    else {
        $("amoTitulo").textContent = tema.amo || "O que eu amo em você";
        const emojis = ["✨", "🌹", "❤️"];
        amo.forEach((txt, i) => {
            const c = document.createElement("div");
            c.className = "card rv"; c.style.transitionDelay = (i * 0.15) + "s";
            c.innerHTML = '<div class="card-icon"></div><h3></h3>';
            c.children[0].textContent = emojis[i % emojis.length]; c.children[1].textContent = txt;
            $("cards").appendChild(c);
        });
    }
    $("carta").textContent = p.para + "\n\n" + p.carta;
    $("assinatura").textContent = "Com todo meu amor, " + p.de;
    $("rodape").textContent = p.rodapeCustom || (textoDuracao(t) + "...");
    if (!p.videos || !p.videos.length) $("secVideo").style.display = "none";
    else {
        $("avatar").src = urls[0];
        $("storyUser").textContent = p.de.toLowerCase().replace(/\s+/g, "");
        const vids = [], fills = [];
        p.videos.forEach((f) => {
            const seg = document.createElement("div");
            seg.className = "progress-segment";
            seg.innerHTML = '<div class="progress-fill"></div>';
            $("progressBarContainer").appendChild(seg); fills.push(seg.firstChild);
            const v = document.createElement("video");
            v.className = "story-video"; v.src = URL.createObjectURL(f); v.playsInline = true; v.muted = true;
            $("videosWrap").appendChild(v); vids.push(v);
        });
        let atual = 0;
        function carregar(i) {
            vids.forEach((v, k) => { if (k === i) { v.classList.add("active"); v.currentTime = 0; v.play().catch(() => {}); } else { v.classList.remove("active"); v.pause(); } });
            fills.forEach((f, k) => { if (k < i) f.style.width = "100%"; else if (k > i) f.style.width = "0%"; });
        }
        vids.forEach((v, i) => {
            v.addEventListener("timeupdate", () => { if (i === atual && v.duration) fills[i].style.width = (v.currentTime / v.duration * 100) + "%"; });
            v.addEventListener("ended", () => { fills[i].style.width = "100%"; atual = (atual + 1) % vids.length; carregar(atual); });
        });
        $("storyCard").addEventListener("click", (e) => {
            const r = $("storyCard").getBoundingClientRect();
            atual = (e.clientX - r.left > r.width / 2) ? (atual + 1) % vids.length : (atual - 1 + vids.length) % vids.length;
            carregar(atual);
        });
        carregar(0);
    }
    if (!p.musica) $("secMusica").style.display = "none";
    else {
        hasMusic = true; activeAudioId = "audio";
        const audio = $("audio"), botao = $("botaoMusica"), disco = $("disco");
        audio.src = URL.createObjectURL(p.musica);
        $("musicaNome").textContent = p.musicaNome || "Nossa música";
        $("musicaArtista").textContent = p.musicaArtista || "";
        audio.addEventListener("play", () => { botao.textContent = "❚❚ Pausar"; disco.classList.add("tocando"); });
        audio.addEventListener("pause", () => { botao.textContent = "▶ Tocar nossa música"; disco.classList.remove("tocando"); });
        botao.addEventListener("click", (e) => { e.stopPropagation(); audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
    }
    setTimeout(() => { initReveal(); initTilt(); initCounters(); }, 100);
}

function renderCartaAntiga(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    $("caPequeno").textContent = tema.pequeno;
    $("caTitulo").textContent = p.titulo || "Querida...";
    $("caDuracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    _fillContador("ca", t);
    $("caCarta").textContent = p.carta || "Sua mensagem...";
    $("caAssinatura").textContent = "Com todo meu amor,\n" + p.de;
    $("caPS").textContent = p.rodapeCustom || ("P.S.: Sempre seu, " + p.de);
    $("caRodape").textContent = "Sempre seu, " + p.de;
    _renderEventos("caTimeline", p.eventos || [], ev => `
        <div class="ca-evento">
            <div class="ca-evento-data">${ev.data || ""}</div>
            <h3>${ev.titulo || ""}</h3>
            <p>${ev.texto || ""}</p>
        </div>`, true, t);
    _renderGaleria("caGaleria", urls, { foto: "ca-foto", legenda: "ca-foto-legenda" });
    if (p.musica) {
        hasMusic = true; activeAudioId = "caAudio";
        const a = document.createElement("audio"); a.id = "caAudio"; a.src = URL.createObjectURL(p.musica); a.preload = "auto"; a.style.display = "none";
        document.body.appendChild(a);
    }
}

function renderScrapbook(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    $("scPequeno").textContent = tema.pequeno;
    $("scTitulo").textContent = p.titulo || "Recortes";
    $("scDuracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    _fillContador("sc", t);
    $("scCarta").textContent = (p.para ? p.para + ",\n\n" : "") + (p.carta || "Sua mensagem...");
    $("scAssinatura").textContent = "Com todo meu amor, " + p.de;
    $("scRodape").textContent = p.rodapeCustom || ("Feito com carinho — " + textoDuracao(t));
    _renderEventos("scTimeline", p.eventos || [], (ev, i) => {
        const num = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i] || (i + 1);
        return `<div class="sc-evento"><div class="sc-evento-num">${num}</div><div><div class="sc-evento-data">${ev.data || ""}</div><h3>${ev.titulo || ""}</h3><p>${ev.texto || ""}</p></div></div>`;
    }, true, t);
    _renderGaleria("scGaleria", urls, { foto: "sc-foto", legenda: "sc-foto-legenda" });
    _renderChips("scChips", "sc-chip", p.amo);
    $("scMusNome").textContent = p.musicaNome || "Nossa música";
    $("scMusArtista").textContent = p.musicaArtista || "—";
    if (p.musica) {
        hasMusic = true; activeAudioId = "scAudio";
        const a = document.createElement("audio"); a.id = "scAudio"; a.src = URL.createObjectURL(p.musica); a.preload = "auto"; a.style.display = "none";
        document.body.appendChild(a);
    }
}

function renderJardim(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    $("jaPequeno").textContent = tema.pequeno;
    $("jaTitulo").textContent = p.titulo || "Jardim Secreto";
    $("jaDuracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    _fillContador("ja", t);
    $("jaCarta").textContent = (p.para ? p.para + ",\n\n" : "") + (p.carta || "Sua mensagem...");
    $("jaAssinatura").textContent = "Com todo meu amor, " + p.de;
    $("jaRodape").textContent = p.rodapeCustom || ("Cultivado com amor — " + textoDuracao(t));
    const estacoes = ["Primavera", "Verão", "Outono", "Inverno", "Renascimento", "Colheita"];
    _renderEventos("jaTimeline", p.eventos || [], (ev, i) => {
        const est = estacoes[i % estacoes.length];
        return `<div class="ja-estacao"><span class="ja-estacao-tag">${est}</span><div class="ja-estacao-data">${ev.data || ""}</div><h3>${ev.titulo || ""}</h3><p>${ev.texto || ""}</p></div>`;
    }, true, t);
    _renderGaleria("jaGaleria", urls, { foto: "ja-foto", legenda: "ja-foto-legenda" });
    _renderChips("jaChips", "ja-chip", p.amo);
    if (p.musica) {
        $("jaMusica").style.display = "block";
        $("jaMusNome").textContent = p.musicaNome || "Nossa música";
        $("jaMusArtista").textContent = p.musicaArtista || "—";
        hasMusic = true; activeAudioId = "jaAudio";
        const a = document.createElement("audio"); a.id = "jaAudio"; a.src = URL.createObjectURL(p.musica); a.preload = "auto"; a.style.display = "none";
        document.body.appendChild(a);
    }
}

function renderCinema(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    $("ciPequeno").textContent = tema.pequeno;
    $("ciTitulo").textContent = p.titulo || "Nossa História";
    $("ciDuracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    _fillContador("ci", t);
    $("ciCarta").textContent = (p.para ? p.para + ",\n\n" : "") + (p.carta || "Sua mensagem...");
    $("ciAssinatura").textContent = "Com todo meu amor, " + p.de;
    $("ciRodape").innerHTML = '<span class="ci-fim">FIM</span>' + (p.rodapeCustom || "Uma produção do coração");
    _renderEventos("ciTimeline", p.eventos || [], (ev, i) => {
        return `<div class="ci-cena"><div class="ci-cena-num">${String(i + 1).padStart(2, "0")}</div><div><span class="ci-cena-tag">CENA ${i + 1}</span><div class="ci-cena-data">${ev.data || ""}</div><h3>${ev.titulo || ""}</h3><p>${ev.texto || ""}</p></div></div>`;
    }, true, t);
    _renderGaleria("ciGaleria", urls, { foto: "ci-foto" });
    if (p.musica) {
        hasMusic = true; activeAudioId = "ciAudio";
        const a = document.createElement("audio"); a.id = "ciAudio"; a.src = URL.createObjectURL(p.musica); a.preload = "auto"; a.style.display = "none";
        document.body.appendChild(a);
    }
}

function renderRetro(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);
    $("rePequeno").textContent = tema.pequeno;
    const titulo = p.titulo || "Nosso Mix";
    $("reTitulo").textContent = titulo;
    $("reTitulo").setAttribute("data-text", titulo);
    $("reDuracao").textContent = textoDuracao(t) + " " + (p.frase || tema.sufixo);
    _fillContador("re", t);
    $("reCarta").textContent = (p.para ? p.para + ",\n\n" : "") + (p.carta || "Sua mensagem...");
    $("reAssinatura").textContent = "Com todo meu amor, " + p.de;
    $("reRodape").textContent = "▮▮ STOP ● — " + (p.rodapeCustom || textoDuracao(t));
    _renderEventos("reTimeline", p.eventos || [], ev => `
        <div class="re-evento">
            <div class="re-evento-data">${ev.data || ""}</div>
            <h3>${ev.titulo || ""}</h3>
            <p>${ev.texto || ""}</p>
        </div>`, true, t);
    _renderGaleria("reGaleria", urls, { foto: "re-foto" });
    _renderChips("reChips", "re-chip", p.amo);
    if (p.musica) {
        $("reMusica").style.display = "block";
        $("reMusNome").textContent = p.musicaNome || "Nossa música";
        $("reMusArtista").textContent = p.musicaArtista || "—";
        hasMusic = true; activeAudioId = "reAudio";
        const a = document.createElement("audio"); a.id = "reAudio"; a.src = URL.createObjectURL(p.musica); a.preload = "auto"; a.style.display = "none";
        document.body.appendChild(a);
    }
}

function renderNetflix(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);

    $("nfHero").style.backgroundImage = "url('" + urls[0] + "')";
    $("nfBadge").textContent = (tema.nome || "Namoro").toUpperCase();
    $("nfTitulo").textContent = p.titulo || "Eu te amo para sempre!";
    const partes = (p.inicio || "").split("-");
    $("nfAno").textContent = partes[0] || "—";
    const temp = Math.max(1, Math.ceil(t.meses / 12));
    $("nfTemp").textContent = temp + (temp === 1 ? " Temporada" : " Temporadas");
    const primeiraLinha = (p.carta || "").split("\n\n")[0] || "";
    $("nfDesc").textContent = (p.frase || tema.sufixo) + (primeiraLinha ? "\n\n" + primeiraLinha : "");
    $("nfStatAnos").textContent = t.anos || Math.floor(t.meses / 12);
    $("nfStatDias").textContent = t.dias.toLocaleString("pt-BR");
    $("nfStatData").textContent = partes.length === 3 ? partes[2] + "/" + partes[1] : "—";

    const epsWrap = $("nfEpisodios"); epsWrap.innerHTML = "";
    const evs = [...(p.eventos || [])];
    evs.push({ data: new Date().toLocaleDateString("pt-BR"), titulo: "Hoje", texto: textoDuracao(t) + " construindo nossa história." });
    evs.forEach((ev, i) => {
        const ep = document.createElement("div");
        ep.className = "nf-ep";
        ep.innerHTML = '<div class="nf-ep-num"></div><div class="nf-ep-thumb"><img alt=""></div><div class="nf-ep-info"><h3><span class="nf-ep-titulo"></span><span class="nf-ep-data"></span></h3><p></p></div>';
        ep.querySelector(".nf-ep-num").textContent = (i + 1);
        ep.querySelector(".nf-ep-titulo").textContent = ev.titulo || ("Episódio " + (i + 1));
        ep.querySelector(".nf-ep-data").textContent = ev.data || "";
        ep.querySelector("p").textContent = ev.texto || "";
        ep.querySelector("img").src = urls[(i + 1) % urls.length];
        epsWrap.appendChild(ep);
    });

    const gal = $("nfGaleria"); gal.innerHTML = "";
    urls.forEach(u => { const img = document.createElement("img"); img.src = u; gal.appendChild(img); });
    $("nfCarta").textContent = p.carta || "";
    $("nfAssin").textContent = "Com todo meu amor, " + (p.de || "");

    if (p.musica) {
        $("nfSecMusica").style.display = "block";
        $("nfMusNome").textContent = p.musicaNome || "Nossa música";
        $("nfMusArtista").textContent = p.musicaArtista || "";
        $("nfMusCover").style.backgroundImage = "url('" + urls[0] + "')";
        $("nfAudio").src = URL.createObjectURL(p.musica);
        hasMusic = true; activeAudioId = "nfAudio";
    } else {
        $("nfSecMusica").style.display = "none";
    }
    $("nfRodape").textContent = textoDuracao(t) + " — a história continua...";
    $("nfPlay").addEventListener("click", () => epsWrap.scrollIntoView({ behavior: "smooth" }));
}

function renderSpotify(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);

    $("spCover").src = urls[0];
    $("spTitulo").textContent = p.titulo || "Nós dois";
    const totalFaixas = (p.eventos || []).length + 1;
    $("spMeta").innerHTML = "<b>" + (p.de || "") + "</b> <span class='sp-dot'>•</span> <span>" + totalFaixas + " faixas</span> <span class='sp-dot'>•</span> <span>" + textoDuracao(t) + " juntos</span>";

    const tracksWrap = $("spTracks"); tracksWrap.innerHTML = "";
    const evs = [...(p.eventos || [])];
    evs.push({ data: new Date().toLocaleDateString("pt-BR"), titulo: "Hoje", texto: textoDuracao(t) + " construindo nossa história." });
    evs.forEach((ev, i) => {
        const tr = document.createElement("div");
        tr.className = "sp-track";
        tr.innerHTML = '<div class="sp-track-num"></div><div class="sp-track-main"><img class="sp-track-thumb" alt=""><div class="sp-track-txt"><div class="sp-track-title"></div><div class="sp-track-desc"></div></div></div><div class="sp-track-data"></div><button class="sp-track-heart" type="button">♡</button>';
        tr.querySelector(".sp-track-num").textContent = (i + 1);
        tr.querySelector(".sp-track-thumb").src = urls[(i + 1) % urls.length];
        tr.querySelector(".sp-track-title").textContent = ev.titulo || ("Faixa " + (i + 1));
        tr.querySelector(".sp-track-desc").textContent = ev.texto || "";
        tr.querySelector(".sp-track-data").textContent = ev.data || "";
        tracksWrap.appendChild(tr);
    });

    const alb = $("spAlbums"); alb.innerHTML = "";
    urls.forEach((u, i) => {
        const card = document.createElement("div");
        card.className = "sp-album";
        card.innerHTML = '<img alt=""><b></b><span></span>';
        card.querySelector("img").src = u;
        card.querySelector("b").textContent = "Momento " + (i + 1);
        card.querySelector("span").textContent = (p.de || "Você") + " & " + (p.para || "");
        alb.appendChild(card);
    });

    const amo = p.amo || [];
    if (!amo.length) $("spSecAmo").style.display = "none";
    else {
        $("spAmoTitulo").textContent = tema.amo || "Faixas favoritas";
        const chips = $("spChips"); chips.innerHTML = "";
        amo.forEach(txt => { const c = document.createElement("div"); c.className = "sp-chip"; c.textContent = txt; chips.appendChild(c); });
    }
    $("spCarta").textContent = p.carta || "";
    $("spAssin").textContent = "Com todo meu amor, " + (p.de || "");

    if (!p.musica) { $("spPlayer").style.display = "none"; $("spPlayBig").style.display = "none"; }
    else {
        hasMusic = true; activeAudioId = "spAudio";
        const audio = $("spAudio");
        audio.src = URL.createObjectURL(p.musica);
        $("spPlayerCover").src = urls[0];
        $("spMusNome").textContent = p.musicaNome || "Nossa música";
        $("spMusArtista").textContent = p.musicaArtista || ((p.de || "") + " & " + (p.para || ""));
        const playBtn = $("spPlayBtn"), bigBtn = $("spPlayBig"), barFill = $("spBarFill"), timeEl = $("spTime");
        function toggle() { audio.paused ? audio.play().catch(() => {}) : audio.pause(); }
        playBtn.addEventListener("click", toggle);
        bigBtn.addEventListener("click", toggle);
        audio.addEventListener("play", () => { playBtn.textContent = "❚❚"; bigBtn.textContent = "❚❚"; });
        audio.addEventListener("pause", () => { playBtn.textContent = "▶"; bigBtn.textContent = "▶"; });
        audio.addEventListener("timeupdate", () => {
            if (audio.duration) {
                barFill.style.width = (audio.currentTime / audio.duration * 100) + "%";
                const m = Math.floor(audio.currentTime / 60);
                const s = Math.floor(audio.currentTime % 60);
                timeEl.textContent = m + ":" + String(s).padStart(2, "0");
            }
        });
    }
}

function renderVinil(p, tema) {
    const urls = p.fotos.map(getFotoURL);
    const t = tempoJuntos(p.inicio);

    $("lvLabel").innerHTML = '<img src="' + urls[0] + '" alt="">';
    $("lvBadge").textContent = "Lado A • " + (tema.nome || "Vinil");
    $("lvTitulo").textContent = p.titulo || "Nós Dois";
    const partes = (p.inicio || "").split("-");
    const ano = partes[0] || "—";
    const totalFaixas = (p.eventos || []).length + 1;
    $("lvMeta").innerHTML = "<span>Ano " + ano + "</span><span>" + totalFaixas + " faixas</span><span>" + textoDuracao(t) + "</span>";
    const primeiraLinha = (p.carta || "").split("\n\n")[0] || "";
    $("lvDesc").textContent = (p.frase || tema.sufixo) + (primeiraLinha ? "\n\n" + primeiraLinha : "");
    $("lvStatFaixas").textContent = totalFaixas;
    $("lvStatAnos").textContent = t.anos || Math.floor(t.meses / 12);
    $("lvStatDias").textContent = t.dias.toLocaleString("pt-BR");

    const tracksWrap = $("lvTracks"); tracksWrap.innerHTML = "";
    const evs = [...(p.eventos || [])];
    evs.push({ data: new Date().toLocaleDateString("pt-BR"), titulo: "Hoje", texto: textoDuracao(t) + " construindo nossa história." });
    evs.forEach((ev, i) => {
        const tr = document.createElement("div");
        tr.className = "lv-track";
        tr.innerHTML = '<div class="lv-track-num"></div><div><div class="lv-track-title"></div><div class="lv-track-desc"></div></div><div class="lv-track-data"></div>';
        tr.querySelector(".lv-track-num").textContent = String(i + 1).padStart(2, "0");
        tr.querySelector(".lv-track-title").textContent = ev.titulo || ("Faixa " + (i + 1));
        tr.querySelector(".lv-track-desc").textContent = ev.texto || "";
        tr.querySelector(".lv-track-data").textContent = ev.data || "—";
        tracksWrap.appendChild(tr);
    });

    const gal = $("lvGaleria"); gal.innerHTML = "";
    urls.forEach(u => {
        const d = document.createElement("div");
        d.className = "lv-sleeve";
        const img = document.createElement("img");
        img.src = u;
        d.appendChild(img);
        gal.appendChild(d);
    });

    const amo = p.amo || [];
    if (!amo.length) $("lvSecSideB").style.display = "none";
    else {
        const chips = $("lvChips"); chips.innerHTML = "";
        amo.forEach(txt => { const c = document.createElement("div"); c.className = "lv-chip"; c.textContent = txt; chips.appendChild(c); });
    }

    $("lvCarta").textContent = p.carta || "";
    $("lvAssin").textContent = "Com todo meu amor, " + (p.de || "");
    $("lvRodape").textContent = textoDuracao(t) + " — e o disco continua girando...";

    if (!p.musica) { $("lvPlayer").style.display = "none"; $("lvPlayBig").style.display = "none"; }
    else {
        hasMusic = true; activeAudioId = "lvAudio";
        const audio = $("lvAudio");
        audio.src = URL.createObjectURL(p.musica);
        $("lvMusNome").textContent = p.musicaNome || "Nossa música";
        $("lvMusArtista").textContent = p.musicaArtista || ((p.de || "") + " & " + (p.para || ""));
        const playBtn = $("lvPlayBtn"), bigBtn = $("lvPlayBig"), vinyl = $("lvVinyl"), disc = $("lvPlayerDisc");
        function toggle() { audio.paused ? audio.play().catch(() => {}) : audio.pause(); }
        playBtn.addEventListener("click", toggle);
        bigBtn.addEventListener("click", toggle);
        audio.addEventListener("play", () => { playBtn.textContent = "❚❚"; bigBtn.textContent = "❚❚ Pausar disco"; vinyl.classList.add("playing"); disc.classList.add("playing"); });
        audio.addEventListener("pause", () => { playBtn.textContent = "▶"; bigBtn.textContent = "▶ Tocar disco"; vinyl.classList.remove("playing"); disc.classList.remove("playing"); });
    }
}


/* =====================================================
   INICIALIZAÇÃO (BOOT)
===================================================== */
let loadDone = false;

const watchdog = setTimeout(() => {
    if (!loadDone) {
        mostrarErro("Tempo limite de carregamento excedido (15s).", new Error("O banco de dados (app.js) pode estar bloqueado ou não carregou."));
    }
}, 15000);

(async function boot() {
    try {
        let p = null;

        if (isDemo) {
            p = {
                id: "demo-" + demoTema, tema: demoTema, de: "Você", para: "Alguém especial", titulo: "Nós dois", inicio: "2023-08-13", frase: "de amor, risadas e momentos inesquecíveis.",
                carta: "Quando penso em nós...\n\nEu te amo, hoje, amanhã e em todos os momentos que ainda vamos viver juntos. ❤️",
                eventos: [
                    { data: "2016", titulo: "Quando nos conhecemos", texto: "Onde tudo começou." },
                    { data: "2018", titulo: "Nosso primeiro passeio", texto: "Um dia inteiro rindo à toa." },
                    { data: "2022", titulo: "Nossa praia favorita", texto: "Onde o tempo passa devagar." }
                ],
                amo: ["Seu sorriso", "Seu carisma", "E você"],
                musicaNome: "Perfect", musicaArtista: "Ed Sheeran", musica: null, videos: [],
                fotos: [
                    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
                    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=80",
                    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
                    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80"
                ],
                legendas: ["Nosso primeiro encontro", "Aquele dia", "Viagem", "Flores", "Festa", "Momento"],
                fotoCapa: 0, usarIntro: false, autoplay: false, rodapeCustom: "Feito com amor para você ❤️", status: "pago"
            };
        } else {
            const id = new URLSearchParams(location.search).get("id");
            if (!id) {
                return mostrarMensagem("🔗 Link inválido.<br><br><small>O parâmetro <code>?id=</code> não foi encontrado na URL.</small>");
            }

            if (typeof buscarPedido !== "function") {
                return mostrarErro("app.js não foi carregado.", new Error("A função 'buscarPedido' não está definida. O arquivo app.js está na mesma pasta?"));
            }

            p = await buscarPedido(id);

            if (!p) {
                return mostrarMensagem("🔍 Presente não encontrado.<br><br><small>O ID <code>" + id + "</code> não existe no banco deste navegador. Isso acontece se o presente foi criado em outro celular/computador ou se o cache foi limpo.</small>");
            }

            if (p.status !== "pago") {
                return mostrarMensagem("💳 Pagamento pendente.<br><br><small>Status atual: <code>" + p.status + "</code>.<br>Verifique o pagamento ou contate o suporte.</small>");
            }
        }

        if (typeof THEMES === "undefined") {
            return mostrarErro("app.js incompleto.", new Error("A constante THEMES não foi encontrada no app.js."));
        }

        pedidoAtual = p;
        const tema = THEMES[p.tema] || THEMES.namoro;
        const layout = tema.layout || "padrao";

        document.title = "Uma surpresa de " + p.de + " ❤️";
        $("conteudo").style.display = "block";

        if (isDemo || isEmbed) {
            const sp = $("scrollProgress"); if (sp) sp.style.display = "none";
            const fc = $("floatControls"); if (fc) fc.style.display = "none";
        }

        const skel = $("skeletonLoader");
        if (skel) {
            skel.style.background =
                layout === "cinema" ? "#1a1a1a" :
                layout === "retro" ? "#0a0a1a" :
                layout === "netflix" ? "#000" :
                layout === "spotify" ? "#121212" :
                layout === "vinil" ? "#0a0502" :
                layout === "carta-antiga" ? "#f5e6c8" :
                layout === "scrapbook" ? "#d4a574" :
                layout === "jardim" ? "#f5f1e8" : "#faf6f1";
            skel.classList.add("on");
            setTimeout(() => { 
                skel.classList.add("out"); 
                setTimeout(() => skel.classList.remove("on", "out"), 400); 
            }, 400);
        }

        const mapExclusivos = { netflix: { id: "layoutNetflix", render: renderNetflix }, spotify: { id: "layoutSpotify", render: renderSpotify }, vinil: { id: "layoutVinil", render: renderVinil }, cinema: { id: "layoutCinema", render: renderCinema }, retro: { id: "layoutRetro", render: renderRetro } };
        const mapClassicos = { "carta-antiga": { id: "layoutCartaAntiga", render: renderCartaAntiga }, scrapbook: { id: "layoutScrapbook", render: renderScrapbook }, jardim: { id: "layoutJardim", render: renderJardim } };

        if (mapExclusivos[layout]) {
            const css = $("cssPadrao"); if (css) css.remove();
            document.body.classList.add("tema-" + layout);
            const cfg = mapExclusivos[layout];
            $(cfg.id).style.display = "block";
            cfg.render(p, tema);
        } else if (mapClassicos[layout]) {
            aplicarTema(p.tema);
            const cfg = mapClassicos[layout];
            $(cfg.id).style.display = "block";
            cfg.render(p, tema);
        } else {
            aplicarTema(p.tema);
            $("layoutPadrao").style.display = "block";
            renderPadrao(p, tema);
        }

        // SUCESSO!
        loadDone = true;
        clearTimeout(watchdog);
        
        // Esconde o esqueleto, mas NÃO o intro. O intro vai se fechar sozinho após a animação.
        const skelToHide = $("skeletonLoader");
        if (skelToHide) skelToHide.classList.remove("on", "out");
        
        // Dispara a animação com os nomes já preenchidos
        mostrarIntro(p);
        
        setTimeout(atualizarBotaoMusica, 500);
        if (p.autoplay && p.musica && !isDemo) {
            setTimeout(() => { const a = getActiveAudio(); if (a) a.play().catch(() => {}); }, 1800);
        }

    } catch (err) {
        loadDone = true;
        clearTimeout(watchdog);
        console.error("[ver] Erro fatal:", err);
        mostrarErro("Erro inesperado ao carregar o presente", err);
    }
})();
