
/* =========================================================
   CONFIG — EDITE AQUI
   ========================================================= */
const CONFIG = {
  birthdayPerson: 'Seu Nome',
  birthDate: '1999-06-15T00:00:00',
  birthLabel: '15 de junho de 1999',
  songTitle: 'Happy Birthday',
  songArtist: 'Stevie Wonder',
  songCover: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=85&auto=format&fit=crop', cap:'Aquele dia especial' },
  { src:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1400&q=85&auto=format&fit=crop', cap:'Risadas que ficaram' },
  { src:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&q=85&auto=format&fit=crop', cap:'Confete e alegria' },
  { src:'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=900&q=85&auto=format&fit=crop', cap:'Nossa vibe' },
  { src:'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=85&auto=format&fit=crop', cap:'Música alta' },
  { src:'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=1400&q=85&auto=format&fit=crop', cap:'A noite perfeita' },
  { src:'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=1000&q=85&auto=format&fit=crop', cap:'Para sempre nós' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=85&auto=format&fit=crop', cap:'O dia que começou tudo ✨' },
  { img:'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=85&auto=format&fit=crop', cap:'Nosso jeito de celebrar' },
  { img:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&q=85&auto=format&fit=crop', cap:'Confete em todo lugar' },
  { img:'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=900&q=85&auto=format&fit=crop', cap:'Sua vibe favorita' },
  { img:'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=900&q=85&auto=format&fit=crop', cap:'Brindando a você ❤' }
];

const MEMORIES = [
  'Aquele dia que a gente riu até chorar por uma bobagem 🤣',
  'A primeira vez que você me contou um segredo — e eu guardei até hoje',
  'A vez que você apareceu do nada e mudou meu dia inteiro ✨',
  'Aquela música que ficou marcada pra sempre e sempre me lembra de você 🎵',
  'O abraço apertado que só você sabe dar',
  'A foto horrível que a gente jurou que ia apagar e nunca apagou',
  'A conversa de madrugada que virou tradição',
  'O jeito que você me olha quando acha que eu não estou vendo',
  'Aquele "eu te avisei" que você deu com toda a razão do mundo',
  'O silêncio confortável que só a gente tem'
];

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    setTimeout(() => document.getElementById('player').classList.add('show'), 700);
    // start balloons
    startBalloons();
    // confetti on first load
    setTimeout(() => confettiBurst(80), 1200);
  }, 1100);
});

/* =========================================================
   IDADE DINÂMICA
   ========================================================= */
let birthDate = new Date(CONFIG.birthDate);
const now = new Date();
let age = now.getFullYear() - birthDate.getFullYear();
const m = now.getMonth() - birthDate.getMonth();
if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
document.getElementById('heroAgeNum').textContent = age;
document.getElementById('badgeAge').textContent = age;

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

document.querySelectorAll('a, button, .g-item, .story-thumb, .flip, .cake-btn, .candle-group, .jar-btn, .gift-box, .letter-paper').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('grow'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('grow'));
});

/* =========================================================
   SCROLL + TO TOP
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
   BALLOONS
   ========================================================= */
const BALLOON_COLORS = ['#ff2d8a','#a855f7','#4ff0c5','#ffd166','#ff7ab5','#c084fc'];

function startBalloons(){
  const bg = document.getElementById('balloonsBg');
  function spawn(){
    const b = document.createElement('div');
    b.className = 'balloon';
    const color = BALLOON_COLORS[Math.floor(Math.random()*BALLOON_COLORS.length)];
    const size = 40 + Math.random() * 40;
    b.style.width = size + 'px';
    b.style.height = (size * 1.3) + 'px';
    b.style.left = Math.random() * 95 + '%';
    b.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${color}cc)`;
    b.style.color = color;
    b.style.animationDuration = (14 + Math.random() * 10) + 's';
    bg.appendChild(b);
    setTimeout(() => b.remove(), 26000);
  }
  for (let i = 0; i < 6; i++) setTimeout(spawn, i * 600);
  setInterval(() => {
    if (document.hidden) return;
    if (bg.children.length < 14) spawn();
  }, 2400);
}

/* =========================================================
   CONTADOR
   ========================================================= */
document.getElementById('startLabel').textContent = CONFIG.birthLabel;

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
  const nowT = new Date();
  let diff = nowT - birthDate;
  if (diff < 0) diff = 0;

  const d = Math.floor(diff / 86400000);
  diff %= 86400000;
  const h = Math.floor(diff / 3600000);
  diff %= 3600000;
  const mm = Math.floor(diff / 60000);
  diff %= 60000;
  const ss = Math.floor(diff / 1000);

  pulseIfChanged(cd.d, 'd', d.toLocaleString('pt-BR'));
  pulseIfChanged(cd.h, 'h', String(h).padStart(2,'0'));
  pulseIfChanged(cd.m, 'm', String(mm).padStart(2,'0'));
  pulseIfChanged(cd.s, 's', String(ss).padStart(2,'0'));
}
updateCounter();
setInterval(updateCounter, 1000);

/* =========================================================
   FUN STATS
   ========================================================= */
const funStatsObserver = new IntersectionObserver((entries) => {
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
      funStatsObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.fs-num').forEach(el => funStatsObserver.observe(el));

/* =========================================================
   CAKE — CANDLES
   ========================================================= */
const candles = document.querySelectorAll('.candle-group');
let blownCount = 0;

function blowCandle(candle){
  if (candle.classList.contains('blown')) return;
  candle.classList.add('blown');
  blownCount++;
  playBlowSound();
  sparkleBurst(candle, 6);

  if (blownCount === candles.length) {
    setTimeout(() => {
      const result = document.getElementById('cakeResult');
      result.classList.add('on');
      confettiBurst(140);
      showToast('🎉 Pedido feito! Parabéns!');
    }, 500);
  }
}

candles.forEach(candle => {
  candle.addEventListener('click', () => blowCandle(candle));
});

document.getElementById('resetCandles').addEventListener('click', () => {
  candles.forEach(c => c.classList.remove('blown'));
  blownCount = 0;
  document.getElementById('cakeResult').classList.remove('on');
  showToast('Velas reacesas ✨');
});

/* Web Audio blow sound */
let audioCtx = null;
function playBlowSound(){
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch(e){}
}

/* Mic for real blow */
const micBtn = document.getElementById('micBtn');
const micIcon = document.getElementById('micIcon');
const micLabel = document.getElementById('micLabel');
let micStream = null;
let micAnalyser = null;
let micListening = false;

micBtn.addEventListener('click', async () => {
  if (micListening) {
    stopMic();
    return;
  }
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    micAnalyser = audioCtx.createAnalyser();
    micAnalyser.fftSize = 512;
    source.connect(micAnalyser);

    micListening = true;
    micBtn.classList.add('active');
    micIcon.textContent = '🔊';
    micLabel.textContent = 'Assopre agora!';
    showToast('Assopre no microfone! 🎤');

    const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
    const checkBlow = () => {
      if (!micListening) return;
      micAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;

      if (avg > 60) {
        // blow detected — blow out one candle
        const unblown = [...candles].filter(c => !c.classList.contains('blown'));
        if (unblown.length > 0) {
          blowCandle(unblown[Math.floor(Math.random()*unblown.length)]);
        }
      }
      if (micListening) requestAnimationFrame(checkBlow);
    };
    checkBlow();
  } catch (err) {
    showToast('Não foi possível acessar o microfone 😕');
  }
});

function stopMic(){
  micListening = false;
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  micBtn.classList.remove('active');
  micIcon.textContent = '🎤';
  micLabel.textContent = 'Assoprar com voz';
}

/* =========================================================
   SPARKLES
   ========================================================= */
function sparkleBurst(anchor, count){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'confetti';
    s.textContent = ['✦','✧','⋆','✶','✨'][Math.floor(Math.random()*5)];
    s.style.position = 'fixed';
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.color = ['#ff2d8a','#a855f7','#4ff0c5','#ffd166'][Math.floor(Math.random()*4)];
    s.style.fontSize = (10 + Math.random()*16) + 'px';
    s.style.zIndex = '9600';
    s.style.pointerEvents = 'none';
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
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

/* =========================================================
   CONFETTI
   ========================================================= */
function confettiBurst(count = 60){
  const emojis = ['✦','✧','◆','●','▲','🎉','✨','⭐','🎂','💖','🎈','🎁','🌟'];
  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    c.style.position = 'fixed';
    c.style.left = (10 + Math.random()*80) + '%';
    c.style.top = '-30px';
    c.style.color = ['#ff2d8a','#a855f7','#4ff0c5','#ffd166','#fff','#ff7ab5'][Math.floor(Math.random()*6)];
    c.style.fontSize = (12 + Math.random()*22) + 'px';
    c.style.zIndex = '9600';
    c.style.pointerEvents = 'none';
    document.body.appendChild(c);

    const dur = 2400 + Math.random()*2000;
    const drift = (Math.random() - 0.5) * 200;

    c.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random()*900}deg)`, opacity: 0.3 }
    ], { duration: dur, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });

    setTimeout(() => c.remove(), dur + 100);
  }
}

/* =========================================================
   GALERIA
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
   FLIP CARDS
   ========================================================= */
document.querySelectorAll('.flip').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('on'));
});

/* =========================================================
   MEMORY JAR
   ========================================================= */
const jarBtn = document.getElementById('jarBtn');
const jarMemory = document.getElementById('jarMemory');
let usedMemories = [];

jarBtn.addEventListener('click', () => {
  if (usedMemories.length >= MEMORIES.length) usedMemories = [];
  const available = MEMORIES.filter((_, i) => !usedMemories.includes(i));
  const idx = MEMORIES.indexOf(available[Math.floor(Math.random() * available.length)]);
  usedMemories.push(idx);

  jarMemory.classList.remove('on');
  setTimeout(() => {
    jarMemory.textContent = MEMORIES[idx];
    jarMemory.classList.add('on');
  }, 100);

  sparkleBurst(jarBtn, 10);
});

/* =========================================================
   LETTER
   ========================================================= */
const letterPaper = document.getElementById('letterPaper');
const letterBtn = document.getElementById('letterBtn');

letterBtn.addEventListener('click', e => {
  e.stopPropagation();
  letterPaper.classList.add('open');
  setTimeout(() => {
    letterPaper.scrollIntoView({ behavior:'smooth', block:'center' });
  }, 300);
  confettiBurst(40);
});

/* =========================================================
   GIFT
   ========================================================= */
const giftBox = document.getElementById('giftBox');
const giftHint = document.getElementById('giftHint');
let giftOpened = false;

giftBox.addEventListener('click', () => {
  if (giftOpened) return;
  giftOpened = true;
  giftBox.classList.add('open');
  giftHint.style.opacity = '0';
  setTimeout(() => confettiBurst(100), 400);
  setTimeout(() => showToast('💝 Você é o melhor presente!'), 800);
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
   EASTER EGG — digite "parabens"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 14) typed = typed.slice(-14);
  if (typed.includes('parabens')) {
    typed = '';
    confettiBurst(120);
    showToast('Parabéns! Você descobriu o segredo 🎉');
  }
});

/* =========================================================
   HERO PARALLAX
   ========================================================= */
const heroPhoto = document.querySelector('.hero-photo');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 16;
  if (heroPhoto) {
    heroPhoto.style.transform = `rotate(3deg) translate(${x}px, ${y}px)`;
  }
});

/* =========================================================
   RESIZE — rebuild balloons
   ========================================================= */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {}, 300);
});

/* Integração com criar.html e ver.html; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"aniversario",title: '.hero-title', phrase: '.hero-lede', letters: ['#letterPaper .letter-full'],
  collections:{memories:{label:'Pote de memórias',value:MEMORIES},},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    galleryEl.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".timeline");
    
    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'')&&Number.isFinite(+new Date(p.inicio+'T00:00:00'));
    const counter=document.getElementById('startLabel')?.closest('.counter-card');if(counter)counter.hidden=!validDate;
    if(validDate){birthDate=new Date(p.inicio+'T00:00:00');NATheme.set('#startLabel',new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(birthDate));updateCounter();}
    naChange(MEMORIES,c.memories,()=>{usedMemories=[];jarMemory.textContent='';});if(validDate){birthDate=new Date(p.inicio+'T00:00:00');let age=new Date().getFullYear()-birthDate.getFullYear();const now=new Date();if(now.getMonth()<birthDate.getMonth()||(now.getMonth()===birthDate.getMonth()&&now.getDate()<birthDate.getDate()))age--;NATheme.set('#heroAgeNum',Math.max(0,age));NATheme.set('#badgeAge',Math.max(0,age));}NATheme.set('#giftTitle',p.para||'Você é o presente');
  },dispose:()=>stopMic(),
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
