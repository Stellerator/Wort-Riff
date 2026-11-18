// Sucht Namen, die in mehreren Quelldateien auf oberster Ebene definiert werden (spätere Definition überschreibt die frühere!).
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'js');
const vorkommen = new Map();
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
  fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/).forEach((z, i) => {
    const m = /^(?:async\s+)?(?:function\s*\*?\s*([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)/.exec(z);
    if (!m) return;
    const n = m[1] || m[2];
    if (!vorkommen.has(n)) vorkommen.set(n, []);
    vorkommen.get(n).push(`${f}:${i + 1}`);
  });
}
let n = 0;
for (const [name, orte] of vorkommen) if (orte.length > 1) { n++; console.log(name.padEnd(22), orte.join('  ')); }
console.log(n ? `\n${n} doppelte Namen` : 'keine doppelten Namen');
process.exit(n ? 1 : 0);
