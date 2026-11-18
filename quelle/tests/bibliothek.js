// Bibliothek-Randfälle: Lektion entfernen (Lernstand bleibt), neu einlesen, Sicherung speichern/laden, Nutzer wechseln/löschen.
//   node tests/bibliothek.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await page.evaluate(`(() => {
    const u = cur(); window.P = neuesProjekt(u, { name: 'KA', sp: 'en', lessons: ['E04'], sets: ['DE-EN', 'EN-DE', 'EXTRA', 'BILD'], end: '2026-11-02', ziel: 3, ruhe: [] });
    bewerte(u, 'E04_DE-EN_011', 3); sichereJetzt();
  })()`);
  const vorher = await page.evaluate('({ n: Object.keys(cur().cards).length, keys: 0 })');
  check('Lernstand vorhanden', vorher.n === 1, vorher);

  // Lektion entfernen (über die Oberfläche)
  await t.klick('.lk.sp-en [data-a="lektionWeg"]');
  await t.warte(200);
  await t.bild('b1-entfernen-frage');
  await t.klick('[data-a="lektionWegJa"]');
  await t.warte(400);
  const nach = await page.evaluate(`(async () => ({ lekt: Object.keys(S.lib.lessons), imgE: (await DB.keys('img')).filter(k => k.indexOf('E04_') === 0).length, imgF: (await DB.keys('img')).filter(k => k.indexOf('F01_') === 0).length, cards: Object.keys(cur().cards).length, projLekt: P.lessons, n: projektKarten(P).length }))()`);
  check('E04 entfernt, F01 bleibt', nach.lekt.length === 1 && nach.lekt[0] === 'F01' && nach.imgE === 0 && nach.imgF === 6, nach);
  check('Lernstand und Projektzuordnung bleiben', nach.cards === 1 && nach.projLekt[0] === 'E04' && nach.n === 0, nach);
  await page.evaluate("gehe('start')"); await t.warte(300);
  await t.bild('b2-hafen-ohne-karten');
  check('Hafen ohne Karten: Knopf gesperrt, kein Absturz', await page.$eval('[data-a="lernStart"]', e => e.disabled));

  // Wieder einlesen: Fortschritt knüpft an
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test', 'Englisch_Unit04')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht && IMP.bericht.neu > 0', { timeout: 60000 });
  const wieder = await page.evaluate("({ n: projektKarten(P).length, b: cur().cards['E04_DE-EN_011'].b, st: stand(cur(), P) })");
  check('Neu einlesen: Karten wieder da, Lernstand erhalten', wieder.n === 4 && wieder.b >= 2, wieder);

  // Sicherung
  const sicherung = await page.evaluate(`(async () => {
    const json = JSON.stringify({ app: 'wortriff', format: 1, zustand: S });
    const user = cur().name; cur().xp = 99999; await sichereJetzt();
    await sicherungLaden(new File([json], 'x.json'));
    return { xp: cur().xp, user, name: cur().name };
  })()`);
  check('Sicherung laden stellt alten Zustand her', sicherung.xp < 99999 && sicherung.name === 'Mia', sicherung);
  let fehlerMeldung = '';
  try { await page.evaluate("sicherungLaden(new File(['{\"a\":1}'], 'kaputt.json'))"); } catch (e) { fehlerMeldung = e.message; }
  check('Falsche Sicherungsdatei wird abgelehnt', /keine Wortriff-Sicherung/.test(fehlerMeldung), fehlerMeldung);

  // Zweiter Nutzer, Wechsel, Löschen
  await page.evaluate("neuerNutzer('Ben', 'pip'); start(true);");
  await t.warte(300);
  const zwei = await page.evaluate('({ n: Object.keys(S.users).length, cur: cur().name, cards: Object.keys(cur().cards).length })');
  check('Zweiter Nutzer hat eigenen (leeren) Lernstand', zwei.n === 2 && zwei.cur === 'Ben' && zwei.cards === 0, zwei);
  await t.klick('[data-a="nav"][data-v="ich"]');
  await t.klick('[data-a="nutzerLoeschen"]'); await t.warte(200);
  await t.bild('b3-nutzer-loeschen');
  await t.klick('[data-a="nutzerLoeschenJa"]'); await t.warte(400);
  check('Nach Löschen: Profilwahl mit Mia', !!(await page.$('.ptile[data-a="waehleNutzer"]')) && (await page.evaluate('Object.keys(S.users).length')) === 1);
  await t.klick('.ptile[data-a="waehleNutzer"]'); await t.warte(400);
  check('Mia wieder im Hafen, Lernstand da', (await page.evaluate("Object.keys(cur().cards).length")) === 1 && !!(await page.$('.flobox')));
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  console.log(`\nBibliothek: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
