
/* =========================================================
   DATA
   ========================================================= */
const PLAYLISTS = [
  {
    title:'A Trilha da Nossa Vida',
    desc:'A playlist oficial. Todas as músicas que contam a nossa história.',
    cover:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80&auto=format&fit=crop'
  },
  {
    title:'Madrugadas',
    desc:'Para as noites em que o mundo dorme e só existimos nós.',
    cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80&auto=format&fit=crop'
  },
  {
    title:'Risos & Café',
    desc:'As manhãs doces. As conversas bobas. O nosso jeito de ser.',
    cover:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500&q=80&auto=format&fit=crop'
  },
  {
    title:'Viagens',
    desc:'Para colocar no carro e rodar sem destino — só com você.',
    cover:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80&auto=format&fit=crop'
  },
  {
    title:'Domingo à Tarde',
    desc:'Sem pressa, sem plano. Só a melhor companhia do mundo.',
    cover:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80&auto=format&fit=crop'
  },
  {
    title:'Chuva & Cinema',
    desc:'Para os dias cinzentos que a gente transforma em cor.',
    cover:'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80&auto=format&fit=crop'
  }
];

const TRACKS = [
  { title:'Perfect', artist:'Ed Sheeran', album:'÷ (Divide)', plays:'1.284.321', dur:'4:23', cover:'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&q=80&auto=format&fit=crop' },
  { title:'A Thousand Years', artist:'Christina Perri', album:'The Twilight Saga', plays:'1.062.847', dur:'4:45', cover:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=100&q=80&auto=format&fit=crop' },
  { title:'La Vie En Rose', artist:'Édith Piaf', album:'La Vie En Rose', plays:'978.234', dur:'3:07', cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&q=80&auto=format&fit=crop' },
  { title:"Can't Help Falling in Love", artist:'Elvis Presley', album:'Blue Hawaii', plays:'845.612', dur:'3:00', cover:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&q=80&auto=format&fit=crop' },
  { title:'Nossa Canção', artist:'Nós dois', album:'A Trilha da Nossa Vida', plays:'∞', dur:'∞', cover:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=100&q=80&auto=format&fit=crop' },
  { title:'At Last', artist:'Etta James', album:'At Last!', plays:'712.098', dur:'3:03', cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=100&q=80&auto=format&fit=crop' },
  { title:'Make You Feel My Love', artist:'Adele', album:'19', plays:'634.521', dur:'3:32', cover:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=80&auto=format&fit=crop' },
  { title:'Lover', artist:'Taylor Swift', album:'Lover', plays:'521.784', dur:'3:41', cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&q=80&auto=format&fit=crop' }
];

const ALBUMS = [
  { title:'A Trilha da Nossa Vida', year:'2018', cover:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80&auto=format&fit=crop' },
  { title:'Madrugadas', year:'2020', cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80&auto=format&fit=crop' },
  { title:'Verão Eterno', year:'2021', cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&q=80&auto=format&fit=crop' },
  { title:'Nosso Lar', year:'2023', cover:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80&auto=format&fit=crop' }
];

const MEMORIES = [
  { img:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=900&q=80&auto=format&fit=crop', cap:'A primeira música juntos ✦' },
  { img:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=80&auto=format&fit=crop', cap:'A playlist de madrugada' },
  { img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&auto=format&fit=crop', cap:'Aquela viagem com trilha sonora' },
  { img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop', cap:'Domingo, café e você' },
  { img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop', cap:'O repeat que nunca acaba ❤' }
];

let LYRICS = "Cause all of me loves all of you — love your curves and all your edges, all your perfect imperfections.";

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
  t._timer = setTimeout(() => t.classList.remove('on'), 3000);
}

function fmtTime(sec){
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* =========================================================
   CURSOR
   ========================================================= */
const cDot = $('#cDot');
const cRing = $('#cRing');
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

document.addEventListener('mouseover', e => {
  if (e.target.closest('button, a, .playlist-card, .track-row, .album, .memory-thumb, .chart-item, .stat-card, .nav-search, .footer-social')) {
    cRing.classList.add('grow');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('button, a, .playlist-card, .track-row, .album, .memory-thumb, .chart-item, .stat-card, .nav-search, .footer-social')) {
    cRing.classList.remove('grow');
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
  $('#nowPlayingBar').classList.toggle('show', window.scrollY > 400);
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
  setTimeout(() => $('#loader').classList.add('done'), 1600);
});

/* =========================================================
   PLAYLISTS RENDER
   ========================================================= */
const playlistsGrid = $('#playlistsGrid');
function naRenderPlaylists(){
playlistsGrid.replaceChildren();
PLAYLISTS.forEach(p => {
  const el = document.createElement('div');
  el.className = 'playlist-card';
  el.innerHTML = `
    <div class="playlist-cover">
      <img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">
      <button class="playlist-play">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="playlist-title">${esc(p.title)}</div>
    <div class="playlist-desc">${esc(p.desc)}</div>
  `;
  el.addEventListener('click', e => {
    if (e.target.closest('.playlist-play')) {
      e.stopPropagation();
      playFirstTrack();
      return;
    }
    showToast(`Tocando playlist: ${esc(p.title)}`);
    playFirstTrack();
  });
  playlistsGrid.appendChild(el);
});

}
naRenderPlaylists();
/* =========================================================
   TRACKS RENDER
   ========================================================= */
const tracksList = $('#tracksList');
function naRenderTracks(){
tracksList.replaceChildren();
TRACKS.forEach((track, i) => {
  const el = document.createElement('div');
  el.className = 'track-row';
  el.dataset.index = i;
  el.innerHTML = `
    <div class="tr-num">
      <span class="tr-num-text">${i + 1}</span>
      <div class="tr-eq"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="tr-info">
      <div class="tr-cover"><img src="${esc(track.cover)}" alt=""></div>
      <div class="tr-text">
        <div class="tr-title"><span class="track-title-text">${esc(track.title)}</span></div>
        <div class="tr-artist">${esc(track.artist)}</div>
      </div>
    </div>
    <div class="tr-album">${esc(track.album)}</div>
    <div class="tr-plays">${esc(track.plays)}</div>
    <div class="tr-dur">${esc(track.dur)}</div>
  `;
  el.addEventListener('click', () => playTrack(i));
  tracksList.appendChild(el);
});

}
naRenderTracks();
/* =========================================================
   ALBUMS RENDER
   ========================================================= */
const albumsGrid = $('#albumsGrid');
function naRenderAlbums(){
albumsGrid.replaceChildren();
ALBUMS.forEach(album => {
  const el = document.createElement('div');
  el.className = 'album';
  el.innerHTML = `
    <div class="album-cover">
      <img src="${esc(album.cover)}" alt="${esc(album.title)}" loading="lazy">
      <button class="album-play-btn">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
    <div class="album-title">${esc(album.title)}</div>
    <div class="album-year">${esc(album.year)}</div>
  `;
  el.addEventListener('click', () => {
    showToast(`Tocando álbum: ${esc(album.title)}`);
    playFirstTrack();
  });
  albumsGrid.appendChild(el);
});

}
naRenderAlbums();
/* =========================================================
   MEMORIES / STORIES
   ========================================================= */
const memoriesRail = $('#memoriesRail');
function naRenderStories(){
memoriesRail.replaceChildren();
MEMORIES.forEach((m, i) => {
  const el = document.createElement('div');
  el.className = 'memory-thumb';
  el.dataset.index = i;
  el.innerHTML = `
    <div class="memory-ring">
      <img src="${esc(m.img)}" alt="">
      <div class="memory-play">▶</div>
    </div>
    <p>Clipe ${i + 1}</p>
  `;
  el.addEventListener('click', () => openStories(i));
  memoriesRail.appendChild(el);
});

}
naRenderStories();
/* =========================================================
   VISUALIZER
   ========================================================= */
const visualizer = $('#visualizer');
const VIZ_BARS = 64;
for (let i = 0; i < VIZ_BARS; i++) {
  const bar = document.createElement('div');
  bar.className = 'viz-bar';
  visualizer.appendChild(bar);
}

let vizAnimating = false;
let vizTimer = null;

function animateVisualizer(){
  if (!vizAnimating) return;
  const bars = visualizer.querySelectorAll('.viz-bar');
  bars.forEach((bar, i) => {
    const center = Math.abs(i - VIZ_BARS / 2) / (VIZ_BARS / 2);
    const baseHeight = 15 + (1 - center) * 60;
    const jitter = Math.random() * 40;
    bar.style.height = Math.min(95, baseHeight + jitter) + '%';
  });
  vizTimer = setTimeout(animateVisualizer, 120);
}

function stopVisualizer(){
  vizAnimating = false;
  clearTimeout(vizTimer);
  const bars = visualizer.querySelectorAll('.viz-bar');
  bars.forEach(bar => bar.style.height = '20%');
}

const vizPlayBtn = $('#vizPlayBtn');
vizPlayBtn.addEventListener('click',togglePlay);

/* =========================================================
   LYRICS ANIMATION
   ========================================================= */
const lyricsText = $('#lyricsText');
function naRenderLyrics(){lyricsText.replaceChildren();LYRICS.split(/\s+/).forEach((word,i)=>{const span=document.createElement('span');span.className='word';span.style.animation='wordIn .6s '+(i*.08)+'s ease forwards';span.textContent=word+' ';lyricsText.append(span);});}
naRenderLyrics();

const lyricsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const words = lyricsText.querySelectorAll('.word');
      words.forEach((w, i) => {
        w.style.animation = 'none';
        void w.offsetWidth;
        w.style.animation = `wordIn 0.6s ${i * 0.08}s cubic-bezier(.22,1,.36,1) forwards`;
      });
    }
  });
}, { threshold: 0.3 });
lyricsObs.observe(lyricsText);

/* =========================================================
   STATS COUNT UP
   ========================================================= */
const statObs = new IntersectionObserver(entries => {
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
      statObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
$$('.stat-num').forEach(el => statObs.observe(el));

/* =========================================================
   MUSIC PLAYER
   ========================================================= */
const audio = $('#audio');
const npbCover = $('#npbCover');
const npbTitle = $('#npbTitle');
const npbArtist = $('#npbArtist');
const npbPlayBtn = $('#npbPlayBtn');
const npbProgressFill = $('#npbProgressFill');
const npbCurrent = $('#npbCurrent');
const npbDuration = $('#npbDuration');
const npbProgress = $('#npbProgress');

let currentTrackIndex = -1;
let isPlaying = false;
let fakeProgress = 0;
let fakeDuration = 254; // 4:14 for Perfect
let progressTimer = null;

function playTrack(index=0){
  if(!TRACKS.length)return;index=((Number(index)||0)%TRACKS.length+TRACKS.length)%TRACKS.length;
  const track=TRACKS[index];currentTrackIndex=index;clearInterval(progressTimer);
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para ouvir esta faixa.');return;}
  audio.currentTime=0;npbCover.src=track.cover;npbTitle.textContent=track.title;npbArtist.textContent=track.artist;
  $$('.track-row').forEach((el,i)=>el.classList.toggle('playing',i===index));
  audio.play().catch(()=>showToast('Toque novamente para ouvir.'));updateProgressUI();
}

function updateProgressUI(){fakeProgress=audio.currentTime||0;fakeDuration=Number.isFinite(audio.duration)?audio.duration:0;npbProgressFill.style.width=(fakeDuration?fakeProgress/fakeDuration*100:0)+'%';npbCurrent.textContent=NAExclusive.time(fakeProgress);npbDuration.textContent=NAExclusive.time(fakeDuration);}

function playFirstTrack(){
  playTrack(0);
}

function togglePlay(){if(currentTrackIndex<0){playFirstTrack();return;}if(!NATheme.selectAudio(TRACKS[currentTrackIndex]?.audio)){showToast('Adicione uma música para ouvir esta faixa.');return;}if(audio.paused)audio.play().catch(()=>showToast('Adicione uma música ou toque novamente.'));else audio.pause();}

function nextTrack(){
  const next = (currentTrackIndex + 1) % TRACKS.length;
  playTrack(next);
}

function prevTrack(){if(audio.currentTime>3){audio.currentTime=0;updateProgressUI();}else playTrack(currentTrackIndex<=0?TRACKS.length-1:currentTrackIndex-1);}

npbPlayBtn.addEventListener('click', togglePlay);
$$('.npb-btn')[0].addEventListener('click', prevTrack);
$$('.npb-btn')[2].addEventListener('click', nextTrack);

npbProgress.addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  NAExclusive.seek(audio,pct);
  updateProgressUI();
});

// Like button
const npbLike = $('#npbLike');
npbLike.addEventListener('click', () => {
  npbLike.classList.toggle('liked');
  if (npbLike.classList.contains('liked')) {
    showToast('Adicionada às suas curtidas ♥');
    confettiBurst(15);
  } else {
    showToast('Removida das curtidas');
  }
});

// Volume slider
const npbVolume = $('#npbVolume');
const npbVolumeFill = $('#npbVolumeFill');
npbVolume.addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  npbVolumeFill.style.width = (pct * 100) + '%';
});

// Hero / CTA play buttons
$('#heroPlay').addEventListener('click', playFirstTrack);
$('#ctaPlay').addEventListener('click', () => {
  playFirstTrack();
  $('#nowPlayingBar').classList.add('show');
  setTimeout(() => $('#tracks').scrollIntoView({behavior:'smooth'}), 300);
});
$('#featuredPlay').addEventListener('click', () => {
  playFirstTrack();
  showToast('Tocando álbum completo ✦');
});

/* =========================================================
   STORY VIEWER
   ========================================================= */
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
  MEMORIES.forEach(() => {
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<div class="seg-fill"></div>';
    storyProgress.appendChild(seg);
  });
}

function renderStory(i){
  if(!MEMORIES.length)return;
  storyIndex = i;
  const data = MEMORIES[i];

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
  if (storyIndex < MEMORIES.length - 1) renderStory(storyIndex + 1);
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

memoriesRail.addEventListener('click', e => {
  const t = e.target.closest('.memory-thumb');
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
   CONFETTI
   ========================================================= */
function confettiBurst(count = 40){
  const symbols = ['♪', '♫', '♬', '♥', '★', '✦'];
  for (let i = 0; i < count; i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    c.style.position = 'fixed';
    c.style.left = (20 + Math.random() * 60) + '%';
    c.style.top = (30 + Math.random() * 30) + '%';
    c.style.color = Math.random() > 0.5 ? '#1db954' : '#1ed760';
    c.style.fontSize = (12 + Math.random() * 22) + 'px';
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
   NAV SEARCH (fake)
   ========================================================= */


/* =========================================================
   EASTER EGG — digite "playlist"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 12) typed = typed.slice(-12);
  if (typed.includes('playlist')) {
    typed = '';
    confettiBurst(50);
    showToast('♪ Você achou o repeat infinito ♪');
  }
});

/* =========================================================
   NAVBAR ACTIVE LINK ON SCROLL
   ========================================================= */
const sections = ['inicio', 'playlists', 'tracks', 'albums', 'wrapped'];
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

TRACKS.forEach(track=>{track.audio='';});
const naSpotifyDefaults=NAExclusive.clone({playlists:PLAYLISTS,tracks:TRACKS,albums:ALBUMS});
const naSearch=document.createElement('input');naSearch.type='search';naSearch.className='na-search-input';naSearch.placeholder='Buscar músicas e coleções';naSearch.setAttribute('aria-label','Buscar músicas e coleções');$('#navSearch').replaceChildren(naSearch);naSearch.addEventListener('input',()=>{const query=naSearch.value.toLocaleLowerCase('pt-BR');document.querySelectorAll('.track-row,.playlist-card,#albumsGrid .album').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase('pt-BR').includes(query);});});
function naSpotifyAudio(){isPlaying=!audio.paused;npbPlayBtn.innerHTML=isPlaying?'<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';vizPlayBtn.classList.toggle('playing',isPlaying);if(isPlaying){if(!vizAnimating){vizAnimating=true;animateVisualizer();}}else stopVisualizer();}
for(const type of ['play','pause','ended'])audio.addEventListener(type,naSpotifyAudio);
for(const type of ['timeupdate','loadedmetadata'])audio.addEventListener(type,updateProgressUI);audio.loop=false;audio.addEventListener('ended',nextTrack);
NAExclusive.connect({key:'spotify',title:'.hero-title',phrase:'.hero-sub',letters:['.letter-body'],excludeSelector:'#playlistsGrid,#tracksList,#albumsGrid,#memoriesRail,#lyricsText,.letter-body',
  collections:{playlists:{label:'Playlists e coleções',value:PLAYLISTS},tracks:{label:'Faixas, artistas e álbuns',value:TRACKS},albums:{label:'Álbuns',value:ALBUMS},lyrics:{label:'Letra ou mensagem em destaque',value:LYRICS}},
  apply(payload){const {p,custom}=payload,c=custom.collections||{};
    const tracks=NAExclusive.items(naSpotifyDefaults.tracks,c.tracks,payload,['cover']);
    if(tracks[0]){tracks[0].title=p.musicaNome||'Nossa música';tracks[0].artist=p.musicaArtista||p.de+' & '+p.para;tracks[0].album=p.titulo||'Nossa história';}
    NAExclusive.change(TRACKS,tracks,naRenderTracks);NAExclusive.change(PLAYLISTS,NAExclusive.items(naSpotifyDefaults.playlists,c.playlists,payload,['cover']),naRenderPlaylists);NAExclusive.change(ALBUMS,NAExclusive.items(naSpotifyDefaults.albums,c.albums,payload,['cover']),naRenderAlbums);
    if(currentTrackIndex>=0&&TRACKS[currentTrackIndex]){const track=TRACKS[currentTrackIndex];npbTitle.textContent=track.title;npbArtist.textContent=track.artist;npbCover.src=track.cover;}
    NAExclusive.change(MEMORIES,NAExclusive.stories(payload),()=>{closeStories();naRenderStories();});memoriesRail.closest('section').hidden=!MEMORIES.length;
    if(typeof c.lyrics==='string'&&c.lyrics!==LYRICS){LYRICS=c.lyrics;naRenderLyrics();}
    NATheme.set('.hero-cover-title',p.titulo||'Nossa playlist');NATheme.set('.featured-title',p.titulo||'Nossa história');NATheme.set('.letter-sign','Com carinho, '+(p.de||'Alguém especial'));
    NAExclusive.history(payload,'#carta');
  },dispose(){clearInterval(progressTimer);stopVisualizer();}
});

NAExclusive.keyboard();
