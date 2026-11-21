// Riff-Bilder zum Ansehen der Effekte: node tests/riffbild.js [tag|nacht] [Sekunden] [Name]
const { oeffne } = require('./fahrer');
(async () => {
  const zeit = process.argv[2] || 'tag', sek = Number(process.argv[3] || 6), name = process.argv[4] || ('riffbild-' + zeit);
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 900;
    ['finn', 'mimo', 'nixi', 'knips', 'wobbel', 'pip', 'knurr', 'stella', 'okko'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
    ['leuchtturm', 'laterne', 'blasen', 'hoehle', 'kelp', 'truhe', 'ball', 'reifen', 'seegras', 'anemone'].forEach(d => { u.deko[d] = 1; });
    window.stelle = (kind, ref, x, y) => { const it = riffSetze(kind, ref); it.x = x; it.y = y; return it; };
    stelle('deko', 'leuchtturm', 82, 88); stelle('deko', 'laterne', 52, 62); stelle('deko', 'blasen', 20, 92); stelle('deko', 'hoehle', 36, 93); stelle('deko', 'kelp', 66, 94);
    stelle('deko', 'truhe', 10, 94); stelle('deko', 'ball', 46, 93); stelle('deko', 'reifen', 62, 92); stelle('deko', 'anemone', 95, 94); stelle('deko', 'seegras', 28, 94);
    stelle('fig', 'finn', 28, 50); stelle('fig', 'mimo', 60, 56); stelle('fig', 'nixi', 44, 40); stelle('fig', 'knips', 40, 86); stelle('fig', 'wobbel', 80, 44); stelle('fig', 'pip', 16, 66);
    stelle('myth', 'kristall', 58, 90);
    u.riff.zeit = '${zeit}'; sichere(); gehe('riff'); })()`);
  await t.warte(sek * 1000);
  await t.bild(name);
  console.log('Bild:', name, t.fehler.length ? t.fehler : '');
  await t.ende();
})();
