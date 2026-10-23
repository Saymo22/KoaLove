/* Inicializa config + admin + dados de exemplo. Idempotente. */
const { initAll, stores } = require("./lib/db");
const security = require("./lib/security");
const config = require("./config");

const THEMES = {
  namoro: { nome: "Namoro", emoji: "❤️", categoria: "classico", layout: "padrao",
    pequeno: "Uma história que continua...", sufixo: "de amor, risadas e momentos inesquecíveis.",
    amo: "O que eu amo em você",
    cores: { rosa: "#d96c8a", rosaClaro: "#f8dce5", pastel: "#fff1f5", vinho: "#7d3048", escuro: "#4d1e2d", texto: "#4b3740" } },
  casamento: { nome: "Casamento", emoji: "💍", categoria: "classico", layout: "padrao",
    pequeno: "Para sempre juntos...", sufixo: "de união, cumplicidade e amor.",
    amo: "O que eu amo em você",
    cores: { rosa: "#b8903f", rosaClaro: "#f1e4c3", pastel: "#fffaf0", vinho: "#5c4519", escuro: "#3a2c0f", texto: "#4a3f2a" } },
  amizade: { nome: "Amizade", emoji: "🤝", categoria: "classico", layout: "padrao",
    pequeno: "Amizade de verdade...", sufixo: "de parceria, histórias e boas risadas.",
    amo: "O que eu admiro em você",
    cores: { rosa: "#e08a3c", rosaClaro: "#fbe3c9", pastel: "#fff6ec", vinho: "#8a4a12", escuro: "#5a2f0a", texto: "#4d3b2c" } },
  familia: { nome: "Família", emoji: "🏡", categoria: "classico", layout: "padrao",
    pequeno: "Laços que não se desfazem...", sufixo: "de carinho, cuidado e memórias em família.",
    amo: "O que eu amo em você",
    cores: { rosa: "#4f9d7a", rosaClaro: "#d4eddf", pastel: "#f1faf5", vinho: "#1f5a41", escuro: "#12382a", texto: "#2f4a3e" } },
  aniversario: { nome: "Aniversário", emoji: "🎂", categoria: "classico", layout: "padrao",
    pequeno: "Hoje é o seu dia...", sufixo: "de histórias para celebrar.",
    amo: "O que eu admiro em você",
    cores: { rosa: "#7a6ad8", rosaClaro: "#e0dbfa", pastel: "#f6f4ff", vinho: "#3f3391", escuro: "#271f61", texto: "#3d3a57" } },
  "carta-antiga": { nome: "Carta Antiga", emoji: "✉️", categoria: "classico", layout: "carta-antiga",
    pequeno: "Uma carta guardada no tempo...", sufixo: "de palavras escritas com o coração.",
    amo: "O que guardei de você",
    cores: { rosa: "#b8860b", rosaClaro: "#e8d5a3", pastel: "#f5e6c8", vinho: "#4a3820", escuro: "#2d1f0f", texto: "#3a2f1a" } },
  scrapbook: { nome: "Scrapbook", emoji: "🎨", categoria: "classico", layout: "scrapbook",
    pequeno: "Recortes da nossa vida...", sufixo: "de memórias coladas com carinho.",
    amo: "Meus recortes favoritos",
    cores: { rosa: "#ff8fa3", rosaClaro: "#ffc2ce", pastel: "#fdf0e3", vinho: "#8b3a4a", escuro: "#5a2530", texto: "#4d3b2c" } },
  jardim: { nome: "Jardim Secreto", emoji: "🌿", categoria: "classico", layout: "jardim",
    pequeno: "Floresceu em meu coração...", sufixo: "de folhas, flores e amor.",
    amo: "Flores do meu jardim",
    cores: { rosa: "#c9a86a", rosaClaro: "#e8d5b0", pastel: "#f5f1e8", vinho: "#2d4a2d", escuro: "#1a2e1a", texto: "#3a4a3a" } },
  cinema: { nome: "Cinema Clássico", emoji: "🎬", categoria: "especial", layout: "cinema",
    pequeno: "Uma história digna de Oscar...", sufixo: "na tela da minha vida.",
    amo: "As cenas favoritas",
    cores: { rosa: "#d4af37", rosaClaro: "#f4e4c1", pastel: "#1a1a1a", vinho: "#f4e4c1", escuro: "#000000", texto: "#f4e4c1" } },
  retro: { nome: "Retrô Anos 80", emoji: "📼", categoria: "especial", layout: "retro",
    pequeno: "Rewind para o nosso amor...", sufixo: "de sintetizadores e neon.",
    amo: "Faixas do nosso mixtape",
    cores: { rosa: "#ff006e", rosaClaro: "#ff6ba5", pastel: "#0a0a1a", vinho: "#00d9ff", escuro: "#000000", texto: "#e0e0ff" } },
  netflix: { nome: "Netflix", emoji: "🎬", categoria: "especial", layout: "netflix",
    pequeno: "Uma série original", sufixo: "a temporada mais bonita da minha vida.",
    amo: "Destaques da temporada",
    cores: { rosa: "#e50914", rosaClaro: "#2a2a2a", pastel: "#0b0b0b", vinho: "#ffffff", escuro: "#000000", texto: "#e5e5e5" } },
  spotify: { nome: "Spotify", emoji: "🎧", categoria: "especial", layout: "spotify",
    pequeno: "Sua playlist", sufixo: "as músicas que contam a nossa história.",
    amo: "Faixas favoritas",
    cores: { rosa: "#1DB954", rosaClaro: "#191414", pastel: "#121212", vinho: "#ffffff", escuro: "#000000", texto: "#e5e5e5" } },
  vinil: { nome: "Vinil", emoji: "🎵", categoria: "especial", layout: "vinil",
    pequeno: "Edição de colecionador", sufixo: "o disco que toca no meu coração.",
    amo: "Faixas favoritas",
    cores: { rosa: "#d4a24e", rosaClaro: "#2d1810", pastel: "#1a0f08", vinho: "#f4ead5", escuro: "#0d0603", texto: "#e8dcc4" } },
};

async function seed() {
  if(config.CLOUD)throw new Error('O seed de demonstração é somente local. Na Vercel, configure os serviços e ADMIN_EMAIL/ADMIN_PASS; a inicialização é automática.');
  await initAll();

  // 1) Config (preço + temas + cupons)
  if (stores.config.all().length === 0) {
    await stores.config.insert({
      id: "config",
      price_cents: 1990,
      currency: "BRL",
      coupons: {
        BEMVINDO10: { discount_percent: 10 },
        AMOR10:     { discount_percent: 10 },
        NAMORO15:   { discount_percent: 15 },
        ETERNO20:   { discount_percent: 20 },
      },
      themes: THEMES,
      refund_policy_days: 7,
    });
    console.log("✅ Config criada.");
  }

  // 2) Admin
  const adminEmailHash = security.emailHash(config.ADMIN_EMAIL);
  if (!stores.users.find(u => u.email_hash === adminEmailHash)) {
    await stores.users.insert({
      id: security.randomId("u"),
      email: config.ADMIN_EMAIL,
      email_hash: adminEmailHash,
      name: "Administrador",
      password_hash: security.hashPassword(config.ADMIN_PASS),
      role: "admin",
      created_at: Date.now(),
    });
    console.log(`✅ Admin criado: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASS}`);
  } else {
    console.log("ℹ️  Admin já existe.");
  }

  // 3) Dados de exemplo (só se não houver users comuns)
  const hasClients = stores.users.find(u => u.role === "user");
  if (!hasClients) {
    const cliente1 = {
      id: security.randomId("u"),
      email: "marina@exemplo.com",
      email_hash: security.emailHash("marina@exemplo.com"),
      name: "Marina Silva",
      password_hash: security.hashPassword("senha123"),
      role: "user",
      created_at: Date.now() - 86400_000 * 10,
    };
    const cliente2 = {
      id: security.randomId("u"),
      email: "joao@exemplo.com",
      email_hash: security.emailHash("joao@exemplo.com"),
      name: "João Pereira",
      password_hash: security.hashPassword("senha123"),
      role: "user",
      created_at: Date.now() - 86400_000 * 3,
    };
    await stores.users.insert(cliente1);
    await stores.users.insert(cliente2);

    // Compras
    const p1 = {
      id: security.randomId("p"), user_id: cliente1.id,
      tema: "namoro", titulo: "Nós dois", para: "Rafael", de: "Marina",
      inicio: "2022-08-13", carta: "Te amo.",
      status: "paid", price_cents: 1990, coupon: null, discount_percent: 0,
      amount_paid_cents: 1990, payment_method: "pix",
      created_at: Date.now() - 86400_000 * 9, paid_at: Date.now() - 86400_000 * 9,
      deleted: false, has_media: true, preview_data_url: null,
    };
    const p2 = {
      id: security.randomId("p"), user_id: cliente2.id,
      tema: "netflix", titulo: "Nosso seriado", para: "Ana", de: "João",
      inicio: "2020-01-01", carta: "Nossa história merece uma série.",
      status: "paid", price_cents: 1990, coupon: "AMOR10", discount_percent: 10,
      amount_paid_cents: 1791, payment_method: "card",
      created_at: Date.now() - 86400_000 * 2, paid_at: Date.now() - 86400_000 * 2,
      deleted: false, has_media: true, preview_data_url: null,
    };
    const p3 = {
      id: security.randomId("p"), user_id: cliente1.id,
      tema: "jardim", titulo: "Nosso jardim", para: "Mãe", de: "Marina",
      inicio: "2000-05-01", carta: "Obrigada por tudo.",
      status: "pending", price_cents: 1990, coupon: null, discount_percent: 0,
      amount_paid_cents: null, payment_method: null,
      created_at: Date.now() - 86400_000 * 1, paid_at: null,
      deleted: false, has_media: false, preview_data_url: null,
    };
    await stores.purchases.insert(p1);
    await stores.purchases.insert(p2);
    await stores.purchases.insert(p3);

    // Ticket
    await stores.tickets.insert({
      id: security.randomId("t"),
      user_id: cliente1.id,
      subject: "A música não toca no iPhone",
      status: "open",
      created_at: Date.now() - 3600_000,
      updated_at: Date.now() - 3600_000,
      messages: [{ role: "user", text: "Quando abro o presente no iPhone, a música não inicia.", at: Date.now() - 3600_000 }],
    });

    // Reembolso
    await stores.refunds.insert({
      id: security.randomId("r"),
      purchase_id: p2.id,
      user_id: cliente2.id,
      reason: "O link não abre no meu dispositivo.",
      status: "pending",
      created_at: Date.now() - 7200_000,
      reviewed_at: null,
      review_note: null,
    });

    console.log("✅ Dados de exemplo criados (clientes, compras, ticket, reembolso).");
    console.log("   Login cliente:  marina@exemplo.com / senha123");
    console.log("   Login cliente:  joao@exemplo.com / senha123");
  }

  console.log("\n🎉 Seed concluído.\n");
}

seed().catch(e => { console.error(e); process.exit(1); });
