// Links antigos de recuperação continuam aceitos, com token somente no fragmento.
function destinoAposLogin() {
  const next = new URLSearchParams(location.search).get('next');
  try {
    const url = new URL(next || 'minha-conta.html', location.href);
    if (url.origin === location.origin && /^\/(criar|minha-conta|pagamento|resultado)\.html$/.test(url.pathname)) {
      return url.pathname + url.search;
    }
  } catch {}
  return 'minha-conta.html';
}

document.addEventListener("DOMContentLoaded", async () => {
  const loginRecovery=(()=>{const params=new URLSearchParams(location.hash.slice(1));const token=params.get('token'),email=params.get('email');if(token)history.replaceState(null,'',location.pathname+location.search);return {token,email,requested:!!token||location.hash==='#recuperar'};})();
  try {
    await window.ApiAuth.me();
    if(!loginRecovery.requested){window.location.href = destinoAposLogin();return;}
  } catch { /* não logado */ }

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  /* CURSOR */
  const cursor = $("#cursor");
  const hoverElements = $$("button, input, a, .gfield");
  document.addEventListener("mousemove", (e) => {
    if (!cursor) return;
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
  hoverElements.forEach(el => {
    el.addEventListener("mouseenter", () => cursor?.classList.add("is-hovering"));
    el.addEventListener("mouseleave", () => cursor?.classList.remove("is-hovering"));
  });

  /* FUNDO 3D E ESTRELAS */
  const layerBack = $("#layerBack");
  const layerMid = $("#layerMid");
  const layerFront = $("#layerFront");
  const words = ["Amor", "Eterno", "Sempre", "Destino", "Alma", "Paixão", "Juntos", "Infinito", "Promessa", "Coração"];

  function createWords(container, count) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.className = "floating-word";
      span.textContent = words[Math.floor(Math.random() * words.length)];
      let leftPos = Math.random() * 100;
      if (leftPos > 35 && leftPos < 65) leftPos += 30; 
      span.style.left = leftPos + "%";
      span.style.top = (Math.random() * 80 + 10) + "%";
      span.style.animationDelay = (Math.random() * 5) + "s";
      span.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
      container.appendChild(span);
    }
  }
  createWords(layerBack, 15);
  createWords(layerMid, 12);
  createWords(layerFront, 8);

  const stardustEl = $("#stardust");
  if (stardustEl) {
    for (let i = 0; i < 35; i++) {
      const star = document.createElement("div");
      star.className = "star-dust";
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDuration = (10 + Math.random() * 20) + "s";
      star.style.animationDelay = (-Math.random() * 20) + "s";
      const size = 1 + Math.random() * 2;
      star.style.width = size + "px";
      star.style.height = size + "px";
      stardustEl.appendChild(star);
    }
  }

  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    if (layerBack) layerBack.style.transform = `translate(${x * 15}px, ${y * 15}px)`;
    if (layerMid) layerMid.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    if (layerFront) layerFront.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
  });

  /* CARD & BOTÃO MAGNÉTICO */
  const card = $(".glass-card");
  if (card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--rx", -py * 5 + "deg");
      card.style.setProperty("--ry", px * 5 + "deg");
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  }

  const btn = $("#seal");
  if (btn) {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      setTimeout(() => btn.style.transition = "", 400);
    });
  }

  /* FORMULÁRIO */
  const tabs = $(".glass-tabs");
  const tabBtns = $$(".glass-tab");
  const titleEl = $("#title");
  const subEl = $("#sub");
  const form = $("#form");
  const fieldName = $("#fieldName");
  const inputName = $("#inputName");
  const inputEmail = $("#inputEmail");
  const inputPass = $("#inputPass");
  const peekBtn = $("#peek");
  const erroEl = $("#erro");
  const sealText = $("#sealText");
  let mode = "login";
  const fieldPass=$("#fieldPass"),fieldEmail=$("#fieldEmail"),fieldConfirm=$("#fieldConfirm"),confirmPass=$("#confirmPass");
  const forgot=$("#forgotPassword"),back=$("#recoveryBack");
  const googleButton=$("#btnGoogle"),socialStatus=$("#socialStatus");
  if (new URLSearchParams(location.search).get('google') === 'failed') {
    showError('Não foi possível validar a conta Google. Tente novamente ou entre com e-mail e senha.');
  }
  window.ApiClient.get('/config').then(config=>{
    if (!config.google_login || !googleButton) {
      if (socialStatus) socialStatus.textContent='Login Google indisponível no momento. Apple ainda não está disponível.';
      return;
    }
    googleButton.disabled=false;
    googleButton.setAttribute('aria-label','Entrar com Google');
    if (socialStatus) socialStatus.textContent='Entre com Google ou use seu e-mail e senha. Apple ainda não está disponível.';
    googleButton.addEventListener('click',()=>{
      if (mode === 'login') location.assign('/auth/google/redirect?next='+encodeURIComponent(destinoAposLogin()));
      else showError('O login Google está disponível no modo Entrar.');
    });
  }).catch(()=>{});

  function setMode(newMode) {
    if(newMode===mode)return;
    mode=newMode;
    const register=mode==='register',recovery=mode==='recovery',reset=mode==='reset';
    tabBtns.forEach(button=>button.classList.toggle('is-active',button.dataset.mode===mode));
    tabs.dataset.mode=register?'register':'login';
    fieldName.classList.toggle('is-hidden',!register);inputName.disabled=!register;inputName.required=register;
    if(!register)inputName.value='';
    fieldPass.hidden=recovery;inputPass.disabled=recovery;inputPass.required=!recovery;
    fieldEmail.hidden=reset;inputEmail.disabled=reset;inputEmail.required=!reset;
    fieldConfirm.hidden=!reset;confirmPass.disabled=!reset;confirmPass.required=reset;
    forgot.hidden=mode!=='login';back.hidden=!(recovery||reset);$('#alternateLogin').hidden=recovery||reset;
    inputPass.autocomplete=register||reset?'new-password':'current-password';
    const label=fieldPass.querySelector('label');label.textContent=reset?'Nova senha':'Sua senha';
    const copy={login:['Que bom te ver','Sua história continua de onde parou.','Entrar'],register:['Vamos começar','Leva menos de um minuto para eternizar.','Criar conta'],recovery:['Recuperar senha','Informe seu e-mail para receber o link de recuperação.','Enviar link'],reset:['Definir nova senha','Escolha sua nova senha para continuar.','Salvar nova senha']}[mode];
    titleEl.textContent=copy[0];subEl.textContent=copy[1];sealText.textContent=copy[2];clearError();
    inputPass.value=confirmPass.value='';inputPass.type='password';peekBtn.setAttribute('aria-label','Mostrar senha');
  }
  forgot.addEventListener('click',event=>{event.preventDefault();if(!btn.disabled){setMode('recovery');inputEmail.focus();}});
  back.addEventListener('click',event=>{event.preventDefault();if(!btn.disabled){setMode('login');inputEmail.focus();}});
  if(loginRecovery.requested)setMode(loginRecovery.token?'reset':'recovery');

  tabBtns.forEach((b) => {
    b.addEventListener("click", () => {
      if (btn.disabled) return;
      setMode(b.dataset.mode);
    });
  });

  if (peekBtn && inputPass) {
    peekBtn.addEventListener("click", () => {
      const showing = inputPass.type === "text";
      inputPass.type = showing ? "password" : "text";
      peekBtn.setAttribute("aria-label",showing?"Mostrar senha":"Ocultar senha");
      peekBtn.style.color = showing ? "var(--text-muted)" : "var(--gold-1)";
    });
  }

  function showError(msg) {
    erroEl.textContent = msg;
    erroEl.classList.add("is-visible");
  }
  function clearError() {
    erroEl.textContent = "";
    erroEl.classList.remove("is-visible", "is-success");
  }
  [inputEmail, inputPass, inputName].forEach(el => el && el.addEventListener("input", clearError));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    if(btn.disabled)return;
    if(mode==='recovery'||mode==='reset'){await handleRecovery();return;}
    const email = inputEmail.value.trim().toLowerCase();
    const pass = inputPass.value;
    const name = inputName ? inputName.value.trim() : "";

    if (!email || !pass) return showError("Preencha e-mail e senha.");
    if (mode === "register" && !name) return showError("Preencha seu nome.");
    if (pass.length < 8) return showError("A senha precisa ter no mínimo 8 caracteres.");

    btn.disabled = true;
    btn.classList.add("is-loading");

    try {
      if (mode === "login") await window.ApiAuth.login(email, pass);
      else await window.ApiAuth.register(name, email, pass);

      btn.classList.remove("is-loading");
      btn.classList.add("is-success");
      sealText.textContent = "Sucesso";

      spawnPetalBurst();

      setTimeout(() => {
        window.location.href = destinoAposLogin();
      }, 900);

    } catch (err) {
      btn.classList.remove("is-loading");
      btn.disabled = false;

      if (err.code === "CLIENT_RATE_LIMITED" || err.code === "RATE_LIMITED") {
        let secs = err.retryAfter || 60;
        showError(`Muitas tentativas. Aguarde ${secs}s.`);
        btn.disabled = true;
        const itv = setInterval(() => {
          secs--;
          if (secs <= 0) {
            clearInterval(itv);
            clearError();
            btn.disabled = false;
            return;
          }
          showError(`Aguarde ${secs}s.`);
        }, 1000);
        return;
      }

      showError(err.message || "Erro ao autenticar. Tente novamente.");
    }
  });

  async function handleRecovery(){
    const reset=mode==='reset';
    if(!reset&&!inputEmail.checkValidity()){inputEmail.reportValidity();return;}
    if(reset&&(inputPass.value.length<8||inputPass.value!==confirmPass.value)){showError('Informe uma senha com pelo menos 8 caracteres e confirme a mesma senha.');return;}
    btn.disabled=true;btn.classList.add('is-loading');
    try{
      const result=await ApiClient.post('/auth/'+(reset?'reset-password':'forgot-password'),reset?{token:loginRecovery.token,email:loginRecovery.email,password:inputPass.value}:{email:inputEmail.value.trim()});
      if(reset){loginRecovery.token=null;setMode('login');}
      erroEl.classList.add('is-success');showError(result.message);
    }catch(error){showError(error.message||'Não foi possível concluir. Tente novamente.');}
    finally{btn.disabled=false;btn.classList.remove('is-loading');}
  }

  function spawnPetalBurst() {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      const w = 6 + Math.random() * 8;
      p.style.cssText = `
        --w:${w}px; --h:${w*1.3}px; position:fixed; left:${cx}px; top:${cy}px; z-index:999;
        width: ${w}px; height: ${w*1.3}px;
        background: linear-gradient(140deg, #E8A5B8, #D4AF37);
        border-radius: 50% 10% 50% 10%;
        animation: none; opacity: 1; transition: transform 1s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 1s ease-out;
        pointer-events: none;
        box-shadow: 0 0 8px rgba(232, 165, 184, 0.5);
      `;
      document.body.appendChild(p);

      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.5;
      const dist = 80 + Math.random() * 180;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      requestAnimationFrame(() => {
        p.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720}deg)`;
        p.style.opacity = "0";
      });

      setTimeout(() => p.remove(), 1200);
    }
  }
});
