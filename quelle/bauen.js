// Baut die Lern-App "Wortriff" als EINE HTML-Datei aus src/ (style.css, index.html, js/*.js) und den Schriften in src/fonts/.
//   node bauen.js            -> Wortriff_<VERSION>.html im Ordner app/ (lokale Einzeldatei, läuft auch ohne Netz)
//   node repo-bauen.js       -> komplettes Repo (Webseite, Service Worker, Kartenpakete, Quellen) + ZIP, siehe repo-bauen.js
// Nie die erzeugte HTML-Datei von Hand ändern, immer in src/ arbeiten und neu bauen.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VERSION = 'V03';                 // V03 (18.11.2026): Repo/Home-Bildschirm-App mit Update, Karten aus dem Repo, lebendiges Riff
const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

const FONTS = [
  ['inter', 'inter-latin-400-normal.woff2', 400], ['inter', 'inter-latin-600-normal.woff2', 600],
  ['inter', 'inter-latin-800-normal.woff2', 800],
  ['fredoka', 'fredoka-latin-500-normal.woff2', 500], ['fredoka', 'fredoka-latin-600-normal.woff2', 600],
  ['fredoka', 'fredoka-latin-700-normal.woff2', 700]
];
const schriftDatei = file => {                         // erst src/fonts (liegt im Repo), sonst der Entwicklungsordner ../node_modules
  const a = path.join(SRC, 'fonts', file), b = path.join(ROOT, '..', 'node_modules', '@fontsource', file.split('-')[0], 'files', file);
  return fs.existsSync(a) ? a : b;
};

function bauen(opt = {}) {
  const fontDaten = FONTS.map(([fam, file, weight]) => ({ fam, weight, buf: fs.readFileSync(schriftDatei(file)) }));
  const fonts = fontDaten.map(f => `@font-face{font-family:'${f.fam === 'inter' ? 'Inter' : 'Fredoka'}';font-weight:${f.weight};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,${f.buf.toString('base64')}) format('woff2')}`).join('\n');
  const jsDir = path.join(SRC, 'js');
  const js = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort()
    .map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
  const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');
  const vorlage = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  // Kennung = Inhalts-Hash: ändert sich nur, wenn sich wirklich etwas ändert (daran erkennt die Installation, dass es eine neue Fassung gibt)
  const h = crypto.createHash('sha1');
  fontDaten.forEach(f => h.update(f.buf)); h.update(css); h.update(js); h.update(vorlage); h.update(VERSION); h.update(opt.web ? 'web' : 'lokal');
  const id = h.digest('hex').slice(0, 7);
  const jetzt = new Date();
  const stand = opt.stand || `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}-${String(jetzt.getDate()).padStart(2, '0')} ${String(jetzt.getHours()).padStart(2, '0')}:${String(jetzt.getMinutes()).padStart(2, '0')}`;
  const pwa = opt.web ? '<meta name="apple-mobile-web-app-title" content="Wortriff">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">' : '';
  const html = vorlage.replace('<!--PWA-->', () => pwa).replace('/*FONTS*/', () => fonts).replace('/*CSS*/', () => css)
    .replace('/*JS*/', () => `const APP_VERSION = '${VERSION}', APP_BUILD = '${stand}', APP_ID = '${id}';\n` + js);
  return { html, id, stand, version: VERSION, kb: { html: Math.round(Buffer.byteLength(html) / 1024), js: Math.round(js.length / 1024), css: Math.round(css.length / 1024) } };
}

if (require.main === module) {
  const r = bauen();
  const out = path.join(ROOT, `Wortriff_${VERSION}.html`);
  fs.writeFileSync(out, r.html, 'utf8');
  console.log(`${out}  (${r.kb.html} KB, JS ${r.kb.js} KB, CSS ${r.kb.css} KB, Kennung ${r.id})`);
}
module.exports = { bauen, VERSION };
