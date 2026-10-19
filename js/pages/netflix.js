const $ = id => document.getElementById(id);
const DEMO = {
  tema:"namoro", de:"João", para:"Camile", titulo:"Nós Dois", inicio:"2023-08-13",
  frase:"de amor, risadas e momentos inesquecíveis.",
  carta:"Meu amor,\n\nQuando penso em nós, percebo o quanto você se tornou importante para mim. Sou grato por cada momento que vivemos, por cada conversa, cada abraço e cada risada.\n\nObrigado por estar ao meu lado, por todo o carinho e por fazer meus dias mais felizes simplesmente por estar presente.\n\nEu te amo, hoje, amanhã e em todos os momentos que ainda vamos viver juntos. ❤️",
  eventos:[
    {data:"2016",titulo:"Quando nos conhecemos",texto:"Onde tudo começou. Um beijo escondido atrás de uma escada."},
    {data:"2016",titulo:"O começo de nós",texto:"Entre conversas, encontros e pequenos momentos."},
    {data:"Todos os Dias",titulo:"Uma lembrança especial",texto:"Guardo cada sorriso, cada abraço, cada olhar."}
  ],
  musicaNome:"Can't Help Falling In Love", musicaArtista:"Elvis Presley",
  fotos:["fotos/0.jpeg","fotos/1.jpeg","fotos/2.jpeg","fotos/3.jpeg","fotos/4.jpeg","fotos/5.jpeg","fotos/6.jpeg","fotos/7.jpeg","fotos/8.jpeg","fotos/9.jpeg","fotos/10.jpeg","fotos/11.jpeg"],
  musica:"musica/nossa-musicaa.mp3"
};
function src(x){ if(!x) return ""; return typeof x==="string" ? x : URL.createObjectURL(x); }

// Pontos de parada (poderiam vir do pedido.eventos + coordenadas; para demo usamos pontos reais do Rio)
const PONTOS = [
  { lat:-22.9068, lng:-43.1729, zoom:14, nome:"Onde nos conhecemos", data:"2016", desc:"Um beijo escondido atrás de uma escada. Ali, sem saber, começava uma das histórias mais bonitas da minha vida." },
  { lat:-22.9519, lng:-43.2105, zoom:14, nome:"Nosso primeiro passeio", data:"2016", desc:"Um dia inteiro rindo à toa, sem perceber que estava virando memória." },
  { lat:-22.9839, lng:-43.2046, zoom:14, nome:"Nossa praia favorita", data:"2022", desc:"Onde o tempo passa devagar e o mundo cabe numa toalha." },
  { lat:-22.9711, lng:-43.1822, zoom:14, nome:"Onde dissemos 'eu te amo'", data:"2024", desc:"Três palavras que mudaram tudo — e continuam mudando." },
  { lat:-22.9139, lng:-43.1806, zoom:15, nome:"Nosso cantinho", data:"Hoje", desc:"Onde tudo faz sentido e o resto pode esperar." }
];

// ===== MAPA =====
const mapa = L.map("map", {
  zoomControl:false, attributionControl:false,
  scrollWheelZoom:false, dragging:false, doubleClickZoom:false,
  touchZoom:false, boxZoom:false, keyboard:false
}).setView([PONTOS[0].lat, PONTOS[0].lng], 3);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom:19, subdomains:"abcd"
}).addTo(mapa);

const pins = [];
PONTOS.forEach((pt, i) => {
  const icone = L.divIcon({
    className:"",
    html:`<div class="mp-pin ${i===0?'':'dim'}"></div>`,
    iconSize:i===0?[20,20]:[14,14],
    iconAnchor:i===0?[10,10]:[7,7]
  });
  pins.push(L.marker([pt.lat, pt.lng], { icon: icone }).addTo(mapa));
});

// ===== STOPS =====
const wrapStops = $("mpStops");
PONTOS.forEach((pt, i) => {
  const el = document.createElement("div");
  el.className = "mp-stop";
  el.dataset.idx = i;
  el.innerHTML = `
    <div class="mp-card">
      <div class="num">${String(i+1).padStart(2,"0")} / ${String(PONTOS.length).padStart(2,"0")}</div>
      <h3>${pt.nome}</h3>
      <div class="data">${pt.data}</div>
      <p>${pt.desc}</p>
    </div>`;
  wrapStops.appendChild(el);
});

// ===== OBSERVER: ativa stop + flyTo =====
const stops = [...wrapStops.querySelectorAll(".mp-stop")];
let activeIdx = -1;
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      const i = Number(en.target.dataset.idx);
      if (i === activeIdx) return;
      activeIdx = i;
      en.target.classList.add("on");
      const pt = PONTOS[i];
      mapa.flyTo([pt.lat, pt.lng], pt.zoom, { duration: 1.4 });
      pins.forEach((m, k) => {
        const icon = m.getElement()?.querySelector(".mp-pin");
        if (icon) icon.classList.toggle("dim", k !== i);
      });
    }
  });
}, { rootMargin:"-45% 0px -45% 0px", threshold:0 });
stops.forEach(s => io.observe(s));

// ===== DADOS =====
(async () => {
  const id = parametro("id");
  let p = DEMO;
  if (id) { const real = await buscarPedido(id); if (real) p = real; }
  const t = THEMES[p.tema] || THEMES.namoro;
  const tempo = tempoJuntos(p.inicio);
  const fotos  = (p.fotos || []).map(src);
  const musica = src(p.musica);

  document.title = "Nossa Jornada — " + (p.titulo || "Nós Dois");
  $("mpTitulo").textContent = p.titulo || "Os lugares que marcaram nossa história";
  $("mpSub").textContent = textoDuracao(tempo) + " " + (p.frase || t.sufixo);

  // Stats
  $("mpAnos").textContent  = tempo.anos;
  $("mpMeses").textContent = tempo.meses;
  $("mpDias").textContent  = tempo.dias.toLocaleString("pt-BR");
  $("mpHoras").textContent = tempo.horas.toLocaleString("pt-BR");

  // Log = timeline
  const log = $("mpLog");
  const eventos = [...(p.eventos || [])];
  eventos.push({ data:new Date().toLocaleDateString("pt-BR"), titulo:"Hoje",
                 texto: textoDuracao(tempo) + " construindo nossa história." });
  eventos.forEach(ev => {
    const el = document.createElement("div");
    el.className = "mp-log-item";
    el.innerHTML = `<div class="data"></div><div><h3></h3><p></p></div>`;
    el.querySelector(".data").textContent = ev.data;
    el.querySelector("h3").textContent = ev.titulo;
    el.querySelector("p").textContent = ev.texto;
    log.appendChild(el);
  });

  // Portos = fotos
  const ports = $("mpPorts");
  fotos.forEach((u, i) => {
    const pt = PONTOS[i % PONTOS.length];
    const c = document.createElement("div");
    c.className = "mp-port";
    c.innerHTML = `<img alt=""><div class="label"><b></b><span></span></div>`;
    c.querySelector("img").src = u;
    c.querySelector("b").textContent = pt.nome;
    c.querySelector("span").textContent = pt.data;
    c.addEventListener("click", () => {
      window.scrollTo({ top: $("journey").offsetTop, behavior: "smooth" });
      setTimeout(() => mapa.flyTo([pt.lat, pt.lng], pt.zoom, { duration: 1.2 }), 500);
    });
    ports.appendChild(c);
  });

  // Carta
  const carta = $("mpCarta");
  (p.carta || "").split("\n\n").forEach(par => {
    const pp = document.createElement("p"); pp.textContent = par; carta.appendChild(pp);
  });
  const ass = document.createElement("span");
  ass.className = "assin"; ass.textContent = "Com todo meu amor, " + (p.de || "");
  carta.appendChild(ass);

  // Música
  if (musica) {
    $("musica").style.display = "";
    $("mpCoverMus").innerHTML = `<img src="${fotos[0] || ""}" alt="">`;
    $("mpMusNome").textContent = p.musicaNome || "Nossa música";
    $("mpMusArtista").textContent = p.musicaArtista || "";
    const a = $("mpAudio"), b = $("mpPlayBtn");
    a.src = musica;
    b.addEventListener("click", () => a.paused ? a.play().catch(()=>{}) : a.pause());
    a.addEventListener("play",  () => b.textContent = "❚❚");
    a.addEventListener("pause", () => b.textContent = "▶");
  }

  $("mpTrocar").href = "escolher-tema.html" + (id ? "?id=" + id : "");
})();
