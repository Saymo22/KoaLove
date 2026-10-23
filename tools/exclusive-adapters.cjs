const netflixFunctions = {
  openVideo: `function openVideo(id){
  const show=SHOWS.find(s=>s.id===id);if(!show)return;
  clearInterval(vpTimer);const video=$('#naNetflixVideo');video.pause();
  const index=SHOWS.indexOf(show),src=naNetflixPayload.videos[index%Math.max(1,naNetflixPayload.videos.length)]||'';
  if(src){video.src=src;video.poster=show.backdrop;video.load();}else{video.removeAttribute('src');video.load();}
  video.hidden=!src;vp.classList.toggle('na-real-video',!!src);
  $('#vpBackdrop').style.backgroundImage='url("'+show.backdrop+'")';
  $('#vpTitle').textContent=show.title;$('#vpTitleBar').textContent=show.title;
  $('#vpSubtitle').textContent=src?'Nosso vídeo':show.synopsis;
  vpProgressVal=0;vpPlaying=false;updateVP();updateVPBtn();
  vp.classList.add('on');document.body.style.overflow='hidden';$('#vpSkip').hidden=!src;
}`,
  closeVideo: `function closeVideo(){vp.classList.remove('on');document.body.style.overflow='';clearInterval(vpTimer);$('#naNetflixVideo').pause();vpPlaying=false;updateVPBtn();}`,
  toggleVP: `function toggleVP(){
  const video=$('#naNetflixVideo');clearInterval(vpTimer);
  if(video.getAttribute('src')){if(video.paused)video.play().catch(()=>showToast('Toque novamente para assistir.'));else video.pause();return;}
  vpPlaying=!vpPlaying;updateVPBtn();
  if(vpPlaying){let index=0;const photos=naNetflixPayload.photos;vpTimer=setInterval(()=>{index++;if(index>=photos.length){clearInterval(vpTimer);vpPlaying=false;updateVPBtn();return;}$('#vpBackdrop').style.backgroundImage='url("'+photos[index]+'")';vpProgressVal=index*3;updateVP();},3000);}
}`,
  updateVP: `function updateVP(){const video=$('#naNetflixVideo');const real=!!video?.getAttribute('src');const duration=real?(Number.isFinite(video.duration)?video.duration:0):Math.max(1,naNetflixPayload.photos.length)*3;const position=real?video.currentTime:vpProgressVal;const pct=duration?position/duration*100:0;$('#vpProgressFill').style.width=pct+'%';$('#vpBuffered').style.width=pct+'%';$('#vpTime').textContent=NAExclusive.time(position)+' / '+NAExclusive.time(duration);}`,
};
const spotifyFunctions = {
  playTrack: `function playTrack(index=0){
  if(!TRACKS.length)return;index=((Number(index)||0)%TRACKS.length+TRACKS.length)%TRACKS.length;
  const track=TRACKS[index];currentTrackIndex=index;clearInterval(progressTimer);
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para ouvir esta faixa.');return;}
  audio.currentTime=0;npbCover.src=track.cover;npbTitle.textContent=track.title;npbArtist.textContent=track.artist;
  $$('.track-row').forEach((el,i)=>el.classList.toggle('playing',i===index));
  audio.play().catch(()=>showToast('Toque novamente para ouvir.'));updateProgressUI();
}`,
  togglePlay: `function togglePlay(){if(currentTrackIndex<0){playFirstTrack();return;}if(!NATheme.selectAudio(TRACKS[currentTrackIndex]?.audio)){showToast('Adicione uma música para ouvir esta faixa.');return;}if(audio.paused)audio.play().catch(()=>showToast('Adicione uma música ou toque novamente.'));else audio.pause();}`,
  updateProgressUI: `function updateProgressUI(){fakeProgress=audio.currentTime||0;fakeDuration=Number.isFinite(audio.duration)?audio.duration:0;npbProgressFill.style.width=(fakeDuration?fakeProgress/fakeDuration*100:0)+'%';npbCurrent.textContent=NAExclusive.time(fakeProgress);npbDuration.textContent=NAExclusive.time(fakeDuration);}`,
  prevTrack: `function prevTrack(){if(audio.currentTime>3){audio.currentTime=0;updateProgressUI();}else playTrack(currentTrackIndex<=0?TRACKS.length-1:currentTrackIndex-1);}`,
};
const vinilFunctions = {
  playTrack: `function playTrack(track){
  if(!track)return;currentTrack=track;clearInterval(window._progressTimer);
  $('#npTitle').textContent=track.title;$('#npArtist').textContent=track.artist;
  $$('.track').forEach(t=>t.classList.toggle('playing',t.dataset.num===track.num));
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para tocar o disco.');return;}
  audio.currentTime=0;audio.play().catch(()=>showToast('Toque novamente para ouvir.'));
}`,
};
const retroFunctions = {
  playCassette: `function playCassette(){
  const track=MIXTAPE_TRACKS[currentTrackIdx];if(!track)return;
  cassetteTrack.textContent=track.title+' — '+track.artist;
  if(!NATheme.selectAudio(track.audio)){showToast('Adicione uma música para tocar a fita.');return;}
  audio.play().catch(()=>showToast('Toque novamente para ouvir.'));
}`,
};
const netflix = `
let naNetflixPayload={photos:[],videos:[],p:{}};
const naNetflixDefaults=NAExclusive.clone({shows:SHOWS,notifications:NOTIFS});
const naNetflixVideo=document.createElement('video');naNetflixVideo.id='naNetflixVideo';naNetflixVideo.playsInline=true;naNetflixVideo.preload='metadata';naNetflixVideo.hidden=true;$('.vp-stage').prepend(naNetflixVideo);
for(const type of ['play','pause','ended','timeupdate','loadedmetadata'])naNetflixVideo.addEventListener(type,()=>{vpPlaying=!naNetflixVideo.paused&&!naNetflixVideo.ended;if(type==='play')audio.pause();updateVPBtn();updateVP();});
const naLetter=document.createElement('section');naLetter.id='naNetflixLetter';naLetter.className='na-extra-section';naLetter.innerHTML='<h3>Para você,</h3><p>Sua carta aparecerá aqui.</p><div class="signature"></div>';document.querySelector('footer,.footer')?.before(naLetter);
$('#heroSlides').addEventListener('click',e=>{const play=e.target.closest('[data-play]'),info=e.target.closest('[data-info]');if(play)openVideo(Number(play.dataset.play));else if(info)openModal(Number(info.dataset.info));});
const naCatalogLinks=[...document.querySelectorAll('.nav-links .nav-link')];naCatalogLinks.forEach((link,index)=>{link.href='#rowsWrap';link.addEventListener('click',e=>{e.preventDefault();naCatalogLinks.forEach(el=>el.classList.toggle('active',el===link));if(index===0){renderAll();window.scrollTo({top:0,behavior:'smooth'});return;}const shows=SHOWS.filter(show=>index===1?show.episodes>0:index===2?show.episodes===0:index===3?show.categories.includes('trending'):myList.has(show.id));const wrap=$('#rowsWrap');wrap.replaceChildren();if(shows.length){const row=buildRow({title:link.textContent.trim(),shows});if(index===4)row.id='myListRow';wrap.append(row);}else{const empty=document.createElement('p');empty.textContent='Adicione títulos à sua lista para vê-los aqui.';wrap.append(empty);}wrap.scrollIntoView({behavior:'smooth'});});});
const naProfile=$('.nav-profile');naProfile.setAttribute('role','button');naProfile.setAttribute('aria-label','Trocar perfil');naProfile.tabIndex=0;naProfile.addEventListener('click',()=>{$('#profileSelector').hidden=false;$('#profileSelector').classList.add('on');});naProfile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();naProfile.click();}});$('.ps-manage').textContent='Escolher um perfil';$('.ps-manage').addEventListener('click',()=>$('.ps-profile').focus());
const naVPButtons=[...document.querySelectorAll('.vp-controls-row .vp-btn')];
for(const [i,label] of ['Reproduzir ou pausar','Recomeçar vídeo','Ativar ou desativar som','Informações do vídeo','Tela cheia'].entries())naVPButtons[i]?.setAttribute('aria-label',label);
naVPButtons[1]?.addEventListener('click',()=>{naNetflixVideo.currentTime=0;});naVPButtons[2]?.addEventListener('click',()=>{naNetflixVideo.muted=!naNetflixVideo.muted;});naVPButtons[3]?.addEventListener('click',()=>showToast('Vídeo enviado por quem criou este presente.'));naVPButtons[4]?.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else vp.requestFullscreen?.();});
NAExclusive.connect({key:'netflix',letters:['#naNetflixLetter'],player:'#musicPlayer',textSelector:'#profileSelector .ps-name',excludeSelector:'#heroSlides,#rowsWrap,#naNetflixLetter',
  collections:{shows:{label:'Catálogo de títulos e episódios',value:SHOWS},notifications:{label:'Notificações do catálogo',value:NOTIFS}},
  apply(payload){const {p,photos,custom}=payload,c=custom.collections||{};naNetflixPayload=payload;
    const shows=NAExclusive.items(naNetflixDefaults.shows,c.shows,payload,['poster','backdrop'],true);
    shows.forEach((show,i)=>{show.id=naNetflixDefaults.shows[i]?.id||i+1;show.categories=Array.isArray(show.categories)?show.categories:[];});
    if(shows[0]){shows[0].title=p.titulo||'Nossa história';shows[0].synopsis=p.frase||p.carta||'Uma história feita para você.';}
    NAExclusive.change(SHOWS,shows,()=>{heroShows=[SHOWS[0],SHOWS[9],SHOWS[17]].filter(Boolean);heroIndex=0;renderAll();});
    const notifs=NAExclusive.items(naNetflixDefaults.notifications,c.notifications,payload,['thumb']);NAExclusive.change(NOTIFS,notifs,renderNotifs);
    NATheme.set('[data-profile="ele"] .ps-name',p.de||'Eu');NATheme.set('[data-profile="ela"] .ps-name',p.para||'Você');
    window.naSkipProfiles=new URLSearchParams(location.search).get('embed')==='1'||!p.usarIntro;
    if(window.naSkipProfiles){$('#profileSelector').classList.remove('on');$('#profileSelector').hidden=true;$('#musicPlayer').classList.add('show');}else $('#profileSelector').hidden=false;
    NATheme.set('#mpTitle',p.musicaNome||'Nossa música');NATheme.set('#mpArtist',p.musicaArtista||p.de+' & '+p.para);
    const musicCover=document.querySelector('.mp-cover img');if(musicCover)musicCover.src=payload.cover||NAExclusive.placeholder(p.titulo);
    NAExclusive.history(payload,'#naNetflixLetter');
  },dispose(){clearInterval(heroTimer);clearInterval(vpTimer);naNetflixVideo.pause();}
});
`;
const vinil = `
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
`;
const cinema = `
const naCinemaDefaults=NAExclusive.clone(POSTERS);
const naCinemaMusic=document.createElement('section');naCinemaMusic.id='naCinemaMusic';naCinemaMusic.className='na-extra-section';naCinemaMusic.innerHTML='<h3 id="pTitle">Nossa música</h3><p id="pArtist"></p>';const naCinemaAudio=$('#audio');naCinemaAudio.controls=true;naCinemaAudio.className='na-core-audio';naCinemaMusic.append(naCinemaAudio);document.querySelector('footer').before(naCinemaMusic);
NAExclusive.connect({key:'cinema',title:'.marquee-title',phrase:'.marquee-tagline',letters:['.clapper-paper'],player:'#naCinemaMusic',excludeSelector:'#featureGrid,#storiesRail,.reel-frames,.clapper-paper,#naCinemaMusic',
  collections:{posters:{label:'Filmes, cartazes e fichas técnicas',value:POSTERS},ratings:{label:'Mensagens da avaliação por pipocas',value:POPCORN_LABELS}},
  apply(payload){const {custom,p}=payload,c=custom.collections||{};
    NAExclusive.change(POSTERS,NAExclusive.items(naCinemaDefaults,c.posters,payload,['cover'],true),naRenderPosters);
    NAExclusive.change(STORIES,NAExclusive.stories(payload),()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!STORIES.length;
    if(c.ratings)Object.assign(POPCORN_LABELS,c.ratings);
    NATheme.timeline(payload,'.reel-frames');NATheme.set('.clapper-title',(p.para||'Você')+',');NATheme.set('.clapper-sign-sig',p.de||'Alguém especial');
  }
});
`;
const spotify = `
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
`;
const retro = `
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
`;
module.exports = { netflix, vinil, cinema, spotify, retro, netflixFunctions, spotifyFunctions, vinilFunctions, retroFunctions };
