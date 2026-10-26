const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
async function functions(){const {parseAst}=await import('rollup/parseAst');const source=fs.readFileSync('resources/js/admin/workspace.js','utf8'),body=parseAst(source).body[0].expression.callee.body.body;return name=>{const n=body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);return source.slice(n.start,n.end);};}
test('Ações do painel aceitam apenas comandos conhecidos e argumentos literais',async()=>{
  const extract=await functions(),calls=[];const scope=vm.createContext({commands:{openHistory:id=>calls.push(id),setSetting:(k,v)=>calls.push([k,v])},toast(){},Promise});
  vm.runInContext(extract('invoke'),scope);scope.invoke("openHistory('42')");scope.invoke("setSetting('maintenance',false)");
  assert.equal(calls[0],'42');assert.equal(calls[1][0],'maintenance');assert.equal(calls[1][1],false);
  for(const malicious of ["openHistory(fetch('/private'))","__proto__()","openHistory('42');alert('x')","openHistory('x'+document.cookie)"])assert.throws(()=>scope.invoke(malicious));
  assert.equal(calls.length,2);
});
test('Exportação CSV neutraliza fórmulas e preserva aspas e conteúdo',async()=>{
  const extract=await functions();let blob,download;
  const scope=vm.createContext({Blob,URL:{createObjectURL:value=>{blob=value;return 'blob:test';},revokeObjectURL(){}},document:{createElement:()=>({click(){download=this.download;},remove(){}}),body:{appendChild(){}}},setTimeout(){},toast(){}});
  vm.runInContext(extract('downloadCSV'),scope);scope.downloadCSV('clientes.csv',[['Nome','Observação'],['  =HYPERLINK("x")','texto; com "aspas"']]);
  const content=await blob.text();assert.match(content,/'  =HYPERLINK\(""x""\)/);assert.match(content,/"texto; com ""aspas"""/);assert.equal(download,'clientes.csv');
});
test('Visitantes não consultam dados administrativos nem inicializam demonstração',async()=>{
  let called=false;const scope=vm.createContext({protegerRotaAdmin:async()=>false,window:{ApiClient:{get(){called=true;}}}});
  await vm.runInContext(fs.readFileSync('resources/js/admin/workspace.js','utf8'),scope);assert.equal(called,false);
});
test('Células e controles dinâmicos recebem rótulos e suporte ao teclado',async()=>{
  const extract=await functions(),attributes={};const action={setAttribute(k,v){attributes[k]=v;}};
  const scope=vm.createContext({$$:selector=>selector==='[data-command]:not(button)'?[action]:[],document:{}});
  vm.runInContext(extract('labelTables'),scope);scope.labelTables();assert.equal(attributes.role,'button');assert.equal(action.tabIndex,0);
});
