const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function workflow(){
  const controls=new Map();const node=()=>({value:'',textContent:'',checked:false,style:{},hidden:false,children:[],handlers:{},closest(){return this;},append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},setAttribute(){},addEventListener(name,fn){this.handlers[name]=fn;},querySelector(){return {focus(){}};}});const get=id=>{if(!controls.has(id))controls.set(id,node());return controls.get(id);};
  const buttons=Array.from({length:6},(_,i)=>({dataset:{step:String(i+1)},classList:{toggle(){}},setAttribute(){},removeAttribute(){}}));
  const state={theme:'namoro',plan:{photos:5,videos:1,music:1},photos:1,videos:0,music:false};
  const window={NACreatorState:()=>state};
  const context=vm.createContext({window,formatarPreco:amount=>'R$ '+amount,document:{getElementById:get,createElement:node,querySelector:()=>({textContent:'Etapa',closest(){return this;}}),querySelectorAll:selector=>selector==='.step-item'?buttons:[]}});
  vm.runInContext(fs.readFileSync('resources/js/core/plan-limits.js','utf8'),context);
  vm.runInContext(fs.readFileSync('resources/js/pages/creator-workflow.js','utf8'),context);
  return {api:window.NACreatorWorkflow,get,state,buttons,window};
}
test('Rascunhos antigos retomam a seção equivalente sem perder etapas da versão nova',()=>{
  const {api}=workflow();
  for(const [old,next] of [[1,1],[2,2],[3,3],[4,4],[5,4],[6,4],[7,5],[8,6]])assert.equal(api.restoreStep({step:old}),next);
  for(let step=1;step<=6;step++)assert.equal(api.restoreStep({step,workflowVersion:2}),step);
  assert.equal(api.restoreStep({step:99,workflowVersion:2}),6);
  assert.equal(api.restoreStep({step:-9}),1);
});
test('Conclusão das etapas depende dos campos e cotas, não da posição visitada',()=>{
  const {api,get,state,buttons}=workflow();
  assert.equal(api.stepStatus(2),'pending');get('de').value='Pessoa A';get('para').value='Pessoa B';
  assert.equal(api.stepStatus(2),'complete');assert.equal(api.stepStatus(3),'complete');
  state.photos=6;assert.equal(api.stepStatus(3),'pending');state.photos=5;
  assert.equal(api.stepStatus(4),'pending');get('carta').value='Minha mensagem';assert.equal(api.stepStatus(4),'complete');
  assert.equal(api.stepStatus(5),'optional');state.music=true;assert.equal(api.stepStatus(5),'complete');
  api.updateProgress(4);assert.equal(get('wizardProgressText').textContent,'Etapa 4 de 6 · Etapa');
  assert.equal(buttons[1].dataset.state,'complete');get('para').value='';api.updateProgress();assert.equal(buttons[1].dataset.state,'pending');
});
test('Os 13 temas mantêm perfis e títulos próprios na seção de personalização',()=>{
  const {api,get}=workflow();
  for(const key of ['namoro','casamento','amizade','familia','aniversario','carta-antiga','jardim','scrapbook','netflix','cinema','vinil','spotify','retro']){
    api.configure(key);assert.equal(get('themeSectionTitle').textContent,api.profile(key).content);assert.ok(get('letterHint').textContent);
  }
});
test('Revisão informa o plano, pendências e leva cada atalho à seção correta',()=>{
  const c=workflow();c.state.planId='fixture-plan';c.window.NA_PRICING={plans:[{id:'fixture-plan',name:'Plano QA',amount_cents:990}]};
  c.api.configure('jardim');let destination;c.window.ir=n=>destination=n;c.api.review();
  const row=label=>c.get('reviewSummary').children.find(node=>node.children[0].children[0].textContent===label);
  assert.match(row('Plano').children[0].children[1].textContent,/Plano QA/);assert.match(c.get('reviewReadiness').textContent,/pendentes/);
  row('Mensagem').children[1].handlers.click();assert.equal(destination,4);assert.equal(c.get('personalMessage').open,true);
  row('Seu tema').children[1].handlers.click();assert.equal(destination,4);assert.equal(c.get('personalTheme').open,true);
  row('Música e abertura').children[1].handlers.click();assert.equal(destination,5);
  c.get('de').value='A';c.get('para').value='B';c.get('carta').value='Uma mensagem';c.api.review();assert.match(c.get('reviewReadiness').textContent,/completos/);
});
function autosave(){
  const source=fs.readFileSync('resources/js/pages/criar.js','utf8');const timers=new Map();let id=0;
  const status={textContent:''},saved=[];
  const context=vm.createContext({$:()=>status,pedidoEditandoId:null,captureDraft:()=>({id:'local-fixture',step:4,workflowVersion:2}),salvarPedido:async snapshot=>saved.push(snapshot),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:token=>timers.delete(token)});
  vm.runInContext(source.slice(source.indexOf('let draftReady='),source.indexOf('const AMOSTRA')),context);
  return {context,status,saved,timers,run:code=>vm.runInContext(code,context),flush:async()=>{for(const [key,fn] of timers){timers.delete(key);fn();}await vm.runInContext('draftQueue',context);}};
}
test('Autosave aguarda a escolha de recuperação e anuncia sucesso e falha sem descartar dados',async()=>{
  const c=autosave();c.run('scheduleDraftSave()');assert.equal(c.timers.size,0);
  c.run('draftReady=true;scheduleDraftSave();scheduleDraftSave()');assert.equal(c.timers.size,1);assert.match(c.status.textContent,/Salvando/);
  await c.flush();assert.equal(c.saved.length,1);assert.equal(c.saved[0].workflowVersion,2);assert.match(c.status.textContent,/salvo neste dispositivo/);
  c.context.salvarPedido=async()=>{throw Error('QuotaExceeded');};c.run('scheduleDraftSave()');await c.flush();assert.match(c.status.textContent,/Não foi possível salvar/);
});
test('Autosave suspenso não recria rascunho depois do envio final',async()=>{
  const c=autosave();c.run('draftReady=true;scheduleDraftSave()');
  await c.run('suspendDraftAutosave()');assert.equal(c.timers.size,0);
  c.run('scheduleDraftSave()');await c.flush();assert.equal(c.saved.length,0);
});
