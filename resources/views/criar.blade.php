<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @include('partials.seo')


    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(["resources/css/base.css","resources/css/criar.css","resources/js/entries/criar.js"])
</head>
  <body class="app creator-v2">
    @include('partials.noscript')
    <div class="scroll-progress" id="scrollProgress">
    </div>
    <div id="navbar">
    </div>
    <div class="criar-layout">
      <main class="app-wrap">
        <header class="criar-header">
          <div class="criar-eyebrow" id="criarEyebrow">
            <span class="dot">
            </span> ATELIÊ DE MEMÓRIAS</div>
            <h1 class="criar-titulo">Um presente que é <em>só de vocês.</em>
          </h1>
          <p class="criar-sub">Escolha o tema. Conte a história. Veja tudo ganhar vida.</p>
        </header>
        <section id="draftRecovery" class="draft-recovery" hidden aria-labelledby="draftRecoveryTitle">
          <h2 id="draftRecoveryTitle">Você tem um rascunho neste navegador</h2>
          <p>Retome o conteúdo e os arquivos que ficaram guardados no último envio.</p>
          <p id="draftRecoveryError" role="alert"></p>
          <button type="button" id="resumeDraft">Retomar rascunho</button>
          <button type="button" id="discardDraft">Descartar cópia local</button>
        </section>
        <p id="draftSaveStatus" class="draft-save-status" role="status" aria-live="polite">Carregando seu ateliê e verificando os rascunhos…</p>
        <button class="preview-btn" id="previewBtn" type="button">◉ Ver meu presente</button>
        <p id="creatorPlanSummary" class="creator-plan-summary"></p>
        <nav class="wizard-nav" aria-label="Etapas do presente">
          <div class="wizard-progress">
            <span id="wizardProgressText" aria-live="polite">Etapa 1 de 6</span>
            <span id="wizardThemeName">Seu presente começa aqui</span>
          </div>
          <div class="steps" id="steps" inert>
            <button type="button" class="step-item on" data-step="1" aria-label="Etapa 1: Plano e tema" aria-current="step"><span class="step-num"><span>1</span></span><span class="step-label">Plano e tema</span></button>
            <button type="button" class="step-item" data-step="2" aria-label="Etapa 2: Capa"><span class="step-num"><span>2</span></span><span class="step-label">Capa</span></button>
            <button type="button" class="step-item" data-step="3" aria-label="Etapa 3: Fotos e vídeos"><span class="step-num"><span>3</span></span><span class="step-label">Fotos e vídeos</span></button>
            <button type="button" class="step-item" data-step="4" aria-label="Etapa 4: Personalização"><span class="step-num"><span>4</span></span><span class="step-label">Personalização</span></button>
            <button type="button" class="step-item" data-step="5" aria-label="Etapa 5: Música e abertura"><span class="step-num"><span>5</span></span><span class="step-label">Música e abertura</span></button>
            <button type="button" class="step-item" data-step="6" aria-label="Etapa 6: Revisão"><span class="step-num"><span>6</span></span><span class="step-label">Revisão</span></button>
          </div>
          <div class="wizard-track">
            <span id="wizardProgressBar">
            </span>
          </div>
        </nav>
        <form id="form" novalidate inert>
          <div class="passo ativo" data-passo="1" id="passo1" >
            <div class="passo-header">
              <span class="step-kicker">ETAPA 01</span>
              <h2 tabindex="-1">Escolha seu plano e cenário</h2>
              <p>Cada tema tem uma experiência e campos próprios. Você pode trocar e comparar.</p>
            </div>
        <section class="creator-plan" aria-label="Plano do presente">
          <label for="creatorPlan">Plano do presente</label>
          <select id="creatorPlan"></select>
          <p id="creatorPlanDetails"></p>
          <p id="creatorPlanError" class="erro" role="alert" hidden></p>
        </section>

            <div class="temas-grupo">
              <h3>Clássicos</h3>
              <div class="temas" id="temasClassicos">
              </div>
            </div>
            <div class="temas-grupo">
              <h3>Especiais e exclusivos</h3>
              <div class="temas" id="temasEspeciais">
              </div>
            </div>
            <div class="erro" id="erro1">
            </div>
            <div class="acoes">
              <span>
              </span>
              <button type="button" class="btn ouro" data-ir="2">Continuar →</button>
            </div>
          </div>
          <div class="passo " data-passo="2" id="passo2" hidden>
            <div class="passo-header">
              <span class="step-kicker">ETAPA 02</span>
              <h2 tabindex="-1">Uma capa com a sua cara</h2>
              <p>Defina quem faz parte da história e como ela começa.</p>
            </div>
            <div class="theme-context" id="themeContext">
            </div>
            <div class="grid2">
              <div class="campo" data-campo="de">
                <label for="de">Seu nome</label>
                <input id="de" aria-required="true" type="text" maxlength="40" placeholder="Quem presenteia">
                <div class="erro-campo-msg" data-msg="de">Preencha este campo para continuar.</div>
              </div>
              <div class="campo" data-campo="para">
                <label for="para">Nome de quem recebe</label>
                <input id="para" aria-required="true" type="text" maxlength="40" placeholder="Quem recebe">
                <div class="erro-campo-msg" data-msg="para">Preencha este campo para continuar.</div>
              </div>
            </div>
            <div class="campo" data-campo="titulo">
              <label for="titulo">Título da capa</label>
              <input id="titulo" type="text" maxlength="40" placeholder="Uma história só nossa">
              <div class="erro-campo-msg" data-msg="titulo">Preencha este campo para continuar.</div>
            </div>
            <div class="campo" data-campo="frase">
              <label for="frase">Frase da capa</label>
              <input id="frase" type="text" maxlength="90" placeholder="Uma frase para abrir a experiência">
              <div class="erro-campo-msg" data-msg="frase">Preencha este campo para continuar.</div>
            </div>
            <div class="campo" data-campo="inicio">
              <label for="inicio">Data especial</label>
              <input id="inicio" type="date" maxlength="80" placeholder="">
              <div class="erro-campo-msg" data-msg="inicio">Preencha este campo para continuar.</div>
            </div>
            <p class="nota" id="dateHint">
            </p>
            <div class="previa-contador" id="counterExample">
              <span class="previa-tag">O tempo da sua história</span>
              <p id="previaFrase">Escolha uma data para ver o contador.</p>
              <div class="previa-grid">
                <div>
                  <strong id="pAnos">0</strong>
                  <span>Anos</span>
                </div>
                <div>
                  <strong id="pMeses">0</strong>
                  <span>Meses</span>
                </div>
                <div>
                  <strong id="pDias">0</strong>
                  <span>Dias</span>
                </div>
                <div>
                  <strong id="pHoras">0</strong>
                  <span>Horas</span>
                </div>
              </div>
            </div>
            <div class="erro" id="erro2">
            </div>
            <div class="acoes">
              <button type="button" class="btn sec" data-ir="1">← Voltar</button>
              <button type="button" class="btn ouro" data-ir="3">Continuar →</button>
            </div>
          </div>
          <div class="passo " data-passo="3" id="passo3" hidden>
            <div class="passo-header">
              <span class="step-kicker">ETAPA 03</span>
              <h2 tabindex="-1">Dê vida às suas lembranças</h2>
              <p>Organize as fotos, escolha a capa e acrescente vídeos se quiser.</p>
            </div>
            <div class="campo" data-campo="fotos">
              <label class="upload">
                <input type="file" id="fotos" accept="image/*" multiple>
                <span class="upload-icon">↗</span>
                <b>Escolher fotos</b>
                <span id="fotosHint">Carregando limites do plano…</span>
                <span class="qtd" id="qtdFotos">0 fotos</span>
              </label>
              <div class="erro-campo-msg" data-msg="fotos">Adicione pelo menos uma foto.</div>
            </div>
            <div id="painelPersonalizacao" hidden>
              <input type="hidden" id="fotoCapa" value="0">
              <div id="fotosGrid" class="fotos-grid">
              </div>
              <p class="nota">★ define a capa. Use as setas ou arraste para mudar a ordem. As legendas acompanham as fotos.</p>
            </div>
            <div class="campo" data-campo="videos">
              <label class="upload">
                <input type="file" id="videos" accept="video/*" multiple>
                <span class="upload-icon">▷</span>
                <b>Adicionar vídeos</b>
                <span id="videosHint">Carregando limites do plano…</span>
                <span class="qtd" id="qtdVideos">0 vídeos</span>
              </label>
              <div class="erro-campo-msg" data-msg="videos">Escolha vídeos compatíveis com o plano.</div>
            </div>
            <div id="videosGrid" class="videos-grid"></div>
            <p class="nota" id="mediaHint">
            </p>
            <div class="erro" id="erroMedia" role="status" aria-live="polite">
            </div>
            <div class="acoes">
              <button type="button" class="btn sec" data-ir="2">← Voltar</button>
              <button type="button" class="btn ouro" data-ir="4">Continuar →</button>
            </div>
          </div>
          <div class="passo " data-passo="4" id="passo4" hidden><div class="passo-header"><span class="step-kicker">ETAPA 04</span><h2 tabindex="-1">Dê seu toque ao presente</h2><p>Abra uma seção por vez. A mensagem é obrigatória; os demais detalhes são opcionais.</p></div>
            <details class="creator-section" id="personalMoments"><summary><span>Momentos e detalhes</span><span class="section-state" data-section-state="personalMoments">Opcional</span></summary><div class="creator-section-body">
            <div class="section-note" id="momentsHint">
            </div>
            <div id="eventos">
            </div>
            <button type="button" class="btn sec" id="btnAddEv">+ Adicionar momento</button>
            <div class="reasons-block">
              <h3 id="reasonsTitle">O que você admira nessa pessoa?</h3>
              <p class="nota">Até três detalhes, se quiser.</p>
              <div class="campo">
                <label for="reason1">Detalhe 1</label>
                <input id="reason1" type="text" class="amo" maxlength="30" placeholder="Uma pequena coisa especial">
              </div>
              <div class="campo">
                <label for="reason2">Detalhe 2</label>
                <input id="reason2" type="text" class="amo" maxlength="30" placeholder="Uma pequena coisa especial">
              </div>
              <div class="campo">
                <label for="reason3">Detalhe 3</label>
                <input id="reason3" type="text" class="amo" maxlength="30" placeholder="Uma pequena coisa especial">
              </div>
            </div>

</div></details>
            <details class="creator-section" id="personalTheme"><summary><span>Recursos do tema</span><span class="section-state" data-section-state="personalTheme">Opcional</span></summary><div class="creator-section-body"><h3 id="themeSectionTitle">Seu tema</h3>
            <section id="themeDetails" class="theme-details">
              <p class="nota">Escolha um tema para ver os campos dele.</p>
            </section>

</div></details>
            <details class="creator-section" id="personalMessage" open><summary><span>Mensagem e encerramento</span><span class="section-state" data-section-state="personalMessage">Pendente</span></summary><div class="creator-section-body">
            <div class="campo" data-campo="carta">
              <label for="carta">Sua mensagem</label>
              <textarea id="carta" aria-required="true"  maxlength="2000" placeholder="O que você gostaria de dizer?">
              </textarea>
              <div class="erro-campo-msg" data-msg="carta">Preencha este campo para continuar.</div>
            </div>
            <p class="nota" id="letterHint">
            </p>
            <div class="campo" data-campo="rodapeCustom">
              <label for="rodapeCustom">Uma frase para encerrar (opcional)</label>
              <input id="rodapeCustom" type="text" maxlength="80" placeholder="Feito com carinho, para você">
              <div class="erro-campo-msg" data-msg="rodapeCustom">Preencha este campo para continuar.</div>
            </div>

</div></details>
            <div class="acoes"><button type="button" class="btn sec" data-ir="3">← Voltar</button><button type="button" class="btn ouro" data-ir="5">Continuar →</button></div>
          </div>
          <div class="passo " data-passo="5" id="passo5" hidden>
            <div class="passo-header">
              <span class="step-kicker">ETAPA 05</span>
              <h2 tabindex="-1">Música e abertura</h2>
              <p>Escolha um arquivo de áudio para acompanhar a experiência. É opcional.</p>
            </div>
            <div class="campo" data-campo="musica">
              <label class="upload">
                <input type="file" id="musica" accept="audio/*" >
                <span class="upload-icon">♫</span>
                <b>Escolher a música</b>
                <span id="musicaHint">Carregando limites do plano…</span>
                <span class="qtd" id="qtdMusica">
                </span>
              </label>
              <div class="erro-campo-msg" data-msg="musica">Escolha um arquivo de áudio válido.</div>
              <button type="button" id="removerMusica" class="btn-sec">Remover música</button>
            </div>
            <div class="campo" id="musicaPreviewWrap" hidden>
              <label for="musicaPreview">Ouça o arquivo escolhido</label>
              <audio id="musicaPreview" controls preload="metadata">
              </audio>
            </div>
            <div class="grid2">
              <div class="campo" data-campo="musicaNome">
                <label for="musicaNome">Nome da música</label>
                <input id="musicaNome" type="text" maxlength="60" placeholder="A música de vocês">
                <div class="erro-campo-msg" data-msg="musicaNome">Preencha este campo para continuar.</div>
              </div>
              <div class="campo" data-campo="musicaArtista">
                <label for="musicaArtista">Artista</label>
                <input id="musicaArtista" type="text" maxlength="60" placeholder="Quem canta">
                <div class="erro-campo-msg" data-msg="musicaArtista">Preencha este campo para continuar.</div>
              </div>
            </div>
            <p class="nota" id="musicHint">
            </p>
            <label class="toggle-field">
              <input type="checkbox" id="autoplay">
              <span>Tentar iniciar a música ao abrir o presente</span>
            </label>
            <p class="nota">Alguns navegadores pedem um toque para iniciar o áudio.</p>
            <label class="toggle-field">
              <input type="checkbox" id="usarIntro" checked>
              <span>Mostrar a abertura do tema antes do presente</span>
            </label>
            <p class="nota">Na prévia de edição, a abertura é pulada. Na revisão, teste a experiência completa.</p>
            <div class="acoes">
              <button type="button" class="btn sec" data-ir="4">← Voltar</button>
              <button type="button" class="btn ouro" data-ir="6">Continuar →</button>
            </div>
          </div>
          <div class="passo " data-passo="6" id="passo6" hidden>
            <div class="passo-header">
              <span class="step-kicker">ETAPA 06</span>
              <h2 tabindex="-1">Tudo pronto para emocionar?</h2>
              <p>Confira o conteúdo e experimente os botões na prévia antes de continuar.</p>
            </div>
            <div class="review-intro">
              <span>♡</span>
              <p>Seu presente, do seu jeito.<br>
                <small>Volte a qualquer etapa para ajustar os detalhes.</small>
              </p>
            </div>
            <p id="reviewReadiness" role="status"></p><p class="nota">Você poderá conferir o valor e as condições antes de pagar.</p>
            <div id="reviewSummary" class="review-summary">
            </div>
            <button type="button" class="btn sec review-preview" id="reviewPreview">Testar como quem recebe</button>
            <div class="erro" id="erro3" role="alert">
            </div>
            <div class="acoes">
              <button type="button" class="btn sec" data-ir="5">← Voltar</button>
              <button type="submit" class="btn ouro" id="btnFinal">Ir para o pagamento →</button>
            </div>
          </div>
        </form>
      </main>
      <aside class="preview-col" id="previewCol" aria-label="Prévia do presente">
        <div class="preview-wrap">
          <div class="preview-heading">
            <div>
              <span class="preview-eyebrow">ASSIM VAI FICAR</span>
              <h2 id="previewThemeName">Sua história</h2>
            </div>
            <span class="preview-label" id="previewLabel">
              <span class="live-dot">
              </span> Ao vivo</span>
            </div>
            <div class="preview-toolbar">
              <span id="previewModeLabel">Prévia de edição</span>
              <button type="button" id="previewHome">↑ Início</button>
              <button type="button" id="previewExpand" aria-pressed="false">Ampliar ↗</button>
            </div>
            <div class="phone-stage" id="phoneStage">
              <div class="preview-phone" id="previewPhone">
                <div class="phone-top">
                  <span id="phoneTime">9:41</span>
                  <span class="phone-island" aria-hidden="true">
                  </span>
                  <span aria-hidden="true">◒ ▰</span>
                </div>
                <div class="preview-screen" id="previewScreen">
                  <div class="preview-scroll" id="previewScroll">
                    <div id="previewEmpty">
                      <span>♡</span>
                      <h3>Uma história esperando<br>para acontecer.</h3>
                      <p>Escolha seu tema para começar.</p>
                    </div>
                  </div>
                </div>
                <div class="phone-home" aria-hidden="true">
                </div>
              </div>
              <div id="previewDots" hidden>
              </div>
            </div>
            <p class="preview-help">Role dentro da tela e toque nos elementos.<br>Esta é a página real do tema escolhido.</p>
          </div>
          <button class="preview-close" id="previewClose" type="button" aria-label="Fechar prévia">Fechar prévia ✕</button>
        </aside>
      </div>











    </body>
  </html>
