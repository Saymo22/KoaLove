/**
 * tools/clean-css.js
 *
 * Remove dos CSS de cada pagina os blocos que foram centralizados
 * em css/base.css (reset, navbar, botoes .b, scroll-progress e
 * animacoes compartilhadas).
 *
 * Uso: node tools/clean-css.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** Remove um bloco de selecao (e as regras imediatamente
 *  dependentes indicadas) de um arquivo CSS. */
function removeBlocks(css, selectors) {
  let out = css;
  for (const sel of selectors) {
    // regra simples: sel { ... }
    const re = new RegExp(
      "(?:^|\\n)[ \\t]*" + sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{[^}]*\\}",
      "g"
    );
    out = out.replace(re, "\n");
    // regra com varias seletores: sel, outro { ... }
    const reMulti = new RegExp(
      "(?:^|\\n)[ \\t]*" + sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*,[^\\{]*\\{[^}]*\\}",
      "g"
    );
    out = out.replace(reMulti, "\n");
  }
  return out;
}

/** Removekeyframes pelo nome. */
function removeKeyframes(css, names) {
  let out = css;
  for (const name of names) {
    const re = new RegExp(
      "(?:^|\\n)[ \\t]*@keyframes\\s+" + name + "\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}",
      "g"
    );
    out = out.replace(re, "\n");
  }
  return out;
}

function tidy(css) {
  return css
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^\n+/, "")
    .replace(/\s+$/, "\n");
}

const JOBS = {
  "css/home.css": {
    selectors: [
      "\\.nav",
      "\\.nav\\.scrolled",
      "\\.nav \\.wrap",
      "\\.nav\\.scrolled \\.wrap",
      "\\.logo",
      "\\.logo::before",
      "\\.nav-links",
      "\\.nav-links a:not\\(\\.b\\)",
      "\\.nav-links a:not\\(\\.b\\):hover",
      "\\.nav-links \\.b",
      "\\.b",
      "\\.b:hover",
      "\\.b\\.ouro",
      "\\.b\\.ouro:hover",
      "\\.b\\.peq",
      "\\.b \\.seta",
      "\\.b:hover \\.seta",
      "\\.b \\.ripple",
      "\\.b::before",
      "\\.b:hover::before",
      "\\.scroll-progress",
    ],
    keyframes: ["navIn", "heartPulse", "goldShift", "rippleAnim"],
  },
  "css/criar.css": {
    selectors: [
      "\\.nav",
      "\\.nav\\.scrolled",
      "\\.nav \\.wrap",
      "\\.nav\\.scrolled \\.wrap",
      "\\.logo",
      "\\.logo::before",
      "\\.nav-links",
      "\\.nav-links a:not\\(\\.b\\)",
      "\\.nav-links a:not\\(\\.b\\):hover",
      "\\.nav-links \\.b",
      "\\.b",
      "\\.b:hover",
      "\\.b\\.ouro",
      "\\.b\\.ouro:hover",
      "\\.b\\.peq",
      "\\.b \\.seta",
      "\\.b:hover \\.seta",
      "\\.scroll-progress",
    ],
    keyframes: ["navIn", "heartPulse", "goldShift", "pageIn"],
  },
  "css/pagamento.css": {
    selectors: [
      "\\.nav",
      "\\.nav\\.scrolled",
      "\\.nav \\.wrap",
      "\\.nav\\.scrolled \\.wrap",
      "\\.logo",
      "\\.logo::before",
      "\\.nav-links",
      "\\.nav-links a:not\\(\\.b\\)",
      "\\.nav-links a:not\\(\\.b\\):hover",
      "\\.nav-links \\.b",
      "\\.b",
      "\\.b:hover",
      "\\.b\\.ouro",
      "\\.b\\.ouro:hover",
      "\\.b\\.peq",
      "\\.b \\.seta",
      "\\.b:hover \\.seta",
      "\\.scroll-progress",
    ],
    keyframes: ["navIn", "heartPulse", "goldShift", "pageIn"],
  },
  "css/resultado.css": {
    selectors: [
      "\\.nav",
      "\\.nav\\.scrolled",
      "\\.nav \\.wrap",
      "\\.nav\\.scrolled \\.wrap",
      "\\.logo",
      "\\.logo::before",
      "\\.nav-links",
      "\\.nav-links a:not\\(\\.b\\)",
      "\\.nav-links a:not\\(\\.b\\):hover",
      "\\.nav-links \\.b",
      "\\.b",
      "\\.b:hover",
      "\\.b\\.ouro",
      "\\.b\\.ouro:hover",
      "\\.b\\.peq",
      "\\.b \\.seta",
      "\\.b:hover \\.seta",
      "\\.scroll-progress",
    ],
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
    `${file}: ${before} -> ${css.length} bytes (${(
      (1 - css.length / before) *
      100
    ).toFixed(1)}% reduzido)`
  );
}
