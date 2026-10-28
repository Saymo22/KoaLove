/* Referências persistentes de mídia; migra índices antigos antes de reordenar. */
window.NAGift = (() => {
  const uploaded=new Map();
  const id = () => crypto.randomUUID?.() || Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
  const url = value => typeof value==='string' ? new URL(value,location.origin).href : URL.createObjectURL(value);
  function refs(value,ids) {
    if(typeof value==='string' && /^@photo:\d+$/.test(value))return ids[Number(value.slice(7))]?'@media:'+ids[Number(value.slice(7))]:'';
    if(Array.isArray(value))return value.map(v=>refs(v,ids));
    if(value && typeof value==='object' && !(value instanceof Blob))return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,refs(v,ids)]));
    return value;
  }
  function prepare(p) {
    p.photoIds=p.fotos.map((_,i)=>p.photoIds?.[i]||id());
    p.videoIds=(p.videos||[]).map((_,i)=>p.videoIds?.[i]||id());
    if(p.musica)p.musicId||=id();
    p.themeData=refs(p.themeData,p.photoIds);
    return p;
  }
  async function sync(p,purchaseId,legacy=false) {
    prepare(p);
    const assetId=(value,id)=>{
      if(value instanceof Blob)return id;
      const parsed=new URL(value,location.origin);
      if(parsed.origin!==location.origin||!parsed.pathname.startsWith('/api/purchases/'+purchaseId+'/media/'))throw new Error('Selecione novamente a mídia para sincronizar.');
      return decodeURIComponent(parsed.pathname.split('/').pop());
    };
    // Declare the current selection before uploads so abandoned staged files do not
    // consume a slot forever after an interrupted sync. Saved manifest files survive.
    await ApiPurchases.selectMedia(purchaseId,{
      photos:p.fotos.map((value,i)=>assetId(value,p.photoIds[i])),
      videos:(p.videos||[]).map((value,i)=>assetId(value,p.videoIds[i])),
      music:p.musica?assetId(p.musica,p.musicId):null,
    });
    const send=async(value,asset)=>{
      if(value instanceof Blob){
        const key=purchaseId+':'+asset;
        if(uploaded.get(key)!==value){await ApiPurchases.upload(purchaseId,asset,value);uploaded.set(key,value);}
        return asset;
      }
      const parsed=new URL(value,location.origin);
      if(parsed.origin!==location.origin||!parsed.pathname.startsWith('/api/purchases/'+purchaseId+'/media/'))throw new Error('Selecione novamente a mídia para sincronizar.');
      return decodeURIComponent(parsed.pathname.split('/').pop());
    };
    const photos=[],videos=[];
    for(let i=0;i<p.fotos.length;i++)photos.push(await send(p.fotos[i],p.photoIds[i]));
    for(let i=0;i<(p.videos||[]).length;i++)videos.push(await send(p.videos[i],p.videoIds[i]));
    const music=p.musica?await send(p.musica,p.musicId):null;
    const body={...p,media:{photos,videos,music}};
    delete body.fotos;delete body.videos;delete body.musica;
    return ApiClient.post('/purchases/'+encodeURIComponent(purchaseId)+(legacy?'/migrate':'/update'),body);
  }
  // Stage media while the customer completes the remaining steps. The final
  // sync repeats selection and upload idempotently before saving the manifest.
  async function stage(p,purchaseId) {
    prepare(p);
    const asset=(value,id)=>{
      if(value instanceof Blob)return id;
      const parsed=new URL(value,location.origin);
      if(parsed.origin!==location.origin||!parsed.pathname.startsWith('/api/purchases/'+purchaseId+'/media/'))throw new Error('Selecione novamente a mídia para sincronizar.');
      return decodeURIComponent(parsed.pathname.split('/').pop());
    };
    await ApiPurchases.selectMedia(purchaseId,{
      photos:p.fotos.map((v,i)=>asset(v,p.photoIds[i])),
      videos:(p.videos||[]).map((v,i)=>asset(v,p.videoIds[i])),
      music:p.musica?asset(p.musica,p.musicId):null,
    });
    for(const [values,ids] of [[p.fotos,p.photoIds],[p.videos||[],p.videoIds]]){
      for(let i=0;i<values.length;i++)if(values[i] instanceof Blob){
        const key=purchaseId+':'+ids[i];
        if(uploaded.get(key)!==values[i]){await ApiPurchases.upload(purchaseId,ids[i],values[i]);uploaded.set(key,values[i]);}
      }
    }
    if(p.musica instanceof Blob){
      const key=purchaseId+':'+p.musicId;
      if(uploaded.get(key)!==p.musica){await ApiPurchases.upload(purchaseId,p.musicId,p.musica);uploaded.set(key,p.musica);}
    }
  }
  return {id,url,refs,prepare,sync,stage};
})();
