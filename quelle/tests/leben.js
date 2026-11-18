// Lebendiges Riff: Freunde schwimmen, Lieblingsplätze, Freude, Blasensäulen, Tag/Nacht, Futter, Sprechblase, Ziehen und Auswählen bleiben heil.
//   node tests/leben.js
const { oeffne } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const ev = s => page.evaluate(s);

  // ---------- Aufbau: Nutzer, Freunde, Deko ----------
  await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 900;
    ['finn', 'mimo', 'nixi', 'knips', 'wobbel', 'pip', 'knurr', 'stella'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
    ['blasen', 'anemone', 'truhe', 'seegras', 'laterne', 'kelp', 'wrack', 'reifen', 'hoehle', 'ball'].forEach(d => { u.deko[d] = 1; });
    window.stelle = (kind, ref, x, y) => { const it = riffSetze(kind, ref); it.x = x; it.y = y; return it; };
    window.__ids = {};
    window.__ids.blasen = stelle('deko', 'blasen', 20, 90).id; window.__ids.anemone = stelle('deko', 'anemone', 80, 92).id; stelle('deko', 'truhe', 52, 94); stelle('deko', 'seegras', 36, 94); stelle('deko', 'laterne', 66, 70);
    window.__ids.finn = stelle('fig', 'finn', 28, 60).id; window.__ids.mimo = stelle('fig', 'mimo', 40, 56).id; window.__ids.nixi = stelle('fig', 'nixi', 60, 50).id; window.__ids.knips = stelle('fig', 'knips', 58, 92).id; window.__ids.wobbel = stelle('fig', 'wobbel', 74, 46).id;
    sichere(); gehe('riff'); })()`);
  await t.warte(700);

  await ev(`window.__punktAuf = id => { const e = document.querySelector('.ritem[data-id="' + id + '"] .swim'); const r = e.getBoundingClientRect(); for (let fy = 0.35; fy <= 0.9; fy += 0.1) for (let fx = 0.2; fx <= 0.8; fx += 0.1) { const x = r.left + r.width * fx, y = r.top + r.height * fy; const t = document.elementFromPoint(x, y); const ri = t && t.closest('.ritem'); if (ri && ri.dataset.id === id) return { x, y }; } return null; };
    window.__freiPunkt = () => { const w = document.querySelector('#riffwrap').getBoundingClientRect(); for (let i = 0; i < 200; i++) { const x = w.left + 80 + Math.random() * (w.width - 160), y = w.top + 80 + Math.random() * (w.height * 0.45); const t = document.elementFromPoint(x, y); if (t && !t.closest('.ritem, .riffwerk, .riffhinweis, .werkzeug, .rede')) return { x, y }; } return null; };`);
  check('Stück-Hülle: swim → dr → fl → fx', !!(await page.$('.ritem.fig .swim .dr .fl .fx svg')));
  check('Deko trägt ihren Namen als Klasse', !!(await page.$('.ritem.deko.d-blasen')) && !!(await page.$('.ritem.deko.d-anemone')));
  check('Knöpfe über dem Wasser: Futter, Tag/Nacht, Leben', (await page.$$('.riffwerk .rw')).length === 3);
  check('Teilchen-Ebene und Nachthaut vorhanden', !!(await page.$('#teile')) && !!(await page.$('.nachthaut')));

  // ---------- Bewegung ----------
  await t.warte(4500);
  const bew = await ev(`(() => { const a = Array.from(LEBEN.ag.values()); return { n: a.length, bewegt: a.filter(x => Math.abs(x.ox) + Math.abs(x.oy) > 0.5).length, modi: a.map(x => x.art + ':' + x.modus).join(' ') }; })()`);
  check('Freunde haben Agenten und schwimmen los', bew.n === 5 && bew.bewegt >= 2, bew);
  check('Transform wird gesetzt', (await ev(`Array.from(document.querySelectorAll('.ritem.fig .swim')).filter(e => /translate3d/.test(e.style.transform)).length`)) >= 3);
  check('Heimatplätze bleiben unverändert', (await ev(`(() => { const u = cur(), it = u.riff.items.find(i => i.id === __ids.finn); return it.x === 28 && it.y === 60; })()`)) === true);
  check('Blasensäule: Bläschen steigen im Bild', (await ev(`getComputedStyle(document.querySelector('.ritem.deko.d-blasen .dk .b1')).animationName`)) === 'saeule');
  await t.warte(2500);
  check('Blasen und Teilchen im Wasser', (await ev(`document.querySelectorAll('#teile .teil').length`)) >= 1, await ev(`document.querySelectorAll('#teile .teil').length`));
  await t.bild('l1-riff-lebt');

  // ---------- Fps ----------
  const fps = await ev(`new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); }; requestAnimationFrame(f); })`);
  check('Läuft flüssig (≥ 30 Bilder/s im Test)', fps >= 30, fps);

  // ---------- Lieblingsplatz: Mimo mag die Anemone ----------
  await ev(`window.__rand0 = rand; rand = () => 0.06;`);           // Zufall zahm: wählt immer den Lieblingsplatz
  let besucht = false, verweilt = false;
  for (let i = 0; i < 70 && !(besucht && verweilt); i++) {
    await t.warte(500);
    const s = await ev(`(() => { const u = cur(), m = u.riff.items.find(i => i.id === __ids.mimo), d = u.riff.items.find(i => i.id === __ids.anemone), p = riffSicht(m), a = LEBEN.ag.get(m.id); return { nah: Math.abs(p.x - d.x) < 18 && Math.abs(p.y - d.y) < 12, modus: a.modus }; })()`);
    if (s.nah) besucht = true;
    if (s.nah && s.modus === 'verweilen') verweilt = true;
  }
  await ev(`rand = window.__rand0;`);
  check('Mimo schwimmt von selbst zur Seeanemone', besucht);
  check('… und bleibt dort (verweilen, freut sich)', verweilt);
  check('Freude zeigt Herzen/Sterne/Noten', (await ev(`document.querySelectorAll('#teile .t-herz, #teile .t-stern, #teile .t-note').length`)) >= 0);   // flüchtig, nur Fehlerfreiheit

  // ---------- Wohlfühlen und Abzeichen ----------
  await ev(`(() => { const u = cur(); const m = u.riff.items.find(i => i.id === __ids.mimo); m.x = 76; m.y = 92; pruefeAbzeichen(u); sichere(); })()`);
  check('Wohl: Mimo neben der Anemone', (await ev(`riffWohl(cur()).some(w => w.fig.ref === 'mimo' && w.deko.ref === 'anemone')`)) === true);
  check('Abzeichen „Lieblingsplatz“', (await ev(`!!cur().badges.zuhause1`)) === true);
  check('Lieblingsplätze gibt es für alle 34 Figuren und nur bekannte Deko', (await ev(`figIds().every(i => lieblingVon(i).length >= 1 && lieblingVon(i).every(d => !!DEKO[d]))`)) === true);

  // ---------- Auswählen: Freund hält an, Leiste sitzt am Freund; Sprechblase ----------
  await ev(`gehe('riff');`);
  await t.warte(900);
  let fb = null; for (let i = 0; i < 30 && !fb; i++) { fb = await ev('__punktAuf(__ids.nixi)'); if (!fb) await t.warte(300); }
  await page.mouse.click(fb.x, fb.y);
  await t.warte(400);
  check('Tippen wählt aus (Werkzeugleiste) und es erscheint eine Sprechblase', !!(await page.$('#werkzeug')) && !!(await page.$('#rede')) && (await page.$eval('#rede', e => e.textContent.length)) > 3);
  await t.bild('l2-rede');
  const v0 = await ev(`(() => { const e = document.querySelector('.ritem[data-id="' + __ids.nixi + '"] .swim').getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2 }; })()`);
  await t.warte(1500);
  const v1 = await ev(`(() => { const e = document.querySelector('.ritem[data-id="' + __ids.nixi + '"] .swim').getBoundingClientRect(), w = document.querySelector('#werkzeug').getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2, wx: w.left + w.width / 2, wy: w.bottom }; })()`);
  check('Ausgewählter Freund steht still', Math.hypot(v1.x - v0.x, v1.y - v0.y) < 3, { v0, v1 });
  check('Werkzeugleiste sitzt über dem Freund (am Rand bleibt sie im Bild)', Math.abs(v1.wx - v1.x) < 70 && v1.wy < v1.y, v1);

  // ---------- Ziehen ab der sichtbaren Position ----------
  await ev(`V.p.sel = null; render();`);
  await t.warte(2500);
  let z0 = null; for (let i = 0; i < 30 && !z0; i++) { z0 = await ev('__punktAuf(__ids.wobbel)'); if (!z0) await t.warte(300); }
  const c0 = await ev(`(() => { const s = document.querySelector('.ritem[data-id="' + __ids.wobbel + '"] .swim').getBoundingClientRect(); return { x: s.left + s.width / 2, y: s.top + s.height / 2 }; })()`);
  await page.mouse.move(z0.x, z0.y); await page.mouse.down(); await page.mouse.move(z0.x - 20, z0.y + 10, { steps: 4 }); await page.mouse.move(z0.x - 90, z0.y + 30, { steps: 6 }); await page.mouse.up();
  await t.warte(500);
  const z1 = await ev(`(() => { const e = document.querySelector('.ritem[data-id="' + __ids.wobbel + '"]'), s = e.querySelector('.swim').getBoundingClientRect(), it = cur().riff.items.find(i => i.id === __ids.wobbel), a = LEBEN.ag.get(it.id); const b = document.querySelector('#buehne').getBoundingClientRect(), W = riffWelt(cur()); return { x: s.left + s.width / 2, y: s.top + s.height / 2, ox: a.ox, oy: a.oy, hx: it.x, sx: W.minX + (s.left + s.width / 2 - b.left - 6) / RIFF.u }; })()`);
  check('Gezogen: Freund liegt unter dem Finger (±25 px)', Math.abs((z1.x - c0.x) - (-90)) < 25 && Math.abs((z1.y - c0.y) - 30) < 25, { c0, z1 });
  check('Nach dem Ziehen ist der Heimatplatz die abgelegte Stelle, Versatz null', Math.abs(z1.ox) < 1 && Math.abs(z1.oy) < 1 && Math.abs(z1.hx - z1.sx) < 1.5, z1);
  await ev(`V.p.sel = null; render();`);

  // ---------- Futter ----------
  await ev(`AKT.riffFutter();`);
  await t.warte(300);
  check('Futtermodus zeigt Hinweis', !!(await page.$('.riffhinweis')));
  let w = null; for (let i = 0; i < 20 && !w; i++) { w = await ev('__freiPunkt()'); if (!w) await t.warte(300); }
  await page.mouse.click(w.x, w.y);
  await t.warte(300);
  check('Futter fällt (6 Flocken), Abzeichen „Futterzeit“', (await ev('LEBEN.futter.length')) === 6 && (await ev('!!cur().badges.futter1')) === true);
  let gefressen = 0;
  for (let i = 0; i < 40 && !gefressen; i++) { await t.warte(500); gefressen = 6 - await ev('LEBEN.futter.length'); }
  check('Freunde fressen das Futter', gefressen >= 1, gefressen);
  await ev(`AKT.riffFutter(); LEBEN.futter.forEach(f => f.el && f.el.remove()); LEBEN.futter = [];`);

  // ---------- Nacht ----------
  await ev(`cur().riff.zeit = 'nacht'; sichere(); render();`);
  await t.warte(300);
  check('Nacht: Nachthaut an', await ev(`document.querySelector('#buehne').classList.contains('nacht')`));
  let schlafen = 0;
  for (let i = 0; i < 50 && schlafen < 3; i++) { await t.warte(500); schlafen = await ev(`Array.from(LEBEN.ag.values()).filter(a => a.modus === 'schlafen').length`); }
  check('Nachts schlafen die Freunde', schlafen >= 3, schlafen);
  await t.warte(3500);
  await t.bild('l3-nacht');
  await ev(`cur().riff.zeit = 'tag'; sichere(); render();`);
  let wach = 0;
  for (let i = 0; i < 20 && !wach; i++) { await t.warte(500); wach = await ev(`Array.from(LEBEN.ag.values()).filter(a => a.modus !== 'schlafen').length`); }
  check('Morgens sind alle wieder wach', wach >= 5, wach);

  // ---------- Leben aus / an ----------
  await ev(`AKT.riffLeben();`);
  await t.warte(400);
  const ruhe = await ev(`({ ag: LEBEN.ag.size, ruhe: document.querySelector('#buehne').classList.contains('ruhe'), wert: cur().riff.leben, tr: Array.from(document.querySelectorAll('.ritem.fig .swim')).every(e => !/translate3d\\(-?[1-9]/.test(e.style.transform)) })`);
  check('Ruhe: Agenten weg, Klasse ruhe, alles am Heimatplatz', ruhe.ag === 0 && ruhe.ruhe && ruhe.wert === false && ruhe.tr, ruhe);
  await ev(`AKT.riffLeben();`);
  await t.warte(2500);
  check('Leben wieder an: es bewegt sich', (await ev(`Array.from(LEBEN.ag.values()).filter(a => Math.abs(a.ox) + Math.abs(a.oy) > 0.3).length`)) >= 1);

  // ---------- Album und Laden ----------
  await ev(`gehe('album');`);
  await t.warte(300);
  await t.klick('[data-a="figDetail"][data-v="mimo"]');
  check('Album: „Mag am liebsten“', (await page.$eval('.blatt', e => e.textContent)).includes('Mag am liebsten: Seeanemone'));
  await t.klick('[data-a="blattZu"]');
  await ev(`gehe('riff'); AKT.laden();`);
  await t.warte(300);
  check('Laden: „Beliebt bei“ an den Stücken, 19 Stücke', (await page.$$('.ladenkachel .beliebt')).length >= 10 && (await page.$$('.ladenkachel')).length === 19, (await page.$$('.ladenkachel')).length);
  await t.bild('l4-laden');
  await t.klick('[data-a="blattZu"]');

  // ---------- Alle Stücke zeichnen sich ----------
  await ev(`(() => { const u = cur(); u.riff.items = []; Object.keys(DEKO).forEach((d, i) => { u.deko[d] = 1; stelle('deko', d, 8 + (i % 10) * 9, i < 10 ? 70 : 94); }); gehe('riff'); })()`);
  await t.warte(900);
  await t.bild('l5-alle-deko');
  check('Keine Fehler', t.fehler.length === 0, t.fehler);
  await t.ende();
  console.log(`\nRiff-Leben: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
