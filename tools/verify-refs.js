/**
 * tools/verify-refs.js
 *
 * Verifica a integridade das referencias entre HTML, CSS e JS do projeto.
 * Uso: node tools/verify-refs.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const HTML_FILES = [
  "index.html",
  "home.html",
  "criar.html",
  "ver.html",
  "netflix.html",
  "pagamento.html",
  "resultado.html",
];

const problems = [];
const notes = [];

/* ------------------------------------------------------------------ *
 * 1. Links e scripts referenciados pelos HTML existem no disco?
 * ------------------------------------------------------------------ */
for (const file of HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");

  const refs = [
    ...[...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
  ];

  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:")) continue;
    const target = path.join(ROOT, ref.split("?")[0]);
    if (!fs.existsSync(target)) {
      problems.push(`${file}: arquivo referenciado nao existe -> ${ref}`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. O indice de scripts esta na ordem correta (core -> pages)?
 * ------------------------------------------------------------------ */
for (const file of HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);

  const coreIdx = scripts.findIndex((s) => s.startsWith("js/core/"));
  const pageIdx = scripts.findIndex((s) => s.startsWith("js/pages/"));

  if (coreIdx !== -1 && pageIdx !== -1 && coreIdx > pageIdx) {
    problems.push(`${file}: js/core/ precisa carregar antes de js/pages/`);
  }
}

/* ------------------------------------------------------------------ *
 * 3. Arquivos orfaos (nao referenciados por nenhum HTML)
 * ------------------------------------------------------------------ */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const allFiles = walk(ROOT)
  .filter((f) => /\.(html|css|js)$/.test(f))
  .map((f) => path.relative(ROOT, f).split(path.sep).join("/"));

const referenced = new Set();
for (const file of HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"|<script[^>]+src="([^"]+)"/g)) {
    const ref = m[1] || m[2];
    if (ref && !/^(https?:)?\/\//.test(ref)) referenced.add(ref.split("?")[0]);
  }
}

for (const file of allFiles) {
  if (file.endsWith(".html")) continue;
  if (file.startsWith("tools/")) continue;
  if (!referenced.has(file)) {
    notes.push(`nao referenciado por nenhum HTML: ${file}`);
  }
}

/* ------------------------------------------------------------------ *
 * 4. Variaveis CSS usadas mas nunca definidas
 * ------------------------------------------------------------------ */
const cssFiles = allFiles.filter((f) => f.endsWith(".css"));
const definedVars = new Set();
for (const file of cssFiles) {
  const css = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) definedVars.add(m[1]);
}
// Tokens definidos via JS (aplicarTema)
for (const name of ["rosa", "rosa-claro", "rosa-pastel", "vinho", "vinho-escuro", "texto"]) {
  definedVars.add(`--${name}`);
}

for (const file of cssFiles) {
  const css = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    if (!definedVars.has(m[1])) {
      problems.push(`${file}: variavel usada e nunca definida -> ${m[1]}`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Resultado
 * ------------------------------------------------------------------ */
if (notes.length) {
  console.log("AVISOS:");
  notes.forEach((n) => console.log("  - " + n));
  console.log("");
}

if (problems.length) {
  console.log("PROBLEMAS:");
  problems.forEach((p) => console.log("  - " + p));
  process.exitCode = 1;
} else {
  console.log("OK: nenhuma referencia quebrada.");
}
