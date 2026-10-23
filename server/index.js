/* Servidor de testes — API + arquivos estáticos na mesma origem. */
const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const config = require("./config");
const { initAll } = require("./lib/db");
const rateLimit = require("./lib/ratelimit");
const httpLib = require("./lib/http");
const apiRouter = require("./routes");

function log(req, status) {
  const ip = httpLib.clientIp(req);
  console.log(`[${new Date().toISOString()}] ${ip} ${req.method} ${req.url} → ${status}`);
}

async function serveStatic(req, res, pathname) {
  // Normaliza e evita path traversal
  let rel = decodeURIComponent(pathname);
  if (rel === "/") rel = "/home.html";
  rel = path.normalize(rel).replace(/^([\\/]?\.\.)+/, "");
  const abs = path.join(config.FRONTEND_ROOT, rel);

  // Bloqueia acesso ao diretório do servidor.
  // Comparação em minúsculas: no Windows o filesystem é case-insensitive,
  // então "/Server/data/users.json" também precisava ser bloqueado.
  const raizLower = config.FRONTEND_ROOT.toLowerCase();
  const serverLower = path.join(config.FRONTEND_ROOT, "server").toLowerCase();
  const absLower = abs.toLowerCase();
  if (absLower === serverLower || absLower.startsWith(serverLower + path.sep)) {
    httpLib.fail(res, 403, "FORBIDDEN", "Acesso negado.");
    return;
  }
  if (!(absLower === raizLower || absLower.startsWith(raizLower + path.sep))) {
    httpLib.fail(res, 403, "FORBIDDEN", "Acesso negado.");
    return;
  }

  const ext = path.extname(abs).toLowerCase();
  if (!config.STATIC_EXTS.has(ext)) {
    httpLib.fail(res, 404, "NOT_FOUND", "Arquivo não encontrado.");
    return;
  }

  try {
    const data = await fs.readFile(abs);
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css":  "text/css; charset=utf-8",
      ".js":   "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg":  "image/svg+xml",
      ".png":  "image/png",
      ".jpg":  "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif":  "image/gif",
      ".ico":  "image/x-icon",
      ".woff": "font/woff",
      ".woff2":"font/woff2",
      ".ttf":  "font/ttf",
      ".mp3":  "audio/mpeg",
      ".wav":  "audio/wav",
      ".ogg":  "audio/ogg",
      ".m4a":  "audio/mp4",
      ".mp4":  "video/mp4",
      ".webm": "video/webm",
      ".mov":  "video/quicktime",
    };
    res.statusCode = 200;
    httpLib.applySecurityHeaders(res);
    // O bolo interativo solicita microfone apenas quando o visitante toca no botão.
    // Permite o recurso na mesma origem e nas duas páginas que incorporam o tema.
    if (["/teste/aniversario.html", "/criar.html", "/ver.html"].includes(pathname)) {
      res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
    }
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
    res.end(data);
    log(req, 200);
  } catch (e) {
    if (e.code === "ENOENT") {
      httpLib.fail(res, 404, "NOT_FOUND", "Arquivo não encontrado.");
      log(req, 404);
    } else {
      console.error("[static]", e);
      httpLib.fail(res, 500, "INTERNAL_ERROR", "Erro ao servir arquivo.");
      log(req, 500);
    }
  }
}

async function main() {
  await initAll();

  const server = http.createServer(async (req, res) => {
    try {
    const url = new URL(req.url, "http://x");
    decodeURIComponent(url.pathname);
    const pathname = url.pathname;

    // API, mídia e arquivos públicos têm orçamentos separados.
    const rl = rateLimit.check(req);
    for (const [k, v] of Object.entries(rl.headers)) res.setHeader(k, v);
    if (!rl.allowed) {
      log(req, 429);
      httpLib.fail(res, 429, "RATE_LIMITED",
        `Muitas requisições. Tente novamente em ${rl.headers["Retry-After"]}s.`,
        { retry_after_seconds: Number(rl.headers["Retry-After"]) },
        rl.headers);
      return;
    }

    if (pathname.startsWith("/api/")) {
      const wrappedRes = res;
      const origEnd = wrappedRes.end.bind(wrappedRes);
      wrappedRes.end = (...args) => {
        log(req, wrappedRes.statusCode);
        return origEnd(...args);
      };
      try {
        await apiRouter.handle(req, res);
      } catch (e) {
        console.error("[fatal]", e);
        if (!res.headersSent) httpLib.fail(res, 500, "INTERNAL_ERROR", "Erro fatal.");
      }
      return;
    }

    await serveStatic(req, res, pathname);
    } catch (err) {
      const invalid = err instanceof URIError || err.code === "ERR_INVALID_URL";
      if (!res.headersSent) httpLib.fail(res, invalid ? 400 : 500, invalid ? "INVALID_URL" : "INTERNAL_ERROR", invalid ? "Endereço inválido." : "Erro interno do servidor.");
      else res.destroy();
      if (!invalid) console.error("[request]", err);
    }
  });

  server.listen(config.PORT, config.HOST, () => {
    console.log("─".repeat(60));
    console.log(`✅ Servidor de testes rodando em http://${config.HOST}:${config.PORT}`);
    console.log(`   Frontend:   http://${config.HOST}:${config.PORT}/home.html`);
    console.log(`   Admin:      http://${config.HOST}:${config.PORT}/admin/login.html`);
    console.log(`   API:        http://${config.HOST}:${config.PORT}/api/config`);
    console.log("─".repeat(60));
    console.log(`⚠️  Admin padrão: ${config.ADMIN_EMAIL} / ${config.ADMIN_PASS}`);
    console.log("   (Sobrescreva via env vars ADMIN_EMAIL e ADMIN_PASS)");
    console.log("─".repeat(60));
  });
}

main().catch(e => { console.error("Falha ao iniciar:", e); process.exit(1); });
