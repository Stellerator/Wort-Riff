// Ablauf-Test in Edge (iPad-Maße): Nutzer, Import (Dateien/ZIP), Projekt, Lernrunde, Muschel, Album, Riff, Karte, Ich.
//   node tests/smoke.js
const path = require('path');
const fs = require('fs');
const { oeffne, dateienIn, ROOT } = require('./fahrer');

let ok = 0, bad = 0;
const check = (name, cond, extra) => { if (cond) { ok++; } else { bad++; console.log('FEHLER:', name, extra === undefined ? '' : JSON.stringify(extra)); } };

(async () => {
  const t = await oeffne({ heute: '2026-10-19', ansicht: 'quer' });
  const { page } = t;

  // ----- 1. Nutzer anlegen -----
  check('Start: Nutzer anlegen sichtbar', !!(await page.$('#nameFeld')));
  await page.type('#nameFeld', 'Mia');
  await t.klick('.avawahl button:nth-child(3)');
  await t.bild('01-neuer-nutzer');
  await page.$eval('#nameFeld', e => { /* Wert bleibt nach Avatar-Wahl erhalten */ });
  check('Name nach Avatar-Wahl noch da', (await page.$eval('#nameFeld', e => e.value)) === 'Mia');
  await t.klick('[data-a="nutzerAnlegen"]');
  await t.warte(300);
  check('Hafen erreicht', !!(await page.$('.flobox')));
  await t.bild('02-hafen-leer');

  // ----- 2. Import per Dateiauswahl (Testordner) -----
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const testDir = path.join(ROOT, '..', 'ausgabe', 'Test');
  const dateien = dateienIn(testDir);
  check('Testdateien vorhanden (14 PNG + 2 JSON)', dateien.length === 16, dateien.length);
  const fi = await page.$('#fDateien');
  await fi.uploadFile(...dateien);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  await t.warte(300);
  const b = await page.evaluate('IMP.bericht');
  check('Import: 7 Karten neu', b.neu === 7 && b.fehler.length === 0 && b.unvollstaendig.length === 0, b);
  check('Import: 2 Lektionen', b.lektionen.length === 2, b.lektionen);
  check('Import: Text erkannt', b.ohneText.length === 0, b.ohneText);
  await t.bild('03-bibliothek');
  // zweites Einlesen = Aktualisierung, keine Doppelten
  await fi.uploadFile(...dateien.slice(0, 4));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  const b2 = await page.evaluate('IMP.bericht');
  check('Erneut einlesen: aktualisiert statt doppelt', b2.neu === 0 && b2.aktualisiert === 2, b2);

  // ----- 3. ZIP mit Deflate (Python-ZIP) -----
  const tmp = path.join(__dirname, '_tmp'); fs.mkdirSync(tmp, { recursive: true });
  const { spawnSync } = require('child_process');
  const zipPfad = path.join(tmp, 'deflate.zip');
  const py = `import zipfile,sys,os\nz=zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED)\nfor r,_,fs in os.walk(sys.argv[1]):\n  for f in fs: z.write(os.path.join(r,f), os.path.relpath(os.path.join(r,f),sys.argv[1]))\nz.close()`;
  fs.writeFileSync(path.join(tmp, 'z.py'), py);
  const pz = spawnSync('python', ['-I', path.join(tmp, 'z.py'), path.join(ROOT, '..', 'ausgabe', 'Test', 'Franzoesisch_Lektion01'), zipPfad], { encoding: 'utf8' });
  check('Deflate-ZIP erzeugt', fs.existsSync(zipPfad), pz.stderr);
  await page.evaluate('DB.clear("img"); S.lib.lessons = {}; IMP.bericht = null;');
  await t.klick('[data-a="nav"][data-v="start"]'); await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const fz = await page.$('#fZip');
  await fz.uploadFile(zipPfad);
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 60000 });
  const bz = await page.evaluate('IMP.bericht');
  check('ZIP (Deflate) einlesen: 3 Französisch-Karten', bz.neu === 3 && bz.fehler.length === 0, bz);
  // wieder alles laden für den weiteren Test
  await page.$('#fDateien').then(f => f.uploadFile(...dateien));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht && IMP.bericht.neu > 0', { timeout: 60000 });

  // ----- 4. Projekt anlegen (Assistent) -----
  await t.klick('[data-a="nav"][data-v="start"]');
  await t.klick('[data-a="projektNeu"]');
  await t.bild('04-wizard-1');
  await t.klick('[data-a="wzWeiter"]');
  if (!(await page.$('.lkwahl .wahlkarte.an'))) await t.klick('[data-a="wzLk"]');   // bei nur einer Lektion ist sie schon vorgewählt
  check('Assistent: Lektion vorgewählt/gewählt', !!(await page.$('.lkwahl .wahlkarte.an')));
  await t.bild('05-wizard-lektion');
  await t.klick('[data-a="wzWeiter"]');
  await t.bild('06-wizard-zeit');
  await t.klick('[data-a="wzTage"][data-v="14"]');
  await t.klick('[data-a="wzWeiter"]');
  await t.bild('07-wizard-ziel');
  await t.klick('[data-a="wzWeiter"]');
  await t.bild('08-wizard-name');
  await t.klick('[data-a="wzFertig"]');
  await t.warte(500);
  const proj = await page.evaluate('Object.values(cur().projects).map(p => ({ name: p.name, n: projektKarten(p).length, end: p.end, ziel: p.ziel }))');
  check('Projekt angelegt', proj.length === 1 && proj[0].n >= 4, proj);
  await t.bild('09-hafen-projekt');

  // ----- 5. Lernrunde -----
  await t.klick('[data-a="lernStart"]');
  await page.waitForSelector('#kb', { timeout: 8000 });
  await t.warte(400);
  await t.bild('10-lernen-vorne');
  await t.klick('[data-a="umdrehen"]');
  await t.warte(700);
  await t.bild('11-lernen-hinten');
  let n = 0;
  while ((await page.$('#kb')) && n < 40) {
    n++;
    if (!(await page.$('.antw'))) { await t.klick('[data-a="umdrehen"]'); await t.warte(250); }
    const r = n % 4 === 1 ? 1 : 2;           // zwischendurch "Schwer", sonst "Gut"
    await t.klick(`.antw button[data-v="${r}"]`);
    await t.warte(330);
  }
  await page.waitForSelector('.ergebnis', { timeout: 8000 });
  await t.warte(2000);
  await t.bild('12-ergebnis');
  check('Ergebnis zeigt Belohnungen', (await page.$$('.bz')).length >= 2);
  const erledigt = await page.evaluate('(() => { const u = cur(), P = Object.values(u.projects)[0]; const pl = heutePlan(u, P); return { ziel: pl.ziel, fertig: planGeschafft(pl), tz: pl.fertig, runden: u.stats.runden, xp: u.xp }; })()');
  check('Tagesplan wurde bearbeitet', erledigt.fertig > 0 && erledigt.runden === 1 && erledigt.xp > 0, erledigt);

  // ----- 6. Muschel -----
  const m = await page.evaluate('muschelAnzahl(cur())');
  check('Muschel(n) erhalten', m >= 2, m);
  await t.klick('[data-a="muschelStart"]');
  await t.warte(600);
  await t.bild('13-muschel-zu');
  await t.klick('#schale');
  await t.warte(2300);
  await t.bild('14-muschel-offen');
  check('Muschel offen: Name sichtbar', (await t.text('.muschel .name')).length > 2);
  await t.klick('[data-a="muschelFertig"]');
  await t.warte(300);
  await t.bild('15-album');
  check('Album sichtbar', !!(await page.$('.figraster')));
  check('Album: gesperrte Serien zeigen Tiefe an', (await page.$$('.serie.gesperrt')).length === 3 && /ab 10 m Tiefe/.test(await page.$eval('.serie.gesperrt h3', e => e.textContent)));
  await t.klick('[data-a="chancen"]'); await t.warte(300);
  await t.bild('15b-chancen');
  const chTxt = await page.$eval('.blatt', e => e.textContent);
  check('Chancen: nennt Zonen und Tiefen', /Korallenriff/.test(chTxt) && /ab 10 m Tiefe/.test(chTxt) && /ab 100 m Tiefe/.test(chTxt) && /ab 400 m Tiefe/.test(chTxt));
  await t.klick('[data-a="blattZu"]');
  await t.klick('.figkachel:not(.zu)');
  await t.warte(300);
  await t.bild('16-figur-detail');
  await t.klick('[data-a="blattZu"]');

  // ----- 7. Riff -----
  await t.klick('[data-a="nav"][data-v="riff"]');
  await t.klick('.rtile');
  await t.warte(200);
  await page.evaluate('cur().perlen = 400; sichere();');
  await t.klick('[data-a="laden"]');
  await t.warte(300);
  await t.bild('17-riff-laden');
  for (const id of ['seegras', 'truhe', 'rotkoralle']) await page.evaluate(`dekoKaufen(cur(), '${id}')`);
  await t.klick('[data-a="blattZu"]');
  await page.evaluate("render()");
  for (let i = 0; i < 3; i++) { const el = await page.$('.rtile[data-k="deko"]'); if (el) { await el.click(); await t.warte(150); } }
  await t.warte(300);
  await t.bild('18-riff');
  const items = await page.evaluate('cur().riff.items.length');
  check('Riff: Teile platziert', items >= 3, items);
  // Ziehen per Zeiger
  const it = await page.$('.ritem');
  const box = await it.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 - 40, { steps: 6 }); await page.mouse.up();
  await t.warte(300);
  check('Riff: Werkzeugleiste nach Tipp', !!(await page.$('#werkzeug')));

  // ----- 8. Karte, Ich -----
  await t.klick('[data-a="nav"][data-v="karte"]'); await t.warte(300);
  await t.bild('19-karte');
  await t.klick('[data-a="nav"][data-v="ich"]'); await t.warte(300);
  await t.bild('20-ich');

  // ----- Persistenz: Neu laden, Zustand bleibt -----
  await page.evaluate('sichereJetzt()');
  await t.warte(300);
  await page.reload(); await page.waitForFunction('window.__bereit === true');
  await t.warte(300);
  const nach = await page.evaluate('({ users: Object.keys(S.users).length, lekt: Object.keys(S.lib.lessons).length, items: cur() ? cur().riff.items.length : -1 })');
  check('Nach Neuladen: Nutzer, Lektionen und Riff noch da', nach.users === 1 && nach.lekt === 2 && nach.items >= 3, nach);
  await t.bild('21-nach-neuladen');

  check('Keine Seiten-/Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`\nSmoke: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  if (t.fehler.length) console.log(t.fehler.join('\n'));
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
