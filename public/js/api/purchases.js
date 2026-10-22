/* js/api/purchases.js — endpoints de compras/presentes.
   Metadados vivem no servidor; mídia (fotos/vídeos/música) fica no IndexedDB. */
(function () {
  const { get, post } = window.ApiClient;
  window.ApiPurchases = {
    create:  (payload) => post("/purchases", payload),
    list:    () => get("/purchases"),
    getOne:  (id) => get(`/purchases/${encodeURIComponent(id)}`),
    pay:     (id, metodo, cupom) => post(`/purchases/${encodeURIComponent(id)}/pay`, { metodo, cupom }),
  };
})();
