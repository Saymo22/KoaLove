<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,viewport-fit=cover"
    />
    <meta name="theme-color" content="#151319" />
    @include('partials.seo')
    <link rel="icon" href="favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Permanent+Marker&family=Special+Elite&family=IM+Fell+English:ital@0;1&family=Caveat:wght@400;700&family=Pacifico&display=swap"
      rel="stylesheet"
    />

      <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/ver.css","resources/js/entries/ver.js"])
</head>
  <body>
    @include('partials.noscript')
    <div class="loading" id="loading">
      <span class="loading-mark">✳</span>
      <p>Uma história especial está ganhando vida…</p>
    </div>
    <main id="app" hidden></main>
    <section class="error-screen" id="error" role="alert" hidden></section>
    <div id="toast" class="toast" aria-live="polite" role="status"></div>
    <div class="utility" id="utility" hidden>
      <button
        type="button"
        id="utilSound"
        class="utility-btn"
        aria-label="Tocar ou pausar música"
        title="Música"
        hidden
      >
        ♫
      </button>
      <button
        type="button"
        id="utilShare"
        class="utility-btn"
        aria-label="Compartilhar"
        title="Compartilhar"
      >
        ↗
      </button>
    </div>
    <dialog id="lightbox" class="lightbox" aria-label="Galeria de fotografias">
      <button
        type="button"
        class="lb-close"
        id="lbClose"
        aria-label="Fechar fotografia"
      >
        ✕</button
      ><button
        type="button"
        class="lb-prev"
        id="lbPrev"
        aria-label="Foto anterior"
      >
        ‹
      </button>
      <figure>
        <img id="lbImg" alt="Fotografia ampliada" />
        <figcaption id="lbCaption"></figcaption>
      </figure>
      <button
        type="button"
        class="lb-next"
        id="lbNext"
        aria-label="Foto seguinte"
      >
        ›
      </button>
    </dialog>



  </body>
</html>
