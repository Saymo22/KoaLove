/* Fluxo de criação: os mesmos dados, organizados de acordo com o modelo. */
window.NACreatorWorkflow = (() => {
  const $=id=>document.getElementById(id);
  const profiles={
    namoro:{name:'Namoro',cover:'Os nomes de vocês abrem a página. A data alimenta o contador.',date:'Quando a história de vocês começou?',moments:'Os momentos aparecem na linha do tempo. Os detalhes viram cartões para revelar.',content:'Detalhes românticos',letter:'Sua carta é revelada ao abrir o envelope.',media:'As fotos formam a galeria e os stories. O primeiro vídeo também pode aparecer na capa.',namesOnly:true},
    casamento:{name:'Casamento',cover:'Uma celebração dos nomes, da data e dos votos de vocês.',date:'Data do casamento',moments:'Conte os capítulos da história até o grande dia.',content:'Celebração e votos',letter:'Sua mensagem aparece na revelação dos votos.',namesOnly:true},
    amizade:{name:'Amizade',title:'Título da amizade',date:'Quando essa amizade começou?',content:'Quiz e memórias',moments:'A linha do tempo reúne as aventuras de vocês. O quiz e a roleta ficam na seção de recursos do tema.',letter:'Sua mensagem aparece no bilhete da amizade.'},
    familia:{name:'Família',title:'Nome ou título da família',date:'Uma data importante para a família',content:'Árvore da família',moments:'Registre os marcos da família. Cadastre as pessoas e seus parentescos na seção de recursos do tema.',letter:'Sua mensagem aparece na carta da família.'},
    aniversario:{name:'Aniversário',title:'Título da homenagem',date:'Data de nascimento de quem recebe',content:'Festa e pote de memórias',moments:'Conte lembranças da pessoa homenageada. A data de nascimento define a idade no tema.',letter:'Sua mensagem aparece na carta de aniversário.'},
    'carta-antiga':{name:'Carta Antiga',title:'Título da correspondência',date:'Data dessa história',content:'Cofre e máquina de escrever',letter:'Esta é a carta principal. As cartas adicionais do cofre são editadas na seção de recursos do tema.'},
    jardim:{name:'Jardim',title:'Título do jardim',date:'Quando essa história floresceu?',content:'Fonte e constelação',moments:'Seus momentos aparecem no caminho do jardim. Desejos e estrelas têm seus próprios campos na seção de recursos do tema.',letter:'Sua mensagem é revelada na carta da árvore.'},
    scrapbook:{name:'Scrapbook',title:'Título do álbum',date:'Primeira data do álbum',content:'Recortes e bilhetes',moments:'Escreva os capítulos do diário. As fotos e legendas formam os recortes do álbum.',letter:'Sua mensagem fica guardada no envelope do álbum.'},
    netflix:{name:'Netflix',title:'Título da série em destaque',phrase:'Sinopse da série principal',date:'Quando essa série começou?',content:'Catálogo e episódios',moments:'Os momentos também aparecem no histórico. Os títulos, episódios e cartazes do catálogo são editados na seção de recursos do tema.',letter:'Sua mensagem aparece na carta do presente. A sinopse da série principal é editada na etapa Capa.',media:'As fotos preenchem os cartazes e os fundos. Os vídeos podem ser reproduzidos no player do catálogo.',music:'A música geral acompanha a página. Os vídeos do catálogo têm seus próprios controles.',noCounter:true},
    cinema:{name:'Cinema',title:'Nome do filme principal',phrase:'Frase do cartaz',date:'Data de estreia da sua história',content:'Cartazes e fichas técnicas',moments:'Cada momento vira uma cena na película. Cadastre os filmes e as avaliações na seção de recursos do tema.',letter:'Sua mensagem é revelada na claquete.',media:'As fotos preenchem os cartazes e a película; os vídeos aparecem nos stories.',noCounter:true},
    vinil:{name:'Vinil',title:'Título do disco',date:'Desde quando esse disco toca?',content:'Lados A e B e encartes',moments:'Os momentos aparecem no histórico e podem inspirar as faixas. Personalize os dois lados do disco na seção de recursos do tema.',letter:'Sua mensagem aparece nas notas do encarte.',music:'Este arquivo é a música principal e a alternativa para faixas sem áudio próprio. Nome e artista também preenchem a primeira faixa do lado A.',noCounter:true},
    spotify:{name:'Spotify',title:'Nome da playlist principal',date:'Quando essa playlist começou?',content:'Playlists, faixas e álbuns',moments:'Conte os momentos do histórico. As playlists, as faixas e a mensagem em destaque são editadas na seção de recursos do tema.',letter:'Esta é a carta do presente. A mensagem em destaque da playlist tem um campo próprio.',music:'Este arquivo é a música principal e a alternativa para faixas sem áudio próprio. Nome e artista preenchem a primeira faixa.',noCounter:true},
    retro:{name:'Retrô',title:'Título da experiência retrô',date:'O início dessa história',content:'VHS, mixtape e fliperama',moments:'Os momentos formam a linha do tempo. Edite as fitas VHS, as músicas e as memórias do jogo na seção de recursos do tema.',letter:'Sua mensagem aparece na carta retrô.',music:'Este arquivo é a música principal e a alternativa para faixas sem áudio próprio. Nome e artista preenchem a primeira faixa da mixtape.'}
  };
  let active=null,current=1;
  function profile(key){return profiles[key]||profiles.namoro;}
  function configure(key){
    active=key;const p=profile(key);
    const text=(id,value)=>{$(id).textContent=value;};
    text('themeContext',p.cover||`Você está criando um presente no tema ${p.name}. Os campos abaixo preenchem a capa e os dados principais.`);
    text('wizardThemeName',p.name);text('previewThemeName',p.name);
    document.querySelector('label[for="titulo"]').textContent=p.title||'Título da capa';
    $('titulo').closest('.campo').hidden=!!p.namesOnly;
    document.querySelector('label[for="frase"]').textContent=p.phrase||'Frase de abertura';
    document.querySelector('label[for="inicio"]').textContent=p.date;
    text('dateHint',key==='aniversario'?'Usada para calcular a idade. Você pode deixar em branco se preferir não mostrar.':'Opcional. Use uma data que faça sentido para essa história.');
    $('counterExample').hidden=!['namoro','casamento','amizade'].includes(key);
    $('frase').maxLength=key==='netflix'?600:90;
    text('momentsHint',p.moments||'Seus momentos aparecem na linha do tempo do tema. Adicione só o que você quer contar.');
    text('mediaHint',p.media||'As fotos e legendas aparecem na galeria do tema. Os vídeos aparecem nos stories.');
    text('letterHint',p.letter);text('musicHint',p.music||'O arquivo escolhido toca no player do tema. Nome e artista identificam a música.');
    text('reasonsTitle',key==='familia'?'O que torna essa família especial?':key==='amizade'?'O que faz essa amizade especial?':'O que você admira nessa pessoa?');
    text('themeSectionTitle',p.content);
    $('titulo').placeholder=p.title||'Uma história só nossa';
  }
  function restoreStep(draft){
    const step=Math.max(1,Math.min(draft.workflowVersion===2?6:8,Math.trunc(Number(draft.step))||1));
    return draft.workflowVersion===2?step:({1:1,2:2,3:3,4:4,5:4,6:4,7:5,8:6}[step]||1);
  }
  function stepStatus(index){
    const state=window.NACreatorState?.()||{};
    if(index===1)return state.theme&&state.plan?'complete':'pending';
    if(index===2)return $('de').value.trim()&&$('para').value.trim()?'complete':'pending';
    if(index===3)return state.photos>0&&state.plan&&!window.NAPlanLimits.overLimit(state.plan,state)?'complete':'pending';
    if(index===4)return $('carta').value.trim()?'complete':'pending';
    if(index===5)return state.music?'complete':'optional';
    return [1,2,3,4].every(n=>stepStatus(n)==='complete')?'complete':'pending';
  }
  function updateProgress(n=current){
    current=n;
    document.querySelectorAll('.step-item').forEach(button=>{const index=Number(button.dataset.step),status=stepStatus(index);button.classList.toggle('on',index===n);button.classList.toggle('done',status==='complete'&&index!==n);button.classList.toggle('pending',status==='pending'&&index<n);button.dataset.state=status;if(index===n)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    const label=document.querySelector(`.step-item[data-step="${n}"] .step-label`)?.textContent.trim();
    $('wizardProgressText').textContent=`Etapa ${n} de 6${label?' · '+label:''}`;
    $('wizardProgressBar').style.width=(n/6*100)+'%';
    document.querySelectorAll('[data-section-state]').forEach(badge=>{
      const id=badge.dataset.sectionState;
      badge.textContent=id==='personalMessage'?($('carta').value.trim()?'Preenchido':'Pendente'):id==='personalMoments'?[...document.querySelectorAll('.ev-item')].some(el=>el.querySelector('.ev-titulo').value.trim()||el.querySelector('.ev-texto').value.trim())?'Preenchido':'Opcional':Object.values(window.NAThemeEditor?.getData()?.[active]||{}).some(value=>value&&Object.keys(value).length)?'Personalizado':'Opcional';
    });
    if(n===6)review();
  }
  function review(){
    const host=$('reviewSummary');host.replaceChildren();
    const value=id=>$(id).value.trim();
    const state=window.NACreatorState?.()||{};
    const plan=window.NA_PRICING?.plans?.find(p=>p.id===state.planId);
    const items=[['Plano',plan?`${plan.name} · ${formatarPreco(plan.amount_cents/100)}`:state.saved?'Plano registrado no presente':'Selecione um plano',1],['Tema',state.theme?profile(state.theme).name:'Selecione um tema',1],['De → para',`${value('de')||'—'} → ${value('para')||'—'}`,2],['Capa',value('titulo')||`${value('de')} & ${value('para')}`,2],['Fotos e vídeos',`${state.photos||0} ${state.photos===1?'foto':'fotos'} · ${state.videos||0} ${state.videos===1?'vídeo':'vídeos'}`,3],['Momentos',`${[...document.querySelectorAll('.ev-item')].filter(el=>el.querySelector('.ev-titulo').value.trim()||el.querySelector('.ev-texto').value.trim()).length} capítulos`,4,'personalMoments'],['Seu tema',profile(active).content,4,'personalTheme'],['Mensagem',value('carta')?value('carta').slice(0,120)+(value('carta').length>120?'…':''):'Mensagem ainda não preenchida',4,'personalMessage'],['Música e abertura',(state.music?(value('musicaNome')||'Arquivo selecionado'):'Sem música (opcional)')+($('usarIntro').checked?' · Com abertura':' · Sem abertura'),5]];
    const pending=[1,2,3,4].filter(n=>stepStatus(n)==='pending');
    $('reviewReadiness').textContent=pending.length?'Existem campos obrigatórios pendentes. Use Editar para completar as etapas indicadas.':'Campos obrigatórios completos. Os detalhes opcionais podem ser ajustados se quiser.';
    for(const [label,content,step,section] of items){const row=document.createElement('div'),body=document.createElement('div'),title=document.createElement('small'),text=document.createElement('p'),button=document.createElement('button');title.textContent=label;text.textContent=content;body.append(title,text);button.type='button';button.textContent='Editar';button.setAttribute('aria-label','Editar '+label);button.addEventListener('click',()=>{window.ir(step);if(section){const target=$(section);target.open=true;target.querySelector('summary')?.focus();}});row.append(body,button);host.append(row);}
  }
  return {configure,profile,updateProgress,review,restoreStep,stepStatus,get current(){return current;}};
})();
