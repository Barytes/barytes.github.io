import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const build=()=>spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
function signature(dir){return fs.readdirSync(dir).sort().map(f=>{const p=path.join(dir,f),s=fs.statSync(p);return s.isDirectory()?signature(p):`${p}:${s.mtimeMs}:${s.size}`;}).join('|');}
const snapshot=()=>['src','content','public','scripts/build.mjs'].map(p=>fs.statSync(p).isDirectory()?signature(p):fs.statSync(p).mtimeMs).join('|');
build();
await import('./serve.mjs');
let previous=snapshot();
setInterval(()=>{const current=snapshot();if(current!==previous){previous=current;build();}},750);
console.log('Watching content and source files. Refresh your browser after edits.');
