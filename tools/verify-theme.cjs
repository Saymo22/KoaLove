// Executar com: node tools/verify-theme.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}
async function main() {
  await require('./test-theme-persistence.cjs')();
  require('./test-exclusive-helpers.cjs')();
  // Exercita a ponte do formulário sem depender de autenticação ou mídia externa.
  const creator = fs.readFileSync(path.join(publicRoot, 'js/pages/criar.js'), 'utf8');
  const fields = Object.fromEntries(['titulo', 'de', 'para', 'inicio', 'carta', 'frase',
    'musicaNome', 'musicaArtista', 'rodapeCustom', 'fotoCapa', 'autoplay', 'usarIntro'].map(id => [id, { value: '', checked: false }]));
  const messages = [];
  let frame = null;
  const classes = new Set();
  fields.previewScroll = {
    classList: { toggle(key, active) { active ? classes.add(key) : classes.delete(key); } },
    append(element) { frame = element; },
  };
  fields.previewDots = { hidden: false };
  const listeners = {};
  const scope = vm.createContext({
    THEMES: {},
    $: id => fields[id], fotoURLs: ['blob:foto'], videoURLs: ['blob:video'], musicaPreviewURL: 'blob:musica',
    location: { origin: 'http://localhost' },
    document: {
      querySelectorAll() { return []; },
      createElement() { return { contentWindow: { postMessage(data) { messages.push(data); } },
        setAttribute() {}, addEventListener() {}, remove() { frame = null; } }; },
    },
    window: { addEventListener(name, callback) { listeners[name] = callback; } },
  });
  vm.runInContext(fs.readFileSync(path.join(publicRoot, 'js/core/theme-catalog.js'), 'utf8'), scope);
  const bridge = creator.slice(creator.indexOf('let themePreviewFrame = null;'),
    creator.indexOf('function renderPreviewPadrao'));
  vm.runInContext(bridge, scope);
  vm.runInContext("atualizarPreviewTema('namoro')", scope);
  assert.equal(frame.src, 'teste/namoro.html?embed=1');
  assert.ok(classes.has('preview-tema'));
  assert.equal(messages.at(-1).payload.cover, 'blob:foto');
  assert.equal(messages.at(-1).payload.music, 'blob:musica');
  fields.de.value = 'Ana'; fields.para.value = 'Bia'; fields.carta.value = 'Nossa carta';
  vm.runInContext('enviarPreviewTema()', scope);
  assert.equal(messages.at(-1).payload.p.de, 'Ana');
  assert.equal(messages.at(-1).payload.p.carta, 'Nossa carta');
  const before = messages.length;
  listeners.message({ origin: 'http://outro', source: frame.contentWindow,
    data: { type: 'NOSSO_AMOR_NAMORO_READY' } });
  assert.equal(messages.length, before);
  listeners.message({ origin: 'http://localhost', source: frame.contentWindow,
    data: { type: 'NOSSO_AMOR_NAMORO_READY' } });
  assert.equal(messages.length, before + 1);
  for(const key of Object.keys(scope.window.NA_THEME_FILES)){
    vm.runInContext(`atualizarPreviewTema(${JSON.stringify(key)})`,scope);
    assert.equal(frame.src,`teste/${key}.html?embed=1`);
    assert.equal(messages.at(-1).type,key==='namoro'?'NOSSO_AMOR_NAMORO_DATA':'NOSSO_AMOR_THEME_DATA');
  }
  vm.runInContext("atualizarPreviewTema('tema-inexistente')", scope);
  assert.equal(frame, null);
  assert.equal(fields.previewDots.hidden, false);
  assert.equal(classes.has('preview-tema'), false);
  const validate=require('../server/lib/validate');
  assert.equal(validate.themeData(null).ok,true);
  assert.equal(validate.themeData([]).ok,false);
  assert.equal(validate.themeData({bad:'x'.repeat(200001)}).ok,false);
  const input={amizade:{collections:{quiz:[{q:'Pergunta',opts:['A','B','C','D'],correct:2}]}}};
  assert.deepEqual(validate.themeData(input).value,input);
  const malicious=validate.themeData(JSON.parse('{"__proto__":{"polluted":true},"amizade":{"texts":{"1":"<script>teste</script>"}}}'));
  assert.equal(Object.hasOwn(malicious.value,'__proto__'),false);
  assert.equal({}.polluted,undefined);
  let links = 0;
  for (const file of files(publicRoot)) {
    const source = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.js')) new vm.Script(source, { filename: file });
    if (!file.endsWith('.html')) continue;
    for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const url = match[1];
      if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) continue;
      const relative = url.split(/[?#]/)[0];
      if (!relative) continue;
      const target = relative.startsWith('/')
        ? path.join(publicRoot, relative) : path.resolve(path.dirname(file), relative);
      assert.ok(fs.existsSync(target), `${path.relative(root, file)}: ${url}`);
      links++;
    }
  }
  const config = require('../server/config');
  assert.equal(config.FRONTEND_ROOT, publicRoot);
  const port = 3198;
  const server = spawn(process.execPath, ['server/index.js'], {
    cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  const mediaFixtures=[];
  server.stdout.on('data', data => { logs += data; });
  server.stderr.on('data', data => { logs += data; });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Servidor não iniciou: ' + logs)), 10000);
      server.once('error', error => { clearTimeout(timeout); reject(error); });
      server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Servidor encerrou (${code}): ${logs}`)); });
      server.stdout.on('data', () => {
        if (logs.includes('Servidor de testes rodando')) { clearTimeout(timeout); resolve(); }
      });
    });
    const urls=['/', '/criar.html', '/ver.html?demo=1&tema=namoro', '/admin/login.html',
      '/teste/namoro.html?embed=1', '/teste/namoro.css', '/teste/namoro.js',
      '/css/criar.css', '/js/pages/criar.js', '/js/pages/ver.js', '/api/config'];
    for(const key of Object.keys(scope.window.NA_THEME_FILES).filter(key=>key!=='namoro')){
      urls.push('/ver.html?demo=1&tema='+key,...['html','css','js'].map(ext=>'/teste/'+key+'.'+ext));
      const html=fs.readFileSync(path.join(publicRoot,'teste',key+'.html'),'utf8');
      assert.ok(!/<style\b|\sstyle=|\sonclick=/i.test(html),'CSS e JS separados: '+key);
      const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
      assert.equal(ids.length,new Set(ids).size,'IDs únicos: '+key);
    }
    for (const url of urls) {
      const response = await fetch(`http://127.0.0.1:${port}${url}`);
      assert.equal(response.status, 200, url);
      if (url === '/api/config') {
        const body = await response.json();
        assert.equal(body.ok, true);
        for(const key of Object.keys(scope.window.NA_THEME_FILES))assert.ok(body.data.themes[key],'Tema na API: '+key);
      }
    }
    for(const [extension,type] of [['wav','audio/wav'],['mp4','video/mp4']]){
      const file=path.join(publicRoot,'teste','__verify_theme_media.'+extension);
      assert.ok(file.startsWith(publicRoot+path.sep));assert.ok(!fs.existsSync(file),'Fixture já existe: '+file);
      const bytes=Buffer.from([0,1,2,3]);fs.writeFileSync(file,bytes);mediaFixtures.push(file);
      const response=await fetch(`http://127.0.0.1:${port}/teste/__verify_theme_media.${extension}`);
      assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),type);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
    }
    for (const url of ['/server/config.js', '/README.md', '/.git/config', '/public/criar.html']) {
      const response = await fetch(`http://127.0.0.1:${port}${url}`);
      assert.ok([403, 404].includes(response.status), url);
    }
    console.log(`OK: troca dos ${Object.keys(scope.window.NA_THEME_FILES).length} modelos, prévia dinâmica, validação dos detalhes, sintaxe JavaScript, ${links} referências locais, ${urls.length} rotas e 4 caminhos privados.`);
  } finally {
    server.kill();
    for(const file of mediaFixtures)fs.unlinkSync(file);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
