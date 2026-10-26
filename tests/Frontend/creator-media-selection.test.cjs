const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('resources/js/pages/criar.js','utf8');
function creator(){
  const controls=new Map(),revoked=[];let id=0;
  function element(){return {value:'',textContent:'',hidden:false,files:[],children:[],handlers:{},addEventListener(name,fn){this.handlers[name]=fn;},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=[...nodes];},setAttribute(){},add(node){this.children.push(node);}};}
  const get=key=>{if(!controls.has(key))controls.set(key,element());return controls.get(key);};
  const plans=[{id:'large',name:'Infinity',photos_limit:12,videos_limit:4,music_limit:1,amount_cents:1990},{id:'small',name:'Essencial',photos_limit:5,videos_limit:1,music_limit:1,amount_cents:990}];
  const window={NA_PRICING:{plans,default_plan_id:'large'}};
  const scope=vm.createContext({window,document:{getElementById:get,createElement:element},URLSearchParams,location:{search:'?plano=large'},Option:function(text,value){this.text=text;this.value=value;},formatarPreco:String,
    NAGift:{id:()=>`stable-asset-${++id}`},mediaURL:file=>`blob:${file.name}`,URL:{revokeObjectURL:url=>revoked.push(url)},
    preservePhotoRefs(){},atualizarPainelPersonalizacao(){},atualizarPreview(){},limparErro(){},renderFotosGrid(){}});
  vm.runInContext(fs.readFileSync('resources/js/core/plan-limits.js','utf8'),scope);
  vm.runInContext(source.slice(0,source.indexOf('let musicaPreviewURL = null;'))+'\nlet musicaPreviewURL=null,photoIds=[],videoIds=[],musicId=null;',scope);
  vm.runInContext(source.slice(source.indexOf('$("fotos").addEventListener'),source.indexOf('$("musica").addEventListener')),scope);
  vm.runInContext(source.slice(source.indexOf('function removerFoto(idx)'),source.indexOf('function atualizarPainelPersonalizacao()')),scope);
  vm.runInContext('renderCreatorPlan()',scope);
  const read=code=>vm.runInContext(code,scope);
  const pick=(kind,files)=>{const input=get(kind);input.files=files;input.value='selected';input.handlers.change({target:input});};
  return {scope,get,pick,read,revoked,plans};
}
const photo=i=>({name:`photo-${i}.png`,size:100+i,lastModified:i,type:'image/png'});
const video=i=>({name:`video-${i}.mp4`,size:200+i,lastModified:i,type:'video/mp4'});

test('Adicionar fotos preserva arquivos, IDs, legendas e capa; duplicatas não ocupam cota',()=>{
  const c=creator();c.pick('fotos',[photo(1),photo(2)]);
  c.get('fotoCapa').value=1;c.read('legendasValores[0]="Primeira legenda"');
  const ids=c.read('JSON.stringify(photoIds)');
  c.pick('fotos',[photo(3)]);
  assert.equal(c.read('fotoFiles.length'),3);assert.equal(c.read('photoIds.length'),3);
  assert.equal(c.read('JSON.stringify(photoIds.slice(0,2))'),ids);
  assert.equal(c.read('legendasValores[0]'),'Primeira legenda');assert.equal(c.get('fotoCapa').value,1);
  assert.equal(c.revoked.length,0);assert.equal(c.get('fotos').value,'');
  c.pick('fotos',[photo(3)]);c.pick('fotos',[]);assert.equal(c.read('fotoFiles.length'),3);
  c.read('removerFoto(1)');assert.equal(c.read('fotoFiles.length'),2);assert.equal(c.read('photoIds.length'),2);
  assert.equal(c.get('qtdFotos').textContent,'2 de 12 fotos');assert.deepEqual(c.revoked,['blob:photo-2.png']);
});

test('Adicionar e remover vídeos mantém a coleção acumulada e salva todos no rascunho',()=>{
  const c=creator();c.pick('videos',[video(1)]);c.pick('videos',[video(2)]);
  assert.equal(c.read('videoFiles.length'),2);assert.equal(c.read('videoIds.length'),2);
  assert.equal(c.get('videosGrid').children.length,2);assert.equal(c.get('videos').value,'');
  c.pick('videos',[video(2)]);assert.equal(c.read('videoFiles.length'),2);
  const capture=source.slice(source.indexOf('function captureDraft(){'),source.indexOf('const MAX_EVENTOS'));
  Object.assign(c.scope,{draftKey:'fixture',requestId:'fixture-request',tema:'namoro',document:{...c.scope.document,querySelectorAll:()=>[]}});
  c.scope.window.NACreatorWorkflow={current:3,profile:()=>({namesOnly:false})};c.scope.NAGift.prepare=p=>p;
  vm.runInContext(capture,c.scope);assert.equal(c.read('captureDraft().videos.length'),2);
  c.read('removerVideo(0)');assert.equal(c.read('videoFiles.length'),1);
  assert.equal(c.read('videoFiles[0].name'),'video-2.mp4');assert.equal(c.get('videosGrid').children.length,1);
  assert.deepEqual(c.revoked,['blob:video-1.mp4']);assert.equal(c.read('captureDraft().videos.length'),1);
});

test('Troca para plano menor é recusada até reduzir fotos e vídeos, sem apagar seleção',()=>{
  const c=creator();c.pick('fotos',Array.from({length:12},(_,i)=>photo(i)));c.pick('videos',Array.from({length:4},(_,i)=>video(i)));
  const select=c.get('creatorPlan');select.value='small';select.handlers.change({target:select});
  assert.equal(c.read('selectedPlanId'),'large');assert.equal(select.value,'large');assert.equal(c.read('fotoFiles.length'),12);assert.equal(c.read('videoFiles.length'),4);
  assert.equal(c.get('creatorPlanError').hidden,false);assert.match(c.get('creatorPlanError').textContent,/5 fotos, 1 vídeo/);
  for(let i=11;i>=5;i--)c.read(`removerFoto(${i})`);
  for(let i=3;i>=1;i--)c.read(`removerVideo(${i})`);
  select.value='small';select.handlers.change({target:select});
  assert.equal(c.read('selectedPlanId'),'small');assert.equal(c.get('qtdFotos').textContent,'5 de 5 fotos');assert.equal(c.get('qtdVideos').textContent,'1 de 1 vídeo');
  c.pick('fotos',[photo(99)]);c.pick('videos',[video(99)]);
  assert.equal(c.read('fotoFiles.length'),5);assert.equal(c.read('videoFiles.length'),1);assert.match(c.get('erroMedia').textContent,/no máximo 0/);
  c.read('pedidoEditandoId="saved-purchase"');select.value='large';select.handlers.change({target:select});
  assert.equal(c.read('selectedPlanId'),'small');assert.match(c.get('creatorPlanError').textContent,/já foi salvo/);
});

test('Plano destacado ocupa a posição central sem alterar a ordem do catálogo original',()=>{
  for(const featured of [0,1,2]){
    const controls=new Map();const element=()=>({children:[],hidden:false,append(...items){this.children.push(...items);},replaceChildren(...items){this.children=[...items];}});
    const get=id=>{if(!controls.has(id))controls.set(id,element());return controls.get(id);};
    const plans=[0,1,2].map(i=>({id:String(i),name:`Plan ${i}`,featured:i===featured,price_cents:990+i*500,amount_cents:990+i*500,features:[]}));
    const scope=vm.createContext({document:{getElementById:get,createElement:element,createTextNode:text=>({textContent:text})},window:{addEventListener(){}},formatarPreco:String,NA_CONFIG_READY:{then:fn=>fn({plans,default_plan_id:String(featured)})},setInterval(){}});
    vm.runInContext(fs.readFileSync('resources/js/pages/home-pricing.js','utf8'),scope);
    const cards=get('pricingCards').children;assert.equal(cards.length,3);
    assert.equal(cards[1].children.find(n=>n.className==='preco-badge').textContent,'Mais escolhido');
    assert.deepEqual(plans.map(p=>p.id),['0','1','2']);
  }
});
