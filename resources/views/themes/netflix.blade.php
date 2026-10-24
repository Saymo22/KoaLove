<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
@include('partials.seo')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Archivo+Black&family=Special+Elite&display=swap" rel="stylesheet">




    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/netflix.css","resources/js/entries/themes-netflix.js"])
</head>
<body>
    @include('partials.noscript')

<!-- AMBIENTE -->
<div class="orbs">
  <div class="orb o1"></div>
  <div class="orb o2"></div>
  <div class="orb o3"></div>
</div>

<!-- CURSOR -->
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<!-- SCROLL PROGRESS -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- LOADER -->
<div id="loader">
  <div class="loader-wrap">
    <div class="loader-logo">
      <span>N</span><span>O</span><span>S</span><span>S</span><span>O</span><span>F</span><span>L</span><span>I</span>
      <span class="plus">+</span>
    </div>
    <div class="loader-shine"></div>
  </div>
  <div class="loader-text">A gente em série</div>
  <div class="loader-bar"><div class="loader-bar-fill"></div></div>
</div>

<!-- PROFILE SELECTOR -->
<div id="profileSelector">
  <div class="ps-logo">NOSSOFLIX<span class="plus">+</span></div>
  <h2 class="ps-title">Quem está assistindo?</h2>
  <div class="ps-profiles">
    <div class="ps-profile" data-profile="nos">
      <div class="ps-avatar ps-avatar-nos">N</div>
      <div class="ps-name">Nós</div>
    </div>
    <div class="ps-profile" data-profile="ele">
      <div class="ps-avatar ps-avatar-ele">E</div>
      <div class="ps-name">Ele</div>
    </div>
    <div class="ps-profile" data-profile="ela">
      <div class="ps-avatar ps-avatar-ela">E</div>
      <div class="ps-name">Ela</div>
    </div>
    <div class="ps-profile" data-profile="amigos">
      <div class="ps-avatar ps-avatar-amigos">A</div>
      <div class="ps-name">Amigos</div>
    </div>
  </div>
  <button class="ps-manage">Gerenciar perfis</button>
</div>

<!-- NAVBAR -->
<nav class="navbar" id="navbar">
  <div class="nav-logo" data-na-action="1">
    NOSSOFLIX<span class="plus">+</span>
  </div>
  <div class="nav-links">
    <a class="nav-link active">Início</a>
    <a class="nav-link">Séries</a>
    <a class="nav-link">Filmes</a>
    <a class="nav-link">Bombando</a>
    <a class="nav-link">Minha lista</a>
  </div>
  <div class="nav-right">
    <button class="nav-icon" id="searchBtn" aria-label="Buscar">
      <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
    </button>
    <button class="nav-icon" id="notifBtn" aria-label="Notificações">
      <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
      <div class="nav-badge"></div>
    </button>
    <div class="nav-profile">
      <div class="nav-profile-avatar">N</div>
      <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
    </div>
  </div>
</nav>

<!-- NOTIFICAÇÕES -->
<div id="notifPanel">
  <div class="notif-header">
    <span>Novidades</span>
    <span class="notif-clear" data-na-action="2">Marcar como lidas</span>
  </div>
  <div class="notif-list" id="notifList"></div>
</div>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="hero-slides" id="heroSlides"></div>
  <div class="hero-controls" id="heroControls"></div>
</section>

<!-- ROWS -->
<div class="rows-wrap" id="rowsWrap"></div>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-col">
        <div class="footer-logo">NOSSOFLIX<span class="plus">+</span></div>
        <p class="footer-tagline">A gente em série</p>
      </div>
      <div class="footer-col">
        <h5>Navegação</h5>
        <a>Início</a>
        <a>Séries</a>
        <a>Filmes</a>
        <a>Minha lista</a>
      </div>
      <div class="footer-col">
        <h5>Sobre nós</h5>
        <a>Quem somos</a>
        <a>Nossa história</a>
        <a>Contato</a>
      </div>
      <div class="footer-col">
        <h5>Legal</h5>
        <a>Termos de uso</a>
        <a>Privacidade</a>
        <a>Cookies</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 NOSSOFLIX+ · Todos os momentos reservados</span>
      <span>Feito com amor, para a pessoa que faz tudo valer a pena</span>
    </div>
  </div>
</footer>

<!-- MODAL -->
<div id="modal">
  <div class="modal-inner" id="modalInner"></div>
</div>

<!-- VIDEO PLAYER -->
<div id="videoPlayer">
  <button class="vp-close" id="vpClose">✕</button>
  <button class="vp-skip" id="vpSkip">
    <span>Pular abertura</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm10 0h2v16h-2V4z"/></svg>
  </button>
  <div class="vp-stage">
    <div class="vp-backdrop" id="vpBackdrop"></div>
    <div class="vp-vignette"></div>
    <div class="vp-center">
      <div class="vp-title" id="vpTitle">Nós: A Série</div>
      <div class="vp-subtitle" id="vpSubtitle">T1 · E1 · O Primeiro Olhar</div>
      <button class="vp-play-big" id="vpPlayBig">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  </div>
  <div class="vp-controls">
    <div class="vp-progress" id="vpProgress">
      <div class="vp-buffered" id="vpBuffered"></div>
      <div class="vp-progress-fill" id="vpProgressFill"></div>
    </div>
    <div class="vp-controls-row">
      <button class="vp-btn" id="vpPlayBtn">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="vp-btn">
        <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
      </button>
      <button class="vp-btn">
        <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      </button>
      <div class="vp-time" id="vpTime">0:00 / 0:30</div>
      <div class="vp-title-bar" id="vpTitleBar">Nós: A Série</div>
      <button class="vp-btn">
        <svg viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v2c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v2c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/></svg>
      </button>
      <button class="vp-btn">
        <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
      </button>
    </div>
  </div>
</div>

<!-- SEARCH -->
<div id="searchOverlay">
  <div class="search-header">
    <div class="search-input-wrap">
      <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <input type="text" id="searchInput" placeholder="Buscar títulos, gêneros, momentos...">
      <div class="search-kbd">
        <kbd>esc</kbd>
      </div>
    </div>
    <button class="search-close" id="searchClose">✕</button>
  </div>
  <div class="search-results-label" id="searchLabel">Sugestões para você</div>
  <div class="search-results" id="searchResults"></div>
</div>

<!-- MUSIC PLAYER -->
<div class="music-player" id="musicPlayer">
  <div class="mp-disc">
    <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=100&q=80&auto=format&fit=crop" alt="">
  </div>
  <div class="mp-info">
    <div class="mp-title" id="mpTitle">Nossa Trilha Sonora</div>
    <div class="mp-artist" id="mpArtist">Lado A · Original</div>
  </div>
  <div class="mp-wave">
    <i></i><i></i><i></i><i></i><i></i>
  </div>
  <button class="mp-btn" id="mpPlay" aria-label="Play">▶</button>
</div>

<div id="toast"></div>
<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
