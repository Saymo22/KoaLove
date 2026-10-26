const $ = (id) => document.getElementById(id);
let tema = null,
  fraseEditada = false,
  fotoURLs = [],
  fotoFiles = [],
  legendasValores = [];
let draggedIdx = null,
  videoURLs = [],
  previewReturnFocus = null;

let pedidoEditandoId = null;
let pedidoAntigo = null;
let selectedPlanId = new URLSearchParams(location.search).get('plano');
function creatorPlan(){return pedidoAntigo?.plan || window.NA_PRICING?.plans?.find(p=>p.id===selectedPlanId) || {photos_limit:12,videos_limit:4,music_limit:1};}
function renderCreatorPlan(){
 const select=$('creatorPlan');if(!select)return;
 const plans=window.NA_PRICING?.plans||[];
 selectedPlanId=pedidoAntigo?.plan_id||selectedPlanId||window.NA_PRICING?.default_plan_id;
 if(!pedidoAntigo?.plan_id&&!plans.some(p=>p.id===selectedPlanId))selectedPlanId=window.NA_PRICING?.default_plan_id||plans[0]?.id;
 select.replaceChildren(...plans.map(p=>new Option(p.name+' — '+formatarPreco(p.amount_cents/100),p.id)));
 if(pedidoAntigo?.plan_id&&!plans.some(p=>p.id===pedidoAntigo.plan_id))select.add(new Option(pedidoAntigo.plan?.name||'Plano do pedido',pedidoAntigo.plan_id));
 select.value=selectedPlanId||'';select.disabled=!!pedidoEditandoId;
 const plan=creatorPlan();$('creatorPlanDetails').textContent=`Até ${plan.photos_limit} fotos, ${plan.videos_limit} vídeos e ${plan.music_limit} música. O preço final é conferido antes do pagamento.`;
 $('musica').disabled=!plan.music_limit;
}
$('creatorPlan')?.addEventListener('change',event=>{selectedPlanId=event.target.value;renderCreatorPlan();});
let musicaPreviewURL = null;
let photoIds=[],videoIds=[],musicId=null;
let requestId;
try {requestId=sessionStorage.getItem('na_creator_request');}catch{}
requestId ||= NAGift.id();
try {sessionStorage.setItem('na_creator_request',requestId);}catch{}
let draftKey='__draft_'+requestId;
const mediaURL=NAGift.url;
function preservePhotoRefs(){window.NAThemeEditor?.restore(NAGift.refs(window.NAThemeEditor.getData(),photoIds));}
function captureDraft(){
 const p={id:draftKey,updated_at:Date.now(),client_request_id:requestId,serverId:pedidoEditandoId,plan_id:pedidoAntigo?.plan_id||selectedPlanId||undefined,tema,step:window.NACreatorWorkflow.current,photoIds:[...photoIds],videoIds:[...videoIds],musicId,
 fotos:[...fotoFiles],videos:$('videos').files.length?[...$('videos').files].slice(0,4):(pedidoAntigo?.videos||[]),musica:$('musica').files[0]||pedidoAntigo?.musica||null,
 themeData:window.NAThemeEditor?.getData()||{},legendas:[...document.querySelectorAll('.legenda-input')].map(el=>el.value.trim()),fotoCapa:Number($('fotoCapa').value)||0,
 usarIntro:$('usarIntro').checked,autoplay:$('autoplay').checked,
 eventos:[...document.querySelectorAll('.ev-item')].map(el=>({data:el.querySelector('.ev-data').value.trim(),titulo:el.querySelector('.ev-titulo').value.trim(),texto:el.querySelector('.ev-texto').value.trim()})).filter(e=>e.titulo||e.texto),
 amo:[...document.querySelectorAll('.amo')].map(el=>el.value.trim()).filter(Boolean)};
 for(const key of ['titulo','de','para','inicio','carta','frase','musicaNome','musicaArtista','rodapeCustom'])p[key]=$(key).value.trim();
 if(window.NACreatorWorkflow.profile(tema).namesOnly)p.titulo=[p.de,p.para].join(' & ');
 return NAGift.prepare(p);
}

const MAX_EVENTOS = 6;

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

/* Flash dourado nos números do contador ao mudar */
["pAnos", "pMeses", "pDias", "pHoras"].forEach((id) => {
  const el = $(id);
  if (!el) return;
  let last = el.textContent;
  new MutationObserver(() => {
    if (el.textContent === last) return;
    last = el.textContent;
    el.classList.remove("num-flash");
    void el.offsetWidth;
    el.classList.add("num-flash");
  }).observe(el, { childList: true, characterData: true, subtree: true });
});

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
  if(!parametro('id')&&!parametro('resume')) {
    const requested=parametro('tema');
    const card=todosCards.find(item=>item.dataset.chave===requested);
    card?.click();
  }
});

function aplicarTemaPreview(chave) {
  const chosen=THEMES[chave] || window.NA_THEME_METADATA?.[chave] || Object.values(THEMES)[0];
  if(!chosen)return;
  const t=chosen.cores,s=$("previewScreen");
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

function atualizarPreview() {
  const temaChave = tema || Object.keys(THEMES)[0];
  const t = THEMES[temaChave] || window.NA_THEME_METADATA?.[temaChave];
  if(!t)return;
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
  window.NAThemeEditor?.setPhotos(fotoURLs,[...document.querySelectorAll('.ev-item')].map(el=>({data:el.querySelector('.ev-data').value.trim(),titulo:el.querySelector('.ev-titulo').value.trim(),texto:el.querySelector('.ev-texto').value.trim()})).filter(ev=>ev.titulo||ev.texto),photoIds);
  window.NACreatorWorkflow?.configure(temaChave);
  pulsarPreview();
}

// O mesmo HTML usado em ver.html, isolado dos estilos do formulário.
let themePreviewFrame = null;
let temaPreviewKey = null;
function atualizarPreviewTema(chave) {
  const ativo = !!window.NA_THEME_FILES?.[chave];
  $("previewScroll").classList.toggle("preview-tema", ativo);
  $("previewDots").hidden = ativo;
  const empty=$("previewEmpty");if(empty)empty.hidden=ativo;
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
  if(window.NACreatorWorkflow?.profile(temaPreviewKey).namesOnly)p.titulo=[p.de,p.para].filter(Boolean).join(' & ');
  p.de ||= "Alguém especial";
  p.para ||= "Você";
  p.photoIds = [...photoIds];
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
  preservePhotoRefs();
  photoIds.splice(to,0,photoIds.splice(from,1)[0]);
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

  preservePhotoRefs();
  [photoIds[idx],photoIds[to]]=[photoIds[to],photoIds[idx]];
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
  preservePhotoRefs();
  photoIds.splice(idx,1);
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
    painel.hidden = false;
    renderFotosGrid();
  } else painel.hidden = true;
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

function atualizarStepsVisual(n) { window.NACreatorWorkflow.updateProgress(n); }

function ir(n) {
  const destino=document.querySelector('.passo[data-passo="'+n+'"]');if(!destino)return;
  document.querySelectorAll('.passo').forEach(el=>{el.hidden=el!==destino;el.classList.toggle('ativo',el===destino);});
  atualizarStepsVisual(n);window.scrollTo({top:0,behavior:'auto'});
  destino.querySelector('h2')?.focus({preventScroll:true});
}

function validar(destino) {
  limparTodosErros();
  if(destino>=2&&!tema){ir(1);$('erro1').textContent='Escolha um tema para continuar.';return false;}
  const current=window.NACreatorWorkflow.current;
  const fail=(step,field)=>{ir(step);marcarErro(field);return false;};
  if((destino>current||destino===9)&&destino>=3){if(!$('de').value.trim())return fail(2,'de');if(!$('para').value.trim())return fail(2,'para');}
  if((destino>current||destino===9)&&destino>=4&&!fotoFiles.length)return fail(3,'fotos');
  if((destino>current||destino===9)&&destino>=7&&!$('carta').value.trim())return fail(6,'carta');
  return true;
}

document.querySelectorAll("[data-ir], [data-step]").forEach((b) =>
  b.addEventListener("click", () => {
    const n = Number(b.dataset.ir || b.dataset.step);
    if (validar(n)) ir(n);
  })
);

$("fotos").addEventListener("change", (e) => {
  fotoURLs.forEach((u) => URL.revokeObjectURL(u));
  const files = [...e.target.files].slice(0, 12);
  preservePhotoRefs();
  fotoFiles = files;
  photoIds=files.map(()=>NAGift.id());
  fotoURLs = files.map((f) => mediaURL(f));
  legendasValores = new Array(files.length).fill("");
  $("fotoCapa").value = 0;
  if (e.target.files.length > 12) $("erroMedia").textContent = "Máximo de 12 fotos.";
  $("qtdFotos").textContent = files.length ? files.length + " foto(s) selecionada(s)" : "";
  atualizarPainelPersonalizacao();
  atualizarPreview();
  if (files.length) limparErro("fotos");
});

$("videos").addEventListener("change", (e) => {
  videoURLs.forEach((u) => URL.revokeObjectURL(u));
  const files = [...e.target.files].slice(0, 4);
  videoIds=files.map(()=>NAGift.id());
  if(pedidoAntigo)pedidoAntigo.videos=files;
  videoURLs = files.map((f) => URL.createObjectURL(f));
  if (e.target.files.length > 4) $("erro3").textContent = "Máximo de 4 vídeos.";
  $("qtdVideos").textContent = files.length ? files.length + " vídeo(s) selecionado(s)" : "";
  atualizarPreview();
});

$("musica").addEventListener("change", (e) => {
  const file = e.target.files[0];
  musicId=file?NAGift.id():null;
  if(pedidoAntigo)pedidoAntigo.musica=file||null;
  $("qtdMusica").textContent = file ? file.name : "";

  const wrap = $("musicaPreviewWrap");
  const preview = $("musicaPreview");
  if (musicaPreviewURL) { URL.revokeObjectURL(musicaPreviewURL); musicaPreviewURL = null; }
  if (file) {
    musicaPreviewURL = URL.createObjectURL(file);
    preview.src = musicaPreviewURL;
    wrap.hidden = false;
  } else {
    preview.removeAttribute("src");
    wrap.hidden = true;
  }
  atualizarPreview();
});

$('removerMusica')?.addEventListener('click',()=>{
  $('musica').value='';musicId=null;
  if(pedidoAntigo)pedidoAntigo.musica=null;
  $('qtdMusica').textContent='';
  const preview=$('musicaPreview');preview.pause();preview.removeAttribute('src');preview.load();
  if(musicaPreviewURL){URL.revokeObjectURL(musicaPreviewURL);musicaPreviewURL=null;}
  $('musicaPreviewWrap').hidden=true;atualizarPreview();
});

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
  if (window.NACreatorWorkflow.current !== 8) {
    const next=window.NACreatorWorkflow.current+1;if(validar(next))ir(next);return;
  }
  if (!validar(9)) return;

  const btn=$('btnFinal');btn.disabled=true;btn.textContent='Enviando presente…';
  const draft=captureDraft();
  const plan=creatorPlan();
  if(draft.fotos.length>plan.photos_limit||draft.videos.length>plan.videos_limit||(draft.musica&&!plan.music_limit)){
    $('erro3').textContent='As mídias ultrapassam os limites do plano escolhido.';btn.disabled=false;btn.textContent='Continuar para pagamento';ir(3);return;
  }
  photoIds=draft.photoIds;videoIds=draft.videoIds;musicId=draft.musicId;
  let recoverable=false;
  try {
    await salvarPedido(draft).then(()=>{recoverable=true;}).catch(()=>{});
    let purchase;
    if(!pedidoEditandoId){
      ({purchase}=await ApiPurchases.create(draft));
      pedidoEditandoId=purchase.id;draft.serverId=purchase.id;
      await salvarPedido(draft).catch(()=>{});
    }
    draft.preview_data_url=await gerarPreviewThumb();
    ({purchase}=await NAGift.sync(draft,pedidoEditandoId));
    // O cache local é opcional depois da confirmação do servidor.
    await salvarPedido({...draft,...purchase,id:purchase.id}).catch(()=>{});
    await excluirPedidoDB(draftKey).catch(()=>{});
    try{sessionStorage.removeItem('na_creator_request');}catch{}
    location.href='pagamento.html?id='+encodeURIComponent(purchase.id);
  } catch(err) {
    if(err?.status===401){
      if(recoverable){location.href='login.html?next='+encodeURIComponent('criar.html?resume='+requestId);return;}
      $('erroMedia').textContent='Não foi possível guardar o rascunho neste navegador. Abra o login em outra aba, entre e tente salvar novamente sem fechar esta página.';
    }else $('erroMedia').textContent=err?.message||'Não foi possível salvar. Tente novamente.';
    ir(3);btn.disabled=false;btn.textContent='Tentar salvar novamente →';
  }
});

function abrirPrevia(expanded=false){if(!document.body.classList.contains('preview-open'))previewReturnFocus=document.activeElement;$('previewCol').classList.add('mobile-open');$('previewCol').classList.toggle('expanded',expanded);document.body.classList.add('preview-open');$('previewCol').setAttribute('role','dialog');$('previewCol').setAttribute('aria-modal','true');document.querySelector('.app-wrap').inert=true;$('navbar').inert=true;$('previewExpand').setAttribute('aria-pressed',String(expanded));$('previewClose').focus();}
function fecharPrevia(){$('previewCol').classList.remove('mobile-open','expanded');document.body.classList.remove('preview-open');$('previewCol').removeAttribute('role');$('previewCol').removeAttribute('aria-modal');document.querySelector('.app-wrap').inert=false;$('navbar').inert=false;$('previewExpand').setAttribute('aria-pressed','false');(previewReturnFocus||$('previewBtn')).focus();}
$('previewBtn').addEventListener('click',()=>abrirPrevia());
$('reviewPreview').addEventListener('click',()=>abrirPrevia(true));
$('previewClose').addEventListener('click',fecharPrevia);
$('previewExpand').addEventListener('click',()=>{if($('previewCol').classList.contains('expanded'))fecharPrevia();else abrirPrevia(true);});
$('previewHome').addEventListener('click',()=>{try{themePreviewFrame?.contentWindow.scrollTo({top:0,behavior:'smooth'});}catch{}});
document.addEventListener('keydown',event=>{
  if(!document.body.classList.contains('preview-open'))return;
  if(event.key==='Escape'){event.preventDefault();fecharPrevia();}
  if(event.key==='Tab'){const controls=[$('previewHome'),$('previewExpand'),themePreviewFrame,$('previewClose')].filter(Boolean);if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}}
});
window.NACreatorMedia={videos:()=>videoURLs};

async function carregarPedidoParaEdicao() {
  const id = parametro("id");
  const resume=parametro('resume');
  let recovered=null;
  if(resume && /^[\w-]{16,100}$/.test(resume))recovered=await buscarPedido('__draft_'+resume).catch(()=>null);
  if(!recovered) {
    const candidate = await NA.db.buscarRascunho({serverId:id||null,requestId}).catch(()=>null);
    if(candidate) recovered = await escolherRascunho(candidate);
  }
  if(!id&&!recovered)return;

  // Mídia rica (fotos, eventos etc.) fica no IndexedDB local
  const local = recovered || await buscarPedido(id).catch(() => null);

  // Metadados + status vêm do backend (contrato: GET /api/purchases/:id)
  let apiPedido = null;
  try {
    const serverId = id || recovered?.serverId;
    if(serverId)({ purchase: apiPedido } = await window.ApiPurchases.getOne(serverId));
  } catch (err) {
    if (err && err.code === "NOT_AUTHENTICATED") { location.href = 'login.html?next='+encodeURIComponent(recovered?'criar.html?resume='+recovered.client_request_id:'criar.html?id='+id); return; }
    $('erroMedia').textContent=err.message||'Não foi possível carregar.';ir(3);return;

  }

  // A cópia interrompida é mais recente que o último conteúdo confirmado.
  const pedido = recovered ? { ...(apiPedido || {}), ...recovered } : { ...(local || {}), ...(apiPedido || {}) };
  if(apiPedido&&apiPedido.content_version!==1&&local){pedido.fotos=local.fotos||[];pedido.videos=local.videos||[];pedido.musica=local.musica||null;}
  if (!apiPedido && !local) return;
  if (apiPedido && apiPedido.status !== 'pending') { location.href = apiPedido.status === 'paid' ? 'resultado.html?id='+apiPedido.id : 'minha-conta.html'; return; }

  pedidoEditandoId = recovered ? recovered.serverId || null : pedido.id;
  if(recovered){requestId=recovered.client_request_id;draftKey='__draft_'+requestId;try{sessionStorage.setItem('na_creator_request',requestId);}catch{}}
  photoIds=pedido.fotos?.map((_,i)=>pedido.photoIds?.[i]||NAGift.id())||[];
  videoIds=pedido.videoIds||pedido.media?.videos||[];musicId=pedido.musicId||pedido.media?.music||null;
  pedido.themeData=NAGift.refs(pedido.themeData,photoIds);
  pedidoAntigo = pedido;
  renderCreatorPlan();

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
    fotoURLs = fotoFiles.map(f => mediaURL(f));
    legendasValores = pedido.legendas || new Array(fotoFiles.length).fill("");
    $("fotoCapa").value = pedido.fotoCapa || 0;
    atualizarPainelPersonalizacao();
    $("qtdFotos").textContent = fotoFiles.length + " foto(s) carregada(s)";
  }

  if (pedido.videos && pedido.videos.length > 0) {
    videoURLs = pedido.videos.map(f => mediaURL(f));
    $("qtdVideos").textContent = videoURLs.length + " vídeo(s) carregado(s)";
  }

  if (pedido.musica) {
    $("qtdMusica").textContent = "Música carregada";
    const wrap = $("musicaPreviewWrap");
    const preview = $("musicaPreview");
    if (musicaPreviewURL) { URL.revokeObjectURL(musicaPreviewURL); }
    musicaPreviewURL = mediaURL(pedido.musica);
    preview.src = musicaPreviewURL;
    wrap.hidden = false;
  }

  fraseEditada = true;
  setTimeout(()=>{atualizarPreview();if(recovered)ir(Math.max(1,Math.min(8,recovered.step||1)));},150);
}

function escolherRascunho(candidate) {
  return new Promise(resolve => {
    const panel = $('draftRecovery'); panel.hidden = false;
    // Impede que um formulário novo sobrescreva a cópia enquanto se decide.
    const form = $('form'), wizard = $('steps'); form.inert = wizard.inert = true;
    const finish = value => {panel.hidden=true;form.inert=wizard.inert=false;resolve(value);};
    $('resumeDraft').onclick = () => {finish(candidate);};
    $('discardDraft').onclick = async () => {
      try {
        await excluirPedidoDB(candidate.id);
        requestId=NAGift.id();draftKey='__draft_'+requestId;
        try{sessionStorage.setItem('na_creator_request',requestId);}catch{}
        finish(null);
      } catch {$('draftRecoveryError').textContent='Não foi possível descartar a cópia local. Tente novamente.';}
    };
    $('resumeDraft').focus();
  });
}

/* Boot aguarda o GET /api/config (temas e cores) */
NA_CONFIG_READY.then(() => {
  renderCreatorPlan();
  addEvento();
  addEvento();
  atualizarPreview();
  carregarPedidoParaEdicao();
});
