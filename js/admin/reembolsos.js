protegerRotaAdmin();
renderAdminHeader('reembolsos');

// Simulação de banco de dados de reembolsos
let reembolsosDB = [
    { id: "A1B2", nome: "Lucas M.", data: "12/05/2024", motivo: "Acesso negado ao link", status: "pendente" },
    { id: "C3D4", nome: "Carolina S.", data: "10/05/2024", motivo: "Arrependimento (7 dias)", status: "aprovado" },
    { id: "E5F6", nome: "Rafael T.", data: "08/05/2024", motivo: "Problemas com áudio", status: "pendente" }
];

// Função para criar toasts (UX Premium)
function showToast(msg) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `✅ ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderTabela() {
    const tbody = document.getElementById("tabelaReembolsos");
    tbody.innerHTML = "";

    reembolsosDB.forEach((req, index) => {
        const tr = document.createElement("tr");
        
        let badgeClass = "badge-pendente", badgeText = "Pendente";
        if (req.status === "aprovado") { badgeClass = "badge-aprovado"; badgeText = "Aprovado"; }
        if (req.status === "recusado") { badgeClass = "badge-recusado"; badgeText = "Recusado"; }

        tr.innerHTML = `
            <td><strong>#${req.id}</strong></td>
            <td>${req.nome}</td>
            <td>${req.data}</td>
            <td>${req.motivo}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>
                ${req.status === "pendente" ? `
                    <button class="btn-action" onclick="alterarStatus(${index}, 'aprovado')">Aprovar</button>
                    <button class="btn-action danger" onclick="alterarStatus(${index}, 'recusado')">Recusar</button>
                ` : '—'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.alterarStatus = function(index, novoStatus) {
    reembolsosDB[index].status = novoStatus;
    showToast(`Reembolso #${reembolsosDB[index].id} ${novoStatus}!`);
    renderTabela();
}

renderTabela();