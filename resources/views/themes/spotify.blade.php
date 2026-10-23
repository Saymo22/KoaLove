<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NOSSO SPOTIFY — A trilha da nossa vida</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">




    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/spotify.css","resources/js/entries/themes-spotify.js"])
</head>
<body>

<!-- AMBIENT BLOBS -->
<div class="ambient-blobs">
  <div class="ambient-blob b1"></div>
  <div class="ambient-blob b2"></div>
</div>

<!-- CURSOR -->
<div class="cursor-dot" id="cDot"></div>
<div class="cursor-ring" id="cRing"></div>

<!-- SCROLL -->
<div class="scroll-bar" id="scrollBar"></div>

<!-- LOADER -->
<div id="loader">
  <div class="loader-bars">
    <span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span>
  </div>
  <div class="loader-text">Sintonizando</div>
</div>

<!-- ============ NAVBAR ============ -->
<nav class="navbar" id="navbar">
  <div class="nav-logo" data-na-action="1">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
    <span class="nav-logo-text">Nosso Spotify</span>
  </div>
  <div class="nav-links">
    <a class="nav-link active">Início</a>
    <a class="nav-link">Playlists</a>
    <a class="nav-link">Favoritas</a>
    <a class="nav-link">Álbuns</a>
    <a class="nav-link">Wrapped</a>
  </div>
  <div class="nav-right">
    <div class="nav-search" id="navSearch">
      <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <span>Buscar</span>
    </div>
    <div class="nav-avatar">N</div>
  </div>
</nav>

<!-- ============ HERO ============ -->
<section class="hero" id="inicio">
  <div class="hero-inner">
    <div class="hero-text">
      <div class="hero-badge">
        <span class="dot"></span>
        Playlist oficial · 2024
      </div>
      <h1 class="hero-title">
        <span>Nosso</span>
        <em>Spotify</em>
      </h1>
      <p class="hero-sub">
        Toda história merece uma trilha sonora. A nossa tem <strong>365 faixas</strong>, <strong>8 playlists</strong> e um único artista favorito: <strong>nós dois</strong>.
      </p>
      <div class="hero-actions">
        <button class="btn-play" id="heroPlay">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          Tocar tudo
        </button>
        <button class="btn-outline" data-na-scroll="tracks">
          <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          Ver faixas
        </button>
      </div>
    </div>

    <div class="hero-visual">
      <div class="hero-cover">
        <div class="playing-badge">
          <div class="mini-eq"><i></i><i></i><i></i><i></i></div>
          Playing
        </div>
        <div class="hero-cover-inner">
          <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=85&auto=format&fit=crop" alt="Nosso Spotify">
          <div class="hero-cover-label">
            <div class="hero-cover-tag">Playlist</div>
            <div class="hero-cover-title">A Trilha da Nossa Vida</div>
            <div class="hero-cover-sub">365 faixas · 24h 12min</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PLAYLISTS ============ -->
<section class="playlists-sec" id="playlists">
  <div class="wrap">
    <div class="section-header" data-reveal>
      <div>
        <span class="eyebrow">Playlists</span>
        <h2 class="title">Nossas <em>coleções</em></h2>
      </div>
      <a class="see-all">Ver todas →</a>
    </div>
    <div class="playlists-grid" id="playlistsGrid" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ TRACKS LIST ============ -->
<section class="tracks-sec" id="tracks">
  <div class="wrap">
    <div class="section-header" data-reveal>
      <div>
        <span class="eyebrow">Faixas favoritas</span>
        <h2 class="title">As músicas que <em>nos definem</em></h2>
        <p class="sub">Toque em qualquer faixa para começar a tocar. O player vai acompanhar você até o fim.</p>
      </div>
    </div>

    <div data-reveal data-d="1">
      <div class="tracks-header">
        <div class="th-num">#</div>
        <div>Título</div>
        <div>Álbum</div>
        <div class="th-plays">Reproduções</div>
        <div class="th-dur">⏱</div>
      </div>
      <div id="tracksList"></div>
    </div>
  </div>
</section>

<!-- ============ WRAPPED STATS ============ -->
<section class="wrapped-sec" id="wrapped">
  <div class="wrapped-bg-text">2024</div>
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Wrapped · 2024</span>
      <h2 class="title">O nosso <em>ano em música</em></h2>
      <p class="sub">Todo fim de ano, o Spotify faz o Wrapped. Esse aqui é o nosso — e é bem mais pessoal.</p>
    </div>

    <div class="stats-grid" data-reveal data-d="1">
      <div class="stat-card">
        <span class="stat-num" data-count="12847">0</span>
        <span class="stat-label">Minutos ouvidos</span>
        <span class="stat-desc">O equivalente a 8 dias inteiros ouvindo só a gente</span>
      </div>
      <div class="stat-card">
        <span class="stat-num" data-count="365">0</span>
        <span class="stat-label">Faixas diferentes</span>
        <span class="stat-desc">Uma para cada dia do ano — e algumas repetidas</span>
      </div>
      <div class="stat-card">
        <span class="stat-num" data-count="42">0</span>
        <span class="stat-label">Artistas favoritos</span>
        <span class="stat-desc">Mas no fim, o favorito sempre foi você</span>
      </div>
      <div class="stat-card">
        <span class="stat-num" data-count="99">0</span>
        <span class="stat-label">% de compatibilidade</span>
        <span class="stat-desc">O Spotify confirma: nossos gostos combinam</span>
      </div>
    </div>
  </div>
</section>

<!-- ============ TOP TRACKS CHART ============ -->
<section class="chart-sec" id="top">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Top 5</span>
      <h2 class="title">As mais <em>tocadas</em></h2>
      <p class="sub">Cinco músicas que, segundo o Spotify, mais tocaram na nossa história — e que nunca vão sair do repeat.</p>
    </div>

    <div class="chart-list" data-reveal data-d="1">
      <div class="chart-item">
        <div class="chart-num">1</div>
        <div class="chart-cover"><img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=100&q=80&auto=format&fit=crop" alt=""></div>
        <div class="chart-info">
          <div class="chart-title">Perfect</div>
          <div class="chart-artist">Ed Sheeran</div>
        </div>
        <div class="chart-plays"><strong>1.284</strong> plays</div>
      </div>

      <div class="chart-item">
        <div class="chart-num">2</div>
        <div class="chart-cover"><img src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=100&q=80&auto=format&fit=crop" alt=""></div>
        <div class="chart-info">
          <div class="chart-title">A Thousand Years</div>
          <div class="chart-artist">Christina Perri</div>
        </div>
        <div class="chart-plays"><strong>1.062</strong> plays</div>
      </div>

      <div class="chart-item">
        <div class="chart-num">3</div>
        <div class="chart-cover"><img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&q=80&auto=format&fit=crop" alt=""></div>
        <div class="chart-info">
          <div class="chart-title">La Vie En Rose</div>
          <div class="chart-artist">Édith Piaf</div>
        </div>
        <div class="chart-plays"><strong>978</strong> plays</div>
      </div>

      <div class="chart-item">
        <div class="chart-num">4</div>
        <div class="chart-cover"><img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&q=80&auto=format&fit=crop" alt=""></div>
        <div class="chart-info">
          <div class="chart-title">Can't Help Falling in Love</div>
          <div class="chart-artist">Elvis Presley</div>
        </div>
        <div class="chart-plays"><strong>845</strong> plays</div>
      </div>

      <div class="chart-item">
        <div class="chart-num">5</div>
        <div class="chart-cover"><img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=100&q=80&auto=format&fit=crop" alt=""></div>
        <div class="chart-info">
          <div class="chart-title">Nossa Canção</div>
          <div class="chart-artist">Nós dois</div>
        </div>
        <div class="chart-plays"><strong>∞</strong> plays</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ VISUALIZER ============ -->
<section class="visualizer-sec" id="ondas">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Ao vivo</span>
      <h2 class="title">Nosso som <em>em ondas</em></h2>
      <p class="sub">Cada batida é uma memória. Dê play e veja a nossa história dançar.</p>
    </div>

    <div class="visualizer" id="visualizer" data-reveal data-d="1"></div>

    <button class="viz-play-btn" id="vizPlayBtn" data-reveal data-d="2">
      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      Tocar visualização
    </button>
  </div>
</section>

<!-- ============ LYRICS ============ -->
<section class="lyrics-sec" id="lyrics">
  <div class="lyrics-quote" data-reveal>
    <span class="lyrics-mark">"</span>
    <div class="lyrics-text" id="lyricsText"></div>
    <div class="lyrics-source">— <strong>Perfect</strong> · Ed Sheeran · <strong>nossa música</strong></div>
    <div class="lyrics-divider"></div>
  </div>
</section>

<!-- ============ ALBUMS GRID ============ -->
<section class="albums-sec" id="albums">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Discografia</span>
      <h2 class="title">Nossos <em>álbuns</em></h2>
      <p class="sub">Cada álbum é um capítulo. Cada capa é uma memória. Cada faixa, um pedaço de nós.</p>
    </div>

    <div class="albums-grid" id="albumsGrid" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ FEATURED ALBUM ============ -->
<section class="featured-sec" id="featured">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Em destaque</span>
      <h2 class="title">O álbum da <em>nossa vida</em></h2>
    </div>

    <div class="featured-grid" data-reveal data-d="1">
      <div class="featured-cover">
        <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1000&q=85&auto=format&fit=crop" alt="Nosso Álbum">
      </div>
      <div class="featured-info">
        <span class="featured-tag">Álbum de estreia</span>
        <h3 class="featured-title">A Trilha da Nossa Vida</h3>
        <p class="featured-desc">
          O primeiro álbum que gravamos juntos. Doze faixas, mil histórias, e uma verdade que se repete em cada refrão: <em>tudo começou com você</em>.
        </p>
        <div class="featured-meta">
          <div class="featured-meta-item">
            <span class="featured-meta-label">Faixas</span>
            <span class="featured-meta-value">12</span>
          </div>
          <div class="featured-meta-item">
            <span class="featured-meta-label">Duração</span>
            <span class="featured-meta-value">48 min</span>
          </div>
          <div class="featured-meta-item">
            <span class="featured-meta-label">Lançamento</span>
            <span class="featured-meta-value">2018</span>
          </div>
          <div class="featured-meta-item">
            <span class="featured-meta-label">Selo</span>
            <span class="featured-meta-value">Nós Dois</span>
          </div>
        </div>
        <div class="featured-actions">
          <button class="btn-play" id="featuredPlay">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Tocar álbum
          </button>
          <button class="btn-outline">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Curtir
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ MEMORIES / STORIES ============ -->
<section class="memories-sec" id="memories">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Momentos</span>
      <h2 class="title">Clipes <em>da nossa vida</em></h2>
      <p class="sub">Cada foto é um clipe. Cada clipe, uma música. Toque em qualquer um para reviver.</p>
    </div>
    <div class="memories-scroll" id="memoriesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ LETTER ============ -->
<section class="letter-sec" id="carta">
  <div class="letter-inner">
    <div class="na-original-1 center-text" data-reveal>
      <span class="eyebrow center">Uma mensagem</span>
      <h2 class="title">O que eu queria que o <em>Spotify</em> dissesse</h2>
    </div>

    <div class="letter-card" data-reveal data-d="1">
      <div class="letter-tag">For you</div>
      <h3 class="letter-title">Se o Spotify lesse o meu coração</h3>
      <div class="letter-body">
        <p>Se o Spotify lesse o meu coração, a nossa playlist teria mais de <em>365 mil faixas</em> — uma para cada segundo em que eu penso em você.</p>
        <p>O artista mais ouvido seria <em>a sua voz</em>. A faixa mais tocada seria <em>o seu riso</em>. E o gênero favorito seria aquele que só existe quando a gente está junto.</p>
        <p>Eu não preciso de algoritmo. Eu já sei qual é a música que combina comigo: é essa que a gente constrói todos os dias, nota por nota, verso por verso.</p>
        <p>Continue tocando. Eu continuo dançando — só com você.</p>
      </div>
      <div class="letter-sign">— Com amor, seu fã número 1 ✦</div>
    </div>
  </div>
</section>

<!-- ============ CTA ============ -->
<section class="cta-sec">
  <div class="cta-inner" data-reveal>
    <h2 class="cta-title">Sua playlist<br>favorita começa <em>agora</em></h2>
    <p class="cta-sub">Um clique, uma música, uma memória. O repeat é infinito — assim como o que sinto por você.</p>
    <div class="cta-actions">
      <button class="btn-play" id="ctaPlay">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        Dar play em nós
      </button>
      <button class="btn-outline">
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Favoritar
      </button>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          <span class="footer-logo-text">Nosso Spotify</span>
        </div>
        <p class="footer-tagline">A trilha sonora de uma história que nunca sai do repeat.</p>
      </div>
      <div class="footer-col">
        <h5>Navegar</h5>
        <a>Início</a>
        <a>Playlists</a>
        <a>Álbuns</a>
        <a>Wrapped</a>
      </div>
      <div class="footer-col">
        <h5>Sobre</h5>
        <a>Nossa história</a>
        <a>Contato</a>
        <a>Créditos</a>
      </div>
      <div class="footer-col">
        <h5>Legal</h5>
        <a>Termos</a>
        <a>Privacidade</a>
        <a>Cookies</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 Nosso Spotify · Feito com amor, não com algoritmo</span>
      <div class="footer-socials">
        <div class="footer-social">
          <svg viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.87 8.13 6.84 9.45.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48 3.97-1.32 6.83-5.04 6.83-9.45 0-5.5-4.46-9.96-9.96-9.96z"/></svg>
        </div>
        <div class="footer-social">
          <svg viewBox="0 0 24 24"><path d="M12 2.16c-3.09 0-3.48.01-4.69.07-1.21.06-2.04.25-2.76.53-.75.29-1.38.68-2.01 1.31S1.54 5.29 1.25 6.04c-.28.72-.47 1.55-.53 2.76C.66 10.01.65 10.4.65 12s.01 1.99.07 3.2c.06 1.21.25 2.04.53 2.76.29.75.68 1.38 1.31 2.01s1.26 1.02 2.01 1.31c.72.28 1.55.47 2.76.53 1.21.06 1.6.07 4.69.07s3.48-.01 4.69-.07c1.21-.06 2.04-.25 2.76-.53.75-.29 1.38-.68 2.01-1.31s1.02-1.26 1.31-2.01c.28-.72.47-1.55.53-2.76.06-1.21.07-1.6.07-4.69s-.01-3.48-.07-4.69c-.06-1.21-.25-2.04-.53-2.76-.29-.75-.68-1.38-1.31-2.01s-1.26-1.02-2.01-1.31c-.72-.28-1.55-.47-2.76-.53-1.21-.06-1.6-.07-4.69-.07zm0 1.8c3.04 0 3.4.01 4.6.07 1.11.05 1.71.24 2.11.39.53.21.91.45 1.31.85s.64.78.85 1.31c.16.4.34 1 .39 2.11.06 1.2.07 1.56.07 4.6s-.01 3.4-.07 4.6c-.05 1.11-.24 1.71-.39 2.11-.21.53-.45.91-.85 1.31s-.78.64-1.31.85c-.4.16-1 .34-2.11.39-1.2.06-1.56.07-4.6.07s-3.4-.01-4.6-.07c-1.11-.05-1.71-.24-2.11-.39-.53-.21-.91-.45-1.31-.85s-.64-.78-.85-1.31c-.16-.4-.34-1-.39-2.11-.06-1.2-.07-1.56-.07-4.6s.01-3.4.07-4.6c.05-1.11.24-1.71.39-2.11.21-.53.45-.91.85-1.31s.78-.64 1.31-.85c.4-.16 1-.34 2.11-.39 1.2-.06 1.56-.07 4.6-.07zm0 3.06c-2.75 0-4.98 2.23-4.98 4.98s2.23 4.98 4.98 4.98 4.98-2.23 4.98-4.98-2.23-4.98-4.98-4.98zm0 8.21c-1.78 0-3.23-1.45-3.23-3.23s1.45-3.23 3.23-3.23 3.23 1.45 3.23 3.23-1.45 3.23-3.23 3.23zm6.34-8.41c0 .64-.52 1.16-1.16 1.16s-1.16-.52-1.16-1.16.52-1.16 1.16-1.16 1.16.52 1.16 1.16z"/></svg>
        </div>
        <div class="footer-social">
          <svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </div>
      </div>
    </div>
  </div>
</footer>

<!-- ============ NOW PLAYING BAR ============ -->
<div class="now-playing-bar" id="nowPlayingBar">
  <div class="npb-left">
    <div class="npb-cover"><img id="npbCover" src="" alt=""></div>
    <div class="npb-info">
      <div class="npb-title" id="npbTitle">Escolha uma faixa</div>
      <div class="npb-artist" id="npbArtist">Toque em qualquer música</div>
    </div>
    <button class="npb-like" id="npbLike" aria-label="Curtir">
      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </button>
  </div>
  <div class="npb-center">
    <div class="npb-controls">
      <button class="npb-btn" aria-label="Anterior">
        <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button class="npb-btn npb-play" id="npbPlayBtn" aria-label="Play">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="npb-btn" aria-label="Próxima">
        <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
    </div>
    <div class="npb-progress-row">
      <span class="npb-time" id="npbCurrent">0:00</span>
      <div class="npb-progress" id="npbProgress">
        <div class="npb-progress-fill" id="npbProgressFill"></div>
      </div>
      <span class="npb-time" id="npbDuration">0:00</span>
    </div>
  </div>
  <div class="npb-right">
    <button class="npb-btn" aria-label="Volume">
      <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
    </button>
    <div class="npb-volume" id="npbVolume">
      <div class="npb-volume-fill" id="npbVolumeFill"></div>
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
        <div class="story-name" id="storyName">Nosso Spotify</div>
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
<button id="toTop" aria-label="Voltar ao topo">↑</button>

<!-- ÁUDIO -->
<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
