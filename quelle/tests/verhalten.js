// Neue Verhaltensweisen und Effekte im Riff: blinzeln, spielen, verstecken, staunen, buddeln, Fangen, hinterherschwimmen, Locken, Licht, Teilchen.
//   node tests/verhalten.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const ev = s => page.evaluate(s);
  const bis = async (bed, ms = 25000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(bed)) return true; await t.warte(120); } return false; };
  // Szene aufbauen: Liste [kind, ref, x, y]; setzt Zufall auf „Aktivität wählen“
  const szene = async (liste, zeit = 'tag') => {
    await ev(`(() => { const u = cur(); u.riff.items = []; u.riff.zeit = '${zeit}'; u.riff.leben = true; u.riff.sperre = false; LEBEN.ag.clear(); window.__id = {};
      ${JSON.stringify(liste)}.forEach(([k, r, x, y]) => { const it = riffSetze(k, r); it.x = x; it.y = y; window.__id[r] = it.id; });
      sichere(); gehe('riff'); })()`);
    await t.warte(900);
  };
  const dran = ref => ev(`(() => { const a = LEBEN.ag.get(__id['${ref}']); a.modus = 'bleiben'; a.bis = 0; a.ziel = null; })()`);

  await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 900; u.tiefeMax = 100;
    ['finn', 'mimo', 'nixi', 'knips', 'stella', 'okko'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
    ['ball', 'reifen', 'hoehle', 'kelp', 'leuchtturm', 'laterne', 'blasen'].forEach(d => { u.deko[d] = 2; }); mythBesitz(u).kristall = { n: 1, ts: 1, neu: false }; sichere(); })()`);

  // ---------- Blinzeln ----------
  await szene([['fig', 'finn', 40, 55], ['fig', 'mimo', 62, 60]]);
  check('Blinzeln: irgendwann schließt ein Freund kurz die Augen', await bis(`!!document.querySelector('.fx.blink')`, 15000));
  check('Blinzeln: Lidbogen sichtbar, offenes Auge kurz weg', (await ev(`(() => { const f = document.querySelector('.fx.blink'); if (!f) return true; return getComputedStyle(f.querySelector('.aug .zu')).display !== 'none'; })()`)) === true);
  check('Blinzeln endet wieder (nicht dauerhaft zu)', await bis(`document.querySelectorAll('.fx.blink').length === 0`, 3000));

  // ---------- Spielen ----------
  await szene([['deko', 'ball', 48, 92], ['fig', 'finn', 30, 70]]);
  await ev(`window.__r0 = rand; rand = () => 0.01;`);
  await dran('finn');
  check('Spielen: Freund geht zum Wasserball', await bis(`(() => { const a = LEBEN.ag.get(__id.finn); return a.spielDeko === __id.ball; })()`, 6000));
  check('Spielen: Ball hüpft (Klasse „spiel“), sobald der Freund dort ist', await bis(`!!document.querySelector('.ritem.d-ball .dr.spiel')`, 25000));
  await ev(`rand = window.__r0;`);

  // ---------- Verstecken ----------
  await szene([['deko', 'hoehle', 50, 93], ['fig', 'mimo', 30, 80]]);
  await ev(`rand = () => 0.01;`);
  await dran('mimo');
  check('Verstecken: Schüchterne geht in die Höhle und versteckt sich', await bis(`LEBEN.ag.get(__id.mimo).modus === 'verstecken'`, 25000));
  check('Verstecken: Freund liegt hinter der Deko (Ebene darunter)', (await ev(`(() => { const f = document.querySelector('.ritem[data-id="' + __id.mimo + '"]'), d = document.querySelector('.ritem[data-id="' + __id.hoehle + '"]'); return +f.style.zIndex < +d.style.zIndex; })()`)) === true);
  check('Verstecken endet, Freund taucht wieder auf', await bis(`LEBEN.ag.get(__id.mimo).modus !== 'verstecken'`, 30000));
  await ev(`rand = window.__r0;`);

  // ---------- Staunen (Mythos) ----------
  await szene([['myth', 'kristall', 70, 90], ['fig', 'finn', 25, 60]]);
  await ev(`rand = () => 0.01;`);
  await dran('finn');
  check('Staunen: Freund geht zum Mythos', await bis(`LEBEN.ag.get(__id.finn).staunen === __id.kristall`, 6000));
  check('Staunen: er kommt dort an und glitzert', await bis(`(() => { const a = LEBEN.ag.get(__id.finn), p = riffSicht(cur().riff.items.find(i => i.id === __id.finn)); return a.modus === 'verweilen' && Math.abs(p.x - 70) < 22; })()`, 30000));
  await ev(`rand = window.__r0;`);

  // ---------- Buddeln ----------
  await szene([['fig', 'knips', 40, 90]]);
  await ev(`rand = () => 0.01;`);
  await dran('knips');
  check('Buddeln: Krebs wühlt im Sand', await bis(`LEBEN.ag.get(__id.knips).modus === 'buddeln'`, 25000));
  check('Buddeln: Sandwölkchen steigen auf', await bis(`!!document.querySelector('#teile .t-sand')`, 6000));
  await ev(`rand = window.__r0;`);

  // ---------- Fangen / Hinterherschwimmen ----------
  await szene([['fig', 'finn', 45, 55], ['fig', 'nixi', 55, 60]]);
  await ev(`rand = () => 0.01;`);
  await dran('finn');
  check('Fangen: zwei Freunde jagen und fliehen', await bis(`(() => { const a = LEBEN.ag.get(__id.finn), b = LEBEN.ag.get(__id.nixi); return a.modus === 'jagen' && b.modus === 'fliehen' && a.partner === __id.nixi; })()`, 8000));
  await ev(`rand = window.__r0;`);
  const weit = await ev(`(() => { const a = LEBEN.ag.get(__id.finn); return a.tempoF; })()`);
  check('Fangen: schneller als beim Schlendern', weit > 1.3, weit);
  check('Fangen endet von selbst, beide frei', await bis(`(() => { const a = LEBEN.ag.get(__id.finn), b = LEBEN.ag.get(__id.nixi); return ['jagen', 'fliehen'].indexOf(a.modus) < 0 && ['jagen', 'fliehen'].indexOf(b.modus) < 0; })()`, 20000));
  await szene([['fig', 'finn', 45, 55], ['fig', 'nixi', 55, 60]]);
  await ev(`(() => { const a = LEBEN.ag.get(__id.finn), b = LEBEN.ag.get(__id.nixi); a.modus = 'folgen'; a.partner = __id.nixi; a.bis = LEBEN.zeit + 6; a.gehen = true; a.off = 10; b.modus = 'bleiben'; b.bis = LEBEN.zeit + 99; })()`);
  await t.warte(3500);
  check('Folgen: Freund schwimmt hinterher (kommt dem anderen näher)', (await ev(`(() => { const u = cur(), f = riffSicht(u.riff.items.find(i => i.id === __id.finn)), n = riffSicht(u.riff.items.find(i => i.id === __id.nixi)); return Math.hypot(f.x - n.x, f.y - n.y) < 30; })()`)) === true);

  // ---------- Locken ----------
  await szene([['fig', 'finn', 40, 70], ['fig', 'mimo', 70, 60]]);
  const pw = await ev(`(() => { const w = document.querySelector('#riffwrap').getBoundingClientRect(); return { x: w.left + w.width * 0.5, y: w.top + w.height * 0.28 }; })()`);
  await page.mouse.click(pw.x, pw.y); await t.warte(200);
  check('Locken: Tipp ins Wasser zeigt eine Ringwelle', (await ev(`document.querySelectorAll('#teile .t-ring').length`)) >= 1);
  check('Locken: nächste Freunde schwimmen hin', (await ev(`Array.from(LEBEN.ag.values()).filter(a => a.modus === 'gehe' && a.danach === 'verweilen').length`)) >= 1);
  await ev(`cur().riff.sperre = true; sichere(); gehe('riff');`); await t.warte(500);
  const n0 = await ev(`document.querySelectorAll('#teile .t-ring').length`);
  await page.mouse.click(pw.x, pw.y); await t.warte(200);
  check('Locken geht auch bei gesperrten Tieren', (await ev(`document.querySelectorAll('#teile .t-ring').length`)) >= n0);

  // ---------- Licht und Wasser ----------
  await szene([['deko', 'leuchtturm', 70, 88], ['deko', 'laterne', 40, 62]], 'nacht');
  check('Leuchtturm: Lichtkegel kreist per „rotate“ (Mittelpunkt bleibt stehen)', (await ev(`(() => { const e = document.querySelector('.ritem.d-leuchtturm'), s = getComputedStyle(e, '::after'); return s.animationName === 'leuchtKreisen' && /-50%|-?\\d/.test(s.translate) && s.rotate !== undefined; })()`)) === true);
  check('Leuchtturm: Zeichnung ohne die alten Strich-Strahlen', (await ev(`!dekoSvg('leuchtturm').includes('M30 32 L8 24') && !dekoSvg('laterne').includes('opacity=".35"')`)) === true);
  check('Laterne: weiches Licht (Farbverlauf) statt harter Scheibe', /radial-gradient/.test(await ev(`getComputedStyle(document.querySelector('.ritem.d-laterne'), '::before').backgroundImage`)));
  check('Wasseroberfläche vorhanden', !!(await page.$('.oberflaeche')));
  check('Nachts treibt Leuchtplankton durchs Wasser', await bis(`!!document.querySelector('#teile .t-leucht')`, 8000));
  const kegel = await ev(`(async () => { const e = document.querySelector('.ritem.d-leuchtturm'); const a = getComputedStyle(e, '::after').rotate; await new Promise(r => setTimeout(r, 1500)); const b = getComputedStyle(e, '::after').rotate; return [a, b]; })()`);
  check('Lichtkegel dreht sich wirklich', kegel[0] !== kegel[1], kegel);
  await t.bild('v4-licht-nacht');

  check('Keine Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`Verhalten und Effekte: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('Abbruch:', e.message); process.exit(1); });
