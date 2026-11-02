/* Visual compartilhado do catálogo; disponibilidade e seleção continuam nas páginas. */
window.NAThemeCard=(()=>{
  const backgrounds={
    netflix:'<div class="laser-lines"></div>',
    spotify:'<div class="eq-bars"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>',
    vinil:'<div class="record-disc"><div class="record-center"><div class="record-hole"></div></div></div><div class="tonearm"></div>',
    cinema:'<div class="spotlight"></div><div class="film-strip"></div><div class="film-strip right"></div>',
    retro80:'<div class="synth-grid"></div><div class="synth-sun"></div>',
  };
  const samples={
    cinema:{titulo:'Sessão da Tarde',chip:'A melhor história é a nossa.',cont:[['2h','Duração'],['1','Sessão'],['VIP','Lugar']]},
    retro80:{titulo:'Para Sempre',chip:'Nossa história em neon.',cont:[['1980','Ano'],['100%','Synth'],['∞','Love']]},
    namoro:{titulo:'Nós dois',chip:'Uma história que continua...',cont:[['2','Anos'],['34','Meses'],['952','Dias']]},
    natal:{titulo:'Nosso Natal',chip:'Edição de colecionador',cont:[['24','Dez'],['∞','Amor'],['1','Família']]},
  };
  function create(key,theme,{mode='link',sample,badge}={}){
    const card=document.createElement('article');
    card.className='kl-theme-card';
    const visualKey=({jardim:'jardim-secreto',retro:'retro80'})[key]||key;
    // Theme keys come from the catalog. Never interpolate catalog text as HTML.
    if(/^[a-z0-9-]+$/.test(visualKey))card.classList.add('theme-'+visualKey);
    card.dataset.themeCard='';card.dataset.chave=key;
    card.dataset.categoria=theme.categoria||'classico';
    card.setAttribute('aria-label','Tema '+theme.nome);
    const exclusive=theme.categoria==='especial';
    card.innerHTML='<div class="card-bg-layer" aria-hidden="true">'+(backgrounds[visualKey]||'<div class="bg-art"></div>')+'</div>'+
      '<div class="card-vignette" aria-hidden="true"></div>'+
      '<button type="button" class="fav-btn" aria-pressed="false">♥</button>'+
      '<div class="card-inner">'+
      '<span class="corner tl" aria-hidden="true"></span><span class="corner tr" aria-hidden="true"></span><span class="corner bl" aria-hidden="true"></span><span class="corner br" aria-hidden="true"></span>'+
      '<div class="top-row"></div><div class="center-block"><div class="teaser"></div><div class="hero-title"></div><div class="fleuron" aria-hidden="true">✦</div></div>'+
      '<div class="stats" aria-label="Exemplo ilustrativo"></div><div class="bottom-block"><h3 class="theme-name"><span class="emoji" aria-hidden="true"></span><span class="nome"></span></h3></div></div>';
    const preview=samples[visualKey]||sample||samples.namoro;
    card.querySelector('.top-row').textContent=badge||(exclusive?'Exclusivo VIP':'Clássico');
    card.querySelector('.teaser').textContent=preview.chip;
    card.querySelector('.hero-title').textContent=preview.titulo;
    if (key === 'natal') {
      card.querySelector('.card-bg-layer').innerHTML = `<div class="natal-tree-medallion" aria-hidden="true">
        <svg viewBox="0 0 100 100" focusable="false">
          <path class="tree-silhouette" d="M50 8 80 47H69L87 68H75L92 86H8L25 68H13L31 47H20Z"/>
          <circle cx="34" cy="44" r="4"/><circle cx="67" cy="44" r="4"/>
          <circle cx="50" cy="59" r="4"/><circle cx="50" cy="80" r="4"/>
          <circle class="red" cx="29" cy="70" r="4"/><circle class="red" cx="71" cy="70" r="4"/>
        </svg>
      </div>`;
    }
    card.querySelector('.emoji').textContent=theme.emoji||'✦';
    card.querySelector('.nome').textContent=theme.nome;
    for(const [number,label] of preview.cont){
      const stat=document.createElement('div');
      stat.innerHTML='<strong></strong><span></span>';
      stat.children[0].textContent=number;stat.children[1].textContent=label;
      card.querySelector('.stats').appendChild(stat);
    }
    const action=document.createElement(mode==='select'?'button':'a');
    action.className='cta';
    const actionText = {select:'Escolher este tema',preview:'Ver demonstração',link:'Criar este tema'};
    action.innerHTML=actionText[mode]+' <span class="arrow" aria-hidden="true">→</span>';
    action.setAttribute('aria-label',mode==='preview'?'Ver demonstração do tema '+theme.nome:(mode==='select'?'Escolher tema: ':'Criar presente com o tema ')+theme.nome);
    if(mode==='select'){
      action.type='button';action.setAttribute('aria-pressed','false');
    }else{
      action.href=(mode==='preview'?'/temas/':'/criar-presente?tema=')+encodeURIComponent(key);
      card.addEventListener('click',event=>{if(!event.target.closest('a,button'))action.click();});
    }
    card.querySelector('.bottom-block').appendChild(action);
    const favorite=card.querySelector('.fav-btn');
    favorite.title='Favoritar '+theme.nome;
    favorite.setAttribute('aria-label',favorite.title);
    favorite.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      const active=favorite.classList.toggle('on');
      favorite.setAttribute('aria-pressed',String(active));
      favorite.setAttribute('aria-label',(active?'Desfavoritar ':'Favoritar ')+theme.nome);
    });
    return card;
  }
  return {create};
})();
