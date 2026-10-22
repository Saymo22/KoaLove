let naGameSeconds=30;

/* =========================================================
   DATA
   ========================================================= */
const VHS_TAPES = [
  { title:'O Primeiro Rolê', meta:'1985 · SP · 02:34', desc:'O dia em que tudo começou. Aquele fliperama ainda existe — e a gente ainda vai lá.', img:'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=85&auto=format&fit=crop' },
  { title:'A Viagem de Verão', meta:'1988 · Litoral · 04:12', desc:'Duas malas, uma câmera VHS, e a estrada inteira pela frente. Gravamos tudo.', img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=85&auto=format&fit=crop' },
  { title:'A Festa Junina', meta:'1986 · Interior · 03:45', desc:'Você vestida de caipira, eu de chapéu de palha. A quadrilha mais engraçada da história.', img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop' },
  { title:'A Primeira Casa', meta:'1990 · Centro · 05:30', desc:'A TV tubo, o sofá que a gente odiava, e a felicidade de ter um canto só nosso.', img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=85&auto=format&fit=crop' },
  { title:'O Show de Rock', meta:'1987 · Ginásio · 03:20', desc:'A gente no meio da galera, gritando cada música como se fosse a última.', img:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=85&auto=format&fit=crop' },
  { title:'O Pôr do Sol', meta:'1989 · Praia · 02:18', desc:'Silêncio, mãos dadas, e o céu mais bonito que a gente já viu. Ainda lembro.', img:'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=85&auto=format&fit=crop' }
];

const MTV_STORIES = [
  { img:'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=85&auto=format&fit=crop', cap:'O fliperama que virou nosso ✦' },
  { img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=85&auto=format&fit=crop', cap:'Nossa viagem de verão 🚗' },
  { img:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=85&auto=format&fit=crop', cap:'O melhor show da vida 🎸' },
  { img:'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=900&q=85&auto=format&fit=crop', cap:'Pôr do sol com você 🌅' },
  { img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85&auto=format&fit=crop', cap:'A nossa primeira casa ❤' }
];

const MIXTAPE_TRACKS = [
  { title:'Take On Me', artist:'a-ha' },
  { title:'Sweet Dreams', artist:'Eurythmics' },
  { title:"Livin' on a Prayer", artist:'Bon Jovi' },
  { title:'Material Girl', artist:'Madonna' },
  { title:'Every Breath You Take', artist:'The Police' },
  { title:'Girls Just Want to Have Fun', artist:'Cyndi Lauper' }
];

const MEMORY_HITS = [
  'O primeiro olhar ✦',
  'A primeira fita 📼',
  'Aquele beijo 💋',
  'A viagem de verão 🚗',
  'A primeira dança 💃',
  'O primeiro "eu te amo" ❤',
  'A casa nova 🏠',
  'Aquele show 🎸'
];

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
let mx = window.innerWidth/2, my = window.innerHeight/2;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

document.addEventListener('mouseover', e => {
  if (e.target.closest('button, a, .vhs-tape, .stat-card, .story-thumb, .arcade-target, .cassette-btn, .tl-card, .nav-coin, .footer-social')) {
    cursor.classList.add('grow');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('button, a, .vhs-tape, .stat-card, .story-thumb, .arcade-target, .cassette-btn, .tl-card, .nav-coin, .footer-social')) {
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
  $('#navbar').classList.toggle('scrolled', window.scrollY > 60);
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

/* =========================================================
   LOADER
   ========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => $('#loader').classList.add('done'), 1800);
});

/* =========================================================
   HERO MARQUEE
   ========================================================= */
const marqueeItems = [
  '★ MELHOR AMIGO ★',
  '★ PARA SEMPRE ★',
  '★ 1985 · 2024 ★',
  '★ RADICAL ★',
  '★ TUBULAR ★',
  '★ MIAMI VIBES ★',
  '★ ARCADE ★'
];
const marqueeEl = $('#heroMarquee');
marqueeEl.innerHTML = [...marqueeItems, ...marqueeItems].map(item =>
  `<span>${item}</span><span class="sep">◆</span>`
).join('');

/* =========================================================
   STATS - COUNT UP + LEVEL FILL
   ========================================================= */
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 2000;
      const start = performance.now();
      function tick(t){
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('pt-BR');
      }
      requestAnimationFrame(tick);
      statObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
$$('.stat-num').forEach(el => statObs.observe(el));

const levelObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.width = e.target.dataset.fill + '%';
      levelObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
$$('.stat-level-fill').forEach(el => levelObs.observe(el));

/* =========================================================
   VHS GALLERY
   ========================================================= */
const vhsGrid = $('#vhsGrid');
function naRenderVHS(){
vhsGrid.replaceChildren();
VHS_TAPES.forEach((tape, i) => {
  const el = document.createElement('div');
  el.className = 'vhs-tape';
  el.innerHTML = `
    <div class="vhs-label">
      <div class="vhs-title">${esc(tape.title)}</div>
      <div class="vhs-meta">${esc(tape.meta)}</div>
    </div>
    <div class="vhs-preview">
      <div class="vhs-rec">REC</div>
      <div class="vhs-time">${String(Math.floor(Math.random()*12)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}</div>
      <img src="${esc(tape.img)}" alt="${esc(tape.title)}" loading="lazy">
    </div>
  `;
  el.addEventListener('click', () => openVHS(i));
  vhsGrid.appendChild(el);
});

}
naRenderVHS();
/* =========================================================
   VHS MODAL
   ========================================================= */
const vhsModal = $('#vhsModal');
const vhsModalImg = $('#vhsModalImg');
const vhsModalTitle = $('#vhsModalTitle');
const vhsModalDesc = $('#vhsModalDesc');

function openVHS(i){
  const tape = VHS_TAPES[i];
  vhsModalImg.src = tape.img;
  vhsModalTitle.textContent = tape.title;
  vhsModalDesc.textContent = tape.desc;
  vhsModal.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeVHS(){
  vhsModal.classList.remove('on');
  document.body.style.overflow = '';
}

$('#vhsModalClose').addEventListener('click', closeVHS);
vhsModal.addEventListener('click', e => {
  if (e.target === vhsModal) closeVHS();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && vhsModal.classList.contains('on')) closeVHS();
});

/* =========================================================
   MTV STORIES
   ========================================================= */
const storiesRail = $('#storiesRail');
function naRenderStories(){
storiesRail.replaceChildren();
MTV_STORIES.forEach((s, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'story-thumb';
  thumb.dataset.index = i;
  thumb.innerHTML = `
    <div class="story-ring">
      <img src="${esc(s.img)}" alt="">
      <div class="story-play">▶</div>
    </div>
    <p>CLIP ${i + 1}</p>
  `;
  thumb.addEventListener('click', () => openStories(i));
  storiesRail.appendChild(thumb);
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
  MTV_STORIES.forEach(() => {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<div class="seg-fill"></div>';
    storyProgress.appendChild(seg);
  });
}

function renderStory(i){
  if(!MTV_STORIES.length)return;
  storyIndex = i;
  const data = MTV_STORIES[i];

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
  if (storyIndex < MTV_STORIES.length - 1) renderStory(storyIndex + 1);
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

storiesRail.addEventListener('click', e => {
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
   ARCADE GAME
   ========================================================= */
const arcadeScreen = $('#arcadeScreen');
const arcadeTargets = $('#arcadeTargets');
const arcadeScore = $('#arcadeScore');
const arcadeTime = $('#arcadeTime');
const arcadeHigh = $('#arcadeHigh');
const arcadeMsg = $('#arcadeMsg');
const arcadeStart = $('#arcadeStart');

let gameActive = false;
let score = 0;
let timeLeft = naGameSeconds;
let gameTimer = null;
let targetTimer = null;
let highScore = 0;

function spawnTarget(){
  if (!gameActive) return;
  const target = document.createElement('div');
  target.className='arcade-target';target.setAttribute('role','button');target.tabIndex=0;target.setAttribute('aria-label','Acertar estrela');target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();target.click();}});
  target.textContent = '★';

  const rect = arcadeTargets.getBoundingClientRect();
  const x = Math.random() * (rect.width - 60);
  const y = Math.random() * (rect.height - 60);
  target.style.left = x + 'px';
  target.style.top = y + 'px';

  target.addEventListener('click', (e) => {
    e.stopPropagation();
    if(!gameActive||target.classList.contains('hit'))return;
    target.classList.add('hit');
    score += 10;
    arcadeScore.textContent = score;
    playHitSound();
    showToast(MEMORY_HITS[Math.floor(Math.random() * MEMORY_HITS.length)]);
    setTimeout(() => target.remove(), 300);
  });

  arcadeTargets.appendChild(target);
  setTimeout(() => {
    if (target.parentNode) target.remove();
  }, 1500);
}

function playHitSound(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e){}
}

function startGame(){
  if (gameActive) return;
  gameActive = true;
  score = 0;
  timeLeft = naGameSeconds;
  arcadeScore.textContent = '0';
  arcadeTime.textContent = String(timeLeft);
  arcadeMsg.classList.add('hidden');
  arcadeStart.disabled = true;
  arcadeStart.textContent = '▶ PLAYING...';

  arcadeTargets.innerHTML = '';

  targetTimer = setInterval(spawnTarget, 600);
  spawnTarget();

  gameTimer = setInterval(() => {
    timeLeft--;
    arcadeTime.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame(){
  gameActive = false;
  clearInterval(gameTimer);
  clearInterval(targetTimer);
  arcadeTargets.innerHTML = '';
  arcadeStart.disabled = false;
  arcadeStart.textContent = '▶ PLAY AGAIN';

  if (score > highScore) {
    highScore = score;
    arcadeHigh.textContent = score;
    arcadeMsg.textContent = 'NEW HIGH SCORE!';
  } else {
    arcadeMsg.textContent = 'GAME OVER';
  }
  arcadeMsg.classList.remove('hidden');

  showToast(`FIM DE JOGO · SCORE: ${score}`);
  confettiBurst(30);
}

arcadeStart.addEventListener('click', startGame);

/* =========================================================
   MIXTAPE CASSETTE
   ========================================================= */
const cassette = $('#cassette');
const cassettePlay = $('#cassettePlay');
const cassetteStop = $('#cassetteStop');
const cassetteTrack = $('#cassetteTrack');
const audio = $('#audio');
let currentTrackIdx = 0;
let cassettePlaying = false;

function playCassette(){
  const track=MIXTAPE_TRACKS[currentTrackIdx];if(!track)return;
  cassetteTrack.textContent=track.title+' — '+track.artist;
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para tocar a fita.');return;}
  audio.play().catch(()=>showToast('Toque novamente para ouvir.'));
}

function pauseCassette(){
  cassettePlaying = false;
  cassette.classList.remove('playing');
  cassettePlay.classList.remove('playing');
  cassettePlay.textContent = '▶';
  audio.pause();
}

cassettePlay.addEventListener('click', () => {
  if (cassettePlaying) pauseCassette();
  else playCassette();
});

cassetteStop.addEventListener('click', () => {
  pauseCassette();
  currentTrackIdx = 0;
  cassetteTrack.textContent = 'Nothing Yet';
});

document.querySelectorAll('.cassette-btn[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    if (cmd === 'ff') {
      currentTrackIdx = (currentTrackIdx + 1) % MIXTAPE_TRACKS.length;
      if (cassettePlaying) {
        playCassette();
        cassetteTrack.textContent = `${MIXTAPE_TRACKS[currentTrackIdx].title} — ${MIXTAPE_TRACKS[currentTrackIdx].artist}`;
        showToast(`⏩ ${MIXTAPE_TRACKS[currentTrackIdx].title}`);
      }
    } else if (cmd === 'rew') {
      currentTrackIdx = currentTrackIdx - 1 < 0 ? MIXTAPE_TRACKS.length - 1 : currentTrackIdx - 1;
      if (cassettePlaying) {
        playCassette();
        cassetteTrack.textContent = `${MIXTAPE_TRACKS[currentTrackIdx].title} — ${MIXTAPE_TRACKS[currentTrackIdx].artist}`;
        showToast(`⏪ ${MIXTAPE_TRACKS[currentTrackIdx].title}`);
      }
    }
  });
});

/* =========================================================
   NAV COIN
   ========================================================= */
$('#navCoin').addEventListener('click', () => {
  showToast('★ COIN INSERTED ★');
  confettiBurst(20);
});

/* =========================================================
   CONFETTI
   ========================================================= */
function confettiBurst(count = 40){
  const symbols = ['★', '✦', '◆', '●', '▲', '⚡', '❤'];
  const colors = ['#00f0ff', '#ff2d95', '#ffe600', '#b026ff', '#ff6b1a'];
  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'particle';
    c.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    c.style.position = 'fixed';
    c.style.left = (20 + Math.random() * 60) + '%';
    c.style.top = (30 + Math.random() * 30) + '%';
    c.style.color = colors[Math.floor(Math.random() * colors.length)];
    c.style.fontSize = (14 + Math.random() * 20) + 'px';
    c.style.zIndex = '9600';
    c.style.textShadow = `0 0 10px ${c.style.color}`;
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
   EASTER EGG
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 12) typed = typed.slice(-12);
  if (typed.includes('radical')) {
    typed = '';
    confettiBurst(60);
    showToast('★ TOTALLY RADICAL ★');
  }
});

/* =========================================================
   NAV ACTIVE
   ========================================================= */
const sections = ['inicio', 'historia', 'fitas', 'arcade'];
const navLinks = $$('.nav-link');
window.addEventListener('scroll', () => {
  let activeIdx = 0;
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 300) activeIdx = i;
  });
  navLinks.forEach((link, i) => link.classList.toggle('active', i === activeIdx));
}, { passive:true });

document.querySelectorAll('[data-na-action="1"]').forEach(el=>el.addEventListener("click",function(event){window.scrollTo({top:0,behavior:'smooth'})}));

/* Dados do formulário e funções específicas do modelo. */

MIXTAPE_TRACKS.forEach(track=>{track.audio='';});
const naRetroDefaults=NAExclusive.clone({tapes:VHS_TAPES,tracks:MIXTAPE_TRACKS});
audio.loop=false;audio.addEventListener('play',()=>{cassettePlaying=true;cassette.classList.add('playing');cassettePlay.classList.add('playing');cassettePlay.textContent='❚❚';});audio.addEventListener('pause',()=>{cassettePlaying=false;cassette.classList.remove('playing');cassettePlay.classList.remove('playing');cassettePlay.textContent='▶';});audio.addEventListener('ended',()=>{currentTrackIdx=(currentTrackIdx+1)%MIXTAPE_TRACKS.length;playCassette();});cassetteStop.addEventListener('click',()=>{audio.currentTime=0;});
NAExclusive.connect({key:'retro',title:'.hero-title',phrase:'.hero-sub',letters:['.letter-paper'],excludeSelector:'#vhsGrid,#storiesRail,.timeline,.letter-paper',
  collections:{tapes:{label:'Fitas VHS e suas histórias',value:VHS_TAPES},tracks:{label:'Faixas da mixtape',value:MIXTAPE_TRACKS},hits:{label:'Memórias reveladas no fliperama',value:MEMORY_HITS},gameSeconds:{label:'Duração da partida (5 a 120 segundos)',value:30}},
  apply(payload){const {p,custom}=payload,c=custom.collections||{};
    NAExclusive.change(VHS_TAPES,NAExclusive.items(naRetroDefaults.tapes,c.tapes,payload,['img'],true),naRenderVHS);
    NAExclusive.change(MTV_STORIES,NAExclusive.stories(payload),()=>{closeStories();naRenderStories();});storiesRail.closest('section').hidden=!MTV_STORIES.length;
    const tracks=NAExclusive.items(naRetroDefaults.tracks,c.tracks,payload,[]);if(tracks[0]){tracks[0].title=p.musicaNome||'Nossa música';tracks[0].artist=p.musicaArtista||p.de+' & '+p.para;}
    NAExclusive.change(MIXTAPE_TRACKS,tracks);if(Array.isArray(c.hits))NAExclusive.change(MEMORY_HITS,c.hits);
    if(cassettePlaying&&MIXTAPE_TRACKS[currentTrackIdx])cassetteTrack.textContent=MIXTAPE_TRACKS[currentTrackIdx].title+' — '+MIXTAPE_TRACKS[currentTrackIdx].artist;
    if(Number.isFinite(Number(c.gameSeconds)))naGameSeconds=Math.max(5,Math.min(120,Number(c.gameSeconds)));
    NATheme.timeline(payload,'.timeline');
  },dispose(){clearInterval(gameTimer);clearInterval(targetTimer);}
});

NAExclusive.keyboard();
