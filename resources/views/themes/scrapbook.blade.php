<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nosso Scrapbook — Histórias que a gente colou</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,500&family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Special+Elite&display=swap" rel="stylesheet">



    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/themes/scrapbook.css","resources/js/entries/themes-scrapbook.js"])
</head>
<body>

<!-- LOADER -->
<div id="loader">
  <div class="loader-scissors">
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="45" r="10" fill="none" stroke="#2a1c0f" stroke-width="2.5"/>
      <circle cx="22" cy="15" r="10" fill="none" stroke="#2a1c0f" stroke-width="2.5"/>
      <line x1="30" y1="38" x2="80" y2="12" stroke="#2a1c0f" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="30" y1="22" x2="80" y2="48" stroke="#2a1c0f" stroke-width="2.5" stroke-linecap="round"/>
      <line class="cut-line" x1="85" y1="30" x2="95" y2="30" stroke="#c41e3a" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="loader-text">Recortando memórias…</div>
</div>

<!-- CURSOR -->
<div class="cursor-pencil" id="cursorPencil">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21 L4 16 L17 3 L21 7 L8 20 Z" fill="#e8c56d" stroke="#2a1c0f" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M17 3 L21 7 L19 9 L15 5 Z" fill="#2a1c0f"/>
    <path d="M3 21 L4 16 L6 18 Z" fill="#2a1c0f"/>
    <circle cx="19" cy="19" r="1" fill="#c41e3a" opacity=".4"/>
  </svg>
</div>

<div class="scroll-bar" id="scrollBar"></div>

<!-- ================= HERO ================= -->
<section class="hero" id="inicio">
  <div class="hero-inner">
    <div class="cover-stage">
      <div class="scrapbook-cover" id="scrapbookCover">
        <div class="cover-back">
          <p class="cover-back-eyebrow">Álbum de memórias</p>
          <h1 class="cover-back-title">
            Nosso
            <em>Scrapbook</em>
          </h1>
          <p class="cover-back-sub">histórias que a gente colou<br>com carinho, café e cola</p>
          <p class="cover-back-date">— desde 2018 —</p>
        </div>
        <div class="cover-front" id="coverFront">
          <div class="cover-front-plate">
            <div class="cover-plate-title">
              Nosso
              <em>Scrapbook</em>
            </div>
            <p class="cover-plate-sub">toque para abrir</p>
          </div>
          <div class="cover-lock"></div>
        </div>
      </div>
    </div>

    <p class="cover-hint" id="coverHint">✦ toque na capa para abrir o álbum ✦</p>

    <p class="na-original-1 hero-eyebrow">Um álbum feito à mão</p>
    <h1 class="hero-title">
      <span>Fragmentos</span>
      <em>de nós dois</em>
    </h1>
    <p class="hero-sub">
      Não é um álbum qualquer. É <strong>um pedaço de vida</strong> colado com fita, enfeitado com caneta e guardado com amor. Vire a página e entre.
    </p>
  </div>

  <div class="scroll-cue">
    <span>Role</span>
    <div class="arrow"></div>
  </div>
</section>

<!-- ============ STICKY NOTES ============ -->
<section class="sticky-sec">
  <div class="sticky-wrap">
    <div class="sticky-note" data-reveal>
      <div class="pushpin"></div>
      <span class="sticky-note-eyebrow">Se você abriu isso…</span>
      <p>É porque eu quis te mostrar que a nossa história merece mais do que uma pasta no celular.</p>
      <p class="signature">— eu</p>
    </div>

    <div class="sticky-note" data-reveal data-d="1">
      <div class="pushpin pushpin-mustard"></div>
      <span class="sticky-note-eyebrow">Regra do álbum</span>
      <p>Nada aqui é perfeito. Nem as fotos, nem as legendas. E é exatamente isso que faz ser nosso.</p>
      <p class="signature">✎</p>
    </div>

    <div class="sticky-note" data-reveal data-d="2">
      <div class="pushpin pushpin-teal"></div>
      <span class="sticky-note-eyebrow">Um aviso</span>
      <p>Pode dar vontade de chorar, de rir, ou os dois ao mesmo tempo. Já aviso: é normal.</p>
      <p class="signature">♡</p>
    </div>
  </div>
</section>

<!-- ============ POLAROIDS ============ -->
<section class="polaroid-sec" id="polaroids">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Recortes do tempo</span>
      <h2 class="title">Nossos <em>momentos</em></h2>
      <p class="sub">Cada foto foi escolhida a dedo, colada com fita e legendada com a caneta do coração. Clique em qualquer uma.</p>
    </div>

    <div class="polaroid-grid" id="polaroidGrid" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ JOURNAL / TIMELINE ============ -->
<section class="journal-sec" id="historias">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Diário de bordo</span>
      <h2 class="title">Anotações <em>que eu guardei</em></h2>
      <p class="sub">Páginas do meu diário — as favoritas. As que falam de você.</p>
    </div>

    <div class="journal">
      <div class="journal-entry" data-reveal>
        <span class="journal-date">Capítulo I · O começo</span>
        <h3 class="journal-title">O dia em que você apareceu</h3>
        <p class="journal-text">Eu não sabia que aquele dia ia mudar tudo. Achei que era só mais um dia comum. Mas você chegou com aquele jeito seu, e nada mais foi igual.</p>
        <div class="journal-photo">
          <div class="tape tape-coral tape-tc"></div>
          <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80&auto=format&fit=crop" alt="">
          <span class="pcap">o primeiro dia</span>
        </div>
      </div>

      <div class="journal-entry" data-reveal data-d="1">
        <span class="journal-date">Capítulo II · As descobertas</span>
        <h3 class="journal-title">Conversas de madrugada</h3>
        <p class="journal-text">A gente falava até o sol nascer. Sobre tudo, sobre nada. E eu descobri que o silêncio com você era mais confortável do que qualquer conversa com outra pessoa.</p>
        <div class="journal-photo">
          <div class="tape tape-mustard tape-tc"></div>
          <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80&auto=format&fit=crop" alt="">
          <span class="pcap">3 da manhã</span>
        </div>
      </div>

      <div class="journal-entry" data-reveal data-d="2">
        <span class="journal-date">Capítulo III · As viagens</span>
        <h3 class="journal-title">Nossa primeira viagem</h3>
        <p class="journal-text">Nada saiu como planejado. E foi por isso que ficou perfeito. Voltamos com fotos ruins, memórias boas, e a certeza de que qualquer lugar do mundo fica bom se você estiver.</p>
        <div class="journal-photo">
          <div class="tape tape-teal tape-tc"></div>
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80&auto=format&fit=crop" alt="">
          <span class="pcap">mapa aberto, coração idem</span>
        </div>
      </div>

      <div class="journal-entry" data-reveal data-d="3">
        <span class="journal-date">Capítulo IV · A certeza</span>
        <h3 class="journal-title">Quando eu soube</h3>
        <p class="journal-text">Não teve fogos, nem trilha sonora. Só um dia comum, uma xícara de café, e a clareza absoluta de que era você. E que sempre seria.</p>
        <div class="journal-photo">
          <div class="tape tape-navy tape-tc"></div>
          <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&q=80&auto=format&fit=crop" alt="">
          <span class="pcap">coração em paz</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ POSTCARDS ============ -->
<section class="postcards-sec" id="postais">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Enviados com amor</span>
      <h2 class="title">Postais que <em>nunca enviei</em></h2>
      <p class="sub">Escrevi, dobrei, guardei. Um dia você lê todos. Hoje, só alguns.</p>
    </div>

    <div class="postcards-grid">
      <div class="postcard" data-reveal>
        <div class="pc-left">
          <span class="pc-from">Para: você</span>
          <p class="pc-message">"Todo dia eu descubro uma coisa nova em você. E cada descoberta me faz querer ficar mais."</p>
        </div>
        <div class="pc-right">
          <div class="pc-stamp">SELO<br>DO<br>AMOR<br>∞</div>
          <div class="pc-lines">
            <div class="pc-line"></div>
            <div class="pc-line"></div>
            <div class="pc-line"></div>
          </div>
          <div class="pc-postmark">SELADO<br>COM<br>CARINHO</div>
        </div>
      </div>

      <div class="postcard" data-reveal data-d="1">
        <div class="pc-left">
          <span class="pc-from">Para: nós</span>
          <p class="pc-message">"Se um dia a gente se perder, olha para trás. As nossas pegadas estão por todo lado."</p>
        </div>
        <div class="pc-right">
          <div class="pc-stamp">★<br>NOSSO<br>LUGAR<br>✦</div>
          <div class="pc-lines">
            <div class="pc-line"></div>
            <div class="pc-line"></div>
            <div class="pc-line"></div>
          </div>
          <div class="pc-postmark">PARA<br>SEMPRE</div>
        </div>
      </div>

      <div class="postcard" data-reveal data-d="2">
        <div class="pc-left">
          <span class="pc-from">Para: depois</span>
          <p class="pc-message">"Se você estiver lendo isso anos depois, saiba que tudo continua aqui. Cada palavra, cada memória."</p>
        </div>
        <div class="pc-right">
          <div class="pc-stamp">♥<br>UMA<br>VIDA<br>INTEIRA</div>
          <div class="pc-lines">
            <div class="pc-line"></div>
            <div class="pc-line"></div>
            <div class="pc-line"></div>
          </div>
          <div class="pc-postmark">SEMPRE<br>NOSSO</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ TICKETS ============ -->
<section class="tickets-sec" id="ingressos">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Colecionador de nós</span>
      <h2 class="title">Nossos <em>ingressos</em></h2>
      <p class="sub">Nunca fui de guardar ingressos. Mas os nossos, eu guardei todos. Estão aqui, colados com fita.</p>
    </div>

    <div class="tickets-grid">
      <div class="ticket" data-reveal>
        <div class="ticket-header">
          <span class="ticket-type">Cinema</span>
          <span class="ticket-num">Nº 01</span>
        </div>
        <h3 class="ticket-title">Nosso primeiro filme juntos</h3>
        <div class="ticket-meta">
          <div class="ticket-meta-row"><strong>Data</strong><span>15 · 07 · 2018</span></div>
          <div class="ticket-meta-row"><strong>Local</strong><span>Cine do shopping</span></div>
          <div class="ticket-meta-row"><strong>Nota</strong><span>Dormimos no meio</span></div>
        </div>
        <div class="ticket-stub"></div>
        <div class="ticket-stub-text">ADMIT ONE</div>
      </div>

      <div class="ticket" data-reveal data-d="1">
        <div class="ticket-header">
          <span class="ticket-type">Show</span>
          <span class="ticket-num">Nº 02</span>
        </div>
        <h3 class="ticket-title">Aquele show que a gente gritou</h3>
        <div class="ticket-meta">
          <div class="ticket-meta-row"><strong>Data</strong><span>22 · 03 · 2019</span></div>
          <div class="ticket-meta-row"><strong>Local</strong><span>Estádio da cidade</span></div>
          <div class="ticket-meta-row"><strong>Nota</strong><span>Vozes destruídas no dia seguinte</span></div>
        </div>
        <div class="ticket-stub"></div>
        <div class="ticket-stub-text">ADMIT ONE</div>
      </div>

      <div class="ticket" data-reveal data-d="2">
        <div class="ticket-header">
          <span class="ticket-type">Viagem</span>
          <span class="ticket-num">Nº 03</span>
        </div>
        <h3 class="ticket-title">A primeira viagem sozinhos</h3>
        <div class="ticket-meta">
          <div class="ticket-meta-row"><strong>Data</strong><span>10 · 01 · 2021</span></div>
          <div class="ticket-meta-row"><strong>Local</strong><span>Praia do norte</span></div>
          <div class="ticket-meta-row"><strong>Nota</strong><span>3 dias, 400 fotos</span></div>
        </div>
        <div class="ticket-stub"></div>
        <div class="ticket-stub-text">ADMIT ONE</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ STORIES ============ -->
<section class="stories-sec" id="stories">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Momentos vivos</span>
      <h2 class="title">Nossos <em>stories</em></h2>
      <p class="sub">Porque nem tudo cabe numa foto parada. Alguns momentos precisam se mexer.</p>
    </div>
    <div class="stories-rail" id="storiesRail" data-reveal data-d="1"></div>
  </div>
</section>

<!-- ============ BUCKET LIST ============ -->
<section class="bucket-sec" id="bucket">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Lista oficial</span>
      <h2 class="title">O que ainda <em>vamos colar</em></h2>
      <p class="sub">Aqui é onde as próximas páginas do scrapbook começam. Marque o que já rolou — e o que ainda vai rolar.</p>
    </div>

    <div class="bucket-paper" data-reveal data-d="1">
      <h3>Bucket list de nós</h3>
      <p class="bp-sub">— o que a gente ainda vai viver —</p>

      <div class="bucket-list">
        <label class="bucket-item">
          <input type="checkbox" checked>
          <span class="bucket-box"></span>
          <span class="bucket-text">Ver o mar juntos</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox" checked>
          <span class="bucket-box"></span>
          <span class="bucket-text">Fazer uma viagem sem planejar</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox">
          <span class="bucket-box"></span>
          <span class="bucket-text">Morar juntos (quando for a hora)</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox">
          <span class="bucket-box"></span>
          <span class="bucket-text">Adotar um cachorro (ou dois)</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox">
          <span class="bucket-box"></span>
          <span class="bucket-text">Ver o pôr do sol em outro país</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox" checked>
          <span class="bucket-box"></span>
          <span class="bucket-text">Rir até chorar por nada</span>
        </label>
        <label class="bucket-item">
          <input type="checkbox">
          <span class="bucket-box"></span>
          <span class="bucket-text">Envelhecer juntos, de mãos dadas</span>
        </label>
      </div>
    </div>
  </div>
</section>

<!-- ============ FINAL LETTER ============ -->
<section class="final-sec" id="carta-final">
  <div class="wrap">
    <div class="center-text" data-reveal>
      <span class="eyebrow center">Uma última coisa</span>
      <h2 class="title">A carta que <em>eu selaría</em></h2>
      <p class="sub">Rompa o selo de cera. Leia com calma. E guarde — porque essa é a mais importante.</p>
    </div>

    <div class="letter-stage" data-reveal data-d="1">
      <div class="letter-envelope" id="letterEnvelope">
        <div class="env-flap"></div>
        <div class="env-stamp">SELO<br>DO<br>AMOR<br>∞</div>
        <p class="env-from">— para você, sempre —</p>
        <div class="env-seal" id="envSeal">♥</div>
      </div>

      <div class="letter-content" id="letterContent">
        <div class="letter-paper">
          <h3>Meu amor,</h3>
          <p>Se você chegou até o fim deste scrapbook, é porque leu cada linha com o coração aberto. E eu só tenho uma coisa a dizer: obrigado por fazer parte de tudo isso.</p>
          <p>Cada foto colada aqui, cada fita, cada legenda escrita à mão — tudo isso é um pedaço da minha vida que eu escolhi guardar para você. Não porque são lembranças bonitas (algumas nem são). Mas porque são nossas.</p>
          <p>Eu não sei o que o futuro guarda. Só sei que, se ele guardar você, já vai ter valido a pena. E se não guardar, que bom que a gente viveu o que viveu — porque foi bonito. Foi tão bonito.</p>
          <p>Obrigado por ser minha pessoa favorita no mundo. Por aguentar meus dias ruins, por comemorar meus dias bons, por rir das minhas piadas sem graça, e por estar aqui — mesmo quando eu não mereço.</p>
          <p>Este scrapbook é meu presente para você. Mas o presente real, o que importa mesmo, é o tempo que a gente passou junto. E esse ninguém nunca vai conseguir arrancar de mim.</p>
          <p class="sig">Com todo o meu amor,<br>— quem colou cada página</p>
          <p class="ps">P.S. — Se um dia as fotos desbotarem, as legendas continuam aqui. As palavras duram mais. E eu vou continuar escrevendo para você pelo resto da vida.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<footer>
  <span class="f-icon">✂</span>
  <p>Feito com papel, cola, caneta e um pouco de saudade — para a pessoa que faz a vida valer a pena.</p>
  <div class="f-name">Nosso Scrapbook</div>
  <small>Desde o primeiro dia · para sempre</small>
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
        <div class="story-name" id="storyName">Nosso Scrapbook</div>
        <div class="story-time" id="storyTime">agora</div>
      </div>
    </div>
    <button class="story-close" id="storyClose">✕</button>
    <p class="story-cap" id="storyCap"></p>
    <div class="story-tap l" id="tapPrev"></div>
    <div class="story-tap r" id="tapNext"></div>
  </div>
</div>

<!-- MUSIC PLAYER -->
<div class="cassette-player" id="player">
  <div class="cassette">
    <div class="cassette-reel left"></div>
    <div class="cassette-reel right"></div>
  </div>
  <div class="cassette-info">
    <div class="cassette-title" id="pTitle">Nossa trilha</div>
    <div class="cassette-artist" id="pArtist">Lado A · Nosso mix</div>
  </div>
  <button class="cassette-btn" id="playBtn" aria-label="Play/Pause">▶</button>
</div>

<div id="toast"></div>
<button id="toTop" aria-label="Voltar ao topo">↑</button>

<audio id="audio" loop preload="none">
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" type="audio/mpeg">
</audio>



</body>
</html>
