/* GET /api/config — tudo de negócio que o frontend precisa.
   Nada de preço/tema/cupom hardcoded no front. */
const { stores } = require("../lib/db");
const http = require("../lib/http");

async function get(req, res) {
  const entry = stores.config.all()[0];
  if (!entry) return http.fail(res, 500, "CONFIG_MISSING", "Configuração não inicializada. Rode `node seed.js`.");
  http.ok(res, {...entry,media_upload:require('../config').CLOUD?'blob':'local'});
}

module.exports = { get };
