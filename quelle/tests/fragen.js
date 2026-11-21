// Freunde fragen Vokabeln: „?“ im Riff, Frage-Fenster, Belohnung mit Tagesgrenze, Ausschalten, Lernplan bleibt unberührt.
//   node tests/fragen.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const ev = s => page.evaluate(s);
  const bis = async (bed, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(bed)) return true; await t.warte(150); } return false; };
  const riff = async (zeit = 'tag') => {
    await ev(`(() => { const u = cur(); u.riff.items = []; u.riff.zeit = '${zeit}'; u.riff.leben = true; u.riff.sperre = false; LEBEN.fragenModus = true; LEBEN.ag.clear(); window.__id = {};
      [['fig', 'finn', 30, 60], ['fig', 'mimo', 60, 66]].forEach(([k, r, x, y]) => { const it = riffSetze(k, r); it.x = x; it.y = y; window.__id[r] = it.id; });
      sichere(); gehe('riff'); })()`);
    await t.warte(900);
  };

  await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 100; ['finn', 'mimo'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; }); sichere(); })()`);

  // ---------- noch keine Karten gelernt ----------
  await riff();
  await ev(`LEBEN.fragenModus = false; render();`); await t.warte(400);
  check('Der Vokabel-Modus ist beim Start aus (kein Aufruf, keine Fragen)', (await ev('!!LEBEN.fragenModus')) === false && !(await page.$('.riffhinweis.modus')));
  await ev(`LEBEN.fzNext = 0;`);
  await t.warte(2500);
  check('Ohne gelernte Karten erscheint kein „?“', (await page.$$('.fragezeichen')).length === 0);
  check('Knopf „Freunde fragen Vokabeln“ ist da (5. runder Knopf)', !!(await page.$('.riffwerk [data-a="riffFragenAn"]')) && (await page.$$('.riffwerk .rw')).length === 6);

  // ---------- Karten laden und etwas lernen ----------
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await ev(`(() => { const u = cur(); Object.values(S.lib.lessons).forEach(L => Object.keys(L.cards).forEach(c => bewerte(u, c, 2))); sichere(); })()`);
  const lernplan = await ev(`JSON.stringify(cur().cards)`);
  await riff();
  await ev(`LEBEN.fragenModus = false; render();`);
  await ev(`LEBEN.fzNext = 0;`); await t.warte(3000);
  check('Modus aus: auch mit gelernten Karten kein „?“', (await page.$$('.fragezeichen')).length === 0);
  await t.klick('.riffwerk [data-a="riffFragenAn"]');
  check('Knopf ruft den Modus auf: Hinweisleiste mit „Aus“ erscheint', !!(await page.$('.riffhinweis.modus [data-a="riffFragenAn"]')) && (await ev('LEBEN.fragenModus')) === true);
  check('Mit gelernten Karten erscheint dann bald ein „?“ über einem Freund', await bis(`!!document.querySelector('.fragezeichen')`, 10000));
  const pos = await ev(`(() => { const z = document.querySelector('.fragezeichen').getBoundingClientRect(), f = document.querySelector('.ritem[data-id="' + LEBEN.fz.id + '"] .swim').getBoundingClientRect(); return { dx: Math.abs((z.left + z.width / 2) - (f.left + f.width / 2)), oben: z.bottom <= f.bottom }; })()`);
  check('Das „?“ sitzt über dem Freund', pos.dx < 40 && pos.oben, pos);
  await t.bild('f4-fragezeichen');

  // ---------- Frage beantworten (Tiere gesperrt: das „?“ bleibt antippbar) ----------
  await ev(`cur().riff.sperre = true; document.querySelector('#buehne').classList.add('gesperrt');`);
  await page.click('.fragezeichen'); await t.warte(400);
  check('Tipp aufs „?“ öffnet die Frage, auch bei gesperrten Tieren', !!(await page.$('.rfrage .ffrage')) && (await ev('!!LEBEN.frage')) === true);
  const opts = await ev(`document.querySelectorAll('#frageOpt button').length`);
  check('Antworten zur Wahl (bis zu vier, hier drei Karten)', opts === 3, opts);
  await t.bild('f4-frage');
  const perl0 = await ev('cur().perlen');
  const richtig = await ev(`LEBEN.frage.optionen.indexOf(LEBEN.frage.richtig)`);
  await ev(`document.querySelectorAll('#frageOpt button')[${richtig}].click()`); await t.warte(400);
  check('Erste richtige Antwort: noch keine Perle (nur jede zweite), Statistik, Abzeichen „Neugieriger Freund“', (await ev('cur().perlen')) === perl0 && (await ev('cur().stats.riffFragen')) === 1 && (await ev('!!cur().badges.fragen1')) === true);
  check('Richtig wird grün markiert, Meldung nennt die nächste Perle', (await ev(`!!document.querySelector('#frageOpt .richtig') && /Perle/.test(document.querySelector('#frageMeld').textContent)`)) === true);
  await t.bild('f4-frage-richtig');
  await ev(`schliesseBlatt()`); await t.warte(300);
  check('Nach dem Schließen: Frage beendet, Lernplan der Karten unverändert', (await ev('LEBEN.frage === null')) === true && (await ev(`JSON.stringify(cur().cards)`)) === lernplan);

  // ---------- falsche Antwort ----------
  await ev(`LEBEN.fzNext = 0;`);
  check('Später kommt wieder ein „?“', await bis(`!!document.querySelector('.fragezeichen')`, 12000));
  await ev(`cur().riff.sperre = false; document.querySelector('#buehne').classList.remove('gesperrt');`);
  await ev(`lebenGruss(cur().riff.items.find(i => i.id === LEBEN.fz.id))`); await t.warte(400);
  check('Antippen des Freundes mit „?“ öffnet ebenfalls die Frage', !!(await page.$('.rfrage')));
  const perl1 = await ev('cur().perlen');
  const falsch = await ev(`LEBEN.frage.optionen.findIndex(o => o !== LEBEN.frage.richtig)`);
  await ev(`document.querySelectorAll('#frageOpt button')[${falsch}].click()`); await t.warte(300);
  check('Falsche Antwort: keine Perle, richtige Lösung wird gezeigt, nichts bestraft', (await ev('cur().perlen')) === perl1 && (await ev(`/Richtig ist/.test(document.querySelector('#frageMeld').textContent) && !!document.querySelector('#frageOpt .richtig') && !!document.querySelector('#frageOpt .falsch')`)) === true);
  await ev(`schliesseBlatt()`);

  // ---------- Tagesgrenze und Funken-Bonus ----------
  await ev(`(() => { frageTag(cur()).ok = 1; cur().funken = 0; window.__p3 = cur().perlen; LEBEN.fzNext = 0; })()`);
  await bis(`!!document.querySelector('.fragezeichen')`, 12000);
  await page.click('.fragezeichen'); await t.warte(300);
  await ev(`document.querySelectorAll('#frageOpt button')[LEBEN.frage.optionen.indexOf(LEBEN.frage.richtig)].click()`); await t.warte(300);
  check('Jede zweite richtige Antwort gibt genau eine Perle, nie Korallenfunken', (await ev('cur().perlen')) === (await ev('__p3')) + 1 && (await ev('cur().funken')) === 0);
  await ev(`schliesseBlatt()`);
  await ev(`(() => { frageTag(cur()).ok = FRAGE_MAX; LEBEN.fzNext = 0; })()`);
  await t.warte(3500);
  check('Ist die Tagesgrenze erreicht, erscheint kein „?“ mehr', (await page.$$('.fragezeichen')).length === 0);
  const perl2 = await ev('cur().perlen');
  await ev(`(() => { frageTag(cur()).ok = FRAGE_MAX; const it = cur().riff.items[0]; LEBEN.fz = null; frageStart(it.id); })()`); await t.warte(300);
  await ev(`document.querySelectorAll('#frageOpt button')[LEBEN.frage.optionen.indexOf(LEBEN.frage.richtig)].click()`); await t.warte(300);
  check('Über der Tagesgrenze: Üben erlaubt, aber keine weitere Perle', (await ev('cur().perlen')) === perl2 && /keine Perlen mehr/.test(await ev(`document.querySelector('#frageMeld').textContent`)));
  await ev(`schliesseBlatt()`);

  await ev(`(() => { const r = frageTag(cur()); r.ok = 0; r.falsch = FRAGE_FEHLER; LEBEN.fzNext = 0; })()`); await t.warte(3500);
  check('Nach drei falschen Antworten am Tag fragt niemand mehr (kein Belohnen fürs Raten)', (await page.$$('.fragezeichen')).length === 0);
  const gesamt = await ev(`(() => { const r = frageTag(cur()); r.falsch = 0; r.ok = 0; let p = 0; for (let i = 0; i < 20; i++) { if (r.ok < FRAGE_MAX) { r.ok++; if (r.ok % 2 === 0) p++; } } return p; })()`);
  check('Höchstens drei Perlen am Tag durch Vokabelfragen', gesamt === 3, gesamt);

  // ---------- Ausschalten, Nacht ----------
  await ev(`(() => { frageTag(cur()).ok = 0; LEBEN.fzNext = 0; })()`);
  await t.klick('.riffhinweis.modus [data-a="riffFragenAn"]');
  check('„Aus“ in der Hinweisleiste schaltet den Modus ab, Leiste und „?“ verschwinden', (await ev('LEBEN.fragenModus')) === false && !(await page.$('.riffhinweis.modus')) && (await page.$$('.fragezeichen')).length === 0);
  await ev(`LEBEN.fzNext = 0;`); await t.warte(3000);
  check('Ausgeschaltet: kein „?“', (await page.$$('.fragezeichen')).length === 0);
  await t.klick('.riffwerk [data-a="riffFragenAn"]');
  check('Wieder an', (await ev('LEBEN.fragenModus')) === true);
  await riff('nacht');
  await ev(`LEBEN.fzNext = 0;`); await t.warte(3500);
  check('Nachts fragt niemand (alle schlafen)', (await page.$$('.fragezeichen')).length === 0);

  check('Keine Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`Vokabelfragen im Riff: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
  function FUNKEN_ERWARTET() { return 3; }
})().catch(e => { console.log('Abbruch:', e.message); process.exit(1); });
