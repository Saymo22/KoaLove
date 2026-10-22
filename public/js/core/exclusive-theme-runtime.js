/* Utilitários dos cinco modelos exclusivos. As funções visuais ficam em cada tema. */
window.NAExclusive = (() => {
  'use strict';
  const clone = value => structuredClone(value);
  const asset = value => NATheme.media(value).replace(/[<>"'()\\\s]/g, c => encodeURIComponent(c));
  function placeholder(title = 'Nossa história') {
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="100%" height="100%" fill="#19151e"/><circle cx="400" cy="400" r="190" fill="#6d3b57"/><text x="400" y="720" fill="#fff1e1" text-anchor="middle" font-family="serif" font-size="34">${NATheme.escape(String(title).slice(0,30))}</text></svg>`).replace(/'/g, '%27');
  }
  function items(defaults, custom, payload, mediaKeys, useEvents = false) {
    const base = clone(Array.isArray(custom) ? custom : defaults);
    return base.map((item, i) => {
      const event = useEvents && !custom ? payload.events?.[i] : null;
      if (event) {
        item.title = event.titulo || item.title;
        for (const key of ['synopsis','desc']) if (key in item) item[key] = event.texto || item[key];
        if ('meta' in item) item.meta = event.data || item.meta;
        if ('year' in item) item.year = event.data || item.year;
      }
      for (const key of mediaKeys) item[key] = asset(custom?.[i]?.[key]) || payload.photos[i % Math.max(1, payload.photos.length)] || payload.cover || placeholder(payload.p.titulo);
      if ('audio' in item) item.audio = asset(item.audio);
      return item;
    });
  }
  function change(target, next, render) {
    if (JSON.stringify(target) === JSON.stringify(next)) return;
    NATheme.replaceArray(target, next); render?.();
  }
  function stories(payload) {
    const { photos, videos, cover, p } = payload;
    return videos.length ? videos.map((video, i) => ({ video, img: photos[i % Math.max(1, photos.length)] || cover || placeholder(p.titulo), cap: p.legendas?.[i] || 'Nosso vídeo ' + (i+1) }))
      : photos.map((img, i) => ({ img, cap: p.legendas?.[i] || 'Nossa lembrança ' + (i+1) }));
  }
  function connect(options) {
    options.clearMediaDefaults = true;
    options.preserveTitle = true;
    const apply = options.apply;
    options.apply = payload => {
      apply(payload);
      if (!payload.photos.length && options.key === 'cinema') document.querySelectorAll('.poster').forEach(el => el.classList.add('na-placeholder'));
    };
    return NATheme.connect(options);
  }
  function history(payload, anchor) {
    let host=document.getElementById('naEventTimeline');
    if(!host){host=document.createElement('section');host.id='naEventTimeline';host.className='na-extra-section';const before=document.querySelector(anchor||'footer,.footer');if(before)before.before(host);else document.body.append(host);}
    host.replaceChildren();host.hidden=!payload.events?.length;
    for(const event of payload.events||[]){const article=document.createElement('article'),date=document.createElement('small'),title=document.createElement('h3'),text=document.createElement('p');date.textContent=event.data||'';title.textContent=event.titulo||'Nosso momento';text.textContent=event.texto||'';article.append(date,title,text);host.append(article);}
  }
  function time(value) {
    const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  }
  function seek(audio, fraction) { if(Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(1,fraction))*audio.duration; }
  function keyboard() {
    document.querySelectorAll('[data-na-scroll]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.naScroll)?.scrollIntoView({ behavior: 'smooth' })));
    document.querySelectorAll('[data-na-action]').forEach(node=>{node.setAttribute('role','button');node.tabIndex=0;node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();node.click();}});});
  }
  return { clone, asset, placeholder, items, change, stories, history, connect, time, seek, keyboard };
})();
