<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
@include('partials.seo')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Shade&family=Monoton&family=Pacifico&family=Press+Start+2P&family=Righteous&family=VT323&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">




    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/retro.css","resources/js/entries/themes-retro.js"])
</head>
<body>
    @include('partials.noscript')

<!-- CRT OVERLAY -->
<div class="crt-flicker"></div>

<!-- CURSOR -->
<div class="cursor" id="cursor">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L2 18 L6 14 L10 22 L13 21 L9 13 L16 13 Z" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/>
  </svg>
</div>

<!-- SCROLL -->
<div class="scroll-bar" id="scrollBar"></div>

<!-- LOADER -->
<div id="loader">
  <div class="loader-cassette">
    <div class="reel"></div>
    <div class="reel"></div>
  </div>
  <div class="loader-text">LOADING...</div>
</div>

<!-- ============ NAVBAR ============ -->
<nav class="navbar" id="navbar">
  <div class="nav-logo" data-na-action="1">RADICAL 80s</div>
  <div class="nav-links">
    <a class="nav-link active">Início</a>
    <a class="nav-link">Stats</a>
    <a class="nav-link">História</a>
    <a class="nav-link">Fitas</a>
    <a class="nav-link">Arcade</a>
  </div>
  <div class="nav-right">
    <div class="nav-coin" id="navCoin">COIN</div>
  </div>
</nav>

<!-- ============ HERO ============ -->
<section class="hero" id="inicio">
  <div class="hero-sun"></div>
  <div class="hero-grid"></div>
  <div class="hero-palms"></div>
  <div class="hero-palm-left">
    <svg viewBox="0 0 80 240" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 240 L40 100 Q35 80 20 70 Q30 75 40 80 Q45 60 60 50 Q50 70 45 85 Q55 75 70 80 Q55 90 45 95 Q50 110 55 130 Q45 115 42 100 L42 240 Z"/>
    </svg>
  </div>
  <div class="hero-palm-right">
    <svg viewBox="0 0 80 240" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 240 L40 100 Q35 80 20 70 Q30 75 40 80 Q45 60 60 50 Q50 70 45 85 Q55 75 70 80 Q55 90 45 95 Q50 110 55 130 Q45 115 42 100 L42 240 Z"/>
    </svg>
  </div>

  <div class="hero-content">
    <div class="hero-badge">EST. 1985 · MIAMI VIBES</div>
    <h1 class="hero-title">
      <span class="chrome">NOSSA VIDA</span>
      <em>em neon</em>
    </h1>
    <p class="hero-sub">
      Uma história que <strong>nunca sai de moda</strong>. Fitas cassete, pôr do sol, fliperama e a gente — como nos melhores anos 80.
    </p>
    <div class="hero-actions">
      <button class="btn-neon" data-na-scroll="historia">▶ COMEÇAR</button>
      <button class="btn-neon pink" data-na-scroll="fitas">★ VER FITAS</button>
    </div>
  </div>

  <div class="hero-marquee">
    <div class="hero-marquee-track" id="heroMarquee"></div>
  </div>
</section>

<!-- ============ ARCADE STATS ============ -->
<section class="stats-sec">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">HIGH SCORES</div>
      <h2 class="section-title">Nossos <span class="neon-pink">números</span></h2>
      <p class="section-sub">Um placar de fliperama com tudo o que a gente já viveu. E ainda tem muito jogo pela frente.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card" data-reveal>
        <span class="stat-icon">🕹</span>
        <div class="stat-label">NÍVEL DE AMIZADE</div>
        <div class="stat-num" data-count="99">0</div>
        <div class="stat-desc">Nosso XP está no máximo. Não dá pra subir mais.</div>
        <div class="stat-level"><div class="stat-level-fill" data-fill="99"></div></div>
      </div>

      <div class="stat-card" data-reveal data-d="1">
        <span class="stat-icon">📼</span>
        <div class="stat-label">FITAS GRAVADAS</div>
        <div class="stat-num" data-count="48">0</div>
        <div class="stat-desc">Cada rolê virou uma fita cassete na nossa estante.</div>
        <div class="stat-level"><div class="stat-level-fill" data-fill="72"></div></div>
      </div>

      <div class="stat-card" data-reveal data-d="2">
        <span class="stat-icon">🎮</span>
        <div class="stat-label">PARTIDAS DE ARCADE</div>
        <div class="stat-num" data-count="127">0</div>
        <div class="stat-desc">E você ainda continua perdendo pra mim no Pac-Man.</div>
        <div class="stat-level"><div class="stat-level-fill" data-fill="86"></div></div>
      </div>

      <div class="stat-card" data-reveal data-d="3">
        <span class="stat-icon">🍕</span>
        <div class="stat-label">NOITES DE PIZZA</div>
        <div class="stat-num" data-count="365">0</div>
        <div class="stat-desc">Uma pra cada dia do ano. E contando.</div>
        <div class="stat-level"><div class="stat-level-fill" data-fill="95"></div></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ TIMELINE ============ -->
<section class="timeline-sec" id="historia">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">LEVEL UP</div>
      <h2 class="section-title">Nossa <span class="neon-cyan">linha do tempo</span></h2>
      <p class="section-sub">Cada fase da nossa vida é um level. E olha — a gente passou de todos com estilo.</p>
    </div>

    <div class="timeline">
      <div class="tl-item" data-reveal>
        <div class="tl-num">01</div>
        <div class="tl-card">
          <div class="tl-year">LEVEL 01 · 1985</div>
          <div class="tl-title">O Primeiro Encontro</div>
          <p class="tl-desc">Um fliperama qualquer, uma moeda, e um "quer jogar?". Nunca imaginei que aquele "sim" ia virar a nossa história.</p>
          <span class="tl-score">+100 XP</span>
        </div>
      </div>

      <div class="tl-item" data-reveal data-d="1">
        <div class="tl-num">02</div>
        <div class="tl-card">
          <div class="tl-year">LEVEL 02 · 1986</div>
          <div class="tl-title">A Primeira Mixtape</div>
          <p class="tl-desc">Você gravou uma fita cassete pra mim. Ainda tenho ela guardada, e o lado B nunca foi tocado — porque dizem que traz sorte.</p>
          <span class="tl-score">+250 XP</span>
        </div>
      </div>

      <div class="tl-item" data-reveal data-d="2">
        <div class="tl-num">03</div>
        <div class="tl-card">
          <div class="tl-year">LEVEL 03 · 1988</div>
          <div class="tl-title">A Viagem de Verão</div>
          <p class="tl-desc">Duas malas, uma câmera VHS, e a estrada pela frente. Foi a nossa primeira viagem — e a melhor sessão de cinema que já tive.</p>
          <span class="tl-score">+500 XP</span>
        </div>
      </div>

      <div class="tl-item" data-reveal data-d="3">
        <div class="tl-num">04</div>
        <div class="tl-card">
          <div class="tl-year">LEVEL 04 · 1990</div>
          <div class="tl-title">A Primeira Casa</div>
          <p class="tl-desc">Um apartamento pequeno, uma TV tubo, um sofá que a gente odiava. Mas era nosso — e ali a gente era feliz.</p>
          <span class="tl-score">+750 XP</span>
        </div>
      </div>

      <div class="tl-item" data-reveal data-d="4">
        <div class="tl-num">∞</div>
        <div class="tl-card">
          <div class="tl-year">LEVEL ∞ · HOJE</div>
          <div class="tl-title">A Próxima Fase</div>
          <p class="tl-desc">A gente ainda joga. Ainda ri. Ainda grava fitas. E ainda acredita que os anos 80 nunca acabaram — porque em nós, nunca vão.</p>
          <span class="tl-score">+∞ XP</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ VHS GALLERY ============ -->
<section class="gallery-sec" id="fitas">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">VHS COLLECTION</div>
      <h2 class="section-title">Nossas <span class="neon-pink">fitas</span></h2>
      <p class="section-sub">Cada memória foi gravada numa fita cassete. Clique em qualquer uma para assistir de novo.</p>
    </div>

    <div class="vhs-grid" id="vhsGrid"></div>
  </div>
</section>

<!-- ============ MTV STORIES ============ -->
<section class="stories-sec">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">MTV PLAYLIST</div>
      <h2 class="section-title">Nossos <span class="neon-cyan">clipes</span></h2>
      <p class="section-sub">Aqueles momentos que mereciam tocar no repeat. Toque em um para reviver.</p>
    </div>
    <div class="stories-rail" id="storiesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ ARCADE MINI-GAME ============ -->
<section class="arcade-sec" id="arcade">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">INSERT COIN</div>
      <h2 class="section-title">Vamos <span class="neon-pink">jogar?</span></h2>
      <p class="section-sub">Clique nos alvos antes que eles desapareçam. Cada vez que você acerta, uma memória nova aparece.</p>
    </div>

    <div class="arcade-cabinet" data-reveal data-d="1">
      <div class="arcade-screen" id="arcadeScreen">
        <div class="arcade-hud">
          <div class="hud-item">
            <div class="hud-label">SCORE</div>
            <div class="hud-value" id="arcadeScore">0</div>
          </div>
          <div class="hud-item">
            <div class="hud-label">TIME</div>
            <div class="hud-value" id="arcadeTime">30</div>
          </div>
          <div class="hud-item">
            <div class="hud-label">HIGH</div>
            <div class="hud-value" id="arcadeHigh">0</div>
          </div>
        </div>
        <div class="arcade-targets" id="arcadeTargets"></div>
        <div class="arcade-msg" id="arcadeMsg">PRESSIONE START</div>
      </div>
      <button class="arcade-btn" id="arcadeStart">▶ START GAME</button>
    </div>
  </div>
</section>

<!-- ============ MIXTAPE ============ -->
<section class="mixtape-sec" id="mixtape">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">MIXTAPE</div>
      <h2 class="section-title">Nossa <span class="neon-cyan">trilha sonora</span></h2>
      <p class="section-sub">Uma fita cassete com as músicas que marcaram a nossa história. Aperte play e deixe rodar.</p>
    </div>

    <div class="cassette-wrap" data-reveal data-d="1">
      <div class="cassette" id="cassette">
        <div class="cassette-label">
          <h3>Nossa Mixtape Favorita</h3>
          <p>Lado A · Para os melhores momentos</p>
        </div>
        <div class="cassette-reels">
          <div class="cassette-reel"></div>
          <div class="cassette-tape"></div>
          <div class="cassette-reel"></div>
        </div>
        <div class="cassette-controls">
          <button class="cassette-btn" data-cmd="rew">⏪</button>
          <button class="cassette-btn" data-cmd="play" id="cassettePlay">▶</button>
          <button class="cassette-btn" data-cmd="ff">⏩</button>
          <button class="cassette-btn" data-cmd="stop" id="cassetteStop">■</button>
        </div>
        <div class="cassette-info">TOUCHING: <strong id="cassetteTrack">Nothing Yet</strong> · SIDE A · 1985</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ LETTER ============ -->
<section class="letter-sec" id="carta">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <div class="section-eyebrow">DEAR YOU</div>
      <h2 class="section-title">Uma <span class="neon-pink">carta</span> pra você</h2>
      <p class="section-sub">Escrita à mão, grampeada com fita adesiva, do jeito que se fazia nos anos 80.</p>
    </div>

    <div class="letter-paper" data-reveal data-d="1">
      <div class="letter-eyebrow">★ PARA SEMPRE ★</div>
      <h3 class="letter-title">Querido(a),</h3>
      <p>Se você está lendo isso, é porque a nossa fita ainda está rodando — e eu espero que ela nunca chegue ao fim.</p>
      <p>Eu cresci ouvindo que os anos 80 foram a melhor década. Mas a verdade é que eu só descobri o que era "melhor" quando te conheci. Cada momento com você parece uma cena daqueles filmes do John Hughes: <strong>simples, sincero, inesquecível</strong>.</p>
      <p>Obrigado por cada fita gravada, cada moeda no fliperama, cada pôr do sol assistido em silêncio. Obrigado por tornar o comum em <strong>radical</strong>.</p>
      <p>Que a nossa história continue sendo trilha sonora, fliperama e mixtape — pelos próximos 80 anos. Ou mais.</p>
      <div class="letter-sign">— Com amor, seu par ⚡</div>
      <div class="letter-stamp">SELO<br>DO<br>AMOR<br>★</div>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer>
  <div class="footer-logo">RADICAL 80s</div>
  <p>Feito com fitas cassete, moedas de fliperama e um pouco de purpurina — para a pessoa mais radical da minha vida.</p>
  <div class="footer-socials">
    <div class="footer-social" title="Cassette">📼</div>
    <div class="footer-social" title="Arcade">🕹</div>
    <div class="footer-social" title="Sunset">🌅</div>
    <div class="footer-social" title="Heart">💖</div>
  </div>
  <small>★ 1985 · 2024 · FOREVER ★</small>
</footer>

<!-- VHS MODAL -->
<div id="vhsModal">
  <div class="vhs-modal-inner">
    <button class="vhs-modal-close" id="vhsModalClose">✕</button>
    <img id="vhsModalImg" src="" alt="">
    <div class="vhs-modal-caption">
      <h3 id="vhsModalTitle"></h3>
      <p id="vhsModalDesc"></p>
    </div>
  </div>
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
        <div class="story-name" id="storyName">RADICAL 80s</div>
        <div class="story-time" id="storyTime">agora</div>
      </div>
    </div>
    <button class="story-close" id="storyClose">✕</button>
    <p class="story-cap" id="storyCap"></p>
    <div class="story-tap l" id="tapPrev"></div>
    <div class="story-tap r" id="tapNext"></div>
  </div>
</div>

<div id="toast"></div>
<button id="toTop" aria-label="Voltar ao topo">▲</button>

<!-- ÁUDIO -->
<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
