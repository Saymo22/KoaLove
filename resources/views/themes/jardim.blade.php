<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>O Jardim Secreto — Para Você</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Caveat:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">



    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/jardim.css","resources/js/entries/themes-jardim.js"])
</head>
<body>

<!-- LOADER -->
<div id="loader">
  <div class="loader-bloom">
    <svg viewBox="0 0 100 100">
      <g class="petal"><ellipse cx="50" cy="35" rx="8" ry="18" fill="#e8a0b0"/></g>
      <g class="petal"><ellipse cx="65" cy="42" rx="8" ry="18" fill="#e8ce7a" transform="rotate(60 50 50)"/></g>
      <g class="petal"><ellipse cx="65" cy="58" rx="8" ry="18" fill="#a8c9b8" transform="rotate(120 50 50)"/></g>
      <g class="petal"><ellipse cx="50" cy="65" rx="8" ry="18" fill="#e8a0b0" transform="rotate(180 50 50)"/></g>
      <g class="petal"><ellipse cx="35" cy="58" rx="8" ry="18" fill="#e8ce7a" transform="rotate(240 50 50)"/></g>
      <g class="petal"><ellipse cx="35" cy="42" rx="8" ry="18" fill="#a8c9b8" transform="rotate(300 50 50)"/></g>
      <circle cx="50" cy="50" r="6" fill="#d4af37"/>
    </svg>
  </div>
  <div class="loader-text">Abrindo o jardim</div>
</div>

<!-- AMBIENTE -->
<div class="bg-layer">
  <div class="bg-blob b1"></div>
  <div class="bg-blob b2"></div>
  <div class="bg-blob b3"></div>
</div>
<div class="grain"></div>
<div class="vignette"></div>
<div id="fireflies"></div>
<div class="scroll-bar" id="scrollBar"></div>
<div class="cursor-dot" id="cDot"></div>
<div class="cursor-ring" id="cRing"></div>

<!-- ================= HERO ================= -->
<section class="hero" id="inicio">
  <div class="hero-bg">
    <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1800&q=85&auto=format&fit=crop" alt="Jardim">
  </div>
  <div class="hero-veil"></div>

  <div class="hero-content">
    <div class="gate-wrap" id="gateWrap">
      <div class="gate-behind"></div>
      <div class="gate-inner">
        <div class="gate-door left">
          <div class="gate-bars"></div>
        </div>
        <div class="gate-door right">
          <div class="gate-bars"></div>
        </div>
      </div>
      <div class="gate-frame"></div>
      <div class="gate-glow"></div>
      <div class="gate-hinge tl"></div>
      <div class="gate-hinge bl"></div>
      <div class="gate-hinge tr"></div>
      <div class="gate-hinge br"></div>
      <div class="gate-lock" id="gateLock">✦</div>
    </div>

    <p class="hero-eyebrow">Um lugar só nosso</p>
    <h1 class="hero-title">
      <span>O Jardim</span>
      <em>Secreto</em>
    </h1>
    <p class="hero-sub">
      Existem lugares que só existem para duas pessoas. Este é o nosso. <strong>Abra o portão</strong> — e entre sem pressa.
    </p>
    <p class="hero-hint">
      <span class="pulse">✦</span> toque no selo para entrar <span class="pulse">✦</span>
    </p>
  </div>

  <div class="scroll-cue">
    <span>Role</span>
    <div class="arrow"></div>
  </div>
</section>

<!-- ================= ENTRADA ================= -->
<section class="entrance-sec" id="entrada">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Bem-vindo ao jardim</span>
      <h2 class="title">Tudo o que <em>cresce aqui</em></h2>
      <p class="sub">Este jardim não foi plantado por mãos comuns. Foi cuidado por pequenas escolhas, regado por dias e noites, e floresceu com o tempo.</p>
    </div>

    <div class="words-row">
      <div class="word-line" data-reveal>
        <span class="w-num">I</span>
        <div class="word-body">
          <h3>Paciência</h3>
          <p>Nem toda flor desabrocha no primeiro sol. Algumas precisam de invernos inteiros. E este jardim cresceu no tempo certo.</p>
        </div>
      </div>
      <div class="word-line" data-reveal data-d="1">
        <span class="w-num">II</span>
        <div class="word-body">
          <h3>Cuidado</h3>
          <p>Regar todos os dias, mesmo quando ninguém vê. Podar com carinho. E deixar que o sol faça o resto — do jeito que só ele sabe.</p>
        </div>
      </div>
      <div class="word-line" data-reveal data-d="2">
        <span class="w-num">III</span>
        <div class="word-body">
          <h3>Presença</h3>
          <p>O jardim mais bonito não é o que tem mais flores. É o que tem alguém cuidando dele. E este tem você. Sempre teve.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= TRILHA ================= -->
<section class="path-sec" id="trilha">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">A trilha</span>
      <h2 class="title">O caminho <em>até aqui</em></h2>
      <p class="sub">Cada pedra foi colocada com cuidado. Cada parada, um marco. Siga a trilha.</p>
    </div>

    <div class="path-wrap" id="pathWrap">
      <svg class="path-svg" viewBox="0 0 100 900" preserveAspectRatio="none">
        <path class="path-line-glow" d="M 50 20 Q 80 200 50 350 Q 20 500 50 650 Q 80 800 50 880"/>
        <path class="path-line" d="M 50 20 Q 80 200 50 350 Q 20 500 50 650 Q 80 800 50 880"/>
      </svg>

      <div class="path-items">
        <div class="path-item" data-reveal>
          <div class="path-body">
            <span class="path-date">O primeiro encontro</span>
            <h3 class="path-title">A semente</h3>
            <p class="path-desc">Toda história de jardim começa com uma semente. A nossa foi um olhar, uma conversa, um "quem sabe".</p>
          </div>
          <div class="path-stone"><span class="path-num">1</span></div>
          <div></div>
        </div>
        <div class="path-item" data-reveal data-d="1">
          <div></div>
          <div class="path-stone"><span class="path-num">2</span></div>
          <div class="path-body">
            <span class="path-date">O primeiro "nós"</span>
            <h3 class="path-title">A primeira flor</h3>
            <p class="path-desc">A primeira vez que algo floresceu entre a gente — sem aviso, sem manual, sem plano. Só aconteceu.</p>
          </div>
        </div>
        <div class="path-item" data-reveal data-d="2">
          <div class="path-body">
            <span class="path-date">As tempestades</span>
            <h3 class="path-title">Quando choveu</h3>
            <p class="path-desc">Toda planta precisa de chuva para crescer. A gente também precisou — e sobreviveu mais forte.</p>
          </div>
          <div class="path-stone"><span class="path-num">3</span></div>
          <div></div>
        </div>
        <div class="path-item" data-reveal data-d="3">
          <div></div>
          <div class="path-stone"><span class="path-num">4</span></div>
          <div class="path-body">
            <span class="path-date">As descobertas</span>
            <h3 class="path-title">O que brotou</h3>
            <p class="path-desc">Descobrimos que o amor não é sobre as flores bonitas — é sobre as raízes. E as nossas foram profundas.</p>
          </div>
        </div>
        <div class="path-item" data-reveal data-d="4">
          <div class="path-body">
            <span class="path-date">Hoje</span>
            <h3 class="path-title">O jardim inteiro</h3>
            <p class="path-desc">Não é mais uma semente. Não é mais uma flor. É um jardim inteiro — cuidado todos os dias, florescendo sempre.</p>
          </div>
          <div class="path-stone"><span class="path-num">∞</span></div>
          <div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= FLORES / GALERIA ================= -->
<section class="garden-sec" id="flores">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">As flores</span>
      <h2 class="title">Cada uma é <em>um momento</em></h2>
      <p class="sub">Passe o mouse sobre cada flor — e veja a memória desabrochar.</p>
    </div>

    <div class="garden" id="garden" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= FONTE ================= -->
<section class="fountain-sec" id="fonte">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">A fonte dos desejos</span>
      <h2 class="title">Peça um <em>desejo</em></h2>
      <p class="sub">Cada jogada na fonte revela um desejo que guardei para você. A fonte sabe mais do que aparenta.</p>
    </div>

    <div class="fountain-stage" data-reveal data-d="1">
      <p class="fountain-msg" id="fountainMsg"></p>

      <svg class="fountain-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a5a48"/>
            <stop offset="100%" stop-color="#1a2e24"/>
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6ea88b"/>
            <stop offset="100%" stop-color="#2d4535"/>
          </linearGradient>
          <radialGradient id="glowGrad">
            <stop offset="0%" stop-color="#e8ce7a" stop-opacity=".6"/>
            <stop offset="100%" stop-color="#e8ce7a" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Pedestal -->
        <ellipse cx="150" cy="278" rx="110" ry="12" fill="#0a1410" opacity=".6"/>
        <path d="M 60 240 Q 60 220 80 218 L 220 218 Q 240 220 240 240 L 230 268 Q 150 278 70 268 Z" fill="url(#stoneGrad)" stroke="#4a7d5c" stroke-width="1"/>

        <!-- Coluna -->
        <path d="M 130 218 L 130 130 Q 150 120 170 130 L 170 218 Z" fill="url(#stoneGrad)" stroke="#4a7d5c" stroke-width="1"/>

        <!-- Bacia -->
        <ellipse cx="150" cy="130" rx="60" ry="14" fill="url(#stoneGrad)" stroke="#4a7d5c" stroke-width="1"/>
        <ellipse cx="150" cy="128" rx="52" ry="10" fill="url(#waterGrad)" class="water"/>

        <!-- Bicas -->
        <circle cx="120" cy="128" r="3" fill="#6ea88b" opacity=".8"/>
        <circle cx="180" cy="128" r="3" fill="#6ea88b" opacity=".8"/>

        <!-- Água caindo -->
        <path d="M 145 128 Q 145 150 148 180" stroke="#6ea88b" stroke-width="1.5" fill="none" opacity=".5" class="water"/>
        <path d="M 155 128 Q 155 150 152 180" stroke="#6ea88b" stroke-width="1.5" fill="none" opacity=".5" class="water"/>
        <path d="M 135 128 Q 135 145 140 165" stroke="#6ea88b" stroke-width="1" fill="none" opacity=".35" class="water"/>
        <path d="M 165 128 Q 165 145 160 165" stroke="#6ea88b" stroke-width="1" fill="none" opacity=".35" class="water"/>

        <!-- Superfície inferior -->
        <ellipse cx="150" cy="218" rx="75" ry="10" fill="url(#waterGrad)" class="water"/>

        <!-- Brilho -->
        <ellipse cx="150" cy="130" rx="40" ry="10" fill="url(#glowGrad)" opacity=".3" class="water"/>
      </svg>

      <button class="fountain-btn" id="fountainBtn"><span>Jogar moeda na fonte ✦</span></button>
    </div>
  </div>
</section>

<!-- ================= CONSTELAÇÃO ================= -->
<section class="sky-sec" id="constelacao">
  <div class="sky-wrap">
    <div class="sky-title center-text" data-reveal>
      <span class="eyebrow center">O céu</span>
      <h2 class="title">A <em>constelação</em> de nós</h2>
      <p class="sub">Cada estrela é uma lembrança. Juntas, formam algo maior. Toque em cada uma.</p>
    </div>

    <div class="constellation" id="constellation" data-reveal data-d="1">
      <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path class="connection" d="M 20 30 L 40 20 L 60 35 L 78 25 L 88 45 L 70 60 L 45 70 L 25 55 Z"/>
        <path class="connection" d="M 20 30 L 25 55 M 78 25 L 70 60"/>
      </svg>
    </div>

    <p class="constellation-caption" data-reveal data-d="2">
      Algumas pessoas são estrelas soltas. Outras, constelações inteiras. Você é a minha — e eu, o seu céu.
    </p>
  </div>
</section>

<!-- ================= ÁRVORE ================= -->
<section class="tree-sec" id="arvore">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">A árvore antiga</span>
      <h2 class="title">O que ela <em>guarda</em></h2>
      <p class="sub">Dizem que as árvores antigas guardam segredos. Esta guarda uma carta. Toque no tronco.</p>
    </div>

    <div class="tree-stage" data-reveal data-d="1">
      <svg class="tree-svg" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        <!-- Tronco -->
        <path class="branch" d="M 200 480 L 200 200 Q 200 180 190 160" stroke-width="30" stroke-linecap="round"/>
        <path class="branch" d="M 200 350 Q 170 320 140 290" stroke-width="14"/>
        <path class="branch" d="M 200 320 Q 240 290 270 250" stroke-width="12"/>
        <path class="branch" d="M 200 260 Q 160 220 130 190" stroke-width="10"/>
        <path class="branch" d="M 200 240 Q 250 210 290 180" stroke-width="10"/>
        <path class="branch" d="M 200 200 Q 180 160 165 130" stroke-width="8"/>

        <!-- Galhos finos -->
        <path class="branch-thin" d="M 140 290 Q 110 270 90 250"/>
        <path class="branch-thin" d="M 140 290 Q 130 260 120 240"/>
        <path class="branch-thin" d="M 270 250 Q 290 230 310 210"/>
        <path class="branch-thin" d="M 270 250 Q 285 270 300 280"/>
        <path class="branch-thin" d="M 130 190 Q 100 175 80 155"/>
        <path class="branch-thin" d="M 130 190 Q 115 170 105 150"/>
        <path class="branch-thin" d="M 290 180 Q 315 165 340 145"/>
        <path class="branch-thin" d="M 290 180 Q 305 160 320 145"/>
        <path class="branch-thin" d="M 165 130 Q 145 115 125 100"/>
        <path class="branch-thin" d="M 165 130 Q 175 105 180 85"/>

        <!-- Folhas -->
        <ellipse class="leaf" cx="90" cy="250" rx="18" ry="10" fill="rgba(74,125,92,.7)" transform="rotate(-30 90 250)"/>
        <ellipse class="leaf" cx="120" cy="240" rx="16" ry="9" fill="rgba(74,125,92,.75)" transform="rotate(-15 120 240)"/>
        <ellipse class="leaf" cx="310" cy="210" rx="18" ry="10" fill="rgba(74,125,92,.7)" transform="rotate(20 310 210)"/>
        <ellipse class="leaf" cx="300" cy="280" rx="16" ry="9" fill="rgba(74,125,92,.65)" transform="rotate(40 300 280)"/>
        <ellipse class="leaf" cx="80" cy="155" rx="20" ry="11" fill="rgba(74,125,92,.75)" transform="rotate(-25 80 155)"/>
        <ellipse class="leaf" cx="105" cy="150" rx="16" ry="9" fill="rgba(74,125,92,.7)" transform="rotate(-10 105 150)"/>
        <ellipse class="leaf" cx="340" cy="145" rx="20" ry="11" fill="rgba(74,125,92,.7)" transform="rotate(25 340 145)"/>
        <ellipse class="leaf" cx="320" cy="145" rx="16" ry="9" fill="rgba(74,125,92,.75)" transform="rotate(15 320 145)"/>
        <ellipse class="leaf" cx="125" cy="100" rx="18" ry="10" fill="rgba(74,125,92,.8)" transform="rotate(-35 125 100)"/>
        <ellipse class="leaf" cx="180" cy="85" rx="16" ry="9" fill="rgba(74,125,92,.75)" transform="rotate(10 180 85)"/>

        <!-- Flores na árvore -->
        <circle cx="110" cy="235" r="3" fill="#e8a0b0" opacity=".8"/>
        <circle cx="290" cy="225" r="3" fill="#e8ce7a" opacity=".8"/>
        <circle cx="150" cy="165" r="2.5" fill="#e8a0b0" opacity=".7"/>
        <circle cx="280" cy="180" r="2.5" fill="#e8a0b0" opacity=".7"/>
        <circle cx="195" cy="115" r="2.5" fill="#e8ce7a" opacity=".8"/>

        <!-- Oco no tronco -->
        <g class="tree-hollow" id="treeHollow">
          <ellipse cx="195" cy="400" rx="24" ry="32" fill="#0a1410"/>
          <ellipse cx="195" cy="400" rx="24" ry="32" fill="none" stroke="#4a7d5c" stroke-width="1.5"/>
          <ellipse class="hollow-glow" cx="195" cy="400" rx="30" ry="40" fill="url(#glowGrad)"/>
          <!-- Carta enrolada dentro -->
          <rect x="186" y="392" width="18" height="14" rx="2" fill="#f0e8d5" opacity=".85"/>
          <line x1="186" y1="398" x2="204" y2="398" stroke="#8b1a1a" stroke-width=".5" opacity=".5"/>
          <line x1="186" y1="402" x2="204" y2="402" stroke="#8b1a1a" stroke-width=".5" opacity=".5"/>
          <circle cx="195" cy="397" r="2" fill="#8b1a1a" opacity=".7"/>
        </g>

        <!-- Raízes -->
        <path class="branch" d="M 200 470 Q 160 480 130 485" stroke-width="6" opacity=".7"/>
        <path class="branch" d="M 200 470 Q 240 480 270 485" stroke-width="6" opacity=".7"/>
        <path class="branch" d="M 200 480 Q 180 490 160 495" stroke-width="4" opacity=".5"/>
        <path class="branch" d="M 200 480 Q 220 490 240 495" stroke-width="4" opacity=".5"/>
      </svg>

      <p class="tree-hint" id="treeHint">✦ toque no oco do tronco ✦</p>
    </div>
  </div>
</section>

<!-- ================= LIVRO ================= -->
<section class="book-sec" id="livro">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">O livro</span>
      <h2 class="title">Segredos que <em>o jardim guarda</em></h2>
      <p class="sub">Vire cada página. Cada segredo, uma verdade. Cada verdade, um pedaço de nós.</p>
    </div>

    <div class="book-stage" data-reveal data-d="1">
      <div class="book" id="book">
        <div class="book-page" data-page="0">
          <span class="book-page-num">Página I</span>
          <h3 class="book-page-title">Sobre o começo</h3>
          <p class="book-page-body">Existem encontros que parecem acaso, mas são destino disfarçado. O nosso foi assim: banal por fora, imenso por dentro. A gente só descobriu depois — e nunca mais esqueceu.</p>
        </div>
        <div class="book-page" data-page="1">
          <span class="book-page-num">Página II</span>
          <h3 class="book-page-title">Sobre o tempo</h3>
          <p class="book-page-body">Dizem que o tempo cura tudo. Eu discordo. O tempo não cura — ele ensina a carregar. E eu carrego cada memória sua como quem carrega flores: com cuidado, com orgulho, com amor.</p>
        </div>
        <div class="book-page" data-page="2">
          <span class="book-page-num">Página III</span>
          <h3 class="book-page-title">Sobre a distância</h3>
          <p class="book-page-body">A distância nunca foi um problema — nunca foi maior do que o que sentimos. Ela só deixou tudo mais claro: o que é forte o suficiente, não precisa estar colado. Precisa estar junto por dentro.</p>
        </div>
        <div class="book-page" data-page="3">
          <span class="book-page-num">Página IV</span>
          <h3 class="book-page-title">Sobre o agora</h3>
          <p class="book-page-body">Este é o único segredo que importa: o agora. Tudo o que passou foi preparação. Tudo o que virá é promessa. E este momento — este exato momento, em que você lê — é o mais precioso de todos.</p>
        </div>
        <div class="book-page" data-page="4">
          <span class="book-page-num">Página V</span>
          <h3 class="book-page-title">Sobre o sempre</h3>
          <p class="book-page-body">"Para sempre" não é uma promessa de eternidade. É uma escolha feita todos os dias. E eu escolho você. Hoje, amanhã, e em todos os amanhãs que ainda nem existem. Sempre.</p>
        </div>
      </div>

      <div class="book-nav">
        <button id="bookPrev" aria-label="Página anterior">‹</button>
        <span class="book-counter" id="bookCounter">1 / 5</span>
        <button id="bookNext" aria-label="Próxima página">›</button>
      </div>
    </div>
  </div>
</section>

<!-- ================= STORIES ================= -->
<section class="stories-sec" id="stories">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Momentos vivos</span>
      <h2 class="title">Nossos <em>stories</em></h2>
      <p class="sub">Toque em um para reviver. Assim como as flores — mas em movimento.</p>
    </div>
    <div class="stories-rail" id="storiesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ================= CARTA FINAL ================= -->
<section class="final-sec" id="carta-final">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">A carta</span>
      <h2 class="title">O que o jardim <em>me ensinou</em></h2>
      <p class="sub">Depois de cuidar de tantas flores, aprendi uma coisa — e preciso te contar.</p>
    </div>

    <div class="final-letter" data-reveal data-d="1">
      <h3>Meu amor,</h3>
      <p>Descobri que o amor é um jardim. Não é sobre as flores — é sobre quem cuida. E eu quero cuidar de você todos os dias.</p>
      <p>Quero ser quem rega. Quem poda com carinho. Quem afasta as pragas. Quem cobre nas geadas. Quem espera as flores desabrocharem — mesmo quando demora.</p>
      <p>Porque você é o jardim mais bonito que já vi. E eu não quero que ninguém mais cuide dele. Só eu. Só a gente.</p>
      <p>Obrigado por florescer comigo. E por me deixar florescer com você.</p>
      <div class="fl-sign">Com todo o meu amor,<br>— Seu jardineiro ✦</div>
      <div class="fl-seal">✦</div>
    </div>
  </div>
</section>

<footer>
  <span class="f-rose">✿</span>
  <p>Feito com terra, tempo e um pouco de magia — para a pessoa que faz tudo florescer.</p>
  <div class="f-name">O Jardim Secreto</div>
  <small>Para sempre · desde o primeiro dia</small>
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
        <div class="story-name" id="storyName">O Jardim</div>
        <div class="story-time" id="storyTime">agora</div>
      </div>
    </div>
    <button class="story-close" id="storyClose">✕</button>
    <p class="story-cap" id="storyCap"></p>
    <div class="story-tap l" id="tapPrev"></div>
    <div class="story-tap r" id="tapNext"></div>
  </div>
</div>

<!-- TREE LETTER -->
<div class="tree-letter" id="treeLetter">
  <div class="tl-card">
    <button class="tl-close" id="tlClose">✕</button>
    <p class="tl-eyebrow">Guardada no tronco</p>
    <h3 class="tl-title">A carta que o tempo guardou</h3>
    <div class="tl-body">
      <p>Encontrei esta carta num sonho, dentro do oco de uma árvore que nunca vi. Mas a caligrafia era minha — e as palavras, suas.</p>
      <p>Dizia mais ou menos assim: "Se você encontrar isto, é porque o jardim te reconheceu. Nem todo mundo tem permissão para entrar. Mas você tem. Sempre teve."</p>
      <p>E terminava com uma frase que eu nunca esqueci: "Cuide das flores. Elas são a prova de que você esteve aqui."</p>
      <p>Esta carta é minha agora. Mas ela é sua também. Porque este jardim é dos dois.</p>
      <div class="tl-signature">— Alguém que planta flores para você ✦</div>
    </div>
  </div>
</div>

<!-- PLAYER -->
<div class="player" id="player">
  <div class="disc" id="disc">
    <img id="discCover" src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&q=80&auto=format&fit=crop" alt="">
    <div class="disc-hole"></div>
  </div>
  <div class="p-info">
    <div class="p-title" id="pTitle">Clair de Lune</div>
    <div class="p-artist" id="pArtist">Debussy · 1905</div>
  </div>
  <div class="p-eq"><i></i><i></i><i></i><i></i></div>
  <button class="p-btn" id="playBtn" aria-label="Play/Pause">▶</button>
</div>

<div id="toast"></div>
<button id="toTop" aria-label="Voltar ao topo">↑</button>

<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
