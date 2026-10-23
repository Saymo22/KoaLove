const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');const {once}=require('node:events');
(async()=>{
 const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'na-review-2-api-'));
 const original=fs.readFileSync(path.join(root,'server/data/purchases.json'));
 const fixtures=require('./second-review-fixtures.cjs')(dir);
 const server=spawn(process.execPath,['server/index.js'],{cwd:root,env:{...process.env,NA_DATA_DIR:dir,PORT:'3203'},stdio:['ignore','pipe','pipe']});
 let logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor não iniciou.')),10000);server.once('error',reject);server.once('exit',()=>{clearTimeout(timer);reject(new Error('Servidor encerrou.'));});server.stdout.on('data',()=>{if(logs.includes('Servidor de testes rodando')){clearTimeout(timer);resolve();}});});
  const request=(route,options)=>fetch('http://127.0.0.1:3203'+route,options);
  for(let i=0;i<160;i++){const r=await request(i%2?'/css/criar.css':'/js/pages/home.js');assert.equal(r.status,200);await r.arrayBuffer();}
  assert.equal((await request('/api/config')).status,200,'Arquivos não consomem o limite da API');
  const cookie='nossoamor_sid=review-2-isolated-session';
  const list=await request('/api/purchases',{headers:{Cookie:cookie}});assert.equal(list.status,200);
  const rows=(await list.json()).data.purchases;
  assert.equal(rows.length,fixtures.length);assert.equal(rows.find(r=>r.id==='review-2-deleted-refund').status,'refunded','Reembolso removido permanece no histórico mesmo sem paid_at');
  for(let i=0;i<6;i++){const r=await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'nobody@example.test',password:'invalid123'})});assert.equal(r.status,i<5?401:429);if(i===5)assert.ok(Number(r.headers.get('Retry-After'))>0);await r.arrayBuffer();}
  const home=await request('/home.html');assert.equal(home.status,200,'Limite do login não bloqueia navegação');const html=await home.text();
  assert.ok(!html.includes('Inscrição realizada'));assert.ok(!html.includes('10% off'));assert.ok(!html.includes('Fotos ilimitadas'));assert.ok(html.includes('Até 12 fotos'));
  assert.deepEqual(fs.readFileSync(path.join(root,'server/data/purchases.json')),original,'Banco real preservado');
  console.log('OK: 160 arquivos sem bloquear API; login mantém limite de 5 tentativas; estados e histórico de reembolso; textos da home; banco principal preservado.');
 }finally{if(server.exitCode===null){const ended=once(server,'exit');server.kill();await ended;}assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
