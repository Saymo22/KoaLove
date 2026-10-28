const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=async()=>{
  function setup(returned=false,configured=true,manual=false){
    const elements=new Map(),timers=[],methods=[],calls=[];let assigned=null,boot,status='pending';
    function element(){return {textContent:'',value:'',style:{},dataset:{},listeners:{},disabled:false,classList:{add(){},remove(){},toggle(){}},addEventListener(t,fn){this.listeners[t]=fn;},appendChild(){},remove(){},focus(){},querySelector(){return element();},getBoundingClientRect(){return{width:100,height:40,left:0,top:0};}};}
    const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
    get('total').textContent='R$ 19,90';
    for(const method of ['pix','card']){const m=element();m.dataset.metodo=method;methods.push(m);}
    const checkout={status:'pending',method:'pix',coupon:null,amount_cents:1990,url:'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=fixture',...(manual?{provider:'pix_manual',pix:{name:'RECEBEDOR TESTE',key:'fixture@example.test',city:'SAO PAULO',txid:'syntheticreference',payload:'synthetic-pix-payload'}}:{})};
    const purchase=()=>({id:'p_fixture',tema:'namoro',para:'Fixture',content_version:1,price_cents:1990,fotos:['fixture'],videos:[],status,...(returned?{checkout}: {})});
    const scope=vm.createContext({window:{addEventListener(){},APP_CONFIG:{PAYMENTS:{configured}},ApiPurchases:{quote:async()=>({quote:{base_price_cents:1990,amount_cents:1990,discount_percent:0,coupon:null}}),getOne:async()=>({purchase:purchase()}),pay:async(id,method,coupon,expected)=>{calls.push({id,method,coupon,expected});return{purchase:purchase(),checkout};}}},document:{getElementById:get,querySelectorAll:()=>methods,createElement:element,documentElement:{},body:{appendChild(){throw Error('Pending checkout must not celebrate approval');}}},NA_CONFIG_READY:{then(fn){boot=fn;}},CONFIG:{preco:19.9,modoTeste:false,coupons:{}},THEMES:{namoro:{nome:'Namoro'}},parametro:k=>k==='id'?'p_fixture':k==='retorno'&&returned?'1':null,buscarPedido:async()=>null,aplicarTema(){},formatarPreco:v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),performance:{now:()=>0},requestAnimationFrame:fn=>fn(1000),setTimeout:(fn,delay)=>timers.push({fn,delay}),location:{assign(url){assigned=url;}},URL,console});
    scope.window.APP_CONFIG.PAYMENTS.provider=manual?'pix_manual':'mercadopago';
    scope.NAQRCode={toCanvas:async(canvas,payload)=>{assert.equal(payload,'synthetic-pix-payload');canvas.setAttribute=()=>{};get('pixQr').replaceChildren=()=>{};}};
    scope.navigator={clipboard:{writeText:async value=>{get('copied').value=value;}}};
    vm.runInContext(fs.readFileSync('resources/js/pages/pagamento.js','utf8'),scope);
    return{scope,get,methods,timers,calls,boot:()=>boot(),assigned:()=>assigned,setStatus:v=>{status=v;}};
  }
  const s=setup();await s.boot();assert.equal(s.get('btnPagar').disabled,false);
  s.methods[1].listeners.click();await s.get('btnPagar').listeners.click({clientX:0,clientY:0});
  assert.equal(s.calls[0].method,'card');assert.equal(s.calls[0].expected,1990);assert.match(s.assigned(),/^https:\/\/www\.mercadopago\.com\.br\//);
  assert(!s.get('btnPagarTxt').textContent.includes('aprovado'));
  const r=setup(true);await r.boot();await new Promise(setImmediate);
  assert.equal(r.scope.location.href,undefined);assert.match(r.get('erro').textContent,/Aguardando/);
  r.setStatus('paid');await r.timers.find(t=>t.delay===5000).fn();assert.equal(r.scope.location.href,'/resultado?id=p_fixture');
  const unavailable=setup(false,false);await unavailable.boot();assert.equal(unavailable.get('btnPagar').disabled,true);
  const manual=setup(false,true,true);await manual.boot();
  assert.equal(manual.methods[1].hidden,true);
  await manual.get('btnPagar').listeners.click({clientX:0,clientY:0});
  assert.equal(manual.get('pixManual').hidden,false);
  assert.equal(manual.get('pixPayload').value,'synthetic-pix-payload');
  assert.equal(manual.assigned(),null);assert.equal(manual.scope.location.href,undefined);
  await manual.get('pixCopy').listeners.click();assert.equal(manual.get('copied').value,'synthetic-pix-payload');
  await manual.get('btnPagar').listeners.click();assert.equal(manual.scope.location.href,undefined);
  manual.setStatus('paid');await manual.get('btnPagar').listeners.click();
  assert.equal(manual.scope.location.href,'/resultado?id=p_fixture');
};
