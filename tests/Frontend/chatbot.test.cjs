const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Chat permanece ausente em presentes e temas, incluindo URLs anteriores',async()=>{
    const {chatAllowed}=await import('../../resources/js/chat/page-policy.js');
    for(const path of ['/presente','/ver.html','/temas/namoro','/teste/namoro.html','/admin/painel','/temas','/teste'])assert.equal(chatAllowed(path),false,path);
    assert.equal(chatAllowed('/criar-presente'),true);assert.equal(chatAllowed('/criar-presente',true),false);
});
test('Chat distingue assuntos, usa catálogo atual e preserva análise legal',async()=>{
    const {answer,identify}=await import('../../resources/js/chat/knowledge.js');
    assert.equal(identify('Não consigo enviar o vídeo'),'media');
    assert.equal(identify('Quero meu reembolso'),'refund');
    assert.equal(identify('Esqueci minha senha'),'account');
    assert.equal(identify('Pix pago mas continua pendente'),'payment');
    assert.equal(identify('Quanto custa?'),'payment');
    const catalog={plans:[{name:'Plano de teste',price_cents:4790}],themes:{namoro:{nome:'Namoro'},vinil:{nome:'Vinil'}}};
    const pricing=answer('Quais os preços?',catalog,'https://example.test');
    assert.match(pricing.text,/47,90/);assert.doesNotMatch(pricing.text,/19,90/);
    assert.match(answer('Temas disponíveis',catalog,'https://example.test').text,/Vinil/);
    const refund=answer('Reembolso depois de abrir',catalog,'https://example.test');
    assert.match(refund.text,/72 horas/);assert.match(refund.text,/direitos legais/);
    assert.match(answer('Qualquer outra coisa',null,'https://example.test').text,/Qual etapa|em qual etapa/);
    assert(answer('Qualquer outra coisa',null,'https://example.test').suggestions.includes('Falar com suporte'));
});
