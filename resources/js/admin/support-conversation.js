(async () => {
  if (!(await protegerRotaAdmin())) return;
  const tbody=document.getElementById('tabelaSuporte'),dialog=document.getElementById('supportDialog'),log=document.getElementById('supportMessages');
  const form=document.getElementById('supportReplyForm'),input=document.getElementById('supportReplyText'),error=document.getElementById('supportReplyError');
  let tickets=[],active=null,loading=false,sending=false;
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  renderAdminHeader('suporte');
  function renderConversation(){
    const ticket=tickets.find(t=>t.id===active);if(!ticket)return;
    document.getElementById('supportSubject').textContent=ticket.subject;
    document.getElementById('supportCustomer').textContent=ticket.cliente?.name||'Cliente';
    const bottom=log.scrollHeight-log.scrollTop-log.clientHeight<60;
    log.replaceChildren(...(ticket.messages||[]).map(m=>{
      const item=document.createElement('div');item.className='support-message '+(m.role==='admin'?'support-message-admin':'');
      const label=document.createElement('strong');label.textContent=({admin:'Equipe Nosso Amor',user:'Cliente',system:'Triagem',context:'Contexto enviado'})[m.role]||'Registro';
      const time=document.createElement('time');const date=new Date(m.at);time.textContent=Number.isNaN(date.getTime())?'':date.toLocaleString('pt-BR');
      const text=document.createElement('p');text.textContent=m.text;item.append(label,time,text);return item;
    }));
    if(bottom)log.scrollTop=log.scrollHeight;
  }
  async function load(){
    if(loading||document.hidden)return;loading=true;
    try{
      const data=await window.ApiAdmin.tickets();tickets=data.tickets;
      tbody.innerHTML=tickets.length?tickets.map(t=>`<tr><td><strong>${escapeHtml(t.id.slice(0,10))}</strong></td><td>${escapeHtml(t.cliente?.name||'—')}</td><td>${escapeHtml(t.subject)}</td><td>${new Date(t.created_at).toLocaleDateString('pt-BR')}</td><td><span class="badge badge-${t.status==='open'?'pendente':'aprovado'}">${t.status==='open'?'Aguardando':'Respondido'}</span></td><td><button class="btn-action" data-id="${escapeHtml(t.id)}">Abrir conversa</button></td></tr>`).join(''):'<tr><td colspan="6">Nenhum atendimento recebido.</td></tr>';
      if(dialog.open)renderConversation();
    }catch(err){if(err.status===401||err.status===403){tickets=[];log.replaceChildren();dialog.close();}adminNotify('Não foi possível atualizar o atendimento: '+err.message);}
    finally{loading=false;}
  }
  tbody.addEventListener('click',event=>{
    const button=event.target.closest('button[data-id]');if(!button)return;
    active=button.dataset.id;error.textContent='';input.value='';renderConversation();dialog.showModal();log.scrollTop=log.scrollHeight;input.focus();
  });
  document.getElementById('closeSupportDialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',event=>{if(sending)event.preventDefault();});
  dialog.addEventListener('close',()=>{const button=[...tbody.querySelectorAll('button')].find(b=>b.dataset.id===active);button?.focus();active=null;});
  form.addEventListener('submit',async event=>{
    event.preventDefault();const text=input.value.trim();if(!text||!active||sending)return;
    sending=true;error.textContent='';const button=form.querySelector('[type=submit]');button.disabled=true;document.getElementById('closeSupportDialog').disabled=true;
    try{const data=await window.ApiAdmin.ticketReply(active,text);const ticket=tickets.find(t=>t.id===active);Object.assign(ticket,data.ticket);input.value='';renderConversation();adminNotify('Resposta enviada ao chat do cliente.');await load();}
    catch(err){error.textContent=err.message||'Não foi possível enviar a resposta.';}
    finally{sending=false;button.disabled=false;document.getElementById('closeSupportDialog').disabled=false;}
  });
  const timer=setInterval(load,30000);window.addEventListener('pagehide',()=>clearInterval(timer));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
  await load();
})();
