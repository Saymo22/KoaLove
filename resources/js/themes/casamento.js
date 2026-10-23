
/* =========================================================
   CONFIGURAÇÃO — EDITE AQUI
   ========================================================= */
const CONFIG = {
  startDate: '2022-06-15T19:30:00',
  startLabel: '15 de junho de 2022',
  songTitle: 'A Thousand Years',
  songArtist: 'Christina Perri',
  songCover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85&auto=format&fit=crop', cap:'O nosso começo' },
  { src:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=85&auto=format&fit=crop', cap:'Aquele dia perfeito' },
  { src:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85&auto=format&fit=crop', cap:'Mãos que se encontram' },
  { src:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=85&auto=format&fit=crop', cap:'Risadas sem motivo' },
  { src:'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=900&q=85&auto=format&fit=crop', cap:'Nosso primeiro verão' },
  { src:'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1400&q=85&auto=format&fit=crop', cap:'A viagem dos sonhos' },
  { src:'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1000&q=85&auto=format&fit=crop', cap:'Para sempre nós' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85&auto=format&fit=crop', cap:'O dia em que te conheci ✨' },
  { img:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=85&auto=format&fit=crop', cap:'Seu sorriso me desmonta' },
  { img:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85&auto=format&fit=crop', cap:'Nosso lugar favorito 🌅' },
  { img:'https://images.unsplash.com/photo-1503516459261-40c66117780a?w=900&q=85&auto=format&fit=crop', cap:'Eu e você, sempre' },
  { img:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85&auto=format&fit=crop', cap:'Contando os dias ❤' }
];

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    setTimeout(() => document.getElementById('player').classList.add('show'), 700);
  }, 1100);
});

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
  rx += (mx - rx) * 0.16;
  ry += (my - ry) * 0.16;
  cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
}
ringLoop();

document.querySelectorAll('a, button, .g-item, .ring-card, .story-thumb, .vow-card, .flip, .dream, .btn-yes, .btn-no, .unite-btn, .yes-continue').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('grow'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('grow'));
});

/* =========================================================
   SCROLL PROGRESS + BACK TO TOP
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
   CONTADOR — TEMPO JUNTOS
   ========================================================= */
document.getElementById('startLabel').textContent = CONFIG.startLabel;
let startDate = new Date(CONFIG.startDate);

const cd = {
  d: document.getElementById('cdDays'),
  h: document.getElementById('cdHours'),
  m: document.getElementById('cdMins'),
  s: document.getElementById('cdSecs')
};
const lastVals = { d:null, h:null, m:null, s:null };

function pulseIfChanged(el, key, val){
  if (lastVals[key] !== null && lastVals[key] !== val) {
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
  }
  lastVals[key] = val;
  el.textContent = val;
}

function updateCounter(){
  const now = new Date();
  let diff = now - startDate;
  if (diff < 0) diff = 0;

  const d = Math.floor(diff / 86400000);
  diff %= 86400000;
  const h = Math.floor(diff / 3600000);
  diff %= 3600000;
  const m = Math.floor(diff / 60000);
  diff %= 60000;
  const s = Math.floor(diff / 1000);

  pulseIfChanged(cd.d, 'd', d);
  pulseIfChanged(cd.h, 'h', String(h).padStart(2,'0'));
  pulseIfChanged(cd.m, 'm', String(m).padStart(2,'0'));
  pulseIfChanged(cd.s, 's', String(s).padStart(2,'0'));
}
updateCounter();
setInterval(updateCounter, 1000);

/* =========================================================
   GALERIA + LIGHTBOX
   ========================================================= */
const galleryEl = document.getElementById('gallery');
function naRenderGallery(){
galleryEl.replaceChildren();
GALLERY.forEach((item, i) => {
  const div = document.createElement('div');
  div.className = 'g-item';
  div.dataset.index = i;
  div.innerHTML = `<img src="${NATheme.escape(item.src)}" alt="${NATheme.escape(item.cap)}" loading="lazy"><span class="g-cap">${NATheme.escape(item.cap)}</span>`;
  galleryEl.appendChild(div);
});

}
naRenderGallery();
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

galleryEl.addEventListener('click', e => {
  const item = e.target.closest('.g-item');
  if (item) openLightbox(+item.dataset.index);
});

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
   FLIP CARDS
   ========================================================= */
document.querySelectorAll('.flip').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('on'));
});

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
   ALIANÇAS — INTERAÇÃO
   ========================================================= */
document.querySelectorAll('[data-ring]').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.remove('united');
    void card.offsetWidth;
    card.classList.add('united');
    sparkleBurst(card.querySelector('.rings-svg'), 8);
  });
});

function sparkleBurst(anchor, count){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = '✦';
    s.style.position = 'fixed';
    s.style.left = (rect.left + rect.width/2) + 'px';
    s.style.top = (rect.top + rect.height/2) + 'px';
    s.style.color = ['#d4af37','#f2dc9a','#fff'][Math.floor(Math.random()*3)];
    s.style.fontSize = (8 + Math.random()*12) + 'px';
    s.style.zIndex = '9200';
    s.style.pointerEvents = 'none';
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 80;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    s.animate([
      { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.2) rotate(${Math.random()*360}deg)`, opacity:1, offset:.6 },
      { transform:`translate(calc(-50% + ${tx*1.4}px), calc(-50% + ${ty*1.4 + 40}px)) scale(.2) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], { duration: 900 + Math.random()*500, easing:'cubic-bezier(.16,.84,.32,1)', fill:'forwards' });

    setTimeout(() => s.remove(), 1500);
  }
}

document.getElementById('uniteBtn').addEventListener('click', () => {
  document.querySelectorAll('[data-ring]').forEach((card, i) => {
    setTimeout(() => {
      card.classList.remove('united');
      void card.offsetWidth;
      card.classList.add('united');
      sparkleBurst(card.querySelector('.rings-svg'), 10);
    }, i * 180);
  });
  setTimeout(() => sparkleBurst(document.querySelector('.rings-grid'), 30), 300);
});

/* =========================================================
   CARTA
   ========================================================= */
const vowCard = document.getElementById('vowCard');
const vowHint = document.getElementById('vowHint');
let vowOpen = false;

vowCard.addEventListener('click', () => {
  if (vowOpen) return;
  vowOpen = true;
  vowCard.classList.add('open');
  vowHint.classList.add('hide');
  setTimeout(() => {
    vowCard.scrollIntoView({ behavior:'smooth', block:'center' });
  }, 300);
});

/* =========================================================
   PERGUNTA — SIM & NÃO
   ========================================================= */
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const yesOverlay = document.getElementById('yesOverlay');
const yesContinue = document.getElementById('yesContinue');
const questionButtons = document.getElementById('questionButtons');
const questionConfirm = document.getElementById('questionConfirm');
let answered = false;

// Comportamento do "Não"
const noTexts = ['Não', 'Tem certeza?', 'Pensa bem...', 'Não aceito isso', '...'];
let noCount = 0;

noBtn.addEventListener('mouseenter', () => {
  noCount++;
  if (noCount < noTexts.length) {
    noBtn.textContent = noTexts[noCount];
    const dx = (Math.random() - 0.5) * 60;
    const dy = (Math.random() - 0.5) * 30;
    noBtn.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.max(0.5, 1 - noCount*0.16)})`;
    yesBtn.style.transform = `scale(${1 + noCount * 0.06})`;
  } else {
    noBtn.style.opacity = '0';
    noBtn.style.pointerEvents = 'none';
    noBtn.style.transform = 'scale(0)';
    setTimeout(() => { noBtn.style.display = 'none'; }, 500);
  }
});

// Comportamento do "Sim"
yesBtn.addEventListener('click', () => {
  if (answered) return;
  answered = true;

  yesOverlay.classList.add('on');
  document.body.style.overflow = 'hidden';

  // Celebração
  setTimeout(() => {
    goldBurst(160);
    heartRain(90);
  }, 400);

  showToast('Você disse SIM! ❤');

  // Efeito sonoro visual nas alianças
  document.querySelectorAll('[data-ring]').forEach(card => {
    card.classList.remove('united');
    void card.offsetWidth;
    card.classList.add('united');
  });
});

yesContinue.addEventListener('click', () => {
  yesOverlay.classList.remove('on');
  document.body.style.overflow = '';
  questionButtons.classList.add('hide');
  questionConfirm.classList.add('on');
});

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
   CHUVA DOURADA
   ========================================================= */
function goldBurst(count = 50){
  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = ['✦','✧','⋆','✶'][Math.floor(Math.random()*4)];
    s.style.position = 'fixed';
    s.style.left = (30 + Math.random()*40) + '%';
    s.style.top = (30 + Math.random()*30) + '%';
    s.style.color = ['#d4af37','#f2dc9a','#e6d3ae','#fff'][Math.floor(Math.random()*4)];
    s.style.fontSize = (10 + Math.random()*22) + 'px';
    s.style.zIndex = '9200';
    s.style.pointerEvents = 'none';
    document.body.appendChild(s);

    const tx = (Math.random() - 0.5) * 500;
    const ty = (Math.random() - 0.5) * 400;

    s.animate([
      { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx*0.7}px), calc(-50% + ${ty*0.7}px)) scale(1.3) rotate(${Math.random()*360}deg)`, opacity:1, offset:.5 },
      { transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 200}px)) scale(.2) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], { duration: 1500 + Math.random()*1000, easing:'cubic-bezier(.16,.84,.32,1)', fill:'forwards' });

    setTimeout(() => s.remove(), 2800);
  }
}

/* =========================================================
   CHUVA DE CORAÇÕES
   ========================================================= */
function heartRain(count){
  for (let i = 0; i < count; i++){
    const h = document.createElement('div');
    h.className = 'confetti-heart';
    h.textContent = ['❤','♥','💖','✨','✦','💗'][Math.floor(Math.random()*6)];
    h.style.position = 'fixed';
    h.style.left = Math.random() * 100 + '%';
    h.style.top = '-40px';
    h.style.fontSize = (12 + Math.random()*26) + 'px';
    h.style.color = ['#ff4d6d','#d4af37','#f2dc9a','#e0b7b3','#c9898f'][Math.floor(Math.random()*5)];
    h.style.zIndex = '9600';
    h.style.pointerEvents = 'none';
    document.body.appendChild(h);

    const dur = 3000 + Math.random()*2500;
    const drift = (Math.random() - 0.5) * 120;

    h.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random()*720}deg)`, opacity: 0.2 }
    ], { duration: dur, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });

    setTimeout(() => h.remove(), dur + 100);
  }
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
   PARTÍCULAS DOURADAS NO HERO
   ========================================================= */
const hero = document.querySelector('.hero');

function spawnSpark(){
  const s = document.createElement('span');
  s.className = 'spark';
  s.textContent = ['✦','✧','⋆','·'][Math.floor(Math.random()*4)];
  const size = 6 + Math.random() * 16;
  s.style.fontSize = size + 'px';
  s.style.left = Math.random() * 100 + '%';
  s.style.bottom = '-30px';
  s.style.opacity = '0';
  s.style.filter = `blur(${Math.random()*1.5}px) drop-shadow(0 0 8px rgba(212,175,55,.9))`;
  hero.appendChild(s);

  const dur = 7000 + Math.random() * 6000;
  const drift = (Math.random() - 0.5) * 160;

  s.animate([
    { transform:'translate(0,0) scale(.4)', opacity:0 },
    { transform:`translate(${drift*0.3}px,-30vh) scale(1)`, opacity:.8, offset:.25 },
    { transform:`translate(${drift*0.7}px,-70vh) scale(.9)`, opacity:.5, offset:.7 },
    { transform:`translate(${drift}px,-105vh) scale(.6)`, opacity:0 }
  ], { duration: dur, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards' });

  setTimeout(() => s.remove(), dur);
}

setInterval(() => {
  if (document.hidden) return;
  if (window.scrollY < window.innerHeight) spawnSpark();
}, 850);
for (let i = 0; i < 6; i++) setTimeout(spawnSpark, i * 380);

/* =========================================================
   PARALLAX NO HERO
   ========================================================= */
const heroBg = document.getElementById('heroBg');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 22;
  const y = (e.clientY / window.innerHeight - 0.5) * 22;
  heroBg.style.transform = `translate(${x}px, ${y}px)`;
});

/* =========================================================
   EASTER EGG — digite "amor"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 8) typed = typed.slice(-8);
  if (typed.includes('amor')) {
    typed = '';
    goldBurst(70);
    showToast('Para sempre, meu amor ✦');
  }
});

/* Integração com criar.html e ver.html; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"casamento",names: '.hero-names', phrase: '.hero-script', letters: ['.vow-reveal'],
  collections:{},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    galleryEl.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".timeline");

    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'')&&Number.isFinite(+new Date(p.inicio+'T00:00:00'));
    const counter=document.getElementById('startLabel')?.closest('.counter-card');if(counter)counter.hidden=!validDate;
    if(validDate){startDate=new Date(p.inicio+'T00:00:00');NATheme.set('#startLabel',new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(startDate));updateCounter();}

  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
