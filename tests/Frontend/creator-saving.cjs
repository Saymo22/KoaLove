const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=async()=>{
 const login=fs.readFileSync(path.join(__dirname,'../../resources/js/pages/login.js'),'utf8');
 const scope=vm.createContext({location:{href:'https://example.test/entrar',origin:'https://example.test',search:'?next='+encodeURIComponent('/criar-presente?resume=stable-request')},URL,URLSearchParams});
 vm.runInContext(login.slice(0,login.indexOf('document.addEventListener')),scope);
 assert.equal(vm.runInContext('destinoAposLogin()',scope),'/criar-presente?resume=stable-request');
 for(const next of ['https://outside.test/','//outside.test/','javascript:alert(1)','/admin/entrar','/criar.html']){scope.location.search='?next='+encodeURIComponent(next);assert.equal(vm.runInContext('destinoAposLogin()',scope),'/minha-conta');}
 const source=fs.readFileSync(path.join(__dirname,'../../resources/js/pages/criar.js'),'utf8');
 const submit=source.slice(source.indexOf('$("form").addEventListener("submit"'),source.indexOf('function abrirPrevia'));
 let saveHandler,creates=0,syncs=0;const controls={btnFinal:{},erroMedia:{},erro3:{},draftSaveStatus:{}};
 const draft={id:'__draft_stable',client_request_id:'stable-request',videos:[],fotos:[{name:'test.png'}],photoIds:['stable-photo'],videoIds:[],musicId:null,tema:'namoro'};
 const context=vm.createContext({
  $:id=>id==='form'?{addEventListener:(_name,fn)=>saveHandler=fn}:controls[id],
  window:{NACreatorWorkflow:{current:6}},validar:()=>true,ir:()=>{},renderCreatorPlan(){},suspendDraftAutosave:async()=>{},draftSuspended:false,creatorPlan:()=>({photos_limit:12,videos_limit:4,music_limit:1}),captureDraft:()=>({...draft}),photoIds:[],videoIds:[],musicId:null,
  pedidoEditandoId:null,pedidoAntigo:null,requestId:'stable-request',draftKey:'__draft_stable',location:{href:''},
  salvarPedido:async()=>{throw new Error('QuotaExceeded');},excluirPedidoDB:async()=>{},gerarPreviewThumb:async()=>null,sessionStorage:{removeItem(){}},
  ApiPurchases:{create:async()=>{creates++;return {purchase:{id:'same-purchase'}};}},
  NAGift:{sync:async()=>{syncs++;if(syncs===1)throw new Error('Conexão interrompida no envio');return{purchase:{id:'same-purchase'}};}}
 });
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../../resources/js/core/plan-limits.js'),'utf8'),context);
 vm.runInContext(submit,context);await saveHandler({preventDefault(){}});assert.equal(controls.erroMedia.textContent,'Conexão interrompida no envio');
 await saveHandler({preventDefault(){}});assert.equal(creates,1,'Retry atualiza o pedido criado');assert.equal(syncs,2);assert.equal(context.location.href,'/pagamento?id=same-purchase','Falha no cache não impede salvamento confirmado');
 context.pedidoEditandoId=null;context.location.href='';let preserved;
 context.salvarPedido=async p=>{preserved=p;};context.ApiPurchases.create=async()=>{throw Object.assign(new Error('Sessão expirada'),{status:401});};
 await saveHandler({preventDefault(){}});assert.equal(preserved.fotos[0].name,'test.png');assert.equal(context.location.href,'/entrar?next='+encodeURIComponent('/criar-presente?resume=stable-request'));
 context.location.href='';context.salvarPedido=async()=>{throw new Error('QuotaExceeded');};
 await saveHandler({preventDefault(){}});assert.equal(context.location.href,'','Sem cópia recuperável, não redireciona e não descarta arquivos');
 context.creatorPlan=()=>({photos:1,videos:0,music:0});context.fotoFiles=[{name:'one.png'},{name:'two.png'}];
 let attempted=false;context.salvarPedido=async()=>{attempted=true;};
 await saveHandler({preventDefault(){}});
 assert.equal(attempted,false,'Seleção acima da cota não inicia persistência nem upload');
 assert.match(controls.erroMedia.textContent,/ultrapassam/);
 assert.equal(context.fotoFiles.length,2,'Bloqueio preserva arquivos para ajuste');
};
if(require.main===module)module.exports().then(()=>console.log('OK: retorno seguro do login, rascunho com arquivo, retry sem duplicação e cache opcional.')).catch(e=>{console.error(e);process.exitCode=1;});
