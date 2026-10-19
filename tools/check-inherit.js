const fs = require("fs");
const D = "C:/Users/Saymo/Documents/GitHub/ProjetoNA/";

function block(file, sel) {
  const L = fs.readFileSync(D + file, "utf8").split("\n");
  for (let i = 0; i < L.length; i++) {
    const t = L[i].trim();
    if (t.startsWith(sel + " {") || t === sel + "{" || t.startsWith(sel + ",") || t.startsWith(sel + "{")) {
      let depth = 0, buf = [];
      for (let j = i; j < L.length; j++) {
        buf.push(L[j].trim());
        depth += (L[j].match(/{/g) || []).length - (L[j].match(/}/g) || []).length;
        if (depth === 0 && j > i) break;
      }
      console.log(file + ":" + (i + 1) + "  " + buf.join(" ").replace(/\s+/g, " ").slice(0, 300));
      return;
    }
  }
  console.log(file + "  !! MISSING " + sel);
}

console.log("--- netflix .mp-footer ---");
block("css/netflix.css", ".mp-footer");
console.log("--- home .cta-final ---");
block("css/home.css", ".cta-final");
console.log("--- home .rodape ---");
block("css/home.css", ".rodape");
console.log("--- criar .pv-footer ---");
block("css/criar.css", ".pv-footer");
console.log("--- style.css footer block ---");
block("style.css", "footer");
console.log("--- style.css section block ---");
block("style.css", "section");
console.log("--- style.css .card block ---");
block("style.css", ".card");
console.log("--- home.html section usage: which have own position/z-index? ---");
for (const f of ["home.html", "criar.html", "netflix.html"]) {
  const s = fs.readFileSync(D + f, "utf8");
  const secs = [...s.matchAll(/<section class="([^"]+)"/g)].map((m) => m[1]);
  const css = fs.readFileSync(D + "css/" + f.replace(".html", ".css"), "utf8");
  console.log("  " + f);
  for (const c of secs) {
    const own = css.includes("." + c.split(" ")[0] + " {") || css.includes("." + c.split(" ")[0] + ",");
    console.log("     " + c.padEnd(28) + " own rule: " + own);
  }
}
