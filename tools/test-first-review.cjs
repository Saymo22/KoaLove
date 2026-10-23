/* Integração real em banco temporário. Nunca inicializa server/data. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'na-first-review-'));
const base='http://127.0.0.1:3199';let child,logs='';
async function start(){
 logs='';child=spawn(process.execPath,['server/index.js'],{cwd:root,env:{...process.env,PORT:'3199',NA_DATA_DIR:tmp},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error(logs)),10000);child.on('error',reject);child.stdout.on('data',()=>{if(logs.includes('Servidor de testes rodando')){clearTimeout(t);resolve();}});});
}
async function stop(){if(child&&child.exitCode===null){const closed=once(child,'exit');child.kill();await closed;}}
async function call(route,{cookie,body,status=200,method,headers}={}){
 const res=await fetch(base+route,{method:method||(body?'POST':'GET'),headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
 assert.equal(res.status,status,route+' '+await (res.status!==status?res.text():Promise.resolve('')));
 const data=await res.json();return {data:data.data,cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
async function main(){
 fs.copyFileSync(path.join(root,'server/data/config.json'),path.join(tmp,'config.json'));
 // Falha em disco não altera memória nem contamina a próxima transação.
 const {JsonStore}=require('../server/lib/db');const store=new JsonStore('fault-test');store.path=path.join(tmp,'fault.json');
 await assert.rejects(store.insert({id:'blocked'}),/não inicializado/);
 await store.load();await store.insert({id:'initial',value:1});
 const rename=fsp.rename;let fail=true;
 fsp.rename=async(...args)=>{if(fail){fail=false;throw new Error('falha simulada');}return rename(...args);};
 try {const first=store.update('initial',{value:2});const next=store.insert({id:'next'});await assert.rejects(first,/falha simulada/);await next;} finally {fsp.rename=rename;}
 assert.equal(store.find(x=>x.id==='initial').value,1);assert.equal(store.all().length,2);const copy=store.all();copy.length=0;assert.equal(store.all().length,2);
 await start();
 const user=await call('/api/auth/register',{status:201,body:{name:'Revisão isolada',email:'review@example.test',password:'review123'}}),cookie=user.cookie;
 const other=await call('/api/auth/register',{status:201,body:{name:'Outro visitante',email:'other@example.test',password:'review123'}});
 const fields={client_request_id:'review-stable-request-2026',tema:'namoro',titulo:'Nossa história',de:'Ana',para:'Bia',inicio:'2020-06-01',carta:'Uma carta completa',frase:'Uma frase nossa',eventos:[{data:'2020',titulo:'Encontro',texto:'Nossa lembrança'}],amo:['Seu sorriso'],legendas:['Minha foto'],fotoCapa:0,musicaNome:'Uma música',musicaArtista:'Nós',rodapeCustom:'Com amor',usarIntro:false,autoplay:true,themeData:{namoro:{texts:{}}}};
 const [one,two]=await Promise.all([call('/api/purchases',{cookie,body:fields,status:201}),call('/api/purchases',{cookie,body:fields,status:201})]);
 const id=one.data.purchase.id,token=one.data.purchase.share_token;assert.equal(two.data.purchase.id,id);
 assert.equal((await call('/api/purchases',{cookie})).data.purchases.length,1);
 await call('/api/purchases/'+id,{status:401});await call('/api/purchases/'+id,{cookie:other.cookie,status:403});
 await call('/api/shared/'+token,{status:404});await call('/api/purchases/'+id+'/pay',{cookie,body:{},status:409});
 const photo='review-photo-stable-2026',song='review-music-stable-2026';
 const wav=Buffer.alloc(8044,128);wav.fill(0,0,44);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);wav.writeUInt16LE(8,34);wav.write('data',36);wav.writeUInt32LE(8000,40);
 const png=await require('../server/node_modules/sharp')({create:{width:2,height:2,channels:3,background:'#c25a7c'}}).png().toBuffer();
 for(const [asset,type,bytes] of [[photo,'image/png',png],[song,'audio/wav',wav]]){
   const res=await fetch(base+'/api/purchases/'+id+'/media/'+asset,{method:'POST',headers:{Cookie:cookie,'Content-Type':type},body:bytes});assert.equal(res.status,200,await res.text());
 }
 const config=JSON.parse(fs.readFileSync(path.join(tmp,'config.json')))[0];
 for(const tema of Object.keys(config.themes)){
   const saved=await call('/api/purchases/'+id+'/update',{cookie,body:{...fields,tema,media:{photos:[photo],videos:[],music:song}}});
   assert.equal(saved.data.purchase.id,id);assert.equal(saved.data.purchase.tema,tema);assert.equal(saved.data.purchase.frase,fields.frase);
 }
 await call('/api/purchases/'+id+'/update',{cookie:other.cookie,body:fields,status:403});
 await call('/api/purchases/'+id+'/pay',{cookie,body:{metodo:'pix'}});
 await call('/api/purchases/'+id+'/update',{cookie,body:fields,status:409});
 const shared=(await call('/api/shared/'+token)).data.purchase;
 for(const key of ['titulo','de','para','inicio','carta','frase','eventos','amo','legendas','musicaNome','musicaArtista','rodapeCustom','usarIntro','autoplay'])assert.deepEqual(shared[key],fields[key],key);
 assert.equal(shared.user_id,undefined);assert.equal(shared.amount_paid_cents,undefined);assert.equal(shared.uploads,undefined);assert.deepEqual(shared.photoIds,[photo]);
 const image=await fetch(base+shared.fotos[0]);assert.equal(image.status,200);assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);
 await call('/api/purchases/'+id+'/media/'+photo,{status:401});
 const ranged=await fetch(base+shared.musica,{headers:{Range:'bytes=0-3'}});assert.equal(ranged.status,206);assert.equal((await ranged.arrayBuffer()).byteLength,4);
 const malformed=await fetch(base+'/%E0%A4%A');assert.equal(malformed.status,400);await call('/api/config');
 await call('/api/auth/me',{headers:{Cookie:'nossoamor_sid=%broken'},status:401});
 // Reinício comprova persistência e bloqueio de presentes reembolsados.
 await stop();const records=JSON.parse(fs.readFileSync(path.join(tmp,'purchases.json')));records[0].status='refunded';fs.writeFileSync(path.join(tmp,'purchases.json'),JSON.stringify(records));await start();
 await call('/api/shared/'+token,{status:404});await call(shared.fotos[0],{status:404});
 await stop();records[0].status='paid';fs.writeFileSync(path.join(tmp,'purchases.json'),JSON.stringify(records));await start();
 await call('/api/purchases/'+id+'/delete',{cookie:other.cookie,body:{},status:403});
 await call('/api/purchases/'+id+'/delete',{cookie,body:{}});
 await call('/api/shared/'+token,{status:404});await call(shared.fotos[0],{status:404});
 const history=(await call('/api/purchases',{cookie})).data.purchases;assert.equal(history[0].deleted,true);assert.equal(history[0].amount_paid_cents,config.price_cents);
 // Migração única de presente pago anterior à persistência de mídia.
 await stop();
 const legacyRows=JSON.parse(fs.readFileSync(path.join(tmp,'purchases.json')));
 legacyRows.push({...fields,id:'p_legacy_review',user_id:legacyRows[0].user_id,status:'paid',paid_at:Date.now(),deleted:false,uploads:[]});
 fs.writeFileSync(path.join(tmp,'purchases.json'),JSON.stringify(legacyRows));await start();
 const legacyUpload=await fetch(base+'/api/purchases/p_legacy_review/media/'+photo,{method:'POST',headers:{Cookie:cookie,'Content-Type':'image/png'},body:png});assert.equal(legacyUpload.status,200);
 const migrated=(await call('/api/purchases/p_legacy_review/migrate',{cookie,body:{...fields,media:{photos:[photo],videos:[],music:null}}})).data.purchase;
 assert.ok(migrated.share_token);await call('/api/shared/'+migrated.share_token);
 await call('/api/purchases/p_legacy_review/migrate',{cookie,body:fields,status:409});
 await call('/api/auth/logout',{cookie,body:{}});await call('/api/auth/me',{cookie,status:401});
 console.log('OK: transação com falha, idempotência concorrente, 13 temas, conteúdo completo, upload, Range, persistência, permissões, token público, reembolso, exclusão com histórico, URL inválida e logout.');
}
main().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{await stop();assert.ok(path.resolve(tmp).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(tmp,{recursive:true,force:true});});
