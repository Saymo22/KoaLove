/* =====================================================
   PERSISTÊNCIA (IndexedDB)
   ===================================================== */

window.NA = window.NA || {};

NA.db = (function () {
  const DB_NAME = "presente-db";
  const STORE = "pedidos";

  function abrirDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }

  async function salvarPedido(pedido) {
    const db = await abrirDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(pedido);
      tx.oncomplete = () => res(pedido);
      tx.onerror = () => rej(tx.error);
    });
  }

  async function buscarPedido(id) {
    const db = await abrirDB();
    return new Promise((res, rej) => {
      const req = db.transaction(STORE).objectStore(STORE).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  }

  async function listarTodosPedidos() {
    const db = await abrirDB();
    return new Promise((res, rej) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }

  async function excluirPedidoDB(id) {
    const db = await abrirDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  return { abrirDB, salvarPedido, buscarPedido, listarTodosPedidos, excluirPedidoDB };
})();

/* Expor globais para compatibilidade com minha-conta.js */
window.abrirDB = NA.db.abrirDB;
window.salvarPedido = NA.db.salvarPedido;
window.buscarPedido = NA.db.buscarPedido;
window.listarTodosPedidos = NA.db.listarTodosPedidos;
window.excluirPedidoDB = NA.db.excluirPedidoDB;