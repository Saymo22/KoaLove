
/* =========================================================
   DATA
   ========================================================= */
const SHOWS = [
  { id:1, title:'Nós: A Série', poster:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1600&q=85&auto=format&fit=crop', genre:'Romance · Drama', year:2024, rating:'16', duration:'4 temporadas', match:99, synopsis:'A história de dois destinos que se cruzam e se recusam a se separar. Uma jornada que atravessa encontros, desencontros, risos, lágrimas e a certeza de que o amor não é sobre acaso — é sobre escolha.', categories:['originals','trending','top10','continue'], progress:.42, episodes:8, isOriginal:true, isNew:true },
  { id:2, title:'O Primeiro Encontro', poster:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1600&q=85&auto=format&fit=crop', genre:'Romance · Comédia', year:2018, rating:'12', duration:'1h 47min', match:98, synopsis:'Aquele dia em que o mundo parou. Um café, um sorriso e a certeza de que algo especial começava ali.', categories:['trending','top10','romance'], episodes:0 },
  { id:3, title:'Madrugadas Infinitas', poster:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=85&auto=format&fit=crop', genre:'Drama · Romance', year:2020, rating:'14', duration:'2 temporadas', match:97, synopsis:'Quando o sono se tornou opcional. As melhores conversas acontecem quando o resto do mundo dorme.', categories:['originals','romance','top10'], isOriginal:true, episodes:10 },
  { id:4, title:'A Primeira Viagem', poster:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85&auto=format&fit=crop', genre:'Aventura · Romance', year:2021, rating:'12', duration:'2h 14min', match:96, synopsis:'Perdidos no mapa, felizes na estrada. Duas malas, uma câmera e três dias que virariam história.', categories:['trending','adventure','top10'], episodes:0 },
  { id:5, title:'Risos & Café', poster:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1600&q=85&auto=format&fit=crop', genre:'Comédia · Cotidiano', year:2023, rating:'L', duration:'3 temporadas', match:99, synopsis:'As manhãs mais doces. O cheiro do café, o barulho da risada e a certeza de que a vida boa é feita de dias comuns com a pessoa certa.', categories:['originals','comedy','romance'], progress:.68, episodes:12, isOriginal:true },
  { id:6, title:'Cores do Pôr do Sol', poster:'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1600&q=85&auto=format&fit=crop', genre:'Documentário', year:2022, rating:'L', duration:'58min', match:95, synopsis:'A hora dourada que virou nossa. Um retrato visual sobre como o céu nunca se repete — assim como cada vez que assistimos juntos.', categories:['docs','romance'], episodes:0 },
  { id:7, title:'As Receitas da Vó', poster:'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1600&q=85&auto=format&fit=crop', genre:'Documentário · Família', year:2024, rating:'L', duration:'2 temporadas', match:94, synopsis:'Cada prato é uma memória. Um mergulho nas receitas que atravessam gerações.', categories:['docs','originals'], isOriginal:true, episodes:6 },
  { id:8, title:'Sob o Mesmo Céu', poster:'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1600&q=85&auto=format&fit=crop', genre:'Drama', year:2023, rating:'12', duration:'1h 52min', match:93, synopsis:'A distância que nos aproximou. Um filme sobre como o amor verdadeiro não precisa de presença física.', categories:['trending','romance'], episodes:0 },
  { id:9, title:'A Primeira Briga', poster:'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=1600&q=85&auto=format&fit=crop', genre:'Drama · Comédia', year:2020, rating:'14', duration:'1h 34min', match:92, synopsis:'E a primeira reconciliação. Uma história sobre como as tempestades — quando passam — deixam o céu mais bonito.', categories:['comedy','romance'], episodes:0 },
  { id:10, title:'Natal em Família', poster:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1600&q=85&auto=format&fit=crop', genre:'Família · Cotidiano', year:2024, rating:'L', duration:'45min', match:98, synopsis:'Nossa tradição mais especial. Uma noite por ano em que tudo para — e só existe a família.', categories:['originals','docs','trending'], isOriginal:true, isNew:true, episodes:1 },
  { id:11, title:'Aniversário, de Novo', poster:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=85&auto=format&fit=crop', genre:'Comédia · Romance', year:2024, rating:'L', duration:'1h 22min', match:97, synopsis:'Sempre uma nova versão sua. Um filme sobre como cada ano é um recomeço.', categories:['comedy','trending'], isNew:true, episodes:0 },
  { id:12, title:'O Primeiro "Eu Te Amo"', poster:'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&q=85&auto=format&fit=crop', genre:'Romance', year:2019, rating:'12', duration:'1h 41min', match:100, synopsis:'E o segundo, e o terceiro. Um filme sobre as palavras que nunca se gastam.', categories:['romance','top10','trending'], progress:.15, episodes:0 },
  { id:13, title:'Aquele Verão', poster:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&q=85&auto=format&fit=crop', genre:'Romance · Nostalgia', year:2021, rating:'12', duration:'1h 48min', match:96, synopsis:'A estação que virou lembrança. E que toda vez que volta, traz de volta um pedaço de nós.', categories:['romance','adventure'], episodes:0 },
  { id:14, title:'Nossa Casa', poster:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=85&auto=format&fit=crop', genre:'Drama · Família', year:2024, rating:'L', duration:'1 temporada', match:95, synopsis:'Do jeito que a gente sonhou. Uma série sobre construir um lar.', categories:['originals','docs'], isOriginal:true, isNew:true, episodes:8 },
  { id:15, title:'Risadas de Domingo', poster:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85&auto=format&fit=crop', genre:'Comédia', year:2023, rating:'L', duration:'2 temporadas', match:94, synopsis:'Sem pressa, sem plano. Só um domingo, um sofá e a melhor companhia do mundo.', categories:['comedy'], progress:.33, episodes:10 },
  { id:16, title:'Pé na Estrada', poster:'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1600&q=85&auto=format&fit=crop', genre:'Aventura · Documentário', year:2022, rating:'L', duration:'3 episódios', match:92, synopsis:'Nossas viagens sem destino. Porque o importante não é o lugar — é a companhia.', categories:['adventure','docs'], episodes:3 },
  { id:17, title:'O Silêncio de Dois', poster:'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=1600&q=85&auto=format&fit=crop', genre:'Drama · Romance', year:2023, rating:'14', duration:'1h 39min', match:91, synopsis:'Sobre o conforto de não precisar falar. Sobre o amor que se diz no silêncio.', categories:['romance','trending'], episodes:0 },
  { id:18, title:'A Nossa Playlist', poster:'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80&auto=format&fit=crop', backdrop:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85&auto=format&fit=crop', genre:'Documentário Musical', year:2024, rating:'L', duration:'1h 12min', match:99, synopsis:'Cada música é uma memória. Um especial sobre as canções que marcaram nossa história.', categories:['docs','originals'], isOriginal:true, isNew:true, episodes:1 }
];

/* =========================================================
   STATE
   ========================================================= */
let currentProfile = 'nos';
let myList = new Set([2, 12]);
const NOTIFS = [
  { id:1, title:'Novo episódio de "Nós: A Série"', time:'há 2 horas', showId:1, thumb:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=200&q=80&auto=format&fit=crop' },
  { id:2, title:'Risos & Café ganhou 2ª temporada', time:'há 1 dia', showId:5, thumb:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=200&q=80&auto=format&fit=crop' },
  { id:3, title:'Novidade: Natal em Família', time:'há 2 dias', showId:10, thumb:'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=200&q=80&auto=format&fit=crop' }
];

/* =========================================================
   HELPERS
   ========================================================= */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showToast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('on'), 3000);
}

/* =========================================================
   SCROLL PROGRESS
   ========================================================= */
const sp = $('#scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  sp.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, { passive:true });

/* =========================================================
   CURSOR MAGNÉTICO
   ========================================================= */
const cursor = $('#cursor');
const cursorRing = $('#cursorRing');
let cx = 0, cy = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  cx = e.clientX; cy = e.clientY;
  cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
});

function cursorLoop(){
  rx += (cx - rx) * 0.16;
  ry += (cy - ry) * 0.16;
  cursorRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

const hoverEls = 'button, .card, .top10-item, .ps-profile, .nav-link, .search-result, a, .episode, .notif-item, .modal-btn, .hero-dot';
document.addEventListener('mouseover', e => {
  if (e.target.closest(hoverEls)) {
    cursor.classList.add('grow');
    cursorRing.classList.add('grow');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(hoverEls)) {
    cursor.classList.remove('grow');
    cursorRing.classList.remove('grow');
  }
});

/* =========================================================
   LOADER → PROFILE
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#loader').classList.add('done');
    if(new URLSearchParams(location.search).get('embed')!=='1'&&!window.naSkipProfiles)setTimeout(() => $('#profileSelector').classList.add('on'), 500);
  }, 2800);
});

$$('.ps-profile').forEach(el => {
  el.addEventListener('click', () => {
    currentProfile = el.dataset.profile;
    $('#profileSelector').classList.remove('on');
    setTimeout(() => {
      $('#musicPlayer').classList.add('show');
      renderAll();
      startHeroRotation();
    }, 500);
  });
});

/* =========================================================
   NAVBAR AUTO-HIDE
   ========================================================= */
const navbar = $('#navbar');
let lastScroll = 0;
let navHidden = false;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 80) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  if (y > 300) {
    if (y > lastScroll + 5 && !navHidden) {
      navbar.classList.add('hidden');
      navHidden = true;
    } else if (y < lastScroll - 5 && navHidden) {
      navbar.classList.remove('hidden');
      navHidden = false;
    }
  } else {
    navbar.classList.remove('hidden');
    navHidden = false;
  }
  lastScroll = y;
}, { passive:true });

/* =========================================================
   HERO
   ========================================================= */
let heroShows = [SHOWS[0], SHOWS[9], SHOWS[17]];
let heroIndex = 0;
let heroTimer = null;

function renderHero(){
  const slides = $('#heroSlides');
  const controls = $('#heroControls');
  slides.innerHTML = '';
  controls.innerHTML = '';

  heroShows.forEach((show, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <div class="hero-bg" style="background-image:url('${esc(show.backdrop)}')"></div>
      <div class="hero-veil"></div>
      <div class="hero-grain"></div>
      <div class="hero-particles" data-particles="${i}"></div>
      <div class="hero-content">
        <div class="hero-tag">N+ Original</div>
        <h1 class="hero-title">${esc(show.title)}</h1>
        <div class="hero-meta">
          <span class="hero-match">${esc(show.match)}% relevante</span>
          <span>${esc(show.year)}</span>
          <span class="hero-rating">${esc(show.rating)}</span>
          <span>${esc(show.duration)}</span>
          <span>HD</span>
        </div>
        <p class="hero-synopsis">${esc(show.synopsis)}</p>
        <div class="hero-buttons">
          <button class="btn-play" data-play="${esc(show.id)}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <span>Assistir</span>
          </button>
          <button class="btn-info" data-info="${esc(show.id)}">
            <svg viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            <span>Mais informações</span>
          </button>
        </div>
      </div>
    `;
    slides.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToHero(i));
    controls.appendChild(dot);
  });

  // Particles for active slide
  spawnHeroParticles();


}

function spawnHeroParticles(){
  const p = document.querySelector('.hero-slide.active .hero-particles');
  if (!p) return;
  p.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = (60 + Math.random() * 40) + '%';
    particle.style.animationDuration = (8 + Math.random() * 8) + 's';
    particle.style.animationDelay = (Math.random() * 4) + 's';
    particle.style.opacity = 0;
    p.appendChild(particle);
  }
}

function goToHero(i){
  heroIndex = i;
  $$('.hero-slide').forEach((s, idx) => s.classList.toggle('active', idx === i));
  $$('.hero-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  spawnHeroParticles();
  clearTimeout(heroTimer);
  heroTimer = setTimeout(nextHero, 8000);
}

function nextHero(){
  goToHero((heroIndex + 1) % heroShows.length);
}

function startHeroRotation(){
  clearTimeout(heroTimer);
  heroTimer = setTimeout(nextHero, 8000);
}

/* =========================================================
   ROW BUILDER
   ========================================================= */
function buildCard(show, opts = {}){
  const inList = myList.has(show.id);
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = show.id;
  card.innerHTML = `
    <div class="card-loading"></div>
    <div class="card-img-wrap">
      <img src="${esc(show.poster)}" alt="${esc(show.title)}" loading="lazy" onload="this.previousElementSibling && this.previousElementSibling.remove()">
    </div>
    <div class="card-badges">
      ${show.isOriginal ? '<div class="card-badge original">N+</div>' : ''}
      ${show.isNew ? '<div class="card-badge new">Novo</div>' : ''}
    </div>
    <div class="card-overlay">
      <h4 class="card-title">${esc(show.title)}</h4>
      <div class="card-actions">
        <button class="card-btn play" data-play="${esc(show.id)}" aria-label="Assistir">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="card-btn ${inList ? 'active' : ''}" data-list="${esc(show.id)}" aria-label="Lista">
          ${inList ? '✓' : '+'}
        </button>
        <button class="card-btn" data-info="${esc(show.id)}" aria-label="Mais">
          <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
      </div>
      <div class="card-info">
        <span class="card-match">${esc(show.match)}%</span>
        <span class="card-rating">${esc(show.rating)}</span>
        <span class="card-duration">${esc(show.duration)}</span>
      </div>
      <div class="card-genres">${esc(show.genre)}</div>
    </div>
    ${opts.continue && show.progress ? `<div class="card-progress"><div class="card-progress-fill" style="width:${show.progress*100}%"></div></div>` : ''}
  `;

  // 3D tilt on hover
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = (x / rect.width - 0.5) * 8;
    const dy = (y / rect.height - 0.5) * 8;
    card.style.transform = `scale(1.06) translateY(-4px) rotateX(${-dy}deg) rotateY(${dx}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });

  card.addEventListener('click', e => {
    if (e.target.closest('[data-play]')) { e.stopPropagation(); openVideo(show.id); return; }
    if (e.target.closest('[data-list]')) { e.stopPropagation(); toggleList(show.id); return; }
    if (e.target.closest('[data-info]')) { e.stopPropagation(); openModal(show.id); return; }
    openModal(show.id);
  });

  return card;
}

function buildTop10(show, rank){
  const item = document.createElement('div');
  item.className = 'top10-item';
  item.dataset.id = show.id;
  item.innerHTML = `
    <div class="top10-number">${rank}</div>
    <div class="top10-poster">
      <img src="${esc(show.poster)}" alt="${esc(show.title)}" loading="lazy">
    </div>
  `;
  item.addEventListener('click', () => openModal(show.id));
  return item;
}

function buildRow({title, shows, top10 = false, continueWatching = false, icon = '◆'}){
  const row = document.createElement('div');
  row.className = 'row' + (top10 ? ' row-top10' : '');
  row.innerHTML = `
    <div class="row-header">
      <h3 class="row-title"><span class="row-title-icon">${icon}</span>${title}</h3>
      <span class="row-see-all">Ver tudo ›</span>
    </div>
    <div class="row-container">
      <button class="row-arrow prev" aria-label="Anterior">‹</button>
      <div class="row-track"></div>
      <button class="row-arrow next" aria-label="Próximo">›</button>
    </div>
  `;

  const track = row.querySelector('.row-track');
  if (top10) {
    shows.slice(0, 10).forEach((s, i) => track.appendChild(buildTop10(s, i + 1)));
  } else {
    shows.forEach(s => track.appendChild(buildCard(s, { continue: continueWatching })));
  }

  const prevBtn = row.querySelector('.row-arrow.prev');
  const nextBtn = row.querySelector('.row-arrow.next');
  const scrollAmt = () => track.clientWidth * 0.82;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));

  // Hide arrows on edges
  function updateArrows(){
    prevBtn.classList.toggle('hide', track.scrollLeft < 10);
    nextBtn.classList.toggle('hide', track.scrollLeft > track.scrollWidth - track.clientWidth - 10);
  }
  track.addEventListener('scroll', updateArrows, { passive:true });
  setTimeout(updateArrows, 100);

  // Reveal on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        row.classList.add('in');
        obs.unobserve(row);
      }
    });
  }, { threshold: 0.05 });
  obs.observe(row);

  return row;
}

function renderAll(){
  renderHero();
  const wrap = $('#rowsWrap');
  wrap.innerHTML = '';

  const continueShows = SHOWS.filter(s => s.categories.includes('continue') && s.progress);
  if (continueShows.length) {
    wrap.appendChild(buildRow({
      title: 'Continuar assistindo',
      shows: continueShows,
      continueWatching: true,
      icon: '▸'
    }));
  }

  const top10 = SHOWS.filter(s => s.categories.includes('top10')).slice(0, 10);
  wrap.appendChild(buildRow({
    title: 'Top 10 no Brasil hoje',
    shows: top10,
    top10: true,
    icon: '★'
  }));

  const originals = SHOWS.filter(s => s.categories.includes('originals'));
  if (originals.length) wrap.appendChild(buildRow({ title: 'N+ Originals', shows: originals, icon: '✦' }));

  const trending = SHOWS.filter(s => s.categories.includes('trending'));
  if (trending.length) wrap.appendChild(buildRow({ title: 'Bombando agora', shows: trending, icon: '◆' }));

  const romance = SHOWS.filter(s => s.categories.includes('romance'));
  if (romance.length) wrap.appendChild(buildRow({ title: 'Para os corações apaixonados', shows: romance, icon: '❤' }));

  const comedy = SHOWS.filter(s => s.categories.includes('comedy'));
  if (comedy.length) wrap.appendChild(buildRow({ title: 'Comédias para rir juntos', shows: comedy, icon: '☺' }));

  const adventure = SHOWS.filter(s => s.categories.includes('adventure'));
  if (adventure.length) wrap.appendChild(buildRow({ title: 'Aventuras a dois', shows: adventure, icon: '✈' }));

  const docs = SHOWS.filter(s => s.categories.includes('docs'));
  if (docs.length) wrap.appendChild(buildRow({ title: 'Documentários que marcaram', shows: docs, icon: '▣' }));

  renderMyList();
}

function renderMyList(){
  const existing = $('#myListRow');
  if (existing) existing.remove();

  const listShows = SHOWS.filter(s => myList.has(s.id));
  if (!listShows.length) return;

  const row = buildRow({ title: 'Minha lista', shows: listShows, icon: '♡' });
  row.id = 'myListRow';
  $('#rowsWrap').appendChild(row);
}

/* =========================================================
   TOGGLE LIST
   ========================================================= */
function toggleList(id){
  if (myList.has(id)) {
    myList.delete(id);
    showToast('Removido da Minha Lista');
  } else {
    myList.add(id);
    showToast('Adicionado à Minha Lista');
  }
  renderAll();
  if ($('#modal').classList.contains('on')) {
    const listBtn = $('#modalInner').querySelector('[data-modal-list]');
    if (listBtn) {
      const inList = myList.has(id);
      listBtn.classList.toggle('active', inList);
      listBtn.innerHTML = inList ? '✓' : '+';
    }
  }
}

/* =========================================================
   MODAL
   ========================================================= */
const modal = $('#modal');
const modalInner = $('#modalInner');

function openModal(id){
  const show = SHOWS.find(s => s.id === id);
  if (!show) return;
  const inList = myList.has(show.id);

  modalInner.innerHTML = `
    <div class="modal-hero">
      <div class="modal-hero-img" id="modalHeroImg" style="background-image:url('${esc(show.backdrop)}')"></div>
      <div class="modal-hero-veil"></div>
      <button class="modal-close" id="modalClose">✕</button>
      <div class="modal-hero-content">
        <div class="modal-tag">${show.isOriginal ? 'N+ Original' : 'NOSSOFLIX+'}</div>
        <h2 class="modal-hero-title">${esc(show.title)}</h2>
        <div class="modal-hero-buttons">
          <button class="modal-btn primary" data-play="${esc(show.id)}">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Assistir
          </button>
          <button class="modal-btn secondary ${inList ? 'active' : ''}" data-modal-list="${esc(show.id)}">
            ${inList ? '✓' : '+'}
          </button>
          <button class="modal-btn secondary">
            <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-meta">
        <span class="modal-match">${esc(show.match)}% relevante</span>
        <span class="modal-year">${esc(show.year)}</span>
        <span class="modal-rating">${esc(show.rating)}</span>
        <span class="modal-duration">${esc(show.duration)}</span>
        <span>HD</span>
      </div>
      <p class="modal-synopsis">${esc(show.synopsis)}</p>
      <div class="modal-tags">
        <span class="modal-tag-pill"><strong>Gênero:</strong> ${esc(show.genre)}</span>
        <span class="modal-tag-pill"><strong>Duração:</strong> ${esc(show.duration)}</span>
      </div>
      ${show.episodes > 0 ? `
        <div class="modal-episodes">
          <h4>Episódios <span>${esc(show.episodes)} episódios</span></h4>
          <div>
            ${Array.from({length: Math.min(show.episodes, 5)}).map((_, i) => `
              <div class="episode">
                <div class="episode-num">${i + 1}</div>
                <div class="episode-img">
                  <img src="${esc(show.backdrop)}" alt="">
                </div>
                <div class="episode-info">
                  <div class="episode-header">
                    <div class="episode-title">${esc(show.title)} · Ep ${i + 1}</div>
                    <div class="episode-duration">${30 + i * 4}min</div>
                  </div>
                  <p class="episode-synopsis">${esc(show.synopsis.slice(0, 110))}...</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('on');
  document.body.style.overflow = 'hidden';

  // Parallax hero image
  const heroImg = modalInner.querySelector('#modalHeroImg');
  modalInner.addEventListener('mousemove', e => {
    const rect = heroImg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroImg.style.transform = `translate(${x * 20}px, ${y * 20}px) scale(1.05)`;
  });

  // Listeners
  modalInner.querySelector('#modalClose').addEventListener('click', closeModal);
  modalInner.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => {
    closeModal();
    setTimeout(() => openVideo(show.id), 250);
  }));
  modalInner.querySelectorAll('[data-modal-list]').forEach(b => b.addEventListener('click', () => toggleList(show.id)));
  modalInner.querySelectorAll('.episode').forEach(b => b.addEventListener('click', () => {
    closeModal();
    setTimeout(() => openVideo(show.id), 250);
  }));
}

function closeModal(){
  modal.classList.remove('on');
  document.body.style.overflow = '';
}

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

/* =========================================================
   VIDEO PLAYER
   ========================================================= */
const vp = $('#videoPlayer');
let vpPlaying = false;
let vpProgressVal = 0;
let vpTimer = null;
const VP_DUR = 30;

function openVideo(id){
  const show=SHOWS.find(s=>s.id===id);if(!show)return;
  clearInterval(vpTimer);const video=$('#naNetflixVideo');video.pause();
  const index=SHOWS.indexOf(show),src=naNetflixPayload.videos[index%Math.max(1,naNetflixPayload.videos.length)]||'';
  if(src){video.src=src;video.poster=show.backdrop;video.load();}else{video.removeAttribute('src');video.load();}
  video.hidden=!src;vp.classList.toggle('na-real-video',!!src);
  $('#vpBackdrop').style.backgroundImage='url("'+show.backdrop+'")';
  $('#vpTitle').textContent=show.title;$('#vpTitleBar').textContent=show.title;
  $('#vpSubtitle').textContent=src?'Nosso vídeo':show.synopsis;
  vpProgressVal=0;vpPlaying=false;updateVP();updateVPBtn();
  vp.classList.add('on');document.body.style.overflow='hidden';$('#vpSkip').hidden=!src;
}

function closeVideo(){vp.classList.remove('on');document.body.style.overflow='';clearInterval(vpTimer);$('#naNetflixVideo').pause();vpPlaying=false;updateVPBtn();}

function updateVP(){const video=$('#naNetflixVideo');const real=!!video?.getAttribute('src');const duration=real?(Number.isFinite(video.duration)?video.duration:0):Math.max(1,naNetflixPayload.photos.length)*3;const position=real?video.currentTime:vpProgressVal;const pct=duration?position/duration*100:0;$('#vpProgressFill').style.width=pct+'%';$('#vpBuffered').style.width=pct+'%';$('#vpTime').textContent=NAExclusive.time(position)+' / '+NAExclusive.time(duration);}

function formatT(s){
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function updateVPBtn(){
  const b = $('#vpPlayBtn');
  b.innerHTML = vpPlaying
    ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  $('#vpPlayBig').classList.toggle('playing', vpPlaying);
}

function toggleVP(){
  const video=$('#naNetflixVideo');clearInterval(vpTimer);
  if(video.getAttribute('src')){if(video.paused)video.play().catch(()=>showToast('Toque novamente para assistir.'));else video.pause();return;}
  vpPlaying=!vpPlaying;updateVPBtn();
  if(vpPlaying){let index=0;const photos=naNetflixPayload.photos;vpTimer=setInterval(()=>{index++;if(index>=photos.length){clearInterval(vpTimer);vpPlaying=false;updateVPBtn();return;}$('#vpBackdrop').style.backgroundImage='url("'+photos[index]+'")';vpProgressVal=index*3;updateVP();},3000);}
}

$('#vpPlayBig').addEventListener('click', toggleVP);
$('#vpPlayBtn').addEventListener('click', toggleVP);
$('#vpClose').addEventListener('click', closeVideo);
$('#vpSkip').addEventListener('click', () => {
  const video=$('#naNetflixVideo');if(video?.getAttribute('src')&&Number.isFinite(video.duration))video.currentTime=Math.min(video.duration,video.currentTime+5);
  updateVP();
  showToast('Abertura pulada');
  $('#vpSkip').style.display = 'none';
});

$('#vpProgress').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const video=$('#naNetflixVideo');if(video)NAExclusive.seek(video,(e.clientX-rect.left)/rect.width);
  updateVP();
});

document.addEventListener('keydown', e => {
  if (vp.classList.contains('on')) {
    if (e.key === 'Escape') closeVideo();
    if (e.key === ' ') { e.preventDefault(); toggleVP(); }
  } else if (modal.classList.contains('on')) {
    if (e.key === 'Escape') closeModal();
  } else if ($('#searchOverlay').classList.contains('on')) {
    if (e.key === 'Escape') closeSearch();
  }
  // Keyboard shortcut: "/" opens search
  if (e.key === '/' && !$('#profileSelector').classList.contains('on') && !vp.classList.contains('on') && !modal.classList.contains('on') && !$('#searchOverlay').classList.contains('on')) {
    e.preventDefault();
    openSearch();
  }
});

/* =========================================================
   SEARCH
   ========================================================= */
const searchOverlay = $('#searchOverlay');
const searchInput = $('#searchInput');
const searchResults = $('#searchResults');
const searchLabel = $('#searchLabel');

function openSearch(){
  searchOverlay.classList.add('on');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput.focus(), 100);
  renderSearch('');
}

$('#searchBtn').addEventListener('click', openSearch);
$('#searchClose').addEventListener('click', closeSearch);

function closeSearch(){
  searchOverlay.classList.remove('on');
  document.body.style.overflow = '';
  searchInput.value = '';
}

function renderSearch(query){
  const q = query.toLowerCase().trim();
  const results = q
    ? SHOWS.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.synopsis.toLowerCase().includes(q)
      )
    : SHOWS.slice(0, 12);

  searchLabel.textContent = q
    ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} para "${query}"`
    : 'Sugestões para você';

  if (!results.length) {
    searchResults.innerHTML = '<div class="search-empty">Nenhum resultado encontrado.<br>Tente outro termo, como <strong>"romance"</strong> ou <strong>"aventura"</strong>.</div>';
    return;
  }

  searchResults.innerHTML = '';
  results.forEach(s => {
    const d = document.createElement('div');
    d.className = 'search-result';
    d.innerHTML = `<img src="${esc(s.poster)}" alt="${esc(s.title)}" loading="lazy">`;
    d.addEventListener('click', () => {
      closeSearch();
      setTimeout(() => openModal(s.id), 200);
    });
    searchResults.appendChild(d);
  });
}

searchInput.addEventListener('input', e => renderSearch(e.target.value));

/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */
const notifPanel = $('#notifPanel');
const notifList = $('#notifList');

function renderNotifs(){
  if (!NOTIFS.length) {
    notifList.innerHTML = '<div class="notif-empty">Nenhuma novidade por aqui.</div>';
    return;
  }
  notifList.innerHTML = '';
  NOTIFS.forEach(n => {
    const d = document.createElement('div');
    d.className = 'notif-item';
    d.innerHTML = `
      <div class="notif-thumb"><img src="${esc(n.thumb)}" alt=""></div>
      <div class="notif-body">
        <div class="notif-text">${esc(n.title)}</div>
        <div class="notif-time">${esc(n.time)}</div>
      </div>
      <div class="notif-dot"></div>
    `;
    d.addEventListener('click', () => {
      notifPanel.classList.remove('on');
      openModal(n.showId);
    });
    notifList.appendChild(d);
  });
}

$('#notifBtn').addEventListener('click', e => {
  e.stopPropagation();
  notifPanel.classList.toggle('on');
});

document.addEventListener('click', e => {
  if (!notifPanel.contains(e.target) && !e.target.closest('#notifBtn')) {
    notifPanel.classList.remove('on');
  }
});

function clearNotifs(){
  NOTIFS.length = 0;
  renderNotifs();
  $('.nav-badge').style.display = 'none';
  showToast('Notificações marcadas como lidas');
}

/* =========================================================
   MUSIC PLAYER
   ========================================================= */
const audio = $('#audio');
const mpPlay = $('#mpPlay');
const musicPlayer = $('#musicPlayer');

function toggleMusic(){
  if (audio.paused) {
    audio.play().then(() => {
      musicPlayer.classList.add('playing');
      mpPlay.textContent = '❚❚';
    }).catch(() => showToast('Áudio indisponível'));
  } else {
    audio.pause();
    musicPlayer.classList.remove('playing');
    mpPlay.textContent = '▶';
  }
}

mpPlay.addEventListener('click', toggleMusic);
audio.addEventListener('pause', () => { musicPlayer.classList.remove('playing'); mpPlay.textContent = '▶'; });
audio.addEventListener('play', () => { musicPlayer.classList.add('playing'); mpPlay.textContent = '❚❚'; });

/* =========================================================
   INIT
   ========================================================= */
renderNotifs();

document.querySelectorAll('[data-na-action="1"]').forEach(el=>el.addEventListener("click",function(event){window.scrollTo({top:0,behavior:'smooth'})}));

document.querySelectorAll('[data-na-action="2"]').forEach(el=>el.addEventListener("click",function(event){clearNotifs()}));

/* Dados do formulário e funções específicas do modelo. */

let naNetflixPayload={photos:[],videos:[],p:{}};
const naNetflixDefaults=NAExclusive.clone({shows:SHOWS,notifications:NOTIFS});
const naNetflixVideo=document.createElement('video');naNetflixVideo.id='naNetflixVideo';naNetflixVideo.playsInline=true;naNetflixVideo.preload='metadata';naNetflixVideo.hidden=true;$('.vp-stage').prepend(naNetflixVideo);
for(const type of ['play','pause','ended','timeupdate','loadedmetadata'])naNetflixVideo.addEventListener(type,()=>{vpPlaying=!naNetflixVideo.paused&&!naNetflixVideo.ended;if(type==='play')audio.pause();updateVPBtn();updateVP();});
const naLetter=document.createElement('section');naLetter.id='naNetflixLetter';naLetter.className='na-extra-section';naLetter.innerHTML='<h3>Para você,</h3><p>Sua carta aparecerá aqui.</p><div class="signature"></div>';document.querySelector('footer,.footer')?.before(naLetter);
$('#heroSlides').addEventListener('click',e=>{const play=e.target.closest('[data-play]'),info=e.target.closest('[data-info]');if(play)openVideo(Number(play.dataset.play));else if(info)openModal(Number(info.dataset.info));});
const naCatalogLinks=[...document.querySelectorAll('.nav-links .nav-link')];naCatalogLinks.forEach((link,index)=>{link.href='#rowsWrap';link.addEventListener('click',e=>{e.preventDefault();naCatalogLinks.forEach(el=>el.classList.toggle('active',el===link));if(index===0){renderAll();window.scrollTo({top:0,behavior:'smooth'});return;}const shows=SHOWS.filter(show=>index===1?show.episodes>0:index===2?show.episodes===0:index===3?show.categories.includes('trending'):myList.has(show.id));const wrap=$('#rowsWrap');wrap.replaceChildren();if(shows.length){const row=buildRow({title:link.textContent.trim(),shows});if(index===4)row.id='myListRow';wrap.append(row);}else{const empty=document.createElement('p');empty.textContent='Adicione títulos à sua lista para vê-los aqui.';wrap.append(empty);}wrap.scrollIntoView({behavior:'smooth'});});});
const naProfile=$('.nav-profile');naProfile.setAttribute('role','button');naProfile.setAttribute('aria-label','Trocar perfil');naProfile.tabIndex=0;naProfile.addEventListener('click',()=>{$('#profileSelector').hidden=false;$('#profileSelector').classList.add('on');});naProfile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();naProfile.click();}});$('.ps-manage').textContent='Escolher um perfil';$('.ps-manage').addEventListener('click',()=>$('.ps-profile').focus());
const naVPButtons=[...document.querySelectorAll('.vp-controls-row .vp-btn')];
for(const [i,label] of ['Reproduzir ou pausar','Recomeçar vídeo','Ativar ou desativar som','Informações do vídeo','Tela cheia'].entries())naVPButtons[i]?.setAttribute('aria-label',label);
naVPButtons[1]?.addEventListener('click',()=>{naNetflixVideo.currentTime=0;});naVPButtons[2]?.addEventListener('click',()=>{naNetflixVideo.muted=!naNetflixVideo.muted;});naVPButtons[3]?.addEventListener('click',()=>showToast('Vídeo enviado por quem criou este presente.'));naVPButtons[4]?.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else vp.requestFullscreen?.();});
NAExclusive.connect({key:'netflix',letters:['#naNetflixLetter'],player:'#musicPlayer',textSelector:'#profileSelector .ps-name',excludeSelector:'#heroSlides,#rowsWrap,#naNetflixLetter',
  collections:{shows:{label:'Catálogo de títulos e episódios',value:SHOWS},notifications:{label:'Notificações do catálogo',value:NOTIFS}},
  apply(payload){const {p,photos,custom}=payload,c=custom.collections||{};naNetflixPayload=payload;
    const shows=NAExclusive.items(naNetflixDefaults.shows,c.shows,payload,['poster','backdrop'],true);
    shows.forEach((show,i)=>{show.id=naNetflixDefaults.shows[i]?.id||i+1;show.categories=Array.isArray(show.categories)?show.categories:[];});
    if(shows[0]){shows[0].title=p.titulo||'Nossa história';shows[0].synopsis=p.carta||p.frase||'Uma história feita para você.';}
    NAExclusive.change(SHOWS,shows,()=>{heroShows=[SHOWS[0],SHOWS[9],SHOWS[17]].filter(Boolean);heroIndex=0;renderAll();});
    const notifs=NAExclusive.items(naNetflixDefaults.notifications,c.notifications,payload,['thumb']);NAExclusive.change(NOTIFS,notifs,renderNotifs);
    NATheme.set('[data-profile="ele"] .ps-name',p.de||'Eu');NATheme.set('[data-profile="ela"] .ps-name',p.para||'Você');
    window.naSkipProfiles=new URLSearchParams(location.search).get('embed')==='1'||!p.usarIntro;
    if(window.naSkipProfiles){$('#profileSelector').classList.remove('on');$('#profileSelector').hidden=true;$('#musicPlayer').classList.add('show');}else $('#profileSelector').hidden=false;
    NATheme.set('#mpTitle',p.musicaNome||'Nossa música');NATheme.set('#mpArtist',p.musicaArtista||p.de+' & '+p.para);
    const musicCover=document.querySelector('.mp-cover img');if(musicCover)musicCover.src=payload.cover||NAExclusive.placeholder(p.titulo);
    NAExclusive.history(payload,'#naNetflixLetter');
  },dispose(){clearInterval(heroTimer);clearInterval(vpTimer);naNetflixVideo.pause();}
});

NAExclusive.keyboard();
