// Extrai os modelos enviados e acrescenta apenas a ponte de personalização.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const attachments = path.join(process.env.USERPROFILE, '.codex/attachments');
const imports = {
  casamento: 'c3f56ecb-671a-42b0-a24b-0dc4a79a21d3', amizade: 'f37bb380-556f-4e20-b7d4-472a605766b1',
  familia: 'c54c85fc-7158-4719-9360-03124b8ece8d', aniversario: '3327cfa8-195a-4cba-aaa5-3c8284325c34',
  'carta-antiga': 'd5422b72-771f-4d8d-bd19-16e4a6c181ae', jardim: '04e90dfc-0f79-460c-b34a-187bc0327c17',
  scrapbook: 'adf90a54-8496-424e-aba1-61217ff021be',
};
function wrapLoop(js, start, name, host) {
  const first = js.indexOf(start);
  if (first < 0) throw new Error('Loop ausente: ' + start);
  const end = js.indexOf('\n});', first) + 5;
  if (end < 5) throw new Error('Fim do loop ausente');
  return js.slice(0, first) + `function ${name}(){\n${host}.replaceChildren();\n` + js.slice(first, end) + `\n}\n${name}();` + js.slice(end);
}
const extra = {
  casamento: { options: `names: '.hero-names', phrase: '.hero-script', letters: ['.vow-reveal'],`, collections: '', apply: '' },
  amizade: { options: `title: '.hero-title .line2', phrase: '.hero-sub', letters: ['.note-full'],`,
    collections: `quiz: {label:'Quiz da amizade',value:QUIZ}, memories:{label:'Roleta de memórias',value:MEMORIES}, jokes:{label:'Frases que passam na tela',value:JOKES_MARQUEE},`,
    apply: `naChange(QUIZ, c.quiz, resetQuiz); naChange(MEMORIES,c.memories,()=>{lastMemoryIdx=-1;rouletteMemory.textContent='';}); naChange(JOKES_MARQUEE,c.jokes,()=>naMarquee(JOKES_MARQUEE));` },
  familia: { options: `title: '.hero-title em', phrase: '.hero-lede', letters: ['#letterPaper .letter-full'],`,
    collections: `members:{label:'Pessoas da árvore da família',value:MEMBERS}, sayings:{label:'Frases da família',value:FRASES},`,
    apply: `if(c.members)Object.assign(MEMBERS,c.members);document.querySelectorAll('[data-member]').forEach((card,i)=>{const m=MEMBERS[card.dataset.member];if(!m)return;card.querySelector('.member-name').textContent=m.name;card.querySelector('.member-role').textContent=m.role;const image=card.querySelector('img');const src=NATheme.media(c.members?.[card.dataset.member]?.photo)||photos[i%Math.max(1,photos.length)]||'';image.hidden=!src;if(src)image.src=src;m.photo=src;});naChange(FRASES,c.sayings,()=>naMarquee(FRASES));` },
  aniversario: { options: `title: '.hero-title', phrase: '.hero-lede', letters: ['#letterPaper .letter-full'],`,
    collections: `memories:{label:'Pote de memórias',value:MEMORIES},`,
    apply: `naChange(MEMORIES,c.memories,()=>{usedMemories=[];jarMemory.textContent='';});for(const id of ['heroAgeNum','badgeAge']){const el=document.getElementById(id);if(el){el.hidden=!validDate;const badge=el.closest('.hero-age,.hero-photo-badge');if(badge)badge.hidden=!validDate;if(!validDate)el.textContent='';}}if(validDate){birthDate=new Date(p.inicio+'T00:00:00');let age=new Date().getFullYear()-birthDate.getFullYear();const now=new Date();if(now.getMonth()<birthDate.getMonth()||(now.getMonth()===birthDate.getMonth()&&now.getDate()<birthDate.getDate()))age--;NATheme.set('#heroAgeNum',Math.max(0,age));NATheme.set('#badgeAge',Math.max(0,age));}NATheme.set('#giftTitle',p.para||'Você é o presente');` },
  'carta-antiga': { options: `title: '.hero-title', phrase: '.hero-sub', letters: ['.letter-full-paper', '.final-letter'],`,
    collections: `letters:{label:'Cartas do cofre',value:VAULT_LETTERS}, typewriter:{label:'Texto da máquina de escrever',value:TW_TEXT},`,
    apply: `naChange(VAULT_LETTERS,c.letters,naRenderVault);if(typeof c.typewriter==='string'&&TW_TEXT!==c.typewriter){clearTimeout(typewriterTimer);TW_TEXT=c.typewriter;typewriterIndex=0;twTextEl.textContent='';if(typewriterStarted)typeNextChar();}NATheme.set('#heroDate',validDate?p.inicio.slice(0,4):'Para sempre');` },
  jardim: { options: `title: '.hero-title', phrase: '.hero-sub', letters: ['#treeLetter .tl-body', '.final-letter'],`,
    collections: `wishes:{label:'Desejos da fonte',value:WISHES}, stars:{label:'Memórias da constelação',value:STARS},`,
    apply: `naChange(WISHES,c.wishes,()=>{usedWishes=[];fountainMsg.textContent='';});naChange(STARS,c.stars,()=>{const labels=document.querySelectorAll('.star-label');const stars=document.querySelectorAll('.star');STARS.forEach((s,i)=>{if(labels[i]){labels[i].textContent=s.label;labels[i].style.left=s.x+'%';labels[i].style.top=(s.y+4)+'%';}if(stars[i]){stars[i].style.left=s.x+'%';stars[i].style.top=s.y+'%';}});});` },
  scrapbook: { options: `title: '.hero-title', phrase: '.hero-sub', letters: ['#letterContent .letter-paper'],`, collections: '', apply: '' },
};
for (const [key, folder] of Object.entries(imports)) {
  let html = fs.readFileSync(path.join(attachments, folder, 'Texto colado.txt'), 'utf8').replace(/\r\n/g, '\n');
  let css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  let js = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/onclick="document.getElementById\('([^']+)'\).scrollIntoView\(\{behavior:'smooth'\}\)"/g, 'data-na-scroll="$1"')
    .replace('</head>', `<link rel="stylesheet" href="${key}.css">\n<script src="../js/core/theme-runtime.js"></script>\n</head>`)
    .replace('</body>', `<script src="${key}.js"></script>\n</body>`);
  let inlineIndex=0;
  html=html.replace(/<[a-z][^>]*\sstyle="[^"]*"[^>]*>/gi,tag=>{
    const style=tag.match(/\sstyle="([^"]*)"/i)[1];const cls='na-original-'+(++inlineIndex);
    css+='\n:root body .'+cls+'{'+style+'}\n';
    tag=tag.replace(/\sstyle="[^"]*"/i,'');
    return /\bclass="/i.test(tag)?tag.replace(/\bclass="/i,'class="'+cls+' '):tag.replace(/^<([a-z][\w-]*)/i,'<$1 class="'+cls+'"');
  });
  const galleryArray = key === 'scrapbook' ? 'POLAROIDS' : 'GALLERY';
  const galleryHost = key === 'scrapbook' ? 'grid' : key === 'jardim' ? 'gardenEl' : key === 'amizade' ? 'polWrap' : 'galleryEl';
  js = wrapLoop(js, galleryArray + '.forEach(', 'naRenderGallery', galleryHost);
  js = wrapLoop(js, 'STORIES.forEach(', 'naRenderStories', 'rail');
  if (key === 'carta-antiga') js = wrapLoop(js, 'VAULT_LETTERS.forEach(', 'naRenderVault', 'vaultLetters');
  // Dados inseridos em templates HTML são escapados; os demais usam textContent.
  for (const expression of ['item.src', 'item.cap', 'photo.src', 'photo.cap', 's.img', 'letter.title', 'letter.date'])
    js = js.split('${' + expression + '}').join('${NATheme.escape(' + expression + ')}');
  js = js.replace('letter.body.map(p => `<p>${p}</p>`)', 'letter.body.map(p => `<p>${NATheme.escape(p)}</p>`)');
  js = js.replace('const startDate =', 'let startDate =').replace('const birthDate =', 'let birthDate =').replace('const TW_TEXT =', 'let TW_TEXT =');
  js = js.replace(/function openLightbox\(i\)\{/, `function openLightbox(i){\n  if(!${galleryArray}.length)return;`);
  js = js.replace(/const img = document.createElement\('img'\);\n  img.src = data.img;\n  img.alt = data.cap;\n  storyMedia.appendChild\(img\);\n  requestAnimationFrame\(\(\) => img.classList.add\('on'\)\);/,
    `const img = NATheme.storyMedia(data, storyMedia);`);
  js = js.replace(/function renderStory\(i\)\{/, `function renderStory(i){\n  if(!STORIES.length)return;`);
  js = js.replace(/clearTimeout\(storyTimer\);\n  storyTimer = setTimeout\(\(\) => nextStory\(\), 5000\);/,
    `clearTimeout(storyTimer);\n  if(data.video){img.addEventListener('ended',nextStory,{once:true});}else storyTimer=setTimeout(nextStory,5000);`);
  js = js.replace(/function closeStories\(\)\{/, `function closeStories(){\n  storyMedia.querySelectorAll('video').forEach(v=>v.pause());`);
  js = js.replace('storyAva.src = data.img;', "storyAva.hidden=!data.img;if(data.img)storyAva.src=data.img;else storyAva.removeAttribute('src');");
  if (key === 'amizade') {
    js=js.replace('let quizIdx = 0;', 'let quizIdx = 0; let quizVersion = 0;').replace('function resetQuiz(){','function resetQuiz(){\n  quizVersion++;');
    js = js.replace("const all = quizOptions.querySelectorAll('.quiz-opt');", "if(btn.classList.contains('disabled'))return;\n      const all = quizOptions.querySelectorAll('.quiz-opt');");
    js=js.replace('setTimeout(() => {\n        quizIdx++;','const version=quizVersion;\n      setTimeout(() => {\n        if(version!==quizVersion)return;\n        quizIdx++;');
    js = js.replace('const m = messages[quizScore] || messages[0];', 'const m = messages[Math.round(quizScore / Math.max(1, QUIZ.length) * 5)] || messages[0];');
  }
  if(key === 'carta-antiga')js=js.replace('let typewriterIndex = 0;', 'let typewriterIndex = 0; let typewriterTimer = null;').replace('setTimeout(typeNextChar, delay);','typewriterTimer=setTimeout(typeNextChar, delay);');
  const counterCode = ['casamento', 'amizade', 'aniversario'].includes(key) ? `
    const validDate=/^\\d{4}-\\d{2}-\\d{2}$/.test(p.inicio||'')&&Number.isFinite(+new Date(p.inicio+'T00:00:00'));
    const counter=document.getElementById('startLabel')?.closest('.counter-card');if(counter)counter.hidden=!validDate;
    if(validDate){${key === 'aniversario' ? 'birthDate' : 'startDate'}=new Date(p.inicio+'T00:00:00');NATheme.set('#startLabel',new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(${key === 'aniversario' ? 'birthDate' : 'startDate'}));updateCounter();}` : `const validDate=/^\\d{4}-\\d{2}-\\d{2}$/.test(p.inicio||'');`;
  const timelineSelector = key === 'scrapbook' ? '.journal' : key === 'jardim' ? '#pathWrap .path-items' : key === 'amizade' ? '.chapters' : '.timeline';
  js += `
/* Integração com criar.html e ver.html; interações originais preservadas. */
function naChange(target, value, render){if(value===undefined||JSON.stringify(target)===JSON.stringify(value))return;NATheme.replaceArray(target,value);render?.();}
function naMarquee(values){const track=document.getElementById('marqueeTrack');if(track){track.replaceChildren();[...values,...values].forEach(text=>{const span=document.createElement('span');span.textContent=text;track.append(span);const sep=document.createElement('span');sep.className='sep';sep.textContent='◆';track.append(sep);});}}
NATheme.connect({key:${JSON.stringify(key)},${extra[key].options}
  collections:{${extra[key].collections}},
  apply(payload){const {p,custom,photos,videos,cover}=payload;const c=custom.collections||{};
    naChange(${galleryArray},photos.map((src,i)=>({src,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)})),naRenderGallery);
    ${galleryHost}.closest('section').hidden=!photos.length;
    const stories=videos.length?videos.map((video,i)=>({video,img:photos[i%Math.max(1,photos.length)]||cover,cap:p.legendas?.[i]||'Nosso vídeo '+(i+1)})):photos.map((img,i)=>({img,cap:p.legendas?.[i]||'Nossa lembrança '+(i+1)}));
    naChange(STORIES,stories,()=>{closeStories();naRenderStories();});rail.closest('section').hidden=!stories.length;
    NATheme.timeline(payload,${JSON.stringify(timelineSelector)});
    ${counterCode}
    ${extra[key].apply}
  },${key === 'aniversario' ? 'dispose:()=>stopMic(),' : ''}
});
document.querySelectorAll('[data-na-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.naScroll)?.scrollIntoView({behavior:'smooth'})));
`;
  css += `
/* Suporte à prévia e às mídias personalizadas. */
[hidden]{display:none!important}
.na-await-data:not(.na-data-ready) body>:not(#loader){visibility:hidden}
.story-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1}
.story-tap{bottom:70px!important}
.na-data-ready p{white-space:pre-line}
.na-reasons{padding:60px 24px;max-width:1100px;margin:auto}.na-reasons h2{font:inherit;font-size:2rem;margin-bottom:20px}.na-reasons-list{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.na-reasons-list p{border:1px solid currentColor;border-radius:16px;padding:24px;line-height:1.6}
@media(pointer:coarse){button,[role=button],.flower,.polaroid,.member-card,.g-item{cursor:pointer}}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1!important;transform:none!important}}
@media(max-width:600px){.hero-inner,.hero-grid,.hero-text,.hero-content{min-width:0;max-width:100%}.hero-title,.hero-names,.hero-title span{overflow-wrap:anywhere}.hero-title .line1,.hero-title .line2{font-size:clamp(2rem,11vw,4.5rem)}.hero-sub,.hero-lede{max-width:100%}.hero-title{max-width:100%}}
`;
  if(key==='scrapbook')css += "\n/* Trilhas podem encolher sem a largura intrínseca das fotografias. O recuo acomoda a rotação. */\n.polaroid-grid {\n  grid-template-columns:repeat(12,minmax(0,1fr));\n  width:100%;\n  min-width:0;\n  padding-inline:clamp(16px,4vw,30px);\n}\n.polaroid { min-width:0; width:100%; }\n.polaroid img { min-width:0; max-width:100%; }\n@media (max-width:900px) {\n  .polaroid-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }\n  .polaroid:nth-child(n) { grid-column:auto; }\n}\n@media (max-width:560px) {\n  .polaroid-grid { grid-template-columns:minmax(0,1fr); gap:32px; }\n  .polaroid:hover { transform:rotate(0) translateY(-4px); }\n}\r\n\n.polaroid-grid[data-reveal] { transform:translateY(30px); }\n.polaroid-grid[data-reveal].in { transform:none; }\n";
  for (const [ext, value] of Object.entries({ html, css, js })) fs.writeFileSync(path.join(root, 'public/teste', key + '.' + ext), value);
  console.log('Importado: ' + key);
}
