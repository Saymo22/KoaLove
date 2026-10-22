/* JS ORIGINAL DO CLIENTE: efeitos, galeria, contador, stories, carta e player. */

/* =========================================================
   CONFIGURAÇÃO — EDITE AQUI
   ========================================================= */
const CONFIG = {
  startDate: '2022-06-15T19:30:00',           // data em que começaram
  startLabel: '15 de junho de 2022',
  songTitle: 'Perfect',
  songArtist: 'Ed Sheeran',
  songCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1000&q=85&auto=format&fit=crop', cap:'Nosso primeiro verão' },
  { src:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=85&auto=format&fit=crop', cap:'Aquele dia perfeito' },
  { src:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=85&auto=format&fit=crop', cap:'Risadas sem motivo' },
  { src:'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=900&q=85&auto=format&fit=crop', cap:'Mãos que se encontram' },
  { src:'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&q=85&auto=format&fit=crop', cap:'Pôr do sol com você' },
  { src:'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1400&q=85&auto=format&fit=crop', cap:'Nossa viagem inesquecível' },
  { src:'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1000&q=85&auto=format&fit=crop', cap:'Para sempre nós' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=85&auto=format&fit=crop', cap:'Onde tudo começou ✨' },
  { img:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=85&auto=format&fit=crop', cap:'Seu sorriso me desmonta' },
  { img:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85&auto=format&fit=crop', cap:'Nosso lugar favorito 🌅' },
  { img:'https://images.unsplash.com/photo-1503516459261-40c66117780a?w=900&q=85&auto=format&fit=crop', cap:'Eu e você, sempre' },
  { img:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85&auto=format&fit=crop', cap:'Para todos os dias ❤' }
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
   CURSOR PERSONALIZADO
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

document.querySelectorAll('a, button, .g-item, .flip, .story-thumb, .envelope, .surprise-btn').forEach(el => {
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
   REVEAL ON SCROLL
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
   CONTADOR
   ========================================================= */
document.getElementById('startLabel').textContent = CONFIG.startLabel;
let startDate = new Date(CONFIG.startDate);

const els = {
  d: document.getElementById('cDays'),
  h: document.getElementById('cHours'),
  m: document.getElementById('cMins'),
  s: document.getElementById('cSecs')
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

  pulseIfChanged(els.d, 'd', d);
  pulseIfChanged(els.h, 'h', String(h).padStart(2,'0'));
  pulseIfChanged(els.m, 'm', String(m).padStart(2,'0'));
  pulseIfChanged(els.s, 's', String(s).padStart(2,'0'));
}
updateCounter();
setInterval(updateCounter, 1000);

/* =========================================================
   GALERIA + LIGHTBOX
   ========================================================= */
const galleryEl = document.getElementById('gallery');
GALLERY.forEach((item, i) => {
  const div = document.createElement('div');
  div.className = 'g-item';
  div.dataset.index = i;
  div.innerHTML = `<img src="${item.src}" alt="${item.cap}" loading="lazy"><span class="g-cap">${item.cap}</span>`;
  galleryEl.appendChild(div);
});

const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let lbIndex = 0;

function openLightbox(i){
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
   CARTA
   ========================================================= */
const envelope = document.getElementById('envelope');
const letterPaper = document.getElementById('letterPaper');
const envHint = document.getElementById('envHint');
let letterOpen = false;

envelope.addEventListener('click', () => {
  if (letterOpen) return;
  letterOpen = true;
  envelope.classList.add('open');
  envHint.style.opacity = '0';
  setTimeout(() => {
    letterPaper.classList.add('show');
    setTimeout(() => letterPaper.scrollIntoView({ behavior:'smooth', block:'center' }), 320);
  }, 620);
});

/* =========================================================
   STORIES
   ========================================================= */
const rail = document.getElementById('storiesRail');
STORIES.forEach((s, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'story-thumb';
  thumb.dataset.index = i;
  thumb.innerHTML = `<div class="story-ring"><img src="${s.img}" alt=""></div><p>Story ${i+1}</p>`;
  rail.appendChild(thumb);
});

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
  STORIES.forEach((_, i) => {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<div class="seg-fill"></div>';
    storyProgress.appendChild(seg);
  });
}

function renderStory(i){
  storyIndex = i;
  const data = STORIES[i];

  // mídia
  storyMedia.querySelectorAll('video').forEach(v=>v.pause());
  storyMedia.innerHTML = '';
  if (data.video) {
    const vid = document.createElement('video');
    vid.src = data.video;
    vid.poster = data.img || '';
    vid.playsInline = true;
    vid.controls = true;
    vid.preload = 'metadata';
    vid.setAttribute('aria-label', data.cap || 'Vídeo do nosso momento');
    storyMedia.appendChild(vid);
    vid.addEventListener('loadedmetadata', () => {
      if (storyIndex !== i) return;
      clearTimeout(storyTimer);
      const seconds = Number.isFinite(vid.duration) ? Math.max(3,Math.min(30,vid.duration)) : 8;
      const segment=storyProgress.querySelector('.seg.active');
      if(segment)segment.style.setProperty('--dur',seconds+'s');
      storyTimer=setTimeout(nextStory,seconds*1000);
    }, {once:true});
    vid.play().catch(() => {});
  } else {
    const img = document.createElement('img');
    img.src = data.src || data.img;
    img.alt = data.cap;
    storyMedia.appendChild(img);
    requestAnimationFrame(() => img.classList.add('on'));
  }

  storyAva.src = data.img;
  storyTime.textContent = 'agora';

  // caption
  storyCap.classList.remove('on');
  storyCap.textContent = data.cap;
  setTimeout(() => storyCap.classList.add('on'), 120);

  // progresso
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
  storyTimer = setTimeout(() => nextStory(), 5000);
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
   PLAYER DE MÚSICA
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
    // autoplay bloqueado ou arquivo indisponível
    console.warn('Áudio indisponível:', err);
    setPlaying(false);
  }
});

audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('play', () => setPlaying(true));

/* =========================================================
   CORAÇÕES FLUTUANTES NO HERO
   ========================================================= */
const hero = document.querySelector('.hero');

function spawnHeart(){
  const h = document.createElement('span');
  h.className = 'heart-float';
  h.textContent = ['❤','♥','❥','💗'][Math.floor(Math.random()*4)];
  const size = 10 + Math.random() * 20;
  h.style.fontSize = size + 'px';
  h.style.left = Math.random() * 100 + '%';
  h.style.bottom = '-40px';
  h.style.opacity = '0';
  h.style.filter = `blur(${Math.random()*1.6}px) drop-shadow(0 0 10px rgba(255,77,109,.8))`;
  hero.appendChild(h);

  const dur = 7000 + Math.random() * 6000;
  const drift = (Math.random() - 0.5) * 180;

  h.animate([
    { transform:'translate(0,0) scale(.5)', opacity:0 },
    { transform:`translate(${drift*0.3}px,-30vh) scale(1)`, opacity:.85, offset:.25 },
    { transform:`translate(${drift*0.7}px,-70vh) scale(.95)`, opacity:.55, offset:.7 },
    { transform:`translate(${drift}px,-105vh) scale(.7)`, opacity:0 }
  ], {
    duration: dur,
    easing: 'cubic-bezier(.22,1,.36,1)',
    fill: 'forwards'
  });

  setTimeout(() => h.remove(), dur);
}

setInterval(() => {
  if (document.hidden) return;
  if (window.scrollY < window.innerHeight) spawnHeart();
}, 900);
for (let i = 0; i < 5; i++) setTimeout(spawnHeart, i * 420);

/* =========================================================
   PARALLAX SUAVE NO HERO
   ========================================================= */
const heroBg = document.getElementById('heroBg');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 22;
  const y = (e.clientY / window.innerHeight - 0.5) * 22;
  heroBg.style.transform = `translate(${x}px, ${y}px)`;
});

/* =========================================================
   BOTÃO SURPRESA — CHUVA DE CORAÇÕES
   ========================================================= */
const surpriseBtn = document.getElementById('surpriseBtn');

function heartBurst(count = 90){
  for (let i = 0; i < count; i++){
    const h = document.createElement('div');
    h.className = 'confetti-heart';
    h.textContent = ['❤','♥','💖','💗','✨','🌹'][Math.floor(Math.random()*6)];
    h.style.left = '50%';
    h.style.top = '50%';
    h.style.fontSize = (12 + Math.random()*24) + 'px';
    h.style.color = ['#ff4d6d','#ff8fa3','#d4af37','#e8a0b0'][Math.floor(Math.random()*4)];
    document.body.appendChild(h);

    const angle = Math.random() * Math.PI * 2;
    const dist = 160 + Math.random() * 480;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 140;

    h.animate([
      { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx*0.6}px), calc(-50% + ${ty*0.6}px)) scale(1.2) rotate(${Math.random()*360}deg)`, opacity:1, offset:.55 },
      { transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 260}px)) scale(.4) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], {
      duration: 1800 + Math.random() * 1400,
      easing: 'cubic-bezier(.16,.84,.32,1)',
      fill: 'forwards'
    });

    setTimeout(() => h.remove(), 3400);
  }
}

surpriseBtn.addEventListener('click', () => {
  heartBurst(110);
  surpriseBtn.querySelector('span').textContent = 'Eu te amo ❤';
  setTimeout(() => { surpriseBtn.querySelector('span').textContent = 'Toque aqui ✨'; }, 3200);
});

/* =========================================================
   PARALLAX LEVE NAS SEÇÕES
   ========================================================= */
const parallaxTargets = document.querySelectorAll('.tl-card, .counter-card');
window.addEventListener('scroll', () => {
  const vh = window.innerHeight;
  parallaxTargets.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      const p = (r.top + r.height/2 - vh/2) / vh;
      el.style.setProperty('--p', p.toFixed(3));
    }
  });
}, { passive:true });

/* =========================================================
   EASTER EGG — digite "amor"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 8) typed = typed.slice(-8);
  if (typed.includes('amor')) {
    typed = '';
    heartBurst(70);
  }
});


/* ================================================================
   INTEGRAÇÃO COM ver.html — não altera o visual da referência.
   O pai envia apenas os dados normalizados que já foram carregados
   de GET /api/purchases/:id e IndexedDB. Nenhum novo endpoint.
   ================================================================ */
(function () {
  'use strict';
  const DEMO = new URLSearchParams(location.search).get('demo') === '1';
  const EMBED = new URLSearchParams(location.search).get('embed') === '1';
  const $ = (id) => document.getElementById(id);
  function validMedia(s) { return typeof s === 'string' && /^(https?:\/\/|blob:|data:image\/|data:audio\/|data:video\/)/i.test(s); }
  function text(s, fallback='') { return String(s == null ? fallback : s); }
  function setText(el,v) { if(el) el.textContent = v; }
  function clearSection(selector) { const section=document.querySelector(selector); if(section)section.hidden=true; }
  function galleryCard(item,i) {
    const div=document.createElement('div'); div.className='g-item';div.dataset.index=i;
    div.tabIndex=0;div.setAttribute('role','button');div.setAttribute('aria-label','Ampliar foto '+(i+1));
    const img=document.createElement('img');img.src=item.src;img.alt=item.cap||'Nossa lembrança';img.loading='lazy';
    const cap=document.createElement('span');cap.className='g-cap';cap.textContent=item.cap||'Nossa lembrança';
    div.append(img,cap);return div;
  }
  function setGift(payload) {
    if (!payload || typeof payload !== 'object') return;
    const p=payload.p||{};
    document.body.classList.add('na-personalizado');
    for(const id of ['contador','historia','galeria','motivos','stories']) $(id).hidden=false;
    document.documentElement.classList.add('na-data-ready');
    const photos=Array.isArray(payload.photos)?payload.photos.filter(validMedia):[];
    const videos=Array.isArray(payload.videos)?payload.videos.filter(validMedia):[];
    const events=Array.isArray(payload.events)?payload.events:[];
    const reasons=Array.isArray(payload.reasons)?payload.reasons:[];
    const from=text(p.de,'Alguém especial'),to=text(p.para,'Você');
    document.title=(text(p.titulo,'Nós dois'))+' — '+from+' & '+to;
    const names=document.querySelector('.hero-names');
    names.replaceChildren();
    const a=document.createElement('span');a.textContent=from;
    const amp=document.createElement('span');amp.className='amp';amp.textContent='&';
    const b=document.createElement('span');b.textContent=to;
    names.append(a,document.createTextNode(' '),amp,document.createTextNode(' '),b);
    setText(document.querySelector('.hero-eyebrow'),text(p.frase,'Desde o primeiro olhar'));
    const iso=text(p.inicio).slice(0,10);
    const date=/^\d{4}-\d{2}-\d{2}$/.test(iso)?new Date(iso+'T00:00:00'):null;
    const isValid=!!date&&Number.isFinite(date.getTime());
    if(isValid){
      startDate=date;
      CONFIG.startDate=iso+'T00:00:00';
      CONFIG.startLabel=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(date);
      $('startLabel').textContent=CONFIG.startLabel;
      setText(document.querySelector('.hero-date'),CONFIG.startLabel+' — o dia em que tudo começou');
      updateCounter();
    } else {
      setText(document.querySelector('.hero-date'),text(p.titulo,'Uma história só nossa'));
      setText($('startLabel'),'Uma história sem data definida');
      // Sem data cadastrada, esconder o relógio para não mostrar uma contagem incorreta.
      clearSection('#contador');
    }
    const cover=validMedia(payload.cover)?payload.cover:photos[0];
    const hero=$('heroBg');
    const coverImg=hero.querySelector('img');
    if(cover){coverImg.src=cover;coverImg.alt='Foto de '+from+' e '+to;coverImg.style.display='';}
    else{coverImg.removeAttribute('src');coverImg.style.display='none';hero.style.background='radial-gradient(circle at 50% 35%,#662841,#0a0508 75%)';}
    hero.querySelector('video')?.remove();
    if(videos.length){
      const v=document.createElement('video');
      v.src=videos[0];v.poster=cover||'';v.muted=true;v.autoplay=!matchMedia('(prefers-reduced-motion: reduce)').matches;
      v.loop=true;v.playsInline=true;v.preload='metadata';
      hero.prepend(v);
      if(v.autoplay)v.play().catch(()=>{});
    }
    // História personalizada. Remove exemplos que não foram informados pelo cliente.
    const timeline=document.querySelector('.timeline');
    if(events.length){
      timeline.replaceChildren();
      events.slice(0,12).forEach((e,i)=>{
        const row=document.createElement('div');row.className='tl-item';row.setAttribute('data-reveal','');row.classList.add('in');
        const dot=document.createElement('div');dot.className='tl-dot';
        const dat=document.createElement('p');dat.className='tl-date';dat.textContent=text(e.data||e.date,'Memória '+(i+1));
        const card=document.createElement('div');card.className='tl-card';
        const title=document.createElement('h3');title.textContent=text(e.titulo||e.title,'Nosso momento');
        const desc=document.createElement('p');desc.textContent=text(e.texto||e.descricao||e.desc,'');
        card.append(title,desc);row.append(dot,dat,card);timeline.append(row);
      });
    }else clearSection('#historia');
    // Galeria: DOM real e mesmo grid CSS da página original.
    GALLERY.splice(0,GALLERY.length,...photos.map((src,i)=>({src,cap:text(p.legendas?.[i],'Nossa lembrança '+(i+1))})));
    galleryEl.replaceChildren(...GALLERY.map(galleryCard));
    if(!GALLERY.length)clearSection('#galeria');
    // Motivos: faces idênticas ao modelo aprovado.
    const motifs=document.querySelector('.motivos');
    if(reasons.length){
      motifs.replaceChildren();
      reasons.slice(0,12).forEach((r,i)=>{
        const detail=(typeof r==='string'?r:text(r.texto||r.descricao||r.motivo||r.titulo,''));
        const title=(typeof r==='string'?'Motivo '+(i+1):text(r.titulo,'Motivo '+(i+1)));
        const card=document.createElement('div');card.className='flip';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Revelar motivo '+(i+1));
        const front=document.createElement('div');front.className='flip-face flip-front';
        const icon=document.createElement('span');icon.className='ico';icon.textContent=['✨','🌙','🎧','🌹'][i%4];
        const h=document.createElement('h4');h.textContent=title;
        const turn=document.createElement('span');turn.textContent='Vire →';front.append(icon,h,turn);
        const back=document.createElement('div');back.className='flip-face flip-back';
        const para=document.createElement('p');para.textContent=detail;back.append(para);
        const hint=document.createElement('span');hint.className='flip-hint';hint.textContent='toque';
        card.append(front,back,hint);
        card.addEventListener('click',()=>card.classList.toggle('on'));
        card.addEventListener('keydown',(ev)=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();card.click();}});
        motifs.append(card);
      });
    }else clearSection('#motivos');
    // Carta original aberta com selo de cera; substitui APENAS o conteúdo escrito.
    const letter=document.querySelector('.paper-inner');
    const oldSign=letter.querySelector('.paper-sign');
    const originalParas=[...letter.querySelectorAll('p:not(.paper-sign)')];
    originalParas.forEach(x=>x.remove());
    const raw=text(p.carta).trim();
    const blocks=raw?raw.split(/\n\s*\n/g):['Uma carta especial foi preparada para você.'];
    blocks.forEach(block=>{const para=document.createElement('p');para.textContent=block;oldSign.before(para);});
    setText(letter.querySelector('h3'),to+',');
    oldSign.textContent='Com todo o meu amor, '+from+' ❤';
    // Stories reais: vídeos em formato vertical; fotos se não houver vídeo.
    const pages=videos.length
      ?videos.map((video,i)=>({video,img:photos[i%Math.max(photos.length,1)]||cover||'',cap:text(p.legendas?.[i],'Um momento especial')}))
      :photos.map((img,i)=>({img,cap:text(p.legendas?.[i],'Nossa memória '+(i+1))}));
    STORIES.splice(0,STORIES.length,...pages);
    rail.replaceChildren();
    STORIES.forEach((s,i)=>{
      const thumb=document.createElement('button');thumb.type='button';thumb.className='story-thumb';thumb.dataset.index=i;
      const ring=document.createElement('div');ring.className='story-ring';
      if(s.img){const image=document.createElement('img');image.src=s.img;image.alt='Story '+(i+1);ring.append(image);}
      else{ring.textContent='▶';ring.style.display='grid';ring.style.placeItems='center';ring.style.color='white';}
      const label=document.createElement('p');label.textContent='Story '+(i+1);
      thumb.append(ring,label);rail.append(thumb);
    });
    if(!STORIES.length)clearSection('#stories');
    setText($('storyName'),from+' & '+to);
    // Player original — mantém controls e equalizador originais.
    audio.querySelectorAll('source').forEach(x=>x.remove());
    if(validMedia(payload.music)){
      player.style.display='';
      if(audio.getAttribute('src')!==payload.music){audio.pause();audio.src=payload.music;audio.load();}
      setText($('pTitle'),text(p.musicaNome,'Nossa música'));
      setText($('pArtist'),text(p.musicaArtista,from+' & '+to));
      $('discCover').src=cover||'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80&auto=format&fit=crop';
    }else{audio.removeAttribute('src');audio.load();player.style.display='none';}
    setText(document.querySelector('footer p'),text(p.rodapeCustom,'Feito com amor, para a pessoa que mudou tudo.'));
    setText(document.querySelector('footer small'),from+' & '+to+' · Para sempre');
  }
  window.addEventListener('message',(e)=>{
    if(e.origin!==location.origin||e.source!==window.parent||e.data?.type!=='NOSSO_AMOR_NAMORO_DATA')return;
    try{setGift(e.data.payload);}catch(err){console.error('[Namoro / integração]',err);}
  });
  if(window.parent!==window){
    window.parent.postMessage({type:'NOSSO_AMOR_NAMORO_READY'},location.origin === 'null' ? '*' : location.origin);
    // Reforça handshake para páginas abertas com conteúdo em cache.
    window.addEventListener('load',()=>window.parent.postMessage({type:'NOSSO_AMOR_NAMORO_READY'},location.origin === 'null' ? '*' : location.origin),{once:true});
  }
  // Somente se abrir a página direta como prévia é que permanecem os dados
  // DEMO originais fornecidos pelo usuário, sem pedir login ou API.
  if(EMBED){document.documentElement.classList.add('na-embedded');}
})();
