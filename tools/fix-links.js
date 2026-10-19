/**
 * tools/fix-links.js
 *
 * Normaliza os <link> de estilosheet de cada pagina:
 *   - remove style.css
 *   - garante base.css, tema-padrao.css e o CSS proprio da pagina
 *   - preserva id="cssPadrao" (usado por ver.js para trocar de tema)
 *
 * Uso: node tools/fix-links.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/**
 * ordem de carregamento por pagina:
 *  - base:      tokens, reset e componentes do shell
 *  - tema-padrao: layout da historia (index e ver)
 *  - proprio:   CSS especifico da pagina
 */
const PLAN = {
  "index.html": ["css/base.css", "css/tema-padrao.css"],
  "home.html": ["css/base.css", "css/home.css"],
  "criar.html": ["css/base.css", "css/criar.css"],
  "ver.html": ["css/base.css", "css/tema-padrao.css", "css/ver.css"],
  "netflix.html": ["css/base.css", "css/netflix.css"],
  "pagamento.html": ["css/base.css", "css/pagamento.html.css"],
  "resultado.html": ["css/base.css", "css/resultado.html.css"],
};

/** o id cssPadrao precisa estar no tema padrao (removido em runtime) */
const PADRAO_ID = { "ver.html": "css/tema-padrao.css" };

for (const [file, wanted] of Object.entries(PLAN)) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, "utf8");

  // 1) remove todos os <link rel="stylesheet"> de arquivos locais do projeto
  html = html.replace(
    /^[ \t]*<link rel="stylesheet" href="(?:style\.css|css\/[a-z0-9-]+\.css)"[^>]*>\r?\n?/gm,
    ""
  );

  // 2) monta a lista nova, com o id cssPadrao onde necessario
  const links = wanted.map((href) => {
    const id = PADRAO_ID[file] === href ? ' id="cssPadrao"' : "";
    return `    <link rel="stylesheet" href="${href}"${id}>`;
  });

  // 3) insere antes do primeiro <script> ou </head>
  const anchor = html.search(/^[ \t]*<script\b/m);
  const insertAt = anchor >= 0 ? anchor : html.indexOf("</head>");
  html = html.slice(0, insertAt) + links.join("\n") + "\n\n" + html.slice(insertAt);

  fs.writeFileSync(full, html, "utf8");
  console.log(file + ": " + wanted.join(" + "));
}
