protegerRotaAdmin();
renderAdminHeader('suporte');

let ticketsDB = [
    { id: "TK-102", nome: "Marina S.", assunto: "A música não toca no iPhone", data: "Hoje, 09:42", status: "aberto" },
    { id: "TK-101", nome: "João P.", assunto: "Como faço para baixar o QR Code?", data: "Ontem, 15:30", status: "respondido" },
    { id: "TK-099", nome: "Amanda L.", assunto: "Quero mudar a capa do presente", data: "12/05/2024", status: "aberto" }
];

function showToast(msg) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `✅ ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderSuporte() {
    const tbody = document.getElementById("tabelaSuporte");
    tbody.innerHTML = "";

    ticketsDB.forEach((ticket, index) => {
        const tr = document.createElement("tr");
        
        let badgeClass = ticket.status === "aberto" ? "badge-pendente" : "badge-aprovado";
        let badgeText = ticket.status === "aberto" ? "Aguardando" : "Respondido";

        tr.innerHTML = `
            <td><strong>${ticket.id}</strong></td>
            <td>${ticket.nome}</td>
            <td>${ticket.assunto}</td>
            <td>${ticket.data}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>
                <button class="btn-action" onclick="abrirTicket(${index})">Abrir Chat</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.abrirTicket = function(index) {
    if (ticketsDB[index].status === 'aberto') {
        ticketsDB[index].status = 'respondido';
        showToast(`Ticket ${ticketsDB[index].id} marcado como respondido.`);
        renderSuporte();
    } else {
        showToast(`Visualizando histórico do ticket ${ticketsDB[index].id}.`);
    }
}

renderSuporte();