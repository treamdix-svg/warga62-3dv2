// Static preview hanya untuk komputer lokal, tanpa token dan tanpa koneksi VPS.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5180);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try {
  const relative=decodeURIComponent(new URL(req.url||'/',`http://localhost:${port}`).pathname);
  const requested=relative==='/'?'/index.html':relative;
  const full=path.resolve(root,'.'+requested);
  if(full!==root&&!full.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  const s=await stat(full);
  if(!s.isFile()){res.writeHead(404);return res.end('Not found');}
  const content=await readFile(full);
  res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(content);
 } catch(err){res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Warga +62 3D siap: http://localhost:${port}`));
