/* Valida bytes reais e abre o conteúdo com decodificadores locais. */
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const probe = promisify(execFile);
const sharp = require('sharp');
const aliases = {'audio/x-wav':'audio/wav','audio/wave':'audio/wav','audio/x-m4a':'audio/mp4','video/x-m4v':'video/mp4'};
const canonical = mime => aliases[mime] || mime;
function invalid() {return Object.assign(new Error('Arquivo inválido, corrompido ou incompatível com o formato informado. Selecione outro arquivo.'),{status:415,code:'INVALID_MEDIA_CONTENT'});}
async function validateMedia(target, declared, kind) {
  const {fileTypeFromFile} = await import('file-type');
  let detected;
  try {detected = await fileTypeFromFile(target);} catch {throw invalid();}
  if(!detected) throw invalid();
  const actual = canonical(detected.mime), expected = canonical(declared);
  const sameContainer = expected === 'audio/mp4' && actual === 'video/mp4' || expected === 'audio/webm' && actual === 'video/webm';
  if(actual !== expected && !sameContainer) throw invalid();
  try {
    if(kind === 'photo') {
      // Limita descompressão; percorre os pixels, não apenas o cabeçalho.
      await sharp(target,{limitInputPixels:40_000_000,failOn:'warning'}).raw().toBuffer();
    } else {
      const {stdout} = await probe(require('@ffprobe-installer/ffprobe').path,
        ['-v','error','-protocol_whitelist','file,pipe','-format_whitelist','mov,mp4,m4a,3gp,3g2,mj2,matroska,webm,mp3,wav,ogg','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',target],
        {timeout:15000,maxBuffer:256*1024,windowsHide:true});
      const info = JSON.parse(stdout), type = kind === 'video' ? 'video' : 'audio';
      const allowed = type === 'video' ? ['h264','hevc','vp8','vp9','av1','mpeg4','mjpeg'] : ['mp3','aac','vorbis','opus','flac','alac','pcm_u8','pcm_s16le','pcm_s24le','pcm_s32le','pcm_f32le','pcm_f64le'];
      if(!info.streams?.some(s => s.codec_type === type && allowed.includes(s.codec_name))) throw invalid();
      if(info.format?.duration !== undefined && !(Number(info.format.duration) > 0)) throw invalid();
    }
  } catch(err) {
    if(err.code === 'ENOENT') throw Object.assign(new Error('Validação de mídia indisponível no servidor.'),{status:503,code:'MEDIA_VALIDATOR_UNAVAILABLE'});
    throw invalid();
  }
}
module.exports = {validateMedia};
