const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
test('Referências estáveis, coleções exclusivas e reprodução de áudio',require('./exclusive-helpers.cjs'));
test('Oito etapas do criador e validação de cada etapa',require('./creator-workflow.cjs'));
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
