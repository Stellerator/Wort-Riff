// Echtes Ziehen & Ablegen eines ORDNERS auf die Bibliothek (Chromium-Drag-Ereignisse über das DevTools-Protokoll).
//   node tests/ablegen.js
const path = require('path');
const { oeffne, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const box = await (await page.$('#ablage')).boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const client = await page.createCDPSession();
  const ordner = [path.join(ROOT, '..', 'ausgabe', 'Test', 'Englisch_Unit04'), path.join(ROOT, '..', 'ausgabe', 'Test', 'Franzoesisch_Lektion01')];
  const data = { items: [], files: ordner, dragOperationsMask: 1 };
  await client.send('Input.dispatchDragEvent', { type: 'dragEnter', x, y, data });
  await client.send('Input.dispatchDragEvent', { type: 'dragOver', x, y, data });
  check('Ablage leuchtet beim Darüberziehen', await page.$eval('#ablage', e => e.classList.contains('drin')));
  await t.bild('d1-ueber-ablage');
  await client.send('Input.dispatchDragEvent', { type: 'drop', x, y, data });
  await page.waitForFunction('IMP.bericht || IMP.laeuft', { timeout: 20000 });
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  const b = await page.evaluate('IMP.bericht');
  check('Zwei Ordner gezogen: 7 Karten, 2 Lektionen, Text erkannt', b.neu === 7 && b.lektionen.length === 2 && b.ohneText.length === 0 && b.fehler.length === 0, b);
  await t.bild('d2-nach-ablegen');
  // iPad-Verhalten nachgestellt: der Ordner erscheint als leere „Datei“ ohne Endung und der Ordner-Eintrag antwortet nie
  await page.evaluate("IMP.bericht = null; S.lib.lessons = {}; render();");
  const t0 = Date.now();
  await page.evaluate(`(() => {
    const haengt = { isDirectory: true, isFile: false, name: 'Englisch_Unit04', createReader: () => ({ readEntries: () => { /* antwortet nie */ } }) };
    const d = { entries: [haengt], flach: [new File([], 'Englisch_Unit04')], diag: { items: ['file//Ordner Englisch_Unit04'], dateien: ['Englisch_Unit04 (0 B, -)'] } };
    impStart(() => dateienAusDrop(d));
  })()`);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 30000 });
  const sek = (Date.now() - t0) / 1000;
  const b2 = await page.evaluate('IMP.bericht');
  check('iPad-Ordner: bricht nach Zeitlimit ab (nicht endlos)', sek < 15, sek);
  check('iPad-Ordner: Bericht erkennt den Ordner und nennt den Ausweg', b2.ordner === true && b2.neu === 0 && /ZIP/.test(await page.$eval('.bericht', e => e.textContent)), b2);
  check('iPad-Ordner: Technische Info vorhanden', !!(await page.$('.bericht details')));
  await t.bild('d3-ipad-ordner-hinweis');
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  console.log(`\nAblegen: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
