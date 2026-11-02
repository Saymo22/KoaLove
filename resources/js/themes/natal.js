(function(){
'use strict';

/* ================= LOADER ================= */
window.addEventListener('load', function(){
  setTimeout(function(){ document.getElementById('loader').classList.add('hidden'); }, 900);
});

/* ================= NEVE CANVAS ================= */
(function snow(){
  const canvas = document.getElementById('snow');
  const ctx = canvas.getContext('2d');
  let flakes = [], raf;

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const count = Math.min(180, Math.max(50, Math.floor((w*h)/13000)));
    flakes = Array.from({length:count}, function(){
      const layer = Math.random() < .3 ? 0 : (Math.random() < .6 ? 1 : 2);
      return {
        x: Math.random()*w, y: Math.random()*h,
        r: 0.8 + Math.random()*2.6 + layer*0.5,
        vy: (0.25 + Math.random()*0.6) * (1+layer*.35),
        vx: -0.3 + Math.random()*0.6,
        a: 0.35 + Math.random()*0.55,
        phase: Math.random()*Math.PI*2,
        layer: layer
      };
    });
  }

  function tick(t){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<flakes.length;i++){
      const f = flakes[i];
      f.y += f.vy;
      f.x += f.vx + Math.sin((t + f.phase*1000)/1600) * (0.15 + f.layer*0.15);
      if(f.y > h+8){ f.y = -8; f.x = Math.random()*w; }
      if(f.x > w+8) f.x = -8;
      if(f.x < -8) f.x = w+8;
      const g = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*3);
      g.addColorStop(0,'rgba(255,244,200,'+f.a+')');
      g.addColorStop(1,'rgba(255,244,200,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x,f.y,f.r*3,0,Math.PI*2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function(){
    cancelAnimationFrame(raf); resize(); raf = requestAnimationFrame(tick);
  });
  resize();
  raf = requestAnimationFrame(tick);
})();

/* ================= COUNTDOWN ================= */
(function countdown(){
  function update(){
    const now = new Date();
    let year = now.getFullYear();
    let xmas = new Date(year, 11, 25, 0, 0, 0);
    if(now > xmas){ year++; xmas = new Date(year, 11, 25, 0, 0, 0); }
    const diff = xmas - now;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);
    document.getElementById('cdDays').textContent = String(d).padStart(2,'0');
    document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
    document.getElementById('cdMins').textContent = String(m).padStart(2,'0');
    document.getElementById('cdSecs').textContent = String(s).padStart(2,'0');
  }
  update();
  setInterval(update,1000);
})();

/* ================= GALERIA ================= */
const galleryPhotos = ['natalA','natalB','natalC','natalD','natalE','natalF','natalG','natalH','natalI','natalJ','natalK','natalL'];
const gallery = document.getElementById('gallery');
galleryPhotos.forEach(function(seed,i){
  const div = document.createElement('div');
  div.className = 'gallery-item';
  div.dataset.index = i;
  const img = document.createElement('img');
  img.src = 'https://picsum.photos/seed/'+seed+'/600/600';
  img.alt = 'Momento '+(i+1);
  img.loading = 'lazy';
  div.appendChild(img);
  div.addEventListener('click', function(){ openLightbox(i); });
  gallery.appendChild(div);
});

/* ================= LIGHTBOX ================= */
let lbIndex = 0;
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
function openLightbox(i){
  lbIndex = i;
  lbImg.src = 'https://picsum.photos/seed/'+galleryPhotos[i]+'/1400/1400';
  lightbox.classList.add('open');
}
function closeLightbox(){ lightbox.classList.remove('open'); }
function lbNext(){ lbIndex = (lbIndex+1)%galleryPhotos.length; lbImg.src = 'https://picsum.photos/seed/'+galleryPhotos[lbIndex]+'/1400/1400'; }
function lbPrev(){ lbIndex = (lbIndex-1+galleryPhotos.length)%galleryPhotos.length; lbImg.src = 'https://picsum.photos/seed/'+galleryPhotos[lbIndex]+'/1400/1400'; }
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbNext').addEventListener('click', lbNext);
document.getElementById('lbPrev').addEventListener('click', lbPrev);
lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', function(e){
  if(!lightbox.classList.contains('open')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowRight') lbNext();
  if(e.key === 'ArrowLeft') lbPrev();
});

/* ================= ABRIR PRESENTE ================= */
const giftbox = document.getElementById('giftbox');
const unlocked = document.getElementById('unlocked');
let opened = false;

giftbox.addEventListener('click', function(){
  if(opened) return;
  opened = true;
  giftbox.classList.add('opened');
  burstConfetti(giftbox);

  setTimeout(function(){
    unlocked.classList.add('show');
    document.querySelectorAll('.section').forEach(function(s){ revealObserver.observe(s); });
    setTimeout(function(){
      document.getElementById('gift').scrollIntoView({behavior:'smooth', block:'start'});
    }, 300);
  }, 2600);
});

/* ================= CONFETTI ================= */
function burstConfetti(el){
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const colors = ['#D4AF37','#F3D27A','#FFF8DB','#B3122B','#E23A50','#2EB482','#F6EFE0'];
  for(let i=0;i<120;i++){
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = cx + 'px';
    piece.style.top = cy + 'px';
    piece.style.background = colors[i%colors.length];
    piece.style.width = (6+Math.random()*6)+'px';
    piece.style.height = (8+Math.random()*8)+'px';
    piece.style.borderRadius = Math.random()<.5 ? '50%' : '2px';
    piece.style.setProperty('--tx', ((Math.random()-0.5)*520)+'px');
    piece.style.setProperty('--ty', (-Math.random()*480-80)+'px');
    piece.style.setProperty('--rot', ((Math.random()-0.5)*900)+'deg');
    piece.style.animationDelay = (Math.random()*0.15)+'s';
    document.body.appendChild(piece);
    setTimeout(function(){ piece.remove(); }, 1900);
  }
}

/* ================= REVEAL ON SCROLL ================= */
const revealObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      if(entry.target.id === 'letterSection') startTypewriter();
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.12});

document.querySelectorAll('.section').forEach(function(s){
  if(s.closest('#unlocked')) return;
  revealObserver.observe(s);
});

/* ================= TYPEWRITER ================= */
const letterText = `Meu amor,

Este ano foi especial porque você esteve em cada detalhe. Cada risada, cada abraço apertado, cada momento simples que virou memória — tudo isso só foi possível porque você existe.

Neste Natal, o meu maior presente é poder estar ao seu lado. Não tem laço, não tem papel bonito, não tem árvore enfeitada que chegue perto do que sinto quando você sorri.

Que a gente continue escrevendo essa história por muitos e muitos Natais. Eu te amo, hoje e sempre.

Com todo o meu carinho,
Eu 💛`;
let typed = false;
function startTypewriter(){
  if(typed) return;
  typed = true;
  const el = document.getElementById('letterBody');
  let i = 0;
  const speed = 26;
  function tick(){
    if(i >= letterText.length){ el.classList.add('typed'); return; }
    el.textContent += letterText.charAt(i);
    i++;
    setTimeout(tick, speed);
  }
  tick();
}

/* ================= MINI PRESENTES ================= */
document.querySelectorAll('.mini-gift').forEach(function(g){
  g.addEventListener('click', function(){ g.classList.toggle('open'); });
});

/* ================= ÁRVORE INTERATIVA ================= */
const treeMsg = document.getElementById('treeMsg');
let msgTimeout;
document.querySelectorAll('.orn').forEach(function(orn){
  orn.addEventListener('click', function(){
    orn.classList.add('pressed');
    setTimeout(function(){ orn.classList.remove('pressed'); }, 500);
    treeMsg.textContent = orn.dataset.msg;
    treeMsg.classList.add('show');
    clearTimeout(msgTimeout);
    msgTimeout = setTimeout(function(){ treeMsg.classList.remove('show'); }, 3200);
    if(audioCtx && audioCtx.state === 'running'){
      playBell(NOTE.E5, 0.4, 0.12);
    }
  });
});

/* ================= WISH LIST ================= */
document.querySelectorAll('[data-wish]').forEach(function(item){
  item.addEventListener('click', function(){
    item.classList.toggle('done');
    const check = item.querySelector('.wish-check');
    check.textContent = item.classList.contains('done') ? '☑' : '☐';
    if(audioCtx && audioCtx.state === 'running') playBell(NOTE.G5, 0.3, 0.12);
  });
});

/* ================= GLOBO ================= */
const globe = document.getElementById('globe');
const globeSnow = document.getElementById('globeSnow');
for(let i=0;i<32;i++){
  const dot = document.createElement('span');
  dot.textContent = '❄';
  dot.style.left = Math.random()*100+'%';
  dot.style.top = -(Math.random()*50)+'px';
  dot.style.fontSize = (6+Math.random()*8)+'px';
  dot.style.animationDuration = (3+Math.random()*4)+'s';
  dot.style.animationDelay = (-Math.random()*6)+'s';
  globeSnow.appendChild(dot);
}
globe.addEventListener('click', function(){
  globe.classList.add('shake');
  setTimeout(function(){ globe.classList.remove('shake'); }, 1300);
});

/* ================= FLIP CARD ================= */
document.getElementById('flipCard').addEventListener('click', function(){
  this.classList.toggle('flipped');
});

/* ================= WEB AUDIO ================= */
let audioCtx = null;
let isMusicPlaying = false;
let musicTimeout = null;
let musicIndex = 0;

const NOTE = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, G5:783.99
};

const jingleBells = [
  ['E4',250],['E4',250],['E4',500],
  ['E4',250],['E4',250],['E4',500],
  ['E4',250],['G4',250],['C4',300],['D4',250],['E4',750],
  ['F4',250],['F4',250],['F4',250],['F4',250],
  ['F4',250],['E4',250],['E4',250],['E4',250],
  ['E4',250],['D4',250],['D4',250],['E4',250],['D4',500],['G4',500],
  ['E4',250],['E4',250],['E4',500],
  ['E4',250],['E4',250],['E4',500],
  ['E4',250],['G4',250],['C4',300],['D4',250],['E4',750],
  ['F4',250],['F4',250],['F4',250],['F4',250],
  ['F4',250],['E4',250],['E4',250],['E4',250],
  ['G4',250],['G4',250],['F4',250],['D4',250],['C4',750]
];

function initAudio(){
  if(audioCtx){
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  audioCtx = new AC();
  const len = audioCtx.sampleRate * 2.5;
  const impulse = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for(let ch=0;ch<2;ch++){
    const d = impulse.getChannelData(ch);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.6);
  }
  const reverb = audioCtx.createConvolver();
  reverb.buffer = impulse;
  const dry = audioCtx.createGain(); dry.gain.value = 0.6;
  const wet = audioCtx.createGain(); wet.gain.value = 0.35;
  const master = audioCtx.createGain(); master.gain.value = 0.55;
  dry.connect(master);
  reverb.connect(wet).connect(master);
  master.connect(audioCtx.destination);
  audioCtx._dry = dry;
  audioCtx._reverb = reverb;
}

function playBell(freq, dur, vol){
  if(!audioCtx) return;
  const when = audioCtx.currentTime;
  const partials = [
    {ratio:1.00, vol: vol || 0.18},
    {ratio:2.76, vol: (vol || 0.18) * 0.35},
    {ratio:5.40, vol: (vol || 0.18) * 0.15}
  ];
  partials.forEach(function(p){
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * p.ratio;
    const start = when;
    const end = when + (dur || 0.6);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(p.vol, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, end + 0.6);
    osc.connect(g);
    g.connect(audioCtx._dry);
    g.connect(audioCtx._reverb);
    osc.start(start);
    osc.stop(end + 0.8);
  });
}

function playJingleSequence(loop){
  if(!audioCtx) return;
  const note = jingleBells[musicIndex % jingleBells.length];
  playBell(NOTE[note[0]], note[1]/1000, 0.16);
  musicIndex++;
  if(musicIndex >= jingleBells.length && !loop){ musicIndex = 0; return; }
  musicTimeout = setTimeout(function(){ playJingleSequence(loop); }, note[1]*0.96);
}

function playJingleRiff(){
  initAudio();
  if(!audioCtx) return;
  const riff = [
    ['E4',200],['E4',200],['E4',400],
    ['E4',200],['E4',200],['E4',400],
    ['E4',200],['G4',200],['C4',250],['D4',200],['E4',700]
  ];
  let i = 0;
  function step(){
    if(i >= riff.length) return;
    const n = riff[i];
    playBell(NOTE[n[0]], n[1]/1000, 0.22);
    i++;
    setTimeout(step, n[1]*0.95);
  }
  step();
}

const bellBtn = document.getElementById('bellBtn');
const heroJingle = document.getElementById('heroJingle');
function jingleAction(e){
  if(e && e.currentTarget){
    e.currentTarget.classList.add('ringing');
    setTimeout(function(){ e.currentTarget.classList.remove('ringing'); }, 900);
  }
  playJingleRiff();
}
bellBtn.addEventListener('click', jingleAction);
if(heroJingle) heroJingle.addEventListener('click', jingleAction);

const musicPlayer = document.getElementById('musicPlayer');
const musicBtn = document.getElementById('musicBtn');
const musicLabel = document.getElementById('musicLabel');
musicBtn.addEventListener('click', function(){
  initAudio();
  if(!audioCtx) return;
  if(isMusicPlaying){
    isMusicPlaying = false;
    clearTimeout(musicTimeout);
    musicPlayer.classList.remove('playing');
    musicBtn.textContent = '▶';
    musicLabel.textContent = 'Toque para tocar';
  } else {
    isMusicPlaying = true;
    musicIndex = 0;
    musicPlayer.classList.add('playing');
    musicBtn.textContent = '❚❚';
    musicLabel.textContent = 'Tocando agora';
    playJingleSequence(true);
  }
});

/* ================= VÍDEOS STORIES (CIRCULAR) ================= */
const videoStories = [
  { src: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: '🎬 O começo de tudo', poster: 'https://picsum.photos/seed/vs1/400/400' },
  { src: 'https://www.w3schools.com/html/movie.mp4',  caption: '💛 Cada instante ao seu lado', poster: 'https://picsum.photos/seed/vs2/400/400' },
  { src: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: '❄️ Nosso primeiro inverno juntos', poster: 'https://picsum.photos/seed/vs3/400/400' },
  { src: 'https://www.w3schools.com/html/movie.mp4',  caption: '🎄 Este Natal é só nosso', poster: 'https://picsum.photos/seed/vs4/400/400' },
  { src: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: '✨ Para sempre, para sempre', poster: 'https://picsum.photos/seed/vs5/400/400' }
];

// Gradientes coloridos iguais aos da imagem de referência
const circleGradients = [
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', // Rosa/roxo claro
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', // Rosa/azul
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Azul claro
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Laranja/amarelo
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'  // Verde/azul
];

const videosGrid = document.getElementById('videosGrid');
videoStories.forEach(function(v, i){
  const item = document.createElement('div');
  item.className = 'story-circle-item';

  const gradient = circleGradients[i % circleGradients.length];

  item.innerHTML =
    '<div class="story-circle" style="background: ' + gradient + ';">' +
      '<div class="story-img-wrap">' +
        '<img src="' + v.poster + '" alt="Story ' + (i+1) + '" loading="lazy">' +
        '<div class="story-play-icon"></div>' +
      '</div>' +
    '</div>' +
    '<span class="story-label">STORY ' + (i+1) + '</span>';

  item.addEventListener('click', function(){ openStory(i); });
  videosGrid.appendChild(item);
});

/* ================= STORY PLAYER (VÍDEOS) ================= */
const storyPlayer = document.getElementById('storyPlayer');
const storyProgress = document.getElementById('storyProgress');
const storyMedia = document.getElementById('storyMedia');
const storyCaption = document.getElementById('storyCaption');
const storyViewport = document.getElementById('storyViewport');
const storyPlayPause = document.getElementById('storyPlayPause');
let storyIndex = 0;
let storyTimer = null;
let storyVideoEl = null;
let storyPaused = false;

function buildProgress(){
  storyProgress.innerHTML = '';
  videoStories.forEach(function(){
    const bar = document.createElement('div');
    bar.className = 'story-progress-bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    bar.appendChild(fill);
    storyProgress.appendChild(bar);
  });
}

function renderStory(i){
  clearTimeout(storyTimer);
  if(storyVideoEl){ storyVideoEl.pause(); storyVideoEl = null; }
  storyMedia.innerHTML = '';
  storyCaption.textContent = '';
  storyViewport.classList.remove('paused');
  storyPaused = false;

  const v = videoStories[i];
  const bars = storyProgress.querySelectorAll('.story-progress-bar');
  bars.forEach(function(bar, idx){
    bar.classList.remove('active', 'done');
    if(idx < i) bar.classList.add('done');
  });

  if(i >= videoStories.length){ closeStory(); return; }

  const video = document.createElement('video');
  video.src = v.src;
  video.poster = v.poster;
  video.autoplay = true;
  video.playsInline = true;
  video.muted = false;
  video.setAttribute('playsinline', '');
  storyMedia.appendChild(video);
  storyVideoEl = video;
  storyCaption.textContent = v.caption;

  video.addEventListener('loadedmetadata', function(){
    const dur = Math.min(video.duration || 5, 15) * 1000;
    bars[i].style.setProperty('--duration', (dur/1000) + 's');
    bars[i].classList.remove('active');
    void bars[i].offsetWidth;
    bars[i].classList.add('active');
  });
  video.addEventListener('ended', function(){ nextStory(); });
  video.addEventListener('timeupdate', function(){
    if(!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    const fill = bars[i].querySelector('.fill');
    fill.style.animation = 'none';
    fill.style.width = pct + '%';
  });
  video.play().catch(function(){
    storyViewport.classList.add('paused');
    storyPaused = true;
  });
}

function openStory(idx){
  storyIndex = typeof idx === 'number' ? idx : 0;
  buildProgress();
  storyPlayer.classList.add('open');
  renderStory(storyIndex);
}
function closeStory(){
  storyPlayer.classList.remove('open');
  clearTimeout(storyTimer);
  if(storyVideoEl){ storyVideoEl.pause(); storyVideoEl = null; }
}
function nextStory(){
  if(storyIndex >= videoStories.length - 1){ closeStory(); return; }
  storyIndex++;
  renderStory(storyIndex);
}
function prevStory(){
  if(storyIndex <= 0){ renderStory(0); return; }
  storyIndex--;
  renderStory(storyIndex);
}
function togglePlayPause(){
  if(!storyVideoEl) return;
  if(storyVideoEl.paused){
    storyVideoEl.play();
    storyViewport.classList.remove('paused');
    storyPaused = false;
  } else {
    storyVideoEl.pause();
    storyViewport.classList.add('paused');
    storyPaused = true;
  }
}

document.getElementById('storyClose').addEventListener('click', closeStory);
document.getElementById('storyNextTap').addEventListener('click', nextStory);
document.getElementById('storyPrevTap').addEventListener('click', prevStory);
storyPlayPause.addEventListener('click', togglePlayPause);

document.addEventListener('keydown', function(e){
  if(!storyPlayer.classList.contains('open')) return;
  if(e.key === 'Escape') closeStory();
  if(e.key === 'ArrowRight') nextStory();
  if(e.key === 'ArrowLeft') prevStory();
  if(e.key === ' ') { e.preventDefault(); togglePlayPause(); }
});

})();
