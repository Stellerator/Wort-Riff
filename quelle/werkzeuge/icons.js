// Erste Fassung der App-Symbole (Home-Bildschirm) mit dem Maskottchen Flo (Seepferdchen), gespeichert als PNG.
// Seit V03 ist das Symbol Finn Flosse (werkzeuge/icons-finn.js); die Flo-Symbole liegen in icons-archiv/flo/.
//   node werkzeuge/icons.js [Zielordner]      (Standard: icons-archiv/flo/, damit repo-icons/ nicht überschrieben wird)   – Edge wird über tests/_edge.js gestartet
const fs = require('fs');
const path = require('path');
const { starte } = require('../tests/_edge');

const ROOT = path.join(__dirname, '..');
const ZIEL = process.argv[2] || path.join(ROOT, 'icons-archiv', 'flo');
const js = fs.readdirSync(path.join(ROOT, 'src', 'js')).filter(f => /^0[0-9]-/.test(f) && f <= '06z').sort()
  .map(f => fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8')).join('\n');

(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await starte();
  const p = await b.newPage();
  p.on('pageerror', e => console.log('Seitenfehler:', e.message));
  await p.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;overflow:hidden"><div id="ic"></div><script>${js}</script>`);
  await p.evaluate(() => {
    const flo = ART.figur('seepferd', PAL.tuerkis, 'maske', 'flo', 1);
    const blase = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="${o}" stroke="#fff" stroke-opacity="${Math.min(1, o + .25)}" stroke-width="${Math.max(1.5, r * .12)}"/><path d="M${x - r * .5} ${y - r * .1} a${r * .55} ${r * .55} 0 0 1 ${r * .45} ${-r * .45}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="${Math.max(1.5, r * .12)}" stroke-linecap="round"/>`;
    document.getElementById('ic').innerHTML = `<svg viewBox="0 0 512 512" width="100%" height="100%" style="display:block;width:100vw;height:100vh" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A5EEF6"/><stop offset=".55" stop-color="#2FB3C9"/><stop offset="1" stop-color="#0E5F9E"/></linearGradient>
      <radialGradient id="g" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <rect width="512" height="512" fill="url(#w)"/>
      <path d="M70 0 L170 0 L330 512 L190 512Z" fill="#fff" fill-opacity=".10"/><path d="M250 0 L300 0 L470 512 L400 512Z" fill="#fff" fill-opacity=".08"/>
      <circle cx="256" cy="230" r="215" fill="url(#g)"/>
      ${blase(86, 420, 26, .16)}${blase(118, 350, 14, .2)}${blase(420, 130, 30, .16)}${blase(452, 214, 15, .2)}${blase(66, 150, 12, .2)}${blase(436, 400, 20, .16)}
      <g transform="translate(44 40) scale(1.9)">${flo.replace(/<svg[^>]*>/, '<svg viewBox="0 0 200 200" width="200" height="200">')}</g>
      <path d="M0 470 C90 440 170 500 260 470 C350 440 430 490 512 464 L512 512 L0 512Z" fill="#F6E3B4" fill-opacity=".9"/>
    </svg>`;
  });
  for (const [name, size] of [['icon-180.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await p.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await p.screenshot({ path: path.join(ZIEL, name) });
    console.log(name, size);
  }
  await b.close();
})();
