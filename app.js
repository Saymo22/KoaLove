const CONFIG = { preco: 19.9, modoTeste: true };

const THEMES = {
  /* CLÁSSICOS */
  namoro: {
    nome: "Namoro",
    emoji: "❤️",
    desc: "Declare seu amor",
    categoria: "classico",
    layout: "padrao",
    pequeno: "Uma história que continua...",
    sufixo: "de amor, risadas e momentos inesquecíveis.",
    amo: "O que eu amo em você",
    cores: {
      rosa: "#d96c8a",
      rosaClaro: "#f8dce5",
      pastel: "#fff1f5",
      vinho: "#7d3048",
      escuro: "#4d1e2d",
      texto: "#4b3740",
    },
  },
  casamento: {
    nome: "Casamento",
    emoji: "💍",
    desc: "Aniversário ou pedido",
    categoria: "classico",
    layout: "padrao",
    pequeno: "Para sempre juntos...",
    sufixo: "de união, cumplicidade e amor.",
    amo: "O que eu amo em você",
    cores: {
      rosa: "#b8903f",
      rosaClaro: "#f1e4c3",
      pastel: "#fffaf0",
      vinho: "#5c4519",
      escuro: "#3a2c0f",
      texto: "#4a3f2a",
    },
  },
  amizade: {
    nome: "Amizade",
    emoji: "🤝",
    desc: "Para aquele amigo especial",
    categoria: "classico",
    layout: "padrao",
    pequeno: "Amizade de verdade...",
    sufixo: "de parceria, histórias e boas risadas.",
    amo: "O que eu admiro em você",
    cores: {
      rosa: "#e08a3c",
      rosaClaro: "#fbe3c9",
      pastel: "#fff6ec",
      vinho: "#8a4a12",
      escuro: "#5a2f0a",
      texto: "#4d3b2c",
    },
  },
  familia: {
    nome: "Família",
    emoji: "🏡",
    desc: "Pais, filhos, irmãos",
    categoria: "classico",
    layout: "padrao",
    pequeno: "Laços que não se desfazem...",
    sufixo: "de carinho, cuidado e memórias em família.",
    amo: "O que eu amo em você",
    cores: {
      rosa: "#4f9d7a",
      rosaClaro: "#d4eddf",
      pastel: "#f1faf5",
      vinho: "#1f5a41",
      escuro: "#12382a",
      texto: "#2f4a3e",
    },
  },
  aniversario: {
    nome: "Aniversário",
    emoji: "🎂",
    desc: "Uma surpresa de parabéns",
    categoria: "classico",
    layout: "padrao",
    pequeno: "Hoje é o seu dia...",
    sufixo: "de histórias para celebrar.",
    amo: "O que eu admiro em você",
    cores: {
      rosa: "#7a6ad8",
      rosaClaro: "#e0dbfa",
      pastel: "#f6f4ff",
      vinho: "#3f3391",
      escuro: "#271f61",
      texto: "#3d3a57",
    },
  },
  "carta-antiga": {
    nome: "Carta Antiga",
    emoji: "✉️",
    desc: "Romance epistolar",
    categoria: "classico",
    layout: "carta-antiga",
    pequeno: "Uma carta guardada no tempo...",
    sufixo: "de palavras escritas com o coração.",
    amo: "O que guardei de você",
    cores: {
      rosa: "#b8860b",
      rosaClaro: "#e8d5a3",
      pastel: "#f5e6c8",
      vinho: "#4a3820",
      escuro: "#2d1f0f",
      texto: "#3a2f1a",
    },
  },
  scrapbook: {
    nome: "Scrapbook",
    emoji: "🎨",
    desc: "Álbum de recortes",
    categoria: "classico",
    layout: "scrapbook",
    pequeno: "Recortes da nossa vida...",
    sufixo: "de memórias coladas com carinho.",
    amo: "Meus recortes favoritos",
    cores: {
      rosa: "#ff8fa3",
      rosaClaro: "#ffc2ce",
      pastel: "#fdf0e3",
      vinho: "#8b3a4a",
      escuro: "#5a2530",
      texto: "#4d3b2c",
    },
  },
  jardim: {
    nome: "Jardim Secreto",
    emoji: "🌿",
    desc: "Herbário vitoriano",
    categoria: "classico",
    layout: "jardim",
    pequeno: "Floresceu em meu coração...",
    sufixo: "de folhas, flores e amor.",
    amo: "Flores do meu jardim",
    cores: {
      rosa: "#c9a86a",
      rosaClaro: "#e8d5b0",
      pastel: "#f5f1e8",
      vinho: "#2d4a2d",
      escuro: "#1a2e1a",
      texto: "#3a4a3a",
    },
  },

  /* EXCLUSIVOS */
  cinema: {
    nome: "Cinema Clássico",
    emoji: "🎬",
    desc: "Hollywood anos 50",
    categoria: "especial",
    layout: "cinema",
    pequeno: "Uma história digna de Oscar...",
    sufixo: "na tela da minha vida.",
    amo: "As cenas favoritas",
    cores: {
      rosa: "#d4af37",
      rosaClaro: "#f4e4c1",
      pastel: "#1a1a1a",
      vinho: "#f4e4c1",
      escuro: "#000000",
      texto: "#f4e4c1",
    },
  },
  retro: {
    nome: "Retrô Anos 80",
    emoji: "📼",
    desc: "Neon e VHS",
    categoria: "especial",
    layout: "retro",
    pequeno: "Rewind para o nosso amor...",
    sufixo: "de sintetizadores e neon.",
    amo: "Faixas do nosso mixtape",
    cores: {
      rosa: "#ff006e",
      rosaClaro: "#ff6ba5",
      pastel: "#0a0a1a",
      vinho: "#00d9ff",
      escuro: "#000000",
      texto: "#e0e0ff",
    },
  },
  netflix: {
    nome: "Netflix",
    emoji: "🎬",
    desc: "Sua história como uma série original",
    categoria: "especial",
    layout: "netflix",
    pequeno: "Uma série original",
    sufixo: "a temporada mais bonita da minha vida.",
    amo: "Destaques da temporada",
    cores: {
      rosa: "#e50914",
      rosaClaro: "#2a2a2a",
      pastel: "#0b0b0b",
      vinho: "#ffffff",
      escuro: "#000000",
      texto: "#e5e5e5",
    },
  },
  spotify: {
    nome: "Spotify",
    emoji: "🎧",
    desc: "Sua história como uma playlist",
    categoria: "especial",
    layout: "spotify",
    pequeno: "Sua playlist",
    sufixo: "as músicas que contam a nossa história.",
    amo: "Faixas favoritas",
    cores: {
      rosa: "#1DB954",
      rosaClaro: "#191414",
      pastel: "#121212",
      vinho: "#ffffff",
      escuro: "#000000",
      texto: "#e5e5e5",
    },
  },
  vinil: {
    nome: "Vinil",
    emoji: "🎵",
    desc: "Sua história como um disco de vinil",
    categoria: "especial",
    layout: "vinil",
    pequeno: "Edição de colecionador",
    sufixo: "o disco que toca no meu coração.",
    amo: "Faixas favoritas",
    cores: {
      rosa: "#d4a24e",
      rosaClaro: "#2d1810",
      pastel: "#1a0f08",
      vinho: "#f4ead5",
      escuro: "#0d0603",
      texto: "#e8dcc4",
    },
  },
};

const DB_NAME = "presente-db",
  STORE = "pedidos";
function abrirDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function salvarPedido(pedido) {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(pedido);
    tx.oncomplete = () => res(pedido);
    tx.onerror = () => rej(tx.error);
  });
}
async function buscarPedido(id) {
  const db = await abrirDB();
  return new Promise((res, rej) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  });
}
function novoId() {
  return (
    Math.random().toString(36).slice(2, 6) +
    Math.random().toString(36).slice(2, 6)
  );
}
function parametro(nome) {
  return new URLSearchParams(location.search).get(nome);
}
function formatarPreco(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function aplicarTema(chave) {
  const t = (THEMES[chave] || THEMES.namoro).cores,
    s = document.documentElement.style;
  s.setProperty("--rosa", t.rosa);
  s.setProperty("--rosa-claro", t.rosaClaro);
  s.setProperty("--rosa-pastel", t.pastel);
  s.setProperty("--vinho", t.vinho);
  s.setProperty("--vinho-escuro", t.escuro);
  s.setProperty("--texto", t.texto);
}
function temaEscuro(chave) {
  const t = THEMES[chave] || THEMES.namoro;
  return (
    t.categoria === "especial" ||
    t.cores.pastel === "#1a1a1a" ||
    t.cores.pastel === "#0a0a1a"
  );
}
function tempoJuntos(inicioISO) {
  const ini = new Date(inicioISO + "T00:00:00"),
    agora = new Date();
  let meses =
    (agora.getFullYear() - ini.getFullYear()) * 12 +
    (agora.getMonth() - ini.getMonth());
  if (agora.getDate() < ini.getDate()) meses--;
  meses = Math.max(0, meses);
  const ms = Math.max(0, agora - ini);
  return {
    anos: Math.floor(meses / 12),
    meses,
    dias: Math.floor(ms / 864e5),
    horas: Math.floor(ms / 36e5),
  };
}
function textoDuracao(t) {
  const a = Math.floor(t.meses / 12),
    m = t.meses % 12,
    p = [];
  if (a) p.push(a + (a === 1 ? " ano" : " anos"));
  if (m) p.push(m + (m === 1 ? " mês" : " meses"));
  return p.length ? p.join(" e ") : t.dias + (t.dias === 1 ? " dia" : " dias");
}
