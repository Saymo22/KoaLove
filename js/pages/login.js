/* js/pages/login.js */
document.addEventListener("DOMContentLoaded", () => {
    if (estaLogado()) {
        window.location.href = "minha-conta.html";
        return;
    }

    // Partículas
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

    // Elemento de erro
    let erroEl = document.getElementById("authErro");
    if (!erroEl) {
        erroEl = document.createElement("div");
        erroEl.id = "authErro";
        erroEl.style.cssText = "color:#ff9ba8;font-size:13px;text-align:center;margin-top:4px;min-height:18px;font-weight:500;line-height:1.4;";
        btnSubmit.parentElement.insertBefore(erroEl, btnSubmit.nextSibling);
    }

    function limparErro() {
        erroEl.textContent = "";
        inputEmail.style.borderColor = "";
        inputPass.style.borderColor = "";
        if (inputName) inputName.style.borderColor = "";
    }

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

    [inputEmail, inputPass, inputName].forEach(el => {
        if (!el) return;
        el.addEventListener("input", limparErro);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        limparErro();

        const email = inputEmail.value.trim().toLowerCase();
        const pass = inputPass.value;
        const name = inputName ? inputName.value.trim() : "";

        if (!email || !pass) {
            erroEl.textContent = "Preencha e-mail e senha.";
            return;
        }
        if (!isLogin && !name) {
            erroEl.textContent = "Preencha seu nome.";
            inputName.style.borderColor = "#ff9ba8";
            return;
        }
        if (pass.length < 4) {
            erroEl.textContent = "A senha precisa ter pelo menos 4 caracteres.";
            inputPass.style.borderColor = "#ff9ba8";
            return;
        }

        const originalText = btnText.textContent;
        btnText.textContent = "Carregando...";
        btnSubmit.disabled = true;

        setTimeout(() => {
            const res = isLogin ? tentarLogin(email, pass) : criarConta(name, email, pass);

            if (!res.ok) {
                erroEl.textContent = res.error;
                inputEmail.style.borderColor = "#ff9ba8";
                inputPass.style.borderColor = "#ff9ba8";
                btnText.textContent = originalText;
                btnSubmit.disabled = false;
                return;
            }

            window.location.href = "minha-conta.html";
        }, 700);
    });
});