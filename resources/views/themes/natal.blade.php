<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
@include('partials.seo')
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700;800&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet">
@vite(["resources/css/themes/natal.css","resources/js/entries/themes-natal.js"])
</head>
<body>
@include('partials.noscript')

<!-- LOADER -->
<div class="loader" id="loader">
  <div class="loader-wrap">
    <div class="loader-ornament"><div class="loader-ball"></div></div>
    <p class="loader-text">Preparando seu presente...</p>
  </div>
</div>

<!-- NEVE -->
<canvas class="natal-snow" id="snow"></canvas>

<!-- SHOOTING STARS -->
<div class="shooting-star s1"></div>
<div class="shooting-star s2"></div>
<div class="shooting-star s3"></div>

<!-- DECORAÇÕES FLUTUANTES -->
<div class="float-decor decor-1">🍪</div>
<div class="float-decor decor-2">🧦</div>
<div class="float-decor decor-3">🍭</div>
<div class="float-decor decor-4">🎁</div>
<div class="float-decor decor-5">⭐</div>
<div class="float-decor decor-6">🔔</div>
<div class="float-decor decor-7">🎄</div>
<div class="float-decor decor-8">❄️</div>

<!-- TRENÓ -->
<div class="santa-sleigh">🛷</div>

<!-- SINO -->
<button class="bell-btn" id="bellBtn" aria-label="Tocar sinos">
  <span class="bell-icon">🔔</span>
</button>

<!-- MÚSICA -->
<div class="music-player" id="musicPlayer">
  <div class="vinyl"></div>
  <div class="music-info">
    <strong>Jingle Bells</strong>
    <span id="musicLabel">Toque para tocar</span>
  </div>
  <button class="music-btn" id="musicBtn" aria-label="Play">▶</button>
</div>

<!-- CONTEÚDO -->
<div class="theme-natal">

  <!-- HERO -->
  <section class="hero">
    <div class="hero-photo"><img src="https://picsum.photos/seed/natalcoverv3/1600/2000" alt="" /></div>
    <div class="aurora"></div>
    <div class="hero-content">
      <span class="hero-tag">✦ Edição Especial de Natal · 2026 ✦</span>
      <p class="hero-script">Para Maria, com todo o meu amor</p>
      <h1 class="hero-title">Um Feliz<br/>Natal</h1>
      <p class="hero-subtitle">Um presente feito à mão, do fundo do coração para o seu. Cada detalhe aqui existe só por sua causa.</p>
      <div class="hero-actions">
        <a href="#gift" class="btn btn-primary">Abrir presente ✦</a>
        <button class="btn btn-ghost" id="heroJingle">🔔 Tocar sinos</button>
      </div>
    </div>
    <div class="scroll-indicator">
      <span>Role para descobrir</span>
      <div class="scroll-arrow">↓</div>
    </div>
  </section>

  <!-- COUNTDOWN -->
  <section class="countdown section" data-reveal>
    <span class="section-tag">✦ Faltam apenas ✦</span>
    <h2 class="section-title">Para o Natal 2026</h2>
    <p class="section-desc">O tempo que falta para a noite mais mágica do ano.</p>
    <div class="countdown-grid">
      <div class="countdown-cell"><div class="countdown-num" id="cdDays">00</div><div class="countdown-label">Dias</div></div>
      <div class="countdown-cell"><div class="countdown-num" id="cdHours">00</div><div class="countdown-label">Horas</div></div>
      <div class="countdown-cell"><div class="countdown-num" id="cdMins">00</div><div class="countdown-label">Minutos</div></div>
      <div class="countdown-cell"><div class="countdown-num" id="cdSecs">00</div><div class="countdown-label">Segundos</div></div>
    </div>
  </section>

  <!-- PRESENTE -->
  <section class="gift-wrap" id="gift">
    <button class="giftbox" id="giftbox" aria-label="Abrir presente">
      <span class="santa-pop">
        <span class="santa-heart">❤️</span>
        <span class="santa-emoji">🎅</span>
      </span>
      <span class="box"></span>
      <span class="ribbon-v"></span>
      <span class="ribbon-h"></span>
      <span class="lid"></span>
      <span class="bow"></span>
    </button>
    <p class="gift-hint">Toque no presente para abrir</p>
  </section>

  <!-- CONTEÚDO DESBLOQUEADO -->
  <div class="unlocked" id="unlocked">

    <!-- GALERIA -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Galeria ✦</span>
        <h2 class="section-title">Nossos Momentos</h2>
        <p class="section-desc">Clique em qualquer foto para ampliar.</p>
      </div>
      <div class="gallery" id="gallery"></div>
    </section>

    <!-- VÍDEOS STORIES (FORMATO CIRCULAR DA IMAGEM) -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Vídeos em Stories ✦</span>
        <h2 class="section-title">Nossos Vídeos</h2>
        <p class="section-desc">Toque em um círculo para assistir como story do Instagram.</p>
      </div>
      <div class="stories-row" id="videosGrid"></div>
    </section>

    <!-- CARTA -->
    <section class="section" data-reveal id="letterSection">
      <div class="letter">
        <div class="letter-seal">🎄</div>
        <h3>Uma carta para você</h3>
        <p class="letter-body" id="letterBody"></p>
      </div>
    </section>

    <!-- 3 MINI PRESENTES -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Três presentes ✦</span>
        <h2 class="section-title">Escolha um</h2>
        <p class="section-desc">Toque em cada um para revelar.</p>
      </div>
      <div class="mini-gifts">
        <div class="mini-gift" data-gift="1">
          <div class="mini-gift-inner">
            <div class="mini-face mini-front">🎁<span class="mini-hint">Toque para abrir</span></div>
            <div class="mini-face mini-back">
              <h4>Meu primeiro presente</h4>
              <p>Meu abraço mais apertado, sempre que você precisar.</p>
            </div>
          </div>
        </div>
        <div class="mini-gift" data-gift="2">
          <div class="mini-gift-inner">
            <div class="mini-face mini-front">🎀<span class="mini-hint">Toque para abrir</span></div>
            <div class="mini-face mini-back">
              <h4>Meu segundo presente</h4>
              <p>Cada risada que você me fez dar esse ano. E as que ainda vou te fazer dar.</p>
            </div>
          </div>
        </div>
        <div class="mini-gift" data-gift="3">
          <div class="mini-gift-inner">
            <div class="mini-face mini-front">⭐<span class="mini-hint">Toque para abrir</span></div>
            <div class="mini-face mini-back">
              <h4>Meu terceiro presente</h4>
              <p>Uma promessa: estar ao seu lado em todos os Natais que virão.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ÁRVORE INTERATIVA -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Nossa árvore ✦</span>
        <h2 class="section-title">Toque nos enfeites</h2>
        <p class="section-desc">Cada enfeite guarda uma mensagem especial.</p>
      </div>
      <div class="tree-scene">
        <div class="xmas-tree">
          <div class="tree-star">⭐</div>
          <div class="tree-tier tier-1"></div>
          <div class="tree-tier tier-2"></div>
          <div class="tree-tier tier-3"></div>
          <div class="tree-trunk"></div>
          <button class="orn orn-position-1" data-msg="Você é o meu maior presente 🎄">🎁</button>
          <button class="orn orn-position-2" data-msg="Cada dia com você é como Natal ❄️">❄️</button>
          <button class="orn orn-position-3" data-msg="Meu coração bate mais forte por você ❤️">❤️</button>
          <button class="orn orn-position-4" data-msg="Seu abraço é meu lugar favorito 🧸">🧸</button>
          <button class="orn orn-position-5" data-msg="Seu sorriso ilumina tudo 🔔">🔔</button>
          <button class="orn orn-position-6" data-msg="Cada momento com você vira memória 🍪">🍪</button>
          <button class="orn orn-position-7" data-msg="Feliz Natal, meu amor 🍭">🍭</button>
          <button class="orn orn-position-8" data-msg="Para sempre, em todos os Natais ✨">✨</button>
        </div>
        <div class="tree-msg" id="treeMsg"></div>
      </div>
    </section>

    <!-- TIMELINE -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Linha do tempo ✦</span>
        <h2 class="section-title">Nossa Jornada</h2>
      </div>
      <ol class="timeline">
        <li class="tl-item"><span class="tl-sleigh">🛷</span><time>Dezembro de 2023</time><p>Nosso primeiro Natal juntos. Jantar simples, mas a noite mais mágica da minha vida.</p></li>
        <li class="tl-item"><span class="tl-sleigh">🛷</span><time>Dezembro de 2024</time><p>Viagem para a serra. Você me deu uma caneca, um livro e um abraço que durou até o ano virar.</p></li>
        <li class="tl-item"><span class="tl-sleigh">🛷</span><time>Dezembro de 2025</time><p>Mudamos de casa. Primeiro Natal no nosso cantinho, com nosso primeiro pinheirinho só nosso.</p></li>
        <li class="tl-item"><span class="tl-sleigh">🛷</span><time>Dezembro de 2026</time><p>Hoje. Este presente, em cada pixel, em cada foto, em cada palavra. Obrigado por existir.</p></li>
      </ol>
    </section>

    <!-- WISH LIST -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Wish List ✦</span>
        <h2 class="section-title">Meus Desejos pra Você</h2>
      </div>
      <div class="wish-list-wrap">
        <div class="wish-card">
          <div class="wish-seal">🎅</div>
          <h3 class="wish-title">Carta ao Papai Noel</h3>
          <ul class="wish-list" id="wishList">
            <li class="wish-item" data-wish><span class="wish-check">☐</span><span class="wish-text">Que a gente continue rindo junto todos os dias</span></li>
            <li class="wish-item" data-wish><span class="wish-check">☐</span><span class="wish-text">Que nunca falte café da manhã no nosso final de semana</span></li>
            <li class="wish-item" data-wish><span class="wish-check">☐</span><span class="wish-text">Que nossos abraços continuem curando tudo</span></li>
            <li class="wish-item" data-wish><span class="wish-check">☐</span><span class="wish-text">Mais viagens, mais fotos, mais "eu te amo"</span></li>
            <li class="wish-item" data-wish><span class="wish-check">☐</span><span class="wish-text">Que a gente envelheça junto, sem pressa</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- GLOBO MELHORADO -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Um pedacinho mágico ✦</span>
        <h2 class="section-title">Sacuda o Globo</h2>
      </div>
      <div class="globe-wrap">
        <div class="snowglobe" id="globe">
          <div class="globe-dome">
            <div class="globe-inner-scene">
              <div class="globe-tree">🎄</div>
            </div>
            <div class="globe-snowman">⛄</div>
            <div class="globe-gift">🎁</div>
            <div class="globe-snow-layer"></div>
            <div class="globe-snow" id="globeSnow"></div>
            <div class="globe-glass"></div>
          </div>
          <div class="globe-base-new">
            <div class="globe-base-wood"></div>
            <div class="globe-base-plate">KoaLove · 2026</div>
          </div>
        </div>
        <p class="globe-label">Toque no globo para sacudir ✨</p>
      </div>
    </section>

    <!-- FLIP CARD -->
    <section class="section" data-reveal>
      <div class="section-header">
        <span class="section-tag">✦ Segredo ✦</span>
        <h2 class="section-title">Há algo aqui</h2>
      </div>
      <div class="secret-wrap">
        <div class="flip-card" id="flipCard">
          <div class="flip-inner">
            <div class="flip-face flip-front">💌</div>
            <div class="flip-face flip-back">
              <h4>Meu segredo</h4>
              <p>Você é a melhor coisa que me aconteceu em todos esses anos. Feliz Natal 2026, meu amor.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <p class="footer-script">Feito com carinho ✦ KoaLove</p>
    <p class="footer-note">Edição Especial de Natal · 2026</p>
  </footer>
</div>

<!-- LIGHTBOX -->
<div class="lightbox" id="lightbox">
  <button class="lightbox-btn lightbox-close" id="lbClose">×</button>
  <button class="lightbox-btn lightbox-prev" id="lbPrev">‹</button>
  <img class="lightbox-img" id="lbImg" src="" alt="" />
  <button class="lightbox-btn lightbox-next" id="lbNext">›</button>
</div>

<!-- VIDEO STORY PLAYER -->
<div class="story-player" id="storyPlayer">
  <div class="story-viewport" id="storyViewport">
    <div class="story-progress" id="storyProgress"></div>
    <div class="story-header">
      <div class="avatar">🎬</div>
      <div>
        <div class="username">Nossos vídeos • 2026</div>
        <div class="time-ago">agora mesmo</div>
      </div>
    </div>
    <button class="story-close" id="storyClose">×</button>
    <div class="story-media-wrap" id="storyMedia"></div>
    <div class="story-caption" id="storyCaption"></div>
    <div class="story-tap-left" id="storyPrevTap"></div>
    <div class="story-tap-right" id="storyNextTap"></div>
    <button class="story-play-pause" id="storyPlayPause">❚❚</button>
  </div>
</div>


</body>
</html>
