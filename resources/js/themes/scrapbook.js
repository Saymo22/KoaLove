
/* =========================================================
   CONFIG
   ========================================================= */
const CONFIG = {
  songTitle: 'Nossa trilha',
  songArtist: 'Lado A · Nosso mix'
};

const POLAROIDS = [
  { src:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80&auto=format&fit=crop', cap:'O primeiro dia' },
  { src:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80&auto=format&fit=crop', cap:'Rolê épico' },
  { src:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80&auto=format&fit=crop', cap:'Flores e você' },
  { src:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80&auto=format&fit=crop', cap:'Risada boa' },
  { src:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80&auto=format&fit=crop', cap:'Nossa viagem' },
  { src:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop', cap:'Nossa energia' },
  { src:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80&auto=format&fit=crop', cap:'Papo de madrugada' },
  { src:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop', cap:'A turma toda' },
  { src:'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80&auto=format&fit=crop', cap:'Momento aleatório' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=80&auto=format&fit=crop', cap:'O dia em que tudo começou ✦' },
  { img:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=80&auto=format&fit=crop', cap:'Rolê que virou história' },
  { img:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=900&q=80&auto=format&fit=crop', cap:'Nunca paramos de rir' },
  { img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&auto=format&fit=crop', cap:'Nossa viagem ❤' },
  { img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop', cap:'Para sempre nós' }
];

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
const cursorPencil = document.getElementById('cursorPencil');
let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorPencil.style.transform = `translate(${mx - 4}px, ${my - 22}px) rotate(-8deg)`;
});

document.querySelectorAll('a, button, .polaroid, .postcard, .ticket, .story-thumb, .journal-photo, .sticky-note, .letter-envelope, .bucket-item, .cassette-btn').forEach(el => {
  el.addEventListener('mouseenter', () => cursorPencil.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursorPencil.classList.remove('grow'));
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
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* =========================================================
   COVER — ABRIR SCRAPBOOK
   ========================================================= */
const scrapbookCover = document.getElementById('scrapbookCover');
const coverFront = document.getElementById('coverFront');
const coverHint = document.getElementById('coverHint');
let coverOpen = false;

function openCover(){
  if (coverOpen) return;
  coverOpen = true;
  scrapbookCover.classList.add('open');
  coverHint.classList.add('hide');
  setTimeout(() => {
    confettiBurst(60, '✂');
    showToast('Bem-vindo ao nosso scrapbook ✦');
  }, 800);
}

coverFront.addEventListener('click', openCover);

/* =========================================================
   POLAROIDS
   ========================================================= */
const grid = document.getElementById('polaroidGrid');
const TAPE_CLASSES = ['tape-coral','tape-mustard','tape-teal','tape-navy'];
const TAPE_POS = ['tape-tl','tape-tr','tape-bl','tape-br'];

function naRenderGallery(){
grid.replaceChildren();
POLAROIDS.forEach((photo, i) => {
  const div = document.createElement('div');
  div.className = 'polaroid';
  div.dataset.index = i;

  const tapeClass = TAPE_CLASSES[i % TAPE_CLASSES.length];
  const tapePos = TAPE_POS[i % TAPE_POS.length];

  div.innerHTML = `
    <div class="tape ${tapeClass} ${tapePos}"></div>
    <img src="${NATheme.escape(photo.src)}" alt="${NATheme.escape(photo.cap)}" loading="lazy">
    <span class="polaroid-cap">${NATheme.escape(photo.cap)}</span>
  `;
  div.addEventListener('click', () => openLightbox(i));
  grid.appendChild(div);
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
  if(!POLAROIDS.length)return;
  lbIndex = (i + POLAROIDS.length) % POLAROIDS.length;
  lbImg.src = POLAROIDS[lbIndex].src;
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
   LETTER — ROMPER SELO
   ========================================================= */
const letterEnvelope = document.getElementById('letterEnvelope');
const envSeal = document.getElementById('envSeal');
const letterContent = document.getElementById('letterContent');
let letterOpen = false;

function openLetter(){
  if (letterOpen) return;
  letterOpen = true;
  confettiBurst(40, '♥');
  setTimeout(() => {
    letterEnvelope.classList.add('open');
    setTimeout(() => {
      letterContent.classList.add('show');
      setTimeout(() => {
        letterContent.scrollIntoView({ behavior:'smooth', block:'center' });
      }, 400);
    }, 600);
  }, 300);
}

envSeal.addEventListener('click', openLetter);
letterEnvelope.addEventListener('click', openLetter);

/* =========================================================
   CONFETTI
   ========================================================= */
function confettiBurst(count = 50, symbol = '✂'){
  const symbols = symbol === '♥'
    ? ['♥','♡','❤']
    : ['✂','✎','✦','★','♥','◆'];

  const colors = ['#e85d4a','#d4a838','#2a5c58','#2a3d5c','#c41e3a'];

  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    c.style.position = 'fixed';
    c.style.left = (10 + Math.random() * 80) + '%';
    c.style.top = (20 + Math.random() * 40) + '%';
    c.style.color = colors[Math.floor(Math.random() * colors.length)];
    c.style.fontSize = (10 + Math.random() * 18) + 'px';
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
const player = document.getElementById('player');

document.getElementById('pTitle').textContent = CONFIG.songTitle;
document.getElementById('pArtist').textContent = CONFIG.songArtist;

function setPlaying(isPlaying){
  if (isPlaying) {
    player.classList.add('playing');
    playBtn.textContent = '❚❚';
  } else {
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
   BUCKET LIST
   ========================================================= */
document.querySelectorAll('.bucket-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const input = item.querySelector('input');
    if (e.target !== input) {
      setTimeout(() => {
        if (input.checked) {
          confettiBurst(10, '♥');
        }
      }, 50);
    }
  });
});

/* =========================================================
   EASTER EGG — digite "scrapbook"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 12) typed = typed.slice(-12);
  if (typed.includes('scrapbook')) {
    typed = '';
    confettiBurst(80, '♥');
    showToast('Você achou a página secreta ✦');
  }
});

/* =========================================================
   PARALLAX SUAVE NOS POLAROIDS
   ========================================================= */
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight * 2) return;
  const polaroids = document.querySelectorAll('.polaroid');
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  polaroids.forEach((p, i) => {
    const factor = (i % 3 + 1) * 2;
    p.style.setProperty('--tx', (dx * factor) + 'px');
    p.style.setProperty('--ty', (dy * factor) + 'px');
  });
});

/* Integração com /criar-presente e /presente; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"scrapbook",title: '.hero-title', phrase: '.hero-sub', letters: ['#letterContent .letter-paper'],
  collections:{},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(POLAROIDS,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    grid.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".journal");
    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'');

  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
