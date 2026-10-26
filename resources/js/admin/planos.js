(async () => {
    if (!(await protegerRotaAdmin())) return;
    renderAdminHeader('planos');
    const $ = id => document.getElementById(id);
    let records = {plans:[],promotions:[],coupons:[]};
    const localDate = value => {if(!value)return '';const d=new Date(value);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
    const message = text => {$('pricingStatus').textContent=text;};
    function edit(form, record) {
        form.reset();
        for (const [key,value] of Object.entries(record)) {
            const input=form.elements.namedItem(key);if(!input)continue;
            if(input.type==='checkbox')input.checked=!!value;
            else input.value=key==='features'?value.join('\n'):key.endsWith('_at')?localDate(value):value??'';
        }
        if(record.price_cents!==undefined)form.elements.price.value=(record.price_cents/100).toFixed(2).replace('.',',');
        form.scrollIntoView({behavior:'smooth',block:'center'});
        form.querySelector('input:not([type=hidden])')?.focus({preventScroll:true});
    }
    function status(record) {
        if(!record.active)return 'Desativado';
        if(record.ends_at&&new Date(record.ends_at)<=new Date())return 'Encerrado';
        if(record.starts_at&&new Date(record.starts_at)>new Date())return 'Agendado';
        return 'Ativo';
    }
    async function load() {
        records=await ApiClient.get('/admin/pricing');
        for(const select of document.querySelectorAll('.pricing-plan-options')){
            const chosen=select.value;select.replaceChildren(new Option('Todos os planos',''));
            for(const plan of records.plans)select.add(new Option(plan.name,plan.id));
            select.value=chosen;
        }
        for(const [kind,formId] of [['plans','planForm'],['promotions','promotionForm'],['coupons','couponForm']]){
            const list=$(kind+'List');list.replaceChildren();
            if(!records[kind].length){const p=document.createElement('p');p.textContent='Nenhum cadastro ainda.';list.append(p);}
            for(const record of records[kind]){
                const row=document.createElement('div');row.className='pricing-record';
                const text=document.createElement('span');
                text.textContent=(record.name||record.code)+' · '+(kind==='plans'?formatarPreco(record.price_cents/100):record.discount_percent+'%')+' · '+status(record);
                const button=document.createElement('button');button.type='button';button.className='btn-action';button.textContent='Editar';
                button.addEventListener('click',()=>edit($(formId),record));row.append(text,button);list.append(row);
            }
        }
    }
    for(const form of document.querySelectorAll('.pricing-form'))form.addEventListener('submit',async event=>{
        event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;
        try{
            const data=Object.fromEntries(new FormData(form));const id=data.id;delete data.id;
            for(const input of form.querySelectorAll('[type=checkbox]'))data[input.name]=input.checked;
            let path;
            if(form.getAttribute('id')==='planForm'){
                const price=data.price.trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(price))throw Error('Informe o preço como 19,90.');
                const parts=price.replace(',','.').split('.');data.price_cents=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));delete data.price;
                data.features=data.features.split('\n').map(s=>s.trim()).filter(Boolean);
                for(const key of ['photos_limit','videos_limit','music_limit','sort_order'])data[key]=Number(data[key]);
                path='/admin/plans'+(id?'/'+encodeURIComponent(id):'');
            }else{
                data.plan_id||=null;data.discount_percent=Number(data.discount_percent);
                for(const key of ['starts_at','ends_at'])data[key]=data[key]?new Date(data[key]).toISOString():null;
                path='/admin/pricing/'+form.dataset.kind+(id?'/'+encodeURIComponent(id):'');
            }
            await ApiClient.post(path,data);await load();form.reset();form.elements.id.value='';
            message('Salvo. A home atualiza automaticamente em até 30 segundos; recarregue para conferir agora.');
        }catch(error){message(error.message);}finally{button.disabled=false;}
    });
    document.querySelectorAll('[data-new]').forEach(button=>button.addEventListener('click',()=>{const form=$(button.dataset.new);form.reset();form.elements.id.value='';form.querySelector('input:not([type=hidden])')?.focus();}));
    try{await load();}catch(error){message(error.message);}
})();
