// Baut das komplette Repo (genau das, was bei GitHub liegen soll) und packt es in eine ZIP-Datei.
//   node repo-bauen.js
//   →  ..\Wortriff_Repo\      Webseite (index.html, sw.js, Manifest, Symbole, version.json), karten\ (Pakete + index.json), quelle\ (Quellcode, Tests, Werkzeuge), LIESMICH.md
//   →  ..\Wortriff_Repo.zip   dasselbe als eine Datei
// Kartenpakete kommen aus repo-karten\ (dort ablegen oder mit werkzeuge\karten-vorbereiten.ps1 aus ..\ausgabe\ erzeugen).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { bauen } = require('./bauen.js');

const ROOT = __dirname;
const AUS = path.join(ROOT, '..', 'Wortriff_Repo');
const ZIPDATEI = path.join(ROOT, '..', 'Wortriff_Repo.zip');
const rd = p => fs.readFileSync(path.join(ROOT, p));
const sha1 = b => crypto.createHash('sha1').update(b).digest('hex');
const gitSha = b => sha1(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b]));           // wie „git hash-object“, gleiche Kennung wie die GitHub-Verzeichnisliste
const fail = m => { console.error('FEHLER: ' + m); process.exit(1); };
const SPRACHE = { en: 'Englisch', fr: 'Französisch' };

// ---------- ZIP lesen (nur Verzeichnis, für den Kartenindex) ----------
function zipEintraege(buf) {
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('kein ZIP');
  const total = buf.readUInt16LE(e + 10);
  const out = [];
  for (let p = buf.readUInt32LE(e + 16), k = 0; k < total; k++) {
    const nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32);
    out.push({ name: buf.toString('utf8', p + 46, p + 46 + nl), methode: buf.readUInt16LE(p + 10), csize: buf.readUInt32LE(p + 20), lho: buf.readUInt32LE(p + 42) });
    p += 46 + nl + el + cl;
  }
  return out;
}
function zipDaten(buf, en) {
  const s = en.lho + 30 + buf.readUInt16LE(en.lho + 26) + buf.readUInt16LE(en.lho + 28), raw = buf.subarray(s, s + en.csize);
  return en.methode === 0 ? raw : zlib.inflateRawSync(raw);
}
const KARTE_RE = /([EF])(\d{2})_([A-Za-z]{2,5}(?:-[A-Za-z]{2,3})?)_([BV]?\d{1,3})_([12])-(vorne|hinten)/i;
function paketInfo(datei, buf) {
  const eintraege = zipEintraege(buf);
  const zaehl = {};
  eintraege.forEach(en => { if (!/\.(webp|png|jpe?g)$/i.test(en.name)) return; const m = KARTE_RE.exec(en.name); if (m) { const k = m[1].toUpperCase() + m[2]; zaehl[k] = (zaehl[k] || 0) + 1; } });
  const titel = {};
  eintraege.filter(en => /(^|\/)lektion\.json$/i.test(en.name)).forEach(en => { try { const j = JSON.parse(zipDaten(buf, en).toString('utf8')); if (j.praefix) titel[j.praefix] = j; } catch (e) { /* ohne Titel */ } });
  const keys = Array.from(new Set(Object.keys(zaehl).concat(Object.keys(titel)))).sort();
  const lektionen = keys.map(k => { const j = titel[k] || {}; return { key: k, titel: j.titel || k, sprache: j.sprache || (k[0] === 'E' ? 'en' : 'fr'), buch: j.buch || '', karten: Math.floor((zaehl[k] || 0) / 2) }; });
  const name = lektionen.map(l => [SPRACHE[l.sprache] || l.sprache, l.buch, l.titel].filter(Boolean).join(' · ')).join(' + ') || datei.replace(/\.zip$/i, '').replace(/_/g, ' ');
  return { datei, bytes: buf.length, sha: gitSha(buf), name, lektionen };
}

const { zipSchreiben } = require('./werkzeuge/zipschreiben.js');

// ---------- Dateien sammeln ----------
const dateien = new Map();                                       // Pfad im Repo → Buffer
const setze = (p, b) => dateien.set(p.replace(/\\/g, '/'), Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf8'));
function baum(dir, basis, filter) {                              // Ordner rekursiv übernehmen
  const wurzel = path.join(ROOT, dir);
  if (!fs.existsSync(wurzel)) return;
  (function lauf(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name), r = rel ? rel + '/' + e.name : e.name;
      if (filter && !filter(r, e)) continue;
      if (e.isDirectory()) lauf(p, r); else setze(basis + '/' + r, fs.readFileSync(p));
    }
  })(wurzel, '');
}

// Version: Kennung stabil halten, wenn sich nichts geändert hat (Datum bleibt dann gleich)
let altStand = null;
try { altStand = JSON.parse(fs.readFileSync(path.join(AUS, 'version.json'), 'utf8')); } catch (e) { /* erster Bau */ }
let app = bauen({ web: true });
if (altStand && altStand.id === app.id) app = bauen({ web: true, stand: altStand.stand });
const versionstext = `${app.version}-${app.id}`;

// Webseite
setze('index.html', app.html);
setze('.nojekyll', '');
['icon-180.png', 'icon-192.png', 'icon-512.png'].forEach(n => { const p = path.join(ROOT, 'repo-icons', n); if (!fs.existsSync(p)) fail('Symbol fehlt: repo-icons/' + n + ' (node werkzeuge/icons.js)'); setze(n, fs.readFileSync(p)); });
setze('manifest.webmanifest', JSON.stringify({
  name: 'Wortriff', short_name: 'Wortriff', description: 'Vokabeln lernen im Meer der Wörter', start_url: './', scope: './', display: 'standalone', orientation: 'any', lang: 'de',
  background_color: '#9CE5E8', theme_color: '#7CD0E4',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2));
setze('version.json', JSON.stringify({ id: app.id, version: app.version, stand: app.stand }));
const vorcache = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
setze('sw.js', rd('repo-vorlage/sw.template.js').toString('utf8').replace('__VERSION__', versionstext).replace('__FILES__', JSON.stringify(vorcache)));

// Kartenpakete
const pakete = [];
const kartenDir = path.join(ROOT, 'repo-karten');
if (fs.existsSync(kartenDir)) {
  for (const n of fs.readdirSync(kartenDir).filter(f => /\.zip$/i.test(f)).sort()) {
    const buf = fs.readFileSync(path.join(kartenDir, n));
    try { pakete.push(paketInfo(n, buf)); setze('karten/' + n, buf); } catch (e) { console.warn('  übersprungen (kein gültiges ZIP): ' + n); }
  }
}
setze('karten/index.json', JSON.stringify({ format: 1, erstellt: new Date().toISOString(), pakete }, null, 2));
setze('karten/LIESMICH.txt', 'Hier liegen die Kartenpakete (ZIP-Dateien aus dem Kartenbau).\nNeue ZIP-Datei hochladen: Die App findet sie beim nächsten Update von selbst.\nDie Datei index.json wird beim Bauen erzeugt (repo-bauen.js) und beschreibt die Pakete.\n');

// Quellcode, Werkzeuge, Tests
baum('src', 'quelle/src');
['bauen.js', 'repo-bauen.js', 'package.json', 'README.md'].forEach(n => { if (fs.existsSync(path.join(ROOT, n))) setze('quelle/' + n, fs.readFileSync(path.join(ROOT, n))); });
baum('werkzeuge', 'quelle/werkzeuge');
baum('repo-vorlage', 'quelle/repo-vorlage');
baum('repo-icons', 'quelle/repo-icons');
baum('tests', 'quelle/tests', (r, e) => !(e.isDirectory() ? /^(bilder|_tmp)$/.test(e.name) : /\.(png|jpe?g|webp|zip)$/i.test(e.name)));

// LIESMICH
const vorlage = fs.existsSync(path.join(ROOT, 'repo-vorlage', 'LIESMICH.md')) ? rd('repo-vorlage/LIESMICH.md').toString('utf8') : '# Wortriff\n';
const mb = b => (b / 1048576).toFixed(1).replace('.', ',');
const liste = pakete.map(p => `- ${p.name} (${p.datei}, ${mb(p.bytes)} MB, ${p.lektionen.reduce((a, l) => a + l.karten, 0)} Karten)`).join('\n') || '- (noch keine)';
const anzahl = dateien.size + (dateien.has('LIESMICH.md') ? 0 : 1);                                    // die LIESMICH selbst kommt gleich dazu
const ohneQuelle = Array.from(dateien.keys()).filter(k => !k.startsWith('quelle/') && k !== 'LIESMICH.md').length + 1;
const groesste = Array.from(dateien.entries()).sort((a, b) => b[1].length - a[1].length)[0];
setze('LIESMICH.md', vorlage.replace(/\{\{VERSION\}\}/g, app.version).replace(/\{\{ID\}\}/g, app.id).replace(/\{\{STAND\}\}/g, app.stand).replace(/\{\{PAKETE\}\}/g, liste)
  .replace(/\{\{DATEIEN\}\}/g, String(anzahl)).replace(/\{\{OHNEQUELLE\}\}/g, String(ohneQuelle)).replace(/\{\{GROESSTE\}\}/g, groesste ? `${groesste[0]} (${mb(groesste[1].length)} MB)` : '-'));

// ---------- schreiben ----------
fs.mkdirSync(AUS, { recursive: true });
for (const n of fs.readdirSync(AUS)) if (n !== '.git') fs.rmSync(path.join(AUS, n), { recursive: true, force: true });
const sortiert = new Map(Array.from(dateien.entries()).sort((a, b) => a[0].localeCompare(b[0])));
for (const [k, v] of sortiert) { const p = path.join(AUS, k); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, v); }
zipSchreiben(sortiert, ZIPDATEI);
const kb = Math.round(Array.from(dateien.values()).reduce((a, b) => a + b.length, 0) / 1024);
console.log(`Repo gebaut: ${AUS}\n  ${dateien.size} Dateien, ${kb} KB (Kennung ${app.id}, Stand ${app.stand}), ${pakete.length} Kartenpakete\nZIP: ${ZIPDATEI}  (${Math.round(fs.statSync(ZIPDATEI).size / 1024)} KB)`);
pakete.forEach(p => console.log(`  karten/${p.datei}: ${p.name}, ${p.lektionen.map(l => l.key + ' ' + l.karten + ' Karten').join(', ')}`));
