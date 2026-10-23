const fs=require('node:fs'),path=require('node:path');
const source=path.dirname(require.resolve('qrcode/package.json'));
require('esbuild').buildSync({entryPoints:[path.join(source,'lib/browser.js')],outfile:'resources/js/vendor/qrcode.js',bundle:true,platform:'browser',format:'iife',globalName:'NAQRCode',minify:true,banner:{js:'/* node-qrcode 1.5.4 — MIT; licença em docs/licenses/qrcode.LICENSE.txt. Gerado por tools/build-qr.cjs. */'}});
fs.copyFileSync(path.join(source,'license'),'docs/licenses/qrcode.LICENSE.txt');
