import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,`.${pathname}`);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
  if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});res.end();return;}
  file=path.join(file,'index.html');
 }
 let status=200;if(!fs.existsSync(file)){file=path.join(root,'404.html');status=404;}
 res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT)||4321,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4321'));
