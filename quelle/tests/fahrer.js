// Gemeinsamer Fahrer für Browser-Tests: startet die gebaute App in Edge mit iPad-Maßen und sammelt Fehler.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { starte } = require('./_edge');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readdirSync(ROOT).filter(f => /^Wortriff_V\d+\.html$/.test(f)).sort().pop();
const IPAD = { quer: { width: 1180, height: 820 }, hoch: { width: 820, height: 1180 }, klein: { width: 744, height: 1133 } };

async function oeffne(opt = {}) {
  const browser = await starte();
  const ctx = browser.defaultBrowserContext();
  const page = await browser.newPage();
  const vp = IPAD[opt.ansicht || 'quer'];
  await page.setViewport({ ...vp, deviceScaleFactor: opt.dsf || 1, isMobile: false, hasTouch: true });
  const fehler = [];
  page.on('pageerror', e => fehler.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  page.on('dialog', d => d.dismiss());
  await page.evaluateOnNewDocument(h => { if (h) window.__heute = h; }, opt.heute || null);
  await page.goto(pathToFileURL(path.join(ROOT, HTML)).href);
  await page.waitForFunction('window.__bereit === true', { timeout: 15000 });
  const f = {
    browser, page, fehler, HTML,
    async bild(name) { const p = path.join(ROOT, 'tests', 'bilder', name + '.png'); fs.mkdirSync(path.dirname(p), { recursive: true }); await page.screenshot({ path: p }); return p; },
    async klick(sel) { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await new Promise(r => setTimeout(r, 120)); },
    async warte(ms) { await new Promise(r => setTimeout(r, ms)); },
    async text(sel) { return page.$eval(sel, e => e.textContent.trim()); },
    async ev(fn, ...a) { return page.evaluate(fn, ...a); },
    async ende() { await browser.close(); }
  };
  return f;
}
const dateienIn = (dir, filter) => {
  const out = [];
  (function lauf(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); if (e.isDirectory()) lauf(p); else if (!filter || filter.test(e.name)) out.push(p); }); })(dir);
  return out;
};
module.exports = { oeffne, dateienIn, ROOT, IPAD };
