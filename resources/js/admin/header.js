const ADMIN_ICONS = {
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    clientes:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
    planos:'<path d="M3 4h8l10 10-7 7L3 10Z"/><circle cx="7.5" cy="8" r="1"/>',
    reembolsos:'<path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5M4 10l5 5"/><path d="M15 3h5v5"/>',
    suporte:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v6h4v-6ZM20 12h2v6h-4v-6ZM20 18v3h-7"/>',
    receita:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M15 15h3M7 3v4"/>',
    compras:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
    arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
    logout:'<path d="M9 4H4v16h5M10 12h11M17 8l4 4-4 4"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
};
function adminIcon(name){return `<svg class="admin-icon" viewBox="0 0 24 24" aria-hidden="true">${ADMIN_ICONS[name]||ADMIN_ICONS.dashboard}</svg>`;}
function renderAdminHeader(activeTab) {
    const header=document.getElementById('adminHeader');if(!header)return;
    const tabs=[['dashboard','Visão geral'],['clientes','Clientes'],['planos','Planos e descontos'],['reembolsos','Reembolsos'],['suporte','Atendimento']];
    const title=tabs.find(([id])=>id===activeTab)?.[1]||'Administração';
    header.innerHTML=`
      <button class="admin-nav-backdrop" type="button" aria-label="Fechar menu"></button>
      <aside class="admin-sidebar" id="adminSidebar" aria-label="Menu administrativo">
        <a href="dashboard.html" class="admin-logo"><img class="admin-brand-image" src="/branding/koalove-logo-admin.svg" width="184" height="64" alt="KoaLove"><span class="admin-brand-caption">Painel premium</span></a>
        <p class="admin-nav-label">Administração</p>
        <nav class="admin-tabs" aria-label="Navegação do painel">${tabs.map(([id,label])=>`<a href="${id}.html" class="admin-tab ${id===activeTab?'active':''}"${id===activeTab?' aria-current="page"':''}>${adminIcon(id)}<span>${label}</span></a>`).join('')}</nav>
        <div class="admin-sidebar-footer">
          <a class="admin-site-link" href="../home.html">Visitar o site <span aria-hidden="true">↗</span></a>
          <div class="admin-user-chip"><img src="/branding/koalove-simbolo-sobre-rose.svg" width="44" height="44" alt=""><div><strong id="adminUserName"></strong><span>Administrador</span></div></div>
          <button class="btn-logout-admin" type="button">${adminIcon('logout')}Sair do painel</button>
        </div>
      </aside>
      <div class="admin-topbar">
        <button class="admin-menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="adminSidebar">${adminIcon('menu')}</button>
        <div class="admin-breadcrumb"><span>Painel</span><span aria-hidden="true">/</span><b>${title}</b></div>
        <div class="admin-topbar-end"><time class="admin-date">${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}</time><span class="admin-private">${adminIcon('lock')}Acesso seguro</span></div>
      </div>`;
    header.querySelector('#adminUserName').textContent = obterAdminAtual()?.name || 'Administrador';
    document.querySelectorAll('[data-admin-icon]').forEach(el=>{el.innerHTML=adminIcon(el.dataset.adminIcon);});
    const toggle=header.querySelector('.admin-menu-toggle'),sidebar=header.querySelector('.admin-sidebar');
    function setOpen(open){document.body.classList.toggle('admin-navigation-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');if('inert' in sidebar)sidebar.inert=matchMedia('(max-width:760px)').matches&&!open;}
    toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';setOpen(open);if(open)sidebar.querySelector('a').focus();});
    header.querySelector('.admin-nav-backdrop').addEventListener('click',()=>{setOpen(false);toggle.focus();});
    header.addEventListener('keydown',event=>{if(event.key==='Escape'){setOpen(false);toggle.focus();}});
    // Fecha o menu ao completar o ciclo do teclado, sem deixar o foco sob a sobreposição.
    sidebar.addEventListener('keydown',event=>{if(event.key!=='Tab'||!matchMedia('(max-width:760px)').matches)return;const items=sidebar.querySelectorAll('a,button');if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items[items.length-1].focus();}else if(!event.shiftKey&&document.activeElement===items[items.length-1]){event.preventDefault();items[0].focus();}});
    matchMedia('(max-width:760px)').addEventListener('change',()=>setOpen(false));setOpen(false);
    header.querySelector('.btn-logout-admin').addEventListener('click',async event=>{const button=event.currentTarget;button.disabled=true;try{await fazerLogoutAdmin();}catch{button.disabled=false;adminNotify('Não foi possível encerrar a sessão. Tente novamente.');}});
}

function adminNotify(message) {
    let container=document.getElementById('toastContainer');
    if(!container){container=document.createElement('div');container.id='toastContainer';container.className='toast-container';container.setAttribute('aria-live','polite');document.body.append(container);}
    const note=document.createElement('div');note.className='toast';note.textContent=message;container.append(note);setTimeout(()=>note.remove(),6000);
}

// Formulário de resposta acessível; o texto segue como texto simples para a API existente.
function adminReplyDialog() {
    return new Promise(resolve=>{
        const dialog=document.createElement('dialog');dialog.className='admin-dialog';
        dialog.innerHTML='<form method="dialog"><p class="admin-eyebrow">Atendimento</p><h2>Uma resposta com cuidado.</h2><p>Sua mensagem ficará registrada no atendimento do cliente.</p><label for="adminReplyText">Resposta<textarea id="adminReplyText" name="message" required maxlength="2000" placeholder="Escreva sua resposta…"></textarea></label><div class="admin-dialog-actions"><button class="btn-action" type="button">Cancelar</button><button class="btn-action" type="submit">Enviar resposta</button></div></form>';
        document.body.append(dialog);const previous=document.activeElement;let response=null;
        dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const text=dialog.querySelector('textarea').value.trim();if(!text){dialog.querySelector('textarea').focus();return;}response=text;dialog.close();});
        dialog.querySelector('[type=button]').addEventListener('click',()=>dialog.close());
        dialog.addEventListener('close',()=>{dialog.remove();previous?.focus();resolve(response);},{once:true});dialog.showModal();dialog.querySelector('textarea').focus();
    });
}
