const assert = require('node:assert/strict');
// Usa as rotas reais com armazenamento em memória; não altera o banco do usuário.
module.exports = async function testThemePersistence() {
  const { stores } = require('../server/lib/db');
  const auth = require('../server/lib/auth');
  const http = require('../server/lib/http');
  const routes = require('../server/routes/purchases');
  const originals = [stores.config.all, stores.purchases.transaction, stores.purchases.find,
    auth.requireUser, http.readJsonBody, http.created, http.ok, http.fail];
  const themeData = { amizade: { texts: { 1: 'Uma amizade especial' }, collections: {
    quiz: [{ q: 'Qual nossa lembrança?', opts: ['Viagem', 'Cinema', 'Show', 'Jantar'], correct: 2 }],
    memories: ['Nossa viagem'],
  } }, scrapbook: { checks: { 0: true }, texts: { 2: 'Um postal nosso' } } };
  let purchase, response, body;
  try {
    stores.config.all = () => [{ themes: { amizade: {},netflix:{},vinil:{},cinema:{},spotify:{},retro:{} }, price_cents: 1990 }];
    stores.purchases.transaction = async change => {const rows=[];const result=change(rows);purchase=JSON.parse(JSON.stringify(result));return result;};
    stores.purchases.find = predicate => predicate(purchase) ? purchase : null;
    auth.requireUser = () => ({ id: 'theme-test-user' });
    http.readJsonBody = async () => body;
    http.created = http.ok = (_res, result) => { response = result; };
    http.fail = (_res, status, code) => { response = { status, code }; };
    body = { tema: 'amizade', titulo: 'Nossas memórias', para: 'Bia', de: 'Ana', themeData };
    await routes.create({}, {});
    assert.deepEqual(response.purchase.themeData, themeData);
    await routes.getOne({}, {}, purchase.id);
    assert.deepEqual(response.purchase.themeData, themeData);
    for(const tema of ['netflix','vinil','cinema','spotify','retro']){
      const details={[tema]:{texts:{0:'Detalhe personalizado'},collections:{tracks:[{title:'Nossa faixa',artist:'Nós',audio:''}]}}};
      body={tema,titulo:'Nossas memórias',para:'Bia',de:'Ana',themeData:details};
      await routes.create({},{});await routes.getOne({},{},purchase.id);
      assert.deepEqual(response.purchase.themeData,details);
    }
    body = { ...body, themeData: { bad: 'x'.repeat(200001) } };
    await assert.rejects(routes.create({}, {}), { status: 400, code: 'INVALID_THEME_DATA' });
  } finally {
    [stores.config.all, stores.purchases.transaction, stores.purchases.find,
      auth.requireUser, http.readJsonBody, http.created, http.ok, http.fail] = originals;
  }
};
