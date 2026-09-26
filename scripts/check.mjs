import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
let count=0;const failures=[];
function walk(dir){for(const f of fs.readdirSync(dir)){const file=path.join(dir,f);if(fs.statSync(file).isDirectory())walk(file);else if(f.endsWith('.html')){
 count++;const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  let target=match[1];if(/^(https?:|mailto:|data:)/.test(target))continue;
  if(base&&!target.startsWith(base+'/')){failures.push(`${file}: missing base path in ${target}`);continue;}
  if(base)target=target.slice(base.length);
  const dest=path.join(root,target);if(!fs.existsSync(dest))failures.push(`${file}: missing ${target}`);
 }
 if(!html.includes('<h1>')||!html.includes('<title>'))failures.push(`${file}: missing page heading/title`);
}}}walk(root);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log(`Checked ${count} HTML pages: all local links and assets resolve.`);
