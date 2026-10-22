document.addEventListener("DOMContentLoaded", async () => {
  // Se já logado, redireciona
  try {
    await window.ApiAuth.me();
    window.location.href = "minha-conta.html";
    return;
  } catch { /* não logado, ok */ }

  // Partículas (mantido)
  const particlesContainer = document.getElementById("particles");
  if (particlesContainer) {
    const symbols = ["♥", "♡", "✦", "✧"];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = (8 + Math.random() * 10) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      p.style.fontSize = (10 + Math.random() * 20) + "px";
      particlesContainer.appendChild(p);
    }
  }

  let isLogin = true;
  const btnToggle = document.getElementById("btnToggle");
  const toggleText = document.getElementById("toggleText");
  const groupName = document.getElementById("groupName");
  const inputName = document.getElementById("inputName");
  const inputEmail = document.getElementById("inputEmail");
  const inputPass = document.getElementById("inputPass");
  const authTitle = document.getElementById("authTitle");
  const authSub = document.getElementById("authSub");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnText = btnSubmit.querySelector(".btn-text");
  const form = document.getElementById("authForm");

  let erroEl = document.getElementById("authErro");
  if (!erroEl) {
    erroEl = document.createElement("div");
    erroEl.id = "authErro";
    erroEl.style.cssText = "color:#ff9ba8;font-size:13px;text-align:center;margin-top:4px;min-height:18px;font-weight:500;line-height:1.4;";
    btnSubmit.parentElement.insertBefore(erroEl, btnSubmit.nextSibling);
  }

  function limparErro() { erroEl.textContent = ""; }
  btnToggle.addEventListener("click", () => {
    isLogin = !isLogin;
    limparErro();
    if (isLogin) {
      authTitle.textContent = "Bem-vindo de volta";
      authSub.textContent = "Acesse sua conta para gerenciar suas surpresas.";
      btnText.textContent = "Entrar na conta";
      toggleText.textContent = "Ainda não tem uma conta?";
      btnToggle.textContent = "Criar conta";
      groupName.classList.add("hidden");
      inputName.required = false;
    } else {
      authTitle.textContent = "Crie sua conta";
      authSub.textContent = "Leva menos de um minuto para eternizar suas histórias.";
      btnText.textContent = "Criar minha conta";
      toggleText.textContent = "Já tem uma conta?";
      btnToggle.textContent = "Fazer login";
      groupName.classList.remove("hidden");
      inputName.required = true;
    }
  });

  [inputEmail, inputPass, inputName].forEach(el => el && el.addEventListener("input", limparErro));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();

    const email = inputEmail.value.trim().toLowerCase();
    const pass = inputPass.value;
    const name = inputName ? inputName.value.trim() : "";

    if (!email || !pass) { erroEl.textContent = "Preencha e-mail e senha."; return; }
    if (!isLogin && !name) { erroEl.textContent = "Preencha seu nome."; return; }
    if (pass.length < 6) { erroEl.textContent = "A senha precisa ter pelo menos 6 caracteres."; return; }

    const original = btnText.textContent;
    btnText.textContent = "Carregando...";
    btnSubmit.disabled = true;

    try {
      if (isLogin) await window.ApiAuth.login(email, pass);
      else await window.ApiAuth.register(name, email, pass);
      window.location.href = "minha-conta.html";
    } catch (err) {
      // Tratamento explícito por código
      if (err.code === "CLIENT_RATE_LIMITED" || err.code === "RATE_LIMITED") {
        erroEl.textContent = `Muitas tentativas. Aguarde ${err.retryAfter || 60}s antes de tentar de novo.`;
        // Cooldown visual
        let secs = err.retryAfter || 60;
        const itv = setInterval(() => {
          secs--;
          if (secs <= 0) {
            clearInterval(itv);
            erroEl.textContent = "";
            btnText.textContent = original;
            btnSubmit.disabled = false;
            return;
          }
          erroEl.textContent = `Aguarde ${secs}s.`;
        }, 1000);
        return; // Não reabilita o botão até o cooldown
      }
      erroEl.textContent = err.message || "Erro ao autenticar.";
      btnText.textContent = original;
      btnSubmit.disabled = false;
    }
  });
});