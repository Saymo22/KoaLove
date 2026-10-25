export const quickHelp=['Como funciona?', 'Preços e planos', 'Falar com suporte'];
export const normalize=text=>String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function identify(text){
    const t=normalize(text);
    if(/reembol|estorn|arrepend|devolu/.test(t))return 'refund';
    if(/senha|login|entrar|conta|acesso/.test(t))return 'account';
    if(/pix|cartao|paga|cobranc|preco|plano|cupom|desconto|valor|custa|custo/.test(t))return 'payment';
    if(/foto|video|musica|audio|upload|arquivo|enviar/.test(t))return 'media';
    if(/qr|link|compartilh|destinat/.test(t))return 'sharing';
    if(/tema|namoro|casamento|aniversario|netflix|spotify|vinil|scrapbook/.test(t))return 'themes';
    if(/criar|criacao|funciona|personaliz|formulario|carta|etapa/.test(t))return 'creation';
    return 'other';
}
export function answer(text,catalog,origin){
    const category=identify(text),link=(label,path)=>`[${label}](${origin}${path})`;
    const suggestions=['Falar com suporte','Como funciona?'];
    let reply;
    switch(category){
        case 'refund': reply='A garantia comercial é de **3 dias (72 horas)** após a confirmação do pagamento, enquanto o link compartilhado não tiver sido aberto. A prévia privada não conta. Em Minha Conta você pode solicitar reembolso ou análise dos seus direitos legais, inclusive após o prazo comercial ou a abertura. O envio inicia uma análise e não executa um estorno. '+link('Consultar política','/reembolso.html'); break;
        case 'account': reply='Use o mesmo e-mail do cadastro para entrar. Se esqueceu a senha, abra “Esqueceu a senha?” na tela de login. Nunca envie senha, código de verificação ou dados de cartão neste chat. '+link('Entrar na conta','/login.html'); break;
        case 'payment': {
            const plans=catalog?.plans;
            const prices=plans?.length?plans.map(p=>`${p.name}: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(p.price_cents/100)}`).join('; '):null;
            reply=(prices?`Preços de tabela atuais: **${prices}**. Promoções e cupons válidos podem alterar o total; confira o valor final antes de pagar. `:'Consulte os valores atualizados na seção de preços da home. ')
                +'O pagamento é único. Pix e cartão são oferecidos pelo Mercado Pago quando disponíveis no checkout. O presente é liberado após a confirmação verificada do pagamento; o retorno ao site, sozinho, não aprova a compra. Se já pagou e continua pendente, informe ao suporte o ID do pedido, sem dados bancários. '+link('Ver preços','/home.html#preco'); break;
        }
        case 'media': reply='O plano escolhido define quantas fotos, vídeos e músicas você pode incluir. Os limites de tamanho aparecem no formulário. Aguarde o envio terminar antes de avançar e mantenha uma cópia dos arquivos. Se falhar, diga o tipo e o tamanho do arquivo e a mensagem exibida, sem enviar mídias pessoais ao chat. '+link('Criar presente','/criar.html'); break;
        case 'sharing': reply='Depois da confirmação do pagamento, você encontra o presente, o link e o QR Code na sua conta. Compartilhe só com quem deve ver: quem tem o link pode acessar o presente. Abrir o link público conta para a regra da garantia comercial; consulte sua prévia privada pela conta. '+link('Minha Conta','/minha-conta.html'); break;
        case 'themes': {
            const themes=Object.values(catalog?.themes||{}).map(t=>t.nome).filter(Boolean);
            reply=(themes.length?'Os temas disponíveis são: **'+themes.join(', ')+'**. ':'Veja os temas disponíveis na home. ')
                +'Cada tema tem campos e recursos próprios. Escolha um e use a prévia para conferir o resultado. '+link('Explorar temas','/home.html#temas'); break;
        }
        case 'creation': reply='Para criar seu presente:\n- Escolha o plano e o tema.\n- Preencha as etapas com os textos e as mídias desejadas.\n- Confira a prévia.\n- Finalize o pagamento.\n- Compartilhe o link ou QR Code após a confirmação.\n'+link('Começar a criar','/criar.html'); break;
        default: reply='Quero entender melhor: sua dúvida é sobre criar o presente, fotos e vídeos, pagamento, conta, link ou reembolso? Se apareceu um erro, diga em qual etapa e copie apenas a mensagem, sem senhas ou dados bancários.'; suggestions.unshift('Fotos e vídeos','Pagamento pendente');
    }
    return {text:reply,suggestions:suggestions.slice(0,4),category};
}
