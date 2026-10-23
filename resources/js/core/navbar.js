/* =====================================================
   js/core/navbar.js — v3
   Componente compartilhado da navbar — todas as páginas.

   - Detecta variante pela URL (full / minimal / dashboard / none)
   - "Login" agora aparece em TODAS as páginas (full + minimal)
   - Quando logado: mostra avatar + nome (link para minha-conta)
   - Menu Hambúrguer nativo para mobile (<= 860px)
   - Autocontido: lê o localStorage direto (não depende de auth.js)
   ===================================================== */
window.NA = window.NA || {};

NA.navbar = (function () {
    "use strict";

    const SESSION_KEY = "nossoamor_session";
    const STYLES_ID = "navbar-styles";

    /* ================= helpers ================= */
    function currentPage() {
        const p = window.location.pathname.split("/").pop() || "home.html";
        return p.split("?")[0].split("#")[0];
    }
    function isHome() {
        const p = currentPage();
        return p === "" || p === "index.html" || p === "home.html";
    }
    function href(anchor) {
        return isHome() ? anchor : "home.html" + anchor;
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[c]));
    }
    function getUser() {
  // Cache local para renderização instantânea
  try {
    const raw = localStorage.getItem("nossoamor_user_cache");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
    function detectVariant() {
        const p = currentPage();
        if (p === "minha-conta.html") return "dashboard";
        if (p === "ver.html") return "none";
        if (p === "" || p === "index.html" || p === "home.html") return "full";
        return "minimal";
    }

    /* ================= estilos (injetados 1x) ================= */
    function injectStyles() {
        if (document.getElementById(STYLES_ID)) return;
        const s = document.createElement("style");
        s.id = STYLES_ID;
        s.textContent = `
            /* ── Link de usuário logado (Desktop e Mobile) ── */
            .nav-user {
                display: inline-flex; align-items: center; gap: 10px;
                padding: 5px 14px 5px 5px; margin-left: 8px;
                border-radius: 50px;
                color: var(--vinho, #7d3048);
                text-decoration: none;
                font-size: 13px; font-weight: 500;
                transition: background .3s, color .3s;
                white-space: nowrap;
            }
            .nav-user:hover { background: rgba(201, 168, 106, 0.15); }
            .nav-user-avatar {
                width: 32px; height: 32px; border-radius: 50%;
                background: linear-gradient(135deg, #e9a6b8, #7d3048);
                color: #fff; display: inline-flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: 700; flex-shrink: 0;
                box-shadow: 0 4px 10px rgba(125, 48, 72, 0.25);
            }
            .nav-user-name {
                max-width: 120px; overflow: hidden;
                text-overflow: ellipsis; white-space: nowrap;
            }

            /* ── Botão Hambúrguer (escondido no Desktop) ── */
            .nav-toggle {
                display: none;
                background: transparent;
                border: none;
                color: var(--vinho, #7d3048);
                font-size: 26px;
                cursor: pointer;
                padding: 8px 12px;
                line-height: 1;
                border-radius: 50%;
                transition: background 0.3s;
            }
            .nav-toggle:hover { background: rgba(201, 168, 106, 0.15); }

            /* ── REGRAS MOBILE (Telas <= 860px) ── */
            @media (max-width: 860px) {
                /* Impede o logo de amassar */
                .nav .logo { font-size: 20px; white-space: nowrap; flex-shrink: 0; }
                .nav .logo::before { width: 26px; height: 26px; font-size: 12px; }

                .nav-toggle { display: block; }

                /* Transforma os links em um menu dropdown */
                .nav-links {
                    display: none; /* Esconde por padrão */
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0; right: 0;
                    background: var(--nav-bg-scrolled, #fffcf8);
                    flex-direction: column;
                    padding: 16px;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(75, 55, 64, 0.15);
                    border: 1px solid rgba(201, 168, 106, 0.3);
                    align-items: stretch;
                    gap: 6px;
                    z-index: 1000;
                }

                /* Classe ativada pelo JS */
                .nav-links.open { display: flex; animation: navFadeIn 0.3s ease; }

                @keyframes navFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Ajustes nos links do menu mobile */
                .nav-links a:not(.b) {
                    padding: 12px 16px;
                    text-align: center;
                    font-size: 14px;
                    border-radius: 12px;
                }
                .nav-links a:not(.b):hover {
                    background: rgba(201, 168, 106, 0.1);
                }

                /* Botão Criar presente ocupa 100% no mobile */
                .nav-links .b {
                    margin: 8px 0 0 0;
                    width: 100%;
                    justify-content: center;
                    padding: 14px;
                }

                /* Link de usuário centralizado */
                .nav-user {
                    margin: 4px 0;
                    justify-content: center;
                    background: rgba(201, 168, 106, 0.08);
                    padding: 10px;
                }
                .nav-user-name { display: inline-block; } /* Volta a mostrar o nome no menu */
                .nav-user-avatar { width: 28px; height: 28px; font-size: 13px; }

                /* Dashboard (Minha Conta) ajuste no mobile */
                .nav-profile { flex-direction: column; padding: 10px 0 0; border-left: none; border-top: 1px solid rgba(201,168,106,0.2); margin-top: 8px; gap: 8px;}
                .nav-profile span { display: block !important; }
            }
        `;
        document.head.appendChild(s);
    }

    /* ================= peça de auth (Login OU avatar+nome) ================= */
    function authLinkHTML() {
        const p = currentPage();
        const user = getUser();

        if (user) {
            const initial = escapeHtml((user.name || "U").trim().charAt(0).toUpperCase() || "U");
            const name = escapeHtml((user.name || "Usuário").trim() || "Usuário");
            return (
                `<a href="minha-conta.html" class="nav-user" title="Minha Conta">` +
                `<span class="nav-user-avatar">${initial}</span>` +
                `<span class="nav-user-name">${name}</span>` +
                `</a>`
            );
        }

        if (p === "login.html") return "";
        return `<a href="login.html">Login</a>`;
    }

    /* ================= templates ================= */
    function tplFull() {
        return `
            <nav class="nav" id="nav" aria-label="Principal">
                <div class="wrap">
                    <a href="home.html" class="logo">Nosso Amor</a>
                    <button class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
                    <div class="nav-links" id="navLinks">
                        <a href="${href("#como")}">Como funciona</a>
                        <a href="${href("#temas")}">Temas</a>
                        <a href="${href("#depoimentos")}">Depoimentos</a>
                        <a href="${href("#preco")}">Preço</a>
                        <a href="${href("#duvidas")}">Dúvidas</a>
                        ${authLinkHTML()}
                        <a href="criar.html" class="b ouro peq magnetic">Criar presente <span class="seta">→</span></a>
                    </div>
                </div>
            </nav>
        `;
    }

    function tplMinimal() {
        return `
            <nav class="nav" id="nav" aria-label="Principal">
                <div class="wrap">
                    <a href="home.html" class="logo">Nosso Amor</a>
                    <button class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
                    <div class="nav-links" id="navLinks">
                        <a href="${href("#como")}">Como funciona</a>
                        <a href="${href("#temas")}">Temas</a>
                        <a href="${href("#preco")}">Preço</a>
                        <a href="${href("#duvidas")}">Dúvidas</a>
                        ${authLinkHTML()}
                        <a href="criar.html" class="b ouro peq">Criar presente <span class="seta">→</span></a>
                    </div>
                </div>
            </nav>
        `;
    }

    function tplDashboard() {
        return `
            <nav class="nav" id="nav" aria-label="Principal">
                <div class="wrap">
                    <a href="home.html" class="logo">Nosso Amor</a>
                    <button class="nav-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>
                    <div class="nav-links" id="navLinks">
                        <a href="minha-conta.html" class="active">Minha Conta</a>
                        <a href="criar.html" class="b ouro peq">Criar novo +</a>
                        <div class="nav-profile">
                            <div class="user-avatar" id="navAvatar">U</div>
                            <span id="navUserName">Usuário</span>
                            <button id="btnLogout" class="btn-logout" title="Sair">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    const TEMPLATES = { full: tplFull, minimal: tplMinimal, dashboard: tplDashboard };

    /* ================= inject & eventos ================= */
    function inject() {
        const container = document.getElementById("navbar");
        if (!container) return;

        const variant = (container.dataset.variant || detectVariant()).toLowerCase();
        if (variant === "none") return;

        injectStyles();
        container.innerHTML = (TEMPLATES[variant] || TEMPLATES.minimal)();

        // Lógica do Hambúrguer
        const toggleBtn = container.querySelector(".nav-toggle");
        const navLinks = container.querySelector("#navLinks");

        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isOpen = navLinks.classList.toggle("open");
                toggleBtn.setAttribute("aria-expanded", isOpen);
                toggleBtn.innerHTML = isOpen ? "✕" : "☰";
            });

            // Fecha o menu ao clicar em qualquer link
            navLinks.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => {
                    navLinks.classList.remove("open");
                    toggleBtn.innerHTML = "☰";
                    toggleBtn.setAttribute("aria-expanded", "false");
                });
            });

            // Fecha o menu ao clicar fora dele
            document.addEventListener("click", (e) => {
                if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                    navLinks.classList.remove("open");
                    toggleBtn.innerHTML = "☰";
                    toggleBtn.setAttribute("aria-expanded", "false");
                }
            });
        }

        // Efeito de scroll (Desktop)
        if (variant !== "dashboard") {
            const nav = container.querySelector(".nav");
            if (nav) {
                const applyScrolled = () => {
                    if (window.innerWidth > 860) {
                        nav.classList.toggle("scrolled", window.scrollY > 30);
                    } else {
                        nav.classList.remove("scrolled");
                    }
                };
                window.addEventListener("scroll", applyScrolled, { passive: true });
                window.addEventListener("resize", applyScrolled);
                applyScrolled();
            }
        }

        document.dispatchEvent(new CustomEvent("navbar:ready", { detail: { variant } }));
    }

    function init() {
        inject();
        window.addEventListener("storage", (e) => {
            if (e.key === SESSION_KEY || e.key === "nossoamor_user_cache") inject();
        });
        // Reconcilia o cache de usuário com a API em background (contrato)
        if (window.ApiAuth) {
            window.ApiAuth.me().then(() => {
                inject();
            }).catch(() => {
                // 401 → estado deslogado
                try { localStorage.removeItem("nossoamor_user_cache"); } catch (e) {}
                inject();
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    return { init, inject };
})();
