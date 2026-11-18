// Zufalls-Test: klickt wild durch die App (mit den großen Testdaten) und prüft, dass nichts abstürzt und der Zustand heil bleibt.
//   node tests/monkey.js [Schritte] [Startwert]
const path = require('path');
const { oeffne, ROOT } = require('./fahrer');

const N = +process.argv[2] || 1500, SEED = +process.argv[3] || 12345;
let a = SEED >>> 0;
const zufall = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'pip'); neuerNutzer('Ben', 'bubbo'); S.cur = Object.keys(S.users)[0]; start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fZip')).uploadFile(path.join(ROOT, '..', 'ausgabe', 'AppTest_Voll.zip'));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 240000 });
  await page.evaluate(`(() => {
    const u = cur();
    neuesProjekt(u, { name: 'KA', sp: 'en', lessons: ['E04'], sets: ['DE-EN', 'EN-DE', 'EXTRA', 'BILD'], end: '2026-11-02', ziel: 4, ruhe: [0, 6] });
    neuesProjekt(u, { name: 'FR', sp: 'fr', lessons: ['F01'], sets: ['DE-FR'], end: '2026-10-30', ziel: 3, ruhe: [] });
    neuesProjekt(u, { name: 'Dauer', sp: 'en', lessons: ['E04'], sets: ['DE-EN'], dauer: true });
    u.muscheln.perl = 6; u.perlen = 300; start();
  })()`);
  await t.warte(300);

  const verboten = ['nutzerLoeschenJa', 'lektionWegJa', 'sicherungWahl', 'sicherungKopieren', 'sicherungText', 'sicherungTextJa', 'sicherungJa', 'sicherungZurueck', 'kartenNachladen', 'kartenAlleLaden', 'waehleOrdner', 'waehleDateien', 'waehleZip', 'sichern', 'nutzerWechsel'];
  let klicks = 0, tage = 0;
  for (let i = 0; i < N; i++) {
    const r = zufall();
    if (r < 0.04) { await page.evaluate(`window.__heute = '${new Date(Date.UTC(2026, 9, 19 + (tage += 1 + Math.floor(zufall() * 3)))).toISOString().slice(0, 10)}'`); continue; }
    if (r < 0.10) { await page.keyboard.press(['Space', 'Enter', '1', '2', '3', '4', 'Escape'][Math.floor(zufall() * 7)]); continue; }
    const idx = Math.floor(zufall() * 1e6), tipp = zufall();
    const ergebnis = await page.evaluate((idx, verboten, tipp) => {
      const els = Array.from(document.querySelectorAll('[data-a]')).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled && verboten.indexOf(e.dataset.a) < 0; });
      const feld = document.querySelector('#tippFeld, #nameFeld, #projektName');
      if (feld && tipp < 0.3) { feld.value = ['candle', 'Salut', 'xyz', '', 'é'][idx % 5]; feld.dispatchEvent(new Event('input', { bubbles: true })); }
      if (!els.length) return 0;
      els[idx % els.length].click();
      return 1;
    }, idx, verboten, tipp);
    klicks += ergebnis;
    if (i % 25 === 0) await t.warte(20);
    if (t.fehler.length) break;
  }
  const heil = await page.evaluate(`(() => {
    const probleme = [];
    Object.values(S.users).forEach(u => {
      ['xp', 'perlen'].forEach(k => { if (!Number.isFinite(u[k]) || u[k] < 0) probleme.push(u.name + '.' + k + '=' + u[k]); });
      Object.keys(u.cards).forEach(c => { const s = u.cards[c]; if (!Number.isFinite(s.due) || !Number.isFinite(s.iv) || !Number.isFinite(s.ease) || s.ease < 1.3 - 1e-9 || s.b < 0 || s.b > 5) probleme.push(c + ':' + JSON.stringify(s)); });
      if (u.muscheln.perl < 0 || u.muscheln.schatz < 0) probleme.push('muscheln negativ');
      { const W = riffWelt(u); u.riff.items.forEach(i => { if (!(i.x >= W.minX && i.x <= W.minX + W.w && i.y >= 0 && i.y <= W.h)) probleme.push("riff außerhalb"); }); }
    });
    return { probleme, ansicht: V.name, nutzer: Object.keys(S.users).length };
  })()`);
  console.log(`Monkey: ${N} Schritte (Startwert ${SEED}), ${klicks} Klicks, ${tage} simulierte Tage, letzte Ansicht „${heil.ansicht}“.`);
  let schlecht = 0;
  if (t.fehler.length) { console.log('FEHLER:', t.fehler.slice(0, 5).join('\n')); schlecht++; }
  if (heil.probleme.length) { console.log('ZUSTAND:', heil.probleme.slice(0, 8).join('\n')); schlecht++; }
  console.log(schlecht ? 'Monkey: FEHLER' : 'Monkey: keine Fehler, Zustand heil');
  await t.bild('monkey-ende');
  await t.ende();
  process.exit(schlecht ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
