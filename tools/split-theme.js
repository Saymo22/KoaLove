/**
 * tools/split-theme.js
 *
 * Separa style.css (estado original) em dois arquivos sem perder
 * nem duplicar regras:
 *
 *   css/base.css       -> :root, reset, shell (nav/.b/scroll-progress/heart)
 *   css/tema-padrao.css -> layout da historia (hero, polaroid, contador...)
 *
 * As regras globais que ja estao em base.css NAO sao copiadas para
 * tema-padrao.css, evitando conflito de cascata.
 *
 * Uso: node tools/split-theme.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** Divide um CSS em blocos de nivel superior, preservando @media. */
function splitRules(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const bs = css.indexOf("{", i);
    if (bs < 0) break;
    const sel = css.slice(i, bs).trim();
    let depth = 0, j = bs;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (!depth) break;
      }
    }
    out.push({
      sel: sel.replace(/\s+/g, " ").trim(),
      body: css.slice(bs + 1, j),
      raw: css.slice(i, j + 1),
      isMedia: sel.trim().startsWith("@media"),
    });
    i = j + 1;
  }
  return out;
}

const src = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
const rules = splitRules(src);

/* Regras que ficam apenas em base.css (ja existem na base). */
const ONLY_BASE = new Set([
  ":root",
  "*",
  "html",
  "body",
  ".heart",
  "section",
  "footer",
  "footer .coracao",
  "footer p",
  "footer small",
  "audio",
]);

/* Separa o @media: as regras internas que forem so-base ficam na base. */
const baseMedia = [];
const storyMedia = [];

for (const r of rules) {
  if (!r.isMedia) continue;
  const inner = splitRules(r.body);
  const onlyBase = inner.length > 0 && inner.every((x) => ONLY_BASE.has(x.sel));
  if (onlyBase) baseMedia.push(r);
  else storyMedia.push(r);
}

const story = [];
for (const r of rules) {
  if (r.isMedia) {
    if (storyMedia.includes(r)) story.push(r);
    continue;
  }
  if (ONLY_BASE.has(r.sel)) continue;
  if (r.sel === "@keyframes flutuar") continue;
  story.push(r);
}

const build = (list) =>
  list
    .map((r) => r.raw.trim())
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+$/, "\n");

const header =
  "/* =====================================================\n" +
  "   TEMA PADRAO - layout da historia de amor\n" +
  "   Usado por index.html e por ver.html (layoutPadrao).\n" +
  "   ===================================================== */\n\n";

fs.writeFileSync(path.join(ROOT, "css", "tema-padrao.css"), header + build(story), "utf8");
console.log("css/tema-padrao.css: " + story.length + " blocos");
