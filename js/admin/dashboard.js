protegerRotaAdmin();
renderAdminHeader('dashboard');

async function carregarDashboard() {
    try {
        // Puxa os pedidos reais do banco
        const pedidos = await listarTodosPedidos();
        
        // Filtra os pagos
        const pagos = pedidos.filter(p => p.status === 'pago');
        
        // Calcula Receita (considerando valor pago ou preço padrão de 19.90)
        const receitaTotal = pagos.reduce((acc, p) => acc + (p.valorPago || 19.90), 0);
        
        // Atualiza os Cards
        document.getElementById("metricReceita").textContent = receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById("metricCompras").textContent = pagos.length;

        // Renderiza últimas 4 transações
        const recentList = document.getElementById("recentList");
        recentList.innerHTML = "";

        if (pagos.length === 0) {
            recentList.innerHTML = "<p style='color:#8b717b; font-size:14px;'>Nenhuma transação registrada neste navegador.</p>";
        } else {
            // Ordena do mais recente para o mais antigo
            pagos.sort((a, b) => (b.pagoEm || b.criadoEm) - (a.pagoEm || a.criadoEm));
            
            pagos.slice(0, 4).forEach(p => {
                const valor = p.valorPago ? p.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "R$ 19,90";
                const data = new Date(p.pagoEm || p.criadoEm).toLocaleDateString('pt-BR');
                
                recentList.innerHTML += `
                    <div class="recent-item">
                        <div class="recent-info">
                            <b>${p.titulo || 'Presente sem título'}</b>
                            <span>Para ${p.para || 'Alguém'} • ${data}</span>
                        </div>
                        <div class="recent-value">${valor}</div>
                    </div>
                `;
            });
        }

    } catch (e) {
        console.error("Erro ao carregar métricas", e);
        document.getElementById("metricReceita").textContent = "Erro";
    }
}

carregarDashboard();