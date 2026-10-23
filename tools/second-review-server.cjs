/* Servidor de QA com dados sintéticos. Nunca grava no banco principal. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'na-review-2-ui-'));
process.env.NA_DATA_DIR=dir;process.env.PORT='3103';process.env.HOST='127.0.0.1';
process.on('exit',()=>{if(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(dir).startsWith('na-review-2-ui-'))fs.rmSync(dir,{recursive:true,force:true});});
require('./second-review-fixtures.cjs')(dir);
console.log('QA usa diretório temporário independente.');
require('../server/index');
