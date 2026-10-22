/* Controles específicos dos modelos; os rascunhos são separados por tema. */
window.NAThemeEditor = (() => {
  'use strict';
  let data = {}, active = null;
  const schemas = new Map();
  const host = document.getElementById('themeDetails');
  const labels = { q:'Pergunta', opts:'Alternativas', correct:'Resposta correta (número da alternativa)',
    name:'Nome', role:'Parentesco / papel', years:'Datas / período', photo:'Foto (endereço opcional)', bio:'Biografia',
    title:'Título', date:'Data / época', body:'Mensagem', signature:'Assinatura', label:'Lembrança',
    x:'Posição horizontal (%)', y:'Posição vertical (%)',desc:'Descrição',synopsis:'Sinopse',genre:'Gênero',year:'Ano / época',rating:'Classificação / nota',duration:'Duração',dur:'Duração',match:'Relevância (%)',episodes:'Quantidade de episódios',isOriginal:'Selo de original',isNew:'Marcar como novidade',categories:'Seções do catálogo',poster:'Foto do cartaz (endereço opcional)',backdrop:'Foto de fundo (endereço opcional)',cover:'Foto da capa (endereço opcional)',thumb:'Miniatura (endereço opcional)',img:'Foto (endereço opcional)',artist:'Artista',album:'Álbum',plays:'Reproduções',badge:'Selo',tag:'Destaque',director:'Direção',meta:'Data / local / detalhes',tracks:'Faixas',audio:'Áudio desta faixa (endereço opcional)',progress:'Progresso (de 0 a 1)' };
  const clone = value => JSON.parse(JSON.stringify(value));
  const draft = () => { const d = data[active] ||= {}; d.texts ||= {}; d.collections ||= {}; d.checks ||= {}; d.numbers ||= {}; return d; };
  function changed() { document.getElementById('form').dispatchEvent(new Event('input', { bubbles:true })); }
  function group(title, parent = host) {
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = title;
    details.append(summary); parent.append(details); return details;
  }
  function field(parent, label, value, update, numericKey) {
    const wrap = document.createElement('label'); wrap.className = 'campo theme-field';
    const text = document.createElement('span'); text.textContent = label;
    const input = document.createElement(numericKey==='category'?'select':typeof value === 'string' && (value.length > 90 || value.includes('\n')) ? 'textarea' : 'input');
    if(numericKey==='category')for(const [val,label] of Object.entries({originals:'Originais',trending:'Em destaque',top10:'Top 10',continue:'Continuar assistindo',romance:'Romance',comedy:'Comédia',adventure:'Aventura',docs:'Documentários'})){const option=document.createElement('option');option.value=val;option.textContent=label;input.append(option);}
    if (input.tagName === 'INPUT') input.type = typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'number' : 'text';
    input.maxLength = 4000;
    input.value = numericKey === 'correct' ? Number(value) + 1 : value;
    if(typeof value==='boolean')input.checked=value;
    if (typeof value === 'number') { input.step='any';input.min = numericKey === 'correct' ? '1' : '0'; input.max = numericKey === 'correct' ? '4' : ['x','y','match'].includes(numericKey) ? '100' : numericKey==='progress'?'1':'1000000000'; }
    input.addEventListener('input', () => {
      const next = typeof value === 'boolean' ? input.checked : typeof value === 'number' ? (Number(input.value) || 0) - (numericKey === 'correct' ? 1 : 0) : input.value;
      update(numericKey === 'correct' ? Math.max(0, Math.min(3, next)) : next); changed();
    });
    wrap.append(text, input); parent.append(wrap);
  }
  function collection(parent, key, schema) {
    const panel = group(schema.label, parent);
    const current = clone(draft().collections[key] ?? schema.value);
    function write(path, value) {
      if (!path.length) draft().collections[key] = value;
      else {
        let cursor = current;
        for (const part of path.slice(0, -1)) cursor = cursor[part];
        cursor[path.at(-1)] = value; draft().collections[key] = clone(current);
      }
    }
    function visit(value, path, target, label) {
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([part, child]) => {
          if(['id','showId','num'].includes(part))return;
          if(path[0]==='0'&&active==='netflix'&&key==='shows'&&['title','synopsis'].includes(part))return;
          if(path[0]==='0'&&((['spotify','retro'].includes(active)&&key==='tracks')||(active==='vinil'&&key==='sideA'))&&['title','artist'].includes(part))return;
          const nextLabel = labels[part] || (Array.isArray(value) ? 'Item ' + (Number(part) + 1) : part);
          if (child && typeof child === 'object') {
            const container = group(child.name || child.q || child.title || nextLabel, target);
            visit(child, [...path, part], container, nextLabel);
          } else field(target, nextLabel, child, next => write([...path, part], next), path.at(-1)==='categories'?'category':part);
        });
      } else field(target, label, value, next => write(path, next));
    }
    visit(current, [], panel, schema.label);
  }
  function render() {
    if (!host) return;
    host.replaceChildren();
    const schema = schemas.get(active);
    host.hidden = !schema;
    if (!schema) return;
    const title = document.createElement('h3'); title.textContent = 'Detalhes de ' + (window.THEMES?.[active]?.nome || schema.name || active);
    const note = document.createElement('p'); note.className = 'nota';
    note.textContent = 'Personalize as seções e experimente as interações na prévia. Textos, fotos, carta e momentos principais são preenchidos pelos campos acima.';
    host.append(title, note);
    Object.entries(schema.collections || {}).forEach(([key, entry]) => collection(host, key, entry));
    if(schema.checks?.length){const panel=group('Itens já realizados');for(const entry of schema.checks)field(panel,entry.label,draft().checks[entry.id]??entry.value,value=>{draft().checks[entry.id]=value;});}
    if(schema.numbers?.length){const panel=group('Números da história');for(const entry of schema.numbers)field(panel,entry.label,draft().numbers[entry.id]??entry.value,value=>{draft().numbers[entry.id]=value;});}
    const groups = new Map();
    for (const entry of schema.fields || []) {
      if (!groups.has(entry.group)) groups.set(entry.group, group(entry.group));
      field(groups.get(entry.group), entry.label, draft().texts[entry.id] ?? entry.value,
        value => { draft().texts[entry.id] = value; });
    }
  }
  return {
    activate(key) { if (active !== key) { active = key; render(); } },
    acceptSchema(schema) {
      if (schema.key !== active || schemas.has(schema.key)) return;
      schemas.set(schema.key, schema); render();
    },
    getData() { return clone(data); },
    restore(value) { data = value && typeof value === 'object' ? clone(value) : {}; render(); },
  };
})();
