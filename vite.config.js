import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import fs from 'node:fs';
const pages=JSON.parse(fs.readFileSync(new URL('./resources/assets.json',import.meta.url),'utf8'));
export default defineConfig({plugins:[
 {name:'classic-page-boundaries',resolveId(id){if(id.startsWith('virtual:page:'))return '\0'+id;},load(id){if(!id.startsWith('\0virtual:page:'))return;const page=pages[id.slice('\0virtual:page:'.length)];for(const file of page.scripts)this.addWatchFile(file);return page.scripts.map(file=>'\n/* '+file+' */\n'+fs.readFileSync(file,'utf8')).join('\n;\n');}},
 laravel({input:['resources/css/brand.css','resources/js/chat/entry.js',...new Set(Object.values(pages).flatMap(p=>[...p.styles,p.entry]))],refresh:['resources/views/**','resources/js/**','resources/css/**']})
],build:{target:'es2022'}});
