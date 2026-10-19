/* js/pages/login.js */
document.addEventListener("DOMContentLoaded", () => {
    // Se já estiver logado, vai direto para a conta
    if (estaLogado()) {
        window.location.href = "minha-conta.html";
        return;
    }

    // Gerar Partículas
    const particlesContainer = document.getElementById("particles");
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

    // Lógica de Alternância
    let isLogin = true;
    const btnToggle = document.getElementById("btnToggle");
    const toggleText = document.getElementById("toggleText");
    const groupName = document.getElementById("groupName");
    const inputName = document.getElementById("inputName");
    const authTitle = document.getElementById("authTitle");
    const authSub = document.getElementById("authSub");
    const btnSubmit = document.getElementById("btnSubmit");
    const btnText = btnSubmit.querySelector(".btn-text");

    btnToggle.addEventListener("click", () => {
        isLogin = !isLogin;
        
        if (isLogin) {
            // Mudar para Login
            authTitle.textContent = "Bem-vindo de volta";
            authSub.textContent = "Acesse sua conta para gerenciar suas surpresas.";
            btnText.textContent = "Entrar na conta";
            toggleText.textContent = "Ainda não tem uma conta?";
            btnToggle.textContent = "Criar conta";
            groupName.classList.add("hidden");
            inputName.required = false;
        } else {
            // Mudar para Cadastro
            authTitle.textContent = "Crie sua conta";
            authSub.textContent = "Leva menos de um minuto para eternizar suas histórias.";
            btnText.textContent = "Criar minha conta";
            toggleText.textContent = "Já tem uma conta?";
            btnToggle.textContent = "Fazer login";
            groupName.classList.remove("hidden");
            inputName.required = true;
        }
    });

    // Submit do Formulário
    const form = document.getElementById("authForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const email = document.getElementById("inputEmail").value.trim();
        const pass = document.getElementById("inputPass").value;
        const name = isLogin ? (email.split("@")[0]) : inputName.value.trim(); // Se login, pega o nome do email ou salva o antigo

        if (!email || !pass) return;

        // Simula um carregamento
        const originalText = btnText.textContent;
        btnText.textContent = "Carregando...";
        btnSubmit.disabled = true;

        setTimeout(() => {
            // Se for login, tenta recuperar o nome salvo ou usa o começo do email
            let finalName = name;
            if (isLogin) {
                const saved = localStorage.getItem("nossoamor_session");
                if (saved) finalName = JSON.parse(saved).name;
            }

            fazerLogin(finalName, email);
            window.location.href = "minha-conta.html";
        }, 1200);
    });
});