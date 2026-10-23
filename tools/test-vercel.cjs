/* PostgreSQL real embutido (PGlite) e Blob simulado: não usa serviços ou dados reais. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {once}=require('node:events');
process.env.NA_STORAGE='postgres';process.env.DATABASE_URL='postgresql://isolated-test';process.env.BLOB_READ_WRITE_TOKEN='test-only-private-token';
delete process.env.VERCEL;delete process.env.ADMIN_EMAIL;delete process.env.ADMIN_PASS;
const root=path.resolve(__dirname,'..'),hashes=()=>Object.fromEntries(fs.readdirSync(root+'/server/data').filter(n=>n.endsWith('.json')).map(n=>[n,require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/server/data/'+n)).digest('hex')]));
const before=hashes();let server,embedded,pg;const blobs=new Map();
async function main(){
 const {PGlite}=require('../server/node_modules/@electric-sql/pglite');embedded=new PGlite();await embedded.waitReady;
 let queue=Promise.resolve();
 async function acquire(){let unlock;const previous=queue;queue=new Promise(resolve=>unlock=resolve);await previous;return {query:(sql,args)=>embedded.query(sql,args),release:unlock};}
 class TestPool{connect(){return acquire();}async query(sql,args){const c=await acquire();try{return await c.query(sql,args);}finally{c.release();}}async end(){}}
 const pgPath=require.resolve('../server/node_modules/pg');require(pgPath);require.cache[pgPath].exports={Pool:TestPool};
 const blobPath=require.resolve('../server/node_modules/@vercel/blob');require(blobPath);require.cache[blobPath].exports={
  get:async pathname=>{const b=blobs.get(pathname);return b?{statusCode:200,blob:{size:b.bytes.length,contentType:b.mime},stream:new ReadableStream({start(c){c.enqueue(b.bytes);c.close();}})}:null;},
  del:async pathname=>{blobs.delete(pathname);}
 };
 const blobClientPath=require.resolve('../server/node_modules/@vercel/blob/dist/client.cjs');require(blobClientPath);require.cache[blobClientPath].exports={handleUpload:async options=>{const limits=await options.onBeforeGenerateToken(options.body.pathname);assert.equal(limits.allowOverwrite,false);assert.equal(limits.addRandomSuffix,false);return {type:'blob.generate-client-token',clientToken:'test-only',maximumSizeInBytes:limits.maximumSizeInBytes};}};
 const handler=require('../api/handler');server=http.createServer(async(req,res)=>{if(req.headers['x-test-parsed-body']){const parts=[];for await(const chunk of req)parts.push(chunk);req.body=JSON.parse(Buffer.concat(parts).toString());}return handler(req,res);});server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 async function request(route,{cookie,body,status=200,headers={}}={}){const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{...(cookie?{Cookie:cookie}:{}),'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});const v=await r.json();assert.equal(r.status,status,JSON.stringify(v));return {data:v.data,raw:v,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 const cfg=await request('/api/handler?__na_path=config');assert.equal(cfg.data.media_upload,'blob');assert.equal(Object.keys(cfg.data.themes).length,13);
 pg=require('../server/lib/db');
 const user=await request('/api/auth/register',{body:{name:'Teste Vercel',email:'vercel@example.test',password:'test-password'},headers:{'X-Test-Parsed-Body':'1'},status:201}),cookie=user.cookie;
 const other=await request('/api/auth/register',{body:{name:'Outro',email:'other@example.test',password:'test-password'},status:201});
 assert.equal((await request('/api/auth/me',{cookie})).data.user.email,'vercel@example.test');
 const fields={tema:'netflix',titulo:'Presente na nuvem',para:'Pessoa',frase:'a'.repeat(600),themeData:{},client_request_id:'vercel-test-stable-1234'};
 const first=await request('/api/purchases',{cookie,body:fields,status:201}),id=first.data.purchase.id;
 assert.equal((await request('/api/purchases',{cookie,body:fields,status:201})).data.purchase.id,id);
 const asset='vercel-photo-12345678',route='/api/purchases/'+id+'/media/'+asset;
 await request(route+'/prepare',{body:{type:'image/png',size:20},status:401});
 await request(route+'/prepare',{cookie:other.cookie,body:{type:'image/png',size:20},status:403});
 const png=await require('../server/node_modules/sharp')({create:{width:2,height:2,channels:3,background:'#c25a7c'}}).png().toBuffer();
 const intent=(await request(route+'/prepare',{cookie,body:{type:'image/png',size:png.length}})).data;
 const token=await request(route+'/token',{cookie,body:{pathname:intent.pathname}});assert.equal(token.raw.maximumSizeInBytes,png.length);
 await request(route+'/token',{cookie,body:{pathname:'gifts/another/path'},status:403});
 await request(route+'/complete',{cookie,body:{},status:409});
 blobs.set(intent.pathname,{bytes:png,mime:'image/png'});
 await request(route+'/complete',{cookie,body:{}});await request(route+'/complete',{cookie,body:{}});
 assert.equal((await request(route+'/prepare',{cookie,body:{type:'image/png',size:png.length}})).data.complete,true);
 await request('/api/purchases/'+id+'/update',{cookie,body:{...fields,media:{photos:[asset],videos:[],music:null}}});
 const paid=(await request('/api/purchases/'+id+'/pay',{cookie,body:{metodo:'pix'}})).data.purchase;
 const shared=(await request('/api/shared/'+paid.share_token)).data.purchase;assert.equal(shared.uploadIntents,undefined);assert.equal(shared.uploads,undefined);
 const media=await fetch(base+shared.fotos[0],{headers:{Range:'bytes=1-4'}});assert.equal(media.status,206);assert.deepEqual(Buffer.from(await media.arrayBuffer()),png.subarray(1,5));
 const newFields={...fields,client_request_id:'vercel-invalid-asset-12345'},badId=(await request('/api/purchases',{cookie,body:newFields,status:201})).data.purchase.id;
 const badRoute='/api/purchases/'+badId+'/media/invalid-image-123456';const bad=Buffer.from('invalid media bytes');
 const badIntent=(await request(badRoute+'/prepare',{cookie,body:{type:'image/png',size:bad.length}})).data;blobs.set(badIntent.pathname,{bytes:bad,mime:'image/png'});
 await request(badRoute+'/complete',{cookie,body:{},status:415});assert.equal(blobs.has(badIntent.pathname),false);
 // Recarrega o módulo de persistência como uma instância fria; os registros ficam no Postgres.
 const freshPath=require.resolve('../server/lib/postgres-db');delete require.cache[freshPath];const fresh=require(freshPath);
 await fresh.withRequest(async()=>{assert.equal(fresh.stores.users.all().length,2);assert.equal(fresh.stores.purchases.find(p=>p.id===id).status,'paid');});
 await assert.rejects(fresh.withRequest(()=>fresh.transactionAcross(['users','purchases'],rows=>{rows.users.length=0;throw new Error('rollback test');})),/rollback test/);
 await fresh.withRequest(()=>assert.equal(fresh.stores.users.all().length,2));
 for(let i=0;i<6;i++)await request('/api/auth/login',{body:{email:'nobody@example.test',password:'invalid-password'},headers:{'X-Forwarded-For':'192.0.2.'+i},status:i<5?401:429});
 await pg.withRequest(()=>pg.transactionAcross(['refunds','purchases'],rows=>{rows.refunds.push({id:'refund',status:'pending'});rows.purchases.find(p=>p.id===id).status='refunded';}));
 await request('/api/shared/'+paid.share_token,{status:404});
 assert.deepEqual(hashes(),before);
 console.log('OK: função Vercel/rewrites; PostgreSQL embutido, contexto e rollback; persistência entre instâncias; auth; criação idempotente; Blob privado autenticado/validado; Range; rejeição de arquivo inválido; pagamento; limite compartilhado; bloqueio de link reembolsado; banco local preservado.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(server){server.close();server.closeAllConnections();}if(embedded)await embedded.close();assert.deepEqual(hashes(),before);});
