/* File-based DB atômico — leitura em memória, escrita atômica via tmp+rename. */
const fs = require("fs/promises");
const path = require("path");
const config = require("../config");

class JsonStore {
  constructor(name) {
    this.path = path.join(config.DATA_DIR, name + ".json");
    this.data = null;
    this._writeQueue = Promise.resolve();
  }
  async load() {
    try {
      const raw = await fs.readFile(this.path, "utf8");
      this.data = JSON.parse(raw);
      if (!Array.isArray(this.data)) this.data = [];
    } catch (e) {
      if (e.code === "ENOENT") this.data = [];
      else throw new Error(`Falha ao carregar ${this.path}: ${e.message}`);
    }
  }
  async save() {
    // Serializa as gravações para evitar corrida
    this._writeQueue = this._writeQueue.then(async () => {
      const tmp = this.path + ".tmp";
      await fs.mkdir(path.dirname(this.path), { recursive: true });
      await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
      await fs.rename(tmp, this.path);
    });
    return this._writeQueue;
  }
  all()      { return this.data; }
  find(fn)   { return this.data.find(fn); }
  filter(fn) { return this.data.filter(fn); }
  async insert(item) { this.data.push(item); await this.save(); return item; }
  async update(id, patch) {
    const i = this.data.findIndex(x => x.id === id);
    if (i < 0) return null;
    this.data[i] = { ...this.data[i], ...patch, updated_at: Date.now() };
    await this.save();
    return this.data[i];
  }
  async remove(id) {
    const i = this.data.findIndex(x => x.id === id);
    if (i < 0) return false;
    this.data.splice(i, 1);
    await this.save();
    return true;
  }
}

const stores = {
  users:     new JsonStore("users"),
  sessions:  new JsonStore("sessions"),
  purchases: new JsonStore("purchases"),
  tickets:   new JsonStore("tickets"),
  refunds:   new JsonStore("refunds"),
  config:    new JsonStore("config"),     // array com 1 item de config
};

async function initAll() {
  await fs.mkdir(config.DATA_DIR, { recursive: true });
  for (const s of Object.values(stores)) await s.load();
}

module.exports = { stores, initAll };