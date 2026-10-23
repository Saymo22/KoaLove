/* Uma função para todas as rotas da API. Não inicia um servidor listen(). */
module.exports=async function handler(req,res){
  try{
    const url=new URL(req.url,'https://local');
    if(url.searchParams.has('__na_path')){
      const route=url.searchParams.get('__na_path');url.searchParams.delete('__na_path');
      req.url='/api/'+route+(url.search?'?'+url.searchParams.toString():'');
    }
    const config=require('../server/config'),http=require('../server/lib/http');
    if(!config.CLOUD) return http.fail(res,503,'CLOUD_NOT_CONFIGURED','Configure NA_STORAGE=postgres para executar esta função.');
    if(!config.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN)return http.fail(res,503,'CLOUD_NOT_CONFIGURED','Conecte PostgreSQL (DATABASE_URL) e Blob privado (BLOB_READ_WRITE_TOKEN) ao projeto.');
    await require('../server/lib/db').withRequest(()=>require('../server/index').handleRequest(req,res));
  }catch(err){
    console.error('[api] Inicialização falhou:',err.code||'STORAGE_ERROR');
    if(!res.headersSent)require('../server/lib/http').fail(res,503,'STORAGE_UNAVAILABLE','Armazenamento indisponível. Verifique a configuração do projeto.');
    else res.destroy();
  }
};
module.exports.config={api:{bodyParser:false}};
