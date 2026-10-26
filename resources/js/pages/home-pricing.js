(() => {
    const $=id=>document.getElementById(id);
    let catalog=null,offset=0,loading=false,lastExpired='';
    const money=cents=>formatarPreco(cents/100);
    const now=()=>Date.now()+offset;
    function live(plan){return plan.promotion?.ends_at&&new Date(plan.promotion.ends_at).getTime()>now();}
    function price(plan){return live(plan)?plan.amount_cents:plan.price_cents;}
    function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
    function render(){
        if(!catalog?.plans?.length){$('pricingCards').replaceChildren(node('p','','Os planos estão temporariamente indisponíveis.'));return;}
        const cards=catalog.plans.map(plan=>{
            const card=node('article','preco-box');
            if(plan.featured)card.append(node('div','preco-badge','Mais escolhido'));
            const head=node('div','preco-valor-wrap');head.append(node('h3','preco-tag',plan.name));
            if(live(plan))head.append(node('del','plan-old-price',money(plan.price_cents)));
            const value=node('div','preco-valor');const cents=price(plan);
            value.append(node('span','cifrao','R$'),document.createTextNode(String(Math.floor(cents/100))),node('span','centavos',','+String(cents%100).padStart(2,'0')));
            head.append(value,node('p','plan-description',plan.description),node('span','preco-valor-sub','Pagamento único'));
            const list=node('ul','preco-lista');for(const feature of plan.features||[])list.append(node('li','',feature));
            const media=node('p','plan-media',`${plan.photos_limit} fotos · ${plan.videos_limit} vídeos · ${plan.music_limit} música`);
            const link=node('a','b ouro magnetic','Criar meu presente');link.href='criar.html?plano='+encodeURIComponent(plan.id);
            card.append(head,media,list,link,node('div','preco-garantia','Garantia de 7 dias'));return card;
        });
        $('pricingCards').replaceChildren(...cards);
        const plan=catalog.plans.find(p=>p.id===catalog.default_plan_id&&live(p))||catalog.plans.find(live)||catalog.plans.find(p=>p.id===catalog.default_plan_id)||catalog.plans[0];
        $('promoPor').textContent=money(price(plan));$('promoLabel').textContent=live(plan)?plan.promotion.name:plan.name;
        $('promoDe').hidden=!live(plan);$('promoDe').textContent=money(plan.price_cents);
        $('promoCountdown').hidden=!live(plan);$('promoLink').href='criar.html?plano='+encodeURIComponent(plan.id);
        tick();
    }
    function tick(){
        const plan=catalog?.plans?.find(p=>live(p)&&p.id===catalog.default_plan_id)||catalog?.plans?.find(live);
        if(plan){
            const seconds=Math.max(0,Math.ceil((new Date(plan.promotion.ends_at).getTime()-now())/1000));
            const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60);
            $('promoClock').textContent=(days?days+'d ':'')+[hours,minutes,seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
        }else if(!$('promoCountdown').hidden){$('promoCountdown').hidden=true;}
        const expired=catalog?.plans?.filter(p=>p.promotion&&!live(p)).map(p=>p.promotion.id).join(',');
        if(expired&&expired!==lastExpired){lastExpired=expired;render();refresh();}
    }
    async function refresh(){
        if(loading||document.hidden)return;loading=true;
        try{const r=await fetch('/api/config',{credentials:'same-origin',cache:'no-store'});const body=await r.json();if(!r.ok||!body.ok)return;catalog=body.data;offset=(catalog.server_time_ms||Date.now())-Date.now();lastExpired='';render();}
        catch{}finally{loading=false;}
    }
    NA_CONFIG_READY.then(data=>{catalog=data;offset=(data?.server_time_ms||Date.now())-Date.now();render();});
    setInterval(tick,1000);setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
})();
