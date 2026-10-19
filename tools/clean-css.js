/**
 * tools/clean-css.js
 *
 * Remove dos CSS de cada pagina os blocos centralizados em
 * css/base.css (reset, navbar, botao .b, scroll-progress e
 * animacoes compartilhadas).
 *
 * As diferencas entre paginas (alturas, tamanhos, cores) sao
 * preservadas via variaveis CSS definidas em cada pagina.
 *
 * Uso: node tools/clean-css.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Remove blocos de seletor (simples ou multi-seletor). */
function removeBlocks(css, selectors) {
  let out = css;
  for (const sel of selectors) {
    const e = esc(sel);
    out = out.replace(new RegExp("(?:^|\\n)[ \\t]*" + e + "\\s*\\{[^}]*\\}", "g"), "\n");
    out = out.replace(new RegExp("(?:^|\\n)[ \\t]*" + e + "\\s*,[^\\{]*\\{[^}]*\\}", "g"), "\n");
  }
  return out;
}

/** Remove @keyframes pelo nome. */
function removeKeyframes(css, names) {
  let out = css;
  for (const name of names) {
    out = out.replace(
      new RegExp("(?:^|\\n)[ \\t]*@keyframes\\s+" + esc(name) + "\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}", "g"),
      "\n"
    );
  }
  return out;
}

const tidy = (css) =>
  css
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^\n+/, "")
    .replace(/\s+$/, "\n");

const NAV = [
  ".nav",
  ".nav.scrolled",
  ".nav .wrap",
  ".nav.scrolled .wrap",
  ".logo",
  ".logo::before",
  ".nav-links",
  ".nav-links a:not(.b)",
  ".nav-links a:not(.b):hover",
  ".nav-links .b",
];

const BTN = [
  ".b",
  ".b:hover",
  ".b.ouro",
  ".b.ouro:hover",
  ".b.peq",
  ".b .seta",
  ".b:hover .seta",
];

const JOBS = {
  "css/home.css": {
    selectors: [...NAV, ...BTN, ".b::before", ".b:hover::before", ".b .ripple", ".scroll-progress"],
    keyframes: ["navIn", "heartPulse", "goldShift", "rippleAnim"],
  },
  "css/criar.css": {
    selectors: [...NAV, ...BTN, ".scroll-progress"],
    keyframes: ["navIn", "heartPulse", "goldShift", "pageIn"],
  },
  "css/pagamento.css": {
    selectors: [...NAV, ...BTN, ".scroll-progress"],
    keyframes: ["navIn", "heartPulse", "goldShift", "pageIn"],
  },
  "css/resultado.css": {
    selectors: [...NAV, ...BTN, ".scroll-progress"],
    keyframes: ["navIn", "heartPulse", "goldShift", "pageIn"],
  },
};

for (const [file, job] of Object.entries(JOBS)) {
  const full = path.join(ROOT, file);
  let css = fs.readFileSync(full, "utf8");
  const before = css.length;

  css = removeBlocks(css, job.selectors);
  css = removeKeyframes(css, job.keyframes);
  css = tidy(css);

  fs.writeFileSync(full, css, "utf8");
  console.log(
    `${file}: ${before} -> ${css.length} bytes (-${(
      (1 - css.length / before) *
      100
    ).toFixed(1)}%)`
  );
}
