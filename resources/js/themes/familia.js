
/* =========================================================
   CONFIG — EDITE AQUI
   ========================================================= */
const CONFIG = {
  songTitle: 'A Casa',
  songArtist: 'Trilha da família',
  songCover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80&auto=format&fit=crop'
};

/* MEMBROS DA FAMÍLIA */
const MEMBERS = {
  voze: {
    name: 'José Silva',
    role: 'Patriarca',
    years: '1930 — 2010',
    photo: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&q=80&auto=format&fit=crop',
    bio: 'O homem que começou tudo. Trabalhou a vida inteira na lavoura, mas nunca deixou faltar nada em casa. Fazia o melhor café da família — e ninguém nunca conseguiu reproduzir. Teve 5 filhos, 12 netos e 8 bisnetos.'
  },
  vomaria: {
    name: 'Maria Silva',
    role: 'Matriarca',
    years: '1934 — 2020',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80&auto=format&fit=crop',
    bio: 'O coração da casa. Cozinheira de mão cheia, costurava, cantava e ainda arrumava tempo pra ouvir cada um dos netos. Seu bolo de cenoura virou lenda — e continua sendo feito em toda festa da família.'
  },
  vochico: {
    name: 'Francisco Santos',
    role: 'Avô materno',
    years: '1936 — 2015',
    photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&q=80&auto=format&fit=crop',
    bio: 'Contador de histórias oficial da família. Ninguém sabia se as histórias eram verdade ou invenção — e ninguém queria saber. Guardava tudo no coração e distribuía alegria por onde passava.'
  },
  voana: {
    name: 'Ana Santos',
    role: 'Avó materna',
    years: '1940 — presente',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
    bio: 'A última das matriarcas. Aos 84 anos, continua sendo o pilar da família. Reza por todos os netos todos os dias — e sempre lembra do aniversário de cada um. Ninguém sabe como ela faz.'
  },
  pai: {
    name: 'Antônio Silva',
    role: 'Pai',
    years: '1968 — presente',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop',
    bio: 'O homem mais íntegro que conheço. Aprendeu a ser pai com o próprio pai — e fez questão de ser melhor em tudo. Trabalhador, calado, mas quando fala, é sempre a coisa certa. Meu maior exemplo.'
  },
  mae: {
    name: 'Rosa Silva',
    role: 'Mãe',
    years: '1970 — presente',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop',
    bio: 'O abraço que resolve tudo. A pessoa que sabe quando você está mal antes mesmo de você falar. Fez da casa um lar, do almoço um ritual, e do amor uma prática diária. Sem ela, nada disso existiria.'
  },
  eu: {
    name: 'Seu Nome',
    role: 'Filho',
    years: '1998 — presente',
    photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&q=80&auto=format&fit=crop',
    bio: 'Cresceu ouvindo histórias da família e prometeu que um dia as contaria também. Hoje, tenta honrar cada ensinamento — com muito café, mais risadas e um pouco de teimosia herdada do avô.'
  },
  irmao: {
    name: 'Pedro Silva',
    role: 'Irmão',
    years: '2001 — presente',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80&auto=format&fit=crop',
    bio: 'O irmão que a vida me deu. Crescemos brigando por controle remoto e hoje somos melhores amigos. Tem o coração maior do mundo e um humor que só a família entende.'
  },
  irma: {
    name: 'Juliana Silva',
    role: 'Irmã',
    years: '2004 — presente',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop',
    bio: 'A caçula que manda em todo mundo. Esperta, sensível e impossível de não amar. Trouxe leveza e alegria para a casa desde o primeiro dia — e continua sendo a alegria da família inteira.'
  }
};

const GALLERY = [
  { src:'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&q=85&auto=format&fit=crop', cap:'Nossa família reunida' },
  { src:'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1400&q=85&auto=format&fit=crop', cap:'Vô Zé e Vó Maria' },
  { src:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=900&q=85&auto=format&fit=crop', cap:'Aquele domingo' },
  { src:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=85&auto=format&fit=crop', cap:'Mesa cheia' },
  { src:'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=85&auto=format&fit=crop', cap:'Nossa matriarca' },
  { src:'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1400&q=85&auto=format&fit=crop', cap:'O almoço de sempre' },
  { src:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&q=85&auto=format&fit=crop', cap:'Vó Ana, sempre linda' }
];

const STORIES = [
  { img:'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=85&auto=format&fit=crop', cap:'O dia em que todos se reuniram ❦' },
  { img:'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=900&q=85&auto=format&fit=crop', cap:'Nossas raízes mais profundas' },
  { img:'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=900&q=85&auto=format&fit=crop', cap:'Risadas que atravessam gerações' },
  { img:'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=85&auto=format&fit=crop', cap:'A mesa sempre fica cheia' },
  { img:'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=900&q=85&auto=format&fit=crop', cap:'Amor que se serve no prato' }
];

const FRASES = [
  'Enquanto há vida, há esperança',
  'Quem tem família, tem tudo',
  'Casa de ferreiro, espeto de pau',
  'O amor está no prato, não no discurso',
  'Cada um sabe onde o sapato aperta',
  'A união faz a força',
  'O que é nosso sempre volta',
  'A família é o primeiro abraço e o último também'
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
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cRing.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(ringLoop);
}
ringLoop();

document.querySelectorAll('a, button, .g-item, .member-card, .story-thumb, .tradition, .letter-paper').forEach(el => {
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
   MEMBER MODAL
   ========================================================= */
const memberModal = document.getElementById('memberModal');
const modalImg = document.getElementById('modalImg');
const modalRole = document.getElementById('modalRole');
const modalName = document.getElementById('modalName');
const modalYears = document.getElementById('modalYears');
const modalBio = document.getElementById('modalBio');

document.querySelectorAll('.member-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.member;
    const m = MEMBERS[key];
    if (!m) return;

    modalImg.src = m.photo;
    modalRole.textContent = m.role;
    modalName.textContent = m.name;
    modalYears.textContent = m.years;
    modalBio.textContent = m.bio;
    memberModal.classList.add('on');
    document.body.style.overflow = 'hidden';
  });
});

document.getElementById('modalClose').addEventListener('click', () => {
  memberModal.classList.remove('on');
  document.body.style.overflow = '';
});
memberModal.addEventListener('click', e => {
  if (e.target === memberModal) {
    memberModal.classList.remove('on');
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
   TRADIÇÕES
   ========================================================= */
document.querySelectorAll('.tradition').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('on'));
});

/* =========================================================
   FRASES MARQUEE
   ========================================================= */
const mq = document.getElementById('marqueeTrack');
const mqItems = [...FRASES, ...FRASES];
mq.innerHTML = mqItems.map(f => `<span>${f}</span><span class="sep">❦</span>`).join('');

/* =========================================================
   CARTA
   ========================================================= */
const letterPaper = document.getElementById('letterPaper');
const letterBtn = document.getElementById('letterBtn');

letterBtn.addEventListener('click', e => {
  e.stopPropagation();
  letterPaper.classList.add('open');
  setTimeout(() => {
    letterPaper.scrollIntoView({ behavior:'smooth', block:'center' });
  }, 300);
});

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
   CONFETTI (pétalas / folhas)
   ========================================================= */
function leafBurst(count = 60){
  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = ['❦','❧','✦','✿','❀','✧'][Math.floor(Math.random()*6)];
    c.style.position = 'fixed';
    c.style.left = (20 + Math.random()*60) + '%';
    c.style.top = (20 + Math.random()*30) + '%';
    c.style.color = ['#c05f3c','#d9a24a','#6b7a4a','#7a2e3a','#d97c5a'][Math.floor(Math.random()*5)];
    c.style.fontSize = (12 + Math.random()*18) + 'px';
    c.style.zIndex = '9600';
    c.style.pointerEvents = 'none';
    document.body.appendChild(c);

    const tx = (Math.random() - 0.5) * 500;
    const ty = (Math.random() - 0.5) * 400;

    c.animate([
      { transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:1 },
      { transform:`translate(calc(-50% + ${tx*0.7}px), calc(-50% + ${ty*0.7}px)) scale(1.2) rotate(${Math.random()*360}deg)`, opacity:1, offset:.5 },
      { transform:`translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 200}px)) scale(.2) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], { duration: 1600 + Math.random()*1000, easing:'cubic-bezier(.16,.84,.32,1)', fill:'forwards' });

    setTimeout(() => c.remove(), 2800);
  }
}

/* =========================================================
   EASTER EGG — digite "familia"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 12) typed = typed.slice(-12);
  if (typed.includes('familia')) {
    typed = '';
    leafBurst(80);
    showToast('Família é tudo ❦');
  }
});

/* =========================================================
   PARALLAX SUAVE NO HERO
   ========================================================= */
const heroPhoto = document.querySelector('.hero-photo');
document.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 14;
  const y = (e.clientY / window.innerHeight - 0.5) * 14;
  if (heroPhoto) {
    heroPhoto.style.transform = `rotate(-2deg) translate(${x}px, ${y}px)`;
  }
});

/* =========================================================
   CLICK CELEBRATION NOS MEMBROS (opcional)
   ========================================================= */
document.querySelectorAll('.member-card').forEach(card => {
  card.addEventListener('click', () => {
    setTimeout(() => leafBurst(15), 100);
  });
});

/* Integração com criar.html e ver.html; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:"familia",title: '.hero-title em', phrase: '.hero-lede', letters: ['#letterPaper .letter-full'],
  collections:{members:{label:'Pessoas da árvore da família',value:MEMBERS}, sayings:{label:'Frases da família',value:FRASES},},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(GALLERY,photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    galleryEl.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,".timeline");
    const validDate=/^\d{4}-\d{2}-\d{2}$/.test(p.inicio||'');
    if(c.members)Object.assign(MEMBERS,c.members);document.querySelectorAll('[data-member]').forEach((card,i)=>{const m=MEMBERS[card.dataset.member];if(!m)return;card.querySelector('.member-name').textContent=m.name;card.querySelector('.member-role').textContent=m.role;const image=card.querySelector('img');const src=NATheme.media(c.members?.[card.dataset.member]?.photo)||photos[i%Math.max(1,photos.length)]||'';image.hidden=!src;if(src)image.src=src;m.photo=src;});naChange(FRASES,c.sayings,()=>naMarquee(FRASES));
  },
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
