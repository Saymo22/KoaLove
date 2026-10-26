/* Modelo fornecido, conectado exclusivamente à API Laravel. */
(async()=>{
if(!(await protegerRotaAdmin()))return;
let db;
try{db=await window.ApiClient.get("/admin/workspace");}catch(error){const loading=document.getElementById("workspaceLoading");loading.textContent="Não foi possível carregar o painel: "+error.message;const retry=document.createElement("button");retry.className="btn primary";retry.textContent="Tentar novamente";retry.addEventListener("click",()=>location.reload());loading.append(retry);return;}
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const DAY = 864e5;
const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const compact = n=>{const a=Math.abs(n);return (n<0?'-':'')+(a>=1000?(a/1000).toFixed(a>=10000?0:1).replace('.',',')+'k':Math.round(a))};
const initials = n=>String(n).trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase();
const fmtD  = ts=>new Date(ts).toLocaleDateString('pt-BR');
const fmtT  = ts=>new Date(ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const fmtDT = ts=>fmtD(ts)+' '+fmtT(ts);
const startOfDay = t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const toLocalInput = ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};
const toDateInput = ts=>toLocalInput(ts).slice(0,10);
const cap = s=>s.charAt(0).toUpperCase()+s.slice(1);
const uid = p=>p+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
const validEmail = e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function rel(ts){
  const m=Math.floor((Date.now()-new Date(ts))/6e4);
  if(m<1) return 'agora'; if(m<60) return `há ${m} min`;
  const h=Math.floor(m/60); if(h<24) return `há ${h} h`;
  return `há ${Math.floor(h/24)} d`;
}
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
const planById = id=>db.plans.find(p=>p.id===id);
const planName = id=>id==='all'?'Todos os planos':(planById(id)?.nome||'Plano removido');
const clientByName = n=>db.clients.find(c=>c.nome===n);
const discLabel = d=>d.tipo==='percent'?`${String(d.valor).replace('.',',')}%`:money(d.valor);
const applyDisc=(price,d)=>Math.max(1,d.tipo==='percent'?Math.round(price*100*(100-d.valor)/100):Math.round(price*100)-Math.round(d.valor*100))/100;
const promoState = p=>{
  if(!p.ativo) return 'inativa';
  const n=Date.now();
  if(n<new Date(p.inicio)) return 'agendada';
  if(n>new Date(p.fim)) return 'encerrada';
  return 'ativa';
};
const couponState = c=>{
  if(!c.ativo) return 'inativo';
  const n=Date.now();
  if(n<new Date(c.inicio||0)) return 'agendado';
  if(c.fim&&n>=new Date(c.fim)) return 'expirado';
  if(c.limite&&c.usos>=c.limite) return 'esgotado';
  return 'ativo';
};
const activePromo=planId=>db.promos.filter(p=>(p.planoId===planId||p.planoId==='all')&&promoState(p)==='ativa').sort((a,b)=>applyDisc(planById(planId)?.preco||0,a)-applyDisc(planById(planId)?.preco||0,b))[0];
const STATUS_LABEL={pendente:'Pendente',aprovado:'Aprovado',recusado:'Recusado',conferido:'Conferido',aberto:'Aberto',andamento:'Em andamento',resolvido:'Resolvido',ativa:'Ativa',inativa:'Inativa',agendada:'Agendada',encerrada:'Encerrada',ativo:'Ativo',inativo:'Inativo',agendado:'Agendado',expirado:'Expirado',esgotado:'Esgotado',alta:'Alta',media:'Média',baixa:'Baixa'};
const badge = s=>`<span class="badge ${s}">${STATUS_LABEL[s]||cap(s)}</span>`;
const LOG_ICON={pix:'💰',refund:'↩',ticket:'💬',plan:'💎',promo:'⏱',coupon:'🎟',client:'👤',theme:'🎨',admin:'🛡',system:'⚙'};
const LOG_LABEL={all:'Todos',pix:'PIX',refund:'Reembolsos',ticket:'Tickets',plan:'Planos',promo:'Promoções',coupon:'Cupons',client:'Clientes',theme:'Temas',admin:'Admins',system:'Sistema'};
const ui={
  range:30, pixTab:'all', refundTab:'all', ticketTab:'all', logTab:'all',
  clients:{q:'',sort:'nome',dir:1,page:1,seg:'all'}
};
let firstStats=true;
function toast(msg,type='gold',action){
  const el=document.createElement('div');
  el.className='toast '+type;
  el.innerHTML=`<span>✦</span><span>${esc(msg)}</span>`;
  if(action){ const b=document.createElement('button'); b.textContent=action.label; b.onclick=()=>{action.fn();dismiss()}; el.appendChild(b); }
  $('#toasts').appendChild(el);
  const dismiss=()=>{el.classList.add('out');setTimeout(()=>el.remove(),350)};
  setTimeout(dismiss,action?6500:3200);
}
let lastFocus=null;
function openModal(html,small=false){
  lastFocus=document.activeElement;
  const m=$('#modal'); m.className='modal'+(small?' sm':''); m.innerHTML=html;
  m.querySelectorAll('.field').forEach((field,index)=>{const label=field.querySelector('label'),input=field.querySelector('input,textarea,select');if(label&&input&&!label.contains(input)){input.id||='workspace-field-'+index;label.htmlFor=input.id;}});
  const heading=m.querySelector('h3');if(heading){heading.id='workspaceModalTitle';m.setAttribute('aria-labelledby',heading.id);}
  $('#overlay').classList.add('open'); $('#overlay').setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  setTimeout(()=>{ const f=m.querySelector('input:not([disabled]),textarea,select,button.btn.primary'); if(f&&!reducedMotion) f.focus({preventScroll:true}); },80);
}
function closeModal(){
  $('#overlay').classList.remove('open'); $('#overlay').setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  if(lastFocus&&lastFocus.focus) try{lastFocus.focus({preventScroll:true})}catch(e){}
}
function head(title,sub,ico){
  return `<div class="modal-head"><div class="m-ico">${ico}</div><div><h3>${title}</h3><p>${sub}</p></div><button type="button" class="close-x" data-command="closeModal()" aria-label="Fechar">✕</button></div>`;
}
function ask({title,text,ok='Confirmar',danger=false}){
  return new Promise(res=>{
    $('#cBox').innerHTML=`${head(esc(title),'Confirme para continuar',danger?'⚠️':'❔')}<div class="modal-body"><p class="confirm-text">${esc(text)}</p>
      <div class="form-actions" style="display:flex;margin-top:20px"><button class="btn ghost" id="cNo">Cancelar</button><button class="btn ${danger?'no':'primary'}" id="cYes">${esc(ok)}</button></div></div>`;
    $('#cBox .close-x').onclick=()=>done(false);
    const heading=$('#cBox h3');heading.id='workspaceConfirmTitle';$('#cBox').setAttribute('aria-labelledby',heading.id);
    const ov=$('#cOverlay'); ov.classList.add('open'); ov.setAttribute('aria-hidden','false');
    const done=v=>{ov.classList.remove('open');ov.setAttribute('aria-hidden','true');res(v)};
    $('#cNo').onclick=()=>done(false); $('#cYes').onclick=()=>done(true);
    ov._cancel=()=>done(false); setTimeout(()=>$('#cYes').focus(),60);
  });
}
function tabsHTML(fn,cur,opts){
  return opts.map(([k,l,n])=>`<button class="tab ${cur===k?'on':''}" data-command="${fn}('${k}')">${l}${n!=null?`<i>${n}</i>`:''}</button>`).join('');
}
function downloadCSV(name,rows){
  const cell=v=>{ let s=String(v??''); if(/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; };
  const csv='\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast(`${name} exportado`,'green');
}
const ICONS={
  wallet:'<path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13v4"/><path d="M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  cart:'<circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 7H6"/>',
  refund:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  chat:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>',
  receipt:'<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 2 2V2l-2 2-3-2-3 2-3-2-3 2Z"/><path d="M8 8h8M8 12h8"/>'
};
const svgIcon=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]||''}</svg>`;
const svgCheck=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const svgX=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
const svgEye=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const svgEdit=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const svgTrash=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>`;
const svgCopy=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`;
const svgSun=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const svgMoon=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`;
const mIco=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px">${p}</svg>`;
const TITLES={
  overview:['Visão geral','Resumo estratégico do seu negócio'],
  clients:['Clientes','Diretório completo da sua base'],
  plans:['Planos e descontos','Ofertas, promoções e cupons'],
  refunds:['Reembolso','Solicitações e análise'],
  support:['Atendimento','Central de tickets'],
  themes:['Configuração de Temas','Aparência do site'],
  activity:['Registro de atividades','Auditoria das ações do painel']
};
function nav(view){
  if(db.me.level==='support'&&!['clients','support'].includes(view))view='support';
  if(!TITLES[view]) view='overview';
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));
  $('#topTitle').textContent=TITLES[view][0]; $('#topSub').textContent=TITLES[view][1];
  $('#content').scrollTop=0;
  if(location.hash!=='#'+view) history.replaceState(null,'','#'+view);
}
function applyTheme(){
  const dark = db.settings.dark===null ? matchMedia('(prefers-color-scheme:dark)').matches : db.settings.dark;
  document.documentElement.dataset.theme = dark?'dark':'light';
  $('#btnTheme').innerHTML = dark?svgSun:svgMoon;
  $('#btnTheme').title = dark?'Modo claro':'Modo escuro';
  $('#btnTheme').setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');
}
function periodSum(from,to,kind){ return db.ledger.filter(l=>{if(!l.ts)return false;const t=+new Date(l.ts);return t>=from&&t<to&&(!kind||l.kind===kind)}); }
const pct=(a,b)=>b?((a-b)/b*100):0;
const pctLabel=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1).replace('.',',')+'%';
function renderStats(){
  const now=Date.now(), P=30*DAY;
  const cur=periodSum(now-P,now+1), prev=periodSum(now-2*P,now-P);
  const net=a=>a.reduce((s,l)=>s+(l.kind==='in'?l.value:-l.value),0);
  const buys=a=>a.filter(l=>l.kind==='in');
  const revCur=net(cur), revPrev=net(prev);
  const buyCur=buys(cur).length, buyPrev=buys(prev).length;
  const ticket=buyCur?buys(cur).reduce((s,l)=>s+l.value,0)/buyCur:0;
  const ticketPrev=buyPrev?buys(prev).reduce((s,l)=>s+l.value,0)/buyPrev:0;
  const refPend=db.refunds.filter(r=>r.status==='pendente');
  const openT=db.tickets.filter(t=>t.status!=='resolvido');
  const urgent=openT.filter(t=>t.prioridade==='alta').length;
  const cards=[
    {label:db.ledger.some(l=>!l.ts)?'Receita datada (30d)':'Receita líquida (30d)',to:revCur,fmt:'money',chip:pctLabel(pct(revCur,revPrev)),cls:revCur>=revPrev?'up':'down',foot:db.ledger.some(l=>!l.ts)?'Há estornos sem data no histórico':'vs. 30 dias anteriores',icon:'wallet'},
    {label:'Compras (30d)',to:buyCur,fmt:'int',chip:pctLabel(pct(buyCur,buyPrev)),cls:buyCur>=buyPrev?'up':'down',foot:'pedidos aprovados',icon:'cart'},
    {label:'Ticket médio',to:ticket,fmt:'money',chip:pctLabel(pct(ticket,ticketPrev)),cls:ticket>=ticketPrev?'up':'down',foot:'por compra',icon:'receipt'},
    {label:'Reembolso pendente',to:refPend.reduce((s,r)=>s+r.valor,0),fmt:'money',chip:`${refPend.length} pedido${refPend.length===1?'':'s'}`,cls:'gold',foot:'aguardando análise',icon:'refund'},
    {label:'Atendimento',to:openT.length,fmt:'int',chip:`${urgent} urgente${urgent===1?'':'s'}`,cls:urgent?'down':'up',foot:'tickets abertos',icon:'chat'}
  ];
  $('#statsGrid').innerHTML=cards.map((s,i)=>`
    <div class="card stat lift" style="animation-delay:${i*70}ms">
      <div class="stat-top"><div class="stat-ico">${svgIcon(s.icon)}</div><span class="chip ${s.cls}">${s.chip}</span></div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" data-to="${s.to}" data-fmt="${s.fmt}">${s.fmt==='money'?money(s.to):Math.round(s.to)}</div>
      <div class="stat-foot">${s.foot}</div>
    </div>`).join('');
  if(firstStats&&!reducedMotion){
    $$('.stat-value').forEach(el=>{
      const to=+el.dataset.to, f=el.dataset.fmt==='money'?money:v=>Math.round(v), t0=performance.now();
      const step=t=>{const p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);el.textContent=f(to*e);if(p<1)requestAnimationFrame(step)};
      requestAnimationFrame(step);
    });
  }
  firstStats=false;
}
function renderMovs(){
  const list=[...db.ledger].sort((a,b)=>new Date(b.ts)-new Date(a.ts)).slice(0,30);
  $('#movList').innerHTML=list.map(m=>`
    <div class="mov"><div class="mov-ico ${m.kind}">${m.kind==='in'?'↑':'↓'}</div>
      <div class="mov-body"><div class="mov-title">${esc(m.title)}</div><div class="mov-date">${esc(m.who||'')} · ${m.ts?fmtDT(m.ts):'Data não registrada'}</div></div>
      <div class="mov-val ${m.kind}">${m.kind==='in'?'+':'−'} ${money(m.value)}</div></div>`).join('')||'<div class="sempty">Nenhuma movimentação</div>';
}
function exportLedger(){
  downloadCSV('movimentacoes.csv',[['ID','Data','Tipo','Descrição','Cliente','Valor'],...db.ledger.map(l=>[l.id,l.ts?fmtDT(l.ts):'Data não registrada',l.kind==='in'?'Entrada':'Saída',l.title,l.who||'',(l.kind==='in'?l.value:-l.value).toFixed(2).replace('.',',')])]);
}
function setPixTab(k){ui.pixTab=k;renderPix()}
function renderPix(){
  const c=s=>db.pix.filter(p=>p.status===s).length;
  $('#pixTabs').innerHTML=tabsHTML('setPixTab',ui.pixTab,[['all','Todos'],['pendente','Pendentes',c('pendente')],['conferido','Conferidos'],['recusado','Recusados']]);
  const rows=db.pix.filter(p=>ui.pixTab==='all'||p.status===ui.pixTab);
  $('#pixBody').innerHTML=rows.map(p=>{
    const pend=p.status==='pendente';
    return `<tr><td class="mono"><b class="strong">${p.id}</b><div style="font-size:10px;color:var(--muted)">${rel(p.ts)}</div></td>
      <td>${esc(p.cliente)}<div style="font-size:10.5px;color:var(--muted)">${esc(planName(p.planoId))}</div></td>
      <td class="mono" style="color:var(--gold-5);font-weight:800">${money(p.valor)}</td>
      <td><span class="media-pill">📎 ${esc(p.comp)}</span></td>
      <td>${badge(p.status)}</td>
      <td><div class="act-row">
        <button class="act-btn ghost" title="Ver comprovante" aria-label="Ver comprovante" data-command="viewPix('${p.id}')">${svgEye}</button>
        <button class="act-btn ok" title="Confirmar PIX" aria-label="Confirmar PIX" ${pend?'':'disabled'} data-command="confirmPix('${p.id}')">${svgCheck}</button>
        <button class="act-btn no" title="Recusar PIX" aria-label="Recusar PIX" ${pend?'':'disabled'} data-command="rejectPix('${p.id}')">${svgX}</button>
      </div></td></tr>`;
  }).join('')||`<tr class="empty-row"><td colspan="6">Nenhum PIX nesta categoria</td></tr>`;
  const pend=c('pendente');
  $('#pixCount').textContent=pend+' pendente'+(pend===1?'':'s');
  $('#pixAllBtn').style.display=pend>1?'':'none';
}
function clientSeg(c){
  const isNew=Date.now()-new Date(c.desde+'T00:00:00')<30*DAY;
  return {novo:isNew,reembolso:c.reembolsos>0};
}
function setClientSeg(k){ui.clients.seg=k;ui.clients.page=1;renderClients()}
function sortClients(k){const u=ui.clients;if(u.sort===k)u.dir*=-1;else{u.sort=k;u.dir=1}renderClients()}
function setClientPage(n){ui.clients.page=n;renderClients()}
const PER_PAGE=6;
function renderClients(){
  const u=ui.clients, q=u.q.trim().toLowerCase();
  const cnt=k=>db.clients.filter(c=>k==='all'||clientSeg(c)[k]).length;
  $('#clientTabs').innerHTML=tabsHTML('setClientSeg',u.seg,[['all','Todos',cnt('all')],['novo','Novos',cnt('novo')],['reembolso','Com reembolso',cnt('reembolso')]]);
  let rows=db.clients.filter(c=>(u.seg==='all'||clientSeg(c)[u.seg])&&(!q||(c.nome+c.email+c.id).toLowerCase().includes(q)));
  rows.sort((a,b)=>{let x=a[u.sort],y=b[u.sort];if(typeof x==='string')return x.localeCompare(y,'pt-BR')*u.dir;return(x-y)*u.dir});
  const pages=Math.max(1,Math.ceil(rows.length/PER_PAGE)); if(u.page>pages)u.page=pages;
  const slice=rows.slice((u.page-1)*PER_PAGE,u.page*PER_PAGE);
  const th=(k,l)=>`<th class="sortable ${u.sort===k?'on':''}" data-command="sortClients('${k}')">${l}<span class="arr">${u.sort===k?(u.dir>0?'▲':'▼'):'↕'}</span></th>`;
  $('#clientsHead').innerHTML=`<tr>${th('nome','Cliente')}<th>E-mail</th>${th('desde','Cliente desde')}${th('compras','Compras')}${th('gasto','Total gasto')}${th('tickets','Tickets')}${th('reembolsos','Reembolsos')}<th>Ação</th></tr>`;
  $('#clientsBody').innerHTML=slice.map(c=>`<tr>
    <td><div class="cell-name"><div class="mini-av">${esc(initials(c.nome))}</div><div><b>${esc(c.nome)}</b><span>${c.id}</span></div></div></td>
    <td>${esc(c.email)}</td><td>${fmtD(c.desde+'T12:00:00')}</td><td class="mono">${c.compras}</td>
    <td class="mono" style="font-weight:800;color:var(--gold-5)">${money(c.gasto)}</td><td class="mono">${c.tickets}</td><td class="mono">${c.reembolsos}</td>
    <td><button class="btn ghost sm" data-command="openHistory('${c.id}')">Detalhes</button></td></tr>`).join('')||`<tr class="empty-row"><td colspan="8">Nenhum cliente encontrado</td></tr>`;
  $('#clientsPager').innerHTML=`<span>${rows.length} cliente${rows.length===1?'':'s'} · página ${u.page} de ${pages}</span>
    <div class="btns"><button class="btn ghost sm" ${u.page<=1?'disabled':''} data-command="setClientPage(${u.page-1})">‹ Anterior</button><button class="btn ghost sm" ${u.page>=pages?'disabled':''} data-command="setClientPage(${u.page+1})">Próxima ›</button></div>`;
}
function exportClients(){
  downloadCSV('clientes.csv',[['ID','Nome','E-mail','Cliente desde','Compras','Total gasto','Tickets','Reembolsos'],...db.clients.map(c=>[c.id,c.nome,c.email,c.desde,c.compras,c.gasto.toFixed(2).replace('.',','),c.tickets,c.reembolsos])]);
}
function renderHistory(id){
  const c=db.clients.find(x=>x.id===id); if(!c) return;
  const h=db.history[id]||{compras:[],atendimentos:[],reembolsos:[]};
  const list=(arr,ico)=>arr.length?arr.map(i=>`<div class="hist-item"><div class="hi-ico">${ico}</div><div><div>${esc(i.t)}</div>${i.v?`<div style="font-size:10.5px;color:var(--muted);font-weight:700">${esc(i.v)}</div>`:''}</div><div class="hi-date">${esc(i.d)}</div></div>`).join(''):`<div class="hist-item" style="opacity:.55"><div class="hi-ico">—</div><div>Nenhum registro</div></div>`;
  openModal(head('Histórico do cliente','Linha do tempo completa',mIco('<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>'))+`<div class="modal-body">
    <div class="hist-top"><div class="hist-av">${esc(initials(c.nome))}</div><div><div class="hist-name">${esc(c.nome)}</div><div class="hist-mail">${esc(c.email)} · ${c.id}</div></div></div>
    <div class="hist-grid"><div class="hist-stat"><div class="n">${h.compras.length}</div><div class="l">Compras</div></div><div class="hist-stat"><div class="n">${h.atendimentos.length}</div><div class="l">Atendimentos</div></div><div class="hist-stat"><div class="n">${h.reembolsos.length}</div><div class="l">Reembolsos</div></div></div>
    <div class="hist-h">Compras</div><div class="hist-list">${list(h.compras,'🛍')}</div>
    <div class="hist-h">Atendimentos</div><div class="hist-list">${list(h.atendimentos,'💬')}</div>
    <div class="hist-h">Reembolsos</div><div class="hist-list">${list(h.reembolsos,'↩')}</div>
    <div class="field" style="margin-top:4px"><label>Observações internas</label><textarea id="cliNota" rows="3" maxlength="500" placeholder="Anotações visíveis apenas para a equipe">${esc(c.nota||'')}</textarea></div>
    <div class="form-actions" style="display:flex;margin-top:14px"><button class="btn no" data-command="deleteClient('${id}')" style="margin-right:auto">Excluir cliente</button><button class="btn ghost" data-command="closeModal()">Fechar</button><button class="btn primary" data-command="saveClientNote('${id}')">Salvar observação</button></div></div>`);
}
function sales30(planId){return db.ledger.filter(l=>l.kind==='in'&&l.planId===planId&&+new Date(l.ts)>=Date.now()-30*DAY).length}
function renderPlans(){
  $('#plansList').innerHTML=db.plans.map((p,i)=>{
    const pr=activePromo(p.id);
    return `<div class="card plan-row lift ${p.destaque?'destaque':''} ${p.ativo?'':'inativo'}" style="animation-delay:${i*70}ms">
      <div class="plan-main">
        <div class="plan-title-row"><h4>${esc(p.nome)}</h4>${p.destaque?'<span class="tag star">★ Mais vendido</span>':''}${!p.ativo?'<span class="tag off">Inativo</span>':''}${pr?`<span class="tag promo">${esc(pr.nome)} · −${discLabel(pr)}</span>`:''}</div>
        <div class="plan-price-row"><div class="plan-price">${pr?`<s>${money(p.preco)}</s>${money(applyDisc(p.preco,pr))}`:money(p.preco)}</div><small>/ acesso · ${sales30(p.id)} venda${sales30(p.id)===1?'':'s'} em 30d</small></div>
        <div class="plan-desc">${esc(p.desc)}</div>
        <div class="plan-benefits-list">${p.beneficios.map(b=>`<span>${esc(b)}</span>`).join('')}</div>
      </div>
      <div class="plan-side">
        <div class="plan-media"><span class="media-pill">📷 ${p.fotos} fotos</span><span class="media-pill">🎬 ${p.videos} vídeos</span><span class="media-pill">🎵 ${p.musicas} músicas</span></div>
        <button class="btn blue sm" data-command="openPlanForm('${p.id}')">${svgEdit} Editar</button>
      </div></div>`;
  }).join('')||`<div class="card panel"><div class="sempty">Nenhum plano cadastrado. Clique em "Criar novo".</div></div>`;
}
function planExtrasHTML(p){
  return `<button type="button" class="btn ${p.destaque?'primary':'ghost'}" data-command="toggleDestaque('${p.id}')">${p.destaque?'★ Remover destaque':'☆ Destacar como mais vendido'}</button>
    <button type="button" class="btn ghost" data-command="togglePlanAtivo('${p.id}')">${p.ativo?'Desativar plano':'Ativar plano'}</button>
    <button type="button" class="btn ghost" data-command="duplicatePlan('${p.id}')">⧉ Duplicar</button>
    <button type="button" class="btn no" data-command="deletePlan('${p.id}')">Excluir plano</button>`;
}
function refreshPlanExtras(id){const p=planById(id),el=$('#planExtras');if(el&&p)el.innerHTML=planExtrasHTML(p)}
function renderPromos(){
  $('#promoBody').innerHTML=db.promos.map(p=>{
    const st=promoState(p);
    return `<tr><td><b class="strong">${esc(p.nome)}</b></td><td>${esc(planName(p.planoId))}</td><td><span class="chip gold">${discLabel(p)}</span></td>
      <td>${fmtDT(p.inicio)}</td><td>${fmtDT(p.fim)}</td>
      <td><span class="countdown" data-ini="${p.inicio}" data-fim="${p.fim}" data-st="${st}"></span></td><td>${badge(st)}</td>
      <td><div class="act-row">
        <button class="act-btn ${p.ativo?'ghost':'ok'}" title="${p.ativo?'Desativar':'Ativar'}" aria-label="${p.ativo?'Desativar':'Ativar'}" data-command="togglePromo('${p.id}')">${p.ativo?svgX:svgCheck}</button>
        <button class="act-btn ghost" title="Editar" aria-label="Editar" data-command="openPromoForm('${p.id}')">${svgEdit}</button>
        <button class="act-btn no" title="Excluir" aria-label="Excluir" data-command="deletePromo('${p.id}')">${svgTrash}</button></div></td></tr>`;
  }).join('')||`<tr class="empty-row"><td colspan="8">Nenhuma promoção cadastrada</td></tr>`;
  tickCountdowns();
}
function tickCountdowns(){
  $$('.countdown').forEach(el=>{
    const st=el.dataset.st;
    if(st==='inativa'){el.innerHTML='<span class="cd-lab">pausada</span>';return}
    if(st==='encerrada'){el.innerHTML='<span class="cd-box" style="background:var(--no-bg);color:var(--no)">ENCERRADA</span>';return}
    const target=new Date(st==='agendada'?el.dataset.ini:el.dataset.fim).getTime(), diff=target-Date.now();
    if(isNaN(target)){el.textContent='--';return}
    if(diff<=0){el.innerHTML='<span class="cd-lab">atualizando…</span>';return}
    const d=Math.floor(diff/DAY),h=Math.floor(diff%DAY/36e5),m=Math.floor(diff%36e5/6e4),s=Math.floor(diff%6e4/1e3),z=n=>String(n).padStart(2,'0');
    el.innerHTML=`<span class="cd-lab">${st==='agendada'?'inicia em':'termina em'}</span>${d>0?`<span class="cd-box">${d}d</span>`:''}<span class="cd-box">${z(h)}</span>:<span class="cd-box">${z(m)}</span>:<span class="cd-box">${z(s)}</span>`;
  });
}
function discountFields(d){
  return `<div class="field"><label>Tipo de desconto</label><select name="tipo"><option value="percent" ${d&&d.tipo==='percent'||!d?'selected':''}>Porcentagem (%)</option><option value="fixed" ${d&&d.tipo==='fixed'?'selected':''}>Valor fixo (R$)</option></select></div>
    <div class="field"><label>Valor do desconto</label><input name="valor" type="number" step="0.01" min="0.01" required value="${d?d.valor:''}" placeholder="Ex.: 20"></div>`;
}
function readDiscount(f){
  const tipo=f.tipo.value, valor=parseFloat(f.valor.value);
  if(!(valor>0)){toast('Informe um desconto maior que zero','red');return null}
  if(tipo==='percent'&&valor>100){toast('O desconto não pode passar de 100%','red');return null}
  return {tipo,valor};
}
function renderCoupons(){
  $('#couponBody').innerHTML=db.coupons.map(c=>{
    const st=couponState(c), pc=c.limite?Math.min(100,c.usos/c.limite*100):0;
    return `<tr><td><span class="media-pill codechip" title="Copiar código" data-command="copyCode('${esc(c.codigo)}')">${esc(c.codigo)} ${svgCopy.replace('<svg','<svg style="width:12px;height:12px"')}</span></td>
      <td>${esc(planName(c.planoId))}</td><td><span class="chip gold">${discLabel(c)}</span></td>
      <td>${c.inicio?fmtD(c.inicio):'Sem início'} → ${c.fim?fmtD(c.fim):'Sem fim'}</td>
      <td style="min-width:110px">${c.usos}${c.limite?` / ${c.limite}`:' · sem limite'}${c.limite?`<div class="bar" style="margin-top:5px"><i style="width:${pc}%"></i></div>`:''}</td>
      <td>${badge(st)}</td>
      <td><div class="act-row">
        <button class="act-btn ${c.ativo?'ghost':'ok'}" title="${c.ativo?'Desativar':'Ativar'}" aria-label="${c.ativo?'Desativar':'Ativar'}" data-command="toggleCoupon('${c.id}')">${c.ativo?svgX:svgCheck}</button>
        <button class="act-btn ghost" title="Editar" aria-label="Editar" data-command="openCouponForm('${c.id}')">${svgEdit}</button>
        <button class="act-btn no" title="Excluir" aria-label="Excluir" data-command="deleteCoupon('${c.id}')">${svgTrash}</button></div></td></tr>`;
  }).join('')||`<tr class="empty-row"><td colspan="7">Nenhum cupom cadastrado</td></tr>`;
}
function copyCode(code){
  (navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>toast(`Código ${code} copiado`,'green')).catch(()=>toast(`Código: ${code}`,'gold'));
}
function genCode(){const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='KOA';const a=new Uint32Array(4);crypto.getRandomValues(a);a.forEach(n=>s+=ch[n%ch.length]);return s}
function openCreateMenu(){
  openModal(head('O que você deseja criar?','Escolha o tipo de item para abrir o formulário','＋')+`<div class="modal-body"><div class="create-menu">
    <button class="create-opt" data-command="closeModal();openPlanForm()"><div class="co-ico">💎</div><div class="co-t">Novo plano</div><div class="co-d">Cadastre um plano com benefícios e mídia</div></button>
    <button class="create-opt" data-command="closeModal();openPromoForm()"><div class="co-ico">⏱</div><div class="co-t">Nova promoção</div><div class="co-d">Desconto com temporizador para um plano</div></button>
    <button class="create-opt" data-command="closeModal();openCouponForm()"><div class="co-ico">🎟</div><div class="co-t">Novo cupom</div><div class="co-d">Código promocional com limite de uso</div></button></div></div>`);
}
function setRefundTab(k){ui.refundTab=k;renderRefunds()}
function renderRefunds(){
  const c=s=>db.refunds.filter(r=>r.status===s).length;
  $('#refundTabs').innerHTML=tabsHTML('setRefundTab',ui.refundTab,[['all','Todos',db.refunds.length],['pendente','Pendentes',c('pendente')],['aprovado','Aprovados',c('aprovado')],['recusado','Recusados',c('recusado')]]);
  const rows=db.refunds.filter(r=>ui.refundTab==='all'||r.status===ui.refundTab).sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  $('#refundBody').innerHTML=rows.map(r=>{
    const pend=r.status==='pendente', late=pend&&Date.now()-new Date(r.ts)>(db.settings.refundDays||7)*DAY;
    return `<tr><td class="mono"><b class="strong">${esc(r.purchaseId||r.id)}</b></td><td>${esc(r.cliente)}</td><td>${fmtD(r.ts)}${late?'<div style="font-size:10px;color:var(--no);font-weight:800">+'+ (db.settings.refundDays||7) +' dias</div>':''}</td>
      <td class="mono" style="color:var(--gold-5);font-weight:800">${money(r.valor)}</td>
      <td style="max-width:240px">${esc(r.motivo)}${r.nota?`<div style="font-size:10.5px;color:var(--muted);margin-top:3px">📝 ${esc(r.nota)}</div>`:''}</td>
      <td>${badge(r.status)}</td>
      <td><div class="act-row">
        <button class="act-btn ok" title="Aprovar reembolso" aria-label="Aprovar reembolso" ${pend?'':'disabled'} data-command="openRefundDecision('${r.id}','aprovado')">${svgCheck}</button>
        <button class="act-btn no" title="Recusar reembolso" aria-label="Recusar reembolso" ${pend?'':'disabled'} data-command="openRefundDecision('${r.id}','recusado')">${svgX}</button></div></td></tr>`;
  }).join('')||`<tr class="empty-row"><td colspan="7">Nenhuma solicitação nesta categoria</td></tr>`;
}
function exportRefunds(){
  downloadCSV('reembolsos.csv',[['Pedido','Cliente','Data','Valor','Motivo','Status','Nota'],...db.refunds.map(r=>[r.id,r.cliente,fmtD(r.ts),r.valor.toFixed(2).replace('.',','),r.motivo,STATUS_LABEL[r.status],r.nota||''])]);
}
function setTicketTab(k){ui.ticketTab=k;renderTickets()}
function renderTickets(){
  const c=s=>db.tickets.filter(t=>t.status===s).length;
  $('#ticketTabs').innerHTML=tabsHTML('setTicketTab',ui.ticketTab,[['all','Todos',db.tickets.length],['aberto','Abertos',c('aberto')],['andamento','Em andamento',c('andamento')],['resolvido','Resolvidos',c('resolvido')]]);
  const order={alta:0,media:1,baixa:2};
  const rows=db.tickets.filter(t=>ui.ticketTab==='all'||t.status===ui.ticketTab).sort((a,b)=>(a.status==='resolvido')-(b.status==='resolvido')||order[a.prioridade]-order[b.prioridade]||new Date(b.ts)-new Date(a.ts));
  $('#ticketBody').innerHTML=rows.map(t=>`<tr><td class="mono"><b class="strong">${t.id}</b></td><td>${esc(t.cliente)}</td><td>${esc(t.assunto)}</td><td>${fmtDT(t.ts)}</td>
    <td>${badge(t.prioridade)}</td><td>${badge(t.status)}</td><td><button class="btn primary sm" data-command="openChat('${t.id}')">Abrir chat</button></td></tr>`).join('')||`<tr class="empty-row"><td colspan="7">Nenhum ticket nesta categoria</td></tr>`;
}
function msgHTML(m){return `<div class="msg ${m.who}">${esc(m.txt)}<small>${fmtT(m.ts)}</small></div>`}
function renderThemes(){
  $('#themeGrid').innerHTML=db.themes.map((t,i)=>`
    <div class="card theme-card lift" style="animation-delay:${i*70}ms">
      <div class="tp" style="background:${t.bg}"><div class="bar1" style="background:${t.grad}"></div><div class="row"><i style="background:${t.grad}"></i><i style="background:${t.grad};opacity:.5"></i></div><div class="ln" style="background:${t.grad}"></div></div>
      <div class="theme-info"><div><h4>${esc(t.nome)}</h4><p>${esc(t.desc)}</p></div>
        <label class="switch" title="${t.ativo?'Desativar':'Ativar'}"><input type="checkbox" ${t.ativo?'checked':''} data-theme="${t.id}" aria-label="Ativar tema ${esc(t.nome)}"><span class="slider"></span></label></div>
    </div>`).join('');
}
function setLogTab(k){ui.logTab=k;renderLogs()}
function renderLogs(){
  const types=['all',...new Set(db.logs.map(l=>l.type))];
  if(!types.includes(ui.logTab)) ui.logTab='all';
  $('#logTabs').innerHTML=tabsHTML('setLogTab',ui.logTab,types.map(k=>[k,LOG_LABEL[k]||cap(k)]));
  const rows=db.logs.filter(l=>ui.logTab==='all'||l.type===ui.logTab).slice(0,100);
  $('#logList').innerHTML=rows.map(l=>`<div class="tl-item"><div class="tl-ico">${LOG_ICON[l.type]||'•'}</div><div><div class="tl-t">${esc(l.title)}</div><div class="tl-d">${esc(l.desc)}${l.desc?' · ':''}por ${esc(l.by)}</div></div><div class="tl-time" title="${fmtDT(l.ts)}">${rel(l.ts)}</div></div>`).join('')||'<div class="sempty">Nenhuma atividade registrada</div>';
}
function exportLogs(){downloadCSV('atividades.csv',[['Data','Tipo','Ação','Detalhe','Responsável'],...db.logs.map(l=>[fmtDT(l.ts),LOG_LABEL[l.type]||l.type,l.title,l.desc,l.by])])}
function notifItems(){
  const items=[];
  (db.settings.notifPix?db.pix:[]).filter(p=>p.status==='pendente').forEach(p=>items.push({ico:'💰',t:'PIX aguardando conferência',d:`${p.cliente} enviou ${money(p.valor)}`,ts:p.ts,go:()=>nav('overview')}));
  (db.settings.notifRefund?db.refunds:[]).filter(r=>r.status==='pendente').forEach(r=>items.push({ico:'↩',t:'Reembolso pendente',d:`Pedido #${r.id} por ${r.cliente}`,ts:r.ts,go:()=>{ui.refundTab='pendente';renderRefunds();nav('refunds')}}));
  (db.settings.notifTicket?db.tickets:[]).filter(t=>t.status==='aberto'&&t.prioridade!=='baixa').forEach(t=>items.push({ico:'💬',t:`Ticket ${t.prioridade==='alta'?'urgente':'aberto'}`,d:`${t.id} · ${t.assunto}`,ts:t.ts,go:()=>nav('support')}));
  (db.settings.notifCoupon?db.coupons:[]).filter(c=>couponState(c)==='esgotado').forEach(c=>items.push({ico:'🎟',t:'Cupom esgotado',d:`${c.codigo} atingiu o limite de usos`,ts:new Date().toISOString(),go:()=>nav('plans')}));
  return items.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
}
function renderNotifs(){
  const items=notifItems(); window._notifs=items;
  $('#notifList').innerHTML=items.map((n,i)=>`<button class="dd-item" data-command="goNotif(${i})"><div class="dd-ico">${n.ico}</div><div><div class="dd-title">${esc(n.t)}</div><div class="dd-desc">${esc(n.d)}</div><div class="dd-time">${rel(n.ts)}</div></div></button>`).join('')||'<div class="sempty">Tudo em dia ✨</div>';
  $('#notifDot').style.display=(items.length&&db.settings.notifSeen!==notifSig())?'':'none';
}
function goNotif(i){$('#ddNotif').classList.remove('active');window._notifs[i].go()}
let sSel=-1, sList=[];
function runSearch(q){
  q=q.trim().toLowerCase(); const box=$('#sResults');
  if(q.length<2){box.classList.remove('show');return}
  const has=(...a)=>a.join(' ').toLowerCase().includes(q), groups=[];
  const add=(title,items)=>{if(items.length)groups.push([title,items.slice(0,4)])};
  add('Clientes',db.clients.filter(c=>has(c.nome,c.email,c.id)).map(c=>({t:c.nome,s:`${c.email} · ${c.id}`,go:()=>{nav('clients');openHistory(c.id)}})));
  add('Planos',db.plans.filter(p=>has(p.nome,p.desc)).map(p=>({t:p.nome,s:money(p.preco),go:()=>{nav('plans');openPlanForm(p.id)}})));
  add('Cupons',db.coupons.filter(c=>has(c.codigo)).map(c=>({t:c.codigo,s:`${discLabel(c)} · ${STATUS_LABEL[couponState(c)]}`,go:()=>{nav('plans');openCouponForm(c.id)}})));
  add('Reembolsos',db.refunds.filter(r=>has(r.id,r.purchaseId,r.cliente,r.motivo)).map(r=>({t:`${r.id} · ${r.cliente}`,s:`${money(r.valor)} · ${STATUS_LABEL[r.status]}`,go:()=>{ui.refundTab='all';renderRefunds();nav('refunds')}})));
  add('Tickets',db.tickets.filter(t=>has(t.id,t.cliente,t.assunto)).map(t=>({t:`${t.id} · ${t.assunto}`,s:`${t.cliente} · ${STATUS_LABEL[t.status]}`,go:()=>{nav('support');openChat(t.id)}})));
  add('PIX',db.pix.filter(p=>has(p.id,p.cliente)).map(p=>({t:`${p.id} · ${p.cliente}`,s:`${money(p.valor)} · ${STATUS_LABEL[p.status]}`,go:()=>{ui.pixTab='all';renderPix();nav('overview')}})));
  add('Pedidos',(db.orders||[]).filter(p=>has(p.id,p.title,p.cliente)).map(p=>({t:p.id+' · '+p.title,s:p.cliente+' · '+money(p.amount_cents/100),go:()=>{nav('overview');viewOrder(p.id);}})));
  sList=groups.flatMap(g=>g[1]); sSel=-1; let n=0;
  box.innerHTML=groups.map(([t,items])=>`<div class="sgroup">${t}</div>`+items.map(it=>`<button class="sitem" data-i="${n++}"><div><b>${esc(it.t)}</b><span>${esc(it.s)}</span></div></button>`).join('')).join('')||'<div class="sempty">Nenhum resultado encontrado</div>';
  box.classList.add('show');
  $$('.sitem',box).forEach(b=>b.onclick=()=>pickSearch(+b.dataset.i));
}
function pickSearch(i){const it=sList[i];if(!it)return;$('#sResults').classList.remove('show');$('#gSearch').value='';it.go()}
function renderBanner(){$('#maintBanner').classList.toggle('show',!!db.settings.maintenance)}
function renderBadges(){
  const set=(id,n)=>{const b=$(id);b.textContent=n;b.style.display=n?'':'none'};
  set('#badgeRefund',db.refunds.filter(r=>r.status==='pendente').length);
  set('#badgeTickets',db.tickets.filter(t=>t.status==='aberto').length);
  set('#badgePix',db.pix.filter(p=>p.status==='pendente').length);
}
function renderAll(){
  renderStats();renderMovs();renderPix();renderClients();renderPlans();renderPromos();renderCoupons();
  renderRefunds();renderTickets();renderThemes();renderLogs();renderNotifs();renderBadges();renderBanner();renderUser();
}
function labelTables(){
  $$('[data-command]:not(button)').forEach(el=>{el.setAttribute('role','button');el.tabIndex=0;});
  $$('.table-wrap table').forEach(t=>{
    const hs=[...t.querySelectorAll('thead th')].map(h=>h.textContent.replace(/[▲▼↕]/g,'').trim());
    t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{ if(!td.hasAttribute('colspan')) td.setAttribute('data-label',hs[i]||''); }));
  });
}
function openPlanForm(id){
  const p=id?planById(id):null;
  const v=(k,d='')=>p?esc(p[k]):d;
  const limitAxis=kind=>{const min=db.limits?.min?.[kind],max=db.limits?.max?.[kind];return (Number.isFinite(min)?` min="${min}"`:'')+(Number.isFinite(max)?` max="${max}"`:'');};
  const limitDefault=(key,fallback)=>Number.isFinite(db.limits?.defaults?.[key])?db.limits.defaults[key]:fallback;
  openModal(head(p?`Editar plano · ${esc(p.nome)}`:'Criar novo plano',p?'Gerencie detalhes, mídia e status':'Preencha as informações do plano',mIco('<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.2"/>'))+`<div class="modal-body">
    <form class="form" id="formPlano">
      <div class="field"><label>Nome do plano</label><input name="nome" required maxlength="40" value="${v('nome')}" placeholder="Ex.: Premium"></div>
      <div class="field"><label>Preço (R$)</label><input name="preco" type="number" step="0.01" min="0.01" required value="${p?p.preco:''}" placeholder="1290.00"></div>
      <div class="field full"><label>Descrição</label><textarea name="descricao" rows="2" maxlength="200">${v('desc')}</textarea></div>
      <div class="field full"><label>Benefícios (um por linha)</label><textarea name="beneficios" rows="4" placeholder="Acesso ilimitado&#10;4 dispositivos&#10;Suporte 24/7">${p?esc(p.beneficios.join('\n')):''}</textarea></div>
      <div class="field"><label>Quantidade de fotos</label><input type="number"${limitAxis('photos')} name="fotos" value="${p?p.fotos:limitDefault('photos_limit',2)}"></div>
      <div class="field"><label>Quantidade de vídeos</label><input type="number"${limitAxis('videos')} name="videos" value="${p?p.videos:limitDefault('videos_limit',0)}"></div>
      <div class="field"><label>Quantidade de músicas</label><input type="number"${limitAxis('music')} name="musicas" value="${p?p.musicas:limitDefault('music_limit',0)}"></div>
      ${p?`<div class="field"><label>Status atual</label><input value="${p.ativo?'Ativo':'Inativo'}" disabled></div>`:
        `<div class="field"><label>Status</label><select name="ativo"><option value="1">Ativo</option><option value="0">Inativo</option></select></div>
         <label class="check-row"><input type="checkbox" name="destaque"> Marcar como plano mais vendido (destaque)</label>`}
      <div class="form-actions"><button type="button" class="btn ghost" data-command="closeModal()">Cancelar</button><button type="submit" class="btn primary">${p?'Salvar alterações':'Criar plano'}</button></div>
    </form>${p?`<div class="plan-extras" id="planExtras">${planExtrasHTML(p)}</div>`:''}</div>`);
bindPlanForm(id);
}
function openPromoForm(id){
  const p=id?db.promos.find(x=>x.id===id):null;
  if(!db.plans.length) return toast('Crie um plano antes de criar uma promoção','red');
  const now=Date.now();
  openModal(head(p?'Editar promoção':'Criar nova promoção','Configure desconto e temporizador','⏱')+`<div class="modal-body"><form class="form" id="formPromo">
    <div class="field full"><label>Nome da promoção</label><input name="nome" required maxlength="50" value="${p?esc(p.nome):''}" placeholder="Ex.: Semana Dourada"></div>
    <div class="field full"><label>Plano participante</label><select name="plano" required><option value="all" ${!p||p.planoId==='all'?'selected':''}>Todos os planos</option>${db.plans.map(x=>`<option value="${x.id}" ${p&&p.planoId===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></div>
    ${discountFields(p)}
    <div class="field"><label>Início</label><input name="inicio" type="datetime-local" required value="${p&&p.inicio?toLocalInput(new Date(p.inicio)):toLocalInput(now)}"></div>
    <div class="field"><label>Fim</label><input name="fim" type="datetime-local" required value="${p&&p.fim?toLocalInput(new Date(p.fim)):toLocalInput(now+7*DAY)}"></div>
    <div class="form-actions"><button type="button" class="btn ghost" data-command="closeModal()">Cancelar</button><button type="submit" class="btn primary">${p?'Salvar alterações':'Criar promoção'}</button></div></form></div>`);
bindOfferForm("promotions",id);
}
function openCouponForm(id){
  const c=id?db.coupons.find(x=>x.id===id):null, now=Date.now();
  openModal(head(c?'Editar cupom':'Criar novo cupom','Defina código, plano, validade e limite','🎟')+`<div class="modal-body"><form class="form" id="formCupom">
    <div class="field full"><label>Código do cupom</label><div class="inline"><input name="codigo" required maxlength="20" value="${c?esc(c.codigo):''}" placeholder="Ex.: KOA20" style="text-transform:uppercase"><button type="button" class="btn ghost" data-command="generateCoupon()">Gerar</button></div><span class="hint">Use letras, números, hífen ou underline (3 a 20 caracteres).</span></div>
    ${discountFields(c)}
    <div class="field"><label>Plano aplicável</label><select name="plano"><option value="all" ${!c||c.planoId==='all'?'selected':''}>Todos os planos</option>${db.plans.map(x=>`<option value="${x.id}" ${c&&c.planoId===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></div>
    <div class="field"><label>Limite de usos</label><input name="limite" type="number" min="0" value="${c?c.limite:0}"><span class="hint">0 = ilimitado</span></div>
    <div class="field"><label>Início</label><input name="inicio" type="date" required value="${c&&c.inicio?toDateInput(new Date(c.inicio)):toDateInput(now)}"></div>
    <div class="field"><label>Fim</label><input name="fim" type="date" required value="${c&&c.fim?toDateInput(new Date(c.fim)):toDateInput(now+30*DAY)}"></div>
    <div class="form-actions"><button type="button" class="btn ghost" data-command="closeModal()">Cancelar</button><button type="submit" class="btn primary">${c?'Salvar alterações':'Criar cupom'}</button></div></form></div>`);
bindOfferForm("coupons",id);
}
function openChat(id){
  const t=db.tickets.find(x=>x.id===id); if(!t) return;
  openModal(head(`Chat · ${t.id}`,`${esc(t.cliente)} · ${fmtDT(t.ts)}`,mIco('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>'))+`<div class="modal-body">
    <div class="chat-problem"><div class="cp-ico">!</div><div><div class="cp-label">Problema relatado</div><div class="cp-text">${esc(t.assunto)}</div></div>
      <div class="cp-ctrl"><select id="tkPrio" aria-label="Prioridade"><option value="baixa">Prioridade baixa</option><option value="media">Prioridade média</option><option value="alta">Prioridade alta</option></select>
      <select id="tkStatus" aria-label="Status"><option value="aberto">Aberto</option><option value="andamento">Em andamento</option><option value="resolvido">Resolvido</option></select></div></div>
    <div class="chat"><div class="chat-msgs" id="chatMsgs">${t.msgs.map(msgHTML).join('')||'<div class="sempty">Nenhuma mensagem ainda. Envie a primeira resposta.</div>'}</div>
      <div class="chat-input"><input id="chatInput" placeholder="Escreva uma resposta…" maxlength="500" aria-label="Mensagem">
        <button type="button" id="chatSend" aria-label="Enviar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button></div></div></div>`);
bindChat(id);
}
function openSettings(){
  const s=db.settings;
  const sw=(k,t,d)=>`<div class="setting-item"><div class="setting-info"><h5>${t}</h5><p>${d}</p></div><label class="switch"><input type="checkbox" ${s[k]?'checked':''} data-setting="${k}" aria-label="${t}"><span class="slider"></span></label></div>`;
  const opt=(v,l,cur)=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${l}</option>`;
  const mode=s.dark===null?'auto':(s.dark?'dark':'light');

  openModal(head('Configurações do sistema','Loja, pagamentos, atendimento, segurança e dados',mIco('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'))+`<div class="modal-body">
    <div class="settings-section"><h4>Loja</h4><div class="form">
      <div class="field"><label>Nome da loja</label><input value="${esc(s.storeName)}" maxlength="40" data-setting="storeName"></div>
      <div class="field"><label>E-mail de suporte</label><input type="email" value="${esc(s.supportEmail)}" maxlength="120" data-setting="supportEmail"></div>
      <div class="field"><label>WhatsApp / telefone</label><input type="tel" value="${esc(s.whatsapp)}" maxlength="20" placeholder="(21) 90000-0000" data-setting="whatsapp"></div>
      <div class="field"><label>Aparência do painel</label><select data-appearance="true">${opt('auto','Automático (sistema)',mode)}${opt('light','Claro',mode)}${opt('dark','Escuro',mode)}</select></div>
    </div></div>

    <div class="settings-section"><h4>Pagamentos e reembolsos</h4><div class="form">
      <div class="field full"><label>Chave PIX da loja</label><input value="${esc(s.pixKey)}" maxlength="80" placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória" data-setting="pixKey"></div>
      <div class="field"><label>Alerta de análise pendente (dias)</label><input type="number" min="1" max="90" value="${s.refundDays}" data-setting="refundDays"><span class="hint">Alerta operacional. A garantia comercial continua em 72 horas, sem abertura do link; direitos legais são analisados separadamente.</span></div>
    </div></div>

    <div class="settings-section"><h4>Notificações</h4><div class="settings-list">
      ${sw('emailNotif','Alertas por e-mail','Receber resumo de pendências por e-mail')}
      ${sw('notifPix','PIX pendentes','Avisar no sino quando houver PIX para conferir')}
      ${sw('notifRefund','Reembolsos pendentes','Avisar sobre novas solicitações de reembolso')}
      ${sw('notifTicket','Tickets de prioridade média/alta','Avisar sobre atendimentos que precisam de atenção')}
      ${sw('notifCoupon','Cupons esgotados','Avisar quando um cupom atingir o limite de usos')}
    </div></div>

    <div class="settings-section"><h4>Segurança e sistema</h4><div class="form">
      <div class="field"><label>Encerrar sessão por inatividade</label><select data-setting="idleMin">${opt(15,'15 minutos',s.idleMin)}${opt(30,'30 minutos',s.idleMin)}${opt(60,'1 hora',s.idleMin)}${opt(120,'2 horas',s.idleMin)}</select></div>
    </div><div class="settings-list" style="margin-top:12px">
      ${sw('maintenance','Modo de manutenção','Bloquear o acesso de clientes temporariamente')}
    </div></div>

    <div class="settings-section"><h4>Administradores</h4><div id="adminList"></div>
      <form class="admin-invite" id="inviteForm"><input type="email" id="newAdminEmail" placeholder="E-mail do novo administrador" required aria-label="E-mail do novo administrador">
        <select id="newAdminRole" aria-label="Função"><option>Gerente</option><option>Suporte</option><option>Super Admin</option></select><button class="btn primary" type="submit">Convidar</button></form></div>
    </div>`);

bindSettings();
}

/* Operações reais. Alterações de domínio são confirmadas pela API antes de atualizar a tela. */
const defaults={dark:null,notifSeen:'',idleMin:30,notifPix:true,notifRefund:true,notifTicket:true,notifCoupon:true};
const currentUser=()=>db.me;
const notifSig=()=>{const text=notifItems().map(i=>i.t+i.d).join('|');let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return String(h>>>0);};
let activeChat=null,lastActivity=Date.now(),logoutTimer;
function normalizeWorkspace(){db.settings={...defaults,...db.settings};db.themes=db.themes.map((t,i)=>({...t,bg:['#fbf1dc','#fae9ef','#eef1fa'][i%3],grad:['linear-gradient(135deg,#efcf6b,#b8912a)','linear-gradient(135deg,#eea4b9,#823b55)','linear-gradient(135deg,#b2b9e0,#465789)'][i%3],desc:'Tema '+t.nome}));}
let workspaceQueue=Promise.resolve();
function reloadWorkspace(){
  const work=workspaceQueue.catch(()=>{}).then(async()=>{
    db=await ApiClient.get('/admin/workspace');normalizeWorkspace();renderAll();renderUser();renderBanner();applyTheme();labelTables();
  });
  workspaceQueue=work;return work;
}
async function mutate(path,data={},message='Alteração salva.'){await ApiClient.post(path,data);await reloadWorkspace();toast(message,'green');}
function modalError(error){let el=$('#modal .modal-error');if(!el){el=document.createElement('p');el.className='modal-error';el.setAttribute('role','alert');$('#modal .modal-body')?.prepend(el);}el.textContent=error.message||'Não foi possível concluir. Tente novamente.';}
function submitForm(selector,handler){const form=$(selector);form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;try{await handler(form);closeModal();}catch(error){modalError(error);}finally{button.disabled=false;}});}
const val=(form,name)=>form.elements.namedItem(name)?.value;
const cents=value=>{const n=Number(String(value).replace(',','.'));if(!Number.isFinite(n))throw Error('Informe um valor válido.');return Math.round(n*100);};
function planPayload(p){return {name:p.nome,description:p.desc,price_cents:cents(p.preco),features:p.beneficios,photos_limit:Number(p.fotos),videos_limit:Number(p.videos),music_limit:Number(p.musicas),active:p.ativo,featured:p.destaque,sort_order:p.sort_order||0};}
function bindPlanForm(id){submitForm('#formPlano',async f=>{const p=id?planById(id):null;const data={...(p||{}),nome:val(f,'nome').trim(),preco:val(f,'preco'),desc:val(f,'descricao').trim(),beneficios:val(f,'beneficios').split('\n').map(s=>s.trim()).filter(Boolean),fotos:val(f,'fotos'),videos:val(f,'videos'),musicas:val(f,'musicas'),ativo:p?p.ativo:val(f,'ativo')==='1',destaque:p?p.destaque:f.elements.namedItem('destaque').checked};await mutate('/admin/plans'+(id?'/'+id:''),planPayload(data));});}
async function toggleDestaque(id){const p=planById(id);await mutate('/admin/plans/'+id,planPayload({...p,destaque:!p.destaque}));refreshPlanExtras(id);}
async function togglePlanAtivo(id){const p=planById(id);await mutate('/admin/plans/'+id,planPayload({...p,ativo:!p.ativo}));refreshPlanExtras(id);}
async function duplicatePlan(id){const p=planById(id);await mutate('/admin/plans',planPayload({...p,nome:(p.nome+' (cópia)').slice(0,60),ativo:false,destaque:false}),'Cópia criada como inativa.');}
async function removeCatalog(kind,id,label){if(!await ask({title:'Excluir '+label+'?',text:'O item sairá da gestão e de novas vendas. Pedidos e condições já combinadas serão preservados.',ok:'Excluir',danger:true}))return;await mutate('/admin/catalog/'+kind+'/'+id+'/delete');closeModal();}
const deletePlan=id=>removeCatalog('plans',id,'plano');
const deletePromo=id=>removeCatalog('promotions',id,'promoção');
const deleteCoupon=id=>removeCatalog('coupons',id,'cupom');
function offerPayload(p,kind){return {plan_id:p.planoId==='all'?null:p.planoId,active:p.ativo,discount_percent:p.tipo==='fixed'?null:Number(p.valor),discount_cents:p.tipo==='fixed'?cents(p.valor):null,starts_at:p.inicio?new Date(p.inicio).toISOString():null,ends_at:p.fim?new Date(p.fim).toISOString():null,...(kind==='coupons'?{code:p.codigo,usage_limit:Number(p.limite)||null}:{name:p.nome})};}
function bindOfferForm(kind,id){const coupon=kind==='coupons',record=(coupon?db.coupons:db.promos).find(p=>p.id===id);submitForm(coupon?'#formCupom':'#formPromo',async f=>{const start=val(f,'inicio'),end=val(f,'fim');const data={...(record||{}),nome:val(f,'nome'),codigo:val(f,'codigo')?.trim().toUpperCase(),planoId:val(f,'plano'),tipo:val(f,'tipo'),valor:val(f,'valor'),inicio:start,fim:coupon?end+'T23:59:59':end,limite:val(f,'limite'),ativo:record?record.ativo:true};await mutate('/admin/pricing/'+kind+(id?'/'+id:''),offerPayload(data,kind));});}
async function togglePromo(id){const p=db.promos.find(x=>x.id===id);await mutate('/admin/pricing/promotions/'+id,offerPayload({...p,ativo:!p.ativo},'promotions'));}
async function toggleCoupon(id){const p=db.coupons.find(x=>x.id===id);await mutate('/admin/pricing/coupons/'+id,offerPayload({...p,ativo:!p.ativo},'coupons'));}
function generateCoupon(){const input=$('#formCupom [name=codigo]');if(input)input.value=genCode();}
async function openHistory(id){const detail=await ApiClient.get('/admin/clients/'+id);db.history[id]={compras:detail.purchases.map(p=>({t:p.content?.titulo||p.titulo||p.id,d:fmtD(p.paid_at||p.created_at),v:money((p.amount_paid_cents||p.valor_cents||p.price_cents||0)/100)})),atendimentos:detail.tickets.map(t=>({t:t.subject,d:fmtD(t.created_at)})),reembolsos:detail.refunds.map(r=>({t:r.reason+' · '+r.status,d:fmtD(r.created_at)}))};renderHistory(id);}
async function saveClientNote(id){await mutate('/admin/clients/'+id+'/note',{note:$('#cliNota').value.trim()},'Observação salva.');}
async function deleteClient(id){if(!await ask({title:'Desativar cliente?',text:'O acesso e os links serão revogados. Os dados seguirão a rotina de eliminação em até 30 dias. Esta ação não estorna pagamentos.',ok:'Desativar',danger:true}))return;await mutate('/admin/clients/'+id+'/delete',{confirmed:true});closeModal();}
function pixReview(ids){const selected=db.pix.filter(p=>ids.includes(p.id)&&p.status==='pendente');if(!selected.length)return;openModal(head(selected.length>1?'Conferir todos os Pix':'Conferir Pix','Informe o identificador de cada crédito recebido no banco.','💰')+`<div class="modal-body"><p>Um comprovante sozinho não confirma o recebimento. Confira valor, pagador e pedido no seu extrato.</p><form id="pixReviewForm">${selected.map((p,i)=>`<div class="batch-pix-row"><label for="pixReference${i}">${esc(p.cliente)} · ${money(p.valor)}<br><small>${esc(p.id)}</small></label><input id="pixReference${i}" name="ref${i}" required pattern="[A-Za-z0-9-]{8,64}" maxlength="64" aria-label="Identificador bancário ${esc(p.id)}" placeholder="ID da transação recebida"></div>`).join('')}<label class="check-row"><input type="checkbox" name="received" required> Conferi cada crédito no banco e os valores correspondem aos pedidos.</label><div class="form-actions"><button class="btn ghost" type="button" data-command="closeModal()">Cancelar</button><button class="btn ok" type="submit">Confirmar recebimentos</button></div></form></div>`);submitForm('#pixReviewForm',async f=>{const references=selected.map((p,i)=>val(f,'ref'+i).trim().toUpperCase());if(new Set(references).size!==references.length)throw Error('Use um identificador bancário diferente para cada pedido.');const done=[];try{for(let i=0;i<selected.length;i++){await ApiClient.post('/admin/purchases/'+selected[i].id+'/confirm-pix',{amount_cents:cents(selected[i].valor),bank_reference:references[i],received:true});done.push(selected[i].id);}}catch(error){await reloadWorkspace();throw Error(done.length+' confirmado(s). '+error.message+' Reabra a conferência para continuar os demais.');}await reloadWorkspace();toast(done.length+' pagamento(s) confirmado(s).','green');});}
function confirmPix(id){pixReview([id]);}
function confirmAllPix(){pixReview(db.pix.filter(p=>p.status==='pendente').map(p=>p.id));}
async function rejectPix(id){openModal(head('Recusar Pix','A recusa não executa transferência nem estorno.','!')+`<div class="modal-body"><form id="rejectPixForm"><div class="field"><label>Motivo<textarea name="reason" required minlength="5" maxlength="300"></textarea></label></div><div class="form-actions"><button class="btn no" type="submit">Registrar recusa</button></div></form></div>`,true);submitForm('#rejectPixForm',f=>mutate('/admin/purchases/'+id+'/reject-pix',{reason:val(f,'reason')}));}
function viewOrder(id){const p=db.orders.find(p=>p.id===id);if(!p)return;openModal(head('Detalhes do pedido',esc(p.id),'🛍')+`<div class="modal-body"><p>${esc(p.title)} · ${esc(p.cliente)}</p><p>${money(p.amount_cents/100)} · ${esc(p.method||'Sem pagamento confirmado')}</p><p>Status: ${esc({paid:'Pago',pending:'Pendente',refunded:'Reembolsado'}[p.status]||p.status)}</p><p>Criado em ${fmtDT(p.created_at)}</p></div>`,true);}
function viewPix(id){const p=db.pix.find(x=>x.id===id);openModal(head('Dados do Pix',esc(p.id),'💰')+`<div class="modal-body"><p>${esc(p.cliente)} · ${money(p.valor)}</p><p>Referência do pedido: ${esc(p.txid||'Não informada')}</p><p>Identificador bancário conferido: ${esc(p.reference||'Ainda não conferido')}</p><p>O fluxo atual não coleta comprovantes enviados pelo cliente. Confira o recebimento no banco antes de aprovar.</p></div>`,true);}
function openRefundDecision(id,status){const r=db.refunds.find(x=>x.id===id),approved=status==='aprovado';openModal(head(approved?'Concluir aprovação':'Recusar solicitação',esc(r.purchaseId)+' · '+money(r.valor),'↩')+`<div class="modal-body"><p>${esc(r.motivo)}</p><p>${r.provider==='mercadopago'?'Para aprovar, faça o estorno no Mercado Pago e aguarde sua confirmação pelo webhook.':r.provider==='pix_manual'?'Devolva o valor pelo seu banco antes de aprovar.':'A decisão será registrada no pedido.'}</p><p>A garantia comercial é de 72 horas sem abertura pública do link. A análise de direitos legais é independente.</p><form id="refundDecisionForm"><div class="field"><label>Nota da decisão<textarea name="note" maxlength="500" ${approved?'':'required'}></textarea></label></div>${approved&&r.provider==='pix_manual'?'<label class="check-row"><input name="sent" type="checkbox" required> Já devolvi integralmente o Pix pelo banco.</label>':''}<div class="form-actions"><button class="btn ${approved?'ok':'no'}" type="submit">${approved?'Registrar aprovação':'Registrar recusa'}</button></div></form></div>`,true);submitForm('#refundDecisionForm',f=>mutate('/admin/refunds/'+id+'/decision',{status:approved?'approved':'rejected',note:val(f,'note').trim(),refund_sent:!!f.elements.namedItem('sent')?.checked}));}
function bindChat(id){activeChat=id;const t=db.tickets.find(x=>x.id===id);$('#tkPrio').value=t.prioridade;$('#tkStatus').value=t.status;$('#tkPrio').addEventListener('change',async e=>{try{await mutate('/admin/tickets/'+id+'/manage',{priority:{alta:'high',media:'normal',baixa:'low'}[e.target.value]});}catch(error){modalError(error);e.target.value=t.prioridade;}});$('#tkStatus').addEventListener('change',async e=>{try{await mutate('/admin/tickets/'+id+'/manage',{status:{aberto:'open',andamento:'answered',resolvido:'closed'}[e.target.value]});}catch(error){modalError(error);e.target.value=t.status;}});$('#chatSend').addEventListener('click',()=>sendMsg(id));$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sendMsg(id);}});const box=$('#chatMsgs');box.scrollTop=box.scrollHeight;}
async function sendMsg(id){const input=$('#chatInput'),button=$('#chatSend');if(!input||!input.value.trim()||button.disabled)return;button.disabled=true;try{await ApiClient.post('/admin/tickets/'+id+'/reply',{text:input.value.trim()});input.value='';await reloadWorkspace();const t=db.tickets.find(t=>t.id===id);$('#chatMsgs').innerHTML=t.msgs.map(msgHTML).join('');$('#tkStatus').value=t.status;$('#chatMsgs').scrollTop=$('#chatMsgs').scrollHeight;}catch(error){modalError(error);}finally{button.disabled=false;}}
async function toggleTheme(id,on){try{await mutate('/admin/themes/'+id,{active:on});}catch(error){renderThemes();throw error;}}
async function clearLogs(){if(!await ask({title:'Limpar registro do painel?',text:'As atividades sairão desta listagem. A auditoria técnica de segurança mantém sua retenção de 30 dias.',ok:'Limpar',danger:true}))return;await mutate('/admin/activities/clear',{confirmed:true});}
async function setSetting(k,v){await mutate('/admin/settings',{[k]:v});resetIdle();}
async function setField(k,v){if(['refundDays','idleMin'].includes(k))v=Number(v);await setSetting(k,v);}
async function setThemeMode(mode){await setSetting('dark',mode==='auto'?null:mode==='dark');}
async function markNotifRead(){await setSetting('notifSeen',notifSig());}
function renderUser(){$('#uName').textContent=db.me.nome;$('#uRole').textContent=db.me.role;document.title=(db.settings.storeName||'KoaLove')+' · Painel administrativo';}
function renderAdminList(){const list=$('#adminList');if(!list)return;list.innerHTML=db.admins.map(a=>`<div class="admin-row"><div class="mini-av">${esc(initials(a.nome))}</div><div class="a-info"><b>${esc(a.nome)}${a.id===db.me.id?' (você)':''}</b><span>${esc(a.email)} · ${esc(a.role)}</span></div>${a.id!==db.me.id?`<button class="act-btn no" aria-label="Remover administrador ${esc(a.nome)}" data-command="removeAdmin('${a.id}')">${svgX}</button>`:''}</div>`).join('')+(db.invitations||[]).map(i=>`<div class="admin-row"><div class="a-info"><b>Convite pendente</b><span>${esc(i.email)} · vence ${fmtD(i.expires_at)}</span></div><button class="act-btn no" aria-label="Revogar convite ${esc(i.email)}" data-command="revokeInvitation('${i.id}')">${svgX}</button></div>`).join('');}
function bindSettings(){renderAdminList();$$('#inviteForm').addEventListener('submit',async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{await mutate('/admin/administrators/invite',{email:$('#newAdminEmail').value.trim(),level:{Gerente:'manager',Suporte:'support','Super Admin':'owner'}[$('#newAdminRole').value]},'Convite enviado. O destinatário deverá aceitar com a própria conta.');$('#newAdminEmail').value='';renderAdminList();}catch(error){modalError(error);}finally{button.disabled=false;}});if(db.me.level!=='owner'){$$('.settings-section').forEach(section=>{if(section.querySelector('#adminList')||section.querySelector('[data-setting=pixKey]'))section.hidden=true;});$$('[data-setting=storeName],[data-setting=supportEmail],[data-setting=whatsapp],[data-setting=maintenance],[data-setting=emailNotif]').forEach(el=>el.disabled=true);}}
async function removeAdmin(id){if(!await ask({title:'Remover administrador?',text:'A conta perderá acesso ao painel e suas sessões serão revogadas.',ok:'Remover',danger:true}))return;await mutate('/admin/administrators/'+id+'/remove');renderAdminList();}
async function revokeInvitation(id){if(!await ask({title:'Revogar convite?',text:'O convite deixará de permitir o aceite de acesso administrativo.',ok:'Revogar',danger:true}))return;await mutate('/admin/administrators/invitations/'+id+'/revoke');renderAdminList();}
function resetIdle(){clearTimeout(logoutTimer);logoutTimer=setTimeout(async()=>{try{await fazerLogoutAdmin();}catch{toast('Não foi possível encerrar a sessão. Tente sair novamente.','red');}},(db.settings.idleMin||30)*60000);}
const commands={viewOrder,revokeInvitation,closeModal,exportLedger,confirmAllPix,confirmPix,rejectPix,viewPix,exportClients,openHistory,saveClientNote,deleteClient,openCreateMenu,openPlanForm,toggleDestaque,togglePlanAtivo,duplicatePlan,deletePlan,openPromoForm,togglePromo,deletePromo,openCouponForm,toggleCoupon,deleteCoupon,generateCoupon,copyCode,exportRefunds,openRefundDecision,openChat,exportLogs,clearLogs,markNotifRead,openSettings,setPixTab,setClientSeg,sortClients,setClientPage,setRefundTab,setTicketTab,setLogTab,goNotif,setSetting};
// Gramática restrita de ações: sem eval, Function ou execução de expressões do HTML.
function invoke(command){
  const parsed=command.split(';').map(s=>s.trim()).filter(Boolean).map(part=>{
    const match=part.match(/^([A-Za-z]+)\((.*)\)$/);
    if(!match||!Object.hasOwn(commands,match[1]))throw Error('Ação inválida.');
    const tokens=match[2].match(/'[^']*'|"[^"]*"|true|false|-?\d+/g)||[];
    if(tokens.join(',')!==match[2].trim())throw Error('Parâmetros inválidos.');
    return [match[1],tokens.map(t=>t[0]==="'"||t[0]==='"'?t.slice(1,-1):t==='true'?true:t==='false'?false:Number(t))];
  });
  for(const [name,args]of parsed)Promise.resolve(commands[name](...args)).catch(error=>toast(error.message,'red'));
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-command]');if(el&&!el.disabled){event.preventDefault();try{invoke(el.dataset.command);}catch(error){toast(error.message,'red');}}if(!event.target.closest('.dropdown-wrap'))$('#ddNotif').classList.remove('active');if(!event.target.closest('.search-wrap'))$('#sResults').classList.remove('show');});
document.addEventListener('change',async event=>{const el=event.target;try{if(el.matches('[data-setting]')){const value=el.type==='checkbox'?el.checked:el.value;await setField(el.dataset.setting,value);}if(el.matches('[data-appearance]'))await setThemeMode(el.value);if(el.matches('[data-theme]'))await toggleTheme(el.dataset.theme,el.checked);}catch(error){if(el.dataset.setting){const old=db.settings[el.dataset.setting];if(el.type==='checkbox')el.checked=!!old;else el.value=old??'';}toast(error.message,'red');}});
$$('.nav-item').forEach(button=>button.addEventListener('click',()=>{nav(button.dataset.view);menu(false);}));
$('#clientQ').addEventListener('input',event=>{ui.clients.q=event.target.value;ui.clients.page=1;renderClients();labelTables();});
$('#gSearch').addEventListener('input',event=>runSearch(event.target.value));
$('#gSearch').addEventListener('keydown',event=>{const items=$$('.sitem');if(!items.length)return;if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();sSel=(sSel+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((b,i)=>b.classList.toggle('sel',i===sSel));items[sSel].scrollIntoView({block:'nearest'});}if(event.key==='Enter'){event.preventDefault();pickSearch(sSel<0?0:sSel);}});
$('#btnTheme').addEventListener('click',()=>setSetting('dark',document.documentElement.dataset.theme!=='dark').catch(error=>toast(error.message,'red')));
$('#btnConfig').addEventListener('click',openSettings);$('#btnNotif').addEventListener('click',()=>$('#ddNotif').classList.toggle('active'));
$('#logoutBtn').addEventListener('click',async()=>{if(!await ask({title:'Sair do painel?',text:'Sua sessão será encerrada no servidor.',ok:'Sair'}))return;try{await fazerLogoutAdmin();}catch(error){toast(error.message,'red');}});
function menu(open){$('.sidebar').classList.toggle('open',open);$('.workspace-backdrop').classList.toggle('open',open);$('#mobileMenu').setAttribute('aria-expanded',String(open));$('.sidebar').inert=matchMedia('(max-width:1000px)').matches&&!open;if(open)$('.sidebar .nav-item').focus();}
$('#mobileMenu').addEventListener('click',()=>menu(!$('.sidebar').classList.contains('open')));$('.workspace-backdrop').addEventListener('click',()=>{menu(false);$('#mobileMenu').focus();});matchMedia('(max-width:1000px)').addEventListener('change',()=>menu(false));
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('#gSearch').focus();$('#gSearch').select();}if(event.key==='Escape'){if($('#cOverlay').classList.contains('open'))$('#cOverlay')._cancel?.();else if($('#overlay').classList.contains('open'))closeModal();else{menu(false);$('#sResults').classList.remove('show');$('#ddNotif').classList.remove('active');}}if(['Enter',' '].includes(event.key)&&event.target.matches('[data-command]:not(button)')){event.preventDefault();try{invoke(event.target.dataset.command);}catch(error){toast(error.message,'red');}}if(event.key==='Tab'){const root=$('#cOverlay.open .modal')||$('#overlay.open .modal')||$('.sidebar.open');if(!root)return;const focusable=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
$('#overlay').addEventListener('click',event=>{if(event.target===$('#overlay'))closeModal();});
for(const event of ['keydown','pointerdown','touchstart'])document.addEventListener(event,()=>{lastActivity=Date.now();resetIdle();},{passive:true});
new MutationObserver(()=>labelTables()).observe($('#content'),{childList:true,subtree:true});
normalizeWorkspace();renderAll();renderUser();renderBanner();applyTheme();nav(location.hash.slice(1));menu(false);resetIdle();
document.body.classList.remove("workspace-pending");document.getElementById("app").inert=false;document.getElementById("workspaceLoading").remove();
window.addEventListener('hashchange',()=>nav(location.hash.slice(1)));
setInterval(tickCountdowns,1000);
setInterval(async()=>{if(document.hidden||Date.now()-lastActivity>60000)return;try{await reloadWorkspace();if(activeChat&&$('#chatMsgs')&&$('#overlay').classList.contains('open')){const t=db.tickets.find(t=>t.id===activeChat);if(t)$('#chatMsgs').innerHTML=t.msgs.map(msgHTML).join('');}}catch(error){if(error.status===401)window.location.href='login.html';}},15000);
})();
