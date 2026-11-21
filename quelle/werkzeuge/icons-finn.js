// Zeichnet App-Symbole mit Finn Flosse (Hai) als Entwürfe und eine Vorschau (so sieht es auf dem iPad aus).
//   node werkzeuge/icons-finn.js [Zielordner]      (Standard: icons-finn/)   – Edge wird über tests/_edge.js gestartet
//   Umgebungsvariable NUR=A  zeichnet nur Entwurf A (Standard: AB)
// Die Figuren und das Riff-Zubehör kommen aus dem Quelltext der App (ART.figur, DEKO), die Schrift (Fredoka) aus src/fonts.
const fs = require('fs');
const path = require('path');
const { starte } = require('../tests/_edge');

const ROOT = path.join(__dirname, '..');
const ZIEL = process.argv[2] || path.join(ROOT, 'icons-finn');
const js = fs.readdirSync(path.join(ROOT, 'src', 'js')).filter(f => /^0[0-9][a-z]?-/.test(f) && f <= '06z').sort()
  .map(f => fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8')).join('\n');
const fredoka = fs.readFileSync(path.join(ROOT, 'src', 'fonts', 'fredoka-latin-700-normal.woff2')).toString('base64');

// läuft im Browser: baut die SVG-Texte der Entwürfe (Leinwand 1024 × 1024)
function entwuerfe() {
  const NAVY = '#14253F';
  const strahlen = (cx, cy, n, fill, op, R) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a0 = i * 2 * Math.PI / n, a1 = a0 + Math.PI / n;
      s += `<path d="M${cx} ${cy}L${(cx + R * Math.cos(a0)).toFixed(1)} ${(cy + R * Math.sin(a0)).toFixed(1)}L${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}Z"/>`;
    }
    return `<g fill="${fill}" fill-opacity="${op}">${s}</g>`;
  };
  const funkel = (x, y, r, fill = '#FFE98A', strich = NAVY) => `<path transform="translate(${x} ${y}) scale(${r})" d="M0 -1C.12 -.3 .3 -.12 1 0C.3 .12 .12 .3 0 1C-.12 .3 -.3 .12 -1 0C-.3 -.12 -.12 -.3 0 -1Z" fill="${fill}" stroke="${strich}" stroke-width=".11" stroke-linejoin="round"/>`;
  const blase = (x, y, r, buchstabe, deckend = .26) => `<g>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="${deckend}"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="${(r * .09).toFixed(1)}"/>
    <path d="M${(x - r * .64).toFixed(1)} ${(y - r * .06).toFixed(1)}A${(r * .66).toFixed(1)} ${(r * .66).toFixed(1)} 0 0 1 ${(x - r * .06).toFixed(1)} ${(y - r * .64).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(r * .1).toFixed(1)}" stroke-linecap="round"/>
    ${buchstabe ? `<text x="${x}" y="${(y + r * .36).toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${(r * 1.1).toFixed(0)}" fill="#fff" stroke="${NAVY}" stroke-width="${(r * .1).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${buchstabe}</text>` : ''}</g>`;
  const wurzel = (inhalt) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%">${inhalt}</svg>`;
  const klein = (svg, vb, w) => svg.replace(/<svg[^>]*>/, `<svg viewBox="${vb}" width="${w}" height="${w}">`);
  const deko = (id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${klein(DEKO[id].svg, '0 0 120 120', 120)}</g>`;

  // ---------- A: Finn Flosse, freundlich und groß, mit Riff-Boden ----------
  const finn1 = klein(ART.figur('hai', PAL.blau, null, 'finn', 1), '0 0 200 200', 200);
  const A = wurzel(`
    <defs>
      <linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6BE6F1"/><stop offset=".5" stop-color="#20A9D8"/><stop offset="1" stop-color="#0B3F8E"/></linearGradient>
      <radialGradient id="gloA" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".55" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="vigA" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#03204A" stop-opacity="0"/><stop offset="1" stop-color="#03204A" stop-opacity=".5"/></radialGradient>
      <linearGradient id="sandA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFEBB8"/><stop offset="1" stop-color="#EDB96C"/></linearGradient>
      <filter id="stickA" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius="13" result="dil"/>
        <feFlood flood-color="#FFFFFF" result="wf"/><feComposite in="wf" in2="dil" operator="in" result="rand"/>
        <feGaussianBlur in="dil" stdDeviation="16" result="unsch"/><feOffset in="unsch" dy="20" result="sho"/>
        <feFlood flood-color="#03204A" flood-opacity=".5" result="sf"/><feComposite in="sf" in2="sho" operator="in" result="schatten"/>
        <feMerge><feMergeNode in="schatten"/><feMergeNode in="rand"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="1024" height="1024" fill="url(#bgA)"/>
    ${strahlen(512, 560, 14, '#fff', .11, 1500)}
    <circle cx="512" cy="560" r="560" fill="url(#gloA)"/>
    <rect width="1024" height="1024" fill="url(#vigA)"/>
    ${blase(910, 470, 34)}${blase(112, 470, 30)}${blase(335, 118, 26)}${blase(945, 740, 34)}${blase(76, 700, 24)}${blase(655, 70, 22)}
    ${blase(812, 205, 106, 'A')}${blase(222, 240, 84, 'é')}
    ${deko('seegras', 118, 770, 1.7)}${deko('faecher', 6, 765, 1.6)}
    ${deko('hirn', 742, 840, 1.25)}${deko('rotkoralle', 826, 748, 1.6)}
    <path d="M0 950C140 915 290 968 470 944C650 920 810 968 1024 930L1024 1024L0 1024Z" fill="url(#sandA)"/>
    <path d="M0 950C140 915 290 968 470 944C650 920 810 968 1024 930" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>
    <g transform="rotate(-6 512 545)"><g filter="url(#stickA)"><g transform="translate(112 150) scale(4)">${finn1}</g></g>
      ${funkel(440, 693, 30, '#fff', '#fff')}</g>
    ${funkel(618, 128, 44)}${funkel(140, 470, 32)}${funkel(950, 600, 38)}${funkel(60, 330, 22)}`);

  // ---------- B: Sturmflosse, die starke Form (Stufe 3) ----------
  const finn3 = klein(ART.figur('hai', PAL.blau, null, 'finn', 3), '-12 -12 224 224', 224);
  const B = wurzel(`
    <defs>
      <linearGradient id="bgB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B1F8F"/><stop offset=".42" stop-color="#1673C8"/><stop offset="1" stop-color="#062F5E"/></linearGradient>
      <radialGradient id="gloB" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6B8" stop-opacity=".95"/><stop offset=".45" stop-color="#FFC83D" stop-opacity=".4"/><stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></radialGradient>
      <radialGradient id="vigB" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#021633" stop-opacity="0"/><stop offset="1" stop-color="#021633" stop-opacity=".55"/></radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bgB)"/>
    ${strahlen(512, 520, 18, '#FFE27A', .14, 1500)}
    <circle cx="512" cy="520" r="540" fill="url(#gloB)"/>
    <rect width="1024" height="1024" fill="url(#vigB)"/>
    ${blase(105, 600, 30)}${blase(930, 560, 34)}${blase(640, 972, 26)}${blase(150, 900, 22)}
    <g transform="translate(-4 24) scale(4.6)">${finn3}</g>
    ${funkel(512, 70, 34)}`);
  return { A, B };
}

(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await starte();
  const p = await b.newPage();
  p.on('pageerror', e => console.log('Seitenfehler:', e.message));
  await p.setContent(`<!doctype html><meta charset="utf-8"><style>@font-face{font-family:Fredoka;font-weight:700;src:url(data:font/woff2;base64,${fredoka}) format('woff2')}html,body{margin:0;overflow:hidden}</style><body><div id="ic" style="width:100vw;height:100vh"></div><script>${js}</script>`);
  await p.evaluate(() => document.fonts.load('700 100px Fredoka'));
  const svgs = await p.evaluate(entwuerfe);
  const zeige = async (html, w, h, datei) => {
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.evaluate(h2 => { document.getElementById('ic').innerHTML = h2; }, html);
    await p.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 120));
    await p.screenshot({ path: datei });
  };
  const nur = (process.env.NUR || 'AB').split('');
  for (const v of nur) {
    for (const g of [1024, 512, 192, 180]) {
      const datei = path.join(ZIEL, `finn_${v}_${g}.png`);
      await zeige(svgs[v], g, g, datei);
      console.log(path.basename(datei));
    }
  }
  // Vorschau: wie auf dem iPad (abgerundet, in mehreren Größen auf einem Hintergrund)
  const zelle = (svg, px) => `<div style="width:${px}px;height:${px}px;border-radius:22.4%;overflow:hidden;box-shadow:0 ${px / 20}px ${px / 8}px rgba(0,0,0,.4);flex:none">${svg}</div>`;
  const reihe = v => `<div style="display:flex;align-items:flex-end;gap:30px"><div style="width:60px;color:#fff;font:700 40px Fredoka,Arial">${v}</div>${[300, 152, 120, 76, 60].map(s => zelle(svgs[v], s)).join('')}</div>`;
  await zeige(`<div style="box-sizing:border-box;width:100%;height:100%;padding:36px;background:linear-gradient(160deg,#6f8fc0,#2b4170 70%);display:flex;flex-direction:column;gap:36px">${nur.map(reihe).join('')}</div>`, 1180, nur.length * 336 + 40, path.join(ZIEL, 'vorschau.png'));
  console.log('vorschau.png');
  if (process.env.UEBERNEHMEN) {                                   // UEBERNEHMEN=A  → Entwurf A wird das Symbol der Web-App (repo-icons/)
    const v = process.env.UEBERNEHMEN, rz = path.join(ROOT, 'repo-icons');
    for (const g of [180, 192, 512]) fs.copyFileSync(path.join(ZIEL, `finn_${v}_${g}.png`), path.join(rz, `icon-${g}.png`));
    fs.copyFileSync(path.join(ZIEL, `finn_${v}_1024.png`), path.join(rz, 'icon-finn-1024.png'));
    console.log('Übernommen in repo-icons/: Entwurf ' + v);
  }
  await b.close();
})();
