const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=async()=>{
 const login=fs.readFileSync(path.join(__dirname,'../public/js/pages/login.js'),'utf8');
 const scope=vm.createContext({location:{href:'https://example.test/login.html',origin:'https://example.test',search:'?next='+encodeURIComponent('criar.html?resume=stable-request')},URL,URLSearchParams});
 vm.runInContext(login.slice(0,login.indexOf('document.addEventListener')),scope);
 assert.equal(vm.runInContext('destinoAposLogin()',scope),'/criar.html?resume=stable-request');
 for(const next of ['https://outside.test/','//outside.test/','javascript:alert(1)','/admin/login.html']){scope.location.search='?next='+encodeURIComponent(next);assert.equal(vm.runInContext('destinoAposLogin()',scope),'minha-conta.html');}
 const source=fs.readFileSync(path.join(__dirname,'../public/js/pages/criar.js'),'utf8');
 const submit=source.slice(source.indexOf('$("form").addEventListener("submit"'),source.indexOf('function abrirPrevia'));
 let saveHandler,creates=0,syncs=0;const controls={btnFinal:{},erroMedia:{}};
 const draft={id:'__draft_stable',client_request_id:'stable-request',fotos:[{name:'test.png'}],photoIds:['stable-photo'],videoIds:[],musicId:null,tema:'namoro'};
 const context=vm.createContext({
  $:id=>id==='form'?{addEventListener:(_name,fn)=>saveHandler=fn}:controls[id],
  window:{NACreatorWorkflow:{current:8}},validar:()=>true,ir:()=>{},captureDraft:()=>({...draft}),photoIds:[],videoIds:[],musicId:null,
  pedidoEditandoId:null,requestId:'stable-request',draftKey:'__draft_stable',location:{href:''},
  salvarPedido:async()=>{throw new Error('QuotaExceeded');},excluirPedidoDB:async()=>{},gerarPreviewThumb:async()=>null,sessionStorage:{removeItem(){}},
  ApiPurchases:{create:async()=>{creates++;return {purchase:{id:'same-purchase'}};}},
  NAGift:{sync:async()=>{syncs++;if(syncs===1)throw new Error('Conexão interrompida no envio');return{purchase:{id:'same-purchase'}};}}
 });
 vm.runInContext(submit,context);await saveHandler({preventDefault(){}});assert.equal(controls.erroMedia.textContent,'Conexão interrompida no envio');
 await saveHandler({preventDefault(){}});assert.equal(creates,1,'Retry atualiza o pedido criado');assert.equal(syncs,2);assert.equal(context.location.href,'pagamento.html?id=same-purchase','Falha no cache não impede salvamento confirmado');
 context.pedidoEditandoId=null;context.location.href='';let preserved;
 context.salvarPedido=async p=>{preserved=p;};context.ApiPurchases.create=async()=>{throw Object.assign(new Error('Sessão expirada'),{status:401});};
 await saveHandler({preventDefault(){}});assert.equal(preserved.fotos[0].name,'test.png');assert.equal(context.location.href,'login.html?next='+encodeURIComponent('criar.html?resume=stable-request'));
 context.location.href='';context.salvarPedido=async()=>{throw new Error('QuotaExceeded');};
 await saveHandler({preventDefault(){}});assert.equal(context.location.href,'','Sem cópia recuperável, não redireciona e não descarta arquivos');
};
if(require.main===module)module.exports().then(()=>console.log('OK: retorno seguro do login, rascunho com arquivo, retry sem duplicação e cache opcional.')).catch(e=>{console.error(e);process.exitCode=1;});
