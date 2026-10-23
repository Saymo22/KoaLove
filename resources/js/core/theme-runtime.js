/* Ponte dos modelos independentes com o formulário e o visualizador. */
window.NATheme = (() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const media = value => typeof value === 'string' && /^(https?:\/\/|blob:|data:(?:image|audio|video)\/)/i.test(value) ? value : '';
  const params = new URLSearchParams(location.search);
  let fallbackMusic = '';
  const embedded = window.parent !== window;
  if (embedded && params.get('demo') !== '1') document.documentElement.classList.add('na-await-data');
  const set = (selector, value) => { const el = $(selector); if (el) el.textContent = value ?? ''; };
  const replaceArray = (target, values) => target.splice(0, target.length, ...values);
  function resolvePhotoRefs(value, photos, ids=[]) {
    if (typeof value === 'string' && value.startsWith('@media:')) return photos[ids.indexOf(value.slice(7))] || '';
    if (typeof value === 'string' && /^@photo:\d+$/.test(value)) return photos[Number(value.slice(7))] || '';
    if (Array.isArray(value)) return value.map(item => resolvePhotoRefs(item, photos, ids));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolvePhotoRefs(item, photos, ids)]));
    return value;
  }
  function styledTitle(selector,value){
    const host=$(selector);if(!host)return;
      const slots=host.naTitleSlots ||= [...host.childNodes].filter(node=>[1,3].includes(node.nodeType)&&node.textContent.trim());
    if(slots.length<2){host.textContent=value;return;}
    const words=String(value).trim().split(/\s+/);
    slots.forEach((node,i)=>{node.textContent=words.slice(Math.floor(i*words.length/slots.length),Math.floor((i+1)*words.length/slots.length)).join(' ')+(node.nodeType===3?' ':'');});
  }
  function selectAudio(source) {
    const audio=$('#audio');if(!audio)return '';
    const url=media(source)||fallbackMusic;
    if(!url&&document.documentElement.classList.contains('na-data-ready')){audio.pause();return '';}
    if(url&&audio.getAttribute('src')!==url){audio.pause();audio.src=url;audio.load();}
    return url||audio.getAttribute('src')||audio.querySelector('source')?.src||'';
  }
  function letter(selector, text, from, to) {
    const host = $(selector);
    if (!host) return;
    let paragraphs = [...host.children].filter(el => el.tagName === 'P' && !/sig|date|ps|eyebrow/.test(el.className));
    if (!paragraphs.length) return;
    paragraphs.forEach((el, i) => { el.textContent = i === 0 ? (text || 'Sua mensagem aparecerá aqui.') : ''; el.hidden = i > 0; });
    const title = host.querySelector('h3');
    if (title) title.textContent = to + ',';
    const signature = host.querySelector('[class*="signature"], .sig, [class$="sign"]');
    if (signature) signature.textContent = 'Com carinho, ' + from;
  }
  function storyMedia(data, host) {
    const el = document.createElement(data.video ? 'video' : 'img');
    el.src = media(data.video || data.img);
    if (data.video) {
      el.controls = true; el.playsInline = true; el.preload = 'metadata';
      el.poster = media(data.img); el.addEventListener('play', () => $('#audio')?.pause());
    } else el.alt = data.cap || 'Nossa lembrança';
    host.append(el);
    requestAnimationFrame(() => el.classList.add('on'));
    return el;
  }
  function interactiveCards(){
    all('.candle-group,.member-card,.g-item,.polaroid,.flower,.story-thumb,.vault-letter,.flip,.joke-card,.postcard,.ps-profile,.card,.top10-item,.poster,.vhs-tape,.playlist-card,.track-row,.track,.album,.memory-thumb,.popcorn-icon,.arcade-target').forEach((node,i)=>{
      if(node.dataset.naKeyboard)return;node.dataset.naKeyboard='1';node.setAttribute('role','button');node.setAttribute('tabindex','0');
      node.setAttribute('aria-label',node.matches('.candle-group')?'Apagar vela '+(i+1):node.textContent.trim().slice(0,100)||'Abrir lembrança');
      node.addEventListener('keydown',event=>{if(event.target===node&&(event.key==='Enter'||event.key===' ')){event.preventDefault();node.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
    });
  }
  function connect(options) {
    const actions={chest:'Abrir cofre de cartas',bigSeal:'Romper selo',treeHollow:'Abrir carta da árvore',coverFront:'Abrir álbum',mainEnvelope:'Abrir envelope',vowCard:'Abrir votos',giftBox:'Abrir presente',gateWrap:'Abrir portão',letterEnvelope:'Abrir carta',sideBLock:'Desbloquear lado B',navCoin:'Inserir moeda'};
    for(const [id,label] of Object.entries(actions)){const node=document.getElementById(id);if(node){node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-label',label);node.addEventListener('keydown',event=>{if(event.target===node&&(event.key==='Enter'||event.key===' ')){event.preventDefault();node.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});}}
    const originalImages = all('section img, .tree-letter img');
    const placeholders=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement.closest('script,style')&&/Seu Nome|Seu Amigo\(a\)|Família Silva/.test(node.textContent))placeholders.push({node,value:node.textContent});}
    const textNodes = all('section h1, section h2, section h3, section h4, section p, section li, section .m-value, section .hero-crest, section .postcard-message, section .ticket-title, section .ticket-date, section .bucket-text, section .bucket-item span, section .sticky-text, section .hero-photo-tag, section .hero-photo-caption, .tree-letter .tl-body p'+(options.textSelector?', '+options.textSelector:''));
    const coreSelectors = [options.title, options.phrase, options.names, ...(options.letters || [])].filter(Boolean);
    const fields = textNodes.filter(el => el.textContent.trim() &&
      !coreSelectors.some(selector => el.matches(selector) || el.closest(selector)) &&
      !el.closest('#gallery, #polaroidGrid, #polaroids.polaroids, #garden, #storiesRail, #vaultLetters, #quizContent, .member-card, .timeline, .chapters, .journal-entry, #pathWrap') &&
      !(options.excludeSelector&&el.closest(options.excludeSelector)));
    const schema = fields.map((el, i) => {
      el.dataset.naText = String(i);
      const section = el.closest('section');
      return { id: String(i), group: section?.querySelector('h2')?.textContent.trim() || 'Capa e detalhes',
        label: el.textContent.trim().slice(0, 65), value: el.textContent.trim() };
    });
    const collections = options.collections || {};
    const checkNodes=all('section input[type="checkbox"]');
    const checks=checkNodes.map((el,i)=>({id:String(i),label:el.closest('label')?.textContent.trim()||'Concluído',value:el.checked}));
    const numberNodes=all('section [data-count]');
    const numbers=numberNodes.map((el,i)=>({id:String(i),label:el.parentElement.textContent.trim().replace(/^[\d.,]+/,''),value:Number(el.dataset.count)||0}));
    const defaults = Object.fromEntries(Object.entries(collections).map(([key, entry]) => [key, { label: entry.label, value: structuredClone(entry.value) }]));
    if(defaults.members)Object.values(defaults.members.value).forEach(member=>{member.photo='';});
    if(options.clearMediaDefaults){const clear=node=>{if(!node||typeof node!=='object')return;for(const key of Object.keys(node)){if(['cover','poster','backdrop','img','thumb','photo','audio','video'].includes(key)&&typeof node[key]==='string')node[key]='';else clear(node[key]);}};Object.values(defaults).forEach(entry=>clear(entry.value));}
    let previous = '';
    let previousMusic = null;
    function apply(payload) {
      if (!payload || typeof payload !== 'object') return;
      const stamp = JSON.stringify(payload);
      if (stamp === previous) return;
      previous = stamp;
      const p = payload.p || {};
      const photos = (payload.photos || []).map(media).filter(Boolean);
      const custom = resolvePhotoRefs(p.themeData?.[options.key] || {}, photos, p.photoIds||[]);
      const videos = (payload.videos || []).map(media).filter(Boolean);
      const from = p.de || 'Alguém especial', to = p.para || 'Você';
      const cover = media(payload.cover) || photos[0] || '';
      fallbackMusic=media(payload.music);
      placeholders.forEach(({node,value})=>{node.textContent=value.replace(/Seu Nome/g,()=>from).replace(/Seu Amigo\(a\)/g,()=>to).replace(/Família Silva/g,()=>p.titulo||'Nossa família');});
      document.title = (p.titulo || to) + ' — ' + from;
      if (options.names) {
        const host = $(options.names);
        if (host) {
          host.replaceChildren();
          [from, '&', to].forEach((name, i) => { const span = document.createElement('span'); span.className = i === 1 ? 'amp' : ''; span.textContent = name; host.append(span, document.createTextNode(' ')); });
        }
      }
      (options.preserveTitle?styledTitle:set)(options.title || '.na-no-title', p.titulo || to);
      set(options.phrase || '.na-no-phrase', p.frase || 'Uma história feita para você.');
      const year=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'')?p.inicio.slice(0,4):'';
      if(options.key==='amizade')set('.hero-photo-tag',year?'Desde '+year:'Nossa história');
      if(options.key==='familia'){set('.hero-meta .m-value',year||'Uma vida de memórias');set('.hero-crest',(p.titulo||to).slice(0,1).toUpperCase());}
      if(options.key==='scrapbook'){set('.cover-back-date',year?'— desde '+year+' —':'— nossas memórias —');if(p.titulo){set('.cover-back-title',p.titulo);set('.cover-plate-title',p.titulo);}}
      set('#storyName', from + ' & ' + to);
      set('footer .f-names', from + ' & ' + to);
      if (p.rodapeCustom) set('footer p', p.rodapeCustom);
      for (const selector of options.letters || []) letter(selector, p.carta, from, to);
      for(const selector of ['.letter-preview','.note-preview'])if($(selector))set(selector,(p.carta||'Sua mensagem aparecerá aqui.').slice(0,140));
      if(options.key==='amizade')set('.note-title','Para '+to+',');
      if(options.key==='familia'||options.key==='aniversario')set('.letter-title','Para '+to+',');
      const reasonCards=all('.motivos .flip');
      reasonCards.forEach((card,i)=>{const reason=payload.reasons?.[i];card.hidden=!reason;if(reason){const title=card.querySelector('h4'),detail=card.querySelector('.flip-back p');if(title)title.textContent=reason;if(detail)detail.textContent=reason;}});
      if(!reasonCards.length){let section=$('#naReasons');if(!section){section=document.createElement('section');section.id='naReasons';section.className='na-reasons';document.querySelector('footer')?.before(section);}section.replaceChildren();section.hidden=!payload.reasons?.length;if(!section.hidden){const h=document.createElement('h2');h.textContent='O que admiro em você';const list=document.createElement('div');list.className='na-reasons-list';for(const reason of payload.reasons){const p=document.createElement('p');p.textContent=reason;list.append(p);}section.append(h,list);}}
      originalImages.forEach((img, i) => {
        const source = img.closest('.hero, #inicio') ? cover : photos[i % Math.max(1, photos.length)];
        if (source) { img.src = source; img.hidden = false; } else { img.removeAttribute('src'); img.hidden = true; }
      });
      options.apply({ ...payload, p, custom, photos, videos, cover });
      interactiveCards();
      for(const [id,value] of Object.entries(custom.checks||{}))if(checkNodes[Number(id)])checkNodes[Number(id)].checked=!!value;
      for(const [id,value] of Object.entries(custom.numbers||{})){const el=numberNodes[Number(id)];if(el&&Number.isFinite(Number(value))){el.dataset.count=String(value);el.textContent=Number(value).toLocaleString('pt-BR');}}
      for (const [id, value] of Object.entries(custom.texts || {})) {
        const node = fields[Number(id)];
        if (node && typeof value === 'string') node.textContent = value;
      }
      // Cada aplicação é reversível, inclusive depois de remover e recolocar mídia.
      const audio = $('#audio'), player = $(options.player || '#player');
      const music = media(payload.music);
      if (audio) {
        audio.querySelectorAll('source').forEach(el => el.remove());
        if (music !== previousMusic){
          if (music) { audio.pause(); audio.src = music; audio.load(); if(p.autoplay&&params.get('embed')!=='1')audio.play().catch(()=>{}); }
          else { audio.pause(); audio.removeAttribute('src'); audio.load(); }
          previousMusic=music;
        }
      }
      if (player) player.hidden = !music;
      set('#pTitle', p.musicaNome || 'Nossa música'); set('#pArtist', p.musicaArtista || from + ' & ' + to);
      const disc = $('#discCover'); if (disc) {disc.hidden=!cover;if(cover)disc.src=cover;else disc.removeAttribute('src');}
      document.documentElement.classList.add('na-data-ready');
      if(!p.usarIntro)$('#loader')?.classList.add('done');
    }
    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'NOSSO_AMOR_THEME_DATA') return;
      try { apply(event.data.payload); } catch (error) { console.error('[Tema ' + options.key + ']', error); }
    });
    function ready() {
      if (embedded) window.parent.postMessage({ type: 'NOSSO_AMOR_THEME_READY', key: options.key,
        fields: schema, collections: defaults, checks, numbers }, location.origin);
    }
    ready();
    interactiveCards();
    window.addEventListener('load', ready, { once: true });
    window.addEventListener('pagehide', () => { $('#audio')?.pause(); options.dispose?.(); });
    return { apply };
  }
  function timeline(payload, selector) {
    const root = $(selector); if (!root) return;
    const rows = [...root.children].filter(el => /tl-item|path-item|journal-entry|^chapter$|^frame(?: |$)/.test(el.className));
    if (!root.naTemplates) root.naTemplates = rows.map(el => el.cloneNode(true));
    const events = (payload.events || []).filter(Boolean);
    root.closest('section').hidden = !events.length;
    rows.forEach(el => el.remove());
    events.forEach((event, i) => {
      const template = root.naTemplates[i % root.naTemplates.length]; if (!template) return;
      const row = template.cloneNode(true); row.classList.add('in');
      const title = row.querySelector('h3,.tl-title'); if (title) title.textContent = event.titulo || 'Nosso momento';
      const date = row.querySelector('.tl-date, .tl-year, .path-date, .journal-date, .chapter-date,.frame-date'); if (date) date.textContent = event.data || '';
      const desc = row.querySelector('.tl-text, .tl-desc, .path-desc, .journal-text, .tl-card p, .path-card p, .chapter-body p:not(.chapter-date),.frame-desc'); if (desc) desc.textContent = event.texto || '';
      const num=row.querySelector('.chapter-num,.path-num');if(num)num.textContent=String(i+1).padStart(2,'0');
      row.querySelectorAll('img').forEach(img => { const src = payload.photos[i % Math.max(1, payload.photos.length)]; if (src) img.src = src; else img.hidden = true; });
      root.append(row);
    });
  }
  return { escape, media, set, styledTitle, replaceArray, resolvePhotoRefs, selectAudio, storyMedia, connect, timeline };
})();
