
/* =========================================================
   DATA
   ========================================================= */
const TRACKS_A = [
  { num:'A1', title:'O Primeiro Olhar', artist:'Trilha do começo', duration:'3:42', cover:'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=200&q=80&auto=format&fit=crop' },
  { num:'A2', title:'Aquele Verão', artist:'Verão de 2018', duration:'3:56', cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&q=80&auto=format&fit=crop' },
  { num:'A3', title:'Primeira Conversa', artist:'Até as 4 da manhã', duration:'4:12', cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&q=80&auto=format&fit=crop' },
  { num:'A4', title:'A Primeira Viagem', artist:'Estrada e você', duration:'4:24', cover:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=80&auto=format&fit=crop' }
];

const TRACKS_B = [
  { num:'B1', title:'Nossa Casa', artist:'Lar em construção', duration:'3:48', cover:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=80&auto=format&fit=crop' },
  { num:'B2', title:'Risos de Domingo', artist:'Domingo à tarde', duration:'3:34', cover:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&q=80&auto=format&fit=crop' },
  { num:'B3', title:'Madrugadas', artist:'Só nós dois', duration:'4:06', cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&q=80&auto=format&fit=crop' },
  { num:'B4', title:'Para Sempre', artist:'O resto da vida', duration:'3:50', cover:'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80&auto=format&fit=crop' }
];

const ALBUMS = [
  {
    title:'O Primeiro Verão',
    year:'2018',
    badge:'Estreia',
    cover:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80&auto=format&fit=crop',
    desc:'O disco que gravamos sem perceber. Todas as faixas são sobre o começo — o medo, a descoberta, o frio na barriga.',
    tracks:[
      { num:1, title:'O Primeiro Olhar', dur:'3:42' },
      { num:2, title:'Aquele Verão', dur:'3:56' },
      { num:3, title:'Conversas de Madrugada', dur:'4:12' },
      { num:4, title:'A Primeira Viagem', dur:'4:24' }
    ]
  },
  {
    title:'Madrugadas',
    year:'2020',
    badge:'Clássico',
    cover:'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80&auto=format&fit=crop',
    desc:'O álbum mais intimista. Feito nos silêncios entre uma conversa e outra, nas horas em que o mundo dorme e só existimos nós.',
    tracks:[
      { num:1, title:'3 da Manhã', dur:'3:48' },
      { num:2, title:'Voz Baixinha', dur:'4:06' },
      { num:3, title:'Sussurros', dur:'3:34' },
      { num:4, title:'Amanhecer', dur:'4:50' }
    ]
  },
  {
    title:'Nosso Lar',
    year:'2022',
    badge:'Ao vivo',
    cover:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop',
    desc:'O disco que fala sobre construir. Cada faixa é um cômodo — a cozinha, o sofá, a varanda, a cama. Tudo tem a ver com você.',
    tracks:[
      { num:1, title:'A Cozinha', dur:'3:22' },
      { num:2, title:'O Sofá', dur:'3:58' },
      { num:3, title:'A Varanda', dur:'4:14' },
      { num:4, title:'Nossa Cama', dur:'4:02' }
    ]
  },
  {
    title:'Para Sempre',
    year:'2024',
    badge:'Novo',
    cover:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop',
    desc:'O álbum mais novo. Ainda em composição — mas as faixas já existem. Cada uma é um pedaço do futuro que a gente combinou viver.',
    tracks:[
      { num:1, title:'O Amanhã', dur:'3:30' },
      { num:2, title:'Depois de Amanhã', dur:'4:08' },
      { num:3, title:'Daqui a 10 Anos', dur:'4:22' },
      { num:4, title:'Sempre', dur:'5:00' }
    ]
  }
];

/* =========================================================
   STATE
   ========================================================= */
let currentTrack = null;
let isPlaying = false;
let progress = 0;


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
  if (e.target.closest('button, .track, .album, .side-b-lock, .tt-btn, .tt-power, .np-btn, a, .am-track, .am-close')) {
    cRing.classList.add('grow');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('button, .track, .album, .side-b-lock, .tt-btn, .tt-power, .np-btn, a, .am-track, .am-close')) {
    cRing.classList.remove('grow');
  }
});

/* =========================================================
   SCROLL BAR
   ========================================================= */
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  $('#scrollBar').style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  $('#toTop').classList.toggle('on', window.scrollY > 600);

  // Now playing bar
  const np = $('#nowPlaying');
  if (window.scrollY > 500) np.classList.add('show');
  else np.classList.remove('show');
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
  setTimeout(() => {
    $('#loader').classList.add('done');
  }, 1800);
});

/* =========================================================
   HERO TURNTABLE
   ========================================================= */
const heroVinyl = $('#heroVinyl');
const ttPower = $('#ttPower');
const ttHint = $('#ttHint');
let isPowered = false;

function togglePower(){
  isPowered = !isPowered;
  ttPower.classList.toggle('active', isPowered);
  ttHint.classList.toggle('hide', isPowered);

  if (isPowered) {
    // Start playing the first track
    if (!currentTrack) {
      playTrack(TRACKS_A[0]);
    } else {
      playTrack(currentTrack);
    }
    showToast('Agulha baixada ✦ O disco está girando');
  } else {
    pauseTrack();
    showToast('Agulha levantada');
  }
}

ttPower.addEventListener('click', togglePower);

// Speed buttons (visual only)
$$('.tt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* =========================================================
   TRACK LISTS
   ========================================================= */
function buildTrackList(container, tracks, side){
  container.innerHTML = '';
  tracks.forEach(track => {
    const el = document.createElement('div');
    el.className = 'track';
    el.dataset.num = track.num;
    el.innerHTML = `
      <div class="track-num">${esc(track.num)}</div>
      <div class="track-info">
        <div class="track-title">${esc(track.title)}</div>
        <div class="track-artist">${esc(track.artist)}</div>
      </div>
      <div class="track-duration">${esc(track.duration)}</div>
    `;
    el.addEventListener('click', () => {
      if (!isPowered) {
        isPowered = true;
        ttPower.classList.add('active');
        ttHint.classList.add('hide');
      }
      playTrack({ ...track, cover: track.cover, side });
    });
    container.appendChild(el);
  });
}

buildTrackList($('#sideA'), TRACKS_A, 'A');
buildTrackList($('#sideB'), TRACKS_B, 'B');

/* =========================================================
   PLAY TRACK
   ========================================================= */
function playTrack(track){
  if(!track)return;currentTrack=track;clearInterval(window._progressTimer);
  $('#npTitle').textContent=track.title;$('#npArtist').textContent=track.artist;
  $$('.track').forEach(t=>t.classList.toggle('playing',t.dataset.num===track.num));
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para tocar o disco.');return;}
  audio.currentTime=0;audio.play().catch(()=>showToast('Toque novamente para ouvir.'));
}

function pauseTrack(){
  isPlaying = false;
  heroVinyl.classList.remove('playing');
  $('#npDisc').classList.remove('playing');
  audio.pause();
  $('#npPlay').innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  clearInterval(window._progressTimer);
}

function nextTrack(){
  if (!currentTrack) return;
  const allTracks = [...TRACKS_A, ...TRACKS_B];
  const idx = allTracks.findIndex(t => t.num === currentTrack.num);
  const next = allTracks[(idx + 1) % allTracks.length];
  playTrack(next);
}

/* =========================================================
   NOW PLAYING CONTROLS
   ========================================================= */
$('#npPlay').addEventListener('click',()=>{if(!currentTrack)playTrack(TRACKS_A[0]);else if(!NATheme.selectAudio(currentTrack.audio))showToast('Adicione uma música para tocar o disco.');else if(audio.paused)audio.play().catch(()=>showToast('Toque novamente para ouvir.'));else pauseTrack();});

$('#npNext').addEventListener('click', nextTrack);

/* =========================================================
   CRATE / ALBUMS
   ========================================================= */
const crate = $('#crateScroll');
function naRenderAlbums(){
crate.replaceChildren();
ALBUMS.forEach((album, i) => {
  const el = document.createElement('div');
  el.className = 'album';
  el.dataset.index = i;
  el.innerHTML = `
    <div class="album-sleeve">
      <div class="album-cover" style="background-image:url('${esc(album.cover)}')"></div>
      <div class="album-badge">${esc(album.badge)}</div>
      <div class="album-info">
        <div class="album-title">${esc(album.title)}</div>
        <div class="album-year">${esc(album.year)}</div>
      </div>
    </div>
    <div class="album-desc">${esc(album.desc.slice(0, 80))}...</div>
  `;
  el.addEventListener('click', () => openAlbumModal(i));
  crate.appendChild(el);
});

}
naRenderAlbums();
/* =========================================================
   ALBUM MODAL
   ========================================================= */
const albumModal = $('#albumModal');
const albumModalInner = $('#albumModalInner');

function openAlbumModal(i){
  const album = ALBUMS[i];
  albumModalInner.innerHTML = `
    <div class="am-cover" style="background-image:url('${esc(album.cover)}')"></div>
    <div class="am-body">
      <button class="am-close" id="amClose">✕</button>
      <div class="am-badge">${esc(album.badge)} · ${esc(album.year)}</div>
      <h2 class="am-title">${esc(album.title)}</h2>
      <div class="am-year">NOSSO VINIL · LADO ${i % 2 === 0 ? 'A' : 'B'}</div>
      <p class="am-desc">${esc(album.desc)}</p>
      <div class="am-tracks">
        ${album.tracks.map(t => `
          <div class="am-track" data-track="${esc(t.num)}">
            <span class="am-track-num">${esc(t.num)}</span>
            <span class="am-track-title">${esc(t.title)}</span>
            <span class="am-track-dur">${esc(t.dur)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  albumModal.classList.add('on');
  document.body.style.overflow = 'hidden';

  albumModalInner.querySelector('#amClose').addEventListener('click', closeAlbumModal);
  albumModalInner.querySelectorAll('.am-track').forEach(el => {
    el.addEventListener('click', () => {
      const trackNum = el.dataset.track;
      const allTracks = [...TRACKS_A, ...TRACKS_B];
      const track = allTracks[i*4+Number(trackNum)-1] || TRACKS_A[0];
      closeAlbumModal();
      setTimeout(() => playTrack(track), 250);
    });
  });
}

function closeAlbumModal(){
  albumModal.classList.remove('on');
  document.body.style.overflow = '';
}

albumModal.addEventListener('click', e => {
  if (e.target === albumModal) closeAlbumModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && albumModal.classList.contains('on')) closeAlbumModal();
});

/* =========================================================
   SIDE B LOCK
   ========================================================= */
const sideBLock = $('#sideBLock');
const sideBContent = $('#sideBContent');
const sideBHint = $('#sideBHint');
let sideBUnlocked = false;

sideBLock.addEventListener('click', () => {
  if (sideBUnlocked) return;
  sideBUnlocked = true;
  sideBLock.classList.add('unlocked');
  sideBHint.style.opacity = '0';

  setTimeout(() => {
    sideBLock.style.display = 'none';
    sideBContent.classList.add('show');
    dustBurst(sideBLock, 30);
    showToast('Lado B desbloqueado ✦');
  }, 900);
});

/* =========================================================
   DUST PARTICLES
   ========================================================= */
function dustBurst(anchor, count = 20){
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++){
    const s = document.createElement('div');
    s.className = 'dust';
    const size = 3 + Math.random() * 8;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    document.body.appendChild(s);

    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 160;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    s.animate([
      { transform: 'translate(-50%,-50%) scale(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx * 0.6}px), calc(-50% + ${ty * 0.6}px)) scale(1)`, opacity: .8, offset: 0.5 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 60}px)) scale(0.2)`, opacity: 0 }
    ], {
      duration: 1200 + Math.random() * 800,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards'
    });

    setTimeout(() => s.remove(), 2200);
  }
}

/* =========================================================
   AUDIO
   ========================================================= */
const audio = $('#audio');
audio.addEventListener('pause', () => {
  if (isPlaying) {
    // Audio paused externally (e.g., browser), pause visual
    // Don't force - user controls it
  }
});

/* =========================================================
   EASTER EGG — digite "vinil"
   ========================================================= */
let typed = '';
document.addEventListener('keydown', e => {
  typed += e.key.toLowerCase();
  if (typed.length > 10) typed = typed.slice(-10);
  if (typed.includes('vinil')) {
    typed = '';
    dustBurst(document.body, 50);
    showToast('A agulha sabe que você está aqui ✦');
  }
});

/* Dados do formulário e funções específicas do modelo. */

[...TRACKS_A,...TRACKS_B].forEach(track=>{track.audio='';});
const naVinilDefaults=NAExclusive.clone({sideA:TRACKS_A,sideB:TRACKS_B,albums:ALBUMS});
document.querySelectorAll('.tt-btn[data-speed]').forEach(button=>{button.setAttribute('aria-label',button.dataset.speed+' RPM');button.addEventListener('click',()=>{const duration=String(4*33/Number(button.dataset.speed))+'s';heroVinyl.style.animationDuration=duration;$('#npDisc').style.animationDuration=duration;});});
function naVinilAudio(){isPlaying=!audio.paused;heroVinyl.classList.toggle('playing',isPlaying);$('#npDisc').classList.toggle('playing',isPlaying);$('#npPlay').innerHTML=isPlaying?'<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';}
for(const type of ['play','pause'])audio.addEventListener(type,naVinilAudio);
audio.addEventListener('timeupdate',()=>{$('#npProgress').style.width=(Number.isFinite(audio.duration)&&audio.duration?audio.currentTime/audio.duration*100:0)+'%';});audio.loop=false;audio.addEventListener('ended',nextTrack);
NAExclusive.connect({key:'vinil',title:'.hero-title',phrase:'.hero-sub',letters:['.liner-paper'],excludeSelector:'#sideA,#sideB,#crateScroll',
  collections:{sideA:{label:'Faixas do lado A',value:TRACKS_A},sideB:{label:'Faixas do lado B',value:TRACKS_B},albums:{label:'Álbuns e encartes',value:ALBUMS}},
  apply(payload){const {p,custom}=payload,c=custom.collections||{};
    const a=NAExclusive.items(naVinilDefaults.sideA,c.sideA,payload,['cover'],true),b=NAExclusive.items(naVinilDefaults.sideB,c.sideB,payload,['cover']);
    a.forEach((t,i)=>{t.num='A'+(i+1);});b.forEach((t,i)=>{t.num='B'+(i+1);});
    if(a[0]){a[0].title=p.musicaNome||p.titulo||'Nossa música';a[0].artist=p.musicaArtista||p.de+' & '+p.para;}
    NAExclusive.change(TRACKS_A,a,()=>buildTrackList($('#sideA'),TRACKS_A,'A'));NAExclusive.change(TRACKS_B,b,()=>buildTrackList($('#sideB'),TRACKS_B,'B'));
    if(currentTrack){currentTrack=[...TRACKS_A,...TRACKS_B].find(track=>track.num===currentTrack.num)||currentTrack;$('#npTitle').textContent=currentTrack.title;$('#npArtist').textContent=currentTrack.artist;}
    NAExclusive.change(ALBUMS,NAExclusive.items(naVinilDefaults.albums,c.albums,payload,['cover']),naRenderAlbums);
    const label=heroVinyl.querySelector('.vinyl-label');if(label)label.style.backgroundImage='url("'+(payload.cover||NAExclusive.placeholder(p.titulo))+'")';
    NAExclusive.history(payload,'#carta');
  },dispose(){clearInterval(window._progressTimer);}
});

NAExclusive.keyboard();
