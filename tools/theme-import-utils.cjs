const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function extract(folder, key) {
  const source = fs.readFileSync(path.join(process.env.USERPROFILE, '.codex/attachments', folder, 'Texto colado.txt'), 'utf8').replace(/\r\n/g, '\n');
  let css = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  let js = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
  let html = source.replace(/<style\b[^>]*>[\s\S]*?<\/style>|<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/onclick="document.getElementById\('([^']+)'\).scrollIntoView\(\{behavior:'smooth'\}\)"/g, 'data-na-scroll="$1"')
    .replace('</head>', `<link rel="stylesheet" href="${key}.css">\n<script src="../js/core/theme-runtime.js"></script>\n<script src="../js/core/exclusive-theme-runtime.js"></script>\n</head>`)
    .replace('</body>', `<script src="${key}.js"></script>\n</body>`);
  let i = 0;
  let actionIndex=0;
  html=html.replace(/\son([a-z]+)="([^"]*)"/gi,(_match,event,body)=>{const id=String(++actionIndex);js+='\ndocument.querySelectorAll(\'[data-na-action="'+id+'"]\').forEach(el=>el.addEventListener('+JSON.stringify(event)+',function(event){'+body+'}));\n';return ' data-na-action="'+id+'"';});
  html = html.replace(/<[a-z][^>]*\sstyle="[^"]*"[^>]*>/gi, tag => {
    const style = tag.match(/\sstyle="([^"]*)"/i)[1], cls = 'na-original-' + ++i;
    css += '\n:root body .' + cls + '{' + style + '}\n';
    tag = tag.replace(/\sstyle="[^"]*"/i, '');
    return /\bclass="/i.test(tag) ? tag.replace(/\bclass="/i, 'class="' + cls + ' ') : tag.replace(/^<([a-z][\w-]*)/i, '<$1 class="' + cls + '"');
  });
  return { html, css, js };
}
function wrapLoop(js, start, name, host) {
  const begin = js.indexOf(start), end = js.indexOf('\n});', begin) + 5;
  if (begin < 0 || end < 5) throw new Error('Loop ausente: ' + start);
  return js.slice(0, begin) + `function ${name}(){\n${host}.replaceChildren();\n` + js.slice(begin, end) + `\n}\n${name}();` + js.slice(end);
}
function replaceFunction(js, name, replacement) {
  const begin = js.indexOf('function ' + name + '('), end = js.indexOf('\n}', begin) + 2;
  if (begin < 0 || end < 2) throw new Error('Função ausente: ' + name);
  return js.slice(0, begin) + replacement + js.slice(end);
}
function write(key, files) {
  for (const [extension, value] of Object.entries(files)) fs.writeFileSync(path.join(root, 'public/teste', key + '.' + extension), value);
}
module.exports = { extract, wrapLoop, replaceFunction, write };
