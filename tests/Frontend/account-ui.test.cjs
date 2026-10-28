const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
async function recoveryScope(){
 const {parseAst}=await import('rollup/parseAst');const source=fs.readFileSync('resources/js/pages/login.js','utf8'),ast=parseAst(source);
 const callback=ast.body.find(n=>n.type==='ExpressionStatement'&&n.expression.arguments?.[0]?.value==='DOMContentLoaded').expression.arguments[1];
 const funcs=['setMode','handleRecovery'].map(name=>{const n=callback.body.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);return source.slice(n.start,n.end);}).join('\n');
 const item=()=>({value:'',disabled:false,hidden:false,required:false,attributes:{},dataset:{},textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attributes[k]=v;},querySelector(){return this.label||={textContent:''};},checkValidity(){return true;},reportValidity(){}});
 const names=['tabs','fieldName','inputName','fieldPass','inputPass','fieldEmail','inputEmail','fieldConfirm','confirmPass','forgot','back','titleEl','subEl','sealText','peekBtn','btn','erroEl'];const scope=Object.fromEntries(names.map(n=>[n,item()]));
 Object.assign(scope,{mode:'login',tabBtns:[{...item(),dataset:{mode:'login'}},{...item(),dataset:{mode:'register'}}],loginRecovery:{token:'synthetic-reset-token',email:'fixture@example.test'},$:()=>scope.alternateLogin,alternateLogin:item(),clearError(){scope.feedback='';},showError(t){scope.feedback=t;},ApiClient:{post:async(path,body)=>{scope.sent={path,body};return {message:'Solicitação recebida.'};}}});
 const context=vm.createContext(scope);vm.runInContext(funcs,context);return context;
}
test('Recuperação reutiliza o card e envia somente o e-mail sem exigir senha',async()=>{
 const s=await recoveryScope();s.inputEmail.value=' fixture@example.test ';s.setMode('recovery');assert.equal(s.fieldPass.hidden,true);assert.equal(s.inputPass.disabled,true);assert.equal(s.fieldConfirm.hidden,true);assert.equal(s.alternateLogin.hidden,true);
 await s.handleRecovery();assert.equal(s.sent.path,'/auth/forgot-password');assert.equal(s.sent.body.email,'fixture@example.test');assert.equal(Object.hasOwn(s.sent.body,'password'),false);assert.equal(s.btn.disabled,false);assert.equal(s.feedback,'Solicitação recebida.');
 s.setMode('login');assert.equal(s.inputPass.disabled,false);assert.equal(s.fieldEmail.hidden,false);assert.equal(s.alternateLogin.hidden,false);
});
test('Nova senha exige confirmação e só troca o modo após resposta real',async()=>{
 const s=await recoveryScope();s.setMode('reset');assert.equal(s.fieldEmail.hidden,true);s.inputPass.value='synthetic-new-password';s.confirmPass.value='different';await s.handleRecovery();assert.equal(s.sent,undefined);
 s.confirmPass.value=s.inputPass.value;await s.handleRecovery();assert.equal(s.sent.path,'/auth/reset-password');assert.equal(s.sent.body.token,'synthetic-reset-token');assert.equal(s.sent.body.email,'fixture@example.test');assert.equal(s.mode,'login');assert.equal(s.inputPass.value,'');assert.equal(s.loginRecovery.token,null);
});
test('Falha de recuperação não simula sucesso e libera nova tentativa',async()=>{
 const s=await recoveryScope();s.setMode('recovery');s.inputEmail.value='fixture@example.test';s.ApiClient.post=async()=>{throw Error('Serviço indisponível.');};await s.handleRecovery();assert.equal(s.feedback,'Serviço indisponível.');assert.equal(s.btn.disabled,false);assert.equal(s.mode,'recovery');
});
test('Chat fica fora do visualizador e dos treze temas, inclusive em iframe',async()=>{
 const {chatAllowed}=await import('../../resources/js/chat/page-policy.js');const pages=Object.values(JSON.parse(fs.readFileSync('resources/assets.json','utf8'))).filter(p=>p.url.startsWith('/temas/'));
 assert.equal(pages.length,13);for(const page of pages)assert.equal(chatAllowed(page.url),false,page.url);assert.equal(chatAllowed('/presente'),false);assert.equal(chatAllowed('/minha-conta'),true);assert.equal(chatAllowed('/criar-presente'),true);assert.equal(chatAllowed('/entrar'),true);assert.equal(chatAllowed('/',true),false);
});
