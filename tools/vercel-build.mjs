import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {downloadRelease} from './download-release.mjs';
import {setDefaultResultOrder} from 'node:dns';
import os from 'node:os';
import path from 'node:path';
setDefaultResultOrder('ipv4first');
const command=(bin,args)=>{const result=spawnSync(bin,args,{stdio:'inherit',shell:process.platform==='win32'});if(result.status!==0)throw Error('Falha no build: '+bin);};
command('npm',['run','build']);
if(process.argv.includes('--function')){
  if(process.platform!=='linux'||process.arch!=='x64')throw Error('O pacote de implantação exige Linux x64.');
  const release=JSON.parse(await fs.readFile(new URL('./ffprobe-release.json',import.meta.url),'utf8'));
  const work=await fs.mkdtemp(path.join(os.tmpdir(),'na-ffprobe-'));
  const archive=path.join(work,'ffprobe.tar.xz');
  try {
    await downloadRelease(release.url,archive);
    const hash=createHash('sha256');for await(const chunk of createReadStream(archive))hash.update(chunk);
    if(hash.digest('hex')!==release.sha256)throw Error('Checksum do FFprobe divergente.');
    await fs.mkdir('bin',{recursive:true});command('tar',['-xJf',archive,'-C',work]);
    const source=path.join(work,'ffmpeg-'+release.version);
    const run=(bin,args)=>{const result=spawnSync(bin,args,{cwd:source,stdio:'inherit'});if(result.status!==0)throw Error('Falha ao compilar FFprobe: '+bin);};
    run('./configure',['--disable-all','--disable-autodetect','--disable-network','--disable-x86asm','--disable-doc','--disable-debug','--disable-gpl','--disable-nonfree','--enable-ffprobe','--enable-avformat','--enable-avcodec','--enable-avutil','--enable-protocol=file,pipe','--enable-demuxer=mov,matroska,mp3,wav,ogg','--enable-parser=aac,h264,hevc,mpegaudio,opus,vorbis','--enable-decoder=aac,mp3,h264,hevc,vorbis,opus,pcm_s16le,pcm_s24le,pcm_s32le,pcm_f32le']);
    run('make',['-j2','ffprobe']);
    await fs.copyFile(path.join(source,'ffprobe'),'bin/ffprobe');
    await fs.copyFile(path.join(source,'COPYING.LGPLv2.1'),'bin/COPYING.LGPLv2.1');
    await fs.chmod('bin/ffprobe',0o755);
    const probe=spawnSync('bin/ffprobe',['-version'],{encoding:'utf8'});if(probe.status!==0)throw Error('FFprobe não pode ser executado.');
    // O binário independente é LGPL; os avisos, a licença e a referência ao código-fonte acompanham a implantação.
    await fs.copyFile('docs/licenses/ffprobe-NOTICE.txt','bin/ffprobe-NOTICE.txt');
  }finally{await fs.rm(work,{recursive:true,force:true});}
}else{
  // Somente assets estáticos são publicados. Nunca copie public/index.php ou a raiz do projeto.
  await fs.mkdir('dist/build',{recursive:true});await fs.cp('public/build','dist/build',{recursive:true});await fs.copyFile('public/favicon.svg','dist/favicon.svg');
}
