/* =====================================================
   AMOSTRA E CORES
===================================================== */
const AMOSTRA = {
    namoro:      { titulo: "Nós dois",       frase: "de amor, risadas e momentos inesquecíveis.", chip: "Uma história que continua...", cont: [["2","Anos"],["34","Meses"],["952","Dias"]] },
    casamento:   { titulo: "Para sempre",    frase: "de união, cumplicidade e amor.",              chip: "Para sempre juntos...",          cont: [["10","Anos"],["120","Meses"],["3.652","Dias"]] },
    amizade:     { titulo: "Nossa parceria", frase: "de parceria, histórias e boas risadas.",       chip: "Amizade de verdade...",          cont: [["8","Anos"],["96","Meses"],["2.922","Dias"]] },
    familia:     { titulo: "Nossa família",  frase: "de carinho, cuidado e memórias em família.",    chip: "Laços que não se desfazem...",   cont: [["25","Anos"],["300","Meses"],["9.131","Dias"]] },
    aniversario: { titulo: "Parabéns!",      frase: "de histórias para celebrar.",                 chip: "Hoje é o seu dia...",            cont: [["30","Anos"],["360","Meses"],["10.957","Dias"]] },
    netflix:     { titulo: "Eu te amo!",     frase: "a temporada mais bonita da minha vida.",      chip: "Uma série original",             cont: [["98%","Match"],["24","Epis."],["HD","Qual."]] },
    spotify:     { titulo: "Nossa playlist", frase: "as músicas que contam nossa história.",        chip: "Sua playlist",                   cont: [["12","Faixas"],["2h","Duração"],["♡","Likes"]] },
    vinil:       { titulo: "Nós Dois",       frase: "o disco que toca no meu coração.",            chip: "Edição de colecionador",         cont: [["A/B","Lados"],["12","Faixas"],["33⅓","RPM"]] }
};

const VITRINE_CORES = {
    netflix: { rosa: "#e50914", vinho: "#7a0409", pastel: "#fff5f5" },
    spotify: { rosa: "#1DB954", vinho: "#0d4a24", pastel: "#f0faf4" },
    vinil:   { rosa: "#c9a86a", vinho: "#5a3f1a", pastel: "#faf4e8" }
};

const DESTAQUES = { netflix: "🔥 Popular", vinil: "⭐ Novo" };

/* =====================================================
   CRIAR CARD DE TEMA
===================================================== */
function criarTemaCard(chave, t) {
    const a = AMOSTRA[chave] || AMOSTRA.namoro;
    const isEspecial = t.categoria === "especial";
    const cores = isEspecial && VITRINE_CORES[chave] ? VITRINE_CORES[chave] : t.cores;

    const el = document.createElement("div");
    el.className = "tema-card";
    el.dataset.categoria = t.categoria || "classico";
    el.dataset.chave = chave;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Criar presente com o tema " + t.nome);

    el.style.setProperty("--c-rosa", cores.rosa);
    el.style.setProperty("--c-vinho", cores.vinho);
    el.style.setProperty("--c-pastel", cores.pastel);

    const destaque = DESTAQUES[chave];

    el.innerHTML =
        '<div class="shine"></div>' +
        '<div class="tema-prev">' +
            '<div class="tema-top">' +
                '<span class="tema-badge ' + (destaque ? 'destaque' : '') + '">' +
                    (destaque || (isEspecial ? "Exclusivo" : "Clássico")) +
                '</span>' +
                '<button type="button" class="tema-fav" title="Favoritar">♡</button>' +
            '</div>' +
            '<div class="tema-mock">' +
                '<div class="tema-mock-titulo"></div>' +
                '<div class="tema-mock-titulo-grande"></div>' +
                '<div class="tema-mock-cont"></div>' +
            '</div>' +
        '</div>' +
        '<div class="tema-info">' +
            '<h3>' + t.emoji + ' ' + t.nome + '</h3>' +
            '<p>' + t.desc + '.</p>' +
            '<a class="b">Criar com este tema <span class="arrow">→</span></a>' +
        '</div>';

    el.querySelector(".tema-mock-titulo").textContent = a.chip;
    el.querySelector(".tema-mock-titulo-grande").textContent = a.titulo;

    const mockCont = el.querySelector(".tema-mock-cont");
    a.cont.forEach(([n, rot]) => {
        const d = document.createElement("div");
        d.innerHTML = "<strong></strong><span></span>";
        d.children[0].textContent = n;
        d.children[1].textContent = rot;
        mockCont.appendChild(d);
    });

    el.querySelector("a.b").href = "criar.html?tema=" + chave;

    const fav = el.querySelector(".tema-fav");
    fav.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fav.classList.toggle("on");
        fav.textContent = fav.classList.contains("on") ? "♥" : "♡";
    });

    el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--mouse-x", x + "px");
        el.style.setProperty("--mouse-y", y + "px");
        if (!window.matchMedia("(pointer: coarse)").matches) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
           el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale3d(1.02, 1.02, 1.02)`;
        }
    });

    el.addEventListener("mouseleave", () => {
        if (!window.matchMedia("(pointer: coarse)").matches) {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
        }
        el.style.setProperty("--mouse-x", "50%");
        el.style.setProperty("--mouse-y", "50%");
    });

    // Acessibilidade: navegar por teclado
    el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const link = el.querySelector("a.b");
            if (link) link.click();
        }
    });

    return el;
}

/* =====================================================
   RENDERIZAR CARDS
===================================================== */
const caixaClassicos = document.getElementById("temasClassicos");
const caixaEspeciais = document.getElementById("temasEspeciais");
const todosCards = [];
let totClassicos = 0, totEspeciais = 0;

Object.entries(THEMES).forEach(([chave, t]) => {
    const card = criarTemaCard(chave, t);
    if (t.categoria === "especial") {
        caixaEspeciais.appendChild(card);
        totEspeciais++;
    } else {
        caixaClassicos.appendChild(card);
        totClassicos++;
    }
    todosCards.push(card);
});

document.getElementById("cntTodos").textContent = todosCards.length;
document.getElementById("cntClassicos").textContent = totClassicos;
document.getElementById("cntEspeciais").textContent = totEspeciais;

(function () {
    const valor = CONFIG.preco;
    const inteiro = Math.floor(valor);
    const centavos = String(Math.round((valor - inteiro) * 100)).padStart(2, "0");
    const el = document.getElementById("precoValor");
    if (el) {
        el.innerHTML = '<span class="cifrao">R$</span>' + inteiro + '<span class="centavos">,' + centavos + '</span>';
    }
})();

/* =====================================================
   FILTROS
===================================================== */
document.querySelectorAll(".filtro").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filtro").forEach(b => b.classList.remove("on"));
        btn.classList.add("on");

        const filtro = btn.dataset.filtro;
        const titClassicos = document.getElementById("titClassicos");
        const titEspeciais = document.getElementById("titEspeciais");

        if (filtro === "todos") {
            caixaClassicos.style.display = "";
            caixaEspeciais.style.display = "";
            titClassicos.classList.remove("hidden");
            titEspeciais.classList.remove("hidden");
        } else if (filtro === "classico") {
            caixaClassicos.style.display = "";
            caixaEspeciais.style.display = "none";
            titClassicos.classList.remove("hidden");
            titEspeciais.classList.add("hidden");
        } else if (filtro === "especial") {
            caixaClassicos.style.display = "none";
            caixaEspeciais.style.display = "";
            titClassicos.classList.add("hidden");
            titEspeciais.classList.remove("hidden");
        }

        document.querySelectorAll(".tema-card").forEach((c, i) => {
            const visivel = c.offsetParent !== null;
            if (visivel) {
                c.classList.remove("on");
                setTimeout(() => c.classList.add("on"), i * 60);
            }
        });
    });
});

/* =====================================================
   PREVIEW AO VIVO (IFRAME)
===================================================== */
(function () {
    const iframe = document.getElementById("previewIframe");
    if (!iframe) return;

    document.querySelectorAll(".preview-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".preview-tab").forEach(t => t.classList.remove("on"));
            tab.classList.add("on");

            const tema = tab.dataset.preview;
            iframe.src = "ver.html?demo=1&tema=" + tema;
        });
    });
})();

/* =====================================================
   SCROLL & NAV
===================================================== */
const progress = document.getElementById("scrollProgress");
const nav = document.getElementById("nav");

window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + "%";

    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
}, { passive: true });

(function () {
    const links = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const alvos = links.map(a => document.querySelector(a.getAttribute("href")));
    let espera = false;
    function marcar() {
        espera = false;
        const linha = window.innerHeight * 0.4;
        let atual = -1;
        alvos.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= linha) atual = i; });
        links.forEach((a, i) => {
            a.classList.toggle("ativo", i === atual);
            if (i === atual) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
    }
    window.addEventListener("scroll", () => { if (!espera) { espera = true; requestAnimationFrame(marcar); } }, { passive: true });
    marcar();
})();

/* =====================================================
   REVEAL
===================================================== */
(function () {
    const els = document.querySelectorAll(".reveal, .passos, .categoria-titulo, .mask-reveal, .numeros, .incluso-item");
    if (!("IntersectionObserver" in window)) {
        els.forEach(e => e.classList.add("on"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add("on");
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    els.forEach(el => io.observe(el));
})();

(function () {
    if (!("IntersectionObserver" in window)) {
        todosCards.forEach(c => c.classList.add("on"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                const cards = [...en.target.parentElement.children];
                const idx = cards.indexOf(en.target);
                setTimeout(() => en.target.classList.add("on"), idx * 100);
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.15 });
    todosCards.forEach(c => io.observe(c));
})();

/* =====================================================
   CONTADORES
===================================================== */
(function () {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    function animate(el) {
        const target = Number(el.dataset.count);
        const format = el.dataset.format;
        const suffix = el.dataset.suffix || "";
        const dur = 2000;
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            const val = Math.round(target * eased);
            el.textContent = (format === "br" ? val.toLocaleString("pt-BR") : val) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                animate(en.target);
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
})();

/* =====================================================
   PHONE TILT
===================================================== */
(function () {
    const phone = document.getElementById("phoneTilt");
    if (!phone) return;
    const wrap = phone.parentElement;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    wrap.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        phone.style.transform = `rotate(${-2 + x * 6}deg) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(0)`;
    });
    wrap.addEventListener("mouseleave", () => {
        phone.style.transform = "rotate(-2deg) rotateY(0) rotateX(0)";
    });
})();

/* =====================================================
   BOTÕES MAGNÉTICOS
===================================================== */
(function () {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll(".magnetic").forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * .15}px, ${y * .15}px) translateY(-4px) scale(1.02)`;
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "";
        });
    });
})();

/* =====================================================
   RIPPLE
===================================================== */
document.querySelectorAll(".b").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
        ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});

/* =====================================================
   TIMER PROMO
===================================================== */
(function () {
    const hEl = document.getElementById("tHoras");
    const mEl = document.getElementById("tMin");
    const sEl = document.getElementById("tSeg");
    if (!hEl) return;

    function tick() {
        const now = new Date();
        const fim = new Date();
        fim.setHours(23, 59, 59, 999);
        let diff = Math.max(0, fim - now);
        const h = Math.floor(diff / 3600000);
        diff -= h * 3600000;
        const m = Math.floor(diff / 60000);
        diff -= m * 60000;
        const s = Math.floor(diff / 1000);
        hEl.textContent = String(h).padStart(2, "0");
        mEl.textContent = String(m).padStart(2, "0");
        sEl.textContent = String(s).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);

    const por = CONFIG.preco;
    const de = Math.round((por * 1.1) * 100) / 100;
    document.getElementById("promoDe").textContent = formatarPreco(de);
    document.getElementById("promoPor").textContent = formatarPreco(por);
})();

/* =====================================================
   PARTÍCULAS CTA FINAL
===================================================== */
(function () {
    const cta = document.getElementById("ctaFinal");
    if (!cta) return;
    const symbols = ["♥", "♡", "✧", "❋"];
    const N = 18;
    for (let i = 0; i < N; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        p.textContent = symbols[i % symbols.length];
        p.style.cssText = `
            position:absolute; color:rgba(255,255,255,.2);
            left:${Math.random()*100}%; bottom:-20px;
            font-size:${10+Math.random()*16}px;
            animation: particleFloat ${8+Math.random()*8}s linear ${Math.random()*10}s infinite;
            pointer-events:none; z-index:0;
        `;
        cta.appendChild(p);
    }
})();

document.getElementById("anoAtual").textContent = new Date().getFullYear();