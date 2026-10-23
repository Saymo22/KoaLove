/* O contexto é por requisição: nenhuma conta/pedido fica em cache entre usuários
   ou instâncias. As alterações usam transação e trava compartilhada no Postgres. */
const {AsyncLocalStorage}=require('node:async_hooks');
const config=require('../config');
const context=new AsyncLocalStorage();
const names=['users','sessions','purchases','tickets','refunds','config'];
let pool,initializing;
function connection(){
  if(!config.DATABASE_URL) throw Object.assign(new Error('Configure DATABASE_URL para o PostgreSQL.'),{status:503,code:'DATABASE_NOT_CONFIGURED'});
  return pool ||= new (require('pg').Pool)({connectionString:config.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
}
async function snapshot(client){
  const {rows}=await client.query('SELECT name, data FROM na_state');
  return Object.fromEntries(names.map(name=>[name,rows.find(r=>r.name===name)?.data||[]]));
}
function state(){const value=context.getStore();if(!value)throw new Error('Banco PostgreSQL precisa de contexto de requisição.');return value;}
async function initAll(){
  if(initializing)return initializing;
  initializing=(async()=>{
    const client=await connection().connect();
    try {
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(78120931)');
    await client.query('CREATE TABLE IF NOT EXISTS na_state (name TEXT PRIMARY KEY, data JSONB NOT NULL)');
    await client.query('CREATE TABLE IF NOT EXISTS na_rate_limits (key TEXT PRIMARY KEY, hits BIGINT[] NOT NULL, expires_at BIGINT NOT NULL)');
    for(const name of names)await client.query('INSERT INTO na_state(name,data) VALUES($1,$2::jsonb) ON CONFLICT(name) DO NOTHING',[name,JSON.stringify(name==='config'?[require('../defaults')]:[])]);
    // Só cria administrador quando credenciais explícitas e fortes são fornecidas.
    if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASS?.length>=12){
        const data=await snapshot(client),security=require('./security');
        if(!data.users.some(u=>u.role==='admin')){
          data.users.push({id:security.randomId('u'),email:config.ADMIN_EMAIL,email_hash:security.emailHash(config.ADMIN_EMAIL),password_hash:security.hashPassword(config.ADMIN_PASS),name:'Administrador',role:'admin',created_at:Date.now()});
          await client.query('UPDATE na_state SET data=$2::jsonb WHERE name=$1',['users',JSON.stringify(data.users)]);
        }
    }
    await client.query('COMMIT');
    }catch(err){await client.query('ROLLBACK').catch(()=>{});throw err;}finally{client.release();}
  })().catch(err=>{initializing=null;throw err;});
  return initializing;
}
async function withRequest(fn){await initAll();return context.run({data:await snapshot(connection())},fn);}
async function transactionAcross(selected,change){
  const ctx=state(),client=await connection().connect();const previous=ctx.data;
  try{
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(78120931)');
    const fresh=await snapshot(client);ctx.data=fresh;
    const next=Object.fromEntries(selected.map(name=>{if(!names.includes(name))throw new Error('Tabela inválida.');return [name,structuredClone(fresh[name])];}));
    const result=change(next);
    if(result&&typeof result.then==='function')throw new Error('A alteração da transação deve ser síncrona.');
    for(const name of selected)await client.query('UPDATE na_state SET data=$2::jsonb WHERE name=$1',[name,JSON.stringify(next[name])]);
    await client.query('COMMIT');ctx.data={...fresh,...next};return structuredClone(result);
  }catch(err){ctx.data=previous;await client.query('ROLLBACK').catch(()=>{});throw err;}finally{client.release();}
}
class PgStore{
  constructor(name){this.name=name;}
  all(){return structuredClone(state().data[this.name]);}
  find(fn){return this.all().find(fn);}
  filter(fn){return this.all().filter(fn);}
  transaction(change){return transactionAcross([this.name],rows=>change(rows[this.name]));}
  insert(item){return this.transaction(rows=>{rows.push(structuredClone(item));return item;});}
  update(id,patch){return this.transaction(rows=>{const i=rows.findIndex(x=>x.id===id);if(i<0)return null;return rows[i]={...rows[i],...structuredClone(patch),updated_at:Date.now()};});}
  remove(id){return this.transaction(rows=>{const i=rows.findIndex(x=>x.id===id);if(i<0)return false;rows.splice(i,1);return true;});}
  save(){return this.transaction(()=>undefined);}
}
async function rateLimit(key,limit,windowMs){
  const client=await connection().connect();const now=Date.now();
  try{
    await client.query('BEGIN');
    await client.query('INSERT INTO na_rate_limits(key,hits,expires_at) VALUES($1,ARRAY[]::BIGINT[],$2) ON CONFLICT(key) DO NOTHING',[key,now+windowMs]);
    const {rows}=await client.query('SELECT hits FROM na_rate_limits WHERE key=$1 FOR UPDATE',[key]);
    const hits=rows[0].hits.map(Number).filter(t=>now-t<windowMs),allowed=hits.length<limit;
    if(allowed)hits.push(now);
    await client.query('UPDATE na_rate_limits SET hits=$2,expires_at=$3 WHERE key=$1',[key,hits,now+windowMs]);
    await client.query('COMMIT');
    await client.query('DELETE FROM na_rate_limits WHERE expires_at<$1',[now]).catch(()=>{});
    const reset=hits.length?Math.max(1,Math.ceil((hits[0]+windowMs-now)/1000)):Math.ceil(windowMs/1000);
    return {allowed,headers:{'X-RateLimit-Limit':String(limit),'X-RateLimit-Remaining':String(Math.max(0,limit-hits.length)),'X-RateLimit-Reset':String(reset),...(!allowed?{'Retry-After':String(reset)}:{})}};
  }catch(err){await client.query('ROLLBACK').catch(()=>{});throw err;}finally{client.release();}
}
module.exports={stores:Object.fromEntries(names.map(n=>[n,new PgStore(n)])),initAll,withRequest,transactionAcross,rateLimit,close:()=>pool?.end()};
