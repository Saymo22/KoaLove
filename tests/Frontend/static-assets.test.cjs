const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
test('Publicação estática inclui todos os SVGs de marca e não copia o PHP público',async()=>{
    const {publishStaticAssets}=await import('../../tools/publish-static-assets.mjs');
    const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'koalove-static-test-'));
    const source=path.join(temporary,'public'),output=path.join(temporary,'dist');
    try{
        await fs.mkdir(path.join(source,'build/assets'),{recursive:true});await fs.mkdir(path.join(source,'media'),{recursive:true});
        await fs.writeFile(path.join(source,'build/assets/app.js'),'example');await fs.writeFile(path.join(source,'media/preview.mp4'),'example');
        await fs.writeFile(path.join(source,'index.php'),'private PHP source');await fs.writeFile(path.join(source,'.env'),'private configuration');
        await fs.copyFile('public/favicon.svg',path.join(source,'favicon.svg'));
        await fs.cp('public/branding',path.join(source,'branding'),{recursive:true});
        await publishStaticAssets(source,output);
        const svgNames=await fs.readdir('public/branding');assert.equal(svgNames.length,10);
        for(const name of svgNames)assert.deepEqual(await fs.readFile(path.join(output,'branding',name)),await fs.readFile('public/branding/'+name));
        assert.equal(await fs.readFile(path.join(output,'build/assets/app.js'),'utf8'),'example');
        assert.equal(await fs.readFile(path.join(output,'media/preview.mp4'),'utf8'),'example');
        await assert.rejects(fs.stat(path.join(output,'index.php')),{code:'ENOENT'});await assert.rejects(fs.stat(path.join(output,'.env')),{code:'ENOENT'});
    }finally{await fs.rm(temporary,{recursive:true,force:true});}
});
