
/* =========================================================
   CONFIG — EDITE AQUI
   ========================================================= */
const CONFIG = {
  startDate: '2018-06-15T19:30:00',
  startLabel: '15 de junho de 2018',
  songTitle: 'Amigos para Sempre',
  songArtist: 'Trilha oficial',
  songCover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=85&auto=format&fit=crop', cap:'A gente sendo a gente' },
  { src:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=85&auto=format&fit=crop', cap:'Aquele rolê épico' },
  { src:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=85&auto=format&fit=crop', cap:'Risada boa' },
  { src:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=85&auto=format&fit=crop', cap:'Nossa energia' },
  { src:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=85&auto=format&fit=crop', cap:'Papo de madrugada' },
  { src:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85&auto=format&fit=crop', cap:'A turma toda' },
  { src:'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&q=85&auto=format&fit=crop', cap:'Momento aleatório' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=85&auto=format&fit=crop', cap:'O dia em que nos conhecemos ✨' },
  { img:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=85&auto=format&fit=crop', cap:'Rolê que virou história' },
  { img:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=85&auto=format&fit=crop', cap:'Nunca paramos de rir 😂' },
  { img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=85&auto=format&fit=crop', cap:'Nossa vibe oficial' },
  { img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85&auto=format&fit=crop', cap:'Para sempre nós ❤' }
];

const JOKES_MARQUEE = [
  '"Aquilo"', '"Só nós dois"', '"Você sabe do que eu tô falando"',
  '"Aquele dia"', '"Não fala isso em público"', '"A gente riu por 40 minutos"',
  '"Momento icônico"', '"Pior que já aconteceu mesmo"'
];

const QUIZ = [
  {
    q: 'Qual é a minha comida favorita?',
    opts: ['Pizza', 'Sushi', 'Hambúrguer', 'Lasanha'],
    correct: 0
  },
  {
    q: 'Qual seria minha profissão dos sonhos?',
    opts: ['Médico(a)', 'Astronauta', 'Artista', 'CEO de startup'],
    correct: 2
  },
  {
    q: 'O que eu faria primeiro se ganhasse na loteria?',
    opts: ['Sumiria do mapa', 'Compraria uma casa', 'Dividiria com a família', 'Investiria tudo'],
    correct: 1
  },
  {
    q: 'Qual é o meu maior medo?',
    opts: ['Altura', 'Aranhas', 'Ficar sozinho(a)', 'Fracassar'],
    correct: 2
  },
  {
    q: 'Qual seria nosso rolê perfeito?',
    opts: ['Balada até cair', 'Ficar em casa comendo', 'Viagem internacional', 'Parque de diversões'],
    correct: 1
  }
];

const MEMORIES = [
  'Aquele dia que a gente riu até chorar por causa de uma besteira 🎬',
  'A madrugada inteira conversando sem perceber o tempo passar 🌙',
  'A vez que a gente se perdeu e virou a maior aventura 🗺️',
  'Aquele rolê que começou aleatório e virou tradição 🍕',
  'O dia em que a gente fez o maior drama à toa (e rimos depois) 😂',
  'A playlist que virou a nossa trilha oficial 🎧',
  'O abraço apertado que resolveu tudo 🤗',
  'Aquela foto horrível que a gente nunca vai apagar 📸'
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
   CURSOR GLOW
   ========================================================= */
const glow = document.getElementById('cursorGlow');
let gx = window.innerWidth/2, gy = window.innerHeight/2;
let tgx = gx, tgy = gy;

document.addEventListener('mousemove', e => {
  tgx = e.clientX; tgy = e.clientY;
  glow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

function glowLoop(){
  gx += (tgx - gx) * 0.12;
  gy += (tgy - gy) * 0.12;
  glow.style.transform = `translate(${gx - 170}px, ${gy - 170}px)`;
  requestAnimationFrame(glowLoop);
}
glowLoop();

/* =========================================================
   SCROLL BAR + TO TOP
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
   FUN STATS (count up)
   ========================================================= */
const funStatsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1600;
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
   GALLERY POLAROIDS
   ========================================================= */
const polWrap = document.getElementById('polaroids');
function naRenderGallery(){
polWrap.replaceChildren();
GALLERY.forEach((item, i) => {
  const div = document.createElement('div');
  div.className = 'polaroid';
  div.dataset.index = i;
  div.innerHTML = `<img src="${NATheme.escape(item.src)}" alt="${NATheme.escape(item.cap)}" loading="lazy"><span class="cap">${NATheme.escape(item.cap)}</span>`;
  polWrap.appendChild(div);
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

polWrap.addEventListener('click', e => {
  const item = e.target.closest('.polaroid');
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
   MARQUEE
   ========================================================= */
const mq = document.getElementById('marqueeTrack');
const mqItems = [...JOKES_MARQUEE, ...JOKES_MARQUEE];
mq.innerHTML = mqItems.map(j => `<span>${j}</span><span class="sep">◆</span>`).join('');

/* =========================================================
   JOKE FLIP CARDS
   ========================================================= */
document.querySelectorAll('.joke-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('on'));
});

/* =========================================================
   QUIZ
   ========================================================= */
const quizContent = document.getElementById('quizContent');
const quizResult = document.getElementById('quizResult');
const quizStep = document.getElementById('quizStep');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizProgressFill = document.getElementById('quizProgressFill');
const quizRestart = document.getElementById('quizRestart');

let quizIdx = 0; let quizVersion = 0;
let quizScore = 0;

function renderQuiz(){
  if (quizIdx >= QUIZ.length){
    showQuizResult();
    return;
  }
  const q = QUIZ[quizIdx];
  quizStep.textContent = `Pergunta ${quizIdx + 1} de ${QUIZ.length}`;
  quizQuestion.textContent = q.q;
  quizOptions.innerHTML = '';

  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if(btn.classList.contains('disabled'))return;
      const all = quizOptions.querySelectorAll('.quiz-opt');
      all.forEach(b => b.classList.add('disabled'));

      if (i === q.correct){
        btn.classList.add('correct');
        quizScore++;
      } else {
        btn.classList.add('wrong');
        all[q.correct].classList.add('correct');
      }

      const version=quizVersion;
      setTimeout(() => {
        if(version!==quizVersion)return;
        quizIdx++;
        quizProgressFill.style.width = ((quizIdx) / QUIZ.length * 100) + '%';
        setTimeout(renderQuiz, 300);
      }, 900);
    });
    quizOptions.appendChild(btn);
  });

  quizProgressFill.style.width = (quizIdx / QUIZ.length * 100) + '%';
}

function showQuizResult(){
  quizContent.style.display = 'none';
  quizResult.classList.add('on');

  document.getElementById('qrScore').textContent = `${quizScore}/${QUIZ.length}`;

  const messages = {
    5: { title:'Amizade Lendária confirmada! 🏆', msg:'Você me conhece como ninguém. Se a amizade fosse um esporte, a gente seria campeão olímpico.' },
    4: { title:'Impressionante! 🔥', msg:'Quase perfeito. Só um detalhe te separa do topo — mas tá perdoado(a).' },
    3: { title:'Até que você me conhece… 👀', msg:'Tá no caminho. Precisamos passar mais tempo juntos (de novo).' },
    2: { title:'Hmm, tá fraco… 😅', msg:'Acho que a gente precisa marcar um rolê URGENTE para você prestar mais atenção em mim.' },
    1: { title:'Amizade em risco? 🤔', msg:'Brincadeira… mas sério, vamos conversar. Tô preocupado(a).' },
    0: { title:'Vou fingir que não vi 😬', msg:'A gente ainda vai fazer terapia juntos por causa disso. Marca um café e me conhece de verdade.' }
  };

  const m = messages[Math.round(quizScore / Math.max(1, QUIZ.length) * 5)] || messages[0];
  document.getElementById('qrTitle').textContent = m.title;
  document.getElementById('qrMsg').textContent = m.msg;
}

function resetQuiz(){
  quizVersion++;
  quizIdx = 0;
  quizScore = 0;
  quizContent.style.display = 'block';
  quizResult.classList.remove('on');
  quizProgressFill.style.width = '0%';
  renderQuiz();
}

quizRestart.addEventListener('click', resetQuiz);
renderQuiz();

/* =========================================================
   BUCKET LIST
   ========================================================= */
document.querySelectorAll('.bucket-item').forEach(item => {
  item.addEventListener('click', (e) => {
    // let the input handle its own state via label
  });
});

/* =========================================================
   NOTE / CARTA
   ========================================================= */
const note = document.getElementById('note');
const noteBtn = document.getElementById('noteBtn');

note.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' || !note.classList.contains('open')) {
    note.classList.add('open');
  }
});
noteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  note.classList.add('open');
});

/* =========================================================
   ROULETTE
   ========================================================= */
const rouletteBtn = document.getElementById('rouletteBtn');
const rouletteMemory = document.getElementById('rouletteMemory');
let lastMemoryIdx = -1;

rouletteBtn.addEventListener('click', () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * MEMORIES.length);
  } while (idx === lastMemoryIdx && MEMORIES.length > 1);
  lastMemoryIdx = idx;

  rouletteMemory.classList.remove('on');
  setTimeout(() => {
    rouletteMemory.textContent = MEMORIES[idx];
    rouletteMemory.classList.add('on');
  }, 100);

  sparkleBurst(rouletteBtn, 8);
});

/* =========================================================
   SPARKLES
   ========================================================= */
function sparkleBurst(anchor, count){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = ['✦','✧','⋆','✶'][Math.floor(Math.random()*4)];
    s.style.position = 'fixed';
    s.style.left = (rect.left + rect.width/2) + 'px';
    s.style.top = (rect.top + rect.height/2) + 'px';
    s.style.color = ['#8b5cf6','#22d3ee','#f472b6','#a3e635'][Math.floor(Math.random()*4)];
    s.style.fontSize = (10 + Math.random()*14) + 'px';
    s.style.zIndex = '9200';
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
  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = ['✦','✧','◆','●','▲','🎉','✨','⭐'][Math.floor(Math.random()*8)];
    c.style.position = 'fixed';
    c.style.left = (20 + Math.random()*60) + '%';
    c.style.top = (20 + Math.random()*30) + '%';
    c.style.color = ['#8b5cf6','#22d3ee','#f472b6','#a3e635','#fff'][Math.floor(Math.random()*5)];
    c.style.fontSize = (10 + Math.random()*18) + 'px';
    c.style.zIndex = '9600';
    c.style.pointerEvents = 'none';
    document.body.appendChild(c);

    const tx = (Math.random() - 0.5) * 600;
    const ty = (Math.random() - 0.5) * 500;

    c.animate([
      { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx*0.7}px), calc(-50% + ${ty*0.7}px)) scale(1.2) rotate(${Math.random()*360}deg)`, opacity:1, offset:.5 },
      { transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 200}px)) scale(.2) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], { duration: 1600 + Math.random()*1000, easing:'cubic-bezier(.16,.84,.32,1)', fill:'forwards' });

    setTimeout(() => c.remove(), 2800);
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
   HERO STICKERS PARALLAX
   ========================================================= */
const stickers = document.querySelectorAll('.sticker');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  stickers.forEach((s, i) => {
    const factor = (i % 3) + 1;
    s.style.transform = `translate(${x * factor * 0.3}px, ${y * factor * 0.3}px) rotate(${x * 0.2}deg)`;
  });
});

/* =========================================================
   EASTER EGG — digite "amigo"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 10) typed = typed.slice(-10);
  if (typed.includes('amigo')) {
    typed = '';
    confettiBurst(80);
    showToast('Amizade lendária confirmada! ✦');
  }
});

/* =========================================================
   CLICK CONFETTI ON QUIZ RESULT
   ========================================================= */
quizRestart.addEventListener('click', () => {
  // no extra effect, but keeps button responsive
});

/* Integração com /criar-presente e /presente; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"amizade",title: '.hero-title .line2', phrase: '.hero-sub', letters: ['.note-full'],
  collections:{quiz: {label:'Quiz da amizade',value:QUIZ}, memories:{label:'Roleta de memórias',value:MEMORIES}, jokes:{label:'Frases que passam na tela',value:JOKES_MARQUEE},},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    polWrap.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".chapters");

    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'')&&Number.isFinite(+new Date(p.inicio+'T00:00:00'));
    const counter=document.getElementById('startLabel')?.closest('.counter-card');if(counter)counter.hidden=!validDate;
    if(validDate){startDate=new Date(p.inicio+'T00:00:00');NATheme.set('#startLabel',new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(startDate));updateCounter();}
    naChange(QUIZ, c.quiz, resetQuiz); naChange(MEMORIES,c.memories,()=>{lastMemoryIdx=-1;rouletteMemory.textContent='';}); naChange(JOKES_MARQUEE,c.jokes,()=>naMarquee(JOKES_MARQUEE));
  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
