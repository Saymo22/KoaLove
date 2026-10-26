import './widget.js';
import {chatAllowed} from './page-policy.js';
import stylesheet from '../../css/chatbot.css?url';
import {answer,identify,normalize,quickHelp} from './knowledge.js';

// A página do presente contém um iframe de tema; apenas a página externa cria o chat.
if(chatAllowed(location.pathname,window.self!==window.top)){
    let mode='bot',awaitingIssue=false,thread=null,identity=null,catalog=null,polling=false,lastPoll=0,disposed=false;
    let seen=new Set(),pending=null;
    const widget=window.ChatWidget;
    const messageKey=(m,i)=>m.id||`${i}:${m.role}:${m.at}:${m.text}`;
    async function request(path,body){
        const response=await fetch('/api'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),
            headers:{Accept:'application/json','Content-Type':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.content||''},
            ...(body?{body:JSON.stringify(body)}:{})});
        const result=await response.json().catch(()=>null);
        if(!response.ok||!result?.ok){const error=new Error(result?.error?.message||'Não foi possível conectar ao atendimento.');error.status=response.status;throw error;}
        return result.data;
    }
    function adopt(ticket,render=true){
        thread=ticket;
        const incoming=[];
        (ticket?.messages||[]).forEach((m,i)=>{const key=messageKey(m,i);if(!seen.has(key)){seen.add(key);if(render)incoming.push(m);}});
        if(incoming.length)widget.receive(incoming);
    }
    async function refresh(force=false){
        if(polling||disposed||document.hidden||(!force&&Date.now()-lastPoll<15000))return;
        polling=true;lastPoll=Date.now();
        try{
            const data=await request('/support');
            const arriving=identity===null||identity!==data.user_id;
            if(identity!==null&&identity!==data.user_id){mode='bot';awaitingIssue=false;thread=null;seen=new Set();widget.clear();}
            identity=data.user_id;
            adopt(data.ticket);
            if(arriving&&data.ticket){mode='human';widget.receive([{role:'system',text:'Atendimento retomado. Sua próxima mensagem será enviada à equipe. Para dúvidas automáticas, selecione Voltar ao assistente.'}]);widget.suggest(['Voltar ao assistente']);}
        }catch(error){
            if(error.status===401){if(identity!==null){mode='bot';awaitingIssue=false;thread=null;seen=new Set();widget.clear();}identity=null;}
        }finally{polling=false;}
    }
    async function loadCatalog(){
        try{catalog=await request('/config');}catch{catalog=null;}
    }
    const humanIntent=text=>/falar com (o )?suporte|atendente|atendimento humano|falar com (uma )?pessoa|nao resolveu|nao ajudou/.test(normalize(text));
    async function respond(text,history){
        if(normalize(text)==='voltar ao assistente'){
            mode='bot';awaitingIssue=false;pending=null;
            return {text:'Você voltou ao assistente automático. O histórico do suporte continua salvo na sua conta; uma nova resposta da equipe aparecerá aqui.',suggestions:quickHelp};
        }
        if(humanIntent(text)){
            // Verifica a sessão no servidor, sem confiar em cache local de identidade.
            try{const data=await request('/support');identity=data.user_id;adopt(data.ticket);}
            catch(error){if(error.status!==401)throw error;return {text:`Para conversar com a equipe e receber a resposta neste chat, entre na sua conta: [Entrar](${location.origin}/login.html). Suas dúvidas gerais podem continuar por aqui. Não envie senhas ou códigos.`,suggestions:quickHelp.filter(s=>s!=='Falar com suporte')};}
            if(thread&&thread.messages.length<498){mode='human';return {text:'Você está no atendimento com a equipe KoaLove. Conte o que precisa e envie sua mensagem por aqui. A resposta aparecerá neste chat quando estiver disponível; você também pode voltar depois pela mesma conta.',suggestions:['Voltar ao assistente']};}
            awaitingIssue=true;
            return {text:'Vou encaminhar você ao suporte KoaLove. 💛 Para preparar o atendimento, descreva o que aconteceu e em qual etapa. Ao enviar, sua descrição, até três perguntas anteriores e o nome desta página serão compartilhados com a equipe. A resposta chegará neste chat; não é preciso ficar com a página aberta. Não envie senhas, códigos ou dados de cartão.',suggestions:[]};
        }
        if(awaitingIssue||mode==='human'){
            const starting=awaitingIssue;
            // Uma repetição após falha de rede reutiliza o ID para não duplicar a mensagem.
            if(!pending||pending.text!==text||pending.starting!==starting)pending={text,starting,id:crypto.randomUUID()};
            const context=history.filter(m=>m.role==='user'&&m.content!==text&&!humanIntent(m.content)).slice(-3).map(m=>m.content.slice(0,500));
            try{
                const sendingAs=identity;
                const data=await request(starting?'/support/start':'/support/messages',{text,message_id:pending.id,
                    ...(starting?{category:identify(text)==='other'?identify(context.join(' ')):identify(text),page:/^\/[a-zA-Z0-9_/-]+\.html$/.test(location.pathname)?location.pathname:'/home.html',context}:{})});
                if(identity!==sendingAs||data.user_id!==sendingAs)throw new Error('A sessão mudou. Reabra o chat para continuar.');
                // O texto que acabou de ser enviado já está visível; respostas concorrentes não são descartadas.
                const own=data.ticket.messages.findIndex(m=>m.id===pending.id);
                if(own>=0)seen.add(messageKey(data.ticket.messages[own],own));
                adopt(data.ticket);pending=null;awaitingIssue=false;mode='human';
                return {text:starting?'Seu atendimento foi encaminhado à equipe KoaLove. A resposta aparecerá neste chat assim que estiver disponível. Você pode continuar descrevendo o problema por aqui.':'',suggestions:['Voltar ao assistente']};
            }catch(error){
                if(error.status===401){mode='bot';awaitingIssue=false;thread=null;seen=new Set();identity=null;widget.clear();widget.receive([{role:'system',text:'Sua sessão expirou. Entre novamente para continuar o atendimento. Sua última mensagem não foi confirmada; envie-a após entrar.'}]);return {text:'',suggestions:quickHelp};}
                throw error;
            }
        }
        await loadCatalog();
        return answer(text,catalog,location.origin);
    }
    widget.init({stylesheet,name:'KoaLove',avatar:'/branding/koalove-simbolo-principal.svg',subtitle:'Assistente automático · suporte pelo chat',theme:'dark',persist:false,effects:false,
        greeting:'Olá! 💛 Sou o assistente automático do KoaLove. Posso explicar o site, ajudar com dúvidas e encaminhar você à equipe de suporte.',
        suggestions:quickHelp,brandLine:'Não envie senhas, códigos ou dados de cartão.',typingDelay:200,
        errorMessage:'Não foi possível confirmar o envio. Sua mensagem continua aqui; tente novamente em instantes.',
        onMessage:respond,onReset:()=>{mode='bot';awaitingIssue=false;pending=null;},onOpen:()=>refresh(true)});
    document.addEventListener('click',event=>{const link=event.target.closest('[data-support-chat]');if(!link)return;event.preventDefault();widget.open();if(link.dataset.supportChat==='human')widget.send('Falar com suporte');});
    // Consultas leves; sem websocket ou serviço externo, apenas a sessão autenticada do site.
    refresh(true);
    const interval=setInterval(()=>{if(identity!==null||thread)refresh();},15000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
    window.addEventListener('pagehide',()=>{disposed=true;clearInterval(interval);});
    window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
}
