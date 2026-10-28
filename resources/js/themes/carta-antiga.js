
/* =========================================================
   CONFIG — EDITE AQUI
   ========================================================= */
const CONFIG = {
  songTitle: 'La Vie En Rose',
  songArtist: 'Édith Piaf · 1947',
  songCover: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=200&q=80&auto=format&fit=crop'
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=85&auto=format&fit=crop', cap:'Aquele verão' },
  { src:'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1400&q=85&auto=format&fit=crop', cap:'Nossa praia' },
  { src:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=85&auto=format&fit=crop', cap:'Risos guardados' },
  { src:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85&auto=format&fit=crop', cap:'Mãos que contam' },
  { src:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=85&auto=format&fit=crop', cap:'Tarde de domingo' },
  { src:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85&auto=format&fit=crop', cap:'O dia perfeito' },
  { src:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&q=85&auto=format&fit=crop', cap:'Para sempre nós' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=900&q=85&auto=format&fit=crop', cap:'O começo de tudo ✦' },
  { img:'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=85&auto=format&fit=crop', cap:'Aquele dia na praia' },
  { img:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85&auto=format&fit=crop', cap:'Mãos que nunca soltam' },
  { img:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=85&auto=format&fit=crop', cap:'Risadas que ainda ecoam' },
  { img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85&auto=format&fit=crop', cap:'Para sempre, meu amor ❦' }
];

const VAULT_LETTERS = [
  {
    title: 'A que nunca enviei',
    date: 'Outono · 1998',
    body: [
      'Eu escrevi esta carta doze vezes antes de chegar nesta versão. E mesmo agora, relendo, tenho vontade de reescrever tudo de novo.',
      'Existe uma coisa que eu nunca te disse, e que talvez eu nunca diga em voz alta: você foi a primeira pessoa que me fez entender o que era querer bem sem esperar nada em troca.',
      'Se um dia você encontrar esta carta, saiba que ela foi guardada por medo, não por falta de sentimento. O tempo cuidou de amaciar o que era urgente — mas nunca o que era verdadeiro.'
    ],
    signature: '— Para você, sempre'
  },
  {
    title: 'A mais longa',
    date: 'Primavera · 2015',
    body: [
      'Quinze páginas. Tinta vermelha. Coração aberto.',
      'Comecei a escrever achando que teria muito a dizer — e tive. Falei de tudo: das vezes que ri até doer, das vezes que chorei escondido, das vezes que o mundo ficou cinza e você foi a única cor.',
      'Terminei sem saber se enviaria. Nunca enviei. Mas o tempo guardou — e agora você lê. Talvez tenha sido sempre para ser assim: a carta espera o momento certo, e o momento certo era este.'
    ],
    signature: '— Com todo o meu coração'
  },
  {
    title: 'A que guardei para depois',
    date: 'Inverno · 2005',
    body: [
      'Escrevi esta carta num dia frio, com a janela aberta e a xícara esfriando ao lado. Eu queria te dizer algo, mas não sabia o quê.',
      'Agora eu sei: eu queria te dizer que você é uma das poucas pessoas no mundo que eu escolheria de novo, em qualquer versão da vida, em qualquer tempo.',
      'O tempo passou. As folhas caíram. A xícara esfriou. E a vontade de te dizer isso só cresceu.'
    ],
    signature: '— De alguém que sempre escolheria você'
  }
];

let TW_TEXT = `Tem coisas que só a máquina de escrever consegue dizer. Não por causa das letras — mas por causa do ritmo. Cada tecla é uma pausa. Cada pausa é um pensamento. E cada pensamento, aqui, é seu.

Se a vida fosse uma carta, eu escolheria te escrever com calma. Sem pressa. Sem abreviar. Sem deixar nenhuma vírgula de fora.

Porque você merece ser lido devagar — como se lê um clássico: com atenção, com carinho, e voltando sempre às páginas favoritas.`;

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    setTimeout(() => document.getElementById('player').classList.add('show'), 700);
  }, 1200);
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
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
}
ringLoop();

document.querySelectorAll('a, button, .g-item, .story-thumb, .vault-letter, .chest, .big-seal, .envelope, .letter-modal-card').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('grow'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('grow'));
});

/* =========================================================
   SCROLL PROGRESS + TO TOP
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
   CARTA PRINCIPAL — ENVELOPE
   ========================================================= */
const mainEnvelope = document.getElementById('mainEnvelope');
const mainSeal = document.getElementById('mainSeal');
const envHint = document.getElementById('envHint');
const letterFull = document.getElementById('letterFull');
let envelopeOpen = false;

function openEnvelope(){
  if (envelopeOpen) return;
  envelopeOpen = true;

  // Quebra do selo com partículas
  inkBurst(mainSeal, 18);

  setTimeout(() => {
    mainEnvelope.classList.add('open');
    envHint.classList.add('hide');
  }, 350);

  setTimeout(() => {
    letterFull.classList.add('show');
  }, 1200);
}

mainEnvelope.addEventListener('click', openEnvelope);
mainSeal.addEventListener('click', (e) => {
  e.stopPropagation();
  openEnvelope();
});

/* =========================================================
   COFRE
   ========================================================= */
const chest = document.getElementById('chest');
const chestHint = document.getElementById('chestHint');
const vaultLetters = document.getElementById('vaultLetters');
let chestOpen = false;

function openChest(){
  if (chestOpen) return;
  chestOpen = true;
  chest.classList.add('open');
  chestHint.classList.add('hide');
  inkBurst(chest, 20);
  setTimeout(() => {
    vaultLetters.classList.add('show');
  }, 500);
}

chest.addEventListener('click', openChest);

// Render vault letters
function naRenderVault(){
vaultLetters.replaceChildren();
VAULT_LETTERS.forEach((letter, i) => {
  const div = document.createElement('div');
  div.className = 'vault-letter';
  div.innerHTML = `
    <span class="vl-stamp">Carta ${i + 1} · Lacrada</span>
    <div class="vl-title">${NATheme.escape(letter.title)}</div>
    <div class="vl-date">${NATheme.escape(letter.date)}</div>
  `;
  div.addEventListener('click', () => openLetterModal(letter));
  vaultLetters.appendChild(div);
});

}
naRenderVault();
/* =========================================================
   LETTER MODAL
   ========================================================= */
const letterModal = document.getElementById('letterModal');
const lmTitle = document.getElementById('lmTitle');
const lmDate = document.getElementById('lmDate');
const lmBody = document.getElementById('lmBody');
const lmSignature = document.getElementById('lmSignature');

function openLetterModal(letter){
  lmTitle.textContent = letter.title;
  lmDate.textContent = letter.date;
  lmBody.innerHTML = letter.body.map(p => `<p>${NATheme.escape(p)}</p>`).join('');
  lmSignature.textContent = letter.signature;
  letterModal.classList.add('on');
  document.body.style.overflow = 'hidden';
}

document.getElementById('lmClose').addEventListener('click', () => {
  letterModal.classList.remove('on');
  document.body.style.overflow = '';
});
letterModal.addEventListener('click', e => {
  if (e.target === letterModal) {
    letterModal.classList.remove('on');
    document.body.style.overflow = '';
  }
});

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
  div.innerHTML = `
    <div class="g-photo-wrap">
      <img src="${NATheme.escape(item.src)}" alt="${NATheme.escape(item.cap)}" loading="lazy">
    </div>
    <span class="g-cap">${NATheme.escape(item.cap)}</span>
  `;
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
   SELO — QUEBRAR
   ========================================================= */
const bigSeal = document.getElementById('bigSeal');
const sealHint = document.getElementById('sealHint');
const sealReveal = document.getElementById('sealReveal');
let sealBroken = false;

bigSeal.addEventListener('click', () => {
  if (sealBroken) return;
  sealBroken = true;
  bigSeal.classList.add('cracked');
  sealHint.classList.add('hide');
  inkBurst(bigSeal, 30);

  setTimeout(() => {
    bigSeal.style.display = 'none';
    sealReveal.classList.add('show');
    showToast('Selo rompido ✦');
  }, 900);
});

/* =========================================================
   TYPEWRITER
   ========================================================= */
const twTextEl = document.getElementById('twText');
const twSignature = document.getElementById('twSignature');
const twContent = document.getElementById('twContent');
let typewriterStarted = false;
let typewriterIndex = 0; let typewriterTimer = null;

function typeNextChar(){
  if (typewriterIndex < TW_TEXT.length) {
    twTextEl.textContent += TW_TEXT[typewriterIndex];
    typewriterIndex++;
    const delay = TW_TEXT[typewriterIndex - 1] === '.' || TW_TEXT[typewriterIndex - 1] === ',' ? 80 : 35;
    typewriterTimer=setTimeout(typeNextChar, delay);
  } else {
    setTimeout(() => twSignature.classList.add('show'), 400);
  }
}

const twObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !typewriterStarted) {
      typewriterStarted = true;
      typeNextChar();
      twObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
if (twContent) twObserver.observe(twContent);

/* =========================================================
   INK BURST — partículas de tinta
   ========================================================= */
function inkBurst(anchor, count = 20){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'ink-drop';
    const size = 4 + Math.random() * 14;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.zIndex = '9600';
    s.style.position = 'fixed';
    s.style.pointerEvents = 'none';
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 140;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist + (60 + Math.random() * 100);

    s.animate([
      { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx*0.5}px), calc(-50% + ${ty*0.4}px)) scale(1)`, opacity: .9, offset: .4 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.6)`, opacity: 0 }
    ], {
      duration: 900 + Math.random() * 600,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards'
    });

    setTimeout(() => s.remove(), 1600);
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
   EASTER EGG — digite "carta"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 10) typed = typed.slice(-10);
  if (typed.includes('carta')) {
    typed = '';
    inkBurst(document.body, 40);
    showToast('Algumas cartas nunca terminam ✦');
  }
});

/* =========================================================
   HERO — PARALLAX SUAVE
   ========================================================= */
const heroStack = document.querySelector('.hero-stack');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 14;
  const y = (e.clientY / window.innerHeight - 0.5) * 14;
  if (heroStack) {
    heroStack.style.transform = `translate(${x}px, ${y}px)`;
  }
});

/* Integração com /criar-presente e /presente; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"carta-antiga",title: '.hero-title', phrase: '.hero-sub', letters: ['.letter-full-paper', '.final-letter'],
  collections:{letters:{label:'Cartas do cofre',value:VAULT_LETTERS}, typewriter:{label:'Texto da máquina de escrever',value:TW_TEXT},},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    galleryEl.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".timeline");
    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'');
    naChange(VAULT_LETTERS,c.letters,naRenderVault);if(typeof c.typewriter==='string'&&TW_TEXT!==c.typewriter){clearTimeout(typewriterTimer);TW_TEXT=c.typewriter;typewriterIndex=0;twTextEl.textContent='';if(typewriterStarted)typeNextChar();}NATheme.set('#heroDate',validDate?p.inicio.slice(0,4):'Para sempre');
  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
