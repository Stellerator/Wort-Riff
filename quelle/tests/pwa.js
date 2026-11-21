// Web-App im Browser: Service Worker, Offline-Start, App-Update, Kartenpakete aus dem Repo (index.json), Umzug per Sicherung, Teilen-Blatt.
// Baut zuerst das Repo (repo-bauen.js) und spielt gegen einen lokalen Testserver, der sich wie GitHub Pages verhält.
//   node tests/pwa.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { starteServer } = require('./_server');
const { starte } = require('./_edge');
const { zipBytes, testPaket } = require('../werkzeuge/zipschreiben.js');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..', 'Wortriff_Repo');
let ok = 0, bad = 0;
const check = (n, c, e) => { if (c) ok++; else { bad++; console.log('FEHLER:', n, e === undefined ? '' : JSON.stringify(e)); } };
const warte = ms => new Promise(r => setTimeout(r, ms));
const sha = require('crypto');
const gitSha = b => sha.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest('hex');

(async () => {
  execFileSync(process.execPath, ['repo-bauen.js'], { cwd: ROOT, stdio: 'ignore' });
  const versionJson = JSON.parse(fs.readFileSync(path.join(REPO, 'version.json'), 'utf8'));
  const ID = versionJson.id;

  // Testseite: echte App-Dateien, aber nur kleine Testpakete statt der großen echten Kartenpakete
  const A = await starteServer(path.join(REPO));
  const paket = (praefix, nr, titel, n, farbe) => zipBytes(testPaket(praefix, nr, titel, n, farbe));
  const indexFuer = pakete => Buffer.from(JSON.stringify({ format: 1, pakete: pakete.map(p => ({ datei: p.datei, bytes: p.buf.length, sha: gitSha(p.buf), name: p.name, lektionen: [{ key: p.key, titel: p.titel, karten: p.n }] })) }));
  const setzePakete = (srv, pakete) => {
    for (const k of Array.from(srv.extra.keys())) if (k.startsWith('/karten/')) srv.extra.delete(k);
    pakete.forEach(p => srv.extra.set('/karten/' + p.datei, p.buf));
    srv.extra.set('/karten/index.json', indexFuer(pakete));
  };
  let P1 = { datei: 'Test_E09.zip', buf: paket('E09', 9, 'Testlektion 9', 3), name: 'Test · E09', key: 'E09', titel: 'Testlektion 9', n: 3 };
  setzePakete(A, [P1]);

  const browser = await starte();
  const fehler = [];
  const oeffne = async (ctx, url) => {
    const page = await ctx.newPage();
    await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1, isMobile: false, hasTouch: true });
    page.on('pageerror', e => fehler.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
    page.on('dialog', d => d.dismiss());
    await page.goto(url);
    await page.waitForFunction('window.__bereit === true', { timeout: 20000 });
    return page;
  };

  try {
    const ctxA = await browser.createBrowserContext();
    let page = await oeffne(ctxA, A.url);

    // ---------- Service Worker, Manifest ----------
    await page.waitForFunction('navigator.serviceWorker && navigator.serviceWorker.controller', { timeout: 20000 }).catch(() => {});
    const info = await page.evaluate(`(async () => ({ web: UPD.web, ctl: !!navigator.serviceWorker.controller, caches: await caches.keys(), manifest: !!document.querySelector('link[rel=manifest]'), icon: !!document.querySelector('link[rel=apple-touch-icon]'), id: APP_ID }))()`);
    check('Web-Modus erkannt', info.web === true);
    check('Service Worker übernimmt die Seite', info.ctl === true, info);
    check('Offline-Kopie angelegt (wortriff-V04-<Kennung>)', info.caches.some(c => c === 'wortriff-V04-' + ID), info.caches);
    check('Manifest und Symbol verlinkt', info.manifest && info.icon);
    check('App kennt ihre Kennung = version.json', info.id === ID, { id: info.id, ID });
    const mani = await page.evaluate(`fetch('manifest.webmanifest').then(r => r.json())`);
    check('Manifest: Name, Start, Anzeige', mani.name === 'Wortriff' && mani.display === 'standalone' && mani.start_url === './' && mani.icons.length >= 2, mani);
    check('Erste Seite bietet Umzug aus Sicherung an', !!(await page.$('.umzug [data-a="sicherungWahl"]')));
    await page.waitForFunction('UPD.ergebnis || !UPD.laeuft', { timeout: 20000 }).catch(() => {});

    // ---------- Nutzer mit Lernstand anlegen ----------
    await page.evaluate("neuerNutzer('Mia', 'finn'); const u = cur(); u.xp = 777; u.perlen = 123; u.cards['E09_DE-EN_001'] = { b: 3, due: '2026-12-01', iv: 6, ease: 2.5, lapses: 0, step: 0, n: 5, ok: 5, last: '2026-11-17' }; u.deko.seegras = 1; sichere(); start();");
    await warte(300);

    // ---------- Kartenpaket aus dem Repo (index.json) ----------
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('!UPD.laeuft && UPD.ergebnis', { timeout: 30000 });
    let lek = await page.evaluate(`({ L: S.lib.lessons.E09 ? Object.keys(S.lib.lessons.E09.cards).length : -1, text: S.lib.lessons.E09 && S.lib.lessons.E09.hasText, keys: null, erg: UPD.ergebnis.text })`);
    check('Neues Paket aus index.json wurde geladen (3 Karten)', lek.L === 3 && lek.text === true, lek);
    check('Bilder liegen im Speicher', (await page.evaluate(`(async () => (await DB.keys('img')).filter(k => k.startsWith('E09_')).length)()`)) === 6);
    const rec = await page.evaluate(`DB.get('kv', 'repo')`);
    check('Gemerkt, was geladen wurde (nur auf diesem Gerät)', rec && rec.pakete['Test_E09.zip'] && rec.pakete['Test_E09.zip'].sha === gitSha(P1.buf), rec);
    check('Ergebnis nennt das geladene Paket', /1 Kartenpaket geladen/.test(await page.evaluate('UPD.ergebnis.text')), await page.evaluate('UPD.ergebnis.text'));
    const n1 = A.zugriffe.filter(p => p === '/karten/Test_E09.zip').length;
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('!UPD.laeuft', { timeout: 20000 });
    check('Unverändertes Paket wird nicht noch einmal geladen', A.zugriffe.filter(p => p === '/karten/Test_E09.zip').length === n1);

    // geändertes Paket (neue Wörter) → Lektion ist noch da → wird nachgezogen
    P1 = { ...P1, buf: paket('E09', 9, 'Testlektion 9', 4, [200, 60, 60]), n: 4 };
    setzePakete(A, [P1]);
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('!UPD.laeuft', { timeout: 30000 });
    check('Geändertes Paket aktualisiert die Lektion (4 Karten)', (await page.evaluate('Object.keys(S.lib.lessons.E09.cards).length')) === 4);

    // bewusst entfernte Lektion bleibt weg, auch wenn das Paket sich ändert
    await page.evaluate("lektionLoeschen('E09')");
    P1 = { ...P1, buf: paket('E09', 9, 'Testlektion 9', 5, [60, 200, 60]), n: 5 };
    setzePakete(A, [P1]);
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('!UPD.laeuft', { timeout: 30000 });
    check('Bewusst entfernte Lektion kommt nicht ungefragt zurück', (await page.evaluate('!!S.lib.lessons.E09')) === false);

    // neues zweites Paket erscheint → wird automatisch geladen (im „ruhigen“ Zustand, ohne Handbetrieb)
    const P2 = { datei: 'Test_E10.zip', buf: paket('E10', 10, 'Testlektion 10', 2, [90, 90, 200]), name: 'Test · E10', key: 'E10', titel: 'Testlektion 10', n: 2 };
    setzePakete(A, [P1, P2]);
    await page.evaluate("gehe('start'); updatePruefen({})");
    await page.waitForFunction('!UPD.laeuft', { timeout: 30000 });
    check('Neues Paket kommt von selbst (automatische Prüfung)', (await page.evaluate("S.lib.lessons.E10 ? Object.keys(S.lib.lessons.E10.cards).length : -1")) === 2 && !(await page.evaluate('!!S.lib.lessons.E09')));
    // Kartenseite zeigt die Pakete
    await page.evaluate("gehe('bibliothek')");
    await page.waitForFunction("document.querySelectorAll('.repozeile').length >= 2", { timeout: 15000 }).catch(() => {});
    check('Karten-Seite listet die Pakete im Repo', (await page.$$('.repozeile')).length === 2);

    // ---------- Update der App (neue Fassung auf dem Server) ----------
    const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8').replace(`APP_ID = '${ID}'`, `APP_ID = 'bbbbbbb'`).replace(/(<title>)Wortriff/, '$1Wortriff');
    const swNeu = fs.readFileSync(path.join(REPO, 'sw.js'), 'utf8').replace(`V04-${ID}`, 'V04-bbbbbbb');
    A.extra.set('/index.html', Buffer.from(html)); A.extra.set('/', Buffer.from(html));
    A.extra.set('/sw.js', Buffer.from(swNeu)); A.extra.set('/version.json', Buffer.from(JSON.stringify({ id: 'bbbbbbb', version: 'V04', stand: 'neu' })));
    await page.evaluate("gehe('ich')");
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('UPD.wartet', { timeout: 30000 });
    check('Neue Fassung wird gefunden und wartet', (await page.evaluate("UPD.ergebnis.app === true && !!UPD.wartet")));
    check('Knopf „Jetzt installieren“ erscheint, noch alte Fassung', !!(await page.$('#updpille [data-a="updateJetzt"]')) && (await page.evaluate('APP_ID')) === ID);
    check('„Ich“ zeigt App und Updates', (await page.$eval('#appPanel', e => e.textContent)).includes('Wortriff V04'));
    await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }), page.click('#updpille [data-a="updateJetzt"]')]);
    await page.waitForFunction('window.__bereit === true', { timeout: 20000 });
    const nach = await page.evaluate(`(async () => ({ id: APP_ID, caches: await caches.keys(), users: Object.values(S.users).map(u => u.name + ':' + u.xp), lek: Object.keys(S.lib.lessons) }))()`);
    check('Nach dem Update läuft die neue Fassung', nach.id === 'bbbbbbb', nach);
    check('Alte Offline-Kopie ist weg, nur noch die neue da', nach.caches.length === 1 && nach.caches[0] === 'wortriff-V04-bbbbbbb', nach.caches);
    check('Lernstand und Karten sind nach dem Update unverändert', nach.users.join() === 'Mia:777' && nach.lek.indexOf('E10') >= 0, nach);

    // ---------- Offline ----------
    A.aus = true;
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction('window.__bereit === true', { timeout: 20000 });
    check('Ohne Netz startet die App aus der Offline-Kopie, Lernstand da', (await page.evaluate('Object.values(S.users).length')) === 1 && (await page.evaluate('APP_ID')) === 'bbbbbbb');
    await page.evaluate('updatePruefen({ hand: true })');
    await page.waitForFunction('!UPD.laeuft', { timeout: 20000 });
    check('Prüfung ohne Netz bleibt ruhig (kein Absturz)', (await page.evaluate('!!UPD.ergebnis')) === true);
    A.aus = false;

    // ---------- Umzug: Sicherung → neue Umgebung (anderer Ursprung) → Karten aus dem Repo ----------
    const sicherung = await page.evaluate('sicherungInhalt()');
    const B = await starteServer(path.join(REPO));
    setzePakete(B, [P1, P2]);
    const ctxB = await browser.createBrowserContext();
    const pb = await oeffne(ctxB, B.url);
    await pb.evaluate("neuerNutzer('Paul', 'mimo'); sichere();");
    await warte(200);
    await pb.evaluate(`sicherungPruefen(new File([${JSON.stringify(sicherung)}], 'Wortriff_Sicherung.json', { type: 'application/json' }))`);
    await pb.waitForSelector('.blatt [data-a="sicherungJa"]', { timeout: 10000 });
    const vorschau = await pb.$eval('.blatt', e => e.textContent);
    check('Vorschau nennt Nutzer, Lektionen und warnt vor dem Ersetzen', vorschau.includes('Mia') && /Lektion/.test(vorschau) && vorschau.includes('ersetzt'), vorschau.slice(0, 160));
    await pb.click('[data-a="sicherungJa"]');
    await pb.waitForFunction("Object.values(S.users).some(u => u.name === 'Mia')", { timeout: 15000 });
    // Karten kommen von selbst aus dem Repo
    await pb.waitForFunction(`(async () => (await kartenLuecken()).length === 0 && Object.keys(S.lib.lessons).length > 0)()`, { timeout: 30000 });
    const a = await page.evaluate('JSON.stringify(S.users)'), b2 = await pb.evaluate('JSON.stringify(S.users)');
    check('Nach dem Umzug ist der Lernstand identisch (alle Nutzer, Karten, Riff)', a === b2, { a: a.length, b: b2.length });
    check('Alle Kartenbilder sind im neuen Speicher da', (await pb.evaluate(`(async () => (await kartenLuecken()).length)()`)) === 0 && (await pb.evaluate(`(async () => (await DB.keys('img')).length)()`)) === 4);
    check('Kartenprüfung in „Ich“ meldet vollständig', await (async () => { await pb.evaluate("gehe('ich')"); await pb.waitForFunction("/haben ihre Bilder/.test(document.getElementById('kartenStatus').textContent)", { timeout: 10000 }).catch(() => {}); return /haben ihre Bilder/.test(await pb.$eval('#kartenStatus', e => e.textContent)); })());
    // Rückgängig
    await pb.evaluate('AKT.sicherungZurueck()');
    await pb.waitForFunction("Object.values(S.users).some(u => u.name === 'Paul')", { timeout: 10000 });
    check('„Rückgängig“ bringt den Stand vor der Sicherung zurück', (await pb.evaluate("Object.values(S.users).map(u => u.name).join()")) === 'Paul');
    // Notweg: Sicherung als Text (Zwischenablage oder Textfeld)
    await pb.evaluate("AKT.sicherungKopieren()");
    await warte(600);
    const kopiert = await pb.evaluate("({ feld: !!document.getElementById('sicherungFeld') && document.getElementById('sicherungFeld').value.indexOf('\"app\":\"wortriff\"') > 0, datum: !!S.sicherung })");
    check('Sicherung als Text: kopiert oder im Textfeld angeboten', kopiert.feld || kopiert.datum, kopiert);
    await pb.evaluate('schliesseBlatt()');
    await pb.evaluate('AKT.sicherungText()');
    await pb.evaluate(`document.getElementById('sicherungEinfuegen').value = ${JSON.stringify(sicherung)}`);
    await pb.click('[data-a="sicherungTextJa"]');
    await pb.waitForSelector('.blatt [data-a="sicherungJa"]', { timeout: 10000 });
    await pb.click('[data-a="sicherungJa"]');
    await pb.waitForFunction("Object.values(S.users).some(u => u.name === 'Mia')", { timeout: 15000 });
    check('Aus eingefügtem Text laden stellt den Stand her', (await pb.evaluate('JSON.stringify(S.users)')) === a);

    // ---------- Sicherung über das Teilen-Blatt ----------
    const teilen = await page.evaluate(`(async () => {
      navigator.canShare = d => !!(d.files && d.files.length); navigator.share = async d => { window.__geteilt = d; };
      const r = await sicherungTeilen();
      const f = window.__geteilt.files[0];
      const j = JSON.parse(await f.text());
      navigator.share = async () => { const e = new Error('x'); e.name = 'AbortError'; throw e; };
      const r2 = await sicherungTeilen();
      return { r, r2, name: f.name, typ: f.type, app: j.app, nutzer: Object.keys(j.zustand.users).length, datum: S.sicherung };
    })()`);
    check('Sicherung geht über das Teilen-Blatt (iPad)', teilen.r === 'geteilt' && /^Wortriff_Sicherung_\d{4}-\d\d-\d\d\.json$/.test(teilen.name) && teilen.app === 'wortriff' && teilen.nutzer === 1, teilen);
    check('Abbrechen im Teilen-Blatt ist kein Fehler', teilen.r2 === 'abgebrochen', teilen);

    // ---------- Kleinigkeiten ----------
    const klein = await page.evaluate(`(() => {
      const a = repoAdresse(null, { hostname: 'nb.github.io', pathname: '/wortriff/' }), b = repoAdresse(null, { hostname: 'nb.github.io', pathname: '/index.html' }), c = repoAdresse(null, { hostname: 'localhost', pathname: '/' }), d = repoAdresse({ repo: { owner: 'x', repo: 'y' } }, { hostname: 'localhost', pathname: '/' });
      const ua = navigator.userAgent; Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)', configurable: true });
      const hinweis = installHinweisHtml(); Object.defineProperty(navigator, 'userAgent', { get: () => ua, configurable: true });
      return { a, b, c, d, hinweis: hinweis.includes('Zum Home-Bildschirm'), desktop: installHinweisHtml() === '' };
    })()`);
    check('Repo-Adresse aus der Seitenadresse (Pages) oder Eintrag im Index', klein.a.owner === 'nb' && klein.a.repo === 'wortriff' && klein.b.repo === 'nb.github.io' && klein.c === null && klein.d.repo === 'y', klein);
    check('Home-Bildschirm-Hinweis nur auf dem iPad im Browser', klein.hinweis && klein.desktop, klein);
    check('Keine Seitenfehler', fehler.length === 0, fehler);
  } catch (e) {
    bad++; console.log('ABBRUCH:', e.stack || e);
  }
  await browser.close();
  await A.ende();
  console.log(`\nWeb-App: ${ok} Prüfungen bestanden, ${bad} Fehler`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('ABBRUCH:', e.stack || e); process.exit(2); });
