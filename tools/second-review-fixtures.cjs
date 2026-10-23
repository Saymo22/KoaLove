/* Dados artificiais, usados exclusivamente em diretórios temporários. */
const fs=require('node:fs');const path=require('node:path');
module.exports=function prepare(dir){
 const root=path.resolve(__dirname,'..');
 if(path.resolve(dir)===path.join(root,'server/data'))throw new Error('Não usar banco real em fixtures.');
 fs.copyFileSync(path.join(root,'server/data/config.json'),path.join(dir,'config.json'));
 const user={id:'review-2-user',name:'Pessoa de teste',email:'review2@example.test',role:'user',created_at:Date.now()};
 fs.writeFileSync(path.join(dir,'users.json'),JSON.stringify([user]));
 fs.writeFileSync(path.join(dir,'sessions.json'),JSON.stringify([{token:'review-2-isolated-session',user_id:user.id,created_at:Date.now(),expires_at:Date.now()+3600000}]));
 const base={user_id:user.id,tema:'namoro',titulo:'Um presente',para:'Pessoa especial',de:'Pessoa de teste',inicio:'2020-06-12',carta:'Mensagem de teste',created_at:Date.now(),price_cents:1990,content_version:1,themeData:{},media:{photos:[],videos:[],music:null},uploads:[]};
 const rows=[
 {...base,id:'review-2-pending',status:'pending',titulo:'Rascunho de teste'},
 {...base,id:'review-2-paid',status:'paid',titulo:'<b data-review="xss">Título literal</b>',para:'"><img src=x onerror=alert(1)>',paid_at:Date.now(),amount_paid_cents:1990,payment_method:'pix',share_token:'review-2-share-token'},
 {...base,id:'review-2-refunded',status:'refunded',titulo:'Compra reembolsada',paid_at:Date.now(),amount_paid_cents:1990,payment_method:'pix'},
 {...base,id:'review-2-deleted',status:'paid',titulo:'Compra excluída',deleted:true,paid_at:Date.now(),amount_paid_cents:1990,payment_method:'card'},
 {...base,id:'review-2-deleted-refund',status:'refunded',titulo:'Reembolso excluído',deleted:true,paid_at:null,amount_paid_cents:1990,payment_method:'pix'},
 ];
 fs.writeFileSync(path.join(dir,'purchases.json'),JSON.stringify(rows));
 return rows;
};
