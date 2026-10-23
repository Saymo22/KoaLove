
/* =========================================================
   DATA
   ========================================================= */
const POSTERS = [
  {
    title:'O Primeiro Olhar',
    genre:'Romance · Estreia',
    year:'2018',
    rating:'10',
    tag:'Estreia',
    director:'Nós dois',
    duration:'Para sempre',
    synopsis:'O filme que abriu a nossa história. Um olhar, um café, e a certeza de que o roteiro tinha acabado de ser escrito. Ninguém sabia — mas a plateia inteira já estava esperando por esse final.',
    cover:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=85&auto=format&fit=crop'
  },
  {
    title:'O Primeiro Verão',
    genre:'Romance · Aventura',
    year:'2019',
    rating:'9.8',
    tag:'Clássico',
    director:'O sol e você',
    duration:'1 verão · eterno',
    synopsis:'A temporada que virou o nosso ponto de virada. Cada cena é um dia que a gente não queria que terminasse. E não terminou — ficou guardado para sempre no fotograma.',
    cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=85&auto=format&fit=crop'
  },
  {
    title:'A Viagem',
    genre:'Aventura · Romance',
    year:'2021',
    rating:'9.9',
    tag:'Aclamado',
    director:'A estrada',
    duration:'3 dias · 400 fotos',
    synopsis:'O plano sequência mais bonito do nosso filme. Perdidos no mapa, felizes no caminho. Voltamos com fotos ruins, memórias boas, e a certeza de que qualquer lugar fica bom se você estiver.',
    cover:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85&auto=format&fit=crop'
  }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=85&auto=format&fit=crop', cap:'Take 01 · O primeiro olhar ✦' },
  { img:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=85&auto=format&fit=crop', cap:'Take 02 · Conversas de madrugada' },
  { img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=85&auto=format&fit=crop', cap:'Take 03 · A viagem que mudou tudo' },
  { img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85&auto=format&fit=crop', cap:'Take 04 · Nosso lar' },
  { img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85&auto=format&fit=crop', cap:'Take 05 · O grande "sim" ❤' }
];

const POPCORN_LABELS = {
  1: 'Só uma pipoca? Tô magoado.',
  2: 'Duas pipocas? Poxa...',
  3: 'Três? Tá bom, aceito.',
  4: 'Quatro! Quase perfeito.',
  5: 'Cinco pipocas! Sabia que você tinha bom gosto ✦'
};

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
  t._timer = setTimeout(() => t.classList.remove('on'), 3200);
}

/* =========================================================
   CURSOR
   ========================================================= */
const cursor = $('#cursor');
let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

document.addEventListener('mouseover', e => {
  if (e.target.closest('button, .poster, .story-thumb, .frame, .award, .popcorn-icon, a, .pm-close')) {
    cursor.classList.add('grow');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('button, .poster, .story-thumb, .frame, .award, .popcorn-icon, a, .pm-close')) {
    cursor.classList.remove('grow');
  }
});

/* =========================================================
   SCROLL
   ========================================================= */
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  $('#scrollBar').style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  $('#toTop').classList.toggle('on', window.scrollY > 600);
}, { passive:true });

$('#toTop').addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* =========================================================
   REVEAL
   ========================================================= */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
$$('[data-reveal]').forEach(el => obs.observe(el));

// Special observer for credits blocks and frames
const obs2 = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      obs2.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$('.credits-block, .frame').forEach(el => obs2.observe(el));

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#loader').classList.add('done');
  }, 2800);
});

// Countdown animation
setTimeout(() => { const el = $('.loader-countdown'); if (el) el.textContent = '2'; }, 800);
setTimeout(() => { const el = $('.loader-countdown'); if (el) el.textContent = '1'; }, 1600);

/* =========================================================
   HERO BULBS
   ========================================================= */
const heroBulbs = $('#heroBulbs');
const board = $('.marquee-board');

function createBulbs(){
  if (!board) return;
  const rect = board.getBoundingClientRect();
  const gap = 24;
  const perSideX = Math.floor(rect.width / gap);
  const perSideY = Math.floor(rect.height / gap);

  // Top
  for (let i = 0; i <= perSideX; i++) {
    const b = document.createElement('div');
    b.className = 'bulb';
    b.style.left = (i * gap) + 'px';
    b.style.top = '-4px';
    heroBulbs.appendChild(b);
  }
  // Bottom
  for (let i = 0; i <= perSideX; i++) {
    const b = document.createElement('div');
    b.className = 'bulb';
    b.style.left = (i * gap) + 'px';
    b.style.bottom = '-4px';
    heroBulbs.appendChild(b);
  }
  // Left
  for (let i = 1; i < perSideY; i++) {
    const b = document.createElement('div');
    b.className = 'bulb';
    b.style.left = '-4px';
    b.style.top = (i * gap) + 'px';
    heroBulbs.appendChild(b);
  }
  // Right
  for (let i = 1; i < perSideY; i++) {
    const b = document.createElement('div');
    b.className = 'bulb';
    b.style.right = '-4px';
    b.style.top = (i * gap) + 'px';
    heroBulbs.appendChild(b);
  }
}

window.addEventListener('load', () => setTimeout(createBulbs, 500));
window.addEventListener('resize', () => {
  heroBulbs.innerHTML = '';
  createBulbs();
});

/* =========================================================
   POSTERS
   ========================================================= */
const grid = $('#featureGrid');
function naRenderPosters(){
grid.replaceChildren();
POSTERS.forEach((p, i) => {
  const el = document.createElement('div');
  el.className = 'poster';
  el.innerHTML = `
    <img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">
    <div class="poster-rating">${esc(p.rating)}</div>
    <div class="poster-tag">${esc(p.tag)}</div>
    <div class="poster-info">
      <div class="poster-genre">${esc(p.genre)}</div>
      <div class="poster-title">${esc(p.title)}</div>
      <div class="poster-year">${esc(p.year)}</div>
    </div>
  `;
  el.addEventListener('click', () => openPosterModal(p));
  grid.appendChild(el);
});

}
naRenderPosters();
/* =========================================================
   POSTER MODAL
   ========================================================= */
const posterModal = $('#posterModal');
const posterModalInner = $('#posterModalInner');

function openPosterModal(poster){
  posterModalInner.innerHTML = `
    <div class="pm-poster" style="background-image:url('${esc(poster.cover)}')"></div>
    <div class="pm-body">
      <button class="pm-close" id="pmClose">✕</button>
      <div class="pm-badge">${esc(poster.tag)} · ${esc(poster.year)}</div>
      <h2 class="pm-title">${esc(poster.title)}</h2>
      <div class="pm-meta">
        <div class="pm-meta-item">
          <span class="pm-meta-label">Direção</span>
          <span class="pm-meta-value">${esc(poster.director)}</span>
        </div>
        <div class="pm-meta-item">
          <span class="pm-meta-label">Duração</span>
          <span class="pm-meta-value">${esc(poster.duration)}</span>
        </div>
        <div class="pm-meta-item">
          <span class="pm-meta-label">Nota</span>
          <span class="pm-meta-value">${esc(poster.rating)} / 10</span>
        </div>
      </div>
      <p class="pm-synopsis">${esc(poster.synopsis)}</p>
    </div>
  `;
  posterModal.classList.add('on');
  document.body.style.overflow = 'hidden';

  posterModalInner.querySelector('#pmClose').addEventListener('click', closePosterModal);
}

function closePosterModal(){
  posterModal.classList.remove('on');
  document.body.style.overflow = '';
}

posterModal.addEventListener('click', e => {
  if (e.target === posterModal) closePosterModal();
});

/* =========================================================
   STORIES
   ========================================================= */
const rail = $('#storiesRail');
function naRenderStories(){
rail.replaceChildren();
STORIES.forEach((s, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'story-thumb';
  thumb.dataset.index = i;
  thumb.innerHTML = `
    <div class="story-ring">
      <img src="${esc(s.img)}" alt="">
      <div class="story-play">▶</div>
    </div>
    <p>Take ${i + 1}</p>
  `;
  rail.appendChild(thumb);
});

}
naRenderStories();
const viewer = $('#storyViewer');
const storyProgress = $('#storyProgress');
const storyMedia = $('#storyMedia');
const storyCap = $('#storyCap');
const storyAva = $('#storyAva');
const storyTime = $('#storyTime');
let storyIndex = 0;
let storyTimer = null;

function buildProgress(){
  storyProgress.innerHTML = '';
  STORIES.forEach(() => {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<div class="seg-fill"></div>';
    storyProgress.appendChild(seg);
  });
}

function renderStory(i){
  if(!STORIES.length)return;
  storyIndex = i;
  const data = STORIES[i];

  storyMedia.innerHTML = '';
  const img=NATheme.storyMedia(data,storyMedia);

  storyAva.hidden=!data.img;if(data.img)storyAva.src=data.img;else storyAva.removeAttribute('src');
  storyTime.textContent = 'agora';

  storyCap.classList.remove('on');
  storyCap.textContent = data.cap;
  setTimeout(() => storyCap.classList.add('on'), 120);

  const segs = storyProgress.querySelectorAll('.seg');
  segs.forEach((seg, idx) => {
    seg.classList.remove('active', 'done');
    if (idx < i) seg.classList.add('done');
  });
  const active = segs[i];
  if (active) {
    void active.offsetWidth;
    active.classList.add('active');
  }

  clearTimeout(storyTimer);
  if(data.video)img.addEventListener('ended',nextStory,{once:true});else storyTimer=setTimeout(nextStory,5000);
}

function nextStory(){
  if (storyIndex < STORIES.length - 1) renderStory(storyIndex + 1);
  else closeStories();
}
function prevStory(){
  if (storyIndex > 0) renderStory(storyIndex - 1);
  else renderStory(0);
}
function openStories(i){
  buildProgress();
  viewer.classList.add('on');
  document.body.style.overflow = 'hidden';
  renderStory(i);
}
function closeStories(){
  storyMedia.querySelectorAll('video').forEach(v=>v.pause());
  clearTimeout(storyTimer);
  viewer.classList.remove('on');
  document.body.style.overflow = '';
}

rail.addEventListener('click', e => {
  const t = e.target.closest('.story-thumb');
  if (t) openStories(+t.dataset.index);
});

$('#storyClose').addEventListener('click', closeStories);
$('#tapNext').addEventListener('click', nextStory);
$('#tapPrev').addEventListener('click', prevStory);

document.addEventListener('keydown', e => {
  if (!viewer.classList.contains('on')) return;
  if (e.key === 'Escape') closeStories();
  if (e.key === 'ArrowRight') nextStory();
  if (e.key === 'ArrowLeft') prevStory();
});

/* =========================================================
   STATS COUNT UP
   ========================================================= */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1800;
      const start = performance.now();
      function tick(t){
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('pt-BR');
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });
$$('.stat-num').forEach(el => statObserver.observe(el));

/* =========================================================
   POPCORN RATING
   ========================================================= */
const popcornIcons = $$('.popcorn-icon');
const popcornHint = $('#popcornHint');

popcornIcons.forEach(icon => {
  icon.addEventListener('mouseenter', () => {
    const rating = +icon.dataset.rating;
    popcornIcons.forEach((el, idx) => {
      el.classList.toggle('active', idx < rating);
    });
    popcornHint.textContent = POPCORN_LABELS[rating];
    popcornHint.classList.add('highlight');
  });

  icon.addEventListener('click', () => {
    const rating = +icon.dataset.rating;
    confettiBurst(20, '🍿');
    if (rating === 5) {
      showToast('Nota máxima! Você tem bom gosto ✦');
    } else {
      showToast(POPCORN_LABELS[rating]);
    }
  });
});

$('#popcornRating').addEventListener('mouseleave', () => {
  popcornIcons.forEach(el => el.classList.remove('active'));
  popcornHint.textContent = 'Passe o mouse e clique em uma pipoca';
  popcornHint.classList.remove('highlight');
});

/* =========================================================
   END LETTERS
   ========================================================= */
const endWord = 'Para Sempre';
const endLetters = $('#endLetters');
endWord.split('').forEach(letter => {
  const span = document.createElement('span');
  span.className = 'end-letter';
  span.textContent = letter === ' ' ? ' ' : letter;
  if (letter === ' ') span.style.width = '20px';
  endLetters.appendChild(span);
});

/* =========================================================
   CONFETTI
   ========================================================= */
function confettiBurst(count = 40, symbol = '★'){
  const symbols = symbol === '🍿'
    ? ['🍿', '🍿', '🍿']
    : ['★','☆','✦','✧','♥','♡'];
  const colors = ['#d4a444','#f2ce7a','#c0272d','#e63a40','#f5ecd6'];

  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    c.style.position = 'fixed';
    c.style.left = (20 + Math.random() * 60) + '%';
    c.style.top = (30 + Math.random() * 30) + '%';
    c.style.color = colors[Math.floor(Math.random() * colors.length)];
    c.style.fontSize = (12 + Math.random() * 22) + 'px';
    c.style.zIndex = '9600';
    c.style.pointerEvents = 'none';
    document.body.appendChild(c);

    const tx = (Math.random() - 0.5) * 500;
    const ty = (Math.random() - 0.5) * 400;

    c.animate([
      { transform: 'translate(-50%,-50%) scale(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx*0.7}px), calc(-50% + ${ty*0.7}px)) scale(1.2) rotate(${Math.random()*360}deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 200}px)) scale(0.2) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], {
      duration: 1600 + Math.random() * 1000,
      easing: 'cubic-bezier(.16,.84,.32,1)',
      fill: 'forwards'
    });

    setTimeout(() => c.remove(), 2800);
  }
}

/* =========================================================
   EASTER EGG — digite "cinema"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 10) typed = typed.slice(-10);
  if (typed.includes('cinema')) {
    typed = '';
    confettiBurst(60, '★');
    showToast('Luzes, câmera, ação ✦');
  }
});

/* Dados do formulário e funções específicas do modelo. */

const naCinemaDefaults=NAExclusive.clone(POSTERS);
const naCinemaMusic=document.createElement('section');naCinemaMusic.id='naCinemaMusic';naCinemaMusic.className='na-extra-section';naCinemaMusic.innerHTML='<h3 id="pTitle">Nossa música</h3><p id="pArtist"></p>';const naCinemaAudio=$('#audio');naCinemaAudio.controls=true;naCinemaAudio.className='na-core-audio';naCinemaMusic.append(naCinemaAudio);document.querySelector('footer').before(naCinemaMusic);
NAExclusive.connect({key:'cinema',title:'.marquee-title',phrase:'.marquee-tagline',letters:['.clapper-paper'],player:'#naCinemaMusic',excludeSelector:'#featureGrid,#storiesRail,.reel-frames,.clapper-paper,#naCinemaMusic',
  collections:{posters:{label:'Filmes, cartazes e fichas técnicas',value:POSTERS},ratings:{label:'Mensagens da avaliação por pipocas',value:POPCORN_LABELS}},
  apply(payload){const {custom,p}=payload,c=custom.collections||{};
    NAExclusive.change(POSTERS,NAExclusive.items(naCinemaDefaults,c.posters,payload,['cover'],true),naRenderPosters);
    NAExclusive.change(STORIES,NAExclusive.stories(payload),()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!STORIES.length;
    if(c.ratings)Object.assign(POPCORN_LABELS,c.ratings);
    NATheme.timeline(payload,'.reel-frames');NATheme.set('.clapper-title',(p.para||'Você')+',');NATheme.set('.clapper-sign-sig',p.de||'Alguém especial');
  }
});

NAExclusive.keyboard();
