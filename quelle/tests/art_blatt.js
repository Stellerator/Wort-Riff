// Zeichnet ein Kontaktblatt der Meerwesen (Arten, Zubehör, Katalog) als PNG zum Anschauen.
//   node tests/art_blatt.js <ausgabe.png> [arten|katalog|deko|abzeichen|evo]
const fs = require('fs');
const path = require('path');
const { starte } = require('./_edge');

const modus = process.argv[3] || 'arten';
const nurArten = (process.argv[4] || '').split(',').filter(Boolean), zellGroesse = Number(process.argv[5]) || 250;
const out = process.argv[2] || path.join(__dirname, 'blatt.png');
const js = fs.readdirSync(path.join(__dirname, '..', 'src', 'js')).filter(f => /^0[0-9][a-z]?-/.test(f) && f <= '06z').sort()
  .map(f => fs.readFileSync(path.join(__dirname, '..', 'src', 'js', f), 'utf8')).join('\n');

(async () => {
  const b = await starte();
  const p = await b.newPage();
  await p.setViewport({ width: 1500, height: 900, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('Seitenfehler:', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('Konsole:', m.text()); });
  await p.setContent(`<!doctype html><body style="margin:0;background:linear-gradient(#CFF3F8,#8BD3E6);font:14px sans-serif"><div id=g style="display:flex;flex-wrap:wrap;gap:6px;padding:10px"></div><script>${js}</script>`);
  await p.evaluate((m, nur, gr) => {
    const g = document.getElementById('g');
    const cell = (svg, label, w = 170) => { const d = document.createElement('div'); d.style.cssText = `width:${w}px;text-align:center;color:#0C2B4B`; d.innerHTML = `<div style="width:${w}px;height:${w}px">${svg.replace('<svg', `<svg width="${w}" height="${w}"`)}</div>${label}`; g.appendChild(d); };
    if (m === 'arten') {
      const pal = { m: '#4FA3D8', d: '#2D78B0', b: '#E8F6FF', a: '#FFC83D' };
      ART.arten.forEach((a, i) => cell(ART.figur(a, pal, ART.zubehoer[i % ART.zubehoer.length], a), a + ' + ' + ART.zubehoer[i % ART.zubehoer.length]));
      ART.zubehoer.forEach(z => cell(ART.figur('hai', pal, z, 'hai'), 'hai + ' + z));
    } else if (m === 'katalog') {
      Object.values(FIG).forEach(f => cell(figSvg(f.id), f.name + ' ·' + f.rar, 150));
    } else if (m === 'evo' && nur.length && nur[0] !== 'alle') {
      Object.values(FIG).filter(f => nur.includes(f.art) || nur.includes(f.id)).forEach(f => [1, 2, 3].forEach(st => cell(figSvg(f.id, st), figName(f.id, st), gr)));
    } else if (m === 'evo') {
      const gesehen = {};
      Object.values(FIG).forEach(f => { if (gesehen[f.art]) return; gesehen[f.art] = 1; [1, 2, 3].forEach(st => cell(figSvg(f.id, st), figName(f.id, st), gr || 150)); });
      ['knurr', 'aurelia', 'lenni', 'nero', 'mimo', 'glimmer'].forEach(id => [1, 2, 3].forEach(st => cell(figSvg(id, st), figName(id, st), 150)));
    } else if (m === 'deko') {
      Object.values(DEKO).forEach(d => cell(dekoSvg(d.id), d.name, 150));
    } else if (m === 'mythen') {
      Object.values(MYTH).forEach(d => cell(mythSvg(d.id), d.name, gr || 230));
    } else if (m === 'abzeichen') {
      Object.values(BADGES).forEach(d => cell(badgeSvg(d.id, true), d.name, 150));
    }
  }, modus, nurArten, zellGroesse);
  await new Promise(r => setTimeout(r, 300));
  const h = await p.evaluate(() => document.body.scrollHeight);
  await p.setViewport({ width: 1500, height: Math.min(h + 20, 4000) });
  await p.screenshot({ path: out });
  console.log('Blatt:', out);
  await b.close();
})();
