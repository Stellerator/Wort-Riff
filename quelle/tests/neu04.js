// V04: Augen schließen nachts, Sperre für Tiere im Riff, Mythen der Tiefe, Generalprobe mit Überraschungspaket.
//   node tests/neu04.js
const path = require('path');
const { oeffne, dateienIn, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;
  const ev = s => page.evaluate(s);
  const bis = async (bed, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(bed)) return true; await t.warte(300); } return false; };

  // ---------- Aufbau ----------
  await ev(`(() => { neuerNutzer('Mia', 'finn'); const u = cur(); u.perlen = 500;
    ['finn', 'mimo', 'nixi'].forEach(i => { u.owned[i] = { n: 1, stern: 1, ts: 1, neu: false }; });
    window.stelle = (kind, ref, x, y) => { const it = riffSetze(kind, ref); it.x = x; it.y = y; return it; };
    window.__ids = { finn: stelle('fig', 'finn', 30, 60).id, mimo: stelle('fig', 'mimo', 55, 70).id };
    sichere(); gehe('riff'); })()`);
  await t.warte(800);

  // ---------- Augen zu bei Nacht ----------
  check('Augen haben Offen- und Zu-Variante', (await ev(`document.querySelectorAll('.ritem.fig .aug .auf').length`)) >= 2 && (await ev(`document.querySelectorAll('.ritem.fig .aug .zu').length`)) >= 2);
  check('Tagsüber: niemand schläft, Augen offen', (await ev(`document.querySelectorAll('.fx.schlaf').length`)) === 0 && (await ev(`getComputedStyle(document.querySelector('.ritem.fig .aug .zu')).display`)) === 'none');
  await ev(`cur().riff.zeit = 'nacht'; sichere(); gehe('riff');`);
  const schlaeft = await bis(`document.querySelectorAll('.fx.schlaf').length >= 2`, 40000);
  check('Nachts schlafen die Freunde (.schlaf)', schlaeft);
  check('Schlafende: Lidbogen sichtbar, offenes Auge weg', schlaeft && (await ev(`(() => { const z = document.querySelector('.fx.schlaf .aug .zu'), a = document.querySelector('.fx.schlaf .aug .auf'); return getComputedStyle(z).display !== 'none' && getComputedStyle(a).display === 'none'; })()`)) === true);
  await t.bild('n4-nacht-augen');
  await ev(`cur().riff.leben = false; sichere(); gehe('riff');`);
  await t.warte(500);
  check('Ruhe-Modus bei Nacht: Augen ebenfalls zu', (await ev(`getComputedStyle(document.querySelector('.ritem.fig .aug .zu')).display`)) !== 'none');
  await ev(`cur().riff.leben = true; cur().riff.zeit = 'tag'; sichere(); gehe('riff');`);
  await t.warte(500);
  check('Wieder Tag: Augen auf', (await ev(`document.querySelectorAll('.fx.schlaf').length`)) === 0);

  // ---------- Sperre ----------
  await t.warte(600);
  const mitte = async id => ev(`(() => { const r = document.querySelector('.ritem[data-id="${id}"] .swim').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 }; })()`);
  let p = await mitte(await ev('__ids.finn'));
  await page.mouse.click(p.x, p.y); await t.warte(250);
  check('Ohne Sperre: Tippen wählt ein Tier aus', (await ev('!!V.p.sel')) === true);
  check('Sperr-Knopf (Schloss) ist da', !!(await page.$('.riffwerk [data-a="riffSperre"]')));
  await t.klick('.riffwerk [data-a="riffSperre"]');
  check('Sperre an: Bühne markiert, Auswahl gelöscht, gespeichert', (await ev(`!!document.querySelector('#buehne.gesperrt') && !V.p.sel && cur().riff.sperre === true`)) === true);
  p = await mitte(await ev('__ids.mimo'));
  const treffer = await ev(`(() => { const e = document.elementFromPoint(${p.x}, ${p.y}); return e ? !!e.closest('.ritem') : null; })()`);
  check('Gesperrt: Berührung geht durchs Tier hindurch', treffer === false, treffer);
  await page.mouse.click(p.x, p.y); await t.warte(250);
  check('Gesperrt: Tippen wählt nichts aus', (await ev('!V.p.sel')) === true);
  await ev(`AKT.riffFutter()`); await t.warte(150);
  const f0 = await ev('LEBEN.futter.length');
  await page.mouse.click(p.x, p.y); await t.warte(250);
  check('Gesperrt: Futter streuen klappt auch über einem Tier', (await ev('LEBEN.futter.length')) > f0);
  await ev(`AKT.riffFutter()`);
  await t.klick('.riffwerk [data-a="riffSperre"]');
  check('Sperre aus: wieder antippbar', (await ev(`!document.querySelector('#buehne.gesperrt') && cur().riff.sperre === false`)) === true);
  p = await mitte(await ev('__ids.finn'));
  await page.mouse.click(p.x, p.y); await t.warte(250);
  check('Nach dem Aufheben wählt Tippen wieder aus', (await ev('!!V.p.sel')) === true);

  // ---------- Mythen: Katalog ----------
  check('10 Mythen mit Zeichnung, Name, Text und Leuchtfarbe', (await ev(`mythIds().length === 10 && mythIds().every(i => MYTH[i].name && MYTH[i].text && /^#/.test(MYTH[i].glow) && mythSvg(i).includes('<svg') && mythSvg(i).includes('<animate'))`)) === true);
  check('Fünf Fabelwesen und fünf Gegenstände', (await ev(`mythIds().filter(i => MYTH[i].wesen).length === 5`)) === true);
  check('Mythen sind nicht im Riff-Laden', (await ev(`mythIds().every(i => !DEKO[i] && !FIG[i])`)) === true);

  // ---------- Mythen: in der Muschel ----------
  await ev(`(() => { const u = cur(); u.tiefeMax = 100; u.muscheln = { perl: 2, schatz: 0 }; window.__r0 = rand; rand = () => 0.001; })()`);
  check('Muschel: bei Glück ein Mythos (mythisch, nicht im Schutzzähler)', (await ev(`(() => { const r = muschelOeffnen(cur()); cur().muscheln.perl++; return r.myth === true && r.neu === true && !!MYTH[r.id]; })()`)) === true);
  check('Mythos liegt im Besitz, Abzeichen „Mystisches Leuchten“', (await ev(`mythZahl(cur()) === 1 && !!cur().badges.mythos1`)) === true);
  await ev(`gehe('album'); AKT.muschelStart();`);
  await ev(`AKT.muschelAuf();`);
  await t.warte(1900);
  check('Muschel-Ansicht: „Ein mystischer Fund!“ mit leuchtender Zeichnung', (await t.text('#mTitel')) === 'Ein mystischer Fund!' && !!(await page.$('.mythfund svg')));
  const mname = await ev(`(() => { const n = document.querySelector('#mInfo .name'); return n ? n.textContent : ''; })()`);
  check('Muschel zeigt Namen und „Doppelt“-Gewinn (zweiter Fund gleicher Art)', mname.length > 3 && (await ev(`!!document.querySelector('#mInfo .chip.gold')`)) === true, mname);
  await t.bild('n4-muschel-mythos');
  await ev(`rand = window.__r0;`);
  await ev(`gehe('album');`); await t.warte(400);
  check('Album: Mythen-Reihe mit 10 Kacheln', (await ev(`document.querySelectorAll('.serie.myth .mythkachel').length`)) === 10);
  check('Album: 1 gefunden, 9 noch verhüllt', (await ev(`document.querySelectorAll('.serie.myth .mythkachel.zu').length`)) === 9);
  await ev(`AKT.mythDetail({ dataset: { v: Object.keys(mythBesitz(cur()))[0] } })`); await t.warte(300);
  check('Mythos-Fenster mit „Ins Riff setzen“', (await ev(`!!document.querySelector('.mythdetail [data-a="mythRiff"]')`)) === true);
  await t.bild('n4-mythos-detail');
  await ev(`schliesseBlatt();`);
  await ev(`(() => { const u = cur(); ['dreizack', 'kristall', 'krone', 'wunschperle', 'tor', 'selene', 'naga', 'ignis', 'atlas', 'cirrus'].forEach(i => { mythBesitz(u)[i] = mythBesitz(u)[i] || { n: 1, ts: 1, neu: false }; }); sichere(); })()`);
  await ev(`gehe('riff')`); await t.warte(500);
  check('Lager zeigt die Mythen', (await ev(`document.querySelectorAll('.rtile.mythtile').length`)) === 10);
  await ev(`(() => { const u = cur(); u.riff.items = []; window.__m = {}; window.__m.selene = stelle('myth', 'selene', 30, 60).id; window.__m.naga = stelle('myth', 'naga', 70, 66).id; stelle('myth', 'kristall', 50, 92); stelle('myth', 'tor', 88, 90); stelle('myth', 'wunschperle', 14, 92); stelle('myth', 'krone', 60, 40); stelle('fig', 'finn', 45, 80); sichere(); gehe('riff'); })()`);
  await t.warte(700);
  check('Riff: Fabelwesen sind „wesen“, Gegenstände nicht', (await ev(`document.querySelectorAll('.ritem.myth.wesen').length === 2 && document.querySelectorAll('.ritem.myth:not(.wesen)').length === 4`)) === true);
  check('Riff: Mythen haben Leuchtfarbe (--mg)', (await ev(`Array.from(document.querySelectorAll('.ritem.myth')).every(e => /#/.test(e.style.getPropertyValue('--mg')))`)) === true);
  await t.warte(5000);
  check('Fabelwesen schwimmen von selbst (Agenten, Versatz)', (await ev(`(() => { const a = Array.from(LEBEN.ag.values()).filter(x => /^m_/.test(x.art)); return a.length === 2 && a.some(x => Math.abs(x.ox) + Math.abs(x.oy) > 0.3); })()`)) === true);
  check('Gegenstände funkeln (Teilchen) oder Wesen sprechen beim Antippen', (await ev(`document.querySelectorAll('#teile .teil').length`)) >= 1);
  await t.bild('n4-riff-mythen-tag');
  await ev(`cur().riff.zeit = 'nacht'; sichere(); gehe('riff');`);
  await t.warte(3800);
  await t.bild('n4-riff-mythen-nacht');
  check('Nachts leuchten Mythen stärker (Filter)', /drop-shadow/.test(await ev(`getComputedStyle(document.querySelector('.ritem.myth svg')).filter`)));
  const mp = await mitte(await ev('__m.selene'));
  await page.mouse.click(mp.x, mp.y); await t.warte(400);
  check('Antippen eines Fabelwesens zeigt eine Sprechblase', (await ev(`!!document.querySelector('#rede')`)) === true);
  await ev(`cur().riff.zeit = 'auto'; V.p.sel = null; sichere();`);

  // ---------- Pakete: Logik ----------
  check('Paketstufen: 4→0, 5→1, 15→2, 30→3, 60→4', (await ev(`[4, 5, 14, 15, 30, 59, 60, 200].map(paketStufeFuer).join()`)) === '0,1,1,2,3,3,4,4');
  const pk = await ev(`(() => {
    const u = cur(); u.tiefeMax = 1000; const out = {};
    for (const s of [1, 2, 3, 4]) {
      let min = 99, max = 0, kat = {};
      for (let k = 0; k < 60; k++) { paketBesitz(u)[s] = 1; const r = paketOeffnen(u, s); min = Math.min(min, r.preise.length); max = Math.max(max, r.preise.length); r.preise.forEach(x => { kat[x.typ] = (kat[x.typ] || 0) + 1; }); }
      out[s] = { min, max, kat };
    }
    return out; })()`);
  check('Pakete: Stufe 1–4 enthalten genau 1–4 Plätze', [1, 2, 3, 4].every(s => pk[s].min === s && pk[s].max === s), pk);
  check('Pakete: Perlen, Funken, Freunde und Gegenstände kommen vor', ['perlen', 'funken', 'freund'].every(k => pk[4].kat[k] > 0) && (pk[4].kat.deko > 0 || pk[4].kat.myth > 0), pk[4].kat);
  check('Pakete: unbezahlbar ohne Besitz (kein Paket = null)', (await ev(`(() => { const u = cur(); paketBesitz(u)[3] = 0; return paketOeffnen(u, 3) === null; })()`)) === true);
  check('Mythen in Paketen sind selten (Stufe 1 nie, Stufe 4 höchstens ~35 % der Pakete)', (pk[1].kat.myth || 0) === 0 && (pk[4].kat.myth || 0) <= 35, pk[4].kat);

  // ---------- Generalprobe ----------
  await ev(`start(true)`);
  await ev(`(() => { const u = cur(); u.riff.zeit = 'auto'; sichere(); })()`);
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(...dateienIn(path.join(ROOT, '..', 'ausgabe', 'Test')));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await ev(`(() => { const u = cur(); window.PF = neuesProjekt(u, { name: 'Französisch', sp: 'fr', lessons: ['F01'], sets: ['DE-FR'], end: '2026-11-02', ziel: 3, ruhe: [] }); u.set.sp = 'fr'; u.set.modus = 'karten'; start(); })()`);
  await t.warte(400);
  check('Hafen: Knopf „Generalprobe vor dem Test“ am Projekt', !!(await page.$('[data-a="probeNeu"]')));
  const nKarten = await ev(`projektKarten(PF).length`);
  const vorher = await ev(`(() => { const u = cur(); heutePlan(u, PF); return JSON.stringify({ c: u.cards, h: PF.heute, xp: u.xp, perlen: u.perlen, stats: u.stats.antworten, serie: PF.serie }); })()`);
  await ev(`AKT.probeNeu({ dataset: { v: PF.id } })`); await t.warte(400);
  check('Generalprobe-Fenster: alle Karten stehen zur Auswahl, alle gewählt', (await ev(`document.querySelectorAll('#probeListe .prow').length === projektKarten(PF).length && PB.sel.size === projektKarten(PF).length`)) === true, nKarten);
  await t.bild('n4-probe-auswahl');
  await ev(`AKT.probeFilter({ dataset: { v: 'keine' } })`);
  check('Schnellfilter „Keine“ leert die Auswahl, Start gesperrt', (await ev(`PB.sel.size === 0 && document.querySelector('#probeGo').disabled`)) === true);
  await ev(`AKT.probeFilter({ dataset: { v: 'neu' } })`);
  check('Schnellfilter „Noch nie geübt“ wählt alle (noch nichts geübt)', (await ev(`PB.sel.size === projektKarten(PF).length`)) === true);
  await ev(`AKT.probeFilter({ dataset: { v: 'falsch' } })`);
  check('Schnellfilter „Schon mal falsch“ ist anfangs leer', (await ev(`PB.sel.size === 0`)) === true);
  await ev(`AKT.probeFilter({ dataset: { v: 'zufall' } })`);
  check('Schnellfilter „Zufällig 20“ wählt höchstens 20', (await ev(`PB.sel.size === Math.min(20, projektKarten(PF).length)`)) === true);
  const erstes = await ev(`projektKarten(PF)[0]`);
  await ev(`AKT.probeFilter({ dataset: { v: 'keine' } }); AKT.probeKarte({ dataset: { v: ${JSON.stringify(erstes)} } })`);
  check('Einzelne Karte per Haken wählen', (await ev(`PB.sel.size === 1 && PB.sel.has(${JSON.stringify(erstes)})`)) === true);
  await ev(`AKT.probeFilter({ dataset: { v: 'alle' } }); AKT.probeModus({ dataset: { v: 'karten' } });`);
  await ev(`AKT.probeStart()`);
  check('Generalprobe startet in der Lern-Ansicht, Plan-Ring ersetzt durch „Generalprobe“', await bis(`V.name === 'lernen' && !!LS && LS.probe === true`, 8000) && (await ev(`document.querySelector('.kopfzeile').textContent.includes('Generalprobe')`)) === true);
  // alle Karten beantworten: jede dritte falsch, jede vierte „wackelig“
  let i = 0;
  while ((await ev(`V.name === 'lernen'`)) && i < nKarten + 5) {
    const r = i % 3 === 0 ? 0 : i % 4 === 1 ? 1 : 2;
    await ev(`AKT.umdrehen(); AKT.antwort({ dataset: { v: '${r}' } });`);
    await t.warte(340); i++;
  }
  check('Auswertung erscheint, jede Karte genau einmal gefragt', await bis(`V.name === 'probeErg'`, 8000) && (await ev(`LS.erg.n === ${nKarten}`)) === true, { n: nKarten, i });
  const e = await ev(`LS.erg`);
  check('Auswertung zählt gewusst/wackelig/falsch richtig', e.gewusst + e.wackelig + e.falsch === e.n && e.falsch === e.falschListe.length && e.wackelig === e.wackelListe.length, e);
  const nach = await ev(`JSON.stringify({ c: cur().cards, h: PF.heute, xp: cur().xp, perlen: cur().perlen, stats: cur().stats.antworten, serie: PF.serie })`);
  check('Lernplan unverändert: Karten, Tagesplan, XP, Perlen, Serie', nach === vorher);
  const stufe = await ev(`paketStufeFuer(${nKarten})`);
  check('Paket gemäß Kartenzahl', (await ev(`LS.erg.paket.stufe`)) === stufe, { stufe, paket: e.paket });
  await t.bild('n4-probe-auswertung');
  if (stufe) {
    check('Auswertung zeigt das verdiente Paket mit „Auspacken“', !!(await page.$('.paketkarte [data-a="paketStart"]')));
    check('Paket liegt im Besitz, Kopfleiste zeigt den Paket-Knopf', (await ev(`paketAnzahl(cur()) >= 1`)) === true && !!(await page.$('[data-a="paketStart"]')));
    await ev(`AKT.paketStart()`); await t.warte(300);
    check('Paket-Ansicht mit Paketbild', !!(await page.$('.paketbuehne .paketbild')));
    await t.bild('n4-paket-zu');
    const n0 = await ev(`paketAnzahl(cur())`), perl0 = await ev(`cur().perlen + (cur().funken || 0) + Object.keys(cur().owned).length + Object.keys(cur().deko).length`);
    await ev(`AKT.paketAuf()`);
    const plaetze = await ev(`PAKET[V.p.stufe].plaetze`);
    await t.warte(1000 + plaetze * 900 + 900);
    check('Auspacken: so viele Preise wie Plätze', (await ev(`document.querySelectorAll('.pp').length`)) === plaetze, plaetze);
    check('Paket ist verbraucht, Inhalt gutgeschrieben', (await ev(`paketAnzahl(cur())`)) === n0 - 1 && (await ev(`cur().perlen + (cur().funken || 0) + Object.keys(cur().owned).length + Object.keys(cur().deko).length`)) > perl0);
    await t.bild('n4-paket-offen');
  }
  // zweite Probe am selben Tag: kein weiteres Paket
  await ev(`AKT.probeNeu({ dataset: { v: PF.id } })`); await t.warte(300);
  await ev(`AKT.probeFilter({ dataset: { v: 'alle' } }); AKT.probeModus({ dataset: { v: 'karten' } }); AKT.probeStart();`);
  await bis(`V.name === 'lernen'`, 8000);
  i = 0;
  while ((await ev(`V.name === 'lernen'`)) && i < nKarten + 5) { await ev(`AKT.umdrehen(); AKT.antwort({ dataset: { v: '2' } });`); await t.warte(340); i++; }
  await bis(`V.name === 'probeErg'`, 8000);
  check('Zweite Generalprobe am selben Tag: kein zweites Paket', (await ev(`LS.erg.paket.stufe === 0 && LS.erg.paket.grund === '${stufe ? 'heute' : 'zuwenig'}'`)) === true);
  check('Abzeichen „Generalprobe“ nur bei mindestens 5 Karten', (await ev(`!!cur().badges.probe1`)) === (nKarten >= 5));
  check('Generalprobe wurde nicht als Lernrunde gezählt', (await ev(`cur().stats.runden`)) === 0);
  // Abbruch mit wenigen Antworten
  await ev(`AKT.probeNeu({ dataset: { v: PF.id } })`); await t.warte(300);
  await ev(`AKT.probeFilter({ dataset: { v: 'keine' } }); AKT.probeKarte({ dataset: { v: ${JSON.stringify(erstes)} } }); AKT.probeStart();`);
  await bis(`V.name === 'lernen'`, 8000);
  await ev(`AKT.umdrehen(); AKT.antwort({ dataset: { v: '2' } });`); await t.warte(500);
  check('Eine Karte allein: Auswertung ohne Paket', await bis(`V.name === 'probeErg'`, 6000) && (await ev(`LS.erg.n === 1 && LS.erg.paket.stufe === 0`)) === true);
  check('„Nur die Fehler nochmal“ nur wenn etwas wackelte', (await ev(`LS.erg.falschListe.length + LS.erg.wackelListe.length === 0`)) === true && !(await page.$('[data-a="probeFehler"]')));

  // ---------- Paket-Fluss mit einer größeren Lektion (70 Karten) ----------
  const zz = require('../werkzeuge/zipschreiben'), zipDatei = path.join(ROOT, 'tests', '_tmp', 'neu04_E09.zip');
  zz.zipSchreiben(zz.testPaket('E09', 9, 'Testlektion', 70), zipDatei);
  await ev('start(true)');
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  await (await page.$('#fDateien')).uploadFile(zipDatei);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await ev(`(() => { const u = cur(); window.PE = neuesProjekt(u, { name: 'Englisch', sp: 'en', lessons: ['E09'], sets: ['DE-EN'], end: '2026-11-02', ziel: 3, ruhe: [] }); start(); })()`);
  check('Große Lektion: 70 Karten im Projekt', (await ev('projektKarten(PE).length')) === 70);
  await ev('AKT.probeNeu({ dataset: { v: PE.id } })'); await t.warte(400);
  await ev(`AKT.probeFilter({ dataset: { v: 'zufall' } }); AKT.probeModus({ dataset: { v: 'karten' } });`);
  check('Zufällig 20 von 70', (await ev('PB.sel.size')) === 20);
  await ev('AKT.probeStart()');
  await bis(`V.name === 'lernen'`, 8000);
  i = 0;
  while ((await ev(`V.name === 'lernen'`)) && i < 30) { await ev(`AKT.umdrehen(); AKT.antwort({ dataset: { v: '${i % 5 === 0 ? 0 : 2}' } });`); await t.warte(340); i++; }
  await bis(`V.name === 'probeErg'`, 8000);
  check('20 Karten abgefragt → Paket Stufe 2', (await ev(`LS.erg.n === 20 && LS.erg.paket.stufe === 2 && LS.erg.paket.grund === 'ok'`)) === true);
  check('Auswertung zeigt das Paket mit „Auspacken“', !!(await page.$('.paketkarte [data-a="paketStart"]')));
  await t.bild('n4-probe-auswertung-paket');
  await ev('AKT.paketStart()'); await t.warte(300);
  check('Paket-Ansicht mit Paketbild', !!(await page.$('.paketbuehne .paketbild')));
  await t.bild('n4-paket-zu');
  const vor = await ev('cur().perlen + (cur().funken || 0) + Object.keys(cur().owned).length + Object.keys(cur().deko).length + mythZahl(cur())');
  await ev('AKT.paketAuf()');
  await t.warte(1000 + 2 * 900 + 900);
  check('Auspacken: zwei Preise für Stufe 2', (await ev(`document.querySelectorAll('.pp').length`)) === 2);
  check('Paket verbraucht, Inhalt gutgeschrieben', (await ev('paketAnzahl(cur())')) === 0 && (await ev('cur().perlen + (cur().funken || 0) + Object.keys(cur().owned).length + Object.keys(cur().deko).length + mythZahl(cur())')) > vor);
  await t.bild('n4-paket-offen');
  await ev(`(() => { const u = cur(); u.tiefeMax = 1000; paketBesitz(u)[4] = 1; gehe('paket', { phase: 'zu', stufe: 4 }); })()`);
  await t.warte(300);
  await ev('AKT.paketAuf()');
  await t.warte(1000 + 4 * 900 + 900);
  check('Stufe 4: vier Preise sichtbar', (await ev(`document.querySelectorAll('.pp').length`)) === 4);
  await t.bild('n4-paket4-offen');

  check('Keine Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`Neu in V04: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('Abbruch:', e.message); process.exit(1); });
