const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function loadLimits(pricing){
  const window={};
  if(pricing!==undefined)window.NA_PRICING=pricing;
  const scope=vm.createContext({window});
  vm.runInContext(fs.readFileSync('resources/js/core/plan-limits.js','utf8'),scope);
  return window.NAPlanLimits;
}
const PLAN={photos_limit:12,videos_limit:4,music_limit:1};

test('NAPlanLimits normaliza cotas do plano e do catálogo sem valores fixos',()=>{
  const limits=loadLimits();
  assert.deepEqual({...limits.fromPlan(PLAN)},{photos:12,videos:4,music:1});
  assert.deepEqual({...limits.fromPlan({photos_limit:'3',videos_limit:'0',music_limit:'2'})},{photos:3,videos:0,music:2});
  assert.equal(limits.fromPlan(null),null);
  assert.equal(limits.fromPlan({photographs:1}),null,'Plano sem os três limites não deve ser usado');
  assert.equal(loadLimits().fromConfig(),null,'Sem /api/config a página deve pedir recarga');
  const normalized=loadLimits({limits:{min:{photos:1,videos:0,music:0},max:{photos:12,videos:4,music:1},defaults:{photos_limit:12,videos_limit:4,music_limit:1}}}).fromConfig();
  assert.deepEqual({...normalized.max},{photos:12,videos:4,music:1});
  assert.deepEqual({...normalized.min},{photos:1,videos:0,music:0});
  assert.deepEqual({...normalized.defaults},{photos:12,videos:4,music:1});
});

test('NAPlanLimits resume, orienta e mensagens com singular e plural corretos',()=>{
  const limits=loadLimits();
  assert.equal(limits.summary({photos_limit:1,videos_limit:1,music_limit:1}),'1 foto, 1 vídeo e 1 música');
  assert.equal(limits.summary(PLAN),'12 fotos, 4 vídeos e 1 música');
  assert.equal(limits.summary({photos_limit:2,videos_limit:0,music_limit:0}),'2 fotos e 0 vídeos (sem música)');
  assert.equal(limits.summary(null),null);
  assert.equal(limits.hint(PLAN).videos,'Até 4 vídeos · opcionais');
  assert.equal(limits.hint({photos_limit:1,videos_limit:1,music_limit:1}).videos,'1 vídeo · opcional');
  assert.match(limits.hint({photos_limit:1,videos_limit:0,music_limit:0}).videos,/não estão incluídos/);
  assert.equal(limits.limitMessage(PLAN,'photos'),'Máximo de 12 fotos.');
  assert.equal(limits.limitMessage({photos_limit:1,videos_limit:0,music_limit:0},'videos'),'Máximo de 0 vídeos.');
  assert.match(limits.failureMessage(PLAN),/12 fotos, 4 vídeos e 1 música/);
  assert.equal(limits.failureMessage(null),null);
});

test('Criador usa o formato normalizado nos textos, no bloqueio e no rascunho sem truncar',()=>{
  const limits=loadLimits();
  const plan=limits.fromPlan({photos_limit:1,videos_limit:0,music_limit:0});
  assert.equal(limits.summary(plan),'1 foto e 0 vídeos (sem música)');
  assert.equal(limits.hint(plan).fotos,'1 imagem · escolha a capa abaixo');
  assert.equal(limits.limitMessage(plan,'photos'),'Máximo de 1 foto.');
  assert.equal(limits.overLimit(plan,{photos:2,videos:0,music:false}).photos,true);
  const source=fs.readFileSync('resources/js/pages/criar.js','utf8');
  const creator=source.slice(source.indexOf('function creatorPlan(){'),source.indexOf('function currentMediaCounts(){'));
  const capture=source.slice(source.indexOf('function captureDraft(){'),source.indexOf('const MAX_EVENTOS'));
  const window={NAPlanLimits:limits,NA_PRICING:{plans:[{id:'one',photos_limit:1,videos_limit:0,music_limit:0}],default_plan_id:'one'},NACreatorWorkflow:{current:6,profile:()=>({namesOnly:false})}};
  const scope=vm.createContext({window,pedidoAntigo:null,selectedPlanId:'one',draftKey:'fixture',requestId:'fixture-request',pedidoEditandoId:null,tema:'namoro',fotoFiles:['first','second'],photoIds:['first-id','second-id'],videoFiles:[],videoIds:[],musicId:null,
    $:()=>({value:'',checked:false,files:[]}),document:{querySelectorAll:()=>[]},NAGift:{prepare:p=>p}});
  vm.runInContext(creator+'\n'+capture,scope);
  assert.equal(vm.runInContext('window.NAPlanLimits.overLimit(creatorPlan(),{photos:fotoFiles.length}).photos',scope),true);
  assert.equal(vm.runInContext('captureDraft().fotos.length',scope),2,'O rascunho preserva a seleção acima da cota para correção pelo usuário');
});

test('Sincronização reconcilia a seleção antes do primeiro upload e mantém a retentativa',async()=>{
  const calls=[];
  const window={};
  const scope=vm.createContext({window,URL,Blob,crypto:require('node:crypto').webcrypto,location:{origin:'https://fixture.example.test'},ApiPurchases:{
    selectMedia:async(id,body)=>{calls.push({kind:'selection',id,body});},
    upload:async(id,asset)=>{calls.push({kind:'upload',id,asset});},
  },ApiClient:{post:async(path,body)=>{calls.push({kind:'update',path,body});return {purchase:{id:'p_fixture'}};}}});
  vm.runInContext(fs.readFileSync('resources/js/core/gift-sync.js','utf8'),scope);
  const photo=new Blob(['fixture'],{type:'image/png'});
  await window.NAGift.sync({fotos:[photo],photoIds:['photo-fixture-11111111'],videos:[],musica:null},'p_fixture');
  assert.deepEqual(calls.map(c=>c.kind),['selection','upload','update']);
  assert.equal(calls[0].body.photos[0],'photo-fixture-11111111');
  calls.length=0;
  await window.NAGift.sync({fotos:['/api/purchases/p_fixture/media/photo-fixture-11111111'],videos:[],musica:null},'p_fixture');
  assert.deepEqual(calls.map(c=>c.kind),['selection','update']);
  assert.equal(calls[0].body.photos[0],'photo-fixture-11111111');
});

test('Mídias enviadas durante a criação não são retransmitidas na revisão',async()=>{
  const calls=[];
  const window={};
  const scope=vm.createContext({window,URL,Blob,crypto:require('node:crypto').webcrypto,location:{origin:'https://fixture.example.test'},ApiPurchases:{
    selectMedia:async()=>calls.push('selection'),
    upload:async()=>calls.push('upload'),
  },ApiClient:{post:async()=>{calls.push('update');return {purchase:{id:'p_fixture'}};}}});
  vm.runInContext(fs.readFileSync('resources/js/core/gift-sync.js','utf8'),scope);
  const photo=new Blob(['fixture'],{type:'image/png'});
  const draft={fotos:[photo],photoIds:['photo-fixture-11111111'],videos:[],musica:null};
  await window.NAGift.stage(draft,'p_fixture');
  await window.NAGift.sync(draft,'p_fixture');
  assert.deepEqual(calls,['selection','upload','selection','update']);
});

test('NAPlanLimits detecta mídia acima do plano sem apagar dados',()=>{
  const limits=loadLimits();
  assert.equal(limits.overLimit(PLAN,{photos:12,videos:4,music:true}),null);
  assert.deepEqual({...limits.overLimit(PLAN,{photos:13,videos:2,music:false})},{photos:true,videos:false,music:false});
  assert.deepEqual({...limits.overLimit({photos_limit:12,videos_limit:4,music_limit:0},{photos:1,videos:5,music:true})},{photos:false,videos:true,music:true});
  assert.equal(limits.overLimit(null,{photos:1}),null);
});

test('Criar e home usam as cotas dinâmicas e não mantêm textos fixos',()=>{
  const pages=JSON.parse(fs.readFileSync('resources/assets.json','utf8'));
  for(const page of ['criar','home']){
    const scripts=pages[page].scripts;
    const helper=scripts.indexOf('resources/js/core/plan-limits.js');
    assert(helper>scripts.indexOf('resources/js/app.js'),page+': helper deve vir depois de app.js');
    assert(helper>=0,page+': helper deve estar registrado');
  }
  assert(pages.criar.scripts.indexOf('resources/js/core/plan-limits.js')<pages.criar.scripts.indexOf('resources/js/pages/criar.js'));
  assert(pages.home.scripts.indexOf('resources/js/core/plan-limits.js')<pages.home.scripts.indexOf('resources/js/pages/home-pricing.js'));

  const criarView=fs.readFileSync('resources/views/criar.blade.php','utf8');
  for(const id of ['fotosHint','videosHint','musicaHint','erroMedia','mediaHint'])assert.match(criarView,new RegExp('id="'+id+'"'),'Falta #'+id);
  assert.doesNotMatch(criarView,/Até 12|Até 4|Máximo de 12|Máximo de 4/,'A view do criador não deve fixar cotas');

  const criarJs=fs.readFileSync('resources/js/pages/criar.js','utf8');
  assert.doesNotMatch(criarJs,/slice\(0,\s*12\)|slice\(0,\s*4\)/,'Seleção deve ser limitada pelo plano');
  assert.doesNotMatch(criarJs,/photos_limit:\s*12|videos_limit:\s*4|music_limit:\s*1/,'Sem fallback fixo de cotas');
  assert.doesNotMatch(criarJs,/Máximo de 12|Máximo de 4/,'Mensagens devem vir do helper');
  assert.match(criarJs,/pedidoAntigo\?\.plan/,'O snapshot do rascunho deve ser consultado');
  assert.match(criarJs,/NAPlanLimits\?\.overLimit/,'O envio deve validar cotas pelo helper');

  const homeView=fs.readFileSync('resources/views/home.blade.php','utf8');
  assert.doesNotMatch(homeView,/Até 12 fotos|Até 4 vídeos/,'Fallback da home não deve fixar cotas');
  const homePricing=fs.readFileSync('resources/js/pages/home-pricing.js','utf8');
  assert.match(homePricing,/NAPlanLimits\?\.summary/,'Cards da home usam o resumo dinâmico');

  const adminView=fs.readFileSync('resources/views/admin/planos.blade.php','utf8');
  assert.doesNotMatch(adminView,/min="1" max="12"|min="0" max="4"|min="0" max="1"|Fotos \(1 a 12\)|Vídeos \(0 a 4\)/,'Limites do admin vêm da API');
  const adminJs=fs.readFileSync('resources/js/admin/planos.js','utf8');
  assert.match(adminJs,/records\.limits/,'Admin aplica os limites publicados pela API');
  const workspaceJs=fs.readFileSync('resources/js/admin/workspace.js','utf8');
  assert.match(workspaceJs,/db\.limits/,'Modal do workspace aplica os limites da API');
});
