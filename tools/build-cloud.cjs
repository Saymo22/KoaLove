const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'public/js/vendor'),{recursive:true});
require('../server/node_modules/esbuild').buildSync({
  stdin:{contents:"import {upload} from '@vercel/blob/client'; window.NABlob={upload};",resolveDir:path.join(root,'server'),sourcefile:'blob-client.js'},
  outfile:path.join(root,'public/js/vendor/vercel-blob.js'),bundle:true,platform:'browser',format:'iife',minify:true,
  banner:{js:'/* Vercel Blob SDK — Apache-2.0; licença em vercel-blob.LICENSE.txt. */'}
});
fs.copyFileSync(path.join(root,'server/node_modules/@vercel/blob/license.md'),path.join(root,'public/js/vendor/vercel-blob.LICENSE.txt'));
console.log('Upload privado preparado para o navegador.');
