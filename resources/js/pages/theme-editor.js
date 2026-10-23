/* Editor por seção: rascunhos independentes e campos ligados ao modelo real. */
window.NAThemeEditor = (() => {
  'use strict';
  let data={},active=null,photos=[],selection='',fieldId=0,events=[],photoIds=[];
  const schemas=new Map(),positions=new Map();
  const host=document.getElementById('themeDetails');
  const clone=value=>JSON.parse(JSON.stringify(value));
  const labels={time:'Quando aparece a notificação',text:'Texto',message:'Mensagem',subtitle:'Subtítulo',q:'Pergunta',opts:'Alternativas',correct:'Alternativa correta',name:'Nome',role:'Parentesco / papel',years:'Datas / período',photo:'Foto',bio:'Sobre essa pessoa',title:'Título',date:'Data / época',body:'Mensagem',signature:'Assinatura',label:'Lembrança',x:'Posição horizontal (%)',y:'Posição vertical (%)',desc:'Descrição',synopsis:'Sinopse',genre:'Gênero',year:'Ano / época',rating:'Classificação / nota',duration:'Duração exibida',dur:'Duração exibida',match:'Relevância (%)',episodes:'Quantidade de episódios',isOriginal:'Selo de original',isNew:'Marcar como novidade',categories:'Seções do catálogo',poster:'Cartaz',backdrop:'Imagem de fundo',cover:'Capa',thumb:'Miniatura',img:'Foto',artist:'Artista',album:'Álbum',plays:'Reproduções exibidas',badge:'Selo',tag:'Destaque',director:'Direção',meta:'Data / local / detalhes',tracks:'Faixas',audio:'Áudio próprio da faixa (URL opcional)',progress:'Progresso exibido (0 a 1)'};
  const mediaKeys=['photo','poster','backdrop','cover','thumb','img'];
  const draft=()=>{const d=data[active]||={};d.texts||={};d.collections||={};d.checks||={};d.numbers||={};return d;};
  function changed(){document.getElementById('form').dispatchEvent(new Event('input',{bubbles:true}));}
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function button(text,action,className='editor-button'){const b=el('button',className,text);b.type='button';b.addEventListener('click',action);return b;}
  function field(parent,label,value,update,key=''){
    const wrap=el('label','campo theme-field'),caption=el('span','',label);
    let input;
    if(key==='correct'||key==='category'){
      input=el('select');const options=key==='correct'?{'0':'1ª alternativa','1':'2ª alternativa','2':'3ª alternativa','3':'4ª alternativa'}:{originals:'Originais',trending:'Em destaque',top10:'Top 10',continue:'Continuar assistindo',romance:'Romance',comedy:'Comédia',adventure:'Aventura',docs:'Documentários'};
      for(const [val,text] of Object.entries(options)){const opt=el('option','',text);opt.value=val;input.append(opt);}
    }else input=el(typeof value==='string'&&(value.length>90||value.includes('\n')||['q','bio','body','desc','synopsis'].includes(key))?'textarea':'input');
    if(input.tagName==='INPUT')input.type=typeof value==='boolean'?'checkbox':typeof value==='number'?'number':key==='audio'?'url':'text';
    input.value=value??'';input.maxLength=4000;input.setAttribute('aria-label',label);
    if(typeof value==='boolean')input.checked=value;
    if(typeof value==='number'&&key!=='correct'){input.step=['x','y','progress'].includes(key)?'any':'1';input.min=key==='gameSeconds'?'5':'0';input.max=key==='gameSeconds'?'120':['x','y','match'].includes(key)?'100':key==='progress'?'1':'1000000000';}
    input.addEventListener('input',()=>{let next=typeof value==='boolean'?input.checked:typeof value==='number'?Number(input.value)||0:input.value;if(typeof value==='number'&&input.tagName==='INPUT')next=Math.max(Number(input.min),Math.min(Number(input.max),next));update(next);changed();});
    wrap.append(caption,input);parent.append(wrap);return input;
  }
  function photoField(parent,label,value,update){
    const wrap=el('div','campo theme-photo-field');const caption=el('label','',label),select=el('select');
    const id='themePhoto'+(++fieldId);select.id=id;caption.htmlFor=id;
    const options=[['','Usar fotos do presente automaticamente'],...photos.map((_,i)=>['@media:'+photoIds[i],'Foto '+(i+1)]),['url','Usar endereço de imagem']];
    for(const [val,label] of options){const option=el('option','',label);option.value=val;select.append(option);}
    select.value=/^@media:[\w-]+$/.test(value)?value:value?'url':'';
    const thumb=el('img','editor-photo');thumb.alt='Imagem selecionada';
    const url=el('input');url.type='url';url.placeholder='https://…';url.setAttribute('aria-label',label+': endereço da imagem');url.value=value&&!value.startsWith('@media:')?value:'';
    function preview(){url.hidden=select.value!=='url';const src=select.value==='url'?url.value:photos[photoIds.indexOf(select.value.slice(7))];thumb.hidden=!src||! /^(https?:\/\/|blob:|data:image\/)/.test(src);if(!thumb.hidden)thumb.src=src;else thumb.removeAttribute('src');}
    select.addEventListener('change',()=>{update(select.value==='url'?url.value:select.value);preview();changed();});
    url.addEventListener('input',()=>{update(url.value);preview();changed();});
    wrap.append(caption,select,url,thumb);parent.append(wrap);preview();
  }
  function collection(parent,key,schema){
    const linked=(active==='netflix'&&key==='shows')||(active==='vinil'&&key==='sideA')||(active==='cinema'&&key==='posters')||(active==='retro'&&key==='tapes');
    const stored=draft().collections[key];
    const overrides=clone(stored?.__naOverrides||{});
    const current=clone(stored?.__naOverrides?schema.value:stored??schema.value);
    if((!stored||stored.__naOverrides)&&Array.isArray(current)&&((active==='netflix'&&key==='shows')||(active==='vinil'&&key==='sideA')||(active==='cinema'&&key==='posters')||(active==='retro'&&key==='tapes'))){current.forEach((item,i)=>{const event=events[i];if(!event)return;item.title=event.titulo||item.title;for(const part of ['synopsis','desc'])if(part in item)item[part]=event.texto||item[part];if('meta' in item)item.meta=event.data||item.meta;if('year' in item)item.year=event.data||item.year;});}
    for(const [path,value] of Object.entries(overrides)){let target=current;const parts=path.split('.');if(parts.some(p=>['__proto__','constructor','prototype'].includes(p)))continue;for(const part of parts.slice(0,-1))target=target?.[part];if(target)target[parts.at(-1)]=value;}
    const save=()=>{draft().collections[key]=linked&&(!stored||stored.__naOverrides)?{__naOverrides:clone(overrides)}:clone(current);};
    function visit(value,path,target){
      if(value&&typeof value==='object'){
        for(const [part,child] of Object.entries(value)){
          if(['id','showId','num'].includes(part))continue;
          if(path[0]==='0'&&active==='netflix'&&key==='shows'&&['title','synopsis'].includes(part))continue;
          if(path[0]==='0'&&((['spotify','retro'].includes(active)&&key==='tracks')||(active==='vinil'&&key==='sideA'))&&['title','artist'].includes(part))continue;
          const label=labels[part]||(Array.isArray(value)?(path.at(-1)==='opts'?'Alternativa ':path.at(-1)==='categories'?'Seção ':path.at(-1)==='tracks'?'Faixa ':'Item ')+(Number(part)+1):part);
          const nextPath=[...path,part];
          if(child&&typeof child==='object'){
            const group=el('fieldset','editor-fieldset');group.append(el('legend','',label));target.append(group);visit(child,nextPath,group);
          }else{
            const update=next=>{let cursor=current;for(const p of nextPath.slice(0,-1))cursor=cursor[p];cursor[nextPath.at(-1)]=next;overrides[nextPath.join('.')]=next;save();};
            if(mediaKeys.includes(part))photoField(target,label,child,update);else field(target,label,child,update,path.at(-1)==='categories'?'category':part);
          }
        }
      }else field(target,Array.isArray(current)?'Conteúdo':'Texto',value,next=>{if(path.length){current[path[0]]=next;save();}else draft().collections[key]=next;},key);
    }
    if(current&&typeof current==='object'){
      const keys=Object.keys(current),positionKey=active+':'+key;
      let selected=Math.min(positions.get(positionKey)||0,Math.max(0,keys.length-1));
      const picker=el('div','editor-item-picker'),content=el('div','editor-item-content');
      const labelFor=(part,index)=>{const item=current[part];return item?.name||item?.title||item?.q||(typeof item==='string'?item.slice(0,45):'Item '+(index+1));};
      const label=el('label','editor-picker-label','Escolha o item para editar');const select=el('select');select.setAttribute('aria-label',schema.label+': item');
      keys.forEach((part,index)=>{const opt=el('option','',`${index+1}. ${labelFor(part,index)}`);opt.value=index;select.append(opt);});
      const count=el('span','editor-count');
      function show(){positions.set(positionKey,selected);select.value=selected;content.replaceChildren();count.textContent=`${selected+1} de ${keys.length}`;
        const part=keys[selected];
        if(active==='netflix'&&key==='shows'&&selected===0||selected===0&&((['spotify','retro'].includes(active)&&key==='tracks')||(active==='vinil'&&key==='sideA')))content.append(el('p','section-note',active==='netflix'?'O título principal vem da Capa. A sinopse também vem da etapa Capa.':'Nome e artista da primeira faixa vêm da etapa Música.'));
        visit(current[part],[part],content);prev.disabled=selected===0;next.disabled=selected===keys.length-1;}
      const prev=button('← Anterior',()=>{selected--;show();}),next=button('Próximo →',()=>{selected++;show();});
      select.addEventListener('change',()=>{selected=Number(select.value);show();});label.append(select);picker.append(label);const paging=el('div','editor-paging');paging.append(prev,count,next);parent.append(picker,content,paging);
      if(keys.length)show();else content.append(el('p','nota','Esta seção não tem itens.'));
    }else field(parent,schema.label,current,value=>{draft().collections[key]=value;},key);
  }
  function render(){
    if(!host)return;host.replaceChildren();host.hidden=false;
    const schema=schemas.get(active);
    if(active==='namoro'){host.append(el('div','editor-empty','Os nomes, fotos, momentos, motivos e a carta já personalizam este tema. Continue para escrever sua mensagem.'));return;}
    if(!schema){host.append(el('p','nota','Carregando os campos do tema…'));return;}
    const sections=Object.entries(schema.collections||{}).map(([key,entry])=>({id:key,label:entry.label,build:parent=>collection(parent,key,entry)}));
    if(schema.checks?.length)sections.push({id:'checks',label:'Planos e conquistas',build:parent=>{for(const entry of schema.checks)field(parent,entry.label,draft().checks[entry.id]??entry.value,value=>{draft().checks[entry.id]=value;});}});
    if(schema.numbers?.length)sections.push({id:'numbers',label:'Números da história',build:parent=>{for(const entry of schema.numbers)field(parent,entry.label,draft().numbers[entry.id]??entry.value,value=>{draft().numbers[entry.id]=value;});}});
    if(schema.fields?.length)sections.push({id:'texts',label:'Textos e títulos das seções',build:parent=>{
      parent.append(el('p','nota','Opcional. Ajuste os textos que já fazem parte do modelo. Os demais campos do formulário continuam controlando a capa, a carta e suas memórias.'));
      const groups=new Map();for(const entry of schema.fields){if(!groups.has(entry.group)){const group=el('details','editor-text-group');group.append(el('summary','',entry.group));parent.append(group);groups.set(entry.group,group);}field(groups.get(entry.group),entry.label,draft().texts[entry.id]??entry.value,value=>{draft().texts[entry.id]=value;});}
    }});
    if(!sections.length){host.append(el('p','editor-empty','Este tema usa os campos das outras etapas. Sua personalização já está na prévia.'));return;}
    host.append(el('p','nota','Escolha uma seção. As alterações aparecem na prévia e ficam guardadas ao trocar de tema.'));
    const nav=el('div','editor-section-nav'),panel=el('div','editor-section-panel');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Seções do tema');
    if(!sections.some(s=>s.id===selection))selection=sections[0].id;
    sections.forEach((section,index)=>{const b=button(section.label,()=>{selection=section.id;render();host.querySelector('[aria-selected="true"]')?.focus();},'editor-tab');b.setAttribute('role','tab');b.id='editorTab'+index;b.setAttribute('aria-controls','editorSectionPanel');b.setAttribute('aria-selected',String(selection===section.id));b.tabIndex=selection===section.id?0:-1;b.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?sections.length-1:(index+(event.key==='ArrowRight'?1:-1)+sections.length)%sections.length;selection=sections[next].id;render();host.querySelector('[aria-selected="true"]')?.focus();}});nav.append(b);if(selection===section.id){panel.id='editorSectionPanel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id);panel.append(el('h3','',section.label));section.build(panel);}});
    host.append(nav,panel);
  }
  return {activate(key){if(active!==key){active=key;selection='';render();}},acceptSchema(schema){if(schema.key!==active||schemas.has(schema.key))return;schemas.set(schema.key,schema);render();},getData(){return clone(data);},restore(value){data=value&&typeof value==='object'?clone(value):{};render();},setPhotos(values,moments=[],ids=[]){if(JSON.stringify([photos,events,photoIds])===JSON.stringify([values,moments,ids]))return;photos=[...values];photoIds=[...ids];events=clone(moments);render();}};
})();
