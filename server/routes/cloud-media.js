/* Upload direto ao Blob privado; só confirma mídia depois da validação local. */
const {stores}=require('../lib/db'),http=require('../lib/http'),security=require('../lib/security');
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {Readable}=require('node:stream'),{pipeline}=require('node:stream/promises');
const err=(status,code,message)=>Object.assign(new Error(message),{status,code});
const rules=()=>require('./purchases').mediaRules;
function available(){if(!require('../config').CLOUD||!process.env.BLOB_READ_WRITE_TOKEN)throw err(503,'BLOB_NOT_CONFIGURED','Configure o armazenamento Blob privado.');}
function lookup(req,id,asset){
  const p=stores.purchases.find(p=>p.id===id);rules().owner(req,p,'legacy');
  const intent=p.uploadIntents?.find(x=>x.id===asset&&x.expires_at>Date.now());
  if(!intent)throw err(409,'UPLOAD_EXPIRED','O envio expirou. Tente salvar novamente.');
  return intent;
}
async function prepare(req,res,id,asset){
  available();const {owner,MIME,LIMIT}=rules();owner(req,stores.purchases.find(p=>p.id===id),'legacy');
  if(!/^[\w-]{16,100}$/.test(asset))throw err(400,'INVALID_MEDIA_ID','Identificador de mídia inválido.');
  const body=await http.readJsonBody(req),mime=String(body.type||'').toLowerCase(),kind=MIME[mime],bytes=Number(body.size);
  if(!kind)throw err(415,'INVALID_MEDIA_TYPE','Formato de arquivo não suportado.');
  if(!Number.isSafeInteger(bytes)||bytes<=0||bytes>LIMIT[kind])throw err(413,'MEDIA_TOO_LARGE','Revise o tamanho do arquivo.');
  const expired=[];
  const intent=await stores.purchases.transaction(rows=>{
    const p=rows.find(p=>p.id===id);owner(req,p,'legacy');p.uploads||=[];
    const existing=p.uploads.find(x=>x.id===asset);
    if(existing){if(existing.kind!==kind)throw err(409,'MEDIA_CONFLICT','Identificador já utilizado.');return {complete:true,id:asset,kind};}
    expired.push(...(p.uploadIntents||[]).filter(x=>x.expires_at<=Date.now()));
    p.uploadIntents=(p.uploadIntents||[]).filter(x=>x.expires_at>Date.now());
    const pending=p.uploadIntents.find(x=>x.id===asset);
    if(pending){if(pending.mime!==mime||pending.bytes!==bytes)throw err(409,'MEDIA_CONFLICT','O arquivo deste envio mudou. Selecione-o novamente.');return {...pending,reused:true};}
    if(p.uploads.length+p.uploadIntents.length>=80||[...p.uploads,...p.uploadIntents].reduce((n,a)=>n+a.bytes,0)+bytes>300*1024**2)throw err(413,'MEDIA_LIMIT','Limite de 300 MB por presente atingido.');
    const next={id:asset,pathname:`gifts/${id}/${asset}/${security.randomToken(16)}`,kind,mime,bytes,expires_at:Date.now()+60*60*1000};
    p.uploadIntents.push(next);return next;
  });
  await Promise.allSettled(expired.map(item=>require('@vercel/blob').del(item.pathname)));
  http.ok(res,intent);
}
async function token(req,res,id,asset){
  available();const body=await http.readJsonBody(req);
  const result=await require('@vercel/blob/client').handleUpload({body,request:req,
    onBeforeGenerateToken:async pathname=>{
      const intent=lookup(req,id,asset);
      if(pathname!==intent.pathname)throw err(403,'FORBIDDEN','Destino de envio inválido.');
      return {allowedContentTypes:[intent.mime],maximumSizeInBytes:intent.bytes,validUntil:Math.min(intent.expires_at,Date.now()+15*60*1000),addRandomSuffix:false,allowOverwrite:false};
    }});
  // O SDK espera seu próprio envelope, não o envelope da API de compras.
  http.json(res,200,result);
}
async function complete(req,res,id,asset){
  available();const {owner}=rules();
  const p=stores.purchases.find(p=>p.id===id);owner(req,p,'legacy');
  const existing=p.uploads?.find(x=>x.id===asset);if(existing)return http.ok(res,{id:asset,kind:existing.kind});
  const intent=lookup(req,id,asset),blob=await require('@vercel/blob').get(intent.pathname,{access:'private',useCache:false});
  if(!blob||blob.statusCode!==200)throw err(409,'UPLOAD_INCOMPLETE','O arquivo ainda não terminou de chegar. Tente salvar novamente.');
  if(blob.blob.size!==intent.bytes||blob.blob.contentType.split(';')[0]!==intent.mime){await blob.stream.cancel();throw err(415,'INVALID_MEDIA_CONTENT','O arquivo recebido não corresponde ao envio autorizado.');}
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'na-validate-')),target=path.join(dir,'media');
  let bytes=0;
  try{
    async function* limited(source){for await(const chunk of source){bytes+=chunk.length;if(bytes>intent.bytes)throw err(413,'MEDIA_TOO_LARGE','Arquivo maior que o autorizado.');yield chunk;}}
    await pipeline(Readable.fromWeb(blob.stream),limited,require('node:fs').createWriteStream(target));
    if(bytes!==intent.bytes)throw err(415,'INVALID_MEDIA_CONTENT','Arquivo incompleto.');
    await require('../lib/media').validateMedia(target,intent.mime,intent.kind);
    await stores.purchases.transaction(rows=>{
      const current=rows.find(p=>p.id===id);owner(req,current,'legacy');
      if(current.uploads?.some(x=>x.id===asset))return;
      if(!current.uploadIntents?.some(x=>x.id===asset&&x.pathname===intent.pathname&&x.expires_at>Date.now()))throw err(409,'UPLOAD_EXPIRED','O envio expirou. Tente novamente.');
      current.uploads||=[];current.uploads.push({id:asset,kind:intent.kind,mime:intent.mime,bytes:intent.bytes,blobPath:intent.pathname});
      current.uploadIntents=current.uploadIntents.filter(x=>x.id!==asset);
    });
    http.ok(res,{id:asset,kind:intent.kind});
  }catch(error){
    if(error.code==='INVALID_MEDIA_CONTENT'){
      await require('@vercel/blob').del(intent.pathname).catch(()=>{});
      await stores.purchases.transaction(rows=>{const current=rows.find(p=>p.id===id);if(current)current.uploadIntents=current.uploadIntents?.filter(x=>x.id!==asset);});
    }
    throw error;
  }finally{await fs.rm(dir,{recursive:true,force:true});}
}
async function stream(req,res,asset,start,end){
  const blob=await require('@vercel/blob').get(asset.blobPath,{access:'private',useCache:false});
  if(!blob||blob.statusCode!==200)throw err(404,'NOT_FOUND','Mídia indisponível.');
  http.applySecurityHeaders(res);res.statusCode=req.headers.range?206:200;
  res.setHeader('Content-Type',asset.mime);res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
  res.setHeader('Content-Length',end-start+1);
  if(req.headers.range)res.setHeader('Content-Range',`bytes ${start}-${end}/${asset.bytes}`);
  if(req.method==='HEAD'){await blob.stream.cancel();return res.end();}
  const source=Readable.fromWeb(blob.stream);let offset=0;
  // Mantém o download em streaming, inclusive Range, sem colocar o vídeo inteiro em memória.
  async function* select(){try{for await(const chunk of source){const next=offset+chunk.length;if(next>start&&offset<=end)yield chunk.subarray(Math.max(0,start-offset),Math.min(chunk.length,end-offset+1));offset=next;if(offset>end)break;}}finally{source.destroy();}}
  await pipeline(Readable.from(select()),res);
}
async function remove(asset){if(asset.blobPath)await require('@vercel/blob').del(asset.blobPath);}
module.exports={prepare,token,complete,stream,remove};
