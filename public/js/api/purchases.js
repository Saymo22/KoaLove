/* js/api/purchases.js — endpoints de compras/presentes.
   Metadados vivem no servidor; mídia de entrega também é persistida no servidor. */
(function () {
  const { get, post } = window.ApiClient;
  window.ApiPurchases = {
    create:  (payload) => post("/purchases", payload),
    update: (id, payload) => post(`/purchases/${encodeURIComponent(id)}/update`, payload),
    remove: (id) => post(`/purchases/${encodeURIComponent(id)}/delete`, {}),
    upload: async (id, assetId, blob) => {
      if(window.NA_CONFIG_READY)await window.NA_CONFIG_READY;
      if(window.APP_CONFIG?.MEDIA_UPLOAD==='blob') {
        const route=`/purchases/${encodeURIComponent(id)}/media/${encodeURIComponent(assetId)}`;
        const intent=await post(route+'/prepare',{type:blob.type,size:blob.size});
        if(intent.complete)return {id:assetId,kind:intent.kind};
        if(intent.reused){
          try{return await post(route+'/complete',{});}catch(error){if(error.code!=='UPLOAD_INCOMPLETE')throw error;}
        }
        if(!window.NABlob)throw new Error('Não foi possível carregar o envio de arquivos. Atualize a página.');
        const base=(window.APP_CONFIG.API_BASE||'/api').replace(/\/+$/,'');
        await window.NABlob.upload(intent.pathname,blob,{access:'private',contentType:blob.type,multipart:true,handleUploadUrl:base+route+'/token'});
        return post(route+'/complete',{});
      }
      const base = (window.APP_CONFIG?.API_BASE || '/api').replace(/\/+$/, '');
      let res;
      try {
        res = await fetch(`${base}/purchases/${encodeURIComponent(id)}/media/${encodeURIComponent(assetId)}`, {method:'POST', credentials:'include',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob});
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
