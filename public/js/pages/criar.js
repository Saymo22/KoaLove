const $ = (id) => document.getElementById(id);
let tema = null,
  fraseEditada = false,
  fotoURLs = [],
  fotoFiles = [],
  legendasValores = [];
let draggedIdx = null,
  videoURLs = [],
  layoutAtual = null,
  transicaoEmAndamento = false;

let pedidoEditandoId = null;
let pedidoAntigo = null;
let musicaPreviewURL = null;

const MAX_EVENTOS = 6;

const SECOES = {
  padrao: ["Capa", "Contador", "História", "Álbum", "Pequenas", "Vídeo", "Carta", "Música"],
  netflix: ["Destaque", "Continuar", "Top 10", "Episódios", "Sobre"],
  spotify: ["Capa", "Faixas", "Descubra", "Letra", "Sobre"],
  vinil: ["Capa", "Lado A", "Encarte", "Lado B", "Notas"],
  "carta-antiga": ["Capa", "Contador", "Carta", "História", "Álbum"],
  scrapbook: ["Capa", "Contador", "Carta", "História", "Álbum", "Mixtape"],
  cinema: ["Cartaz", "Contador", "Sinopse", "Cenas", "Álbum"],
  jardim: ["Capa", "Contador", "Carta", "Estações", "Álbum", "Flores"],
  retro: ["Capa", "Contador", "Carta", "Log", "Álbum", "Mixtape"],
};
let autoScrollTimer = null,
  autoScrollPaused = false,
  currentSectionIdx = 0;

const AMOSTRA = {
  namoro: { titulo: "Nós dois", chip: "Uma história que continua...", cont: [["2", "Anos"], ["34", "Meses"], ["952", "Dias"]] },
  casamento: { titulo: "Para sempre", chip: "Para sempre juntos...", cont: [["10", "Anos"], ["120", "Meses"], ["3.652", "Dias"]] },
  amizade: { titulo: "Nossa parceria", chip: "Amizade de verdade...", cont: [["8", "Anos"], ["96", "Meses"], ["2.922", "Dias"]] },
  familia: { titulo: "Nossa família", chip: "Laços que não se desfazem...", cont: [["25", "Anos"], ["300", "Meses"], ["9.131", "Dias"]] },
  aniversario: { titulo: "Parabéns!", chip: "Hoje é o seu dia...", cont: [["30", "Anos"], ["360", "Meses"], ["10.957", "Dias"]] },
  "carta-antiga": { titulo: "Querida...", chip: "Uma carta do tempo...", cont: [["✉️", "Selo"], ["✒️", "Tinta"], ["📜", "Papel"]] },
  scrapbook: { titulo: "Recortes", chip: "Nossas memórias...", cont: [["🎨", "Cores"], ["✂️", "Recortes"], ["📎", "Colados"]] },
  cinema: { titulo: "Nossa História", chip: "Uma história digna...", cont: [["⭐", "Elenco"], ["🎬", "Diretor"], ["🎞️", "Cenas"]] },
  jardim: { titulo: "Floresceu", chip: "Folhas e flores...", cont: [["🌿", "Folhas"], ["🌸", "Flores"], ["☘️", "Raízes"]] },
  retro: { titulo: "Nosso Mix", chip: "Rewind para o amor...", cont: [["📼", "VHS"], ["🎮", "Arcade"], ["🎵", "Mixtape"]] },
  netflix: { titulo: "Eu te amo!", chip: "Uma série original", cont: [["98%", "Match"], ["24", "Epis."], ["HD", "Qual."]] },
  spotify: { titulo: "Nossa playlist", chip: "Sua playlist", cont: [["12", "Faixas"], ["2h", "Duração"], ["♡", "Likes"]] },
  vinil: { titulo: "Nós Dois", chip: "Edição de colecionador", cont: [["A/B", "Lados"], ["12", "Faixas"], ["33⅓", "RPM"]] },
};

const VITRINE_CORES = {
  cinema: { rosa: "#d4af37", vinho: "#8a6c30" },
  retro: { rosa: "#ff006e", vinho: "#00d9ff" },
  netflix: { rosa: "#e50914", vinho: "#7a0409" },
  spotify: { rosa: "#1DB954", vinho: "#0d4a24" },
  vinil: { rosa: "#c9a86a", vinho: "#5a3f1a" },
};
const DESTAQUES = {
  netflix: "🔥 Popular",
  vinil: "⭐ Novo",
  cinema: "⭐ Novo",
  retro: "🔥 Popular",
};

(function () {
  const progress = $("scrollProgress");
  if (!progress) return;
  // A classe "scrolled" da navbar é gerenciada por js/core/navbar.js.
  window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }, { passive: true });
})();

function updatePhoneTime() {
  const now = new Date();
  $("phoneTime").textContent = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
}
updatePhoneTime();
setInterval(updatePhoneTime, 30000);

(function () {
  const h = new Date();
  $("inicio").max = h.getFullYear() + "-" + String(h.getMonth() + 1).padStart(2, "0") + "-" + String(h.getDate()).padStart(2, "0");
})();

function buildPreviewDots(layout) {
  const dots = $("previewDots");
  if (!dots) return;
  const sections = SECOES[layout] || SECOES.padrao;
  dots.innerHTML = "";
  sections.forEach((label, i) => {
    const b = document.createElement("button");
    b.className = "preview-dot" + (i === 0 ? " on" : "");
    b.type = "button";
    b.title = label;
    b.dataset.idx = i;
    b.addEventListener("click", () => {
      goToPreviewSection(i);
      resetAutoScroll();
    });
    dots.appendChild(b);
  });
  currentSectionIdx = 0;
}

function getPreviewSections() {
  const scroll = $("previewScroll");
  const layout = scroll.querySelector(".layout-view:not([style*='display: none'])");
  if (!layout) return [];
  return [...layout.querySelectorAll(":scope > *")].filter((el) => el.getClientRects().length && el.offsetHeight >= 80);
}

function goToPreviewSection(idx) {
  const sections = getPreviewSections();
  if (!sections[idx]) return;
  $("previewScroll").scrollTo({ top: sections[idx].offsetTop, behavior: "smooth" });
  updateActiveDot(idx);
}

function updateActiveDot(idx) {
  const dots = $("previewDots");
  if (!dots) return;
  [...dots.children].forEach((d, i) => d.classList.toggle("on", i === idx));
  currentSectionIdx = idx;
}

function startAutoScroll() {
  stopAutoScroll();
  if (autoScrollPaused) return;
  autoScrollTimer = setInterval(() => {
    if (autoScrollPaused) return;
    const sections = getPreviewSections();
    if (sections.length < 2) return;
    goToPreviewSection((currentSectionIdx + 1) % sections.length);
  }, 4500);
}
function stopAutoScroll() {
  if (autoScrollTimer) { clearInterval(autoScrollTimer); autoScrollTimer = null; }
}
function resetAutoScroll() {
  stopAutoScroll();
  setTimeout(startAutoScroll, 400);
}

$("previewScroll").addEventListener("scroll", () => {
    const sections = getPreviewSections();
    if (!sections.length) return;
    const scrollTop = $("previewScroll").scrollTop + 80;
    let active = 0;
    sections.forEach((sec, i) => { if (sec.offsetTop <= scrollTop) active = i; });
    updateActiveDot(active);
  }, { passive: true });

(function () {
  const phone = $("previewPhone");
  phone.addEventListener("mouseenter", () => { autoScrollPaused = true; stopAutoScroll(); });
  phone.addEventListener("mouseleave", () => { autoScrollPaused = false; resetAutoScroll(); });
})();

function marcarErro(campoNome) {
  const campo = document.querySelector(`[data-campo="${campoNome}"]`);
  if (!campo) return;
  campo.classList.remove("campo-erro");
  void campo.offsetWidth;
  campo.classList.add("campo-erro");
  const msg = campo.querySelector(`.erro-campo-msg[data-msg="${campoNome}"]`);
  if (msg) msg.classList.add("on");
  const input = campo.querySelector("input, textarea, select");
  if (input) {
    setTimeout(() => campo.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    setTimeout(() => {
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    }, 350);
  }
  setTimeout(() => {
    campo.classList.remove("campo-erro");
    if (msg) msg.classList.remove("on");
  }, 3000);
}

function limparErro(n) {
  const campo = document.querySelector(`[data-campo="${n}"]`);
  if (!campo) return;
  campo.classList.remove("campo-erro");
  const msg = campo.querySelector(`.erro-campo-msg[data-msg="${n}"]`);
  if (msg) msg.classList.remove("on");
}

function limparTodosErros() {
  document.querySelectorAll(".campo-erro").forEach((c) => c.classList.remove("campo-erro"));
  document.querySelectorAll(".erro-campo-msg.on").forEach((m) => m.classList.remove("on"));
  document.querySelectorAll(".erro").forEach((e) => (e.textContent = ""));
  $("passo1").classList.remove("temas-erro");
}

["de", "para", "inicio", "carta"].forEach((n) => {
  const el = $(n);
  el.addEventListener("input", () => limparErro(n));
  el.addEventListener("change", () => limparErro(n));
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".tema")) {
    $("passo1").classList.remove("temas-erro");
    $("erro1").textContent = "";
  }
});

function criarCardTema(chave, t) {
  const a = AMOSTRA[chave] || AMOSTRA.namoro;
  const isEspecial = t.categoria === "especial";
  const cores = isEspecial && VITRINE_CORES[chave] ? VITRINE_CORES[chave] : t.cores;
  const destaque = DESTAQUES[chave];

  const el = document.createElement("div");
  el.className = "tema prereveal";
  el.dataset.chave = chave;
  el.dataset.categoria = t.categoria || "classico";
  el.style.setProperty("--t-rosa", cores.rosa);
  el.style.setProperty("--t-vinho", cores.vinho);
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", "Escolher tema: " + t.nome);

  el.innerHTML =
    '<div class="tema-prev">' +
    '<span class="tema-badge ' + (destaque ? "destaque" : "") + '">' + (destaque || (isEspecial ? "Exclusivo" : "Clássico")) + "</span>" +
    '<div class="tema-mock">' +
    '<div class="tema-mock-titulo"></div>' +
    '<div class="tema-mock-grande"></div>' +
    '<div class="tema-mock-cont"></div>' +
    "</div>" +
    "</div>" +
    '<div class="tema-info">' +
    '<h3><span class="emoji"></span><span class="nome"></span></h3>' +
    "<p></p>" +
    "</div>";

  el.querySelector(".tema-mock-titulo").textContent = a.chip;
  el.querySelector(".tema-mock-grande").textContent = a.titulo;
  const mockCont = el.querySelector(".tema-mock-cont");
  a.cont.forEach(([n, rot]) => {
    const d = document.createElement("div");
    d.innerHTML = "<strong></strong><span></span>";
    d.children[0].textContent = n;
    d.children[1].textContent = rot;
    mockCont.appendChild(d);
  });
  el.querySelector(".emoji").textContent = t.emoji;
  el.querySelector(".nome").textContent = t.nome;
  el.querySelector(".tema-info p").textContent = t.desc || t.pequeno || t.sufixo || '';

  if (!window.matchMedia("(pointer: coarse)").matches) {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px) scale(1.02)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  }

  function selecionar() {
    tema = chave;
    document.querySelectorAll(".tema").forEach((x) => {
      x.classList.remove("sel");
      x.setAttribute("aria-pressed", "false");
    });
    el.classList.add("sel");
    el.classList.remove("prereveal"); // garante o card visível mesmo antes da cascata
    el.classList.add("on");
    el.setAttribute("aria-pressed", "true");
    document.body.classList.toggle("tema-escuro", temaEscuro(chave));
    aplicarTemaPreview(chave);
    if (!fraseEditada) $("frase").value = t.sufixo;
    $("erro1").textContent = "";
    atualizarPreview();
  }

  el.addEventListener("click", selecionar);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selecionar();
    }
  });

  return el;
}

const wrapClassicos = $("temasClassicos");
const wrapEspeciais = $("temasEspeciais");
const todosCards = [];
/* Revela os cards de forma robusta: anima em cascata, mas garante
   que TODOS fiquem visíveis mesmo se algo interromper a animação. */
function revelarCards() {
  todosCards.forEach((c, i) => {
    setTimeout(() => c.classList.add("on"), Math.min(i * 60, 600));
  });
  // Rede de segurança: se por qualquer motivo a cascata não rodar,
  // revela tudo no próximo frame.
  requestAnimationFrame(() => {
    setTimeout(() => {
      todosCards.forEach((c) => {
        c.classList.add("on");
        c.classList.remove("prereveal");
      });
    }, 900);
  });
}
/* Temas vêm de GET /api/config (nada hardcoded) */
NA_CONFIG_READY.then(() => {
  if (!Object.keys(THEMES).length) {
    $("erro1").textContent = "Não foi possível carregar os temas. Verifique se o servidor está rodando (node server/index.js).";
    return;
  }
  Object.entries(THEMES).forEach(([chave, t]) => {
    const card = criarCardTema(chave, t);
    if (t.categoria === "especial") wrapEspeciais.appendChild(card);
    else wrapClassicos.appendChild(card);
    todosCards.push(card);
  });
  requestAnimationFrame(() => revelarCards());
});

function aplicarTemaPreview(chave) {
  const t = (THEMES[chave] || THEMES.namoro).cores, s = $("previewScreen");
  s.style.setProperty("--rosa", t.rosa);
  s.style.setProperty("--rosa-claro", t.rosaClaro);
  s.style.setProperty("--rosa-pastel", t.pastel);
  s.style.setProperty("--vinho", t.vinho);
  s.style.setProperty("--vinho-escuro", t.escuro);
  s.style.setProperty("--texto", t.texto);
}

let pulseTimer = null;
function pulsarPreview() {
  const label = $("previewLabel");
  label.classList.add("updating");
  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => label.classList.remove("updating"), 700);
}

function animarNumero(el, valorFinal, format) {
  if (!el) return;
  const atual = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
  if (atual === valorFinal) return;
  const dur = 500, start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(atual + (valorFinal - atual) * eased);
    el.textContent = format === "br" ? val.toLocaleString("pt-BR") : val;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function trocarLayout(novoLayout) {
  const map = { netflix: "pvNetflix", spotify: "pvSpotify", vinil: "pvVinil" };
  const id = map[novoLayout] || "pvPadrao";
  const novo = $(id);
  if (!novo) return;

  const anterior = document.querySelector(".layout-view.atual");
  if (anterior && anterior !== novo) {
    anterior.style.display = "none";
    anterior.classList.remove("atual");
  }

  // Garante que a view ativa esteja sempre visível (opacity 1 por padrão).
  // A entrada é uma animação em CSS que NUNCA parte de opacity 0, para que
  // uma aba em segundo plano (animação congelada) não deixe a prévia em branco.
  novo.style.display = "block";
  novo.classList.add("atual");

  if (layoutAtual !== novoLayout) {
    novo.classList.remove("layout-enter");
    void novo.offsetWidth; // reinicia a animação
    novo.classList.add("layout-enter");

    layoutAtual = novoLayout;
    buildPreviewDots(novoLayout);
    $("previewScroll").scrollTop = 0;
    currentSectionIdx = 0;
    resetAutoScroll();
  }
}

function atualizarPreview() {
  const temaChave = tema || "namoro";
  const t = THEMES[temaChave] || THEMES.namoro;
  const ini = $("inicio").value;
  const sufixo = $("frase").value.trim();
  const tempo = ini ? tempoJuntos(ini) : null;
  document.querySelector('label[for="inicio"]').textContent = temaChave === 'aniversario' ? 'Data de nascimento' : 'Desde quando?';
  aplicarTemaPreview(temaChave);
  atualizarPreviewTema(temaChave);
  window.NAThemeEditor?.activate(temaChave);
  if (tempo) {
    $("pAnos").textContent = tempo.anos;
    $("pMeses").textContent = tempo.meses;
    $("pDias").textContent = tempo.dias.toLocaleString("pt-BR");
    $("pHoras").textContent = tempo.horas.toLocaleString("pt-BR");
    $("previaFrase").textContent = (textoDuracao(tempo) + " " + (sufixo || t.sufixo)).trim();
  } else {
    ["pAnos", "pMeses", "pDias", "pHoras"].forEach((i) => ($(i).textContent = "0"));
    $("previaFrase").textContent = "Escolha a data para ver o contador.";
  }
  const layout = t.layout || "padrao";
  trocarLayout(layout);
  renderPreviewPadrao(tempo, t);
  pulsarPreview();
}

// O mesmo HTML usado em ver.html, isolado dos estilos do formulário.
let themePreviewFrame = null;
let temaPreviewKey = null;
function atualizarPreviewTema(chave) {
  const ativo = !!window.NA_THEME_FILES?.[chave];
  $("previewScroll").classList.toggle("preview-tema", ativo);
  $("previewDots").hidden = ativo;
  if (!ativo) {
    themePreviewFrame?.remove();
    themePreviewFrame = null;
    temaPreviewKey = null;
    return;
  }
  if (temaPreviewKey !== chave) {
    themePreviewFrame?.remove();
    themePreviewFrame = null;
    temaPreviewKey = chave;
  }
  if (!themePreviewFrame) {
    themePreviewFrame = document.createElement("iframe");
    themePreviewFrame.className = "preview-tema-frame";
    themePreviewFrame.title = "Prévia do tema " + (THEMES[chave]?.nome || chave);
    themePreviewFrame.src = window.NA_THEME_FILES[chave] + "?embed=1";
    if(chave === 'aniversario') themePreviewFrame.setAttribute('allow', 'microphone');
    themePreviewFrame.addEventListener("load", enviarPreviewTema);
    $("previewScroll").append(themePreviewFrame);
  }
  enviarPreviewTema();
}
function enviarPreviewTema() {
  if (!themePreviewFrame) return;
  const p = {};
  for (const campo of ["titulo", "de", "para", "inicio", "carta", "frase", "musicaNome", "musicaArtista", "rodapeCustom"]) {
    p[campo] = $(campo).value.trim();
  }
  p.de ||= "Alguém especial";
  p.para ||= "Você";
  p.autoplay = $('autoplay').checked;
  p.usarIntro = $('usarIntro').checked;
  p.themeData = window.NAThemeEditor?.getData() || {};
  p.legendas = [...document.querySelectorAll(".legenda-input")].map(el => el.value.trim());
  const events = [...document.querySelectorAll(".ev-item")].map(el => ({
    data: el.querySelector(".ev-data").value.trim(),
    titulo: el.querySelector(".ev-titulo").value.trim(),
    texto: el.querySelector(".ev-texto").value.trim(),
  })).filter(ev => ev.titulo || ev.texto);
  const reasons = [...document.querySelectorAll(".amo")].map(el => el.value.trim()).filter(Boolean);
  themePreviewFrame.contentWindow?.postMessage({
    type: temaPreviewKey === 'namoro' ? "NOSSO_AMOR_NAMORO_DATA" : "NOSSO_AMOR_THEME_DATA",
    payload: { p, photos: fotoURLs, videos: videoURLs, music: musicaPreviewURL,
      cover: fotoURLs[Number($("fotoCapa").value) || 0] || fotoURLs[0] || "", events, reasons },
  }, location.origin);
}
window.addEventListener("message", event => {
  if(event.origin !== location.origin || event.source !== themePreviewFrame?.contentWindow)return;
  if(event.data?.type === 'NOSSO_AMOR_THEME_READY' && event.data.key === temaPreviewKey){
    window.NAThemeEditor?.acceptSchema({...event.data,name:THEMES[temaPreviewKey]?.nome});
    enviarPreviewTema();
  }else if(event.data?.type === "NOSSO_AMOR_NAMORO_READY") enviarPreviewTema();
});

function renderPreviewPadrao(tempo, t) {
  const ini = $("inicio").value;
  const sufixo = $("frase").value.trim();
  $("pvPequeno").textContent = t.pequeno;
  $("pvTitulo").textContent = $("titulo").value.trim() || "Nós dois";
  $("pvFrase").textContent = ini ? (textoDuracao(tempo) + " " + (sufixo || t.sufixo)).trim() : "Sua história começa aqui...";
  
  const capaIdx = Math.min(Number($("fotoCapa").value) || 0, Math.max(0, fotoURLs.length - 1));
  $("pvHero").style.backgroundImage = fotoURLs[capaIdx] ? "linear-gradient(rgba(80,25,43,.35), rgba(80,25,43,.65)), url('" + fotoURLs[capaIdx] + "')" : "";
  
  if (tempo) {
    animarNumero($("pvAnos"), tempo.anos);
    animarNumero($("pvMeses"), tempo.meses);
    animarNumero($("pvDias"), tempo.dias, "br");
    animarNumero($("pvHoras"), tempo.horas, "br");
  }
  
  const tl = $("pvTimeline");
  tl.innerHTML = "";
  const evs = [...document.querySelectorAll(".ev-item")].map((el) => ({
      data: el.querySelector(".ev-data").value.trim(),
      titulo: el.querySelector(".ev-titulo").value.trim(),
      texto: el.querySelector(".ev-texto").value.trim(),
    })).filter((e) => e.titulo || e.texto);
    
  if (ini && tempo) evs.push({ data: new Date().toLocaleDateString("pt-BR"), titulo: "Hoje", texto: textoDuracao(tempo) + " construindo nossa história." });
  
  if (!evs.length) tl.innerHTML = '<p class="pv-empty">Adicione momentos para vê-los aqui...</p>';
  else evs.forEach((ev) => {
      const d = document.createElement("div");
      d.className = "pv-ev";
      d.innerHTML = '<div class="pv-ev-data"></div><h4></h4><p></p>';
      d.querySelector(".pv-ev-data").textContent = ev.data;
      d.querySelector("h4").textContent = ev.titulo;
      d.querySelector("p").textContent = ev.texto;
      tl.appendChild(d);
    });
    
  const g = $("pvFotos");
  g.innerHTML = "";
  if (fotoURLs.length) {
    $("pvSecGaleria").style.display = "";
    fotoURLs.slice(0, 6).forEach((u, i) => {
      const wrap = document.createElement("div");
      wrap.className = "pv-photo-wrap";
      const img = document.createElement("img");
      img.src = u;
      img.loading = "lazy";
      wrap.appendChild(img);
      const leg = (legendasValores[i] || "").trim();
      if (leg) {
        const span = document.createElement("span");
        span.className = "pv-photo-leg";
        span.textContent = leg;
        wrap.appendChild(span);
      }
      g.appendChild(wrap);
    });
  } else $("pvSecGaleria").style.display = "none";
  
  const amo = [...document.querySelectorAll(".amo")].map((i) => i.value.trim()).filter(Boolean);
  const cards = $("pvCards");
  cards.innerHTML = "";
  if (amo.length) {
    $("pvSecAmo").style.display = "";
    const emojis = ["😁", "😋", "❤️"];
    amo.forEach((txt, i) => {
      const c = document.createElement("div");
      c.className = "pv-card";
      c.innerHTML = "<div></div><b></b>";
      c.children[0].textContent = emojis[i % emojis.length];
      c.children[1].textContent = txt;
      cards.appendChild(c);
    });
  } else $("pvSecAmo").style.display = "none";
  $("pvAmoTitulo").textContent = t.amo || "O que eu amo em você";
  
  if (videoURLs.length) {
    $("pvSecVideo").style.display = "";
    const vf = $("pvVideoFrame");
    vf.innerHTML = "";
    const v = document.createElement("video");
    v.src = videoURLs[0];
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.autoplay = true;
    v.play && v.play().catch(() => {});
    vf.appendChild(v);
  } else $("pvSecVideo").style.display = "none";
  
  const para = $("para").value.trim(), carta = $("carta").value.trim();
  $("pvCarta").textContent = (para ? para + "\n\n" : "") + (carta || "Sua mensagem aparece aqui...");
  $("pvAssin").textContent = "Com todo meu amor, " + ($("de").value.trim() || "quem te ama");
  
  const musNome = $("musicaNome").value.trim(), musArt = $("musicaArtista").value.trim(), musFile = $("musica").files[0];
  if (musNome || musFile) {
    $("pvSecMusica").style.display = "";
    $("pvMusNome").textContent = musNome || (musFile ? musFile.name.replace(/\.[^.]+$/, "") : "Nossa música");
    $("pvMusArtista").textContent = musArt || "";
  } else $("pvSecMusica").style.display = "none";
  
  const rodCustom = $("rodapeCustom") ? $("rodapeCustom").value.trim() : "";
  $("pvRodape").textContent = rodCustom || (tempo ? textoDuracao(tempo) + "..." : "Nosso tempo juntos...");
}

function renderFotosGrid() {
  const grid = $("fotosGrid");
  grid.innerHTML = "";
  if (!fotoURLs.length) return;
  const capaIdx = Number($("fotoCapa").value) || 0;
  fotoURLs.forEach((url, i) => {
    const card = document.createElement("div");
    card.className = "foto-card" + (i === capaIdx ? " capa" : "");
    card.draggable = true;
    card.dataset.idx = i;
    
    const img = document.createElement("img");
    img.className = "foto-thumb";
    img.src = url;
    img.alt = "Foto " + (i + 1);
    img.loading = "lazy";
    
    const actions = document.createElement("div");
    actions.className = "foto-actions";
    const btnCapa = document.createElement("button");
    btnCapa.type = "button";
    btnCapa.className = "foto-btn capa-btn" + (i === capaIdx ? " on" : "");
    btnCapa.textContent = "★";
    btnCapa.setAttribute("aria-label", "Definir como capa");
    btnCapa.addEventListener("click", (e) => {
      e.stopPropagation();
      $("fotoCapa").value = i;
      renderFotosGrid();
      atualizarPreview();
    });
    actions.appendChild(btnCapa);
    
    const btnRem = document.createElement("button");
    btnRem.type = "button";
    btnRem.className = "foto-btn remover-btn";
    btnRem.textContent = "✕";
    btnRem.setAttribute("aria-label", "Remover foto");
    btnRem.addEventListener("click", (e) => {
      e.stopPropagation();
      removerFoto(i);
    });
    actions.appendChild(btnRem);
    
    const arrows = document.createElement("div");
    arrows.className = "foto-arrows";
    if (i > 0) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "foto-btn mover-esq";
      b.textContent = "‹";
      b.addEventListener("click", (e) => { e.stopPropagation(); moverFoto(i, -1); });
      arrows.appendChild(b);
    }
    if (i < fotoURLs.length - 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "foto-btn mover-dir";
      b.textContent = "›";
      b.addEventListener("click", (e) => { e.stopPropagation(); moverFoto(i, 1); });
      arrows.appendChild(b);
    }
    
    const overlay = document.createElement("div");
    overlay.className = "foto-overlay";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "foto-legenda-input legenda-input";
    input.maxLength = 60;
    input.placeholder = "Legenda da foto";
    input.value = legendasValores[i] || "";
    input.dataset.idx = i;
    input.addEventListener("input", (e) => { 
      legendasValores[i] = e.target.value;
      agendarAtualizacao();
    });
    overlay.appendChild(input);
    
    card.appendChild(img);
    card.appendChild(actions);
    card.appendChild(arrows);
    card.appendChild(overlay);
    
    card.addEventListener("dragstart", (e) => {
      draggedIdx = i;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedIdx = null;
    });
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedIdx === null || draggedIdx === i) return;
      reordenarFotos(draggedIdx, i);
    });
    grid.appendChild(card);
  });
}

function reordenarFotos(from, to) {
  if (from === to) return;
  const itemURL = fotoURLs.splice(from, 1)[0];
  const itemFile = fotoFiles.splice(from, 1)[0];
  const itemLeg = legendasValores.splice(from, 1)[0];
  
  fotoURLs.splice(to, 0, itemURL);
  fotoFiles.splice(to, 0, itemFile);
  legendasValores.splice(to, 0, itemLeg);
  
  let capa = Number($("fotoCapa").value) || 0;
  if (from === capa) capa = to;
  else if (from < capa && to >= capa) capa--;
  else if (from > capa && to <= capa) capa++;
  $("fotoCapa").value = capa;
  
  renderFotosGrid();
  atualizarPreview();
}

function moverFoto(idx, dir) {
  const to = idx + dir;
  if (to < 0 || to >= fotoURLs.length) return;
  
  const tU = fotoURLs[idx]; fotoURLs[idx] = fotoURLs[to]; fotoURLs[to] = tU;
  const tF = fotoFiles[idx]; fotoFiles[idx] = fotoFiles[to]; fotoFiles[to] = tF;
  const tL = legendasValores[idx]; legendasValores[idx] = legendasValores[to]; legendasValores[to] = tL;
  
  const capa = Number($("fotoCapa").value) || 0;
  if (capa === idx) $("fotoCapa").value = to;
  else if (capa === to) $("fotoCapa").value = idx;
  
  renderFotosGrid();
  atualizarPreview();
}

function removerFoto(idx) {
  const removedURL = fotoURLs[idx];
  fotoURLs.splice(idx, 1);
  fotoFiles.splice(idx, 1);
  legendasValores.splice(idx, 1);
  
  const capa = Number($("fotoCapa").value) || 0;
  if (capa === idx) $("fotoCapa").value = 0;
  else if (capa > idx) $("fotoCapa").value = capa - 1;
  
  URL.revokeObjectURL(removedURL);
  renderFotosGrid();
  atualizarPreview();
}

function atualizarPainelPersonalizacao() {
  const painel = $("painelPersonalizacao");
  if (fotoURLs.length > 0) {
    painel.style.display = "";
    renderFotosGrid();
  } else painel.style.display = "none";
}

let inputDebounce = null;
function agendarAtualizacao() {
  clearTimeout(inputDebounce);
  inputDebounce = setTimeout(atualizarPreview, 80);
}
$("form").addEventListener("input", agendarAtualizacao);
$("form").addEventListener("change", agendarAtualizacao);
$("frase").addEventListener("input", () => { fraseEditada = true; });

const wrapEv = $("eventos");
function renumerar() {
  [...wrapEv.children].forEach((el, i) => (el.querySelector(".ev-topo b").textContent = "Momento " + (i + 1)));
  $("btnAddEv").style.display = wrapEv.children.length >= MAX_EVENTOS ? "none" : "block";
}

function addEvento() {
  if (wrapEv.children.length >= MAX_EVENTOS) return;
  const d = document.createElement("div");
  d.className = "ev-item";
  d.innerHTML =
    '<div class="ev-topo"><b>Momento</b><button type="button" class="ev-rem" title="Remover">✕</button></div>' +
    '<div class="grid2">' +
    '<div class="campo"><label>Data / época</label><input type="text" class="ev-data" maxlength="30" placeholder="Ex.: 2016"></div>' +
    '<div class="campo"><label>Título</label><input type="text" class="ev-titulo" maxlength="50" placeholder="Ex.: Quando nos conhecemos"></div>' +
    "</div>" +
    '<div class="campo"><label>Texto</label><textarea class="ev-texto" maxlength="800" placeholder="Conte esse momento..."></textarea></div>';
  d.querySelector(".ev-rem").addEventListener("click", () => {
    d.remove();
    renumerar();
    atualizarPreview();
  });
  wrapEv.appendChild(d);
  renumerar();
  atualizarPreview();
}

$("btnAddEv").addEventListener("click", addEvento);

function atualizarStepsVisual(n) {
  document.querySelectorAll(".step-item").forEach((s, i) => {
    s.classList.toggle("on", i === n - 1);
    s.classList.toggle("done", i < n - 1);
  });
  document.querySelectorAll(".step-line").forEach((l, i) => l.classList.toggle("done", i < n - 1));
}

function ir(n) {
  if (transicaoEmAndamento) return;
  const passoAtual = document.querySelector(".passo.ativo");
  const passoDestino = document.querySelector(`.passo[data-passo="${n}"]`);
  if (!passoDestino) return;
  const idxAtual = passoAtual ? Number(passoAtual.dataset.passo) : 1;
  const direcao = n >= idxAtual ? "avancando" : "voltando";
  window.scrollTo({ top: 0, behavior: "auto" });
  atualizarStepsVisual(n);
  if (passoAtual === passoDestino) return;
  transicaoEmAndamento = true;
  if (passoAtual) passoAtual.classList.add(direcao, "saindo");
  setTimeout(() => {
    if (passoAtual) passoAtual.classList.remove("ativo", direcao, "saindo");
    passoDestino.classList.add("ativo", direcao, "entrando");
    setTimeout(() => {
      passoDestino.classList.remove(direcao, "entrando");
      transicaoEmAndamento = false;
    }, 500);
  }, 250);
}

function validar(destino) {
  limparTodosErros();
  if (destino >= 2 && !tema) {
    $("erro1").textContent = "Escolha um tema para continuar.";
    $("passo1").classList.add("temas-erro");
    setTimeout(() => {
      const t = document.querySelector(".tema");
      if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return false;
  }
  if (destino >= 3) {
    let primeiroErro = null;
    if (!$("de").value.trim()) { marcarErro("de"); if (!primeiroErro) primeiroErro = "de"; }
    if (!$("para").value.trim()) { marcarErro("para"); if (!primeiroErro) primeiroErro = "para"; }
    if (!$("inicio").value) { marcarErro("inicio"); if (!primeiroErro) primeiroErro = "inicio"; }
    if (!$("carta").value.trim()) { marcarErro("carta"); if (!primeiroErro) primeiroErro = "carta"; }
    if (primeiroErro) return false;
  }
  return true;
}

document.querySelectorAll("[data-ir]").forEach((b) =>
  b.addEventListener("click", () => {
    const n = Number(b.dataset.ir);
    if (validar(n)) ir(n);
  })
);

$("fotos").addEventListener("change", (e) => {
  fotoURLs.forEach((u) => URL.revokeObjectURL(u));
  const files = [...e.target.files].slice(0, 12);
  fotoFiles = files;
  fotoURLs = files.map((f) => URL.createObjectURL(f));
  legendasValores = new Array(files.length).fill("");
  $("fotoCapa").value = 0;
  if (e.target.files.length > 12) $("erro3").textContent = "Máximo de 12 fotos.";
  $("qtdFotos").textContent = files.length ? files.length + " foto(s) selecionada(s)" : "";
  atualizarPainelPersonalizacao();
  atualizarPreview();
  if (files.length) limparErro("fotos");
});

$("videos").addEventListener("change", (e) => {
  videoURLs.forEach((u) => URL.revokeObjectURL(u));
  const files = [...e.target.files].slice(0, 4);
  videoURLs = files.map((f) => URL.createObjectURL(f));
  if (e.target.files.length > 4) $("erro3").textContent = "Máximo de 4 vídeos.";
  $("qtdVideos").textContent = files.length ? files.length + " vídeo(s) selecionado(s)" : "";
  atualizarPreview();
});

$("musica").addEventListener("change", (e) => {
  const file = e.target.files[0];
  $("qtdMusica").textContent = file ? file.name : "";
  
  const wrap = $("musicaPreviewWrap");
  const preview = $("musicaPreview");
  if (musicaPreviewURL) { URL.revokeObjectURL(musicaPreviewURL); musicaPreviewURL = null; }
  if (file) {
    musicaPreviewURL = URL.createObjectURL(file);
    preview.src = musicaPreviewURL;
    wrap.style.display = "block";
  } else {
    preview.removeAttribute("src");
    wrap.style.display = "none";
  }
  atualizarPreview();
});

document.querySelectorAll(".btn, .b").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
    btn.classList.remove("clicando");
    void btn.offsetWidth;
    btn.classList.add("clicando");
    setTimeout(() => btn.classList.remove("clicando"), 320);
  });
});

/* Gera uma miniatura JPEG (< 200KB) da capa para o admin ver */
async function gerarPreviewThumb() {
  const url = fotoURLs[Number($("fotoCapa").value) || 0] || fotoURLs[0];
  if (!url) return null;
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    const maxW = 320;
    const scale = Math.min(1, maxW / (img.width || maxW));
    canvas.width = Math.round((img.width || maxW) * scale);
    canvas.height = Math.round((img.height || maxW) * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    return dataUrl.length < 200_000 ? dataUrl : null;
  } catch { return null; }
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validar(4)) return;

  const fotos = fotoFiles.slice(0, 12);
  const videos = $("videos").files.length > 0 ? [...$("videos").files].slice(0, 4) : (pedidoAntigo ? pedidoAntigo.videos : []);
  const musica = $("musica").files[0] || (pedidoAntigo ? pedidoAntigo.musica : null);

  if (!fotos || fotos.length === 0) {
    marcarErro("fotos");
    return;
  }

  const eventos = [...document.querySelectorAll(".ev-item")].map((el) => ({
      data: el.querySelector(".ev-data").value.trim(),
      titulo: el.querySelector(".ev-titulo").value.trim(),
      texto: el.querySelector(".ev-texto").value.trim(),
    })).filter((ev) => ev.titulo || ev.texto);

  const amo = [...document.querySelectorAll(".amo")].map((i) => i.value.trim()).filter(Boolean);
  const legendas = [...document.querySelectorAll(".legenda-input")].map((i) => i.value.trim());
  const fotoCapa = Number($("fotoCapa").value) || 0;
  const usarIntro = $("usarIntro").checked, autoplay = $("autoplay").checked;
  const rodapeCustom = $("rodapeCustom").value.trim();
  
  const btn = $("btnFinal");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  const titulo = $("titulo").value.trim() || "Nós dois";
  const frase = $("frase").value.trim() || (THEMES[tema] ? THEMES[tema].sufixo : "");

  try {
    // 1) Metadados → backend (contrato: POST /api/purchases, status=pending)
    const preview = await gerarPreviewThumb();
    const { purchase } = await window.ApiPurchases.create({
      tema, titulo,
      de: $("de").value.trim(),
      para: $("para").value.trim(),
      inicio: $("inicio").value,
      carta: $("carta").value.trim(),
      has_media: fotos.length > 0 || videos.length > 0 || !!musica,
      preview_data_url: preview,
      themeData: window.NAThemeEditor?.getData() || {},
    });

    // 2) Mídia rica (blobs) → IndexedDB local (nunca vai ao servidor)
    await salvarPedido({
      id: purchase.id,
      tema, titulo, frase,
      themeData: window.NAThemeEditor?.getData() || {},
      de: $("de").value.trim(),
      para: $("para").value.trim(),
      inicio: $("inicio").value,
      carta: $("carta").value.trim(),
      eventos,
      amo,
      musicaNome: $("musicaNome").value.trim(),
      musicaArtista: $("musicaArtista").value.trim(),
      fotos,
      videos,
      musica,
      fotoCapa,
      legendas,
      usarIntro,
      autoplay,
      rodapeCustom,
      status: purchase.status,
      criadoEm: purchase.created_at,
    });

    location.href = "pagamento.html?id=" + purchase.id;
  } catch (err) {
    if (err && err.code === "NOT_AUTHENTICATED") {
      $("erro3").textContent = "Faça login para salvar o presente. Redirecionando...";
      setTimeout(() => (location.href = "login.html"), 1200);
      return;
    }
    $("erro3").textContent = (err && err.message) || "Não foi possível salvar. Tente com arquivos menores.";
    btn.disabled = false;
    btn.textContent = "Ir para o pagamento →";
  }
});

$("previewBtn").addEventListener("click", () => $("previewCol").classList.add("mobile-open"));
$("previewClose").addEventListener("click", () => $("previewCol").classList.remove("mobile-open"));

(function () {
  const phone = $("previewPhone"), stage = $("phoneStage");
  if (window.matchMedia("(pointer: coarse)").matches) return;
  stage.addEventListener("mouseenter", () => phone.classList.add("tilting"));
  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    phone.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
  });
  stage.addEventListener("mouseleave", () => {
    phone.style.transform = "rotateY(0) rotateX(0)";
    phone.classList.remove("tilting");
  });
})();

async function carregarPedidoParaEdicao() {
  const id = parametro("id");
  if (!id) return;

  // Mídia rica (fotos, eventos etc.) fica no IndexedDB local
  const local = await buscarPedido(id).catch(() => null);

  // Metadados + status vêm do backend (contrato: GET /api/purchases/:id)
  let apiPedido = null;
  try {
    ({ purchase: apiPedido } = await window.ApiPurchases.getOne(id));
  } catch (err) {
    if (err && err.code === "NOT_AUTHENTICATED") { location.href = "login.html"; return; }
    if ((!err || err.status === 404) && !local) { location.href = "criar.html"; return; }
  }

  const pedido = { ...(local || {}), ...(apiPedido || {}) };
  if (!apiPedido && !local) return;
  if (apiPedido && apiPedido.status === "paid") { location.href = "resultado.html?id=" + id; return; }

  pedidoEditandoId = pedido.id;
  pedidoAntigo = pedido;
  
  document.querySelector(".criar-eyebrow").innerHTML = '<span class="dot"></span> Editando presente';
  document.querySelector(".criar-titulo").innerHTML = 'Editando a <em>história</em>';
  $("btnFinal").textContent = "Salvar alterações →";

  tema = pedido.tema;
  window.NAThemeEditor?.restore(pedido.themeData);
  const cardTema = document.querySelector(`.tema[data-chave="${tema}"]`);
  if (cardTema) setTimeout(() => cardTema.click(), 100);

  $("de").value = pedido.de || "";
  $("para").value = pedido.para || "";
  $("titulo").value = pedido.titulo || "";
  $("inicio").value = pedido.inicio || "";
  $("frase").value = pedido.frase || "";
  $("carta").value = pedido.carta || "";
  $("musicaNome").value = pedido.musicaNome || "";
  $("musicaArtista").value = pedido.musicaArtista || "";
  $("usarIntro").checked = pedido.usarIntro !== false;
  $("autoplay").checked = !!pedido.autoplay;
  $("rodapeCustom").value = pedido.rodapeCustom || "";

  wrapEv.innerHTML = "";
  if (pedido.eventos && pedido.eventos.length > 0) {
    pedido.eventos.forEach(ev => {
      addEvento();
      const last = wrapEv.lastElementChild;
      last.querySelector(".ev-data").value = ev.data || "";
      last.querySelector(".ev-titulo").value = ev.titulo || "";
      last.querySelector(".ev-texto").value = ev.texto || "";
    });
  } else {
    addEvento();
  }

  const amoInputs = document.querySelectorAll(".amo");
  if (pedido.amo) {
    pedido.amo.forEach((val, i) => { if (amoInputs[i]) amoInputs[i].value = val; });
  }

  if (pedido.fotos && pedido.fotos.length > 0) {
    fotoFiles = pedido.fotos;
    fotoURLs = fotoFiles.map(f => URL.createObjectURL(f));
    legendasValores = pedido.legendas || new Array(fotoFiles.length).fill("");
    $("fotoCapa").value = pedido.fotoCapa || 0;
    atualizarPainelPersonalizacao();
    $("qtdFotos").textContent = fotoFiles.length + " foto(s) carregada(s)";
  }

  if (pedido.videos && pedido.videos.length > 0) {
    videoURLs = pedido.videos.map(f => URL.createObjectURL(f));
    $("qtdVideos").textContent = videoURLs.length + " vídeo(s) carregado(s)";
  }

  if (pedido.musica) {
    $("qtdMusica").textContent = "Música carregada";
    const wrap = $("musicaPreviewWrap");
    const preview = $("musicaPreview");
    if (musicaPreviewURL) { URL.revokeObjectURL(musicaPreviewURL); }
    musicaPreviewURL = URL.createObjectURL(pedido.musica);
    preview.src = musicaPreviewURL;
    wrap.style.display = "block";
  }

  fraseEditada = true;
  setTimeout(atualizarPreview, 150);
}

/* Boot aguarda o GET /api/config (temas e cores) */
NA_CONFIG_READY.then(() => {
  addEvento();
  addEvento();
  atualizarPreview();
  carregarPedidoParaEdicao();
});
