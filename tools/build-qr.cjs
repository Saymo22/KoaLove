const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'server/node_modules/qrcode');
fs.mkdirSync(path.join(root,'public/js/vendor'),{recursive:true});
require('../server/node_modules/esbuild').buildSync({entryPoints:[path.join(source,'lib/browser.js')],
  outfile:path.join(root,'public/js/vendor/qrcode.js'),bundle:true,platform:'browser',format:'iife',globalName:'NAQRCode',minify:true,
  banner:{js:'/* node-qrcode — MIT; licença em qrcode.LICENSE.txt. Gerado por tools/build-qr.cjs. */'}});
fs.copyFileSync(path.join(source,'license'),path.join(root,'public/js/vendor/qrcode.LICENSE.txt'));
