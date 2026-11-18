// Korallenfunken und Entwicklung im Browser: Album-Detail, Stern stärken, Entwicklungs-Animation, Muschel mit Entwicklung, Riff/Avatar zeigen die neue Form.
//   node tests/entwicklung.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const stufe = sel => page.$eval(sel, e => (e.querySelector('svg.fig') ? e.querySelector('svg.fig').getAttribute('class') : ''));

  await page.evaluate("neuerNutzer('Mia', 'finn'); cur().funken = 30; gehe('album');");
  await t.warte(400);
  check('Album zeigt Korallenfunken', (await page.$eval('.panel', e => e.textContent)).includes('30') && (await page.$eval('.panel', e => e.textContent)).includes('Korallenfunken'));
  await t.klick('[data-a="figDetail"][data-v="finn"]');
  check('Detail: drei Entwicklungsstufen', (await page.$$('.evoreihe .evostufe')).length === 3);
  check('Detail: nur Stufe 1 freigeschaltet', (await page.$$('.evoreihe .evostufe.da')).length === 1);
  check('Detail: Stern stärken kostet 5', (await page.$eval('[data-a="sternKaufen"]', e => e.textContent)).includes('5'));
  await t.bild('e1-detail-stufe1');

  await t.klick('[data-a="sternKaufen"]');                          // Stern 2: keine Entwicklung
  await t.warte(300);
  check('Stern 2: 5 Funken ausgegeben, noch Stufe 1', (await page.evaluate('cur().funken')) === 25 && (await page.evaluate('cur().owned.finn.stern')) === 2 && !(await page.$('.evoschleier')));
  check('Detail: nächster Stern kündigt Entwicklung an', (await page.$eval('.blatt', e => e.textContent)).includes('entwickelt er sich weiter'));

  await t.klick('[data-a="sternKaufen"]');                          // Stern 3: Entwicklung
  await t.warte(200);
  check('Entwicklung: Überblendung erscheint', !!(await page.$('.evoschleier')));
  await t.warte(1300);
  await t.bild('e2-entwicklung-glueht');
  await t.warte(1400);
  check('Entwicklung: neue Form erscheint', !!(await page.$('.evoschleier.fertig')) && (await page.$eval('#evoText', e => e.textContent)).includes('Wellenjäger'));
  check('Entwicklung: neue Gestalt ist Stufe 2', (await page.$eval('.evofig.neu svg', e => e.getAttribute('class'))).includes('s2'));
  await t.bild('e3-entwicklung-fertig');
  await t.warte(900);
  await t.klick('[data-a="evoZu"]');
  await t.warte(300);
  check('Danach: Detail zeigt Stufe 2 mit Beinamen', (await page.$eval('.blatt h2', e => e.textContent)).includes('Wellenjäger') && (await page.$$('.evoreihe .evostufe.da')).length === 2);
  check('10 Funken für Stern 3, Rest 15', (await page.evaluate('cur().funken')) === 15);
  check('Abzeichen „Erste Entwicklung“', await page.evaluate("!!cur().badges.evo1"));
  await t.bild('e4-detail-stufe2');
  await t.klick('[data-a="blattZu"]');
  await t.warte(300);

  check('Album-Kachel zeigt Stufe 2', (await stufe('.figkachel[data-v="finn"]')).includes('s2'));
  check('Kopfleiste (Profilbild) zeigt Stufe 2', (await stufe('.top .avatar')).includes('s2'));

  // Riff: größer und neue Form
  await page.evaluate("riffSetze('fig', 'finn'); gehe('riff');");
  await t.warte(400);
  check('Riff: Finn in Stufe 2 und etwas größer', (await stufe('.ritem.fig')).includes('s2') && (await page.evaluate("riffBasis(cur().riff.items[0])")) > 17 * 1.05);

  // Muschel mit Entwicklung (Ausgang der Ziehung vorgegeben)
  await page.evaluate(`const uu = cur(); uu.owned.finn.stern = 3; uu.owned.finn.n = 4; uu.muscheln.perl = 1;
    window.muschelOeffnen = () => { uu.muscheln.perl--; uu.owned.finn.stern = 5; return { id: 'finn', rar: 0, art: 'perl', neu: false, perlen: 4, funken: 2, sternNeu: 5, pity: false, abzeichen: [], stufeAlt: 2, stufeNeu: 3 }; };
    gehe('muschel', { phase: 'zu', art: 'perl' });`);
  await t.warte(300);
  await t.klick('#schale');
  await t.warte(900);
  check('Muschel: Figur erscheint zuerst in der alten Stufe', (await page.$eval('#fund svg', e => e.getAttribute('class'))).includes('s2'));
  await t.warte(2600);
  check('Muschel: Entwicklung startet von selbst', !!(await page.$('.evoschleier')));
  check('Muschel: Chips nennen Funken', (await page.$eval('#mInfo', e => e.textContent)).includes('+2 Korallenfunken'));
  await t.warte(2800);
  await t.bild('e5-muschel-stufe3');
  await t.klick('[data-a="evoZu"]');
  await t.warte(300);
  check('Muschel: danach steht Stufe 3 da, mit neuem Namen', (await page.$eval('#fund svg', e => e.getAttribute('class'))).includes('s3') && (await page.$eval('#mInfo .name', e => e.textContent)).includes('Sturmflosse'));

  // Alle Figuren in gemischten Stufen im Album und im Riff (Bilder zum Ansehen)
  await page.evaluate(`var ub = cur(); figIds().forEach((id, i) => { ub.owned[id] = { n: 5, stern: i % 3 === 0 ? 5 : i % 3 === 1 ? 3 : 1, ts: 1, neu: false }; });
    ub.riff.items = []; ub.riff.ext = { l: 0, r: 1, d: 0 };
    figIds().slice(0, 14).forEach((id, i) => { var it = riffSetze('fig', id); it.x = 10 + (i % 7) * 27; it.y = 62 + Math.floor(i / 7) * 34; });
    sichere(); gehe('album');`);
  await t.warte(500);
  check('Album zeigt Stufe 2 und 3', (await page.$$('.figkachel svg.s3')).length > 3 && (await page.$$('.figkachel svg.s2')).length > 3);
  await t.bild('e6-album-gemischt');
  await page.evaluate("RIFF.scroll = null; gehe('riff');");
  await t.warte(500);
  await t.bild('e7-riff-gemischt');
  await page.evaluate("RIFF.alles = true; render();");
  await t.warte(400);
  await t.bild('e8-riff-uebersicht');
  await page.evaluate("RIFF.alles = false;");
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  await t.ende();
  console.log(`\nEntwicklung: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
