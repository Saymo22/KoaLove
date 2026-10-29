/* Integração HTTP real e descartável; nunca aceita banco de uso. */
const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),fs=require('node:fs');
if(process.env.HTTP_TEST_ALLOW!=='1'||!process.env.DB_DATABASE?.endsWith('_test'))throw Error('Defina HTTP_TEST_ALLOW=1 e DB_DATABASE com sufixo _test.');
const php=process.env.PHP_BINARY||'php',port=process.env.HTTP_TEST_PORT||'8091',base='http://127.0.0.1:'+port;
// APP_ENV local mantém CSRF ativo; APP_ENV testing desabilitaria a proteção no framework.
const server=spawn(php,['artisan','serve','--host=127.0.0.1','--port='+port,'--no-reload'],{env:{...process.env,APP_ENV:'local',APP_URL:base,APP_DEBUG:'false',SESSION_SECURE_COOKIE:'false',SIMULATED_PAYMENTS:'true'},stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
let cookieJar=new Map(),csrf='',failed=false,logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function request(path,body,options={}){
 const headers={Accept:'application/json',Cookie:[...cookieJar].map(([k,v])=>k+'='+v).join('; '),...options.headers};
 if(body!==undefined){headers['Content-Type']??='application/json';if(options.csrf!==false)headers['X-CSRF-TOKEN']=csrf;}
 const res=await fetch(base+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:Buffer.isBuffer(body)?body:JSON.stringify(body),redirect:'manual'});
 for(const cookie of res.headers.getSetCookie()){const first=cookie.split(';')[0],at=first.indexOf('=');cookieJar.set(first.slice(0,at),first.slice(at+1));}return res;
}
async function page(){const res=await request('/entrar');assert.equal(res.status,200);csrf=(await res.text()).match(/name="csrf-token" content="([^"]+)"/)[1];}
(async()=>{
 try{
  let ready=false;for(let i=0;i<80;i++){try{await fetch(base+'/up');ready=true;break;}catch{await pause(100);}}assert(ready,'Servidor não iniciou: '+logs);
  const legacy=await request('/login.html?next=%2Fcriar.html%3Fresume%3Dsynthetic');assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/entrar?next=%2Fcriar.html%3Fresume%3Dsynthetic');
  await page();assert.equal((await request('/api/auth/login',{email:'nobody@example.test',password:'invalid-password'},{csrf:false})).status,419,'POST sem CSRF deve falhar');
  const email='http-'+Date.now()+'@example.test',password='synthetic-password';
  let res=await request('/api/auth/register',{name:'Teste HTTP',email,password});assert.equal(res.status,201,await res.text());await page();
  const body={tema:'netflix',para:'Teste',de:'Fixture',carta:'Memória de teste',themeData:{netflix:{texts:{title:'Nossa série'}}},client_request_id:'http-request-'+Date.now()};
  // Requisições independentes e simultâneas exercitam unicidade e trava transacional.
  const responses=await Promise.all(Array.from({length:4},()=>request('/api/purchases',body)));
  const purchases=[];for(const response of responses){assert.equal(response.status,201);purchases.push((await response.json()).data.purchase);}
  const p=purchases[0];assert(purchases.every(v=>v.id===p.id),'Retry criou compras duplicadas');
  // PNG válido: arquivo sintético versionado, sem dados pessoais.
  const png=fs.readFileSync('tests/Fixtures/pixel.png');
  res=await request('/api/purchases/'+p.id+'/media/asset-http-1234567890',png,{headers:{'Content-Type':'image/png'}});assert.equal(res.status,200,await res.text());
  res=await request('/api/purchases/'+p.id+'/update',{...body,media:{photos:['asset-http-1234567890'],videos:[],music:null}});assert.equal(res.status,200,await res.text());
  res=await request('/api/purchases/'+p.id+'/pay',{metodo:'pix'});assert.equal(res.status,200,await res.text());
  const list=await (await request('/api/purchases')).json();assert.equal(list.data.purchases.filter(v=>v.id===p.id).length,1);
  // Um navegador sem sessão só pode acessar a projeção compartilhada.
  cookieJar=new Map();csrf='';
  res=await request('/api/shared/'+p.share_token);assert.equal(res.status,200);const gift=(await res.json()).data.purchase;assert.equal(gift.themeData.netflix.texts.title,'Nossa série');assert.equal(gift.user_id,undefined);
  assert.equal((await request('/api/purchases/'+p.id)).status,401);
  res=await request(gift.fotos[0],undefined,{headers:{Range:'bytes=0-7'}});assert.equal(res.status,206);assert.equal(Buffer.from(await res.arrayBuffer()).toString('hex'),'89504e470d0a1a0a');
  console.log('OK: CSRF real, cookies, cadastro, criação concorrente, upload, finalização, pagamento simulado, compartilhamento e Range.');
 }catch(error){failed=true;console.error(error.message);}
 finally{if(process.platform==='win32'){const cp=require('node:child_process');cp.spawnSync('taskkill',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore'});}else {try{process.kill(-server.pid,'SIGTERM');}catch{server.kill();}}server.stdout.destroy();server.stderr.destroy();process.exitCode=failed?1:0;}
})();
