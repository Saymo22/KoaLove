const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
test('As configurações PHPUnit referenciam diretórios com testes existentes',()=>{
  for(const config of ['phpunit.xml','phpunit.pgsql.xml']){
    const suites=fs.readFileSync(config,'utf8').match(/<testsuites>([\s\S]*?)<\/testsuites>/)[1];
    for(const [,directory]of suites.matchAll(/<directory>([^<]+)<\/directory>/g)){
      assert(fs.existsSync(directory),`${config}: diretório ausente ${directory}`);
      assert(fs.readdirSync(directory,{recursive:true}).some(file=>file.endsWith('Test.php')),`${config}: suíte vazia ${directory}`);
    }
  }
});
test('Uploads em nuvem usam a URL temporária sem enviar cookies ou CSRF ao storage',async()=>{
  const calls=[];let request;
  const scope=vm.createContext({window:{APP_CONFIG:{DIRECT_UPLOADS:true},ApiClient:{get(){},post:async(path,body)=>{
    calls.push({path,body});return path.endsWith('/upload-url')?{upload_id:'intent-1',url:'https://storage.example.test/private',headers:{'Content-Type':'video/mp4'}}:{id:'asset',kind:'video'};
  },ApiError:class extends Error{constructor(v){super(v.message);Object.assign(this,v);}}}},fetch:async(url,options)=>{request={url,options};return{ok:true};}});
  vm.runInContext(fs.readFileSync('resources/js/api/purchases.js','utf8'),scope);
  const blob={type:'video/mp4',size:50*1024*1024};const result=await scope.window.ApiPurchases.upload('purchase','asset',blob);
  assert.equal(result.kind,'video');assert.equal(request.url,'https://storage.example.test/private');assert.equal(request.options.credentials,'omit');
  assert.equal(request.options.referrerPolicy,'no-referrer');assert.equal(request.options.body,blob);assert.equal(request.options.headers['X-CSRF-TOKEN'],undefined);
  assert.equal(calls[0].body.bytes,blob.size);assert.equal(calls[1].body.upload_id,'intent-1');assert(calls[1].path.endsWith('/complete-upload'));
});
test('Referências estáveis, coleções exclusivas e reprodução de áudio',require('./exclusive-helpers.cjs'));

test('O limite do provedor impede envio excessivo antes de reservar ou transmitir',async()=>{
  let contacted=false;
  class ApiError extends Error{constructor(v){super(v.message);Object.assign(this,v);}}
  const scope=vm.createContext({window:{APP_CONFIG:{DIRECT_UPLOADS:true,MEDIA_LIMITS:{video:50000000}},ApiClient:{get(){},post(){contacted=true;},ApiError}},fetch:async()=>{contacted=true;}});
  vm.runInContext(fs.readFileSync('resources/js/api/purchases.js','utf8'),scope);
  await assert.rejects(scope.window.ApiPurchases.upload('purchase','asset',{type:'video/mp4',size:50000001}),e=>e.code==='FILE_TOO_LARGE'&&e.message.includes('50 MB'));
  assert.equal(contacted,false);
});

test('Armazenamento indisponível preserva o rascunho e não inicia upload',async()=>{
  let contacted=false;
  class ApiError extends Error{constructor(v){super(v.message);Object.assign(this,v);}}
  const scope=vm.createContext({window:{APP_CONFIG:{MEDIA_STORAGE_CONFIGURED:false},ApiClient:{get(){},post(){contacted=true;},ApiError}},fetch:async()=>{contacted=true;}});
  vm.runInContext(fs.readFileSync('resources/js/api/purchases.js','utf8'),scope);
  await assert.rejects(scope.window.ApiPurchases.upload('purchase','asset',{type:'image/png'}),e=>e.code==='MEDIA_UNAVAILABLE'&&e.message.includes('rascunho'));
  assert.equal(contacted,false);
});
test('Oito etapas do criador e validação de cada etapa',require('./creator-workflow.cjs'));
test('Checkout envia card, redireciona sem aprovar e aguarda confirmação do servidor',require('./payment-flow.cjs'));
test('Salvamento recuperável, retomada de sessão e repetição sem duplicação',require('./creator-saving.cjs'));
test('Todas as páginas e os 13 temas carregam assets separados pelo Vite',()=>{
  const pages=JSON.parse(fs.readFileSync('resources/assets.json'));
  assert.equal(Object.keys(pages).filter(p=>p.startsWith('themes/')).length,13);
  for(const [name,page]of Object.entries(pages)){
    const html=fs.readFileSync('resources/views/'+name+'.blade.php','utf8');
    assert(!/<script\b|<style\b|\sstyle\s*=|\son\w+\s*=/i.test(html),name+' não deve incluir código inline');
    assert(html.includes('@vite('));assert(html.includes('csrf-token'));
    for(const path of [...page.styles,...page.scripts,page.entry])assert(fs.existsSync(path),path);
    const code=page.scripts.map(p=>fs.readFileSync(p,'utf8')).join('\n;\n');new vm.Script(code,{filename:name});
    assert(!/\bon(?:click|load|error|change|submit)\s*=\s*"/i.test(code),name+' deve registrar eventos sem handlers HTML inline');
  }
});
test('O cliente envia CSRF e preserva os erros e limites da API',async()=>{
  let sent,response;const local=new Map();
  const scope=vm.createContext({document:{querySelector:()=>({content:'csrf-value'})},window:{},localStorage:{getItem:k=>local.get(k),setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},fetch:async(url,options)=>{sent={url,options};return response;},Date});
  vm.runInContext(fs.readFileSync('resources/js/api/client.js','utf8'),scope);
  response={ok:true,status:200,headers:{get:()=>null},json:async()=>({ok:true,data:{id:'saved'}})};
  assert.equal((await scope.window.ApiClient.post('/purchases',{tema:'namoro'})).id,'saved');
  assert.equal(sent.options.headers['X-CSRF-TOKEN'],'csrf-value');assert.equal(sent.options.credentials,'include');
  response={ok:false,status:429,headers:{get:()=> '60'},json:async()=>({ok:false,error:{code:'RATE_LIMITED',message:'Aguarde'}})};
  await assert.rejects(scope.window.ApiClient.post('/purchases',{}),e=>e.code==='RATE_LIMITED'&&e.retryAfter===60);
  await assert.rejects(scope.window.ApiClient.post('/purchases',{}),e=>e.code==='CLIENT_RATE_LIMITED');
});
test('Upload usa o corpo binário, sessão e CSRF; falhas são recuperáveis',async()=>{
  let response,sent;class ApiError extends Error{constructor(value){super(value.message);Object.assign(this,value);}}
  const scope=vm.createContext({document:{querySelector:()=>({content:'csrf-value'})},window:{APP_CONFIG:{API_BASE:'/api'},ApiClient:{get(){},post(){},ApiError}},fetch:async(url,options)=>{sent={url,options};if(response instanceof Error)throw response;return response;}});
  vm.runInContext(fs.readFileSync('resources/js/api/purchases.js','utf8'),scope);
  const upload=scope.window.ApiPurchases.upload,blob={type:'image/png'};
  response={ok:true,status:200,json:async()=>({ok:true,data:{id:'asset'}})};
  await upload('a b','c/d',blob);assert.equal(sent.url,'/api/purchases/a%20b/media/c%2Fd');assert.equal(sent.options.body,blob);assert.equal(sent.options.headers['X-CSRF-TOKEN'],'csrf-value');
  response={ok:false,status:419,headers:{get:()=>null},json:async()=>({ok:false,error:{code:'SESSION_EXPIRED',message:'Sessão expirada'}})};
  await assert.rejects(upload('a','b',blob),e=>e.code==='SESSION_EXPIRED');
  response=new Error('offline');await assert.rejects(upload('a','b',blob),e=>e.code==='NETWORK_ERROR');
});
