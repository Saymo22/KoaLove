function renderAdminHeader(activeTab) {
    const header = document.getElementById("adminHeader");
    if (!header) return;
    header.innerHTML = `
        <div class="admin-header">
            <div class="admin-header-top">
                <a href="dashboard.html" class="admin-logo">Nosso Amor <span>ADMIN</span></a>
                <button class="btn-logout-admin" onclick="fazerLogoutAdmin()">Sair do Painel</button>
            </div>
            <div class="admin-tabs">
                <a href="dashboard.html" class="admin-tab ${activeTab === 'dashboard' ? 'active' : ''}">📊 Visão Geral</a>
                <a href="clientes.html" class="admin-tab ${activeTab === 'clientes' ? 'active' : ''}">👥 Clientes</a>
                <a href="reembolsos.html" class="admin-tab ${activeTab === 'reembolsos' ? 'active' : ''}">💸 Reembolsos</a>
                <a href="suporte.html" class="admin-tab ${activeTab === 'suporte' ? 'active' : ''}">🎧 Suporte ao Cliente</a>
            </div>
        </div>
    `;
}
