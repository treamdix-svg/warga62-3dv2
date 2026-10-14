// Server preview lokal (hanya 127.0.0.1) untuk folder dist/ hasil build. Tanpa token, tanpa koneksi VPS.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 5180);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2' };
http.createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const full = path.resolve(root, '.' + (rel === '/' ? '/index.html' : rel));
    if (full !== root && !full.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!(await stat(full)).isFile()) throw 0;
    res.writeHead(200, { 'Content-Type': mime[path.extname(full)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(full));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Warga +62 3D siap: http://localhost:${port}`));
