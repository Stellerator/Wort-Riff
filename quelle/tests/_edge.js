// Gemeinsame Helfer für die Tests: Edge finden und starten (puppeteer-core liegt in ../node_modules)
const fs = require('fs');
const path = require('path');
const puppeteer = require('../../node_modules/puppeteer-core');

function findEdge() {
  const base = 'C:\\Program Files (x86)\\Microsoft\\EdgeCore';
  const vers = fs.readdirSync(base).filter(v => fs.existsSync(path.join(base, v, 'msedge.exe'))).sort();
  if (!vers.length) throw new Error('Edge nicht gefunden');
  return path.join(base, vers[vers.length - 1], 'msedge.exe');
}
const starte = (opts = {}) => puppeteer.launch({ executablePath: findEdge(), headless: 'new', args: ['--hide-scrollbars', '--font-render-hinting=none', '--allow-file-access-from-files'], ...opts });
module.exports = { findEdge, starte, puppeteer };
