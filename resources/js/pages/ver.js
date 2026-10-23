/**
 * NOSSO AMOR — EXPERIÊNCIAS IMERSIVAS V3
 * 13 interfaces independentes. Dependências: somente app.js existente e navegador.
 * API e IndexedDB mantidos como definidos no README.md / CONTRACT.md.
 * Nenhum preço/tema de venda é gravado neste arquivo: nomes aqui são APENAS renderers de UI.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
const DEMO = query.get('demo') === '1';
const EMBED = query.get('embed') === '1';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const disposables = [];
const aliases = {'jardim-secreto':'jardim','cartaantiga':'carta-antiga','carta_antiga':'carta-antiga','família':'familia','aniversário':'aniversario','retrô':'retro','vinyl':'vinil'};
const slug = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_ ]+/g,'-');
const canonical = s => aliases[slug(s)] || slug(s);
const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = (s,max=90) => String(s||'').length>max?String(s).slice(0,max-1)+'…':String(s||'');
const safeMedia = v => {
  if (!v) return '';
  if (typeof Blob !== 'undefined' && v instanceof Blob) {const u=URL.createObjectURL(v);disposables.push(u);return u;}
  if (typeof v==='object') return safeMedia(v.url||v.src||v.blob||v.file);
  if (typeof v!=='string') return '';
  const s=v.trim();
  if (s.startsWith('/api/')) return new URL(s,location.origin).href;
  if (/^(https?:\/\/|blob:|data:image\/|data:video\/|data:audio\/)/i.test(s)) return s;
  if (/^(?!\/\/)(?![a-z]+:)[\w./% -]+$/i.test(s)) return s;
  return '';
};
const themeMeta = {
 namoro:['Namoro','♡'],casamento:['Casamento','∞'],amizade:['Amizade','★'],familia:['Família','❦'],
 aniversario:['Aniversário','✺'],'carta-antiga':['Carta antiga','✉'],scrapbook:['Scrapbook','✂'],jardim:['Jardim secreto','✿'],
 cinema:['Cinema','◈'],netflix:['Série','▶'],spotify:['Playlist','♫'],vinil:['Vinil','◉'],retro:['Retrô','▣']
};
const themes = Object.keys(themeMeta);
const palettes = {
 namoro:['#20121f','#7c425a','#f8bfcc','#f6e9e0'],casamento:['#29241f','#b79e76','#efe7d5','#fff9ee'],
 amizade:['#2527a1','#ff5f73','#f9de72','#f7f4ec'],familia:['#304b3a','#8ba58f','#e4d7bd','#f3ebdc'],
 aniversario:['#922b87','#ff8395','#ffdd9e','#fff0e6'],'carta-antiga':['#51412f','#bc9660','#eee0bd','#f7edda'],
 scrapbook:['#7b507c','#f29b9d','#f5dca2','#fff2df'],jardim:['#173c2e','#72957a','#f0e2b5','#edf1db'],
 cinema:['#1a0d18','#732b40','#e7bd70','#f9efde'],netflix:['#111319','#ad263b','#eceef2','#222732'],
 spotify:['#0b251a','#2d8054','#a9f0b3','#e3f5eb'],vinil:['#35271e','#947254','#dfc393','#f5e8d5'],
 retro:['#191044','#6433a3','#f574c5','#6afbe7']
};
function poster(theme,i) {
  const [a,b,c,d]=palettes[theme];
  const star = i%3, words=['OUR MOMENTS','STORIES TO KEEP','A LITTLE FOREVER','THE FIRST DAY','ONE OF A KIND','CHAPTER SIX'];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1120" viewBox="0 0 900 1120"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset=".58" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient><radialGradient id="gl"><stop stop-color="${c}" stop-opacity=".72"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient><pattern id="p" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${d}" opacity=".22"/></pattern></defs><rect width="900" height="1120" fill="url(#g)"/><rect width="900" height="1120" fill="url(#p)"/><circle cx="${380+i*36}" cy="${470-i*25}" r="390" fill="url(#gl)"/><path d="M-100 920Q310 ${180+i*60} 1070 710" stroke="${c}" stroke-opacity=".58" stroke-width="${star===0?48:5}" fill="none"/><circle cx="${580-i*22}" cy="450" r="240" fill="none" stroke="${c}" stroke-width="2" opacity=".7"/><circle cx="${580-i*22}" cy="450" r="300" fill="none" stroke="${c}" stroke-width="1" opacity=".35"/><path d="M80 95H820V1025H80Z" stroke="${d}" stroke-opacity=".4" fill="none"/><text x="125" y="165" font-size="25" font-family="Arial" fill="${d}" letter-spacing="11">NOSSO AMOR</text><text x="110" y="910" font-size="200" font-style="italic" font-family="Georgia" fill="${d}" opacity=".94">${String(i+1).padStart(2,'0')}</text><text x="125" y="995" font-size="25" font-family="Arial" letter-spacing="7" fill="${c}">${words[i%words.length]}</text></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(svg).replace(/'/g,'%27');
}
const demos = {
 namoro:['Um amor para chamar de nosso','Tem encontros que mudam o jeito que a gente enxerga o mundo.','Entre tantos acasos, escolhi você — e escolheria mil vezes.'],
 casamento:['O começo do nosso para sempre','Dois caminhos se tornaram uma promessa.','Prometo continuar escolhendo nós dois, inclusive nos dias comuns.'],
 amizade:['Nossa melhor bagunça','A vida ficou muito mais interessante depois que você apareceu.','Você é minha pessoa favorita para rir de absolutamente nada.'],
 familia:['O amor tem endereço','Nosso lugar no mundo é onde a gente se encontra.','Que nossas histórias continuem sendo contadas à mesa por muitas gerações.'],
 aniversario:['Hoje o universo celebra você!','O mundo ficou mais bonito no dia em que você chegou.','Que essa nova volta ao sol venha com motivos para sorrir, dançar e sonhar.'],
 'carta-antiga':['À pessoa que atravessa meu tempo','Uma correspondência guardada por muitos anos.','Talvez um dia as palavras envelheçam. O que sinto por você, jamais.'],
 scrapbook:['A nossa coleção de instantes','Uma confusão bonita de bilhetes, abraços e fotografias.','Se a vida é um livro, você está nas minhas páginas favoritas.'],
 jardim:['Existe um lugar só nosso','O que a gente cultiva com carinho floresce.','Mesmo quando as estações mudam, guardarei sempre um jardim para você.'],
 cinema:['Uma história feita para a tela grande','Esta sessão é reservada para a pessoa mais especial.','Das infinitas cenas da vida, quero viver as próximas com você.'],
 netflix:['A série que eu veria mil vezes','Os melhores capítulos ainda estão por vir.','Se eu pudesse escolher um elenco para minha vida, você seria protagonista.'],
 spotify:['As canções da nossa história','Porque toda memória tem uma trilha sonora.','Se meu coração tivesse uma playlist, seu nome estaria em todas as faixas.'],
 vinil:['Um disco que nunca sai de moda','Lado A: quando tudo começou. Lado B: para sempre.','Há histórias que merecem ser ouvidas até o último sulco.'],
 retro:['PLAY. REWIND. LOVE.','Uma coleção de memórias que vale a pena rebobinar.','Se pudesse voltar no tempo, apertaria play no dia em que nos conhecemos.']
};
function demoPurchase(key) {
 const [title,phrase,letter]=demos[key];
 return {id:'demo-'+key,tema:key,titulo:title,frase:phrase,para:'Você',de:'Alguém especial',inicio:'2022-06-12',
 carta:letter+'\n\nOs pequenos instantes, as conversas sem hora e as fotografias guardadas fizeram de nós uma história que vale a pena contar.\n\nCom todo meu carinho.',
 eventos:[{data:'12 JUN 2022',titulo:'O primeiro capítulo',texto:'Uma conversa, um encontro e a sensação de que tudo podia ser diferente.'},{data:'MAIS TARDE',titulo:'A nossa aventura',texto:'Um dia comum virou uma lembrança daquelas que a gente revisita sorrindo.'},{data:'HOJE',titulo:'Tudo o que ainda vem',texto:'As páginas mais bonitas dessa história ainda estão em branco.'}],
 amo:['O seu jeito de transformar dias comuns','Nossas conversas sem hora para acabar','Tudo o que ainda vamos viver juntos'],
 fotos:Array.from({length:6},(_,i)=>poster(key,i)),legendas:['Nossa primeira lembrança','Onde tudo começou','Um dia para guardar','Nossa versão favorita','Olha só a gente','Continua…'],
 videos:[],musica:null,musicaNome:'Nossa trilha sonora',musicaArtista:'A nossa história',fotoCapa:0,rodapeCustom:'O melhor ainda está por vir.',status:'paid'};
}
let S, toastTimer, audio=null, photoI=0, activeFrame=0;
function normalize(p,key){
 const photos=Array.isArray(p.fotos)?p.fotos.map(safeMedia).filter(Boolean):[];
 if (!photos.length && p.preview_data_url) {const x=safeMedia(p.preview_data_url);if(x)photos.push(x);}
 const videos=Array.isArray(p.videos)?p.videos.map(safeMedia).filter(Boolean):[];
 const music=safeMedia(p.musica);
 const cover=photos[Math.max(0,Math.min(photos.length-1,Number(p.fotoCapa)||0))]||'';
 return {p,key,photos,videos,music,cover,events:Array.isArray(p.eventos)?p.eventos.filter(Boolean):[],reasons:Array.isArray(p.amo)?p.amo.filter(Boolean):[]};
}
function duration(){const d=new Date(String(S.p.inicio||'').slice(0,10)+'T00:00:00');const n=new Date();if(!Number.isFinite(+d)||d>n)return[0,0,0,0];let mo=(n.getFullYear()-d.getFullYear())*12+n.getMonth()-d.getMonth();if(n.getDate()<d.getDate())mo--;mo=Math.max(0,mo);const ms=Math.max(0,n-d);return[Math.floor(mo/12),mo,Math.floor(ms/864e5),Math.floor(ms/36e5)];}
const cleanLabel=(x,max=90)=>E(short(x,max));
const photo=(i,cls='',alt='Fotografia')=>S.photos.length?`<button type="button" class="photo-hit ${cls}" data-photo="${i%S.photos.length}" aria-label="Ampliar foto ${i%S.photos.length+1}"><img src="${E(S.photos[i%S.photos.length])}" alt="${E(alt)}" loading="lazy"><span class="photo-label">${cleanLabel(S.p.legendas?.[i%S.photos.length]||'Nossa memória',60)}</span></button>`:'<div class="media-placeholder">◇ <span>Fotografia indisponível neste dispositivo</span></div>';
const cover=(cls='')=>S.cover?`<img class="${cls}" src="${E(S.cover)}" alt="Fotografia de capa" fetchpriority="high">`:`<div class="cover-art ${cls}" aria-hidden="true">${themeMeta[S.key][1]}</div>`;
const counter=(cls='')=>`<div class="counter ${cls}">${duration().map((n,i)=>`<div><strong data-number="${n}">${n.toLocaleString('pt-BR')}</strong><small>${['anos','meses','dias','horas'][i]}</small></div>`).join('')}</div>`;
const history=(cls='')=>`<div class="history ${cls}">${(S.events.length?S.events:[{data:'O COMEÇO',titulo:'Nossa primeira memória',texto:'Tudo começou aqui.'}]).map((e,i)=>`<article><span>${String(i+1).padStart(2,'0')} / ${cleanLabel(e.data||'Um dia especial')}</span><h3>${cleanLabel(e.titulo||'Uma lembrança',120)}</h3><p>${E(e.texto||'')}</p></article>`).join('')}</div>`;
const reasons=(cls='')=>`<div class="reasons ${cls}">${(S.reasons.length?S.reasons:['Nossas melhores lembranças']).map((r,i)=>`<p><span>${String(i+1).padStart(2,'0')}</span>${E(r)}</p>`).join('')}</div>`;
const grid=(cls='',limit=8)=>`<div class="photo-grid ${cls}">${S.photos.length?S.photos.slice(0,limit).map((_,i)=>photo(i,'grid-photo')).join(''):'<div class="media-placeholder">Sua galeria aparecerá aqui quando as fotos estiverem disponíveis.</div>'}</div>`;
const note=(cls='')=>`<article class="note ${cls}"><span class="note-to">PARA ${cleanLabel(S.p.para||'VOCÊ')}</span><p>${E(S.p.carta||'Uma mensagem só para você.').replace(/\n/g,'<br>')}</p><span class="note-signature">Com carinho, ${cleanLabel(S.p.de||'alguém especial')}</span></article>`;
const envelope=(cls='')=>`<div class="envelope-widget ${cls}" data-envelope-root><button type="button" class="env-button" data-envelope aria-expanded="false" aria-label="Abrir carta"><span class="env-back"></span><span class="env-letter">PARA ${cleanLabel(S.p.para||'VOCÊ',24)}</span><span class="env-front"></span><span class="env-flap"></span><span class="env-seal">♥</span></button><span class="env-hint">TOQUE PARA ABRIR A CARTA</span><div class="env-body" hidden>${note()}</div></div>`;
const film=(cls='')=>S.videos.length?`<div class="film ${cls}"><video controls playsinline preload="metadata" src="${E(S.videos[0])}" aria-label="Nosso vídeo"></video>${S.videos.length>1?`<div class="film-nav">${S.videos.map((_,i)=>`<button type="button" data-video="${i}" class="${i?'':'selected'}" aria-label="Vídeo ${i+1}" aria-pressed="${i===0}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div>`:''}</div>`:`<div class="film film-empty ${cls}"><span>▷</span><p>${DEMO?'O vídeo do presente aparece aqui':'Nenhum vídeo disponível neste dispositivo'}</p></div>`;
const music=(cls='')=>`<div class="music-card ${cls}"><span class="music-icon">♫</span><div><small>TRILHA SONORA</small><strong>${cleanLabel(S.p.musicaNome||'Nossa música',72)}</strong><span>${cleanLabel(S.p.musicaArtista||'Um som para nós',70)}</span></div><button type="button" data-play ${S.music?'':'disabled'} aria-label="Tocar ou pausar a música">${S.music?'▶':'♪'}</button></div>`;
const brand=(small='UMA EXPERIÊNCIA NOSSO AMOR')=>`<span class="micro-brand">${E(small)}</span>`;
const shareMarkup=()=>`<button type="button" class="share-link" data-share>Compartilhar ↗</button>`;
const timelineItem=(i)=>S.events[i%Math.max(S.events.length,1)]||{data:'O COMEÇO',titulo:'Nossa história',texto:'Uma nova memória.'};
const dynStyle=n=>`style="--n:${n}"`;
const section=(k,title,sub='')=>`<div class="scene-heading"><span>${E(k)}</span><h2>${E(title)}</h2>${sub?`<p>${E(sub)}</p>`:''}</div>`;
const tabButton=(index,label)=>`<button type="button" data-step="${index}" aria-pressed="${index===0}">${E(label)}</button>`;

// 01 — NAMORO: navegação em atos cinematográficos, sem rolagem vertical obrigatória.
function namoro(){const p=S.p;return `<div class="xp x-namoro" data-system="slides">
 <div class="nm-fixed"><span>THE LOVE FILM · ${E(p.de||'EU')} & ${E(p.para||'VOCÊ')}</span><span id="nmAct">ATO 01 / 06</span></div>
 <div class="slides" id="slides">
  <section class="slide nm-opening active"><div class="nm-cover">${cover()}</div><div class="nm-vignette"></div><div class="nm-start"><span>UMA HISTÓRIA ORIGINAL</span><h1>${E(p.titulo)}</h1><p>${E(p.frase||'E tudo começou com você.')}</p><button type="button" data-next>Começar nossa história <b>→</b></button></div><div class="nm-film-frame">© O NOSSO UNIVERSO · 001</div></section>
  <section class="slide nm-time"><div class="nm-time-pic">${photo(0)}</div><div class="nm-time-copy"><span>CAPÍTULO I — O TEMPO</span><h2>O relógio passou.<br><i>O coração ficou.</i></h2>${counter()}<button type="button" data-next>Relembrar os começos ↗</button></div></section>
  <section class="slide nm-mem"><div class="nm-mem-left"><span>CAPÍTULO II — NOSSAS CENAS</span><h2>Algumas histórias<br>merecem <i>replay.</i></h2><p>Use as setas para mudar de memória.</p><div class="nm-mem-controls"><button data-memory-prev aria-label="Memória anterior">←</button><span id="nmMemoryCount">01 / ${String(Math.max(S.events.length,1)).padStart(2,'0')}</span><button data-memory-next aria-label="Próxima memória">→</button></div></div><div class="nm-memory-stage"><div id="nmMemoryVisual">${photo(1)}</div><article id="nmMemoryText"><small>${E(timelineItem(0).data)}</small><h3>${E(timelineItem(0).titulo)}</h3><p>${E(timelineItem(0).texto)}</p></article></div></section>
  <section class="slide nm-letter"><div class="nm-letter-panel"><span>CAPÍTULO III — COISAS QUE NUNCA DISSE</span><h2>Um sentimento.<br><em>Uma carta.</em></h2>${envelope()}</div><div class="nm-letter-mosaic">${photo(2)}${photo(3)}</div></section>
  <section class="slide nm-photos"><span>CAPÍTULO IV — ÁLBUM EM FILME</span><h2>O mundo pelos nossos olhos.</h2>${grid('nm-gallery',6)}${reasons('nm-reasons')}</section>
  <section class="slide nm-end"><div class="nm-end-film">${film()}</div><div class="nm-end-copy"><span>ÚLTIMO ATO — CONTINUA…</span><h2>Mas essa história<br><i>não tem fim.</i></h2>${music()}<p>${E(p.rodapeCustom||'O melhor ainda está por vir.')}</p>${shareMarkup()}<button type="button" data-step="0">Rever desde o início ↻</button></div></section>
 </div><nav class="nm-rail" aria-label="Capítulos">${['Abertura','Tempo','Memórias','Carta','Fotografias','Nosso filme'].map((x,i)=>`<button type="button" data-step="${i}" aria-label="${x}" aria-current="${i===0?'step':'false'}"><span>0${i+1}</span></button>`).join('')}</nav><div class="nm-hint">Role ou toque nas setas para mudar de capítulo · <span>↓</span></div></div>`;}

// 02 — CASAMENTO: revista editorial interativa, edição de luxo.
function casamento(){const p=S.p;const pages=[
 {title:'Nossos votos',sub:'A promessa escrita',html:`<div class="wc-vows"><div><h3>Para sempre<br>é uma escolha.</h3><p>${E(p.frase||'Uma promessa.')}</p>${envelope('wc-letter')}</div><div class="wc-rings" aria-hidden="true"><i></i><i></i><span>∞</span></div></div>`},
 {title:'O nosso calendário',sub:'Desde o primeiro dia',html:`<div class="wc-timeline">${history()}${counter()}</div>`},
 {title:'Galeria privada',sub:'Retratos de uma união',html:grid('wc-gallery',8)},
 {title:'A nossa cerimônia',sub:'Luzes, som, sentimentos',html:`<div class="wc-media">${film()}${music()}</div>`},
 {title:'A lista do para sempre',sub:'Aquilo que importa',html:reasons('wc-reasons')}
 ];return `<div class="xp x-casamento"><div class="wc-top"><span>THE WEDDING JOURNAL</span><span>EDIÇÃO PRIVADA · ${E(String(p.inicio||'2026').slice(0,4))}</span></div>
 <section class="wc-cover" id="wcCover"><div class="wc-cover-img">${cover()}</div><div class="wc-cover-words"><span>UM CONVITE EXCLUSIVO</span><h1>O nosso<br><em>para sempre.</em></h1><p>${E(p.titulo)}</p><button type="button" id="wcOpen">Abrir nossa edição <span>↗</span></button></div><span class="wc-corner">№ 001 / FOREVER EDITION</span></section>
 <div class="wc-editorial" id="wcEditorial" hidden><aside class="wc-index"><span>ÍNDICE DA EDIÇÃO</span><h2>${E(p.de||'Nós')}<br><em>&</em> ${E(p.para||'Sempre')}</h2><div class="wc-tabs">${pages.map((x,i)=>`<button type="button" data-editorial="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${E(x.title)}<b>↗</b></button>`).join('')}</div>${shareMarkup()}<button id="wcClose" class="wc-back">← Voltar para a capa</button></aside><article class="wc-page"><div class="wc-page-head"><span>THE WEDDING JOURNAL — NOSSO AMOR</span><span id="wcPageno">PAGE 01 / 05</span></div><div class="wc-page-title"><small id="wcSub">${E(pages[0].sub)}</small><h2 id="wcTitle">${E(pages[0].title)}</h2></div><div id="wcPageBody" class="wc-page-body">${pages[0].html}</div><div class="wc-page-foot"><span>✧ HANDMADE FOR YOU</span><button id="wcNext" type="button">Próxima página →</button></div></article></div>
 </div>`;}

// 03 — AMIZADE: desktop interativo com janelas, não uma landing page.
function amizade(){const p=S.p;const apps=[['fotos','FOTOS','📸'],['chat','MENSAGENS','💬'],['memorias','NOSSAS HISTÓRIAS','🎞'],['tempo','TEMPO DE AMIZADE','⏱'],['tv','VÍDEOS','▷'],['music','NOSSA PLAYLIST','♫']];return `<div class="xp x-amizade"><div class="am-wallpaper"><div class="am-sun">★</div><h1>BEST FRIENDS<br><i>FOREVER!</i></h1><p>${E(p.titulo)}</p><div class="am-stick">VOCÊ + EU = CAOS BOM</div></div><div class="am-icons">${apps.map(([id,label,ico])=>`<button type="button" data-am-app="${id}" class="am-icon"><span>${ico}</span><b>${label}</b></button>`).join('')}</div>
 <div class="am-window am-welcome" id="amWelcome"><div class="am-window-top"><span>★_ BEM-VINDO.EXE</span><button type="button" data-am-close="welcome" aria-label="Fechar">✕</button></div><div class="am-welcome-body">${photo(0)}<div><span>EDIÇÃO LIMITADA • MELHORES AMIGOS</span><h2>Você é meu<br>plot twist favorito!</h2><p>${E(p.frase)}</p><button data-am-app="fotos">Abrir nossas fotos ↗</button></div></div></div><div class="am-window am-app-window" id="amAppWindow" hidden><div class="am-window-top"><span id="amWindowTitle">PASTA ESPECIAL</span><button type="button" id="amWindowClose" aria-label="Fechar janela">✕</button></div><div id="amWindowBody" class="am-window-content"></div></div>
 <footer class="am-taskbar"><button type="button" id="amStart">★ INICIAR</button><span>NOSSO AMOR OS · ORIGINAL BESTIE EDITION</span><time id="amClock">00:00</time></footer></div>`;}

// 04 — FAMÍLIA: livro de mesa, páginas físicas viradas, sem seções empilhadas.
function familia(){const p=S.p;return `<div class="xp x-familia"><div class="fm-shelf-top"><span>ACERVO DE FAMÍLIA • VOLUME I</span><span>UMA HERANÇA DE AFETO</span></div><div class="fm-room"><div class="fm-book" id="fmBook"><div class="fm-book-left"><span>MEMÓRIAS DE FAMÍLIA</span><h1>${E(p.titulo)}</h1><div class="fm-leaf">❦</div><p>O melhor lugar do mundo é onde estamos juntos.</p><small>EDIÇÃO PARTICULAR · ${E(p.de||'Com amor')}</small></div><div class="fm-book-right" id="fmPage"><span class="fm-page-kicker">PÁGINA 01 / 06</span>${cover('fm-cover')}<p>Uma história que passa de geração para geração.</p></div></div><div class="fm-book-controls"><button id="fmPrev" type="button">← Página anterior</button><span id="fmPages">01 / 06</span><button id="fmNext" type="button">Próxima página →</button></div></div><span class="fm-floor-mark">O LIVRO DA NOSSA VIDA · FEITO PARA SER FOLHEADO</span></div>`;}

// 05 — ANIVERSÁRIO: festa explorável com bolo central + presentes surpresa.
function aniversario(){const p=S.p;return `<div class="xp x-aniversario"><div class="bd-stars" aria-hidden="true"></div><div class="bd-confetti" id="confetti"></div><div class="bd-header"><span>THE BIRTHDAY CLUB ✳</span><span>ESPECIAL PARA ${cleanLabel(p.para||'VOCÊ',26)}</span></div><div class="bd-room"><div class="bd-title"><span>✨ ESTE É O SEU DIA ✨</span><h1>MAKE A <i>WISH!</i></h1><p>${E(p.titulo)}</p></div><div class="bd-cake-zone"><div class="bd-cake" id="birthdayCake"><div class="bd-candles">${Array.from({length:5},(_,i)=>`<button type="button" data-candle="${i}" aria-label="Apagar vela ${i+1}" class="bd-candle"><i></i><b></b></button>`).join('')}</div><div class="bd-cake-top"></div><div class="bd-cake-mid"></div><div class="bd-cake-bottom"></div><div class="bd-cake-stand"></div></div><p id="candleMessage">Apague as 5 velinhas para realizar um desejo ✨</p><button type="button" id="bdRelight">↻ Acender novamente</button></div><div class="bd-gifts"><span>ABRA OS PRESENTES ↓</span><div class="bd-gift-buttons">${[['foto','FOTOS'],['carta','CARTA'],['tempo','O TEMPO'],['memorias','MEMÓRIAS'],['video','VÍDEO'],['musica','MÚSICA']].map(([id,label],i)=>`<button type="button" data-bd-gift="${id}" style="--i:${i}"><span class="gift-ribbon"></span><b>✦</b><small>${label}</small></button>`).join('')}</div></div></div><div class="bd-panel" id="bdPanel" hidden><button type="button" id="bdPanelClose" class="bd-panel-close">✕ Fechar</button><div id="bdPanelBody"></div></div></div>`;}

// 06 — CARTA ANTIGA: objetos sobre mesa, escolha livre do destinatário.
function cartaAntiga(){const p=S.p;return `<div class="xp x-carta"><div class="ca-noise"></div><div class="ca-topline"><span>CORRESPONDÊNCIA PARTICULAR · 001</span><span>SELO · NOSSO AMOR</span></div><div class="ca-desk"><div class="ca-title"><span>ARQUIVO PARTICULAR / EST. ${E(String(p.inicio||'2022').slice(0,4))}</span><h1>Há palavras<br>que o tempo<br><em>não apaga.</em></h1><p>${E(p.titulo)}</p></div><button type="button" class="ca-object ca-envelope" data-ca-open="letter"><span class="ca-object-caption">01 · A CARTA</span><span class="ca-envelope-art"><i></i><b>✦</b></span></button><button type="button" class="ca-object ca-photos" data-ca-open="album"><span class="ca-object-caption">02 · RETRATOS</span>${still(0)}</button><button type="button" class="ca-object ca-diary" data-ca-open="diary"><span class="ca-object-caption">03 · DIÁRIO</span><strong>MON<br>HISTOIRE</strong><small>EST. ${E(String(p.inicio||'2022').slice(0,4))}</small></button><button type="button" class="ca-object ca-gramophone" data-ca-open="music"><span class="ca-object-caption">04 · MELODIAS</span><span>♫</span></button><button type="button" class="ca-object ca-reel" data-ca-open="film"><span class="ca-object-caption">05 · FILME</span><span>◉</span></button><button type="button" class="ca-object ca-watch" data-ca-open="time"><span class="ca-object-caption">06 · TEMPO</span><span>◷</span></button><div class="ca-side-message">ESCOLHA UM OBJETO PARA DESCOBRIR SUA HISTÓRIA ↗</div></div><dialog id="caDialog" class="ca-dialog"><button type="button" data-ca-close aria-label="Fechar">✕</button><div id="caDialogBody"></div></dialog></div>`;}

// 07 — SCRAPBOOK: ateliê físico de colagens navegável por páginas.
function scrapbook(){const p=S.p;return `<div class="xp x-scrap"><div class="sc-top"><span>THE MESSY MEMORY CLUB ✂</span><span>COLAGENS & COISAS BONITAS</span></div><div class="sc-worktop"><div class="sc-tape sc-tape-1"></div><div class="sc-tape sc-tape-2"></div><div class="sc-book"><div class="sc-spiral" aria-hidden="true">${Array.from({length:12},()=>'<i></i>').join('')}</div><div class="sc-spread" id="scSpread"><div class="sc-front-cover"><small>UMA HISTÓRIA FEITA À MÃO</small><h1>${E(p.titulo)}</h1>${photo(0)}<p>${E(p.frase)}</p><span>✳ COLECIONE INSTANTES, NÃO COISAS</span></div></div></div><div class="sc-tools"><div><button type="button" id="scPrev">←</button><span id="scPage">CAPA / 05</span><button type="button" id="scNext">→</button></div><span>VIRE AS PÁGINAS · ARRASTE OS ADESIVOS</span><div class="sc-stickers"><span class="sc-sticker" data-drag>LOVE ♡</span><span class="sc-sticker" data-drag>✿</span><span class="sc-sticker" data-drag>100% REAL</span></div></div></div></div>`;}

// 08 — JARDIM: mapa de exploração não-linear com clareira acessível após abrir portal.
function jardim(){const p=S.p;return `<div class="xp x-jardim"><div class="gd-sky"></div><div class="gd-leaves" aria-hidden="true">❦ ✿ ❧</div><div class="gd-gate" id="gdGate"><div class="gd-gate-panel gd-gate-left"></div><div class="gd-gate-panel gd-gate-right"></div><div class="gd-gate-front"><span>UM CONVITE PARA ENTRAR</span><h1>O nosso<br><i>jardim secreto.</i></h1><p>${E(p.titulo)}</p><button type="button" id="gdEnter">Destrancar o portão ✣</button></div></div><div class="gd-garden" id="gdGarden" hidden><div class="gd-garden-header"><span>THE SECRET GARDEN / NOSSO AMOR</span><button type="button" id="gdReturn">↶ VOLTAR AO PORTÃO</button></div><h2>Escolha um caminho.<br><i>Descubra uma memória.</i></h2><div class="gd-paths"><div class="gd-path" aria-hidden="true"></div>${[['semente','A semente','✿'],['raizes','As raízes','❦'],['flores','As flores','❁'],['cartinha','Uma carta','✉'],['laguinho','O lago','◈'],['passaros','A canção','♫']].map(([id,t,ico],i)=>`<button class="gd-stop" type="button" data-gd-place="${id}" style="--i:${i}"><span>${ico}</span><b>${t}</b></button>`).join('')}</div><div class="gd-bloom"><button type="button" data-bloom>✿ <span id="gdBloom">Cultive 5 carinhos · 0/5</span></button></div></div><div class="gd-overlay" id="gdOverlay" hidden><button id="gdClose" aria-label="Voltar ao jardim">← Voltar ao jardim</button><div id="gdOverlayBody"></div></div></div>`;}

// 09 — CINEMA: lobby → sala de exibição → créditos finais.
function cinema(){const p=S.p;return `<div class="xp x-cinema"><div class="cn-lobby" id="cnLobby"><div class="cn-lights"></div><div class="cn-lobby-head">✦ THE PRIVATE PICTURE HOUSE ✦ <span>ESTREIA EXCLUSIVA</span></div><div class="cn-marquee"><span>AGORA EM CARTAZ</span><h1>${E(p.titulo)}</h1><p>${E(p.frase)}</p><div class="cn-marquee-bulbs" aria-hidden="true"></div></div><div class="cn-ticket"><div><small>ADMIT ONE · NOSSO AMOR</small><strong>${cleanLabel(p.para||'VOCÊ',26)}</strong><span>SESSÃO PARTICULAR</span></div><button type="button" id="cnEnter">DESTACAR INGRESSO →</button></div><p class="cn-hint">Um filme que só existe porque você faz parte dele.</p></div><div class="cn-theater" id="cnTheater" hidden><div class="cn-curtains" id="cnCurtains"><i></i><i></i></div><div class="cn-theater-top"><span>◉ PROJETOR • SALA 01</span><span id="cnSceneNo">CENA 01 / 06</span><button type="button" id="cnExit">✕ Sair da sessão</button></div><div class="cn-screen"><div id="cnProjection">${photo(0)}</div></div><div class="cn-theater-controls"><button type="button" id="cnPrev" aria-label="Cena anterior">← Anterior</button><span>FIM DA SESSÃO? NUNCA.</span><button type="button" id="cnNext" aria-label="Cena seguinte">Próxima →</button></div></div></div>`;}

// 10 — STREAMING: catálogo e episódios em aplicativo, modal para assistir.
function netflix(){const p=S.p;return `<div class="xp x-stream"><div class="nf-top"><strong>N<span>+</span></strong><nav><button type="button" data-nf-section="home" aria-pressed="true">Início</button><button type="button" data-nf-section="episodes">Episódios</button><button type="button" data-nf-section="extras">Extras</button></nav><span>PERFIL • ${cleanLabel(p.para||'VOCÊ',22)}</span></div><div class="nf-profile-screen" id="nfProfile"><h2>Quem está assistindo?</h2><button type="button" id="nfEnter"><span>${still(0)}</span><b>${cleanLabel(p.para||'Você',28)}</b></button><p>Uma série feita exclusivamente para você.</p></div><div id="nfContent" class="nf-content" hidden><div class="nf-hero"><div class="nf-background">${cover()}</div><div class="nf-hero-copy"><span>✦ ORIGINAL · N+ SERIES</span><h1>${E(p.titulo)}</h1><p>${E(p.frase)}</p><div><button type="button" data-nf-watch="0" class="nf-primary">▶ Assistir episódio 1</button><button type="button" data-nf-section="extras">ⓘ Mais informações</button></div></div></div><div class="nf-library" id="nfLibrary"></div></div><div class="nf-watch" id="nfWatch" hidden><button type="button" id="nfBack">← Voltar à série</button><div class="nf-watch-content" id="nfPlayer"></div><div class="nf-episode-nav"><button type="button" id="nfPrev">← Anterior</button><span id="nfEpisodeIndex"></span><button type="button" id="nfNext">Próximo →</button></div></div></div>`;}

// 11 — PLAYLIST: aplicativo single-page com faixa selecionável e modos de escuta.
function spotify(){const p=S.p;return `<div class="xp x-spotify"><aside class="sp-sidebar"><div class="sp-logo">◉ <b>NOSSO.SOM</b></div><div class="sp-nav"><button type="button" data-sp-mode="tracks" aria-pressed="true">⌂ &nbsp; Sua playlist</button><button type="button" data-sp-mode="album">▦ &nbsp; Álbum visual</button><button type="button" data-sp-mode="lyrics">☷ &nbsp; Letras secretas</button><button type="button" data-sp-mode="backstage">◇ &nbsp; Bastidores</button></div><div class="sp-sidebar-bottom"><span>✳ EDIÇÃO PARA ${cleanLabel(p.para||'VOCÊ',22)}</span></div></aside><div class="sp-main"><div class="sp-head"><span>PLAYLIST EXCLUSIVA · VOL. 001</span><button type="button" data-share>↗ Compartilhar</button></div><div class="sp-art"><div class="sp-art-photo">${cover()}</div><div><span>✦ ORIGINAL PLAYLIST</span><h1>${E(p.titulo)}</h1><p>${E(p.frase)}</p><small>CRIADA POR ${cleanLabel(p.de||'ALGUÉM ESPECIAL',32)}</small></div></div><div class="sp-view" id="spView"></div></div><footer class="sp-player"><div class="sp-player-cover">${still(0)}</div><div class="sp-current"><strong id="spSongTitle">${cleanLabel(S.p.musicaNome||'Nossa trilha sonora',52)}</strong><small id="spSongSub">${cleanLabel(S.p.musicaArtista||'Um som inesquecível',52)}</small></div><div class="sp-controls"><button type="button" id="spPrev" aria-label="Faixa anterior">⏮</button><button type="button" data-play aria-label="Tocar música" ${S.music?'':'disabled'}>▶</button><button type="button" id="spNext" aria-label="Próxima faixa">⏭</button></div><div class="sp-wave" aria-hidden="true">${Array.from({length:25},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></footer></div>`;}

// 12 — VINIL: interação física sobre deck, encarte e lado A/B.
function vinil(){const p=S.p;return `<div class="xp x-vinil"><div class="vl-sign"><span>THE ANALOG LOVE RECORDS</span><span>ONE OF ONE · 33⅓ RPM</span></div><div class="vl-room"><div class="vl-desk"><div class="vl-disc"><div class="vl-rings"></div><div class="vl-sticker">${cover()}</div></div><div class="vl-arm" id="vlArm"><i></i></div><div class="vl-deck-badge">OUR STORY HI-FI</div><div class="vl-deck-actions"><button type="button" id="vlStart" ${S.music?'':'disabled'}>${S.music?'▶ PLAY RECORD':'♫ SEM ÁUDIO'}</button><button type="button" id="vlFlip">↻ VIRAR DISCO</button></div></div><div class="vl-collection"><span>PRIVATE PRESSING N°001</span><div class="vl-sleeve">${cover()}<div><strong>${E(p.titulo)}</strong><small>${cleanLabel(p.de||'FEITO COM AMOR',30)} · PARA ${cleanLabel(p.para||'VOCÊ',26)}</small></div></div><div class="vl-side-indicator"><span id="vlSideLabel">SIDE A / O COMEÇO</span><button id="vlSleeve" type="button">Abrir encarte ↗</button></div><div class="vl-tracks" id="vlTracks">${history()}</div></div></div><div class="vl-insert" id="vlInsert" hidden><div class="vl-insert-head"><span>O ENCARTE · EDIÇÃO LIMITADA</span><button id="vlInsertClose" type="button">✕ Fechar</button></div><div class="vl-insert-content">${grid('vl-insert-pics',6)}<div>${note()}${film()}${counter()}</div></div></div></div>`;}

// 13 — RETRÔ: console com TV CRT, controle remoto e canais variados.
function retro(){const p=S.p;return `<div class="xp x-retro"><div class="rt-grid"></div><div class="rt-header"><span>LOVE • SYSTEM 198X</span><span>NO SIGNAL? NEVER!</span></div><div class="rt-title"><h1>PRESS <i>PLAY.</i></h1><p>${E(p.titulo)}</p></div><div class="rt-room"><div class="rt-tv"><div class="rt-tv-shell"><div class="rt-tv-screen" id="rtScreen"><div class="rt-scan"></div><div class="rt-screen-inner" id="rtContent">${photo(0)}</div><span class="rt-rec">● REC · SP</span><span class="rt-ch" id="rtChannel">CH 01</span></div><div class="rt-tv-brand">NOSTALGIA•VISION　▰▰</div></div><div class="rt-cassette"><small>TYPE II / AUDIO CASSETTE</small><strong>THE BEST OF US</strong><div class="rt-reels"><i></i><i></i></div></div></div><div class="rt-remote"><span>REMOTE CONTROL • N° 001</span><div class="rt-remote-dpad"><button id="rtPrev" type="button">◀◀<small>REW</small></button><button id="rtNext" type="button">▶▶<small>FF</small></button></div><div class="rt-remote-grid">${[['mem','01 / FOTO'],['story','02 / HISTÓRIA'],['letter','03 / CARTA'],['timer','04 / TEMPO'],['video','05 / VÍDEO'],['music','06 / MÚSICA']].map(([id,label],i)=>`<button type="button" data-rt-channel="${id}" aria-pressed="${i===0}">${label}</button>`).join('')}</div><div class="rt-play"><button type="button" data-play ${S.music?'':'disabled'}>▶ PLAY TAPE</button><button type="button" data-share>↗ SHARE</button></div></div></div><div class="rt-footer">© 198X · OUR STORY FOREVER · REWIND YOUR MEMORIES</div></div>`;}

const renderers={namoro,casamento,amizade,familia,aniversario,'carta-antiga':cartaAntiga,scrapbook,jardim,cinema,netflix,spotify,vinil,retro};

const still = (i,cls='') => S.photos.length ? `<img class="${cls}" src="${E(S.photos[i%S.photos.length])}" alt="Fotografia ${i+1}" loading="lazy">` : '<span class="no-photo">♡</span>';
const asideCard=(title,inside)=>`<div class="feature-card"><h2>${E(title)}</h2>${inside}</div>`;
const panels = {
 fotos:()=>asideCard('Nosso arquivo de fotografias',grid('',12)),
 foto:()=>asideCard('Memórias para guardar',grid('',12)),
 album:()=>asideCard('Retratos do passado',grid('',12)),
 chat:()=>asideCard('Mensagem enviada com carinho',`<div class="am-chat"><div class="bubble received">Ei! Tenho uma coisa pra te dizer…</div><div class="bubble sent">${E(S.p.carta||'Você é demais!')}</div><div class="bubble received">AMIZADE PARA SEMPRE ♡</div></div>${reasons()}`),
 carta:()=>asideCard('Algumas palavras para você',note()),
 letter:()=>asideCard('Correspondência reservada',note()),
 cartinha:()=>asideCard('Um bilhete entre flores',note()),
 memorias:()=>asideCard('Nosso arquivo de histórias',history()),
 diary:()=>asideCard('O diário da nossa história',history()),
 raizes:()=>asideCard('Nossa história tem raízes',history()),
 semente:()=>asideCard('Foi assim que tudo começou',`<div class="feature-split">${still(0)}${history()}</div>`),
 flores:()=>asideCard('O jardim das nossas fotografias',grid('',12)),
 tempo:()=>asideCard('O tempo que floresceu entre nós',counter()),
 time:()=>asideCard('O tempo não apaga nada',counter()),
 video:()=>asideCard('Nosso filme',film()),
 tv:()=>asideCard('Nossa própria televisão',film()),
 film:()=>asideCard('Fotogramas em movimento',film()),
 laguinho:()=>asideCard('O lago das lembranças',film()),
 musica:()=>asideCard('A música deste presente',music()),
 music:()=>asideCard('O disco desta história',music()),
 passaros:()=>asideCard('A canção do jardim',music())
};

function renderFeature(key) {return (panels[key]||panels.fotos)();}
function animateReveal(){
 if(REDUCED||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.1});
 document.querySelectorAll('.scene-heading,.feature-card,.xp .history article,.xp .counter>div').forEach(el=>observer.observe(el));
}

// Slide engine (Namoro). Entrada por wheel, setas, botões e swipes.
function bindNamoro(){
 let current=0,busy=false,touch=null;
 const slides=[...document.querySelectorAll('.x-namoro .slide')];
 const set=n=>{
   const next=(n+slides.length)%slides.length;
   if(next===current)return;
   slides[current].classList.remove('active');slides[current].classList.add('exiting');
   const old=current;current=next;
   slides[current].classList.remove('exiting');slides[current].classList.add('active');
   setTimeout(()=>slides[old]?.classList.remove('exiting'),650);
   $('nmAct').textContent=`ATO ${String(current+1).padStart(2,'0')} / 06`;
   document.querySelectorAll('.nm-rail button').forEach((b,i)=>b.setAttribute('aria-current',i===current?'step':'false'));
 };
 $('app').addEventListener('click',e=>{const button=e.target.closest('[data-next],[data-step]');if(!button)return;
   if(button.hasAttribute('data-next'))set(current+1);else set(Number(button.dataset.step));});
 const wheel=e=>{
   if(e.target.closest('.env-body,.lightbox'))return;
   if(Math.abs(e.deltaY)<18||busy)return;
   e.preventDefault();set(current+(e.deltaY>0?1:-1));busy=true;setTimeout(()=>busy=false,Math.max(450,REDUCED?150:760));
 };
 const area=document.querySelector('.x-namoro');
 area.addEventListener('wheel',wheel,{passive:false});
 area.addEventListener('touchstart',e=>{touch={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});
 area.addEventListener('touchend',e=>{if(!touch)return;const dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dy)>65)set(current+(dy<0?1:-1));touch=null;},{passive:true});
 document.addEventListener('keydown',e=>{if($('lightbox').open)return;if(['ArrowDown','PageDown','ArrowRight'].includes(e.key))set(current+1);if(['ArrowUp','PageUp','ArrowLeft'].includes(e.key))set(current-1);});
 let mem=0;
 const change=dir=>{
   const size=Math.max(1,S.events.length);mem=(mem+dir+size)%size;const m=timelineItem(mem);
   $('nmMemoryVisual').innerHTML=photo(mem+1);
   $('nmMemoryText').innerHTML=`<small>${E(m.data||'Uma data')}</small><h3>${E(m.titulo||'Memória')}</h3><p>${E(m.texto||'')}</p>`;
   $('nmMemoryCount').textContent=`${String(mem+1).padStart(2,'0')} / ${String(size).padStart(2,'0')}`;
 };
 document.querySelector('[data-memory-next]')?.addEventListener('click',()=>change(1));
 document.querySelector('[data-memory-prev]')?.addEventListener('click',()=>change(-1));
}

// Editorial navigation; content is only switched upon request, no page-scroll template.
function bindCasamento(){
 const pages=[
 {title:'Nossos votos',sub:'A promessa escrita',html:`<div class="wc-vows"><div><h3>Para sempre<br>é uma escolha.</h3><p>${E(S.p.frase||'Uma promessa.')}</p>${envelope('wc-letter')}</div><div class="wc-rings" aria-hidden="true"><i></i><i></i><span>∞</span></div></div>`},
 {title:'O nosso calendário',sub:'Desde o primeiro dia',html:`<div class="wc-timeline">${history()}${counter()}</div>`},
 {title:'Galeria privada',sub:'Retratos de uma união',html:grid('wc-gallery',8)},
 {title:'A nossa cerimônia',sub:'Luzes, som, sentimentos',html:`<div class="wc-media">${film()}${music()}</div>`},
 {title:'A lista do para sempre',sub:'Aquilo que importa',html:reasons('wc-reasons')}
 ];let page=0;
 const update=n=>{
   page=(n+pages.length)%pages.length;
   const p=pages[page];
   $('wcPageBody').classList.remove('page-in');void $('wcPageBody').offsetWidth;
   $('wcPageBody').innerHTML=p.html;$('wcPageBody').classList.add('page-in');
   $('wcTitle').textContent=p.title;$('wcSub').textContent=p.sub;$('wcPageno').textContent=`PAGE 0${page+1} / 05`;
   document.querySelectorAll('[data-editorial]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.editorial)===page)));
 };
 $('wcOpen').addEventListener('click',()=>{$('wcCover').hidden=true;$('wcEditorial').hidden=false;});
 $('wcClose').addEventListener('click',()=>{$('wcEditorial').hidden=true;$('wcCover').hidden=false;});
 document.querySelectorAll('[data-editorial]').forEach(btn=>btn.addEventListener('click',()=>update(Number(btn.dataset.editorial))));
 $('wcNext').addEventListener('click',()=>update(page+1));
}
function bindAmizade(){
 const modal=$('amAppWindow');
 const titles={fotos:'FOTOS.DIR',chat:'NOSSO_CHAT.TXT',memorias:'HISTORIAS.EXE',tempo:'TEMPO.EXE',tv:'VIDEOS.MP4',music:'NOSSA_PLAYLIST.MP3'};
 const open=k=>{
   modal.hidden=false;modal.classList.remove('am-pop');void modal.offsetWidth;modal.classList.add('am-pop');
   $('amWindowTitle').textContent='★_ '+(titles[k]||'MEMORIAS.EXE');
   $('amWindowBody').innerHTML=renderFeature(k);
   $('amWelcome').hidden=true;
 };
 document.querySelectorAll('[data-am-app]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.amApp)));
 $('amWindowClose').addEventListener('click',()=>{modal.hidden=true;});
 document.querySelector('[data-am-close="welcome"]').addEventListener('click',()=>{$('amWelcome').hidden=true;});
 $('amStart').addEventListener('click',()=>{$('amWelcome').hidden=false;modal.hidden=true;});
 const dt=new Date();$('amClock').textContent=dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
}
function bindFamilia(){
 const p=S.p;
 const pages=[
 `<span class="fm-page-kicker">PÁGINA 01 / 06</span>${cover('fm-cover')}<p>Uma história que passa de geração para geração.</p>`,
 `<span class="fm-page-kicker">PÁGINA 02 / 06 · ORIGENS</span><h2>Nossas raízes.</h2>${counter()}<p>Tem lugares que são feitos de pessoas.</p>`,
 `<span class="fm-page-kicker">PÁGINA 03 / 06 · HISTÓRIAS</span><h2>O que vivemos.</h2>${history('fm-book-history')}`,
 `<span class="fm-page-kicker">PÁGINA 04 / 06 · RETRATOS</span><h2>Retratos de casa.</h2>${grid('fm-book-grid',6)}`,
 `<span class="fm-page-kicker">PÁGINA 05 / 06 · CORRESPONDÊNCIA</span><h2>Coisas que sentimos.</h2>${note('fm-book-note')}`,
 `<span class="fm-page-kicker">PÁGINA 06 / 06 · NOSSOS SONS</span><h2>Uma história viva.</h2>${film('fm-book-video')}${music()}`
 ];let page=0;
 const turn=dir=>{page=(page+dir+pages.length)%pages.length;const root=$('fmPage');root.classList.remove('fm-turn');void root.offsetWidth;root.classList.add('fm-turn');root.innerHTML=pages[page];$('fmPages').textContent=`${String(page+1).padStart(2,'0')} / 06`;};
 $('fmPrev').addEventListener('click',()=>turn(-1));$('fmNext').addEventListener('click',()=>turn(1));
}
function confetti(n=80){const layer=$('confetti');if(!layer||REDUCED)return;for(let i=0;i<n;i++){const el=document.createElement('i');el.style.cssText=`--x:${Math.random()*100}%;--d:${Math.random()*1.3}s;--h:${Math.random()*360};--r:${(Math.random()-.5)*230}px`;layer.appendChild(el);}setTimeout(()=>layer.replaceChildren(),4900);}
function bindAniversario(){
 const candles=[...document.querySelectorAll('[data-candle]')];
 candles.forEach(c=>c.addEventListener('click',()=>{
   if(c.classList.contains('off'))return;
   c.classList.add('off');const remaining=candles.filter(x=>!x.classList.contains('off')).length;
   $('candleMessage').textContent=remaining?`Mais ${remaining} velinha${remaining>1?'s':''} para apagar ✨`:'PEDIDO REALIZADO! FELIZ ANIVERSÁRIO! ✳';
   if(!remaining){$('birthdayCake').classList.add('celebrate');confetti();}
 }));
 $('bdRelight').addEventListener('click',()=>{candles.forEach(c=>c.classList.remove('off'));$('birthdayCake').classList.remove('celebrate');$('candleMessage').textContent='Apague as 5 velinhas para realizar um desejo ✨';});
 document.querySelectorAll('[data-bd-gift]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.bdGift;$('bdPanel').hidden=false;$('bdPanelBody').innerHTML=renderFeature(k);confetti(18);}));
 $('bdPanelClose').addEventListener('click',()=>{$('bdPanel').hidden=true;});
}
function bindCarta(){const d=$('caDialog');document.querySelectorAll('[data-ca-open]').forEach(b=>b.addEventListener('click',()=>{$('caDialogBody').innerHTML=renderFeature(b.dataset.caOpen);if(!d.open)d.showModal();}));document.querySelector('[data-ca-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close();});}
function bindScrap(){
 const pages=[
 `<div class="sc-front-cover"><small>UMA HISTÓRIA FEITA À MÃO</small><h1>${E(S.p.titulo)}</h1>${photo(0)}<p>${E(S.p.frase)}</p><span>✳ COLECIONE INSTANTES, NÃO COISAS</span></div>`,
 `<div class="sc-spread-2"><span class="sc-hand">um começo bonito…</span>${photo(0)}${photo(1)}<div>${counter()}<p>Desde aquele primeiro dia…</p></div></div>`,
 `<div class="sc-spread-3"><h2>As histórias que a gente conta mil vezes</h2>${history()}</div>`,
 `<div class="sc-spread-4"><span class="sc-hand">lembra disso?</span>${grid('sc-chaos',6)}</div>`,
 `<div class="sc-spread-5"><h2>Uma carta colada aqui</h2>${note()}${reasons()}</div>`,
 `<div class="sc-spread-6"><h2>O nosso próprio clipe ♡</h2>${film()}${music()}</div>`
 ];let page=0;
 const set=d=>{page=(page+d+pages.length)%pages.length;const root=$('scSpread');root.classList.remove('sc-flip');void root.offsetWidth;root.classList.add('sc-flip');root.innerHTML=pages[page];$('scPage').textContent=page===0?'CAPA / 05':`PÁGINA 0${page} / 05`;};
 $('scPrev').addEventListener('click',()=>set(-1));$('scNext').addEventListener('click',()=>set(1));
 document.querySelectorAll('[data-drag]').forEach(el=>{
   let start;el.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY,Number(el.dataset.x||0),Number(el.dataset.y||0)];el.setPointerCapture(e.pointerId);el.classList.add('dragging');});
   el.addEventListener('pointermove',e=>{if(!start)return;const x=Math.max(-140,Math.min(140,start[2]+e.clientX-start[0]));const y=Math.max(-90,Math.min(90,start[3]+e.clientY-start[1]));el.dataset.x=x;el.dataset.y=y;el.style.setProperty('--dx',x+'px');el.style.setProperty('--dy',y+'px');});
   const stop=()=>{start=null;el.classList.remove('dragging');};el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
 });
}
function bindJardim(){
 $('gdEnter').addEventListener('click',()=>{$('gdGate').classList.add('opened');$('gdGarden').hidden=false;});
 $('gdReturn').addEventListener('click',()=>{$('gdGate').classList.remove('opened');$('gdGarden').hidden=true;});
 document.querySelectorAll('[data-gd-place]').forEach(btn=>btn.addEventListener('click',()=>{$('gdOverlay').hidden=false;$('gdOverlayBody').innerHTML=renderFeature(btn.dataset.gdPlace);}));
 $('gdClose').addEventListener('click',()=>{$('gdOverlay').hidden=true;});
 let blooms=0;document.querySelector('[data-bloom]').addEventListener('click',()=>{blooms=Math.min(5,blooms+1);$('gdBloom').textContent=blooms===5?'NOSSO JARDIM FLORESCEU ✿':`Cultive 5 carinhos · ${blooms}/5`;$('gdGarden').style.setProperty('--grow',blooms/5);});
}
function bindCinema(){
 let current=0;const rooms=[
 ()=>`<div class="cn-feature"><div>${photo(0)}</div><article><span>ABERTURA · O PRIMEIRO ENCONTRO</span><h2>${E(S.p.titulo)}</h2><p>${E(S.p.frase)}</p></article></div>`,
 ()=>`<div class="cn-feature"><div>${photo(1)}</div><article><span>FLASHBACK · O TEMPO</span><h2>O tempo corre, mas a memória fica.</h2>${counter()}</article></div>`,
 ()=>`<div class="cn-feature"><div>${photo(2)}</div><article><span>O ROTEIRO DA VIDA</span>${history()}</article></div>`,
 ()=>`<div class="cn-feature"><div>${grid('cn-photostrip',6)}</div><article><span>CENAS DE BASTIDORES</span><h2>Cada fotograma é um universo.</h2>${reasons()}</article></div>`,
 ()=>`<div class="cn-feature"><div>${film()}</div><article><span>EXIBIÇÃO ESPECIAL</span><h2>A nossa cena em movimento.</h2>${music()}</article></div>`,
 ()=>`<div class="cn-feature cn-credits"><div><span>THE END? NEVER.</span><h2>O melhor filme<br>não tem fim.</h2></div><article>${note()}<button type="button" data-cn-restart>Assistir novamente ↻</button>${shareMarkup()}</article></div>`
 ];
 const set=n=>{current=(n+rooms.length)%rooms.length;$('cnProjection').innerHTML=rooms[current]();$('cnSceneNo').textContent=`CENA ${String(current+1).padStart(2,'0')} / 06`;};
 $('cnEnter').addEventListener('click',()=>{$('cnLobby').hidden=true;$('cnTheater').hidden=false;$('cnCurtains').classList.add('open');set(0);});
 $('cnExit').addEventListener('click',()=>{$('cnTheater').hidden=true;$('cnLobby').hidden=false;$('cnCurtains').classList.remove('open');});
 $('cnPrev').addEventListener('click',()=>set(current-1));$('cnNext').addEventListener('click',()=>set(current+1));
 document.querySelector('.x-cinema').addEventListener('click',e=>{if(e.target.closest('[data-cn-restart]'))set(0);});
}
function bindNetflix(){
 let sectionName='home',episode=0;
 const eps=[
 {title:'O episódio piloto',info:S.events[0]?.texto||S.p.frase||'',picture:0},
 {title:'O capítulo que mudou tudo',info:S.events[1]?.texto||'Uma memória favorita.',picture:1},
 {title:'O nosso mundo',info:S.events[2]?.texto||'Uma nova aventura.',picture:2},
 {title:'Cenas deletadas (que mereciam entrar)',info:S.reasons.join(' · ')||S.p.frase,picture:3},
 {title:'A carta que ninguém viu',info:S.p.carta||'Uma declaração importante.',picture:4},
 {title:'A próxima temporada',info:'A melhor parte ainda está por vir.',picture:5}
 ];
 const makeCards=()=>`<div class="nf-episode-row">${eps.map((ep,i)=>`<button type="button" data-nf-watch="${i}" class="nf-card">${still(ep.picture)}<span>EP ${String(i+1).padStart(2,'0')} <b>▶</b></span><strong>${E(ep.title)}</strong></button>`).join('')}</div>`;
 const showSection=name=>{
   sectionName=name;
   document.querySelectorAll('[data-nf-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nfSection===name)));
   const el=$('nfLibrary');
   el.innerHTML=name==='home'?`<h2>Continuar assistindo</h2>${makeCards()}<h2>Extras exclusivos</h2><div class="nf-extras">${counter()}${music()}</div>`:
   name==='episodes'?`<h2>Temporada 01 <small>6 episódios</small></h2>${makeCards()}`:
   `<h2>Bastidores da nossa história</h2><div class="nf-extra-grid">${grid('nf-photo-grid',6)}${note()}${film()}${history()}</div>`;
 };
 const watch=i=>{
   episode=(i+eps.length)%eps.length;
   const ep=eps[episode];$('nfContent').hidden=true;$('nfWatch').hidden=false;
   $('nfPlayer').innerHTML=`<div class="nf-video-surface">${episode===5?film():still(ep.picture)}<span>ORIGINAL N+ · TEMPORADA 01 · EP. ${episode+1}</span></div><div class="nf-player-text"><span>EPISÓDIO ${String(episode+1).padStart(2,'0')}</span><h2>${E(ep.title)}</h2><p>${E(ep.info)}</p>${episode===4?note():''}${episode===5?music():''}</div>`;
   $('nfEpisodeIndex').textContent=`EP. ${String(episode+1).padStart(2,'0')} / 06`;
 };
 $('nfEnter').addEventListener('click',()=>{$('nfProfile').hidden=true;$('nfContent').hidden=false;showSection('home');});
 $('nfBack').addEventListener('click',()=>{$('nfWatch').hidden=true;$('nfContent').hidden=false;showSection(sectionName);});
 $('nfPrev').addEventListener('click',()=>watch(episode-1));$('nfNext').addEventListener('click',()=>watch(episode+1));
 document.querySelector('.x-stream').addEventListener('click',e=>{const s=e.target.closest('[data-nf-section]');const w=e.target.closest('[data-nf-watch]');if(s)showSection(s.dataset.nfSection);if(w)watch(Number(w.dataset.nfWatch));});
}
function bindSpotify(){
 const tracks=[
 {title:S.p.musicaNome||'Nossa trilha sonora',by:S.p.musicaArtista||'A nossa história',desc:S.p.frase||'Um som para nós'},
 ...S.events.map((ev,i)=>({title:ev.titulo||`Memória ${i+1}`,by:ev.data||'Nosso passado',desc:ev.texto||''})),
 {title:'Carta escondida',by:'Palavras do coração',desc:S.p.carta||''},
 {title:'O que vem a seguir',by:'Bônus — nossa história',desc:S.p.rodapeCustom||'O melhor ainda está por vir.'}
 ];let active=0,mode='tracks';
 const select=i=>{active=(i+tracks.length)%tracks.length;const t=tracks[active];$('spSongTitle').textContent=t.title;$('spSongSub').textContent=t.by;document.querySelectorAll('[data-sp-track]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.spTrack)===active)));if(mode==='tracks')$('spNow').textContent=t.desc;};
 const modes={
 tracks:()=>`<div class="sp-list-header"><h2>Faixas desta história</h2><span>${tracks.length} CANÇÕES · SELECIONE UMA FAIXA</span></div><div class="sp-tracks">${tracks.map((t,i)=>`<button type="button" data-sp-track="${i}" aria-pressed="${active===i}"><span>${String(i+1).padStart(2,'0')}</span><span class="sp-track-art">${still(i)}</span><span><strong>${E(t.title)}</strong><small>${E(t.by)}</small></span><span>♡</span></button>`).join('')}</div><div class="sp-story-line"><span>ESTE CAPÍTULO</span><p id="spNow">${E(tracks[active].desc)}</p></div>`,
 album:()=>`<div class="sp-list-header"><h2>Nosso álbum visual</h2><span>FOTOGRAFIAS E LEMBRANÇAS</span></div>${grid('sp-photo-grid',12)}${counter()}`,
 lyrics:()=>`<div class="sp-list-header"><h2>A letra que eu guardo</h2></div>${note('sp-lyrics-note')}${reasons()}`,
 backstage:()=>`<div class="sp-list-header"><h2>Nosso backstage</h2></div>${film()}${history()}`
 };
 const setMode=m=>{mode=m;$('spView').innerHTML=modes[m]();document.querySelectorAll('[data-sp-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.spMode===m)));};
 document.querySelectorAll('[data-sp-mode]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.spMode)));
 document.querySelector('.x-spotify').addEventListener('click',e=>{const b=e.target.closest('[data-sp-track]');if(b)select(Number(b.dataset.spTrack));});
 $('spPrev').addEventListener('click',()=>select(active-1));$('spNext').addEventListener('click',()=>select(active+1));setMode('tracks');
}
function bindVinil(){
 let side='A';
 const update=()=>{
   const page=$('vlTracks');
   page.innerHTML=side==='A'?history():`<div class="vl-sideb">${reasons()}${music()}${counter()}</div>`;
   $('vlSideLabel').textContent=side==='A'?'SIDE A / O COMEÇO':'SIDE B / O QUE VEM DEPOIS';
   document.querySelector('.vl-disc').classList.toggle('flipped',side==='B');
 };
 $('vlFlip').addEventListener('click',()=>{side=side==='A'?'B':'A';update();});
 $('vlSleeve').addEventListener('click',()=>{$('vlInsert').hidden=false;});
 $('vlInsertClose').addEventListener('click',()=>{$('vlInsert').hidden=true;});
 $('vlStart').addEventListener('click',toggleMusic);
}
function bindRetro(){
 const channels=['mem','story','letter','timer','video','music'];let n=0;
 const views={
 mem:()=>`<div class="rt-screen-pic">${photo(activeFrame)}</div><span class="rt-screen-legend">FRAME ${String(activeFrame+1).padStart(2,'0')} / ${String(Math.max(1,S.photos.length)).padStart(2,'0')}</span>`,
 story:()=>`<div class="rt-screen-prose"><small>DEAR DIARY</small>${history()}</div>`,
 letter:()=>`<div class="rt-screen-prose"><small>SECRET MESSAGE.TXT</small>${note()}</div>`,
 timer:()=>`<div class="rt-screen-prose"><small>TIME MACHINE · 198X</small>${counter()}</div>`,
 video:()=>`<div class="rt-screen-video">${film()}</div>`,
 music:()=>`<div class="rt-screen-prose"><small>TAPE MUSIC SELECT</small>${music()}${reasons()}</div>`
 };
 const change=key=>{n=channels.indexOf(key);if(n<0)n=0;$('rtContent').innerHTML=views[channels[n]]();$('rtChannel').textContent='CH '+String(n+1).padStart(2,'0');document.querySelectorAll('[data-rt-channel]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.rtChannel===channels[n])));};
 document.querySelectorAll('[data-rt-channel]').forEach(btn=>btn.addEventListener('click',()=>change(btn.dataset.rtChannel)));
 $('rtPrev').addEventListener('click',()=>{if(n===0){activeFrame=(activeFrame-1+Math.max(1,S.photos.length))%Math.max(1,S.photos.length);change('mem');}else change(channels[(n+channels.length-1)%channels.length]);});
 $('rtNext').addEventListener('click',()=>{if(n===0){activeFrame=(activeFrame+1)%Math.max(1,S.photos.length);change('mem');}else change(channels[(n+1)%channels.length]);});
}

const binders={namoro:bindNamoro,casamento:bindCasamento,amizade:bindAmizade,familia:bindFamilia,aniversario:bindAniversario,'carta-antiga':bindCarta,scrapbook:bindScrap,jardim:bindJardim,cinema:bindCinema,netflix:bindNetflix,spotify:bindSpotify,vinil:bindVinil,retro:bindRetro};
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2700);}
async function share(){try {if(navigator.share)await navigator.share({title:document.title,url:location.href});else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(location.href);toast('Link copiado! ♡');}else prompt('Copie o link:',location.href);}catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar.');}}
function photoModal(index){if(!S.photos.length)return;photoI=(index+S.photos.length)%S.photos.length;$('lbImg').src=S.photos[photoI];$('lbCaption').textContent=S.p.legendas?.[photoI]||'';if(!$('lightbox').open)$('lightbox').showModal();}
function toggleMusic(){if(!audio)return;if(audio.paused)audio.play().catch(()=>toast('Toque novamente para permitir o áudio.'));else audio.pause();}
function bindGlobal(){
 $('utilShare').addEventListener('click',share);
 $('utilSound').addEventListener('click',toggleMusic);
 $('lbClose').addEventListener('click',()=>$('lightbox').close());
 $('lbPrev').addEventListener('click',()=>photoModal(photoI-1));$('lbNext').addEventListener('click',()=>photoModal(photoI+1));
 $('lightbox').addEventListener('click',e=>{if(e.target===$('lightbox'))$('lightbox').close();});
 document.addEventListener('keydown',e=>{if(!$('lightbox').open)return;if(e.key==='ArrowLeft')photoModal(photoI-1);if(e.key==='ArrowRight')photoModal(photoI+1);});
 // Delegação: funciona também em páginas virtuais, modais e cenas montadas dinamicamente.
 $('app').addEventListener('click',e=>{
   const photoBtn=e.target.closest('[data-photo]');if(photoBtn){photoModal(Number(photoBtn.dataset.photo));return;}
   if(e.target.closest('[data-share]')){share();return;}
   if(e.target.closest('[data-play]')){toggleMusic();return;}
   const open=e.target.closest('[data-envelope]');if(open){
     const root=open.closest('[data-envelope-root]');const yes=!root.classList.contains('opened');root.classList.toggle('opened',yes);
     const body=root.querySelector('.env-body');body.hidden=!yes;open.setAttribute('aria-expanded',String(yes));
     root.querySelector('.env-hint').textContent=yes?'UMA CARTA ABERTA COM AMOR':'TOQUE PARA ABRIR A CARTA';return;
   }
   const v=e.target.closest('[data-video]');if(v){const host=v.closest('.film');const playing=host.querySelector('video');if(!playing)return;playing.pause();playing.src=S.videos[Number(v.dataset.video)]||S.videos[0];playing.load();host.querySelectorAll('[data-video]').forEach(x=>x.classList.toggle('selected',x===v));}
 });
 document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO'){if(audio&&!audio.paused)audio.pause();document.querySelectorAll('video').forEach(v=>{if(v!==e.target&&!v.paused)v.pause();});}if(e.target.tagName==='AUDIO')document.querySelectorAll('video').forEach(v=>v.pause());},true);
}
function bindAudio(){
 if(!S.music)return;
 audio=new Audio(S.music);audio.preload='none';audio.loop=true;
 const sync=()=>{
   document.querySelectorAll('[data-play]').forEach(b=>{b.classList.toggle('playing',!audio.paused);b.setAttribute('aria-label',audio.paused?'Tocar música':'Pausar música');if(b.textContent.trim()==='▶'||b.textContent.trim()==='Ⅱ')b.textContent=audio.paused?'▶':'Ⅱ';});
   $('utilSound').textContent=audio.paused?'♫':'Ⅱ';$('utilSound').classList.toggle('playing',!audio.paused);
   document.querySelector('.x-vinil .vl-disc')?.classList.toggle('spinning',!audio.paused);
   document.querySelector('.x-vinil .vl-arm')?.classList.toggle('playing',!audio.paused);
   document.querySelector('.x-spotify')?.classList.toggle('music-playing',!audio.paused);
 };
 audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
 $('utilSound').hidden=false;
 if(S.p.autoplay&&!DEMO)audio.play().catch(()=>{});
}
async function getPurchase(id){
 const token=query.get('token');
 const endpoint=token?'/api/shared/'+encodeURIComponent(token):'/api/purchases/'+encodeURIComponent(id);
 const r=await fetch(endpoint,{credentials:'include',headers:{Accept:'application/json'}});
 const body=await r.json();
 if(!r.ok||!body.ok)throw new Error(body?.error?.message||'Não foi possível consultar o presente.');
 const remote=body.data?.purchase;
 if(remote?.content_version!==1&&!token)throw new Error('Este presente antigo precisa ser sincronizado pelo criador antes do compartilhamento.');
 return remote;
}
function fail(err){console.error('[Nosso Amor / experiências]',err);$('loading').hidden=true;$('error').hidden=false;$('error').innerHTML=`<span>✦</span><h1>Não conseguimos abrir sua surpresa.</h1><p>${E(err.message||String(err))}</p><a href="home.html">Voltar ao início ↗</a>`;}
async function init(){
 try{
  if(!DEMO&&window.NA_CONFIG_READY)await window.NA_CONFIG_READY.catch(()=>null);
  const requested=canonical(query.get('tema')||'namoro');
  if(DEMO&&!renderers[requested])throw new Error('Tema de demonstração desconhecido.');
  const id=query.get('id');if(!DEMO&&!id&&!query.get('token'))throw new Error('Informe o identificador do presente no endereço (?id=).');
  const p=DEMO?demoPurchase(requested):await getPurchase(id);
  if(!p)throw new Error('Presente não encontrado. O conteúdo local pode estar em outro navegador.');
  if(!DEMO&&!['paid','pago'].includes(String(p.status||'').toLowerCase()))throw new Error('O presente ainda não está liberado para visualização.');
  const key=DEMO?requested:canonical(p.tema);if(!renderers[key])throw new Error('Esse tema ainda não está disponível neste visualizador.');
  S=normalize(p,key);document.body.dataset.theme=key;
  document.title=`${p.titulo||themeMeta[key][0]} — Para ${p.para||'você'}`;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
  // Modelos recebidos usam arquivos próprios. Os demais usam os renderizadores existentes.
  if(window.NA_THEME_FILES?.[key]){
    // A página do usuário é exibida INTEGRALMENTE, com o CSS original.
    // Iframe da mesma origem impede que o CSS dos outros temas interfira.
    document.body.classList.add('na-theme-fullscreen');
    const frame=document.createElement('iframe');
    frame.id='naThemeFrame';frame.title=themeMeta[key][0]+' — Nosso Amor';
    frame.src=window.NA_THEME_FILES[key]+'?'+(DEMO?'demo=1&':'')+(EMBED?'embed=1':'visualizacao=1');
    frame.setAttribute('allow',key==='aniversario'?'autoplay; microphone':'autoplay');
    frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;height:100dvh;border:0;display:block;background:#0a0508;z-index:999;';
    $('app').replaceChildren(frame);
    $('app').hidden=false;$('loading').hidden=true;$('utility').hidden=true;
    document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
    const gift={p:S.p,photos:S.photos,videos:S.videos,music:S.music,cover:S.cover,events:S.events,reasons:S.reasons};
    const send=()=>frame.contentWindow?.postMessage({type:key==='namoro'?'NOSSO_AMOR_NAMORO_DATA':'NOSSO_AMOR_THEME_DATA',payload:gift},location.origin === 'null' ? '*' : location.origin);
    const onReady=(e)=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&['NOSSO_AMOR_NAMORO_READY','NOSSO_AMOR_THEME_READY'].includes(e.data?.type))send();};
    window.addEventListener('message',onReady);
    frame.addEventListener('load',send);
    // Exibir a referência exatamente como enviada no modo demo.
    // Nenhuma mensagem de dados sobrescreve fotos/textos de demonstração.
    if(DEMO){window.removeEventListener('message',onReady);frame.removeEventListener('load',send);}
    return;
  }
  $('app').innerHTML=renderers[key]();
  $('app').hidden=false;$('loading').hidden=true;
  $('utility').hidden=EMBED;bindGlobal();bindAudio();binders[key]();animateReveal();
  if(!REDUCED)requestAnimationFrame(()=>document.body.classList.add('ready'));else document.body.classList.add('ready');
 }catch(e){fail(e);}
}
window.addEventListener('pagehide',()=>{audio?.pause();disposables.forEach(u=>URL.revokeObjectURL(u));});
init();
})();
