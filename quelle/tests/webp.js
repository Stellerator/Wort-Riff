// WebP-Kartensatz (Kartenbau seit 01.11.2026): ZIP einlesen, Bilder unverändert speichern, Runde zeigt sie.
// Braucht ../ausgabe/Franzoesisch_Lektion02.zip (node bauen.js daten/franzoesisch_aplus_unite1.json).
//   node tests/webp.js
const fs = require('fs');
const path = require('path');
const { oeffne, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const zip = path.join(ROOT, '..', 'ausgabe', 'Franzoesisch_Lektion02.zip');
  const t = await oeffne({ heute: '2026-11-01', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const accept = await page.$eval('#fDateien', e => e.accept);
  check('„Dateien wählen“ lässt WebP zu', /webp/.test(accept), accept);
  await (await page.$('#fZip')).uploadFile(zip);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 120000 });

  const b = await page.evaluate('IMP.bericht');
  check('83 Karten neu eingelesen', b.neu === 83, b);
  check('Nichts übersprungen, unvollständig oder fehlerhaft', b.ignoriert === 0 && b.unvollstaendig.length === 0 && b.fehler.length === 0 && b.ohneText.length === 0, b);
  const info = await page.evaluate(`(async () => {
    const L = S.lib.lessons.F02, r = await DB.get('img', 'F02_DE-FR_007_v');
    return { titel: L.titel, n: Object.keys(L.cards).length, text: L.hasText, typ: r.type, bytes: r.buf.byteLength, w: r.w };
  })()`);
  check('Lektion F02 „Unité 1“ mit Text', info.titel === 'Unité 1' && info.n === 83 && info.text, info);
  // Konjugationskarte (Nr. 83, "nurKarte"): nur umdrehen, auch wenn Tippen eingestellt ist; normale Karte bleibt Tipp-Karte
  const konj = await page.evaluate(`(() => { cur().set.modus = 'tippen';
    const r = { text: karteText('F02_DE-FR_083'), modus: modusFuer('F02_DE-FR_083').m, normal: modusFuer('F02_DE-FR_050').m,
      imQuiz: quizOptionen('F02_DE-FR_050').some(o => /alle Formen|^être$/.test(o) && o !== karteText('F02_DE-FR_050').antwort) };
    cur().set.modus = 'karten'; return r; })()`);
  check('Konjugationskarte ohne Quiz/Tippen, andere Karten mit', konj.text === null && konj.modus === 'karten' && konj.normal === 'tippen' && !konj.imQuiz, konj);
  // Vergleich mit der Datei im Kartenordner: gleiche Bytezahl = unverändert übernommen
  const datei = path.join(ROOT, '..', 'ausgabe', 'Franzoesisch_Lektion02', 'Franzoesisch_Lektion02', 'DE-FR', 'F02_DE-FR_007_1-vorne.webp');
  check('Bild als WebP gespeichert, Bytes wie im Kartensatz', info.typ === 'image/webp' && info.bytes === fs.statSync(datei).size && info.w === 1500, { info, datei: fs.statSync(datei).size });

  await page.evaluate("cur().set.modus = 'karten'; cur().set.sp = 'fr'; window.P = neuesProjekt(cur(), { name: 'Unité 1', sp: 'fr', lessons: ['F02'], sets: ['DE-FR'], end: '2026-11-20', ziel: 3, ruhe: [] }); sichereJetzt();");
  await page.evaluate("gehe('start')"); await t.warte(300);
  await t.klick('[data-a="lernStart"]');
  await page.waitForSelector('#kb', { visible: true, timeout: 15000 });
  await t.warte(500);
  const bilder = await page.$$eval('#kb img', els => els.map(e => ({ ok: e.complete && e.naturalWidth > 0, w: e.naturalWidth })));
  check('Vorder- und Rückseite zeigen das WebP-Bild', bilder.length === 2 && bilder.every(x => x.ok && x.w === 1500), bilder);
  await t.bild('w5-webp-vorne');
  await t.klick('[data-a="umdrehen"]'); await t.warte(700);
  await t.bild('w6-webp-hinten');
  check('Keine Fehler im Browser', t.fehler.length === 0, t.fehler);
  console.log(`\nWebP: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
