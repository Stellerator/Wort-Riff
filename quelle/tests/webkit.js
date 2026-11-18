// Safari-nahe Prüfung: lädt die App in WebKit (Playwright) mit iPad-Profilen und fotografiert zentrale Ansichten.
// Einmalig: npm i -D playwright-core && npx playwright-core install webkit   (Browser liegt dann unter %LOCALAPPDATA%\ms-playwright)
//   node tests/webkit.js [Profilname] [Ansicht]      z. B.  node tests/webkit.js "iPad Pro 11" neuNutzer
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { webkit, devices } = require('../../node_modules/playwright-core');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readdirSync(ROOT).filter(f => /^Wortriff_V\d+\.html$/.test(f)).sort().pop();
const profile = process.argv[2] || 'iPad Pro 11';
const ansichten = (process.argv[3] || 'neuNutzer,hafen,album,riff,karte').split(',');

(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ ...devices[profile] });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await page.addInitScript(() => { window.__heute = '2026-10-19'; });
  await page.goto(pathToFileURL(path.join(ROOT, HTML)).href);
  await page.waitForFunction('window.__bereit === true');
  const out = (n) => { const p = path.join(ROOT, 'tests', 'bilder', `wk-${profile.replace(/\W+/g, '')}-${n}.png`); fs.mkdirSync(path.dirname(p), { recursive: true }); return p; };
  const vp = page.viewportSize();
  console.log(`WebKit ${browser.version()} · ${profile} · ${vp.width}×${vp.height}`);
  for (const a of ansichten) {
    if (a === 'neuNutzer') {
      await page.screenshot({ path: out('neuNutzer') });
      const g = await page.evaluate(`(() => { const p = document.querySelector('.panel').getBoundingClientRect(); const t = Array.from(document.querySelectorAll('.avawahl button')).map(b => { const r = b.getBoundingClientRect(), s = b.querySelector('svg').getBoundingClientRect(); return { b: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], s: [Math.round(s.left), Math.round(s.top), Math.round(s.right), Math.round(s.bottom)] }; }); return { panel: [Math.round(p.left), Math.round(p.top), Math.round(p.right), Math.round(p.bottom)], vw: innerWidth, vh: innerHeight, tiles: t }; })()`);
      const raus = g.tiles.filter(t => t.s[0] < t.b[0] - 1 || t.s[2] > t.b[2] + 1 || t.s[1] < t.b[1] - 1 || t.s[3] > t.b[3] + 1);
      console.log('  Neuer Nutzer: Panel', g.panel.join(','), '· Kacheln mit herausragender Figur:', raus.length, raus.length ? JSON.stringify(raus[0]) : '');
      console.log('  Kachel 1:', JSON.stringify(g.tiles[0]), ' Viewport', g.vw, g.vh);
    } else if (a === 'hafen') {
      await page.evaluate("neuerNutzer('Mia', 'stella'); start(true);"); await page.waitForTimeout(400); await page.screenshot({ path: out('hafen') });
    } else if (a === 'album') {
      await page.evaluate("gehe('album')"); await page.waitForTimeout(300); await page.screenshot({ path: out('album') });
    } else if (a === 'riff') {
      await page.evaluate("cur().perlen = 400; dekoKaufen(cur(), 'truhe'); gehe('riff')"); await page.waitForTimeout(400); await page.screenshot({ path: out('riff') });
    } else if (a === 'karte') {
      await page.evaluate("gehe('karte')"); await page.waitForTimeout(300); await page.screenshot({ path: out('karte') });
    }
  }
  if (fehler.length) console.log('FEHLER im Browser:', fehler.slice(0, 5).join(' | '));
  else console.log('keine Fehler im Browser');
  await browser.close();
})().catch(e => { console.log('ABBRUCH:', e.message.split('\n').slice(0, 6).join('\n')); process.exit(2); });
