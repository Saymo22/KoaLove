
/* =========================================================
   CONFIG
   ========================================================= */
const CONFIG = {
  songTitle: 'Clair de Lune',
  songArtist: 'Debussy · 1905',
  songCover: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=1000&q=85&auto=format&fit=crop', cap:'A roseira' },
  { src:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&q=85&auto=format&fit=crop', cap:'A trilha' },
  { src:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1000&q=85&auto=format&fit=crop', cap:'Flor de cerejeira' },
  { src:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1000&q=85&auto=format&fit=crop', cap:'O orvalho' },
  { src:'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1000&q=85&auto=format&fit=crop', cap:'A fonte' },
  { src:'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1000&q=85&auto=format&fit=crop', cap:'O portão' },
  { src:'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&q=85&auto=format&fit=crop', cap:'A luz da manhã' },
  { src:'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1000&q=85&auto=format&fit=crop', cap:'A árvore' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=85&auto=format&fit=crop', cap:'O portão se abrindo ✦' },
  { img:'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=900&q=85&auto=format&fit=crop', cap:'A roseira floresceu' },
  { img:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=85&auto=format&fit=crop', cap:'Cada flor, um momento' },
  { img:'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=85&auto=format&fit=crop', cap:'A fonte dos desejos' },
  { img:'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&q=85&auto=format&fit=crop', cap:'Luz entre as folhas ☀' }
];

const WISHES = [
  'Desejo que você nunca deixe de florescer, mesmo nos invernos mais longos.',
  'Desejo que a vida te devolva cada flor que você plantou por aí.',
  'Desejo que você encontre beleza até nos dias cinzentos — porque ela está sempre lá.',
  'Desejo que o amor que você cuida cresça mais do que qualquer tempestade.',
  'Desejo que você sorria mais. Que a vida seja mais leve. Que os dias sejam mais seus.',
  'Desejo que a gente continue plantando juntos, por muitos e muitos anos.',
  'Desejo que você nunca esqueça o quanto é especial — mesmo quando o mundo insistir em não ver.',
  'Desejo que o seu jardim interior seja sempre mais florido do que os espinhos que aparecerem.'
];

const STARS = [
  { x:20, y:30, label:'O primeiro olhar' },
  { x:40, y:20, label:'A primeira conversa' },
  { x:60, y:35, label:'O primeiro "nós"' },
  { x:78, y:25, label:'A primeira viagem' },
  { x:88, y:45, label:'A primeira briga (e reconciliação)' },
  { x:70, y:60, label:'A primeira flor' },
  { x:45, y:70, label:'O primeiro "eu te amo"' },
  { x:25, y:55, label:'O primeiro para sempre' }
];

const BOOK_PAGES = 5;

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    setTimeout(() => document.getElementById('player').classList.add('show'), 700);
    startFireflies();
  }, 1200);
});

/* =========================================================
   FIREFLIES
   ========================================================= */
function startFireflies(){
  const container = document.getElementById('fireflies');
  function spawn(){
    const f = document.createElement('div');
    f.className = 'firefly';
    const size = 2 + Math.random() * 3;
    f.style.width = size + 'px';
    f.style.height = size + 'px';
    f.style.left = Math.random() * 100 + '%';
    f.style.top = Math.random() * 100 + '%';
    f.style.setProperty('--fx', (Math.random() - 0.5) * 300 + 'px');
    f.style.setProperty('--fy', (Math.random() - 0.5) * 300 + 'px');
    const dur = 8 + Math.random() * 10;
    f.style.animationDuration = dur + 's';
    container.appendChild(f);
    setTimeout(() => f.remove(), dur * 1000);
  }
  for (let i = 0; i < 12; i++) setTimeout(spawn, i * 400);
  setInterval(() => {
    if (document.hidden) return;
    if (container.children.length < 25) spawn();
  }, 1500);
}

/* =========================================================
   CURSOR
   ========================================================= */
const cDot = document.getElementById('cDot');
const cRing = document.getElementById('cRing');
let mx = window.innerWidth/2, my = window.innerHeight/2;
let rx = mx, ry = my;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cDot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
});

function ringLoop(){
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
}
ringLoop();

document.querySelectorAll('a, button, .flower, .story-thumb, .vault-letter, .path-stone, .star, .tree-hollow, .gate-lock, .gate-wrap, .fountain-btn, .book-nav button').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('grow'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('grow'));
});

/* =========================================================
   SCROLL
   ========================================================= */
const scrollBar = document.getElementById('scrollBar');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? (window.scrollY / h) * 100 : 0;
  scrollBar.style.width = p + '%';
  toTop.classList.toggle('on', window.scrollY > 600);
}, { passive:true });

toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* =========================================================
   REVEAL
   ========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* =========================================================
   PORTÃO
   ========================================================= */
const gateWrap = document.getElementById('gateWrap');
const gateLock = document.getElementById('gateLock');
let gateOpen = false;

function openGate(){
  if (gateOpen) return;
  gateOpen = true;
  gateWrap.classList.add('open');
  petalBurst(gateLock, 24);
  showToast('O portão se abriu ✦');
}

gateWrap.addEventListener('click', openGate);
gateLock.addEventListener('click', (e) => {
  e.stopPropagation();
  openGate();
});

/* =========================================================
   TRILHA
   ========================================================= */
const pathWrap = document.getElementById('pathWrap');
const pathObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      pathWrap.classList.add('drawn');
      pathObserver.disconnect();
    }
  });
}, { threshold: 0.15 });
if (pathWrap) pathObserver.observe(pathWrap);

/* =========================================================
   FLORES — GALERIA
   ========================================================= */
const gardenEl = document.getElementById('garden');
function naRenderGallery(){
gardenEl.replaceChildren();
GALLERY.forEach((item, i) => {
  const holder = document.createElement('div');
  holder.className = 'flower-holder';

  const petals = [];
  const petalCount = 6;
  for (let p = 0; p < petalCount; p++) {
    const angle = (360 / petalCount) * p;
    const rad = (angle * Math.PI) / 180;
    const cx = 100 + Math.cos(rad) * 42;
    const cy = 100 + Math.sin(rad) * 42;
    petals.push(`<ellipse class="petal" cx="${cx}" cy="${cy}" rx="34" ry="22" transform="rotate(${angle} ${cx} ${cy})"/>`);
  }

  holder.innerHTML = `
    <div class="flower" data-index="${i}">
      <svg class="flower-svg" viewBox="0 0 200 200">
        <defs>
          <clipPath id="clip${i}">
            <circle cx="100" cy="100" r="36"/>
          </clipPath>
        </defs>
        ${petals.join('')}
        <circle class="flower-center" cx="100" cy="100" r="36" fill="#0f1c16" stroke="rgba(232,206,122,.4)" stroke-width="1.5"/>
        <image class="flower-photo" href="${NATheme.escape(item.src)}" x="64" y="64" width="72" height="72" clip-path="url(#clip${i})" preserveAspectRatio="xMidYMid slice"/>
      </svg>
      <span class="flower-label">${NATheme.escape(item.cap)}</span>
    </div>
  `;

  holder.querySelector('.flower').addEventListener('click', () => openLightbox(i));
  gardenEl.appendChild(holder);
});

}
naRenderGallery();
/* =========================================================
   LIGHTBOX
   ========================================================= */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let lbIndex = 0;

function openLightbox(i){
  if(!GALLERY.length)return;
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  lbImg.src = GALLERY[lbIndex].src;
  lightbox.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('on');
  document.body.style.overflow = '';
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => openLightbox(lbIndex - 1));
document.getElementById('lbNext').addEventListener('click', () => openLightbox(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('on')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
});

/* =========================================================
   FONTE
   ========================================================= */
const fountainBtn = document.getElementById('fountainBtn');
const fountainMsg = document.getElementById('fountainMsg');
let usedWishes = [];

fountainBtn.addEventListener('click', () => {
  if (usedWishes.length >= WISHES.length) usedWishes = [];
  const available = WISHES.filter((_, i) => !usedWishes.includes(i));
  const idx = WISHES.indexOf(available[Math.floor(Math.random() * available.length)]);
  usedWishes.push(idx);

  fountainMsg.classList.remove('show');
  setTimeout(() => {
    fountainMsg.textContent = WISHES[idx];
    fountainMsg.classList.add('show');
  }, 200);

  // Ripple effect
  const rect = fountainBtn.getBoundingClientRect();
  rippleEffect(rect.left + rect.width/2, rect.top + rect.height/2);

  petalBurst(fountainBtn, 15);
});

function rippleEffect(x, y){
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const r = document.createElement('div');
      r.style.cssText = `
        position:fixed;left:${x}px;top:${y}px;width:20px;height:20px;
        border:2px solid rgba(232,206,122,.6);border-radius:50%;
        transform:translate(-50%,-50%);pointer-events:none;z-index:9500;
      `;
      document.body.appendChild(r);
      r.animate([
        { transform:'translate(-50%,-50%) scale(1)', opacity:1 },
        { transform:'translate(-50%,-50%) scale(8)', opacity:0 }
      ], { duration: 1500, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards' });
      setTimeout(() => r.remove(), 1600);
    }, i * 200);
  }
}

/* =========================================================
   CONSTELAÇÃO
   ========================================================= */
const constellation = document.getElementById('constellation');
STARS.forEach((star, i) => {
  const s = document.createElement('div');
  s.className = 'star';
  s.style.left = star.x + '%';
  s.style.top = star.y + '%';
  s.style.transform = 'translate(-50%,-50%)';
  s.dataset.index = i;

  const label = document.createElement('span');
  label.className = 'star-label';
  label.textContent = star.label;
  label.style.left = star.x + '%';
  label.style.top = (star.y + 4) + '%';

  s.addEventListener('mouseenter', () => {
    label.style.opacity = '1';
  });
  s.addEventListener('mouseleave', () => {
    label.style.opacity = '0';
  });

  constellation.appendChild(s);
  constellation.appendChild(label);
});

// Animate connections on scroll
const constObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.connection').forEach(c => c.classList.add('drawn'));
      constObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
if (constellation) constObserver.observe(constellation);

/* =========================================================
   ÁRVORE — CARTA
   ========================================================= */
const treeHollow = document.getElementById('treeHollow');
const treeLetter = document.getElementById('treeLetter');

treeHollow.addEventListener('click', () => {
  treeLetter.classList.add('on');
  document.body.style.overflow = 'hidden';
  petalBurst(treeHollow, 20);
});

document.getElementById('tlClose').addEventListener('click', () => {
  treeLetter.classList.remove('on');
  document.body.style.overflow = '';
});
treeLetter.addEventListener('click', e => {
  if (e.target === treeLetter) {
    treeLetter.classList.remove('on');
    document.body.style.overflow = '';
  }
});

/* =========================================================
   LIVRO
   ========================================================= */
const book = document.getElementById('book');
const bookPages = book.querySelectorAll('.book-page');
const bookPrev = document.getElementById('bookPrev');
const bookNext = document.getElementById('bookNext');
const bookCounter = document.getElementById('bookCounter');
let currentPage = 0;

// Inicialmente apenas a página 0 está visível
bookPages.forEach((page, i) => {
  if (i > 0) page.classList.add('flipped');
});

function updateBook(){
  bookPages.forEach((page, i) => {
    if (i <= currentPage - 1) page.classList.add('flipped');
    else if (i === currentPage) page.classList.remove('flipped');
    else page.classList.add('flipped');
  });
  bookCounter.textContent = `${currentPage + 1} / ${BOOK_PAGES}`;
  bookPrev.disabled = currentPage === 0;
  bookNext.disabled = currentPage === BOOK_PAGES - 1;
}

bookPrev.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    updateBook();
    petalBurst(bookPrev, 6);
  }
});

bookNext.addEventListener('click', () => {
  if (currentPage < BOOK_PAGES - 1) {
    currentPage++;
    updateBook();
    petalBurst(bookNext, 6);
  }
});

updateBook();

/* =========================================================
   STORIES
   ========================================================= */
const rail = document.getElementById('storiesRail');
function naRenderStories(){
rail.replaceChildren();
STORIES.forEach((s, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'story-thumb';
  thumb.dataset.index = i;
  thumb.innerHTML = `<div class="story-ring"><img src="${NATheme.escape(s.img)}" alt=""><div class="story-play">▶</div></div><p>Story ${i+1}</p>`;
  rail.appendChild(thumb);
});

}
naRenderStories();
const viewer = document.getElementById('storyViewer');
const storyProgress = document.getElementById('storyProgress');
const storyMedia = document.getElementById('storyMedia');
const storyCap = document.getElementById('storyCap');
const storyAva = document.getElementById('storyAva');
const storyTime = document.getElementById('storyTime');
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
  const img = NATheme.storyMedia(data, storyMedia);

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
  if(data.video){img.addEventListener('ended',nextStory,{once:true});}else storyTimer=setTimeout(nextStory,5000);
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

document.getElementById('storyClose').addEventListener('click', closeStories);
document.getElementById('tapNext').addEventListener('click', nextStory);
document.getElementById('tapPrev').addEventListener('click', prevStory);

document.addEventListener('keydown', e => {
  if (!viewer.classList.contains('on')) return;
  if (e.key === 'Escape') closeStories();
  if (e.key === 'ArrowRight') nextStory();
  if (e.key === 'ArrowLeft') prevStory();
});

/* =========================================================
   PETAL BURST
   ========================================================= */
function petalBurst(anchor, count = 20){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'petal';
    s.textContent = ['✿','❀','✦','✧','❋'][Math.floor(Math.random()*5)];
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.color = ['#e8a0b0','#e8ce7a','#a8c9b8','#f0c0cc','#d4af37'][Math.floor(Math.random()*5)];
    s.style.fontSize = (10 + Math.random()*16) + 'px';
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 140;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist + (40 + Math.random() * 100);

    s.animate([
      { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx*0.6}px), calc(-50% + ${ty*0.5}px)) scale(1.1) rotate(${Math.random()*180}deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(.5) rotate(${Math.random()*360}deg)`, opacity: 0 }
    ], {
      duration: 1400 + Math.random() * 800,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards'
    });

    setTimeout(() => s.remove(), 2400);
  }
}

/* =========================================================
   TOAST
   ========================================================= */
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('on'), 3200);
}

/* =========================================================
   PLAYER
   ========================================================= */
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const disc = document.getElementById('disc');
const player = document.getElementById('player');

document.getElementById('pTitle').textContent = CONFIG.songTitle;
document.getElementById('pArtist').textContent = CONFIG.songArtist;
document.getElementById('discCover').src = CONFIG.songCover;

function setPlaying(isPlaying){
  if (isPlaying) {
    disc.classList.add('playing');
    player.classList.add('playing');
    playBtn.textContent = '❚❚';
  } else {
    disc.classList.remove('playing');
    player.classList.remove('playing');
    playBtn.textContent = '▶';
  }
}

playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  } catch (err) {
    console.warn('Áudio indisponível:', err);
    setPlaying(false);
  }
});

audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('play', () => setPlaying(true));

/* =========================================================
   EASTER EGG — digite "jardim"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 10) typed = typed.slice(-10);
  if (typed.includes('jardim')) {
    typed = '';
    petalBurst(document.body, 40);
    showToast('O jardim te reconhece ✦');
  }
});

/* =========================================================
   HERO PARALLAX
   ========================================================= */
const heroBg = document.querySelector('.hero-bg');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 18;
  const y = (e.clientY / window.innerHeight - 0.5) * 18;
  if (heroBg) {
    heroBg.style.transform = `translate(${x}px, ${y}px)`;
  }
});

/* Integração com criar.html e ver.html; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"jardim",title: '.hero-title', phrase: '.hero-sub', letters: ['#treeLetter .tl-body', '.final-letter'],
  collections:{wishes:{label:'Desejos da fonte',value:WISHES}, stars:{label:'Memórias da constelação',value:STARS},},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    gardenEl.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,"#pathWrap .path-items");
    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'');
    naChange(WISHES,c.wishes,()=>{usedWishes=[];fountainMsg.textContent='';});naChange(STARS,c.stars,()=>{const labels=document.querySelectorAll('.star-label');const stars=document.querySelectorAll('.star');STARS.forEach((s,i)=>{if(labels[i]){labels[i].textContent=s.label;labels[i].style.left=s.x+'%';labels[i].style.top=(s.y+4)+'%';}if(stars[i]){stars[i].style.left=s.x+'%';stars[i].style.top=s.y+'%';}});});
  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
