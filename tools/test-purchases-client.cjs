const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../public/js/api/purchases.js'),'utf8');
(async()=>{
 let response,request;
 class ApiError extends Error {constructor(value){super(value.message);Object.assign(this,value);}}
 const scope=vm.createContext({window:{APP_CONFIG:{API_BASE:'/custom-api/'},ApiClient:{get(){},post(){},ApiError}},fetch:async(url,options)=>{request={url,options};if(response instanceof Error)throw response;return response;}});
 vm.runInContext(source,scope);const upload=scope.window.ApiPurchases.upload;
 response={ok:true,status:200,json:async()=>({ok:true,data:{id:'file'}})};
 const blob={type:'image/png'};assert.equal((await upload('purchase id','file/id',blob)).id,'file');
 assert.equal(request.url,'/custom-api/purchases/purchase%20id/media/file%2Fid');assert.equal(request.options.body,blob);assert.equal(request.options.credentials,'include');
 response={ok:false,status:404,headers:{get:()=>null},json:async()=>({ok:false,error:{code:'ENDPOINT_NOT_FOUND',message:'Endpoint não existe'}})};
 await assert.rejects(upload('id','asset',blob),e=>e.code==='ENDPOINT_NOT_FOUND'&&/Reinicie/.test(e.message));
 response={ok:false,status:404,headers:{get:()=>null},json:async()=>{throw new SyntaxError('HTML');}};
 await assert.rejects(upload('id','asset',blob),e=>e.code==='INVALID_UPLOAD_RESPONSE'&&e.status===404);
 response={ok:false,status:429,headers:{get:()=> '60'},json:async()=>({ok:false,error:{code:'RATE_LIMITED',message:'Aguarde'}})};
 await assert.rejects(upload('id','asset',blob),e=>e.code==='RATE_LIMITED'&&e.retryAfter===60);
 response=new Error('Conexão encerrada');await assert.rejects(upload('id','asset',blob),e=>e.code==='NETWORK_ERROR');
 console.log('OK: URL da API configurável, envio binário, sessão, endpoint ausente, resposta HTML, limite e falha de conexão.');
})().catch(e=>{console.error(e);process.exitCode=1;});
