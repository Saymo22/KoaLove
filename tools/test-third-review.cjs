/* Regressão dos oito pontos. Bancos e mensagens exclusivamente temporários. */
const assert=require('node:assert/strict'),fs=require('node:fs'),fsp=require('node:fs/promises');
const path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {spawn,spawnSync}=require('node:child_process'),{once}=require('node:events');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'na-review-3-fixes-'));
const apiDir=path.join(tmp,'api'),unitDir=path.join(tmp,'unit');fs.mkdirSync(apiDir);fs.mkdirSync(unitDir);
process.env.NA_DATA_DIR=unitDir;
const hashes=()=>Object.fromEntries(fs.readdirSync(root+'/server/data').filter(n=>n.endsWith('.json')).map(n=>[n,require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/server/data/'+n)).digest('hex')]));
const original=hashes();let child,logs='';const base='http://127.0.0.1:3206',cookie='nossoamor_sid=review-2-isolated-session';
async function start(){
 logs='';const wrapper=`const fs=require('fs');const mailer=require('./server/lib/mailer');mailer.ready=()=>true;mailer.sendPasswordReset=async(email,token)=>fs.writeFileSync(process.env.NA_DATA_DIR+'/mail.json',JSON.stringify({email,token}));require('./server/index').main();`;
 child=spawn(process.execPath,['-e',wrapper],{cwd:root,env:{...process.env,NA_DATA_DIR:apiDir,PORT:'3206'},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error(logs||'Timeout')),10000);child.once('error',reject);child.once('exit',()=>{clearTimeout(timeout);reject(new Error(logs));});child.stdout.on('data',()=>{if(logs.includes('Servidor de testes rodando')){clearTimeout(timeout);resolve();}});});
}
async function stop(){if(child&&child.exitCode===null){const closed=once(child,'exit');child.kill();await closed;}}
async function call(route,{body,status=200,headers={},auth=true,raw=false}={}){
 const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{...(auth?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'}),...headers},body:body===undefined?undefined:raw?body:JSON.stringify(body)});
 const value=await r.json();assert.equal(r.status,status,route+' '+JSON.stringify(value));return {value,cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
async function main(){
 const db=require('../server/lib/db');await db.initAll();
 await db.stores.refunds.insert({id:'r',purchase_id:'p',status:'pending'});await db.stores.purchases.insert({id:'p',status:'paid'});
 const rename=fsp.rename;let fail=true;
 fsp.rename=async(a,b)=>{if(fail&&b===path.join(unitDir,'purchases.json')){fail=false;throw new Error('falha simulada no segundo registro');}return rename(a,b);};
 try{await assert.rejects(db.transactionAcross(['refunds','purchases'],rows=>{rows.refunds[0].status='approved';rows.purchases[0].status='refunded';}),/falha simulada/);}finally{fsp.rename=rename;}
 assert.equal(db.stores.refunds.all()[0].status,'approved');assert.equal(db.stores.purchases.all()[0].status,'refunded');assert.ok(fs.existsSync(unitDir+'/transaction-journal.json'));
 const restarted=spawnSync(process.execPath,['-e',"require('./server/lib/db').initAll().then(()=>console.log('recovered')).catch(e=>{console.error(e);process.exitCode=1;})"],{cwd:root,env:{...process.env,NA_DATA_DIR:unitDir},encoding:'utf8'});
 assert.equal(restarted.status,0,restarted.stderr);assert.equal(JSON.parse(fs.readFileSync(unitDir+'/purchases.json'))[0].status,'refunded');assert.equal(JSON.parse(fs.readFileSync(unitDir+'/refunds.json'))[0].status,'approved');
 // O processo original não será reutilizado após o reinício simulado.
 const records=require('./second-review-fixtures.cjs')(apiDir);
 const security=require('../server/lib/security');
 fs.writeFileSync(apiDir+'/users.json',JSON.stringify([{id:'review-2-user',name:'Teste',email:'test@example.test',email_hash:security.emailHash('test@example.test'),password_hash:security.hashPassword('old-password'),role:'admin'}]));
 fs.writeFileSync(apiDir+'/refunds.json',JSON.stringify([{id:'r-http',purchase_id:'review-2-paid',status:'pending',user_id:'review-2-user'}]));
 await start();
 for(let i=0;i<6;i++)await call('/api/auth/login',{auth:false,body:{email:'nobody@example.test',password:'invalid-password'},status:i<5?401:429,headers:{'X-Forwarded-For':'192.0.2.'+(20+i)}});
 await stop();await start();
 const decisions=await Promise.all(['approved','rejected'].map(status=>fetch(base+'/api/admin/refunds/r-http/decision',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({status})})));
 assert.deepEqual(decisions.map(r=>r.status).sort(),[200,409]);await Promise.all(decisions.map(r=>r.arrayBuffer()));
 const refunds=(await call('/api/admin/refunds')).value.data.refunds;
 const decision=refunds.find(r=>r.id==='r-http').status;
 const purchase=(await call('/api/purchases/review-2-paid')).value.data.purchase;
 assert.equal(purchase.status,decision==='approved'?'refunded':'paid');
 await call('/api/admin/refunds/r-http/decision',{body:{status:decision}});
 const fields={tema:'netflix',titulo:'Teste',para:'Pessoa',frase:'a'.repeat(600),themeData:{}};
 const created=(await call('/api/purchases',{body:fields,status:201})).value.data.purchase;assert.equal(created.frase.length,600);
 await call('/api/purchases',{body:{...fields,frase:'a'.repeat(601)},status:400});
 const route='/api/purchases/'+created.id+'/media/';
 for(const mime of ['image/png','audio/mpeg','video/mp4'])await call(route+'invalid-file-0123456',{body:Buffer.from('not-real-media'),raw:true,headers:{'Content-Type':mime},status:415});
 const sharp=require('../server/node_modules/sharp');const png=await sharp({create:{width:2,height:2,channels:3,background:'#fff'}}).png().toBuffer();
 await call(route+'valid-image-01234567',{body:png,raw:true,headers:{'Content-Type':'image/png'}});
 await call(route+'wrong-image-01234567',{body:png,raw:true,headers:{'Content-Type':'image/jpeg'},status:415});
 await call(route+'truncated-image-012345',{body:png.subarray(0,45),raw:true,headers:{'Content-Type':'image/png'},status:415});
 const wav=Buffer.alloc(8044,128);wav.fill(0,0,44);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);wav.writeUInt16LE(8,34);wav.write('data',36);wav.writeUInt32LE(8000,40);
 await call(route+'valid-audio-01234567',{body:wav,raw:true,headers:{'Content-Type':'audio/wav'}});
 await call('/api/purchases/'+created.id+'/update',{body:{...fields,media:{photos:['valid-image-01234567'],videos:[],music:'valid-audio-01234567'}}});
 await call('/api/purchases/'+created.id+'/pay',{body:{metodo:'pix'}});
 const generic=await call('/api/auth/forgot-password',{auth:false,body:{email:'test@example.test'}});
 const unknown=await call('/api/auth/forgot-password',{auth:false,body:{email:'unknown@example.test'}});assert.deepEqual(generic.value,unknown.value);
 assert.ok(!JSON.stringify(generic.value).includes('token'));
 const mail=JSON.parse(fs.readFileSync(apiDir+'/mail.json'));assert.equal(mail.email,'test@example.test');
 const onDisk=JSON.parse(fs.readFileSync(apiDir+'/users.json'));assert.notEqual(onDisk[0].password_reset.hash,mail.token);
 await call('/api/auth/reset-password',{auth:false,body:{token:mail.token,password:'new-password'}});
 await call('/api/auth/me',{status:401});
 await call('/api/auth/reset-password',{auth:false,body:{token:mail.token,password:'another-password'},status:400});
 await call('/api/auth/login',{auth:false,body:{email:'test@example.test',password:'old-password'},status:401});
 await call('/api/auth/login',{auth:false,body:{email:'test@example.test',password:'new-password'}});
 await call('/api/auth/forgot-password',{auth:false,body:{email:'test@example.test'}});
 const expired=JSON.parse(fs.readFileSync(apiDir+'/mail.json'));
 await stop();const users=JSON.parse(fs.readFileSync(apiDir+'/users.json'));users[0].password_reset.expires_at=Date.now()-1;fs.writeFileSync(apiDir+'/users.json',JSON.stringify(users));await start();
 await call('/api/auth/reset-password',{auth:false,body:{token:expired.token,password:'expired-password'},status:400});
 await stop();
 // Regressão da retomada: a abertura sem query precisa procurar um rascunho.
 const creator=fs.readFileSync(root+'/public/js/pages/criar.js','utf8');const begin=creator.indexOf('async function carregarPedidoParaEdicao()'),end=creator.indexOf('\n}',begin)+2;
 let searched=0,offered=0;const context=vm.createContext({parametro:()=>null,requestId:'active-request',NA:{db:{buscarRascunho:async()=>{searched++;return {id:'__draft_active-request'};}}},escolherRascunho:async()=>{offered++;return null;}});
 vm.runInContext(creator.slice(begin,end),context);await context.carregarPedidoParaEdicao();assert.equal(searched,1);assert.equal(offered,1);
 assert.match(fs.readFileSync(root+'/public/criar.html','utf8'),/src="js\/core\/db\.js"/,'O criador carrega a implementação de recuperação');
 const resultSource=fs.readFileSync(root+'/public/js/pages/resultado.js','utf8').replace(/\r\n/g,'\n');
 const qrBlock=resultSource.slice(resultSource.indexOf('        try {\n            const canvas'),resultSource.indexOf('        setTimeout(() => celebrar()'));
 const qrElement={textContent:'',replaceChildren(){throw new Error('Não deve gerar QR com biblioteca ausente');}},download={disabled:true};
 const qrContext=vm.createContext({$:id=>id==='qr'?qrElement:download,document:{createElement:()=>({})},url:'http://localhost/ver.html?token=private-test-token'});
 await vm.runInContext('(async()=>{'+qrBlock+'})()',qrContext);assert.match(qrElement.textContent,/Copie o link/);assert.equal(download.disabled,true);assert.ok(!resultSource.includes('api.qrserver.com'));
 const ip=require('../server/lib/http').clientIp;const config=require('../server/config');assert.equal(ip({headers:{'x-forwarded-for':'198.51.100.9'},socket:{remoteAddress:'127.0.0.1'}}),'127.0.0.1');
 config.TRUSTED_PROXIES=['127.0.0.1'];assert.equal(ip({headers:{'x-forwarded-for':'192.0.2.1, 198.51.100.9'},socket:{remoteAddress:'::ffff:127.0.0.1'}}),'198.51.100.9');
 const mailer=require('../server/lib/mailer');config.PUBLIC_ORIGIN='https://nossoamor.example';config.SMTP={host:'smtp.example',port:587,secure:false,user:'test',pass:'test',from:'Site <site@example.test>'};
 let mailOptions,transportOptions;const nodemailer=require('../server/node_modules/nodemailer'),originalTransport=nodemailer.createTransport;
 nodemailer.createTransport=options=>{transportOptions=options;return {sendMail:async options=>{mailOptions=options;}};};
 try {await mailer.sendPasswordReset('test@example.test','a'.repeat(64));}finally{nodemailer.createTransport=originalTransport;}
 assert.equal(transportOptions.requireTLS,true);assert.match(mailOptions.text,/#token=a{64}/);assert.equal(mailOptions.to,'test@example.test');
 assert.deepEqual(hashes(),original,'Banco real preservado');
 console.log('OK: IP não falsificável; reembolso concorrente e recuperação após falha/reinício; sinopse 600; mídia inválida rejeitada e PNG/WAV válidos aceitos; recuperação de senha com expiração/uso único/invalidação de sessões; retomada de rascunho; banco real preservado.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await stop();assert.deepEqual(hashes(),original);if(path.resolve(tmp).startsWith(path.resolve(os.tmpdir())+path.sep))fs.rmSync(tmp,{recursive:true,force:true});});
