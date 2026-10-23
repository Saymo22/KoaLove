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
 let uploadCalls=0,cloudRequests=[];
 const cloudBlob={type:'video/mp4',size:20*1024**2};
 const cloud=vm.createContext({window:{APP_CONFIG:{API_BASE:'/api',MEDIA_UPLOAD:'blob'},ApiClient:{get(){},ApiError,post:async(route,body)=>{cloudRequests.push({route,body});return route.endsWith('/prepare')?{pathname:'gifts/owner/video/random'}:{id:'asset'};}},NABlob:{upload:async(path,file,options)=>{uploadCalls++;assert.equal(file,cloudBlob);assert.equal(options.access,'private');assert.equal(options.multipart,true);assert.equal(options.handleUploadUrl,'/api/purchases/owner/media/asset/token');}}}});
 vm.runInContext(source,cloud);assert.equal((await cloud.window.ApiPurchases.upload('owner','asset',cloudBlob)).id,'asset');assert.equal(uploadCalls,1);assert.equal(cloudRequests.length,2);assert.equal(cloudRequests[0].body.size,20*1024**2);
 console.log('OK: URL da API configurável, envio binário, sessão, endpoint ausente, resposta HTML, limite e falha de conexão.');
})().catch(e=>{console.error(e);process.exitCode=1;});
