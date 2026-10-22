const { extract, wrapLoop, replaceFunction, write } = require('./theme-import-utils.cjs');
const adapters = require('./exclusive-adapters.cjs');
const imports = {
  netflix: '9d210919-795c-4cb7-91f9-adff5277e235', vinil: 'd30ea797-d6cc-4a35-88e9-64ad0c1ec578',
  cinema: '437ff9af-24c2-40ab-be30-83ddb50f0cc6', spotify: '39f12bb4-5792-48b1-a275-bcac7463134c',
  retro: '320e5c0c-2e25-4ee3-9813-6ff3d90a7344',
};
for (const [key, folder] of Object.entries(imports)) {
  let { html, css, js } = extract(folder, key);
  if (key === 'spotify') html = html.replace('class="visualizer-sec" id="visualizer"', 'class="visualizer-sec" id="ondas"');
  const loops = {
    vinil: [['ALBUMS.forEach(', 'naRenderAlbums', 'crate']],
    cinema: [['POSTERS.forEach(', 'naRenderPosters', 'grid'], ['STORIES.forEach(', 'naRenderStories', 'rail']],
    spotify: [['PLAYLISTS.forEach(', 'naRenderPlaylists', 'playlistsGrid'], ['TRACKS.forEach(', 'naRenderTracks', 'tracksList'], ['ALBUMS.forEach(', 'naRenderAlbums', 'albumsGrid'], ['MEMORIES.forEach(', 'naRenderStories', 'memoriesRail']],
    retro: [['VHS_TAPES.forEach(', 'naRenderVHS', 'vhsGrid'], ['MTV_STORIES.forEach(', 'naRenderStories', 'storiesRail']],
  };
  for (const [start, name, host] of loops[key] || []) js = wrapLoop(js, start, name, host);
  // Todos os textos editáveis usados em templates são escapados, inclusive os metadados.
  js = js.replace(/\$\{((?:show|album|track|poster|tape|p|s|m|t|n)\.[a-zA-Z_]\w*)\}/g, '${esc($1)}');
  if (['cinema','spotify','retro'].includes(key)) {
    const stories = key === 'spotify' ? 'MEMORIES' : key === 'retro' ? 'MTV_STORIES' : 'STORIES';
    js = js.replace(/const img = document.createElement\('img'\);\n  img.src = data.img;\n  img.alt = data.cap;\n  storyMedia.appendChild\(img\);\n  requestAnimationFrame\(\(\) => img.classList.add\('on'\)\);/, 'const img=NATheme.storyMedia(data,storyMedia);');
    js = js.replace('function renderStory(i){', `function renderStory(i){\n  if(!${stories}.length)return;`)
      .replace('storyAva.src = data.img;', "storyAva.hidden=!data.img;if(data.img)storyAva.src=data.img;else storyAva.removeAttribute('src');")
      .replace(/storyTimer = setTimeout\(\(\) => nextStory\(\), 5000\);/, "if(data.video)img.addEventListener('ended',nextStory,{once:true});else storyTimer=setTimeout(nextStory,5000);")
      .replace('function closeStories(){', "function closeStories(){\n  storyMedia.querySelectorAll('video').forEach(v=>v.pause());");
  }
  if (key === 'netflix') {
    js = js.replace('const heroShows =', 'let heroShows =');
    js = js.replace(/  slides.addEventListener\('click', e => \{[\s\S]*?\n  \}\);/, '');
    js = js.replace("setTimeout(() => $('#profileSelector').classList.add('on'), 500);", "if(new URLSearchParams(location.search).get('embed')!=='1'&&!window.naSkipProfiles)setTimeout(() => $('#profileSelector').classList.add('on'), 500);");
    for(const name of ['openVideo','closeVideo','toggleVP','updateVP'])js=replaceFunction(js,name,adapters.netflixFunctions[name]);
    js=js.replace("vpProgressVal = Math.min(VP_DUR, vpProgressVal + 5);", "const video=$('#naNetflixVideo');if(video?.getAttribute('src')&&Number.isFinite(video.duration))video.currentTime=Math.min(video.duration,video.currentTime+5);");
    js=js.replace('vpProgressVal = ((e.clientX - rect.left) / rect.width) * VP_DUR;', "const video=$('#naNetflixVideo');if(video)NAExclusive.seek(video,(e.clientX-rect.left)/rect.width);");
  }
  if (key === 'vinil') {
    js = replaceFunction(js,'playTrack',adapters.vinilFunctions.playTrack);
    const begin=js.indexOf("$('#npPlay').addEventListener('click'");const end=js.indexOf("$('#npNext')",begin);
    js=js.slice(0,begin)+"$('#npPlay').addEventListener('click',()=>{if(!currentTrack)playTrack(TRACKS_A[0]);else if(!NATheme.selectAudio(currentTrack.audio))showToast('Adicione uma música para tocar o disco.');else if(audio.paused)audio.play().catch(()=>showToast('Toque novamente para ouvir.'));else pauseTrack();});\n\n"+js.slice(end);
    js=js.replace("const DURATION = 30; // mock 30s per track",'');
    js=js.replace("const track = allTracks[+trackNum - 1] || TRACKS_A[0];", "const track = allTracks[i*4+Number(trackNum)-1] || TRACKS_A[0];");
  }
  if (key === 'spotify') {
    for(const name of ['playTrack','togglePlay','updateProgressUI','prevTrack'])js=replaceFunction(js,name,adapters.spotifyFunctions[name]);
    js=js.replace('fakeProgress = pct * fakeDuration;', 'NAExclusive.seek(audio,pct);');
    js=js.replace(/vizPlayBtn.addEventListener\('click', \(\) => \{[\s\S]*?\n\}\);/, "vizPlayBtn.addEventListener('click',togglePlay);");
    js=js.replace(/\$\('#navSearch'\).addEventListener\('click', \(\) => \{[\s\S]*?\n\}\);/,'');
    js=js.replace('const LYRICS =','let LYRICS =');
    const begin=js.indexOf("const lyricsWords = LYRICS.split(' ');");const end=js.indexOf('const lyricsObs',begin);
    js=js.slice(0,begin)+"function naRenderLyrics(){lyricsText.replaceChildren();LYRICS.split(/\\s+/).forEach((word,i)=>{const span=document.createElement('span');span.className='word';span.style.animation='wordIn .6s '+(i*.08)+'s ease forwards';span.textContent=word+' ';lyricsText.append(span);});}\nnaRenderLyrics();\n\n"+js.slice(end);
  }
  if(key==='retro'){
    js='let naGameSeconds=30;\n'+js.replace(/timeLeft = 30;/g,'timeLeft = naGameSeconds;');
    js=js.replace("if (!gameActive) return;\n    target.classList.add('hit');", "if(!gameActive||target.classList.contains('hit'))return;\n    target.classList.add('hit');");
    js=js.replace("target.className = 'arcade-target';", "target.className='arcade-target';target.setAttribute('role','button');target.tabIndex=0;target.setAttribute('aria-label','Acertar estrela');target.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();target.click();}});");
    js=replaceFunction(js,'playCassette',adapters.retroFunctions.playCassette);
    js=js.replace(/if \(cassettePlaying\) \{\n        cassetteTrack/g,'if (cassettePlaying) {\n        playCassette();\n        cassetteTrack');
    js=js.replace("arcadeTime.textContent = '30';",'arcadeTime.textContent = String(timeLeft);');
  }
  js += '\n/* Dados do formulário e funções específicas do modelo. */\n' + adapters[key] + '\nNAExclusive.keyboard();\n';
  css += `
/* Integração, mídias reais e adaptação para a prévia no celular. */
[hidden]{display:none!important}.na-await-data:not(.na-data-ready) body>:not(#loader){visibility:hidden}
.story-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1}.story-tap{bottom:70px!important}
.na-data-ready p{white-space:pre-line}.na-extra-section,.na-reasons{padding:60px 24px;max-width:1100px;margin:auto;line-height:1.7}.na-extra-section article{margin:24px 0;padding:24px;border:1px solid currentColor;border-radius:12px}.na-reasons-list{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.na-reasons-list p{border:1px solid currentColor;border-radius:12px;padding:24px}.na-core-audio{width:100%;margin-top:18px}
.na-search-input{background:transparent;color:inherit;border:0;width:100%;min-width:0;font:inherit;outline:none}.nav-search:has(.na-search-input){max-width:330px}.na-search-input::placeholder{color:inherit;opacity:.65}
#naNetflixVideo{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1}#videoPlayer.na-real-video .vp-vignette{pointer-events:none}#videoPlayer.na-real-video .vp-center{background:linear-gradient(transparent,#0009);inset:auto 0 0;padding:20px;z-index:2}#videoPlayer.na-real-video .vp-title{font-size:clamp(1.1rem,3vw,2rem)}#videoPlayer.na-real-video #vpPlayBig{display:none}
@media(max-width:600px){.hero-title,.marquee-title,.hero-title span{overflow-wrap:anywhere;max-width:100%}.hero-inner,.hero-grid,.hero-content,.hero-text{min-width:0;max-width:100%}.hero-sub,.hero-synopsis,.hero-lede{max-width:100%}.now-playing-bar{gap:8px}.npb-left,.npb-center,.npb-right{min-width:0}.tr-album,.tr-plays{display:none}.hero-cover-title{overflow-wrap:anywhere}}
@media(max-width:640px){#hero.hero{min-height:620px;height:90svh}.rows-wrap{margin-top:0}#hero .hero-content{padding-top:80px;padding-bottom:35px}#hero .hero-synopsis{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
@media(prefers-reduced-motion:reduce){[data-reveal],.credits-block,.frame{opacity:1!important;transform:none!important}}
[role=button]:focus-visible,button:focus-visible{outline:2px solid currentColor;outline-offset:4px}
`;
  write(key,{html,css,js});
  console.log('Importado exclusivo: '+key);
}
