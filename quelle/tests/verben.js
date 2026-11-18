// Verbkarten (Kartensatz VERB, Dateien E01_VERB_V01_1-vorne.png): einlesen, in der Bibliothek zeigen, als Umdreh-Karte lernen.
// Braucht den gebauten Satz ../ausgabe/Englisch_Unit01 (mit 5_Verben und lektion.json).
//   node tests/verben.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const kdir = path.join(ROOT, '..', 'ausgabe', 'Englisch_Unit01', 'Englisch_Unit01');
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const dateien = [...dateienIn(path.join(kdir, '5_Verben')), ...dateienIn(path.join(kdir, '1_DE-EN'), /_00[12]_/), path.join(kdir, 'lektion.json')];
  await (await page.$('#fDateien')).uploadFile(...dateien);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 90000 });

  const b = await page.evaluate('IMP.bericht');
  check('15 Verbkarten + 2 Vokabelkarten neu eingelesen', b.neu === 17, b);
  check('Nichts übersprungen, nichts unvollständig, keine Fehler', b.ignoriert === 0 && b.unvollstaendig.length === 0 && b.fehler.length === 0, b);
  const lib = await page.evaluate(`(() => {
    const L = S.lib.lessons.E01, v = Object.keys(L.cards).filter(c => L.cards[c].satz === 'VERB');
    cur().set.modus = 'tippen';
    return { n: v.length, cid1: L.cards['E01_VERB_V1'], cid15: L.cards['E01_VERB_V15'], hatText: L.hasText,
      text: karteText('E01_VERB_V1'), modus: modusFuer('E01_VERB_V1').m, modusVokabel: modusFuer('E01_DE-EN_001').m,
      reihe: kartenListe(L).map(c => c.cid), satzListe: satzListe(['E01']) };
  })()`);
  check('15 Karten im Satz VERB', lib.n === 15, lib);
  check('Verbkarte V1: Nr. 1001, keine Bildkarte', lib.cid1 && lib.cid1.nr === 1001 && lib.cid1.bild === false && lib.cid15.nr === 1015, lib);
  check('Verbkarte hat keinen Text-Modus, bleibt Umdreh-Karte auch bei „Tippen“', lib.text === null && lib.modus === 'karten', lib);
  check('Vokabelkarte hat bei „Tippen“ weiter Text-Modus', lib.modusVokabel === 'tippen', lib);
  check('Verben stehen nach den Vokabeln', lib.reihe[0].indexOf('E01_DE-EN_') === 0 && lib.reihe[lib.reihe.length - 1] === 'E01_VERB_V15', lib.reihe);
  check('Kartenart „VERB“ wählbar', lib.satzListe.indexOf('VERB') >= 0 && lib.satzListe.indexOf('DE-EN') >= 0, lib.satzListe);
  const chips = await page.$$eval('.lk .sets .chip', els => els.map(e => e.textContent.trim()));
  check('Bibliothek zeigt „VERB · 15“', chips.some(c => /VERB\s*·\s*15/.test(c)), chips);
  await t.bild('v0-bibliothek-verben');

  // Projekt nur mit Verben: Runde spielen
  await page.evaluate("cur().set.modus = 'karten'; window.P = neuesProjekt(cur(), { name: 'Verben', sp: 'en', lessons: ['E01'], sets: ['VERB'], end: '2026-11-02', ziel: 3, ruhe: [] }); sichereJetzt();");
  check('Projekt mit Verben: 15 Karten', (await page.evaluate('projektKarten(P).length')) === 15);
  await page.evaluate("gehe('start')"); await t.warte(300);
  await t.klick('[data-a="lernStart"]');
  await page.waitForSelector('#kb', { visible: true, timeout: 15000 });
  await t.warte(500);
  const r = await page.evaluate('({ cid: LS.cid, modus: LS.modus, n: LS.gesamt })');
  check('Runde startet mit Verbkarte im Karten-Modus', /^E01_VERB_V\d+$/.test(r.cid) && r.modus === 'karten' && r.n > 0, r);
  const bilder = await page.$$eval('#kb img', els => els.map(e => ({ ok: e.complete && e.naturalWidth > 0, w: e.naturalWidth })));
  check('Vorder- und Rückseite zeigen ein Bild', bilder.length === 2 && bilder.every(x => x.ok), bilder);
  await t.bild('v1-verbkarte-vorne');
  await t.klick('[data-a="umdrehen"]'); await t.warte(700);
  await t.bild('v2-verbkarte-hinten');
  await t.klick('[data-a="antwort"][data-v="2"]'); await t.warte(500);
  const nach = await page.evaluate(`({ n: (cur().cards['${r.cid}'] || {}).n, fertig: LS ? LS.fertig : null })`);
  check('Antwort wird verbucht', nach.n >= 1, nach);
  check('Keine Fehler im Browser', t.fehler.length === 0, t.fehler);
  console.log(`\nVerbkarten: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
