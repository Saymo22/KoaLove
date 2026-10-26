<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
@include('partials.seo')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,400;1,9..144,500&family=DM+Mono:wght@400;500&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet">




    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/vinil.css","resources/js/entries/themes-vinil.js"])
</head>
<body>
    @include('partials.noscript')

<!-- CURSOR -->
<div class="cursor-dot" id="cDot"></div>
<div class="cursor-ring" id="cRing"></div>

<!-- SCROLL -->
<div class="scroll-bar" id="scrollBar"></div>

<!-- LOADER -->
<div id="loader">
  <div class="loader-vinyl">
    <div class="hole"></div>
  </div>
  <div class="loader-text">Aquecendo a agulha</div>
</div>

<!-- ================= HERO ================= -->
<section class="hero" id="inicio">
  <div class="hero-spotlight"></div>
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-badge">
        <span class="dot"></span>
        Agora tocando · Lado A
      </div>
      <h1 class="hero-title">
        <span>Nosso</span>
        <em>Vinil</em>
      </h1>
      <p class="hero-sub">
        Cada memória tem uma trilha. Cada trilha, uma <strong>agulha</strong>. Toque o disco e ouça a nossa vida girar.
      </p>
      <div class="hero-meta">
        <div class="hm-item">
          <span class="hm-label">Lado A</span>
          <span class="hm-value">O começo</span>
        </div>
        <div class="hm-item">
          <span class="hm-label">Lado B</span>
          <span class="hm-value">O depois</span>
        </div>
        <div class="hm-item">
          <span class="hm-label">RPM</span>
          <span class="hm-value">33⅓</span>
        </div>
      </div>
    </div>

    <div class="turntable-wrap">
      <div class="turntable">
        <div class="tt-platter">
          <div class="vinyl" id="heroVinyl">
            <div class="vinyl-label">
              <div class="vinyl-label-text">
                Nosso Vinil
                <small>Lado A · 33⅓</small>
              </div>
            </div>
            <div class="vinyl-hole"></div>
          </div>
          <div class="tonearm">
            <div class="tonearm-pivot"></div>
            <div class="tonearm-bar">
              <div class="tonearm-head">
                <div class="tonearm-cartridge"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="tt-controls">
          <button class="tt-btn active" data-speed="33" data-label="33"></button>
          <button class="tt-btn" data-speed="45" data-label="45"></button>
          <button class="tt-power" id="ttPower" aria-label="Ligar"></button>
        </div>
      </div>
      <div class="tt-hint" id="ttHint">✦ toque no botão para tocar o disco ✦</div>
    </div>
  </div>
</section>

<!-- ================= NOW PLAYING BAR ================= -->
<div class="now-playing-sec" id="nowPlaying">
  <div class="np-inner">
    <div class="np-disc" id="npDisc"></div>
    <div class="np-info">
      <div class="np-title" id="npTitle">Escolha uma faixa</div>
      <div class="np-artist" id="npArtist">A agulha está esperando</div>
    </div>
    <div class="np-progress">
      <div class="np-progress-fill" id="npProgress"></div>
    </div>
    <div class="np-controls">
      <button class="np-btn" id="npPlay" aria-label="Play">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="np-btn" id="npNext" aria-label="Próxima">
        <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- ================= SIDE A / TRACK LIST ================= -->
<section class="tracks-sec" id="faixas">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Tracklist</span>
      <h2 class="title">As faixas <em>de nós</em></h2>
      <p class="sub">Cada faixa é uma memória. Toque em qualquer uma para ouvir — o disco começa a girar.</p>
    </div>

    <div class="tracks-wrap">
      <div class="side" data-reveal>
        <div class="side-header">
          <div class="side-label">
            Lado A
            <small>o começo</small>
          </div>
          <div class="side-meta">
            4 faixas<br>
            14:32
          </div>
        </div>
        <div class="track-list" id="sideA"></div>
      </div>

      <div class="side" data-reveal data-d="1">
        <div class="side-header">
          <div class="side-label">
            Lado B
            <small>o depois</small>
          </div>
          <div class="side-meta">
            4 faixas<br>
            15:18
          </div>
        </div>
        <div class="track-list" id="sideB"></div>
      </div>
    </div>
  </div>
</section>

<!-- ================= CRATE / ALBUMS ================= -->
<section class="crate-sec" id="albuns">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">A coleção</span>
      <h2 class="title">Nossos <em>discos</em></h2>
      <p class="sub">Cada álbum é um capítulo da nossa história. Passe o mouse — o disco sai da capa.</p>
    </div>

    <div class="crate-scroll" id="crateScroll" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= LINER NOTES / LETTER ================= -->
<section class="liner-sec" id="carta">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Liner notes</span>
      <h2 class="title">O que está <em>escrito na capa</em></h2>
      <p class="sub">Toda capa de disco tem liner notes. Essas são as nossas.</p>
    </div>

    <div class="liner-paper" data-reveal data-d="1">
      <div class="liner-header">
        <div class="liner-header-left">Notas do produtor</div>
        <div class="liner-header-right">Faixa 1 a 8</div>
      </div>
      <h3 class="liner-title">Sobre o disco que a gente gravou sem perceber</h3>
      <p>Este álbum não foi gravado em estúdio. Foi gravado nos intervalos entre uma conversa e outra, nos silêncios de madrugada, nas risadas que ninguém mais entendeu.</p>
      <p>A agulha caiu no primeiro dia em que a gente se viu, e nunca mais levantou. Cada faixa foi composta sem ensaio — <em>ao vivo, sem retoque</em>.</p>
      <p>O Lado A é o começo: as descobertas, os primeiros "eu te amo", o medo de estragar tudo. O Lado B é o depois: as certezas, as rotinas que viraram lar, o silêncio confortável.</p>
      <p>Este disco é para você. Ouça devagar. Deixe a agulha correr. E quando chegar ao fim — <em>vire o lado</em>.</p>
      <div class="liner-sign">— Com amor, quem gravou ✦</div>
      <div class="liner-stamp">SELO<br>DO<br>AMOR<br>∞</div>
    </div>
  </div>
</section>

<!-- ================= DEDICATIONS ================= -->
<section class="dedications-sec" id="dedicatorias">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Dedicatórias</span>
      <h2 class="title">Faixas <em>para você</em></h2>
      <p class="sub">Algumas músicas foram escritas para outras pessoas. Essas foram escritas para você.</p>
    </div>

    <div class="dedications-grid">
      <div class="dedication" data-reveal>
        <div class="dedication-num">Dedicatória 01</div>
        <div class="dedication-song">Perfect</div>
        <div class="dedication-artist">Ed Sheeran</div>
        <p class="dedication-msg">Toda vez que toca, eu lembro daquela noite em que a gente dançou na cozinha sem música. Foi ali que eu tive certeza.</p>
      </div>

      <div class="dedication" data-reveal data-d="1">
        <div class="dedication-num">Dedicatória 02</div>
        <div class="dedication-song">A Thousand Years</div>
        <div class="dedication-artist">Christina Perri</div>
        <p class="dedication-msg">Porque parece que eu te esperei por mil anos antes de te encontrar. E aí você chegou — e o tempo parou.</p>
      </div>

      <div class="dedication" data-reveal data-d="2">
        <div class="dedication-num">Dedicatória 03</div>
        <div class="dedication-song">La Vie en Rose</div>
        <div class="dedication-artist">Édith Piaf</div>
        <p class="dedication-msg">A vida fica cor-de-rosa quando você está por perto. Não é clichê — é a mais pura verdade.</p>
      </div>

      <div class="dedication" data-reveal data-d="3">
        <div class="dedication-num">Dedicatória 04</div>
        <div class="dedication-song">Can't Help Falling in Love</div>
        <div class="dedication-artist">Elvis Presley</div>
        <p class="dedication-msg">Alguns dizem que só os tolos se apaixonam. Mas eu não consegui evitar. E não me arrependo nem um pouco.</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= SIDE B EASTER EGG ================= -->
<section class="side-b-sec" id="lado-b">
  <div class="side-b-lock" id="sideBLock"></div>
  <h2 class="side-b-title">Algumas faixas <em>só tocam</em> quando você descobre</h2>
  <p class="side-b-sub">Todo disco tem uma faixa escondida. Este tem a mais importante de todas. Toque o cadeado.</p>
  <p class="side-b-hint" id="sideBHint">✦ toque no cadeado ✦</p>

  <div class="side-b-content" id="sideBContent">
    <div class="side-b-message">
      <p>Se você chegou até aqui, é porque ouviu cada faixa com o coração aberto.</p>
      <p>O que eu mais quero dizer é simples: <em>obrigado por existir.</em> Pelo tempo, pelas risadas, pelos silêncios.</p>
      <p>Que este disco nunca pare de girar. E que a nossa agulha nunca levante.</p>
      <p class="sig">— Quem escolheu você como trilha sonora ✦</p>
    </div>
  </div>
</section>

<footer>
  <div class="footer-vinyl"></div>
  <p>Feito com agulha, tempo e um pouco de saudade — para a pessoa que virou minha trilha sonora.</p>
  <div class="f-mark">Nosso Vinil</div>
  <small>Lado A · Lado B · Para sempre</small>
</footer>

<!-- ALBUM MODAL -->
<div id="albumModal">
  <div class="album-modal-inner" id="albumModalInner"></div>
</div>

<div id="toast"></div>
<button id="toTop" aria-label="Voltar ao topo">↑</button>

<!-- ÁUDIO -->
<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
