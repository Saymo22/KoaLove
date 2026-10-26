const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');

async function fixture(t,handler){
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'release-download-test-'));
  const server=http.createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await fs.rm(dir,{recursive:true,force:true});});
  return {url:'http://127.0.0.1:'+server.address().port,file:path.join(dir,'release.bin')};
}

test('Build recupera falha temporária de download sem alterar os bytes',async t=>{
  const {downloadRelease}=await import('../../tools/download-release.mjs');let requests=0;
  const f=await fixture(t,(_req,res)=>{if(++requests===1){res.writeHead(503);res.end('temporarily unavailable');}else res.end('expected-release');});
  await downloadRelease(f.url,f.file,{delayMs:1});
  assert.equal(requests,2);assert.equal(await fs.readFile(f.file,'utf8'),'expected-release');
});

test('Build interrompe download com erro permanente sem repetir',async t=>{
  const {downloadRelease}=await import('../../tools/download-release.mjs');let requests=0;
  const f=await fixture(t,(_req,res)=>{requests++;res.writeHead(404);res.end();});
  await assert.rejects(downloadRelease(f.url,f.file,{delayMs:1}),/HTTP 404/);assert.equal(requests,1);
});

test('Build limita tentativas em indisponibilidade persistente',async t=>{
  const {downloadRelease}=await import('../../tools/download-release.mjs');let requests=0;
  const f=await fixture(t,(_req,res)=>{requests++;res.writeHead(503);res.end();});
  await assert.rejects(downloadRelease(f.url,f.file,{delayMs:1}),/HTTP 503/);assert.equal(requests,3);
});

test('Build usa HTTPS do sistema quando a conexão do Node é reiniciada',async t=>{
  const {downloadRelease}=await import('../../tools/download-release.mjs');let requests=0;
  const f=await fixture(t,(_req,res)=>{requests++;res.end('expected-release');});
  const mocked=t.mock.method(globalThis,'fetch',async()=>{throw Object.assign(new TypeError('fetch failed'),{cause:{code:'ECONNRESET'}});});
  await downloadRelease(f.url,f.file,{delayMs:1});
  assert.equal(mocked.mock.callCount(),3);assert.equal(requests,1);assert.equal(await fs.readFile(f.file,'utf8'),'expected-release');
});
