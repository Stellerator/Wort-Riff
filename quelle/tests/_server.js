// Kleiner Testserver, der sich wie GitHub Pages verhält (Cache-Control: max-age=600), Ordner und Fehlermodus sind umschaltbar.
const http = require('http');
const fs = require('fs');
const path = require('path');

const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.zip': 'application/zip', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

function starteServer(wurzel, port) {
  const st = { wurzel, aus: false, zugriffe: [], extra: new Map() };           // extra: Pfad → Buffer (zusätzliche/ersetzte Dateien im Speicher)
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const p = decodeURIComponent(u.pathname);
    st.zugriffe.push(p);
    if (st.aus) { res.writeHead(503); res.end('offline'); return; }
    let daten = st.extra.get(p);
    if (!daten) {
      let f = path.join(st.wurzel, p);
      if (!f.startsWith(path.resolve(st.wurzel))) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); res.end('nicht gefunden'); return; }
      daten = fs.readFileSync(f);
      res.setHeader('Content-Type', TYPEN[path.extname(f).toLowerCase()] || 'application/octet-stream');
    } else res.setHeader('Content-Type', TYPEN[(path.extname(p) || (p.endsWith('/') ? '.html' : '')).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'max-age=600');
    res.setHeader('Content-Length', daten.length);
    res.end(daten);
  });
  return new Promise(res => srv.listen(port || 0, '127.0.0.1', () => { st.port = srv.address().port; st.url = `http://127.0.0.1:${st.port}/`; st.ende = () => new Promise(r => srv.close(r)); res(st); }));
}
module.exports = { starteServer };
