/**
 * tools/apply-base.js
 *
 * Atualiza os <link> das paginas para carregar css/base.css
 * antes do stylesheet especifico.
 *
 * Uso: node tools/apply-base.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const PAGES = [
  "index.html",
  "home.html",
  "criar.html",
  "ver.html",
  "netflix.html",
  "pagamento.html",
  "resultado.html",
];

for (const file of PAGES) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, "utf8");

  // ja tem base.css?
  if (html.includes('href="css/base.css"')) {
    console.log(file + ": base.css ja presente");
    continue;
  }

  // insere base.css antes do primeiro <link rel="stylesheet"> da pagina
  const m = html.match(/([ \t]*)<link rel="stylesheet" href="css\//);
  if (!m) {
    console.log(file + ": nenhum stylesheet proprio encontrado");
    continue;
  }

  const insertAt = m.index;
  const indent = m[1];
  html =
    html.slice(0, insertAt) +
    indent + '<link rel="stylesheet" href="css/base.css">\n' +
    html.slice(insertAt);

  fs.writeFileSync(full, html, "utf8");
  console.log(file + ": base.css adicionado");
}
