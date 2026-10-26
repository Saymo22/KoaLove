<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
@include('partials.seo')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500;600&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet">



    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/aniversario.css","resources/js/entries/themes-aniversario.js"])
</head>
<body>
    @include('partials.noscript')

<!-- LOADER -->
<div id="loader">
  <div class="loader-cake">
    <svg viewBox="0 0 100 100">
      <rect x="20" y="55" width="60" height="30" rx="4" fill="#ff2d8a"/>
      <rect x="20" y="55" width="60" height="8" rx="4" fill="#ff7ab5"/>
      <rect x="28" y="35" width="44" height="24" rx="3" fill="#a855f7"/>
      <rect x="28" y="35" width="44" height="6" rx="3" fill="#c084fc"/>
      <rect x="42" y="18" width="2" height="18" fill="#ffd166"/>
      <ellipse class="lc-flame" cx="43" cy="15" rx="3" ry="5" fill="#ffd166"/>
    </svg>
  </div>
  <div class="loader-text">Preparando sua festa</div>
</div>

<!-- BG -->
<div class="bg-mesh"></div>
<div class="balloons-bg" id="balloonsBg"></div>
<div class="grain"></div>
<div class="scroll-bar" id="scrollBar"></div>
<div class="cursor-dot" id="cDot"></div>
<div class="cursor-ring" id="cRing"></div>

<!-- ================= HERO ================= -->
<section class="hero" id="inicio">
  <div class="hero-grid">
    <div class="hero-text">
      <div class="hero-badge">
        <span class="dot"></span>
        Dia especial
      </div>
      <p class="hero-pretitle">Parabéns,</p>
      <h1 class="hero-title">
        <span>Seu Nome</span>
        <em>feliz aniversário!</em>
      </h1>
      <div class="hero-age">
        <span class="num" id="heroAgeNum">25</span>
        <span class="label">anos</span>
      </div>
      <p class="hero-lede">Hoje o dia é <strong>inteirinho seu</strong>. E eu fiz questão de preparar algo que nenhum cartão seria capaz de traduzir.</p>
      <div class="hero-cta">
        <button class="btn-primary" data-na-scroll="bolo">Ver o bolo 🎂</button>
        <button class="btn-ghost" data-na-scroll="carta">Ler carta</button>
      </div>
    </div>

    <div class="hero-photo-wrap">
      <div class="hero-photo">
        <!-- TROQUE PELA FOTO DO ANIVERSARIANTE -->
        <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=85&auto=format&fit=crop" alt="Aniversariante">
        <div class="hero-photo-badge">
          <div>
            <div id="badgeAge">25</div>
            <span>anos</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="scroll-cue">
    <span>Role</span>
    <div class="arrow"></div>
  </div>
</section>

<!-- ================= CAKE ================= -->
<section class="cake-sec" id="bolo">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">O momento</span>
      <h2 class="title">Apague as <em>velas</em></h2>
      <p class="sub">Clique em cada chama — ou use o microfone para assoprar de verdade. Faça um pedido.</p>
    </div>

    <div class="cake-stage" data-reveal data-d="1">
      <div class="cake-svg-wrap">
        <svg class="cake-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3a1a5c"/>
              <stop offset="100%" stop-color="#1a0b2e"/>
            </linearGradient>
            <linearGradient id="tier1Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ff5fa2"/>
              <stop offset="50%" stop-color="#ff2d8a"/>
              <stop offset="100%" stop-color="#c91c6b"/>
            </linearGradient>
            <linearGradient id="tier2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c084fc"/>
              <stop offset="50%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#7c3aed"/>
            </linearGradient>
            <linearGradient id="tier3Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7ee7ce"/>
              <stop offset="50%" stop-color="#4ff0c5"/>
              <stop offset="100%" stop-color="#2ab89b"/>
            </linearGradient>
            <linearGradient id="frostingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff5fb"/>
              <stop offset="100%" stop-color="#ffd4e8"/>
            </linearGradient>
            <radialGradient id="flameGlow">
              <stop offset="0%" stop-color="#ffe066" stop-opacity="1"/>
              <stop offset="70%" stop-color="#ffb300" stop-opacity=".6"/>
              <stop offset="100%" stop-color="#ff6b00" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="candleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#fff5fb"/>
              <stop offset="50%" stop-color="#ffd4e8"/>
              <stop offset="100%" stop-color="#f5b8d4"/>
            </linearGradient>
          </defs>

          <!-- Plate -->
          <ellipse cx="200" cy="360" rx="180" ry="18" fill="url(#plateGrad)" opacity=".8"/>
          <ellipse cx="200" cy="355" rx="160" ry="12" fill="#2a1342"/>

          <!-- Tier 1 (bottom) -->
          <rect x="80" y="280" width="240" height="75" rx="8" fill="url(#tier1Grad)"/>
          <path d="M 80 280 Q 100 260 120 280 Q 140 260 160 280 Q 180 260 200 280 Q 220 260 240 280 Q 260 260 280 280 Q 300 260 320 280 L 320 295 L 80 295 Z" fill="url(#frostingGrad)"/>
          <circle cx="110" cy="320" r="4" fill="#ffd166" opacity=".8"/>
          <circle cx="150" cy="330" r="3" fill="#4ff0c5" opacity=".7"/>
          <circle cx="200" cy="325" r="4" fill="#ffd166" opacity=".8"/>
          <circle cx="250" cy="330" r="3" fill="#4ff0c5" opacity=".7"/>
          <circle cx="290" cy="320" r="4" fill="#ffd166" opacity=".8"/>

          <!-- Tier 2 (middle) -->
          <rect x="115" y="195" width="170" height="90" rx="8" fill="url(#tier2Grad)"/>
          <path d="M 115 195 Q 135 175 155 195 Q 175 175 195 195 Q 215 175 235 195 Q 255 175 275 195 L 285 195 Q 285 205 285 210 L 115 210 Z" fill="url(#frostingGrad)"/>
          <circle cx="145" cy="245" r="3.5" fill="#ffd166" opacity=".8"/>
          <circle cx="200" cy="250" r="4" fill="#ff7ab5" opacity=".8"/>
          <circle cx="255" cy="245" r="3.5" fill="#ffd166" opacity=".8"/>

          <!-- Tier 3 (top) -->
          <rect x="150" y="130" width="100" height="70" rx="6" fill="url(#tier3Grad)"/>
          <path d="M 150 130 Q 165 115 180 130 Q 195 115 210 130 Q 225 115 240 130 Q 250 130 250 140 L 150 140 Z" fill="url(#frostingGrad)"/>

          <!-- Candles -->
          <g class="candle-group" data-candle="0">
            <rect x="172" y="75" width="10" height="55" rx="2" fill="url(#candleGrad)"/>
            <rect x="172" y="75" width="10" height="8" fill="#ffd166"/>
            <ellipse class="flame-glow" cx="177" cy="62" rx="18" ry="22" fill="url(#flameGlow)" opacity=".5"/>
            <path class="flame-outer" d="M 177 52 Q 172 62 177 72 Q 182 62 177 52 Z" fill="#ffb300"/>
            <path class="flame-inner" d="M 177 58 Q 175 63 177 68 Q 179 63 177 58 Z" fill="#ffe066"/>
            <ellipse class="smoke" cx="177" cy="60" rx="4" ry="2"/>
          </g>

          <g class="candle-group" data-candle="1">
            <rect x="195" y="70" width="10" height="60" rx="2" fill="url(#candleGrad)"/>
            <rect x="195" y="70" width="10" height="8" fill="#ffd166"/>
            <ellipse class="flame-glow" cx="200" cy="57" rx="18" ry="22" fill="url(#flameGlow)" opacity=".5"/>
            <path class="flame-outer" d="M 200 47 Q 195 57 200 67 Q 205 57 200 47 Z" fill="#ffb300"/>
            <path class="flame-inner" d="M 200 53 Q 198 58 200 63 Q 202 58 200 53 Z" fill="#ffe066"/>
            <ellipse class="smoke" cx="200" cy="55" rx="4" ry="2"/>
          </g>

          <g class="candle-group" data-candle="2">
            <rect x="218" y="75" width="10" height="55" rx="2" fill="url(#candleGrad)"/>
            <rect x="218" y="75" width="10" height="8" fill="#ffd166"/>
            <ellipse class="flame-glow" cx="223" cy="62" rx="18" ry="22" fill="url(#flameGlow)" opacity=".5"/>
            <path class="flame-outer" d="M 223 52 Q 218 62 223 72 Q 228 62 223 52 Z" fill="#ffb300"/>
            <path class="flame-inner" d="M 223 58 Q 221 63 223 68 Q 225 63 223 58 Z" fill="#ffe066"/>
            <ellipse class="smoke" cx="223" cy="60" rx="4" ry="2"/>
          </g>

          <!-- Decorations -->
          <circle cx="140" cy="165" r="6" fill="#ffd166" opacity=".9"/>
          <circle cx="260" cy="165" r="6" fill="#ffd166" opacity=".9"/>
          <circle cx="200" cy="175" r="4" fill="#fff5fb" opacity=".7"/>
        </svg>
      </div>

      <p class="cake-hint" id="cakeHint">
        Clique nas <span>velas</span> · ou use o microfone
      </p>

      <div class="cake-actions">
        <button class="cake-btn" id="micBtn">
          <span id="micIcon">🎤</span>
          <span id="micLabel">Assoprar com voz</span>
        </button>
        <button class="cake-btn" id="resetCandles">
          ↺ Acender de novo
        </button>
      </div>

      <div class="cake-result" id="cakeResult">
        <span class="cr-emoji">🎉</span>
        <div class="cr-title">Pedido feito!</div>
        <p class="cr-msg">Todas as velas apagadas. Que tudo o que você pediu se realize — e que eu esteja lá para ver.</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= STATS ================= -->
<section class="stats-sec" id="stats">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Desde o primeiro dia</span>
      <h2 class="title">Sua <em>jornada</em> em números</h2>
      <p class="sub">Cada segundo conta. E cada segundo foi vivido por você.</p>
    </div>

    <div class="counter-card" data-reveal data-d="1">
      <div class="counter-grid">
        <div><span class="c-num" id="cdDays">0</span><span class="c-label">Dias</span></div>
        <div><span class="c-num" id="cdHours">0</span><span class="c-label">Horas</span></div>
        <div><span class="c-num" id="cdMins">0</span><span class="c-label">Minutos</span></div>
        <div><span class="c-num" id="cdSecs">0</span><span class="c-label">Segundos</span></div>
      </div>
      <div class="counter-foot">
        <p>Você está no mundo desde <strong id="startLabel">15 de junho de 1999</strong></p>
      </div>
    </div>

    <div class="fun-stats" data-reveal data-d="2">
      <div class="fun-stat">
        <span class="fs-emoji">🌅</span>
        <span class="fs-num" data-count="9125">0</span>
        <span class="fs-label">Amanheceres</span>
      </div>
      <div class="fun-stat">
        <span class="fs-emoji">😂</span>
        <span class="fs-num" data-count="50000">0</span>
        <span class="fs-label">Risadas</span>
      </div>
      <div class="fun-stat">
        <span class="fs-emoji">☕</span>
        <span class="fs-num" data-count="7500">0</span>
        <span class="fs-label">Cafés</span>
      </div>
      <div class="fun-stat">
        <span class="fs-emoji">✨</span>
        <span class="fs-num" data-count="999999">0</span>
        <span class="fs-label">Momentos únicos</span>
      </div>
    </div>
  </div>
</section>

<!-- ================= TIMELINE ================= -->
<section class="na-original-1" id="historia">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Sua trajetória</span>
      <h2 class="title">Capítulos que <em>te formaram</em></h2>
      <p class="sub">Cada ano trouxe uma nova versão de você. E todas são igualmente especiais.</p>
    </div>

    <div class="timeline">
      <div class="tl-item" data-reveal>
        <div class="tl-dot"></div>
        <p class="tl-year">1999 — O começo</p>
        <h3 class="tl-title">Você chegou ao mundo</h3>
        <p class="tl-desc">O dia em que tudo começou. E desde então, cada 15 de junho é motivo de festa.</p>
      </div>
      <div class="tl-item" data-reveal data-d="1">
        <div class="tl-dot"></div>
        <p class="tl-year">2006 — A infância</p>
        <h3 class="tl-title">Os primeiros sonhos</h3>
        <p class="tl-desc">Onde tudo era descoberta: o primeiro dia de aula, os primeiros amigos, as primeiras paixões impossíveis.</p>
      </div>
      <div class="tl-item" data-reveal data-d="2">
        <div class="tl-dot"></div>
        <p class="tl-year">2017 — A adolescência</p>
        <h3 class="tl-title">Quando você virou você</h3>
        <p class="tl-desc">A fase das descobertas grandes. Dos amigos para sempre. Das escolhas que te trouxeram até aqui.</p>
      </div>
      <div class="tl-item" data-reveal data-d="3">
        <div class="tl-dot"></div>
        <p class="tl-year">Hoje — A vida adulta</p>
        <h3 class="tl-title">A versão atual</h3>
        <p class="tl-desc">Cada vez mais você. Cada vez mais incrível. Cada vez mais perto de tudo que sonhou.</p>
      </div>
      <div class="tl-item" data-reveal data-d="4">
        <div class="tl-dot"></div>
        <p class="tl-year">O futuro — O que vem</p>
        <h3 class="tl-title">O melhor ainda está por vir</h3>
        <p class="tl-desc">Novos capítulos, novas descobertas, novas versões de você. E eu quero estar aqui para ver cada uma.</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= GALERIA ================= -->
<section class="na-original-2" id="galeria">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Álbum de memórias</span>
      <h2 class="title">Momentos que <em>guardei</em></h2>
      <p class="sub">Clique em qualquer foto para ampliar. Cada uma é uma lembrança que eu não quero esquecer.</p>
    </div>
    <div class="gallery" id="gallery" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= STORIES ================= -->
<section class="stories-sec" id="stories">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Registros em movimento</span>
      <h2 class="title">Nossos <em>stories</em></h2>
      <p class="sub">Toque em um story para reviver. Momentos que merecem ser contados.</p>
    </div>
    <div class="stories-rail" id="storiesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= FLIP CARDS ================= -->
<section id="motivos">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Sobre você</span>
      <h2 class="title">Coisas que <em>amo em você</em></h2>
      <p class="sub">Vire cada carta. Cada uma é uma verdade sobre você.</p>
    </div>

    <div class="motivos" data-reveal data-d="1">
      <div class="flip">
        <div class="flip-face flip-front"><span class="ico">🌟</span><h4>Seu jeito</h4><span>Vire →</span></div>
        <div class="flip-face flip-back"><p>Único, impossível de replicar. Não existe ninguém no mundo que seja você — e isso é a sua maior força.</p></div>
        <span class="flip-hint">toque</span>
      </div>
      <div class="flip">
        <div class="flip-face flip-front"><span class="ico">💫</span><h4>Sua luz</h4><span>Vire →</span></div>
        <div class="flip-face flip-back"><p>Você ilumina os lugares por onde passa. Não é força de expressão — é literal.</p></div>
        <span class="flip-hint">toque</span>
      </div>
      <div class="flip">
        <div class="flip-face flip-front"><span class="ico">🎧</span><h4>Seu gosto</h4><span>Vire →</span></div>
        <div class="flip-face flip-back"><p>Aquele jeito que você tem de descobrir coisas incríveis antes de todo mundo. Nunca erra.</p></div>
        <span class="flip-hint">toque</span>
      </div>
      <div class="flip">
        <div class="flip-face flip-front"><span class="ico">❤️</span><h4>Seu coração</h4><span>Vire →</span></div>
        <div class="flip-face flip-back"><p>Maior do que o mundo. Cuida de todos, sempre. E merece todo o cuidado de volta — hoje e sempre.</p></div>
        <span class="flip-hint">toque</span>
      </div>
    </div>
  </div>
</section>

<!-- ================= MEMORY JAR ================= -->
<section class="jar-sec" id="jar">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Pote de memórias</span>
      <h2 class="title">Um momento <em>aleatório</em></h2>
      <p class="sub">Gire e descubra uma lembrança que guardei de você.</p>
    </div>

    <div class="jar-card" data-reveal data-d="1">
      <div class="jar-icon">🫙</div>
      <h3 class="jar-title">Uma lembrança só sua</h3>
      <p class="jar-desc">Cada vez que você girar, uma nova memória vai aparecer. Nenhuma se repete até esgotar.</p>
      <button class="jar-btn" id="jarBtn">Pegar uma memória ✦</button>
      <div class="jar-result">
        <p class="jar-memory" id="jarMemory"></p>
      </div>
    </div>
  </div>
</section>

<!-- ================= LETTER ================= -->
<section class="letter-sec" id="carta">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Uma carta</span>
      <h2 class="title">O que eu <em>precisava dizer</em></h2>
      <p class="sub">Algumas coisas só cabem por escrito.</p>
    </div>

    <div class="letter-stage" data-reveal data-d="1">
      <div class="letter-paper" id="letterPaper">
        <div class="letter-seal">✦</div>
        <p class="letter-eyebrow">Do meu coração para o seu</p>
        <h3 class="letter-title">Feliz aniversário, meu amor</h3>
        <p class="letter-preview">Hoje o dia é seu, mas quem ganhou o presente fui eu — por ter você na minha vida.</p>
        <div class="letter-full">
          <p>Existem pessoas que chegam e mudam tudo. Você é uma delas. Não de um jeito barulhento — de um jeito que a gente só percebe depois, quando olha para trás e vê que os dias passaram a fazer mais sentido.</p>
          <p>Hoje você completa mais um ano de vida e eu queria conseguir colocar em palavras o tamanho da admiração que sinto por você. Não consigo. Mas tentei.</p>
          <p>Admiro sua coragem. Sua leveza. O jeito que você escolhe ser gentil mesmo quando o mundo não é. Admiro o quanto você cresce, aprende e se reinventa — sem nunca perder a essência.</p>
          <p>Desejo que esse novo ciclo seja generoso com você. Que você consiga tudo o que sonhou, e também aquilo que nem sabia que sonhava. Que a vida te devolva em dobro todo o bem que você espalha por aí.</p>
          <p>E que eu possa estar aqui para ver cada conquista, cada novo capítulo, cada versão ainda mais bonita de você.</p>
          <p>Feliz aniversário. Que venham muitos outros — e que todos sejam tão especiais quanto você.</p>
          <p class="sig">Com todo o meu amor,<br>Alguém que te admira ✦</p>
        </div>
        <button class="letter-btn" id="letterBtn">Abrir a carta</button>
      </div>
    </div>
  </div>
</section>

<!-- ================= GIFT ================= -->
<section class="gift-sec" id="presente">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">O presente</span>
      <h2 class="title">Tem uma coisa <em>aqui dentro</em></h2>
      <p class="sub">Toque na caixinha. É pequeno, mas foi escolhido com cuidado.</p>
    </div>

    <div class="gift-stage" data-reveal data-d="1">
      <div class="gift-box" id="giftBox">
        <div class="gift-content">
          <span class="gc-emoji">💝</span>
          <div class="gc-title" id="giftTitle">Você é o presente</div>
          <p class="gc-sub" id="giftSub">Nenhuma caixa no mundo cabe o que eu sinto por você. Mas essa aqui tentou.</p>
        </div>
        <div class="gift-base"></div>
        <div class="gift-bow"></div>
        <div class="gift-lid"></div>
      </div>
    </div>

    <p class="gift-hint" id="giftHint">Toque na caixinha ✦</p>
  </div>
</section>

<footer>
  <span class="f-emoji">🎂</span>
  <p>Feito com carinho, confete e um pouco de insônia — porque você merece o mundo.</p>
  <div class="f-names">Feliz Aniversário ✦</div>
  <small>Para sempre</small>
</footer>

<!-- LIGHTBOX -->
<div id="lightbox">
  <button class="lb-close" id="lbClose">✕</button>
  <button class="lb-nav lb-prev" id="lbPrev">‹</button>
  <img id="lbImg" src="" alt="">
  <button class="lb-nav lb-next" id="lbNext">›</button>
</div>

<!-- STORY VIEWER -->
<div id="storyViewer">
  <div class="story-frame">
    <div class="story-progress" id="storyProgress"></div>
    <div class="story-media" id="storyMedia"></div>
    <div class="story-veil"></div>
    <div class="story-head">
      <img class="story-ava" id="storyAva" src="" alt="">
      <div>
        <div class="story-name" id="storyName">Seu Nome</div>
        <div class="story-time" id="storyTime">agora</div>
      </div>
    </div>
    <button class="story-close" id="storyClose">✕</button>
    <p class="story-cap" id="storyCap"></p>
    <div class="story-tap l" id="tapPrev"></div>
    <div class="story-tap r" id="tapNext"></div>
  </div>
</div>

<!-- PLAYER -->
<div class="player" id="player">
  <div class="disc" id="disc">
    <img id="discCover" src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=80&auto=format&fit=crop" alt="">
    <div class="disc-hole"></div>
  </div>
  <div class="p-info">
    <div class="p-title" id="pTitle">Happy Birthday</div>
    <div class="p-artist" id="pArtist">Stevie Wonder</div>
  </div>
  <div class="p-eq"><i></i><i></i><i></i><i></i></div>
  <button class="p-btn" id="playBtn" aria-label="Play/Pause">▶</button>
</div>

<!-- TOAST -->
<div id="toast"></div>

<button id="toTop" aria-label="Voltar ao topo">↑</button>

<!-- AUDIO -->
<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
