const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const tick = () => new Promise(resolve => setImmediate(resolve));
function element() {
  return {value:'', disabled:false, textContent:'', type:'password', hidden:false, handlers:{}, attributes:{},
    classList:{toggle(){}}, setAttribute(k,v){this.attributes[k]=v;},
    addEventListener(k,v){this.handlers[k]=v;}, focus(){this.focused=true;}};
}
test('Login admin separa mostrar senha, envio, erro e recuperação real', async () => {
  const elements = Object.fromEntries(['togglePassword','senha','loginForm','btnLogin','email','erro','showRecovery','recoveryEmail','loginPane','recoveryPane','recoveryTitle','backToLogin','recoveryForm','recoveryMessage'].map(id=>[id,element()]));
  const recoveryButton=element();elements.recoveryForm.querySelector=()=>recoveryButton;
  elements.email.value=' admin@example.test ';elements.senha.value='synthetic-test-password';
  const sent=[];let loginResult={ok:false,error:'Conta sem permissão.'};
  const context=vm.createContext({document:{getElementById:id=>elements[id]},estaLogadoAdmin:async()=>false,
    fazerLoginAdmin:async(email,password)=>{sent.push({email,password});return loginResult;},
    window:{location:{href:'login.html'},ApiClient:{post:async(path,data)=>{sent.push({path,data});return {message:'Se existir uma conta, enviaremos o link.'};}}}});
  vm.runInContext(fs.readFileSync('resources/js/admin/login.js','utf8'),context);await tick();
  elements.togglePassword.handlers.click();assert.equal(elements.senha.type,'text');assert.equal(elements.togglePassword.attributes['aria-pressed'],'true');
  await elements.loginForm.handlers.submit({preventDefault(){}});
  assert.equal(sent[0].email,'admin@example.test');assert.equal(elements.erro.textContent,'Conta sem permissão.');
  assert.equal(elements.btnLogin.disabled,false);assert.equal(elements.togglePassword.disabled,false);assert.equal(context.window.location.href,'login.html');
  elements.showRecovery.handlers.click();assert.equal(elements.loginPane.hidden,true);assert.equal(elements.recoveryTitle.focused,true);
  await elements.recoveryForm.handlers.submit({preventDefault(){},currentTarget:elements.recoveryForm});
  assert.equal(sent[1].path,'/auth/forgot-password');assert.equal(sent[1].data.email,'admin@example.test');assert.equal(recoveryButton.disabled,false);
  elements.backToLogin.handlers.click();assert.equal(elements.recoveryPane.hidden,true);assert.equal(elements.showRecovery.focused,true);
  loginResult={ok:true};await elements.loginForm.handlers.submit({preventDefault(){}});assert.equal(context.window.location.href,'dashboard.html');
});
test('Identidade administrativa vem da sessão verificada e logout falho não redireciona', async () => {
  let user={name:'Admin autenticado',role:'admin'}, fail=false;
  const context=vm.createContext({window:{location:{href:'dashboard.html'},ApiAuth:{me:async()=>user},ApiClient:{post:async()=>{if(fail)throw Error('offline');},setCachedUser(){}}}});
  vm.runInContext(fs.readFileSync('resources/js/admin/auth.js','utf8'),context);
  assert.equal(await context.estaLogadoAdmin(),true);assert.equal(context.obterAdminAtual().name,'Admin autenticado');
  fail=true;await assert.rejects(context.fazerLogoutAdmin(),/offline/);assert.equal(context.window.location.href,'dashboard.html');
  user={name:'Cliente',role:'user'};assert.equal(await context.estaLogadoAdmin(),false);assert.equal(context.obterAdminAtual(),null);
});
test('Dashboard bloqueia consultas de visitantes e escapa conteúdo das transações', async () => {
  let authorized=false,calls=0;
  const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,{...element(),innerHTML:'',replaceChildren(){}});return elements.get(id);};
  const context=vm.createContext({protegerRotaAdmin:async()=>authorized,renderAdminHeader(){},document:{getElementById:get},
    window:{ApiAdmin:{purchases:async()=>{calls++;return {purchases:[]};},summary:async()=>({kpis:{receita_cents:1990,compras:1,reembolsos_pendentes:0,tickets_abertos:0},recentes:[{titulo:'<img src=x onerror=alert(1)>',cliente_nome:'<script>bad</script>',valor_cents:1990}]})}}});
  const source=fs.readFileSync('resources/js/admin/dashboard.js','utf8');await vm.runInContext(source,context);assert.equal(calls,0);
  authorized=true;await vm.runInContext(source,context);assert.equal(calls,1);
  assert.match(get('recentList').innerHTML,/&lt;img/);assert.doesNotMatch(get('recentList').innerHTML,/<script>|<img/);
  await get('refreshDashboard').handlers.click();assert.equal(calls,2);assert.equal(get('refreshDashboard').disabled,false);
});
