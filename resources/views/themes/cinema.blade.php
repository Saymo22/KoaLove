<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
@include('partials.seo')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,700&family=Bebas+Neue&family=Cinzel:wght@400;500;600;700&family=Special+Elite&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet">




    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/cinema.css","resources/js/entries/themes-cinema.js"])
</head>
<body>
    @include('partials.noscript')

<!-- CURSOR -->
<div class="cursor" id="cursor">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2l8 8-3 1 5 5 1-3 8 8-9-1-1 9-8-8 3-1-5-5-1 3z" fill="#d4a444" stroke="#0a0605" stroke-width="1"/>
  </svg>
</div>

<!-- SCROLL -->
<div class="scroll-bar" id="scrollBar"></div>

<!-- LOADER -->
<div id="loader">
  <div class="loader-reel">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#d4a444" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#8a6a2a" stroke-width=".5"/>
      <circle cx="50" cy="50" r="12" class="reel-center"/>
      <circle cx="50" cy="18" r="7" class="hole"/>
      <circle cx="50" cy="82" r="7" class="hole"/>
      <circle cx="18" cy="50" r="7" class="hole"/>
      <circle cx="82" cy="50" r="7" class="hole"/>
      <circle cx="27" cy="27" r="5" class="hole"/>
      <circle cx="73" cy="27" r="5" class="hole"/>
      <circle cx="27" cy="73" r="5" class="hole"/>
      <circle cx="73" cy="73" r="5" class="hole"/>
    </svg>
  </div>
  <div class="loader-countdown">3</div>
  <div class="loader-text">Preparando a sessão</div>
</div>

<!-- ================= HERO ================= -->
<section class="hero" id="inicio">
  <div class="hero-beams">
    <div class="beam b1"></div>
    <div class="beam b2"></div>
    <div class="beam b3"></div>
  </div>

  <div class="hero-inner">
    <div class="marquee-board">
      <div class="marquee-bulbs" id="heroBulbs"></div>
      <div class="marquee-eyebrow">Now Showing</div>
      <h1 class="marquee-title">
        O Nosso Filme
        <span class="highlight">Uma história em 24 quadros</span>
      </h1>
      <p class="marquee-tagline">A sessão começa quando você quiser. Os créditos nunca terminam.</p>
    </div>

    <div class="hero-info">
      <div class="info-item">
        <span class="info-label">Direção</span>
        <span class="info-value">Nós dois</span>
      </div>
      <div class="info-item">
        <span class="info-label">Gênero</span>
        <span class="info-value">Romance · Drama</span>
      </div>
      <div class="info-item">
        <span class="info-label">Duração</span>
        <span class="info-value">Para sempre</span>
      </div>
      <div class="info-item">
        <span class="info-label">Classificação</span>
        <span class="info-value">Livre · ♥</span>
      </div>
    </div>
  </div>

  <div class="hero-filmstrip"></div>

  <div class="scroll-cue">
    <span>Role</span>
    <div class="arrow"></div>
  </div>
</section>

<!-- ================= OPENING CREDITS ================= -->
<section class="credits-sec">
  <div class="credits-inner">
    <div data-reveal>
      <span class="eyebrow center">Abertura</span>
      <h2 class="title">Ficha <em>técnica</em></h2>
      <p class="na-original-1 sub">Todo grande filme tem uma equipe. Este aqui tem só dois nomes — mas cada um faz tudo.</p>
    </div>

    <div class="credits-block" data-reveal>
      <div class="credits-role">Direção</div>
      <div class="credits-name">
        Nós dois
        <em>de mãos dadas desde o primeiro dia</em>
      </div>
    </div>

    <div class="credits-block" data-reveal data-d="1">
      <div class="credits-role">Roteiro</div>
      <div class="credits-name">
        O acaso
        <em>que virou destino sem avisar</em>
      </div>
    </div>

    <div class="credits-block" data-reveal data-d="2">
      <div class="credits-role">Trilha Sonora</div>
      <div class="credits-name">
        Nossas memórias
        <em>em cada faixa, uma lembrança</em>
      </div>
    </div>

    <div class="credits-block" data-reveal data-d="3">
      <div class="credits-role">Elenco Principal</div>
      <div class="credits-name">
        Você &amp; Eu
        <em>em todos os papéis — sempre</em>
      </div>
    </div>

    <div class="credits-block" data-reveal data-d="4">
      <div class="credits-role">Produção Executiva</div>
      <div class="credits-name">
        O amor
        <em>que nunca saiu dos créditos</em>
      </div>
    </div>
  </div>
</section>

<!-- ================= FEATURE PRESENTATION / POSTERS ================= -->
<section class="feature-sec" id="sessoes">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Sessões</span>
      <h2 class="title">Nossos <em>grandes filmes</em></h2>
      <p class="sub">Cada capítulo da nossa história virou um filme. Clique em qualquer pôster para abrir a ficha técnica.</p>
    </div>

    <div class="feature-grid" id="featureGrid" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= FILM REEL TIMELINE ================= -->
<section class="reel-sec" id="reel">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">O rolo</span>
      <h2 class="title">Quadro a <em>quadro</em></h2>
      <p class="sub">Cada fotograma é um momento. Juntos, eles formam o nosso rolo — e ele não tem fim.</p>
    </div>

    <div class="reel-wrap">
      <div class="reel-deco">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#d4a444" stroke-width="1.5">
          <circle cx="50" cy="50" r="45"/>
          <circle cx="50" cy="50" r="12" fill="#d4a444"/>
          <circle cx="50" cy="18" r="6" fill="none"/>
          <circle cx="50" cy="82" r="6" fill="none"/>
          <circle cx="18" cy="50" r="6" fill="none"/>
          <circle cx="82" cy="50" r="6" fill="none"/>
        </svg>
      </div>

      <div class="reel-frames">
        <div class="frame" data-reveal>
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Cena 01 · Abertura</span>
              <span class="frame-scene">2018</span>
            </div>
            <h3 class="frame-title">O primeiro olhar</h3>
            <p class="frame-desc">O quadro que abriu o filme. Um olhar, um sorriso, e o resto — todo o resto — virou história.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="1">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Cena 02 · Conflito</span>
              <span class="frame-scene">2019</span>
            </div>
            <h3 class="frame-title">A primeira tempestade</h3>
            <p class="frame-desc">Nem todo filme é só romance. Tivemos nossos dramas — mas o roteiro sempre nos levava de volta um ao outro.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="2">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Cena 03 · Virada</span>
              <span class="frame-scene">2021</span>
            </div>
            <h3 class="frame-title">A viagem que mudou tudo</h3>
            <p class="frame-desc">O plano sequência mais bonito do filme. Três dias, dois destinos, uma câmera — e a certeza de que era você.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="3">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Cena 04 · Clímax</span>
              <span class="frame-scene">Hoje</span>
            </div>
            <h3 class="frame-title">O grande "sim"</h3>
            <p class="frame-desc">A cena que todo mundo esperava. O momento em que o roteiro deixou de ser escrito — e passou a ser vivido.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="4">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Cena 05 · Continua</span>
              <span class="frame-scene">Sempre</span>
            </div>
            <h3 class="frame-title">O final que não termina</h3>
            <p class="frame-desc">Porque não é um final — é uma sequência. E a gente continua escrevendo, cena por cena, sem pressa de terminar.</p>
          </div>
        </div>
      </div>

      <div class="reel-frames">
        <div class="frame" data-reveal>
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Take 01 · Bastidores</span>
              <span class="frame-scene">Extra</span>
            </div>
            <h3 class="frame-title">Fora de cena</h3>
            <p class="frame-desc">As risadas que não entraram no corte final. As piadas internas. Os erros que ninguém viu — e que a gente nunca esqueceu.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="1">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Take 02 · Bastidores</span>
              <span class="frame-scene">Extra</span>
            </div>
            <h3 class="frame-title">O making of</h3>
            <p class="frame-desc">Todo grande filme tem um making of. O nosso é feito de madrugadas, cafés, séries e o silêncio mais confortável do mundo.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="2">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Take 03 · Cena deletada</span>
              <span class="frame-scene">Extra</span>
            </div>
            <h3 class="frame-title">A briga boba</h3>
            <p class="frame-desc">Ficou fora do corte final. Mas rendeu uma das melhores reconciliações — e uma das melhores risadas.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="3">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Take 04 · Cena favorita</span>
              <span class="frame-scene">Extra</span>
            </div>
            <h3 class="frame-title">O café da manhã</h3>
            <p class="frame-desc">Nada acontece. E é exatamente por isso que é a nossa cena favorita. Porque o amor mora no comum.</p>
          </div>
        </div>

        <div class="frame" data-reveal data-d="4">
          <div class="frame-content">
            <div class="frame-header">
              <span class="frame-date">Take 05 · Próximo filme</span>
              <span class="frame-scene">Em breve</span>
            </div>
            <h3 class="frame-title">A sequência</h3>
            <p class="frame-desc">Já estamos escrevendo. O roteiro está sendo feito todos os dias — e cada dia é uma cena nova.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= CINEMA STATS ================= -->
<section class="stats-sec">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Bilheteria</span>
      <h2 class="title">Nossos <em>números</em></h2>
      <p class="sub">Todo grande filme tem estatísticas. Essas são as nossas — e são impressionantes.</p>
    </div>

    <div class="stats-grid" data-reveal data-d="1">
      <div class="stat-card">
        <span class="stat-icon">🎬</span>
        <span class="stat-num" data-count="12847">0</span>
        <span class="stat-label">Cenas filmadas</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🍿</span>
        <span class="stat-num" data-count="384">0</span>
        <span class="stat-label">Sessões assistidas</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">❤️</span>
        <span class="stat-num" data-count="9999">0</span>
        <span class="stat-label">"Eu te amo" ditos</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⭐</span>
        <span class="stat-num" data-count="5000">0</span>
        <span class="stat-label">Estrelas no céu</span>
      </div>
    </div>
  </div>
</section>

<!-- ================= STORIES / BEHIND THE SCENES ================= -->
<section class="stories-sec" id="stories">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Bastidores</span>
      <h2 class="title">Cenas <em>exclusivas</em></h2>
      <p class="sub">Todo filme tem cenas que não entram no trailer. Essas são as nossas — só você vê.</p>
    </div>
    <div class="stories-rail" id="storiesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= DIRECTOR'S NOTES ================= -->
<section class="letter-sec" id="carta">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Notas do diretor</span>
      <h2 class="title">A cena que eu <em>escrevi para você</em></h2>
      <p class="sub">Todo diretor tem uma cena favorita. A minha é essa — e só existe porque você existe.</p>
    </div>

    <div class="letter-stage" data-reveal data-d="1">
      <div class="clapperboard">
        <div class="clapper-top"></div>
        <div class="clapper-body">
          <div class="clapper-meta">
            <div class="clapper-field">
              <span class="clapper-label">Produção</span>
              <span class="clapper-value">Nosso Filme</span>
            </div>
            <div class="clapper-field">
              <span class="clapper-label">Cena</span>
              <span class="clapper-value">A <em>eterna</em></span>
            </div>
            <div class="clapper-field">
              <span class="clapper-label">Take</span>
              <span class="clapper-value">∞</span>
            </div>
            <div class="clapper-field">
              <span class="clapper-label">Direção</span>
              <span class="clapper-value">O <em>amor</em></span>
            </div>
          </div>

          <h3 class="clapper-title">Querida(o),</h3>

          <div class="clapper-paper">
            <p>Se este filme fosse um só quadro, seria o do seu sorriso quando você acorda. Nada mais bonito foi filmado — e olha que já rodamos muitas cenas.</p>
            <p>Eu revi todos os takes. Todas as cenas. E em nenhuma delas eu apareço melhor do que quando estou com você. É você quem me faz atuar bem.</p>
            <p>Obrigado por ser minha co-protagonista. Minha plateia. Minha crítica mais sincera. Minha fã número um.</p>
            <p>E obrigado, acima de tudo, por continuar em cartaz. Que a sessão nunca acabe.</p>
            <div class="sig">Com amor,<br>— o diretor ✦</div>
          </div>

          <div class="clapper-signature">
            <span class="clapper-sign-label">Assinado por</span>
            <span class="clapper-sign-sig">Nós dois</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= AWARDS ================= -->
<section class="awards-sec" id="premios">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Premiações</span>
      <h2 class="title">Os <em>nossos prêmios</em></h2>
      <p class="sub">Nenhum filme ganha tudo. Mas o nosso já ganhou os prêmios que mais importam.</p>
    </div>

    <div class="awards-grid" data-reveal data-d="1">
      <div class="award">
        <span class="award-icon">🏆</span>
        <div class="award-title">Melhor Filme</div>
        <p class="award-desc">Pelo conjunto da obra — todos os dias, sem exceção.</p>
      </div>
      <div class="award">
        <span class="award-icon">🌟</span>
        <div class="award-title">Melhor Roteiro</div>
        <p class="award-desc">Porque ninguém escreveria uma história tão boa quanto a nossa.</p>
      </div>
      <div class="award">
        <span class="award-icon">❤️</span>
        <div class="award-title">Melhor Casal</div>
        <p class="award-desc">Por unanimidade. Sem concorrência. Sempre.</p>
      </div>
      <div class="award">
        <span class="award-icon">🎬</span>
        <div class="award-title">Melhor Direção</div>
        <p class="award-desc">Por dirigir a nossa vida para o melhor caminho: um para o outro.</p>
      </div>
    </div>
  </div>
</section>

<!-- ================= POPCORN RATING ================= -->
<section class="popcorn-sec" id="avaliacao">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Avaliação</span>
      <h2 class="title">Quantas <em>pipocas</em> você dá?</h2>
      <p class="sub">Todo grande filme tem uma nota. O nosso já tem a nota máxima — mas quero ver você tentar dar menos.</p>
    </div>

    <div class="popcorn-stage" data-reveal data-d="1">
      <div class="popcorn-title">Avalie o nosso filme</div>
      <div class="popcorn-rating" id="popcornRating">
        <span class="popcorn-icon" data-rating="1">🍿</span>
        <span class="popcorn-icon" data-rating="2">🍿</span>
        <span class="popcorn-icon" data-rating="3">🍿</span>
        <span class="popcorn-icon" data-rating="4">🍿</span>
        <span class="popcorn-icon" data-rating="5">🍿</span>
      </div>
      <p class="popcorn-hint" id="popcornHint">Passe o mouse e clique em uma pipoca</p>
    </div>
  </div>
</section>

<!-- ================= END CREDITS ================= -->
<section class="end-credits-sec" id="final">
  <div class="end-credits-inner">
    <div class="end-title">Fim</div>
    <div class="end-letters" id="endLetters"></div>
    <p class="end-sub">Mas nunca um fim de verdade. Só um "até a próxima sessão".</p>

    <div class="end-message">
      <p>Obrigado por assistir até aqui. Obrigado por ser o melhor filme da minha vida.</p>
      <p>Se um dia a gente se perder, olha para trás — <em>as cenas estão todas guardadas.</em></p>
      <p>E quando você quiser, é só voltar. <em>A sessão nunca fecha.</em></p>
      <div class="end-sig">— o diretor ✦</div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-icon">🎬</div>
  <p>Feito com luz, sombra e um pouco de saudade — para a pessoa que virou o meu filme favorito.</p>
  <div class="f-mark">O NOSSO FILME</div>
  <small>Em cartaz · para sempre</small>
</footer>

<!-- POSTER MODAL -->
<div id="posterModal">
  <div class="pm-inner" id="posterModalInner"></div>
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
        <div class="story-name" id="storyName">Nosso Filme</div>
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
  <source src="https://www.soundhelix.com/examples/mp3/Sound-Helix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
