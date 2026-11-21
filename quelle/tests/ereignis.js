// Überraschungs-Ereignisse im Riff: seltener goldener Stern, zwei Geschicklichkeitsspiele, Bonus nach Sternen, Tagesgrenze, Abschalten.
//   node tests/ereignis.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const ev = s => page.evaluate(s);
  const bis = async (bed, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(bed)) return true; await t.warte(100); } return false; };
  await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 50; u.funken = 0; ['finn', 'mimo'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
    [['fig', 'finn', 30, 60], ['fig', 'mimo', 60, 66]].forEach(([k, r, x, y]) => { const it = riffSetze(k, r); it.x = x; it.y = y; }); sichere(); gehe('riff'); })()`);
  await t.warte(800);

  // ---------- Seltenheit und Bedingungen ----------
  check('Bewusst selten: höchstens 2 % Chance je Würfel, Würfel höchstens alle 10 s, mindestens 90 s im Riff', (await ev('EREIGNIS.chance <= 0.02 && EREIGNIS.takt >= 10 && EREIGNIS.minSek >= 90')) === true);
  check('Bonus bleibt klein: höchstens 6 Perlen und 3 Funken', (await ev('Math.max(...EREIGNIS.perlen) <= 6 && Math.max(...EREIGNIS.funken) <= 3')) === true);
  const wuerfeln = (rand, akku = 999) => ev(`(() => { const u = cur(); delete u.riff.ereTag; ereignisTokenWeg(); EG = null; window.__r0 = window.__r0 || rand; rand = () => ${rand}; LEBEN.ereAkku = ${akku}; LEBEN.ereT = 0; lebenEreignisSchritt(u, 0.1); rand = window.__r0; return !!LEBEN.ereToken; })()`);
  check('Zu früh im Riff (unter 90 s): kein Stern', (await wuerfeln(0.0001, 30)) === false);
  check('Schlechter Wurf (Zufall 0,5): kein Stern', (await wuerfeln(0.5)) === false);
  check('Guter Wurf nach 90 s: goldener Stern erscheint', (await wuerfeln(0.0001)) === true);
  check('Stern ist ein antippbarer Knopf im Wasser', !!(await page.$('#buehne .ereignisstern[data-a="ereignisStart"]')));
  check('Höchstens einmal am Tag (Tag ist verbraucht)', (await ev(`(() => { const u = cur(); ereignisTokenWeg(); LEBEN.ereAkku = 999; LEBEN.ereT = 0; window.__r0 = rand; rand = () => 0.0001; lebenEreignisSchritt(u, 0.1); rand = window.__r0; return !LEBEN.ereToken && u.riff.ereTag === heute(); })()`)) === true);
  check('Abgeschaltet: kein Stern', await ev(`(() => { const u = cur(); delete u.riff.ereTag; u.set.ereignisse = false; ereignisTokenWeg(); LEBEN.ereAkku = 999; LEBEN.ereT = 0; window.__r0 = rand; rand = () => 0.0001; lebenEreignisSchritt(u, 0.1); rand = window.__r0; const r = !LEBEN.ereToken; u.set.ereignisse = true; return r; })()`));
  check('Während einer Vokabelfrage kein Stern', await ev(`(() => { const u = cur(); delete u.riff.ereTag; LEBEN.frage = { id: 'x' }; ereignisTokenWeg(); LEBEN.ereAkku = 999; LEBEN.ereT = 0; window.__r0 = rand; rand = () => 0.0001; lebenEreignisSchritt(u, 0.1); rand = window.__r0; const r = !LEBEN.ereToken; LEBEN.frage = null; return r; })()`));
  check('Stern überlebt das Neuzeichnen des Riffs', await (async () => { await wuerfeln(0.0001); await ev('render()'); await t.warte(400); return !!(await page.$('#buehne .ereignisstern')); })());
  await t.bild('e4-stern');

  // ---------- Stern antippen → Karte ----------
  await page.click('.ereignisstern'); await t.warte(400);
  check('Tipp auf den Stern: Karte mit Regeln, „Später“ und „Los!“', !!(await page.$('.ereignis .ekarte [data-a="ereignisLos"]')) && !!(await page.$('.ereignis .ekarte [data-a="ereignisZu"]')) && (await ev('!LEBEN.ereToken')) === true);
  await t.bild('e4-karte');
  await page.click('[data-a="ereignisZu"]'); await t.warte(200);
  check('„Später“ schließt, nichts ist verbucht', !(await page.$('.ereignis')) && (await ev('cur().perlen')) === 50 && (await ev('(cur().stats.ereignisse || 0)')) === 0);

  // ---------- Spiel 1: Blasenregen ----------
  const spiele = async (name, klickJs, dauerMs) => {
    await ev(`AKT.ereignisStart({ dataset: { spiel: '${name}' } })`); await t.warte(300);
    await page.click('[data-a="ereignisLos"]');
    check(name + ': Countdown, dann läuft das Spiel mit Punkteanzeige und Zeitbalken', await bis(`EG && EG.phase === 'laeuft'`, 6000) && !!(await page.$('#ehud .ezeit')));
    const t0 = Date.now();
    while (Date.now() - t0 < dauerMs && (await ev(`EG && EG.phase === 'laeuft'`))) { await ev(klickJs); await t.warte(70); }
    await bis(`EG && EG.phase === 'ende'`, 6000);
    return ev(`({ punkte: EG.punkte, sterne: EG.ergebnis.sterne, perlen: EG.ergebnis.perlen, funken: EG.ergebnis.funken })`);
  };
  const perl0 = await ev('cur().perlen');
  // Bot: tippt alle normalen und goldenen Blasen, nie Seeigel
  const bot1 = `Array.from(document.querySelectorAll('.eblase.normal, .eblase.gold')).forEach(e => e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))`;
  const r1 = await spiele('blasen', bot1, 15000);
  check('Blasenregen: fehlerloser Spieler erreicht 3 Sterne', r1.sterne === 3, r1);
  check('Blasenregen: Bonus 6 Perlen und 3 Korallenfunken gutgeschrieben', (await ev('cur().perlen')) === perl0 + 6 && (await ev('cur().funken')) === 3, r1);
  await t.bild('e4-blasen-ende');
  check('Ergebnis-Karte mit Sternen und „Toll!“', !!(await page.$('.ekarte .sterne3')) && !!(await page.$('.ekarte [data-a="ereignisZu"]')));
  check('Statistik und Abzeichen „Glückspilz“ und „Riff-Akrobat“', (await ev('cur().stats.ereignisse')) === 1 && (await ev('!!cur().badges.ereignis1 && !!cur().badges.ereignis3')) === true);
  await page.click('.ekarte [data-a="ereignisZu"]'); await t.warte(300);
  check('Nach „Toll!“ ist das Riff wieder frei', !(await page.$('.ereignis')) && (await ev('EG === null')) === true);

  // Seeigel kosten Punkte, Nichtstun gibt nur den Trostbonus
  const perl1 = await ev('cur().perlen');
  const r2 = await spiele('blasen', `1`, 14500);
  check('Blasenregen ohne Tippen: 0 Sterne, nur 1 Perle Trost', r2.sterne === 0 && r2.perlen === 1 && (await ev('cur().perlen')) === perl1 + 1, r2);
  await page.click('.ekarte [data-a="ereignisZu"]'); await t.warte(200);
  const igel = await ev(`(() => { EG = null; $('#ereignis') && $('#ereignis').remove(); return null; })()`);
  void igel;

  // ---------- Spiel 2: Goldener Krebs ----------
  const perl2 = await ev('cur().perlen');
  const bot2 = `(() => { const k = document.querySelector('.ekrebs'); if (k) k.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 300 })); })()`;
  const r3 = await spiele('krebs', bot2, 15000);
  check('Goldener Krebs: viele Treffer = 3 Sterne, Bonus gutgeschrieben', r3.sterne === 3 && (await ev('cur().perlen')) === perl2 + 6, r3);
  await t.bild('e4-krebs-ende');
  await page.click('.ekarte [data-a="ereignisZu"]'); await t.warte(200);

  // ---------- Sterne-Schwellen ----------
  check('Sterne-Schwellen: Blasen 9/10/20/30, Krebs 3/4/8/12', (await ev(`[ereignisSterne('blasen', 9), ereignisSterne('blasen', 10), ereignisSterne('blasen', 20), ereignisSterne('blasen', 30), ereignisSterne('krebs', 3), ereignisSterne('krebs', 4), ereignisSterne('krebs', 8), ereignisSterne('krebs', 12)].join()`)) === '0,1,2,3,0,1,2,3');

  // ---------- Einstellung in „Ich“ ----------
  await ev(`gehe('ich')`); await t.warte(500);
  check('Ich → Einstellungen: Schalter „Überraschungen im Riff“', !!(await page.$('[data-a="ereignisSchalter"]')));
  await page.click('[data-a="ereignisSchalter"]'); await t.warte(300);
  check('Schalter stellt die Überraschungen ab (gespeichert)', (await ev('cur().set.ereignisse')) === false);
  await page.click('[data-a="ereignisSchalter"]'); await t.warte(300);
  check('… und wieder an', (await ev('cur().set.ereignisse')) === true);

  // ---------- Vollbild und Spiel ----------
  await ev(`gehe('riff')`); await t.warte(500); await ev('AKT.riffVoll()'); await t.warte(500);
  await ev(`AKT.ereignisStart({ dataset: { spiel: 'krebs' } })`); await t.warte(300);
  const b = await ev(`(() => { const e = document.querySelector('#ereignis').getBoundingClientRect(), r = document.querySelector('.riffrahmen').getBoundingClientRect(); return Math.abs(e.width - r.width) < 3 && Math.abs(e.height - r.height) < 3; })()`);
  check('Ereignis füllt auch im Vollbild den ganzen Riff-Bereich', b === true);
  await ev(`AKT.ereignisZu(); AKT.riffVoll();`);

  check('Keine Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`Überraschungs-Ereignisse: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('Abbruch:', e.message); process.exit(1); });
