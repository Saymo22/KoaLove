const { stores } = require('../lib/db');
const http = require('../lib/http');
const auth = require('../lib/auth');
const security = require('../lib/security');
const validate = require('../lib/validate');
const fs = require('fs/promises');
const { createReadStream } = require('fs');
const path = require('path');
const config = require('../config');
const MEDIA_DIR = path.join(config.DATA_DIR, 'media');
const MIME = { 'image/jpeg':'photo', 'image/png':'photo', 'image/webp':'photo', 'image/gif':'photo', 'image/avif':'photo', 'audio/mpeg':'music', 'audio/wav':'music', 'audio/x-wav':'music', 'audio/ogg':'music', 'audio/mp4':'music', 'audio/webm':'music', 'video/mp4':'video', 'video/webm':'video', 'video/quicktime':'video' };
const LIMIT = { photo:15*1024**2, music:25*1024**2, video:100*1024**2 };
function error(status, code, message) { return Object.assign(new Error(message), {status,code}); }
function owner(req, p, pending=false) {
  const user = auth.requireUser(req);
  if (!user) throw error(401,'NOT_AUTHENTICATED','Faça login para continuar.');
  if (!p || p.deleted) throw error(404,'NOT_FOUND','Pedido não encontrado.');
  if (p.user_id !== user.id) throw error(403,'FORBIDDEN','Sem permissão.');
  if (pending && p.status !== 'pending' && !(pending==='legacy' && p.status==='paid' && p.content_version!==1)) throw error(409,'NOT_PENDING','Somente rascunhos podem ser alterados.');
  return user;
}
const CONTENT = ['tema','titulo','de','para','inicio','carta','frase','eventos','amo','legendas','fotoCapa','photoIds','musicaNome','musicaArtista','usarIntro','autoplay','rodapeCustom','themeData'];
function content(body) {
  const cfg = stores.config.all()[0] || {};
  const tema = validate.sanitizeStr(body.tema,40);
  if (!cfg.themes?.[tema]) throw error(400,'INVALID_THEME','Tema inválido ou não configurado.');
  const details = validate.themeData(body.themeData);
  if (!details.ok) throw error(400,'INVALID_THEME_DATA','Revise os detalhes do tema: conteúdo inválido ou muito extenso.');
  const para = validate.sanitizeStr(body.para,60);
  const phraseLimit = tema === 'netflix' ? 600 : 90;
  if(typeof body.frase === 'string' && body.frase.trim().length > phraseLimit) throw error(400,'PHRASE_TOO_LONG',`A frase deste tema pode ter até ${phraseLimit} caracteres.`);
  if (!para) throw error(400,'MISSING_RECIPIENT','Informe o nome de quem recebe.');
  const str = (v,n) => validate.sanitizeStr(v,n);
  return {
    tema, para, titulo:str(body.titulo,80)||'Nós dois', de:str(body.de,60), inicio:str(body.inicio,20), carta:str(body.carta,4000),
    frase:str(body.frase,phraseLimit), rodapeCustom:str(body.rodapeCustom,500), musicaNome:str(body.musicaNome,100), musicaArtista:str(body.musicaArtista,100),
    usarIntro:body.usarIntro!==false, autoplay:body.autoplay===true, themeData:details.value,
    eventos:(Array.isArray(body.eventos)?body.eventos:[]).slice(0,6).map(e=>({data:str(e?.data,30),titulo:str(e?.titulo,50),texto:str(e?.texto,800)})),
    amo:(Array.isArray(body.amo)?body.amo:[]).slice(0,20).map(x=>str(x,500)),
    legendas:(Array.isArray(body.legendas)?body.legendas:[]).slice(0,12).map(x=>str(x,60)),
    fotoCapa:Math.max(0,Math.min(11,Number(body.fotoCapa)||0)),
    preview_data_url:typeof body.preview_data_url==='string' && /^data:image\/(jpeg|png|webp);base64,/.test(body.preview_data_url) && body.preview_data_url.length<200000?body.preview_data_url:null,
  };
}
function ready(p) { return !p.deleted && p.status==='paid' && p.content_version===1; }
function project(p, shared=false) {
  const output = shared ? Object.fromEntries(CONTENT.map(key=>[key,p[key]])) : {...p};
  if (shared) { output.status = 'paid'; output.themeData = {[p.tema]:p.themeData?.[p.tema]||{}}; }
  delete output.uploads;
  const base = shared ? `/api/shared/${p.share_token}/media/` : `/api/purchases/${p.id}/media/`;
  const url = id => new URL(base+encodeURIComponent(id),'http://local').pathname;
  output.fotos=(p.media?.photos||[]).map(url);
  output.videos=(p.media?.videos||[]).map(url);
  output.musica=p.media?.music?url(p.media.music):null;
  output.photoIds=p.media?.photos||p.photoIds||[];
  return output;
}
async function create(req,res) {
  const user=auth.requireUser(req);
  if(!user)return http.fail(res,401,'NOT_AUTHENTICATED','Faça login para continuar.');
  const body=await http.readJsonBody(req), fields=content(body),cfg=stores.config.all()[0]||{};
  const requestId=typeof body.client_request_id==='string'&&/^[\w-]{16,100}$/.test(body.client_request_id)?body.client_request_id:null;
  const p=await stores.purchases.transaction(rows=>{
    const existing=requestId&&rows.find(x=>x.user_id===user.id&&x.client_request_id===requestId);
    if(existing){if(existing.deleted)throw error(409,'DELETED','Este rascunho foi excluído. Inicie um novo presente.');return existing;}
    const item={...fields,id:security.randomId('p'),user_id:user.id,client_request_id:requestId,share_token:security.randomToken(),status:'pending',price_cents:cfg.price_cents,coupon:null,discount_percent:0,amount_paid_cents:null,payment_method:null,created_at:Date.now(),paid_at:null,deleted:false,uploads:[],media:{photos:[],videos:[],music:null},content_version:0};
    rows.push(item);return item;
  });
  http.created(res,{purchase:project(p)});
}
async function list(req,res) {
  const user=auth.requireUser(req);if(!user)return http.fail(res,401,'NOT_AUTHENTICATED','Faça login.');
  const rows=stores.purchases.filter(p=>p.user_id===user.id&&(!p.deleted||p.paid_at||['paid','refunded'].includes(p.status))).sort((a,b)=>b.created_at-a.created_at);
  http.ok(res,{purchases:rows.map(p=>project(p))});
}
async function getOne(req,res,id) {
  const user=auth.requireUser(req);if(!user)return http.fail(res,401,'NOT_AUTHENTICATED','Faça login.');
  const p=stores.purchases.find(x=>x.id===id&&!x.deleted);
  if(!p)return http.fail(res,404,'NOT_FOUND','Pedido não encontrado.');
  if(p.user_id!==user.id&&user.role!=='admin')return http.fail(res,403,'FORBIDDEN','Sem permissão.');
  http.ok(res,{purchase:project(p)});
}
async function update(req,res,id,legacy=false) {
  const mode=legacy?'legacy':true;
  owner(req,stores.purchases.find(x=>x.id===id),mode);
  const body=await http.readJsonBody(req), fields=content(body);
  const obsolete=[];
  const p=await stores.purchases.transaction(rows=>{
    const current=rows.find(x=>x.id===id);owner(req,current,mode);
    const photos=body.media?.photos,videos=body.media?.videos,music=body.media?.music||null;
    if(!Array.isArray(photos)||!photos.length||photos.length>12||!Array.isArray(videos)||videos.length>4)throw error(400,'INVALID_MEDIA','Envie de 1 a 12 fotos e até 4 vídeos.');
    const check=(ids,kind)=>ids.every(id=>typeof id==='string'&&current.uploads?.some(a=>a.id===id&&a.kind===kind));
    if(!check(photos,'photo')||!check(videos,'video')||(music&&!check([music],'music'))||new Set([...photos,...videos,music].filter(Boolean)).size!==photos.length+videos.length+(music?1:0))throw error(400,'INVALID_MEDIA','Mídia não enviada ou repetida.');
    const selected=new Set([...photos,...videos,music]);
    obsolete.push(...current.uploads.filter(asset=>!selected.has(asset.id)));
    current.uploads=current.uploads.filter(asset=>selected.has(asset.id));
    Object.assign(current,fields,{share_token:current.share_token||security.randomToken(),media:{photos,videos,music},photoIds:photos,has_media:true,content_version:1,updated_at:Date.now()});return current;
  });
  await Promise.allSettled(obsolete.map(asset=>fs.unlink(path.join(MEDIA_DIR,asset.filename))));
  http.ok(res,{purchase:project(p)});
}
async function upload(req,res,id,assetId) {
  owner(req,stores.purchases.find(x=>x.id===id),'legacy');
  if(!/^[\w-]{16,100}$/.test(assetId))throw error(400,'INVALID_MEDIA_ID','Identificador de mídia inválido.');
  const mime=String(req.headers['content-type']||'').split(';')[0].toLowerCase(),kind=MIME[mime];
  if(!kind)throw error(415,'INVALID_MEDIA_TYPE','Formato não suportado. Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM, MOV, MP3, WAV, OGG ou M4A.');
  if(Number(req.headers['content-length'])>LIMIT[kind])throw error(413,'MEDIA_TOO_LARGE',`Arquivo excede ${LIMIT[kind]/1024**2} MB.`);
  await fs.mkdir(MEDIA_DIR,{recursive:true});
  const filename=security.randomToken(),target=path.join(MEDIA_DIR,filename);
  let bytes=0,handle;
  try {
    handle=await fs.open(target,'wx');
    for await(const chunk of req){bytes+=chunk.length;if(bytes>LIMIT[kind])throw error(413,'MEDIA_TOO_LARGE','Arquivo muito grande.');await handle.writeFile(chunk);}
    await handle.close();handle=null;
    if(!bytes)throw error(400,'EMPTY_MEDIA','Arquivo vazio.');
    await require('../lib/media').validateMedia(target,mime,kind);
    let used=false;
    await stores.purchases.transaction(rows=>{
      const p=rows.find(x=>x.id===id);owner(req,p,'legacy');p.uploads||=[];
      const existing=p.uploads.find(a=>a.id===assetId);
      if(existing){if(existing.kind!==kind)throw error(409,'MEDIA_CONFLICT','Identificador de mídia já utilizado.');return;}
      if(p.uploads.length>=80||p.uploads.reduce((n,a)=>n+a.bytes,0)+bytes>300*1024**2)throw error(413,'MEDIA_LIMIT','Limite de 300 MB por presente atingido.');
      p.uploads.push({id:assetId,kind,mime,bytes,filename});used=true;
    });
    if(!used)await fs.unlink(target);
    http.ok(res,{id:assetId,kind});
  } catch(err){if(handle)await handle.close().catch(()=>{});await fs.unlink(target).catch(()=>{});throw err;}
}
async function shared(req,res,token) {
  const p=stores.purchases.find(x=>x.share_token===token);
  if(!p||!ready(p))return http.fail(res,404,'SHARE_UNAVAILABLE','Este presente não está disponível.');
  http.ok(res,{purchase:project(p,true)});
}
async function media(req,res,key,assetId,isShared=false) {
  const p=stores.purchases.find(x=>isShared?x.share_token===key:x.id===key);
  if(isShared){if(!p||!ready(p))throw error(404,'SHARE_UNAVAILABLE','Presente indisponível.');}
  else owner(req,p);
  if(![...(p.media?.photos||[]),...(p.media?.videos||[]),p.media?.music].includes(assetId))throw error(404,'NOT_FOUND','Mídia indisponível.');
  const asset=p.uploads?.find(a=>a.id===assetId);if(!asset)throw error(404,'NOT_FOUND','Mídia indisponível.');
  const target=path.join(MEDIA_DIR,asset.filename),stat=await fs.stat(target);
  let start=0,end=stat.size-1;
  const range=req.headers.range;
  if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(m&&(m[1]||m[2])){if(!m[1])start=Math.max(0,stat.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}}else start=NaN;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}}
  http.applySecurityHeaders(res);res.setHeader('Content-Type',asset.mime);res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',end-start+1);
  if(range){res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
  else res.statusCode=200;
  const stream=createReadStream(target,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
}
async function remove(req,res,id) {
  const p=await stores.purchases.transaction(rows=>{const p=rows.find(x=>x.id===id);owner(req,p);p.deleted=true;p.deleted_at=Date.now();return p;});
  http.ok(res,{purchase:project(p)});
}
async function pay(req,res,id) {
  owner(req,stores.purchases.find(x=>x.id===id),true);
  const body=await http.readJsonBody(req),cupom=validate.sanitizeStr(body.cupom,20).toUpperCase(),cfg=stores.config.all()[0]||{};
  if(cupom&&!cfg.coupons?.[cupom])return http.fail(res,400,'INVALID_COUPON','Cupom inválido ou expirado.');
  const purchase=await stores.purchases.transaction(rows=>{
    const p=rows.find(x=>x.id===id);owner(req,p,true);
    if(p.content_version!==1||!p.media?.photos?.length)throw error(409,'CONTENT_INCOMPLETE','Abra o rascunho e salve as fotos antes de pagar.');
    const discount=cfg.coupons?.[cupom]?.discount_percent||0;
    Object.assign(p,{status:'paid',paid_at:Date.now(),payment_method:body.metodo==='card'?'card':'pix',coupon:cupom||null,discount_percent:discount,amount_paid_cents:Math.round(p.price_cents*(1-discount/100))});return p;
  });http.ok(res,{purchase:project(purchase)});
}
module.exports={create,list,getOne,update,upload,shared,media,remove,pay,project};
