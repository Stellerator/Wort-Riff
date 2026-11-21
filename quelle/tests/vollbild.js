// Riff im Vollbild und kompakter Generalprobe-Knopf.   node tests/vollbild.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  for (const ansicht of ['quer', 'hoch']) {
    const t = await oeffne({ heute: '2026-10-19', ansicht });
    const { page } = t;
    const ev = s => page.evaluate(s);
    await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); ['finn', 'mimo'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
      ['leuchtturm', 'ball'].forEach(d => { u.deko[d] = 1; });
      [['fig', 'finn', 30, 60], ['fig', 'mimo', 60, 66], ['deko', 'leuchtturm', 80, 88], ['deko', 'ball', 45, 93]].forEach(([k, r, x, y]) => { const it = riffSetze(k, r); it.x = x; it.y = y; });
      sichere(); gehe('riff'); })()`);
    await t.warte(800);
    const vp = await ev(`({ w: innerWidth, h: innerHeight })`);
    const normal = await ev(`(() => { const r = document.querySelector('.riffbuehne').getBoundingClientRect(); return { b: r.width, h: r.height, nav: !!document.querySelector('.nav').offsetParent, lager: !!document.querySelector('.lager') && !!document.querySelector('.lager').offsetParent }; })()`);
    check(ansicht + ': Normalansicht mit Navigation und Lager', normal.nav && normal.lager);
    check(ansicht + ': Knopf „Vollbild“ im Riff', !!(await page.$('.riffwerk [data-a="riffVoll"]')));
    await t.klick('.riffwerk [data-a="riffVoll"]');
    await t.warte(600);
    const voll = await ev(`(() => { const r = document.querySelector('.riffbuehne').getBoundingClientRect(), w = document.querySelector('#riffwrap').getBoundingClientRect(); return { b: r.width, h: r.height, wb: w.width, wh: w.height, nav: !!document.querySelector('.nav').offsetParent, lager: !!document.querySelector('.lager') && !!document.querySelector('.lager').offsetParent, kopf: !!document.querySelector('.riffkopf') && !!document.querySelector('.riffkopf').offsetParent, klasse: document.body.classList.contains('riffvoll'), werk: !!document.querySelector('.riffwerk').offsetParent, zu: !!document.querySelector('.vollzu') }; })()`);
    check(ansicht + ': Vollbild: Navigation, Kopf und Lager verschwunden', voll.klasse && !voll.nav && !voll.lager && !voll.kopf, voll);
    check(ansicht + ': Vollbild: Riff füllt den Bildschirm (mindestens 90 % der Breite oder Höhe genutzt)', voll.wb >= vp.w * 0.95 && voll.wh >= vp.h * 0.9, { voll, vp });
    check(ansicht + ': Vollbild: Riff größer als vorher', voll.b * voll.h > normal.b * normal.h * 1.15, { voll, normal });
    check(ansicht + ': Vollbild: Knöpfe und „Vollbild beenden“ sichtbar', voll.werk && voll.zu);
    await t.bild('vb-' + ansicht);
    // Bedienung im Vollbild: Futter streuen und Frage-Modus-Knopf
    await ev(`AKT.riffFutter();`);
    const w = await ev(`(() => { const r = document.querySelector('#riffwrap').getBoundingClientRect(); return { x: r.left + r.width * 0.6, y: r.top + r.height * 0.3 }; })()`);
    await page.mouse.click(w.x, w.y); await t.warte(250);
    check(ansicht + ': Im Vollbild lässt sich füttern', (await ev('LEBEN.futter.length')) >= 1);
    await ev(`AKT.riffFutter();`);
    await t.klick('.vollzu');
    await t.warte(500);
    const zurueck = await ev(`({ nav: !!document.querySelector('.nav').offsetParent, lager: !!document.querySelector('.lager').offsetParent, klasse: document.body.classList.contains('riffvoll') })`);
    check(ansicht + ': „Vollbild beenden“ bringt alles zurück', zurueck.nav && zurueck.lager && !zurueck.klasse, zurueck);
    await t.klick('.riffwerk [data-a="riffVoll"]'); await t.warte(400);
    await page.keyboard.press('Escape'); await t.warte(400);
    check(ansicht + ': Escape beendet das Vollbild', (await ev(`!document.body.classList.contains('riffvoll')`)) === true);
    await t.klick('.riffwerk [data-a="riffVoll"]'); await t.warte(400);
    await ev(`gehe('start')`); await t.warte(300);
    check(ansicht + ': Beim Verlassen des Riffs endet das Vollbild von selbst', (await ev(`!document.body.classList.contains('riffvoll') && !!document.querySelector('.nav').offsetParent`)) === true);
    check(ansicht + ': Keine Konsolenfehler', t.fehler.length === 0, t.fehler);
    await t.ende();
  }

  // ---------- Generalprobe-Knopf auf der Übungs-Kachel ----------
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'finn'); start(true);");
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await page.evaluate(`(() => { const u = cur(); neuesProjekt(u, { name: 'Französisch', sp: 'fr', lessons: ['F01'], sets: ['DE-FR'], end: '2026-11-02', ziel: 3, ruhe: [] }); u.set.sp = 'fr'; start(); })()`);
  await t.warte(500);
  const m = await page.evaluate(`(() => { const b = document.querySelector('.pk [data-a="probeNeu"]').getBoundingClientRect(), k = document.querySelector('.pk').getBoundingClientRect(), t = document.querySelector('.pk [data-a="lernStart"]').getBoundingClientRect(); return { bh: b.height, bb: b.width, kb: k.width, th: t.height, text: document.querySelector('.pk [data-a="probeNeu"]').textContent.trim() }; })()`);
  check('Generalprobe-Knopf kompakt: höchstens 40 px hoch, weniger als halb so breit wie die Kachel', m.bh <= 40 && m.bb < m.kb * 0.5, m);
  check('Generalprobe-Knopf deutlich kleiner als der Tauchen-Knopf', m.bh < m.th * 0.65, m);
  check('Knopftext kurz: „Generalprobe“', m.text === 'Generalprobe', m.text);
  await t.bild('vb-kachel');
  check('Keine Konsolenfehler (Kachel)', t.fehler.length === 0, t.fehler);
  await t.ende();

  console.log(`Vollbild und Kachel: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('Abbruch:', e.message); process.exit(1); });
