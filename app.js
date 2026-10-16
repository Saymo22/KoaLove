/* =====================================================
   app.js — lógica compartilhada do fluxo de venda
===================================================== */

const CONFIG = {
    preco: 19.90,
    modoTeste: true
};

const THEMES = {
    namoro: {
        nome: "Namoro", emoji: "❤️", desc: "Declare seu amor",
        pequeno: "Uma história que continua...", sufixo: "de amor, risadas e momentos inesquecíveis.",
        cores: { rosa: "#d96c8a", rosaClaro: "#f8dce5", pastel: "#fff1f5", vinho: "#7d3048", escuro: "#4d1e2d", texto: "#4b3740" }
    },
    casamento: {
        nome: "Casamento", emoji: "💍", desc: "Aniversário de casamento ou pedido",
        pequeno: "Para sempre juntos...", sufixo: "de união, cumplicidade e amor.",
        cores: { rosa: "#b8903f", rosaClaro: "#f1e4c3", pastel: "#fffaf0", vinho: "#5c4519", escuro: "#3a2c0f", texto: "#4a3f2a" }
    },
    amizade: {
        nome: "Amizade", emoji: "🤝", desc: "Para aquele amigo especial",
        pequeno: "Amizade de verdade...", sufixo: "de parceria, histórias e boas risadas.",
        cores: { rosa: "#e08a3c", rosaClaro: "#fbe3c9", pastel: "#fff6ec", vinho: "#8a4a12", escuro: "#5a2f0a", texto: "#4d3b2c" }
    },
    familia: {
        nome: "Família", emoji: "🏡", desc: "Pais, filhos, irmãos",
        pequeno: "Laços que não se desfazem...", sufixo: "de carinho, cuidado e memórias em família.",
        cores: { rosa: "#4f9d7a", rosaClaro: "#d4eddf", pastel: "#f1faf5", vinho: "#1f5a41", escuro: "#12382a", texto: "#2f4a3e" }
    },
    aniversario: {
        nome: "Aniversário", emoji: "🎂", desc: "Uma surpresa de parabéns",
        pequeno: "Hoje é o seu dia...", sufixo: "de histórias para celebrar.",
        cores: { rosa: "#7a6ad8", rosaClaro: "#e0dbfa", pastel: "#f6f4ff", vinho: "#3f3391", escuro: "#271f61", texto: "#3d3a57" }
    },
    /* ===== NOVO TEMA: NETFLIX ===== */
    netflix: {
        nome: "Netflix", emoji: "🎬", desc: "Estilo streaming cinematográfico",
        pequeno: "Original Nosso Amor", sufixo: "de uma série que nunca acaba.",
        cores: {
            rosa: "#e50914",        /* acento vermelho Netflix */
            rosaClaro: "#2a2a2a",
            pastel: "#0b0b0b",      /* fundo preto */
            vinho: "#ffffff",       /* títulos brancos */
            escuro: "#000000",
            texto: "#e5e5e5"
        }
    }
};

/* Título da seção "Pequenas coisas" por tema */
THEMES.namoro.amoTitulo = "O que eu amo em você";
THEMES.casamento.amoTitulo = "O que eu amo em você";
THEMES.amizade.amoTitulo = "O que eu admiro em você";
THEMES.familia.amoTitulo = "O que eu amo em você";
THEMES.aniversario.amoTitulo = "O que eu admiro em você";
THEMES.netflix.amoTitulo = "Destaques da temporada";

/* ---------- armazenamento ---------- */
const DB_NAME = "presente-db", STORE = "pedidos";

function abrirDB() {
    return new Promise((res, rej) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
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

/* ---------- utilidades ---------- */
function novoId() {
    return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

function parametro(nome) {
    return new URLSearchParams(location.search).get(nome);
}

function formatarPreco(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function aplicarTema(chave) {
    const t = (THEMES[chave] || THEMES.namoro).cores, s = document.documentElement.style;
    s.setProperty("--rosa", t.rosa);
    s.setProperty("--rosa-claro", t.rosaClaro);
    s.setProperty("--rosa-pastel", t.pastel);
    s.setProperty("--vinho", t.vinho);
    s.setProperty("--vinho-escuro", t.escuro);
    s.setProperty("--texto", t.texto);

    /* Marca o body para o CSS do tema Netflix */
    document.body.classList.toggle("tema-netflix", chave === "netflix");
}

function tempoJuntos(inicioISO) {
    const ini = new Date(inicioISO + "T00:00:00"), agora = new Date();
    let meses = (agora.getFullYear() - ini.getFullYear()) * 12 + (agora.getMonth() - ini.getMonth());
    if (agora.getDate() < ini.getDate()) meses--;
    meses = Math.max(0, meses);
    const ms = Math.max(0, agora - ini);
    return {
        anos: Math.floor(meses / 12),
        meses,
        dias: Math.floor(ms / 864e5),
        horas: Math.floor(ms / 36e5)
    };
}

function textoDuracao(t) {
    const a = Math.floor(t.meses / 12), m = t.meses % 12, p = [];
    if (a) p.push(a + (a === 1 ? " ano" : " anos"));
    if (m) p.push(m + (m === 1 ? " mês" : " meses"));
    return p.length ? p.join(" e ") : t.dias + (t.dias === 1 ? " dia" : " dias");
}