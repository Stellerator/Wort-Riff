// Bildschirm-Rundgang mit realistischen Daten (AppTest_Voll.zip, mehrere Tage simuliert) in Quer- oder Hochformat.
//   node tests/ansichten.js [quer|hoch]
const path = require('path');
const { oeffne, ROOT } = require('./fahrer');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };

(async () => {
  const sfx = process.argv[2] || 'hoch';
  const t = await oeffne({ heute: '2026-10-19', ansicht: sfx });
  const { page } = t;
  await page.evaluate("neuerNutzer('Mia', 'stella'); start(true);");
  await t.warte(300);

  // ---- Import des großen ZIP (168 Bilder) ----
  await t.klick('[data-a="nav"][data-v="bibliothek"]');
  const t0 = Date.now();
  await (await page.$('#fZip')).uploadFile(path.join(ROOT, '..', 'ausgabe', 'AppTest_Voll.zip'));
  await page.waitForFunction('!IMP.laeuft && IMP.bericht', { timeout: 240000 });
  const dauer = ((Date.now() - t0) / 1000).toFixed(1);
  const b = await page.evaluate('IMP.bericht');
  console.log(`  Import AppTest_Voll.zip (55 MB, 168 Bilder): ${dauer} s (Edge am Rechner; ein iPad ist langsamer)`);
  check('Voll-Import: 84 Karten, keine Fehler', b.neu === 84 && b.fehler.length === 0 && b.unvollstaendig.length === 0, b);
  const gr = await page.evaluate('(async () => { const k = await DB.keys("img"); let sum = 0; for (const x of k) { const r = await DB.get("img", x); sum += r.buf.byteLength; } return { n: k.length, mb: Math.round(sum / 1048576 * 10) / 10 }; })()');
  console.log(`  gespeichert: ${gr.n} Bilder, ${gr.mb} MB (Original-ZIP: 55,6 MB)`);
  await t.warte(500);
  await t.bild(`a1-bibliothek-${sfx}`);

  // ---- Projekte anlegen ----
  await page.evaluate(`(() => {
    const u = cur();
    window.PA = neuesProjekt(u, { name: 'Klassenarbeit Unit 4', sp: 'en', lessons: ['E04'], sets: ['DE-EN', 'EN-DE', 'EXTRA', 'BILD'], end: '2026-11-02', ziel: 3, ruhe: [0, 6] });
    window.PF = neuesProjekt(u, { name: 'Vokabeltest Bonjour', sp: 'fr', lessons: ['F01'], sets: ['DE-FR'], end: '2026-10-30', ziel: 4, ruhe: [] });
    window.PD = neuesProjekt(u, { name: 'Festigen Englisch', sp: 'en', lessons: ['E04'], sets: ['DE-EN'], dauer: true });
  })()`);

  // ---- Lerntage simulieren (20 % Fehler, 30 % "Leicht") ----
  const sim = async (tag, lernen) => {
    await page.evaluate(`window.__heute = '${tag}'; window.RNDX = rng(${tag.replace(/-/g, '').slice(4)});`);
    if (!lernen) return;
    for (const pid of ['PA', 'PF']) {
      await page.evaluate(`(() => {
        const u = cur(), P = ${pid}; if (!istAktiv(P) || !lerntag(P, heute())) return;
        for (let runde = 0; runde < 4; runde++) {
          const r = baueRunde(u, P); if (r.bonus && runde > 0) break;
          const sess = { bonus: r.bonus, antworten: [], xp: 0, perlen: 0, treffer: new Set(), rang: null };
          const gesehen = {}; const q = r.karten.slice();
          while (q.length) {
            const cid = q.shift(); const erste = !gesehen[cid]; gesehen[cid] = (gesehen[cid] || 0) + 1;
            const rr = RNDX() < 0.2 ? 0 : RNDX() < 0.3 ? 3 : 2;
            const res = bewerte(u, cid, rr); const bel = belohneAntwort(u, rr, res); sess.xp += bel.xp; sess.perlen += bel.perlen;
            sess.antworten.push({ cid, r: rr, erste });
            if (res.erledigt) planAbhaken(u, cid).forEach(p => sess.treffer.add(p.id));
            else if (gesehen[cid] < 5) q.splice(Math.min(q.length, res.gap || 3), 0, cid);
          }
          rundeEnde(u, P, sess);
          if (r.bonus) break;
        }
      })()`);
    }
  };
  const tage = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-27'];
  for (let i = 0; i < tage.length; i++) await sim(tage[i], i !== 4);          // 23.10. ausgelassen, 24./25. Wochenende
  await page.evaluate("window.__heute = '2026-10-28'; start();");
  await t.warte(500);
  const st = await page.evaluate(`({ a: stand(cur(), PA), f: stand(cur(), PF), serie: PA.serie, xp: cur().xp, muschel: muschelAnzahl(cur()), karten: Object.keys(cur().cards).length })`);
  console.log('  nach 7 Lerntagen:', JSON.stringify({ PA: Math.round(st.a.pct * 100) + '%', PF: Math.round(st.f.pct * 100) + '%', serie: st.serie.cur + '/' + st.serie.best, xp: st.xp, muscheln: st.muschel, karten: st.karten }));
  check('Serie lebt trotz ausgelassenem Tag (Flossenpause) und Wochenende', st.serie.best >= 4, st.serie);
  check('Fortschritt vorhanden', st.a.pct > 0.2 && st.f.pct > 0, st);
  await t.bild(`a2-hafen-${sfx}`);
  await page.evaluate("cur().set.sp = 'fr'; render(true)");
  await t.warte(300);
  await t.bild(`a3-hafen-fr-${sfx}`);
  await page.evaluate("cur().set.sp = 'en'; render(true)");

  // ---- Projekt-Details ----
  await page.evaluate("projektDetail(PA.id)");
  await t.warte(400);
  await t.bild(`a4-detail-${sfx}`);
  await t.klick('[data-a="blattZu"]');
  await page.evaluate("projektDetail(PD.id)");
  await t.warte(300);
  await t.bild(`a4b-detail-dauer-${sfx}`);
  await t.klick('[data-a="blattZu"]');

  // ---- Album gefüllt, Riff gefüllt ----
  await page.evaluate(`(() => {
    const u = cur(); u.tiefeMax = 150; u.muscheln = { perl: 80, schatz: 0 }; u.pity = 0;
    for (let i = 0; i < 18; i++) muschelOeffnen(u);
    u.perlen = 900; ['seegras', 'rotkoralle', 'faecher', 'hirn', 'anemone', 'muschel', 'truhe', 'anker', 'amphore', 'laterne'].forEach(d => dekoKaufen(u, d));
    Object.keys(u.owned).slice(0, 5).forEach(f => riffSetze('fig', f));
    ['seegras', 'rotkoralle', 'faecher', 'hirn', 'truhe', 'anker', 'laterne'].forEach(d => riffSetze('deko', d));
    u.riff.bg = 'korallen'; u.xp = 2800; sichere();
  })()`);
  await page.evaluate("gehe('album')"); await t.warte(400); await t.bild(`a5-album-${sfx}`);
  await page.evaluate("gehe('riff')"); await t.warte(500); await t.bild(`a6-riff-${sfx}`);
  await page.evaluate("gehe('karte')"); await t.warte(300); await t.bild(`a7-karte-${sfx}`);
  await page.evaluate("gehe('ich')"); await t.warte(300); await t.bild(`a8-ich-${sfx}`);

  // ---- Quiz-Runde ----
  await page.evaluate("cur().set.modus = 'quiz'; gehe('start')");
  await t.warte(300);
  await page.evaluate("AKT.lernStart({ dataset: { v: PA.id } })");
  await page.waitForSelector('#kb', { timeout: 8000 }); await t.warte(500);
  await t.bild(`a9-quiz-${sfx}`);
  const istQuiz = await page.evaluate("LS.modus");
  check('Quiz-Modus aktiv (Lektion mit Text)', istQuiz === 'quiz', istQuiz);
  const richtigIdx = await page.evaluate("LS.optionen.indexOf(karteText(LS.cid).antwort)");
  await t.klick(`.quiz button[data-v="${richtigIdx}"]`); await t.warte(900);
  await t.bild(`a10-quiz-antwort-${sfx}`);
  await page.evaluate("cur().set.modus = 'karten'");
  await page.evaluate("AKT.lernZu()"); await t.warte(250);
  await t.bild(`a11-lernzu-${sfx}`);
  await page.evaluate("AKT.lernEnde()"); await t.warte(2200);
  await t.bild(`a12-ergebnis-abbruch-${sfx}`);

  check('Keine Seiten-/Konsolenfehler', t.fehler.length === 0, t.fehler);
  console.log(`\nAnsichten (${sfx}): ${ok} Prüfungen bestanden, ${bad} Fehler`);
  await t.ende();
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
