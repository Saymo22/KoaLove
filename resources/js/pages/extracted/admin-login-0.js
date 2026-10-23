
        (async () => {
            if (await estaLogadoAdmin()) { window.location.href = "dashboard.html"; return; }

            document.getElementById("loginForm").addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("email").value;
                const senha = document.getElementById("senha").value;
                const erro  = document.getElementById("erro");
                const btn   = e.target.querySelector("button");
                btn.disabled = true;
                btn.textContent = "Entrando...";

                const res = await fazerLoginAdmin(email, senha);
                if (res.ok) { window.location.href = "dashboard.html"; return; }

                if (res.code === "RATE_LIMITED" || res.code === "CLIENT_RATE_LIMITED") {
                    erro.textContent = `Muitas tentativas. Aguarde ${res.retryAfter || 60}s antes de tentar de novo.`;
                } else {
                    erro.textContent = res.error || "Credenciais incorretas.";
                }
                erro.style.display = "block";
                btn.disabled = false;
                btn.textContent = "Entrar no Painel";
            });
        })();
