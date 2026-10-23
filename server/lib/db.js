/* Transações isoladas: memória muda somente depois de tmp + rename. */
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
let writeQueue = Promise.resolve();
const journalPath = path.join(config.DATA_DIR, 'transaction-journal.json');
let pendingJournal = null;
function serialize(operation) {
  const result = writeQueue.then(operation);
  writeQueue = result.catch(() => {});
  return result;
}
async function writeSnapshot(target, data) {
  const tmp = target + '.tmp';
  await fs.mkdir(path.dirname(target), {recursive:true});
  try {
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.copyFile(target, target + '.bak').catch(err => {if(err.code !== 'ENOENT') throw err;});
    await fs.rename(tmp, target);
  } catch(err) {await fs.unlink(tmp).catch(() => {});throw err;}
}
async function finishJournal() {
  if (!pendingJournal) return;
  for (const [name, rows] of Object.entries(pendingJournal)) await writeSnapshot(stores[name].path, rows);
  await fs.unlink(journalPath);
  pendingJournal = null;
}
// O journal durável é o commit dos registros relacionados. Antes de novas
// gravações e na inicialização, conclui qualquer aplicação interrompida.
function transactionAcross(names, change) {
  return serialize(async () => {
    await finishJournal();
    const next = {};
    for(const name of names) {
      if(!stores[name] || !Array.isArray(stores[name].data)) throw new Error('Banco não inicializado.');
      next[name] = stores[name].all();
    }
    const result = change(next);
    if(result && typeof result.then === 'function') throw new Error('A alteração da transação deve ser síncrona.');
    const tmp = journalPath + '.tmp';
    await fs.mkdir(config.DATA_DIR, {recursive:true});
    try {
      await fs.writeFile(tmp, JSON.stringify(next), 'utf8');
      await fs.rename(tmp, journalPath);
    } catch(err) {await fs.unlink(tmp).catch(() => {});throw err;}
    pendingJournal = next;
    for(const name of names) stores[name].data = structuredClone(next[name]);
    await finishJournal();
    return structuredClone(result);
  });
}
class JsonStore {
  constructor(name) {
    this.path = path.join(config.DATA_DIR, name + '.json');
    this.data = null;
    this._writeQueue = Promise.resolve();
  }
  async load() {
    try {
      const data = JSON.parse(await fs.readFile(this.path, 'utf8'));
      if (!Array.isArray(data)) throw new Error('O banco deve conter uma lista.');
      this.data = data;
    } catch (err) { if (err.code === 'ENOENT') this.data = []; else throw err; }
  }
  transaction(change) {
    const operation = serialize(async () => {
      await finishJournal();
      if (!Array.isArray(this.data)) throw new Error('Banco não inicializado: chame load() antes de gravar.');
      const next = structuredClone(this.data);
      const result = change(next);
      if (result && typeof result.then === 'function') throw new Error('A alteração da transação deve ser síncrona.');
      const tmp = this.path + '.tmp';
      await fs.mkdir(path.dirname(this.path), { recursive: true });
      try {
        await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
        // Guarda a versão anterior para recuperação de gravações acidentais.
        await fs.copyFile(this.path, this.path + '.bak').catch(err => { if (err.code !== 'ENOENT') throw err; });
        await fs.rename(tmp, this.path);
      } catch (err) { await fs.unlink(tmp).catch(() => {}); throw err; }
      this.data = next;
      return structuredClone(result);
    });
    this._writeQueue = operation.catch(() => {});
    return operation;
  }
  save() { return this.transaction(() => undefined); }
  all() { return structuredClone(this.data); }
  find(fn) { return this.all().find(fn); }
  filter(fn) { return this.all().filter(fn); }
  insert(item) { return this.transaction(rows => { rows.push(structuredClone(item)); return item; }); }
  update(id, patch) { return this.transaction(rows => {
    const i = rows.findIndex(x => x.id === id);
    if (i < 0) return null;
    return rows[i] = { ...rows[i], ...structuredClone(patch), updated_at: Date.now() };
  }); }
  remove(id) { return this.transaction(rows => {
    const i = rows.findIndex(x => x.id === id);
    if (i < 0) return false;
    rows.splice(i, 1); return true;
  }); }
}
const stores = Object.fromEntries(['users','sessions','purchases','tickets','refunds','config'].map(name => [name,new JsonStore(name)]));
async function initAll() {
  await fs.mkdir(config.DATA_DIR, { recursive: true });
  try {
    await fs.access(path.join(config.DATA_DIR, 'RECOVERY_REQUIRED.txt'));
    throw new Error('O banco de compras precisa ser recuperado. Leia server/data/RECOVERY_REQUIRED.txt antes de iniciar.');
  } catch (err) { if (err.code !== 'ENOENT') throw err; }
  try {
    const journal = JSON.parse(await fs.readFile(journalPath,'utf8'));
    if (!journal || !Object.keys(journal).length || Object.entries(journal).some(([name,rows]) => !stores[name] || !Array.isArray(rows))) throw new Error('Journal de transação inválido.');
    pendingJournal = journal;
    await finishJournal();
  } catch(err) {if(err.code !== 'ENOENT') throw err;}
  for (const store of Object.values(stores)) await store.load();
}
module.exports = { JsonStore, stores, initAll, transactionAcross };
