// Riff-Erweiterungen: Kacheln kaufen (Preise, Tiefenzone, Perlen), scrollbare Welt, Übersicht, Ziehen bis an den Rand.
//   node tests/riff_welt.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const geo = () => page.evaluate(`(() => { var w = document.querySelector('#riffwrap'), b = document.querySelector('#buehne'); return { wc: w.clientWidth, wh: w.clientHeight, sw: w.scrollWidth, sh: w.scrollHeight, sl: Math.round(w.scrollLeft), st: Math.round(w.scrollTop), bw: Math.round(b.getBoundingClientRect().width), bh: Math.round(b.getBoundingClientRect().height), u: RIFF.u, v: RIFF.v }; })()`);

  // 1) Ohne Erweiterung wie bisher; Zone gesperrt
  await page.evaluate("neuerNutzer('Mia', 'finn'); cur().perlen = 130; gehe('riff');");
  await t.warte(300);
  let g = await geo();
  check('Start: nichts zu scrollen', g.sw <= g.wc + 1 && g.sh <= g.wh + 1, g);
  check('Start: Welt 1 × 1', (await page.evaluate('JSON.stringify(riffWelt(cur()))')).includes('"cols":1,"rows":1'));
  check('Start: keine Übersicht-Taste', !(await page.$('[data-a="riffAlles"]')));
  await t.klick('[data-a="riffWeiter"]');
  check('Sheet: Tiefe gesperrt (Zone nicht erreicht)', await page.$eval('[data-a="riffKaufen"][data-v="d"]', e => e.disabled));
  check('Sheet: Links erlaubt mit 130 Perlen', !(await page.$eval('[data-a="riffKaufen"][data-v="l"]', e => e.disabled)));
  check('Sheet: Hinweis zur Zone', (await page.$eval('.blatt', e => e.textContent)).includes('Erst ab 10 m'));
  await t.klick('[data-a="riffKaufen"][data-v="r"]');
  check('Kauf rechts: 120 Perlen abgezogen', (await page.evaluate('cur().perlen')) === 10 && (await page.evaluate('riffExt(cur()).r')) === 1);
  check('Sheet bleibt offen, nächster Preis 200', (await page.$eval('[data-a="riffKaufen"][data-v="l"]', e => e.textContent)).includes('200'));
  check('Ohne genug Perlen gesperrt', await page.$eval('[data-a="riffKaufen"][data-v="l"]', e => e.disabled));
  await t.klick('[data-a="blattZu"]');
  await t.warte(300);
  g = await geo();
  check('Welt 2 × 1: doppelt so breit, scrollt waagrecht', g.sw > g.wc * 1.5 && g.sh <= g.wh + 1, g);
  check('Übersicht-Taste erscheint', !!(await page.$('[data-a="riffAlles"]')));

  // 2) Alle Richtungen
  await page.evaluate("var uu = cur(); uu.perlen = 5000; uu.tiefeMax = 120; render();");
  await t.klick('[data-a="riffWeiter"]');
  const preise = [];
  for (const k of ['l', 'd']) { preise.push(await page.evaluate(`riffPreis(cur())`)); await t.klick(`[data-a="riffKaufen"][data-v="${k}"]`); }
  check('Preise steigen 200 → 320', preise[0] === 200 && preise[1] === 320, preise);
  check('Perlen: 5000 − 200 − 320', (await page.evaluate('cur().perlen')) === 4480);
  await page.evaluate("var uu = cur(); riffExt(uu).d = 2; riffExt(uu).r = 2; riffExt(uu).l = 2; render();");   // Welt 5 × 3
  await t.klick('[data-a="blattZu"]').catch(() => {});
  await page.evaluate('RIFF.scroll = null; schliesseBlatt(); gehe("riff");');
  await t.warte(300);
  g = await geo();
  check('Welt 5 × 3: Breite und Höhe', Math.abs(g.sw - (5 * 100 * g.u + 12)) < 3 && Math.abs(g.sh - (3 * 100 * g.v + 12)) < 3, g);
  check('Start bei der Start-Kachel (2 Spalten Abstand)', Math.abs(g.sl - 200 * g.u) < 3 && g.st === 0, g);
  check('Preis nach 6 Käufen', (await page.evaluate('riffPreis(cur())')) === 500 + 200 * (6 - 4 + 1), await page.evaluate('riffPreis(cur())'));

  // 3) Dinge in der ganzen Welt, Hintergrund prüfen
  await page.evaluate(`var uu = cur(); uu.owned.mimo = { n: 1, stern: 1, ts: 1, neu: false };
    [['fig','finn',-150,90],['fig','mimo',250,95],['deko','seegras',60,240],['deko','truhe',-120,290],['deko','anker',340,195],['deko','laterne',150,150],['deko','bogen',-30,40]].forEach(([k,r,x,y]) => { const i = riffSetze(k, r); i.x = x; i.y = y; });
    sichere(); render();`);
  await t.warte(400);
  await t.bild('w1-start');
  await page.evaluate("var w = document.querySelector('#riffwrap'); w.scrollTo(0, w.scrollHeight);"); await t.warte(250);
  await t.bild('w2-unten-links');
  await page.evaluate("var w = document.querySelector('#riffwrap'); w.scrollTo(w.scrollWidth, w.scrollHeight);"); await t.warte(250);
  await t.bild('w3-unten-rechts');
  check('Scroll-Stand wird gemerkt (nach Neuaufbau)', await (async () => { await page.evaluate('render()'); await t.warte(200); const a = await geo(); return a.sl > 0 && a.st > 0; })());
  await t.klick('[data-a="riffAlles"]'); await t.warte(300);
  g = await geo();
  check('Übersicht: alles sichtbar, kein Scrollen', g.sw <= g.wc + 1 && g.sh <= g.wh + 1 && g.bw <= g.wc && g.bh <= g.wh, g);
  await t.bild('w4-uebersicht');
  await t.klick('[data-a="riffAlles"]'); await t.warte(300);

  // 4) Neues Stück erscheint im sichtbaren Ausschnitt
  await page.evaluate("var w = document.querySelector('#riffwrap'); w.scrollTo(w.scrollWidth, 0);"); await t.warte(250);
  await page.evaluate("var uu = cur(); uu.deko.hirn = 1; sichere(); render();"); await t.warte(250);
  await page.click('.rtile'); await t.warte(300);
  const sicht = await page.evaluate(`(() => { const it = cur().riff.items[cur().riff.items.length - 1], el = document.querySelector('.ritem[data-id="' + it.id + '"]'), r = el.getBoundingClientRect(), w = document.querySelector('#riffwrap').getBoundingClientRect(); return { x: it.x, y: it.y, im: r.left >= w.left - 2 && r.right <= w.right + 2 && r.bottom <= w.bottom + 2 && r.bottom > w.top }; })()`);
  check('Neues Stück liegt im sichtbaren Ausschnitt', sicht.im, sicht);

  // 5) Ziehen bis an den Rand scrollt mit, Position darf in die Weite
  await page.evaluate("var w = document.querySelector('#riffwrap'); w.scrollTo(0, 0);"); await t.warte(250);
  await page.evaluate(`var uu = cur(); uu.riff.items = []; var i = riffSetze('deko', 'seegras'); i.x = -150; i.y = 80; window.__zi = i.id; sichere(); render();`); await t.warte(300);
  await page.evaluate("var w = document.querySelector('#riffwrap'); w.scrollTo(0, 0);"); await t.warte(250);
  const box = await (await page.$(`.ritem[data-id="${await page.evaluate('window.__zi')}"]`)).boundingBox();
  const wb = await (await page.$('#riffwrap')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let s = 1; s <= 12; s++) await page.mouse.move(box.x + box.width / 2 + (wb.x + wb.width - 20 - box.x - box.width / 2) * s / 12, box.y + box.height / 2);
  await t.warte(900);
  await page.mouse.up(); await t.warte(300);
  const nach = await page.evaluate(`({ x: cur().riff.items.find(i => i.id === window.__zi).x, sl: document.querySelector('#riffwrap').scrollLeft })`);
  check('Ziehen am Rand: Ansicht scrollt mit, Stück wandert weit nach rechts', nach.sl > 150 && nach.x > -60, nach);
  // Mausziehen auf leerem Wasser verschiebt die Ansicht
  await page.evaluate("document.querySelector('#riffwrap').scrollTo(300, 0)"); await t.warte(150);
  await page.mouse.move(wb.x + 400, wb.y + 130); await page.mouse.down(); await page.mouse.move(wb.x + 300, wb.y + 90, { steps: 5 }); await page.mouse.up(); await t.warte(150);
  const pn = await geo();
  check('Maus-Ziehen auf Wasser scrollt', Math.abs(pn.sl - 400) < 12 && pn.st > 20, pn);

  // 6) Alter Stand ohne ext
  await page.evaluate("delete cur().riff.ext; render();"); await t.warte(250);
  g = await geo();
  check('Alter Stand ohne ext: 1 × 1', g.sw <= g.wc + 1 && g.sh <= g.wh + 1, g);
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  await t.ende();
  console.log(`\nRiff-Welt: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
