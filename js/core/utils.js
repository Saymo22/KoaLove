/* =====================================================
   FUNÇÕES UTILITÁRIAS
   ===================================================== */

window.NA = window.NA || {};

NA.utils = (function () {
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
  return { novoId, parametro, formatarPreco, aplicarTema, temaEscuro, tempoJuntos, textoDuracao };
})();
