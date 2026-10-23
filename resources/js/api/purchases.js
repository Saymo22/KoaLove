/* js/api/purchases.js — endpoints de compras/presentes.
   Metadados vivem no servidor; mídia de entrega também é persistida no servidor. */
(function () {
  const { get, post } = window.ApiClient;
  window.ApiPurchases = {
    create:  (payload) => post("/purchases", payload),
    update: (id, payload) => post(`/purchases/${encodeURIComponent(id)}/update`, payload),
    remove: (id) => post(`/purchases/${encodeURIComponent(id)}/delete`, {}),
    upload: async (id, assetId, blob) => {
      const base = (window.APP_CONFIG?.API_BASE || '/api').replace(/\/+$/, '');
      let res;
      try {
        res = await fetch(`${base}/purchases/${encodeURIComponent(id)}/media/${encodeURIComponent(assetId)}`, {method:'POST', credentials:'include',headers:{'Content-Type':blob.type||'application/octet-stream','Accept':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.content || ''},body:blob});
      } catch {
        throw new window.ApiClient.ApiError({status:0,code:'NETWORK_ERROR',message:'Conexão interrompida ao enviar o arquivo. Seu rascunho foi mantido; tente novamente.'});
      }
      let result = null;
      try { result = await res.json(); } catch { /* Um servidor desatualizado pode responder HTML. */ }
      if(!res.ok || !result?.ok) {
        const code = result?.error?.code || 'INVALID_UPLOAD_RESPONSE';
        const missingRoute = code === 'ENDPOINT_NOT_FOUND';
        throw new window.ApiClient.ApiError({status:res.status,code,
          message:missingRoute ? 'O servidor está desatualizado e não possui a rota de envio de arquivos. Reinicie o servidor do projeto e tente salvar novamente. Seu rascunho foi mantido.' : result?.error?.message || 'Não foi possível enviar o arquivo. Verifique se abriu o site pelo servidor do projeto.',
          retryAfter:Number(res.headers.get('Retry-After')) || null});
      }
      return result.data;
    },
    list:    () => get("/purchases"),
    getOne:  (id) => get(`/purchases/${encodeURIComponent(id)}`),
    pay:     (id, metodo, cupom) => post(`/purchases/${encodeURIComponent(id)}/pay`, { metodo, cupom }),
  };
})();
