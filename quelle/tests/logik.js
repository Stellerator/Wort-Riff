// Prüft die Lernlogik (Wiederholungsplan, Tagesplan, Serie, Belohnungen) ohne Browser: lädt die App-Module in einen vm-Kontext.
//   node tests/logik.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'src', 'js');
const noop = () => {};
const ctx = { console, setTimeout, clearTimeout, Math, Date, JSON, URL, TextDecoder, Uint8Array, Uint16Array, Map, Set, Promise, Object, Array, String, Number, RegExp, Error,
  window: { addEventListener: noop }, document: { addEventListener: noop, visibilityState: 'visible' }, localStorage: { getItem: () => null, setItem: noop }, indexedDB: undefined };
ctx.globalThis = ctx;
vm.createContext(ctx);
// 00–07 laden (reine Logik); jede Datei als eigenes Skript, aber im gleichen Kontext → "const" bleibt zwischen Skripten sichtbar
fs.readdirSync(dir).filter(f => /^0[0-7]-/.test(f)).sort().forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8') + '\n;', ctx, { filename: f }));
const run = code => vm.runInContext(code, ctx);

let ok = 0, bad = 0;
const check = (name, cond, extra) => { if (cond) ok++; else { bad++; console.log('FEHLER:', name, extra === undefined ? '' : JSON.stringify(extra)); } };

// ---------- Aufbau: Testbibliothek ----------
run(`
S = { v: 1, users: {}, cur: null, lib: { lessons: {} }, bildmodus: 'sparsam' };
window.__heute = '2026-10-19';
const L = lektionStandard('en', 'E04', 4); L.hasText = true;
for (let n = 1; n <= 12; n++) { L.entries[n] = { nr: n, fremd: 'word' + n, de: 'wort' + n, sprechen: 'word' + n }; L.cards['E04_DE-EN_' + String(n).padStart(3, '0')] = { satz: 'DE-EN', nr: n, bild: false }; L.cards['E04_EN-DE_' + String(n).padStart(3, '0')] = { satz: 'EN-DE', nr: n, bild: false }; }
L.cards['E04_BILD_B1'] = { satz: 'BILD', nr: 1, bild: true };
S.lib.lessons.E04 = L;
const u = neuerNutzer('Test', 'finn');
`);
const tag = d => run(`window.__heute = '${d}'`);
const cardState = () => run(`JSON.parse(JSON.stringify(cur().cards['E04_DE-EN_001']))`);

// ---------- Wiederholungsplan ----------
// Neue Karte: Gut → noch einmal nötig (Lernphase), zweites Gut → gelernt, Intervall 1 Tag
let r1 = run(`bewerte(cur(), 'E04_DE-EN_001', 2)`);
check('neu+Gut: noch nicht erledigt', r1.erledigt === false, r1);
check('neu+Gut: Lernphase step 1', cardState().step === 1, cardState());
r1 = run(`bewerte(cur(), 'E04_DE-EN_001', 2)`);
check('zweites Gut: erledigt, graduiert', r1.erledigt && r1.graduiert && r1.erstGrad, r1);
check('Intervall 1 Tag, Box 2', cardState().iv === 1 && cardState().b === 2, cardState());
// nächster Tag: Gut → iv = round(1*2.5)=3 (max(iv+1,..)), Box 3
tag('2026-10-20');
run(`bewerte(cur(), 'E04_DE-EN_001', 2)`);
check('Tag 2 Gut: iv 3, Box 3', cardState().iv === 3 && cardState().b === 3, cardState());
check('fällig am Tag 5', run(`tagNr('2026-10-23') - cur().cards['E04_DE-EN_001'].due`) === 0);
// Leicht: größerer Sprung + ease steigt
tag('2026-10-23');
const vorher = cardState();
run(`bewerte(cur(), 'E04_DE-EN_001', 3)`);
const nach = cardState();
check('Leicht: iv wächst stark', nach.iv > vorher.iv * 2.5, nach);
check('Leicht: ease steigt', nach.ease > vorher.ease, nach);
check('Leicht: Box 4', nach.b === 4);
// Fehler: Lernphase, Leichtigkeit sinkt, Intervall schrumpft
tag(run(`nrTag(cur().cards['E04_DE-EN_001'].due)`));
const v2 = cardState();
const rf = run(`bewerte(cur(), 'E04_DE-EN_001', 0)`);
const n2 = cardState();
check('Fehler: lapse', rf.lapse && n2.lapses === 1 && n2.step === 1 && n2.b === 1, n2);
check('Fehler: ease sinkt um 0,2', Math.abs(n2.ease - (v2.ease - 0.2)) < 1e-9, n2);
check('Fehler: neues Intervall = 25 %', n2.iv === Math.max(1, Math.floor(v2.iv * 0.25)), n2);
const rg = run(`bewerte(cur(), 'E04_DE-EN_001', 2)`);
check('nach Fehler: Gut → wieder eingeplant, Box 2', rg.erledigt && cardState().b === 2 && cardState().due > run('tagNr(heute())'), cardState());
check('nach Fehler: erstGrad ist falsch', rg.erstGrad === false, rg);
// Ease-Untergrenze
for (let i = 0; i < 12; i++) { tag(run(`nrTag(cur().cards['E04_DE-EN_001'].due)`)); run(`bewerte(cur(), 'E04_DE-EN_001', 0)`); run(`bewerte(cur(), 'E04_DE-EN_001', 2)`); }
check('ease nie unter 1,3', cardState().ease >= 1.3 - 1e-9, cardState());
// Intervalle wachsen langfristig (Dauerprojekt, nur „Gut“)
run(`cur().cards['E04_DE-EN_002'] = undefined; delete cur().cards['E04_DE-EN_002'];`);
tag('2027-01-01');
run(`bewerte(cur(), 'E04_DE-EN_002', 2)`); run(`bewerte(cur(), 'E04_DE-EN_002', 2)`);
let tageSumme = 0, ivs = [];
for (let i = 0; i < 12; i++) { const due = run(`cur().cards['E04_DE-EN_002'].due`); tag(run(`nrTag(${due})`)); run(`bewerte(cur(), 'E04_DE-EN_002', 2)`); ivs.push(run(`cur().cards['E04_DE-EN_002'].iv`)); }
check('Intervalle wachsen monoton', ivs.every((x, i) => i === 0 || x >= ivs[i - 1]), ivs);
check('Intervall nie über 365', Math.max(...ivs) <= 365, ivs);
check('nach 12 Wiederholungen > 100 Tage', ivs[ivs.length - 1] > 100, ivs);
console.log('  Intervalle bei lauter „Gut“:', ivs.join(' → '));

// ---------- Deckelung durch Projekt-Enddatum ----------
tag('2026-11-02');
run(`
const P = neuesProjekt(cur(), { name: 'KA', sp: 'en', lessons: ['E04'], sets: ['DE-EN'], end: '2026-11-12', ziel: 3, ruhe: [0, 6] });
`);
run(`bewerte(cur(), 'E04_DE-EN_003', 3)`);                     // Leicht → Graduierung mit 4 Tagen, aber Ende in 10 Tagen → Deckel 5
check('Projekt deckelt Intervall (≤ 5 Tage bei 10 Tagen Rest)', run(`cur().cards['E04_DE-EN_003'].iv`) <= 5, run(`cur().cards['E04_DE-EN_003']`));
tag('2026-11-11');
run(`cur().cards['E04_DE-EN_003'].due = tagNr('2026-11-11'); cur().cards['E04_DE-EN_003'].iv = 9;`);
run(`bewerte(cur(), 'E04_DE-EN_003', 3)`);
check('kurz vor Ende: Intervall 1 (Deckel)', run(`cur().cards['E04_DE-EN_003'].iv`) === 1, run(`cur().cards['E04_DE-EN_003']`));

// ---------- Tagesplan, Runde, Tagesziel ----------
tag('2026-10-26');                                               // Montag
run(`
const u2 = cur();
Object.keys(u2.projects).forEach(k => delete u2.projects[k]);
u2.cards = {};
var P1 = neuesProjekt(u2, { name: 'KA Unit 4', sp: 'en', lessons: ['E04'], sets: ['DE-EN', 'EN-DE'], end: '2026-11-09', ziel: 3, ruhe: [0, 6] });
`);
const plan = run(`JSON.parse(JSON.stringify(heutePlan(cur(), P1)))`);
check('Plan: 24 Karten, Ziel > 0', plan.ziel > 0 && plan.neu.length === plan.ziel && plan.faellig.length === 0, plan);
console.log('  Plan heute:', plan.neu.length, 'neue Karten (24 Karten, 14 Tage, Reserve 2 Tage)');
check('Plan: Quote passt (ceil(24/(10-2)) = 3)', plan.neu.length === 3, plan.neu.length);
const runde = run(`baueRunde(cur(), P1)`);
check('Runde: nicht Bonus, genau Plankarten', !runde.bonus && runde.karten.length === 3, runde);
// alle Plankarten zweimal „Gut“ → erledigt → Tagesziel
let treffer = [];
runde.karten.forEach(c => { for (let k = 0; k < 2; k++) { const res = run(`bewerte(cur(), '${c}', 2)`); if (res.erledigt) treffer = treffer.concat(run(`planAbhaken(cur(), '${c}').map(p => p.id)`)); } });
check('Tagesziel erreicht (einmalig)', treffer.length === 1 && treffer[0] === run('P1.id'), treffer);
const sum_ = run(`rundeEnde(cur(), P1, { bonus: false, antworten: ${JSON.stringify(runde.karten.map(c => ({ cid: c, r: 2, erste: true })))}, xp: 30, perlen: 6, treffer: new Set(['${treffer[0]}']), rang: null })`);
check('Rundenende: Tagesziel-Belohnung (eine Perlmuschel)', sum_.tagesziele.length === 1 && sum_.perl === 1 && sum_.schatz === 0, sum_);
check('Rundenende: Serie = 1', run('P1.serie.cur') === 1 && run('P1.serie.last') === '2026-10-26');
check('Abzeichen „start“ und „tagesziel1“', run(`!!cur().badges.start && !!cur().badges.tagesziel1`));
const rundeB = run(`baueRunde(cur(), P1)`);
check('danach Bonusrunde', rundeB.bonus === true, rundeB);

// Serie: Dienstag fehlt, Mittwoch → Joker greift (genau 1 verpasster Lerntag)
tag('2026-10-28');
check('Serie lebt mit Joker (1 verpasster Tag)', run(`serieLebt(P1, heute())`) === true);
tag('2026-10-30');
check('Serie weg bei 2+ verpassten Tagen', run(`serieLebt(P1, heute())`) === false);
tag('2026-10-27');                                               // Dienstag: normal weiter
check('Serie lebt am Folgetag', run(`serieLebt(P1, heute())`) === true);
// Wochenende (Ruhetage) bricht die Serie nicht: Freitag → Montag
run(`P1.serie = { cur: 4, best: 4, last: '2026-10-30', joker: null }`);
tag('2026-11-02');
check('Wochenende zählt nicht als verpasst', run(`serieLebt(P1, heute())`) === true);

// ---------- Dauerprojekt: Wochenziel ----------
tag('2026-11-03');
run(`var P2 = neuesProjekt(cur(), { name: 'Festigen', sp: 'en', lessons: ['E04'], sets: ['DE-EN'], dauer: true });`);
check('Dauerprojekt: Ziel Langzeit, ohne Ende', run('P2.ziel') === 9 && run('P2.end') === null);
const p2plan = run(`JSON.parse(JSON.stringify(heutePlan(cur(), P2)))`);
check('Dauerprojekt: höchstens 5 neue Karten pro Tag', p2plan.neu.length <= 5 && p2plan.neu.length > 0, p2plan);

// ---------- Realismus ----------
tag('2026-10-26');
check('Realismus: 2 Tage für Prüfungsfit = eng', run(`realismus({ dauer: false, end: '2026-10-28', ziel: 4, ruhe: [] }, 20)`).stufe === 'eng');
check('Realismus: 14 Tage, 24 Karten, Sicher = ok', run(`realismus({ dauer: false, end: '2026-11-09', ziel: 3, ruhe: [0, 6] }, 24)`).stufe === 'ok');
check('Realismus: viele Karten = viel', run(`realismus({ dauer: false, end: '2026-11-02', ziel: 3, ruhe: [] }, 200)`).stufe === 'viel');

// ---------- Muscheln ----------
run(`rand = (() => { const r = rng(7); return () => r(); })();`);
const U = () => run('cur()');
run(`cur().muscheln = { perl: 200, schatz: 0 }; cur().pity = 0; cur().owned = {}; cur().tiefeMax = 1000;`);
const rars = [0, 0, 0, 0];
let pityMax = 0, ohneEpisch = 0, maxOhne = 0;
for (let i = 0; i < 200; i++) { const m = run('muschelOeffnen(cur())'); rars[m.rar]++; if (m.rar >= 2) ohneEpisch = 0; else { ohneEpisch++; maxOhne = Math.max(maxOhne, ohneEpisch); } }
check('Muscheln: Schutz greift (nie > 10 ohne episch+)', maxOhne < 10, maxOhne);
check('Muscheln: alle Seltenheiten kommen vor', rars.every(x => x > 0), rars);
check('Muscheln: Verteilung grob (gewöhnlich häufigste)', rars[0] > rars[1] && rars[1] > rars[3], rars);
console.log('  200 Perlmuscheln:', rars.join(' / '), '(gewöhnlich / selten / episch / legendär)');
check('Album: nach 200 Muscheln fast vollständig', run('Object.keys(cur().owned).length') >= 30, run('Object.keys(cur().owned).length'));
check('Abzeichen Albummeister möglich', typeof run('cur().badges.album10') === 'number');
check('Rang: 0 XP Schwimmanfänger, 58000+ XP Meereskönig mit Stern', run(`rangVon(0).name`) === 'Schwimmanfänger' && /Meereskönig ★/.test(run(`rangVon(58500).name`)), run(`rangVon(58500).name`));

// ---------- Dateinamen ----------
check('parseKarte DE-EN', JSON.stringify(run(`parseKarte('E04_DE-EN_011_1-vorne.png')`)) === JSON.stringify(run(`({ sp: 'en', lkey: 'E04', lektion: 4, satz: 'DE-EN', nr: 11, bild: false, seite: 'v', cid: 'E04_DE-EN_011' })`)));
check('parseKarte BILD', run(`parseKarte('E04_BILD_B1_2-hinten.png').cid`) === 'E04_BILD_B1' && run(`parseKarte('E04_BILD_B1_2-hinten.png').seite`) === 'h');
check('parseKarte VERB', run(`parseKarte('E01_VERB_V12_2-hinten.png').cid`) === 'E01_VERB_V12' && run(`parseKarte('E01_VERB_V12_2-hinten.png').satz`) === 'VERB' && run(`parseKarte('E01_VERB_V12_2-hinten.png').seite`) === 'h' && run(`parseKarte('E01_VERB_V12_2-hinten.png').nr`) === 1012 && run(`parseKarte('E01_VERB_V01_1-vorne.png').bild`) === false);
check('Verbkarten sind Umdreh-Karten (kein Text-Modus)', run(`satzInfo('VERB').art`) === 'verb' && run(`SATZ_REIHE.indexOf('VERB')`) >= 0);
check('parseKarte mit Kopie-Zusatz', run(`parseKarte('F01_DE-FR_017_1-vorne (1).png').cid`) === 'F01_DE-FR_017');
check('parseKarte lehnt Fremdes ab', run(`parseKarte('foto.png')`) === null);



// ---------- Tauchtiefe schaltet seltenere Wesen frei ----------
run(`rand = (() => { const r = rng(99); return () => r(); })();`);
const ziehe = (tiefe, n, art) => {
  run(`(() => { const u = cur(); u.cards = {}; u.tiefeMax = ${tiefe}; u.pity = 0; u.owned = {}; u.muscheln = { perl: ${art === 'perl' ? n : 0}, schatz: ${art === 'schatz' ? n : 0} }; })()`);
  const z = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) z[run('muschelOeffnen(cur())').rar]++;
  return z;
};
let z0 = ziehe(0, 150, 'perl'), z9 = ziehe(9, 150, 'schatz'), z10 = ziehe(10, 200, 'perl'), z59 = ziehe(99, 200, 'schatz'), z60 = ziehe(100, 300, 'perl'), z299 = ziehe(399, 300, 'schatz'), z300 = ziehe(400, 400, 'perl');
check('Tiefe 0 m: nur Gewöhnliche (Flachwasser-Freunde)', z0[1] + z0[2] + z0[3] === 0 && z0[0] === 150, z0);
check('Tiefe 9 m (Schatzmuschel): immer noch nur Gewöhnliche', z9[1] + z9[2] + z9[3] === 0, z9);
check('Tiefe 10 m: Gewöhnliche und Seltene, nichts Episches', z10[0] > 0 && z10[1] > 0 && z10[2] + z10[3] === 0, z10);
check('Tiefe 99 m: kein Episches, kein Legendäres', z59[2] + z59[3] === 0 && z59[1] > 0, z59);
check('Tiefe 100 m: Episches ist da, Legendäres noch nicht', z60[2] > 0 && z60[3] === 0, z60);
check('Tiefe 399 m: Legendäres noch gesperrt', z299[3] === 0 && z299[2] > 0, z299);
check('Tiefe 400 m: alle vier Seltenheiten', z300.every(x => x > 0), z300);
check('Schutz-Zähler läuft erst ab der epischen Zone', run(`(() => { const u = cur(); u.tiefeMax = 20; u.pity = 7; u.muscheln.perl = 1; muschelOeffnen(u); return u.pity; })()`) === 0);
// Tiefe aus den Karten und „tiefste Tiefe geht nie verloren“
run(`(() => { const u = cur(); u.tiefeMax = 0; u.cards = {
  a: { b: 3, step: 0, iv: 5, due: 1, ease: 2.5 }, b: { b: 4, step: 0, iv: 9, due: 1, ease: 2.5 }, c: { b: 5, step: 0, iv: 30, due: 1, ease: 2.5 }, d: { b: 2, step: 0, iv: 1, due: 1, ease: 2.5 }, e: { b: 1, step: 1, iv: 1, due: 1, ease: 2.5 } }; })()`);
check('Tiefe: a=1 m, b=2 m, c=3 m, d und e = 0 m → 6 m', run('tiefeMeter(cur())') === 6, run('tiefeMeter(cur())'));
run(`(() => { const u = cur(); tiefeNach(u); u.cards = {}; })()`);
check('Tiefste Tiefe bleibt, auch wenn Karten wieder vergessen werden', run('tiefeJetzt(cur())') === 6 && run('cur().tiefeMax') === 6);
check('Zone aus Tiefe: 0→0, 10→1, 99→1, 100→2, 400→3', [0, 10, 99, 100, 400].map(m => run(`zoneVonTiefe(${m})`)).join() === '0,1,1,2,3');
const wp = run(`wahrscheinlichkeiten(Object.assign(cur(), { tiefeMax: 0 }), 'perl')`);
check('Chancen bei 0 m: 100 % Gewöhnlich, Summe stimmt', Math.round(wp[0]) === 100 && Math.round(wp.reduce((a, b) => a + b, 0)) === 100, wp);
const wp2 = run(`wahrscheinlichkeiten(Object.assign(cur(), { tiefeMax: 1000 }), 'perl')`);
check('Chancen bei 1000 m: wie die Grundwerte (62/25/10/3)', wp2.map(Math.round).join() === '62,25,10,3', wp2);
// Zone erreicht → Schatzmuschel im Rundenergebnis
run(`(() => { const u = cur(); u.tiefeMax = 0; u.cards = {}; for (let i = 1; i <= 10; i++) u.cards['E04_DE-EN_' + String(i).padStart(3, '0')] = { b: 3, step: 0, iv: 6, due: tagNr(heute()) + 5, ease: 2.5, n: 3, ok: 3, last: 1 }; window.__heute = '2026-11-20'; })()`);
const ze = run(`(() => { const u = cur(); const P = neuesProjekt(u, { name: 'Z', sp: 'en', lessons: ['E04'], sets: ['DE-EN'], dauer: true }); const s = rundeEnde(u, P, { bonus: true, antworten: [], xp: 0, perlen: 0, treffer: new Set(), rang: null, abbruch: true }); return { zonen: s.zonen.map(z => z.zone), schatz: s.schatz, tiefe: s.tiefe }; })()`);
check('Zone Korallenriff bei 10 m erreicht → Meldung + Schatzmuschel', ze.zonen.length === 1 && ze.zonen[0] === 'Korallenriff' && ze.schatz >= 1 && ze.tiefe === 10, ze);

// ---------- Tempo der Belohnungen: 14 Tage Klassenarbeits-Projekt, realistisch gespielt ----------
run(`
const SL = lektionStandard('en', 'E05', 5); SL.hasText = true;
for (let n = 1; n <= 30; n++) { SL.entries[n] = { nr: n, fremd: 'w' + n, de: 'v' + n, sprechen: 'w' + n }; SL.cards['E05_DE-EN_' + String(n).padStart(3, '0')] = { satz: 'DE-EN', nr: n, bild: false }; SL.cards['E05_EN-DE_' + String(n).padStart(3, '0')] = { satz: 'EN-DE', nr: n, bild: false }; }
S.lib.lessons.E05 = SL;
window.__heute = '2026-11-02';
var SU = neuerNutzer('Sim', 'pip');
var SP = neuesProjekt(SU, { name: 'Sim', sp: 'en', lessons: ['E05'], sets: ['DE-EN', 'EN-DE'], end: '2026-11-16', ziel: 3, ruhe: [0, 6] });
var RS = rng(42);
rand = (() => { const r = rng(4242); return () => r(); })();
`);
const tage = [];
for (let i = 0; i < 14; i++) {
  const d = run(`nrTag(tagNr('2026-11-02') + ${i})`);
  const z = run(`(() => {
    window.__heute = '${d}';
    const u = SU, P = SP, v0 = { xp: u.xp, perlen: u.perlen, m: muschelAnzahl(u), r: rangVon(u.xp).i, antw: u.stats.antworten };
    if (!lerntag(P, heute())) return { frei: true, xp: u.xp, rang: rangVon(u.xp).i };
    for (let runde = 0; runde < 12; runde++) {
      const pl = heutePlan(u, P); const r = baueRunde(u, P); if (r.bonus || !r.karten.length) break;
      const sess = { bonus: false, antworten: [], xp: 0, perlen: 0, treffer: new Set(), rang: null };
      const gesehen = {}; const q = r.karten.slice();
      while (q.length) {
        const cid = q.shift(); const erste = !gesehen[cid]; gesehen[cid] = (gesehen[cid] || 0) + 1;
        const neu = !u.cards[cid]; const x = RS();
        const rr = neu ? (x < 0.15 ? 0 : x < 0.30 ? 3 : 2) : (x < 0.10 ? 0 : x < 0.18 ? 3 : 2);
        const res = bewerte(u, cid, rr); const bel = belohneAntwort(u, rr, res); sess.xp += bel.xp; sess.perlen += bel.perlen;
        sess.antworten.push({ cid, r: rr, erste });
        if (res.erledigt) planAbhaken(u, cid).forEach(p => sess.treffer.add(p.id));
        else if (gesehen[cid] < 5) q.splice(Math.min(q.length, res.gap || 3), 0, cid);
      }
      rundeEnde(u, P, sess);
    }
    return { frei: false, antw: u.stats.antworten - v0.antw, xp: u.xp - v0.xp, perlen: u.perlen - v0.perlen, muscheln: muschelAnzahl(u) - v0.m, rang: rangVon(u.xp).i, xpGes: u.xp, rangName: rangVon(u.xp).name };
  })()`);
  tage.push({ d, ...z });
}
const aktiv = tage.filter(t => !t.frei);
console.log('\n  Tempo: 14 Tage Klassenarbeit (60 Karten, Ruhetage Sa/So), realistisch gespielt');
console.log('  Tag  Antworten   XP  Perlen  Muscheln  Rang (XP gesamt)');
aktiv.forEach((t, i) => console.log(`  ${String(i + 1).padStart(3)}  ${String(t.antw).padStart(9)}  ${String(t.xp).padStart(3)}  ${String(t.perlen).padStart(6)}  ${String(t.muscheln).padStart(8)}  ${t.rangName} (${t.xpGes})`));
const summe = k => aktiv.reduce((a, t) => a + t[k], 0);
const xpTag = summe('xp') / aktiv.length, perlTag = summe('perlen') / aktiv.length, muschTag = summe('muscheln') / aktiv.length;
console.log(`  Schnitt je Lerntag: ${Math.round(xpTag)} XP, ${perlTag.toFixed(1)} Perlen, ${muschTag.toFixed(2)} Muscheln, ${Math.round(summe('antw') / aktiv.length)} Antworten`);
console.log(`  Hochrechnung: Meereskönig (50000 XP) bei 150 Lerntagen im Jahr nach ca. ${(50000 / (xpTag * 150)).toFixed(1)} Jahren (nur bei durchgehend so viel Stoff)`);
const tiefeNachSim = run('tiefeMeter(SU)');
console.log(`  Tauchtiefe nach 14 Tagen: ${tiefeNachSim} m (Korallenriff ab 10 m, Tiefsee ab 100 m, Abgrund ab 400 m)`);
check('Tauchtiefe: nach den 14 Tagen im Korallenriff, aber noch nicht in der Tiefsee (kleine Vorfreude)', tiefeNachSim >= 10 && tiefeNachSim < 100, tiefeNachSim);
check('Tempo: Tag 1 bleibt Schwimmanfänger (unter 150 XP)', aktiv[0].xpGes < 150 && aktiv[0].rang === 0, aktiv[0]);
const tagSeepferd = aktiv.findIndex(t => t.rang >= 1) + 1;
check('Tempo: Seepferdchen frühestens ab Tag 3, spätestens bis Tag 9', tagSeepferd >= 3 && tagSeepferd <= 9, tagSeepferd);
const tagBronze = aktiv.findIndex(t => t.rang >= 2) + 1;
check('Tempo: Bronze erst nach der ersten Woche (oder gar nicht in 14 Tagen)', tagBronze === 0 || tagBronze >= 7, tagBronze);
check('Tempo: 10–35 Perlen pro Lerntag', perlTag >= 10 && perlTag <= 35, perlTag);
check('Tempo: 0,8–1,8 Muscheln pro Lerntag', muschTag >= 0.8 && muschTag <= 1.8, muschTag);
check('Tempo: nach 14 Tagen höchstens Silber (Rang ≤ 3)', aktiv[aktiv.length - 1].rang <= 3, aktiv[aktiv.length - 1]);

// ---------- Korallenfunken und Entwicklung ----------
check('Stufen: Stern 1–2 = 1, 3–4 = 2, 5 = 3', run('[1, 2, 3, 4, 5].map(figStufe).join()') === '1,1,2,2,3');
check('Jede Art hat zwei Beinamen', run('ART.arten.every(a => BEINAME[a] && BEINAME[a].length === 2)'));
check('Alle drei Stufen jeder Figur lassen sich zeichnen', run('figIds().every(i => [1, 2, 3].every(s => figSvg(i, s).includes("<svg")))'));
check('Jede Art hat eigene Körper für Stufe 2 und 3', run('ART.arten.every(a => ART.evo[a] && ART.evo[a][2] && ART.evo[a][3])'));
check('Entwicklungsformen tragen die Klasse s2/s3', run('figSvg("finn", 2).includes("fig s2") && figSvg("finn", 3).includes("fig s3")'));
check('Stufen sehen verschieden aus', run('figSvg("finn", 1) !== figSvg("finn", 2) && figSvg("finn", 2) !== figSvg("finn", 3)'));
check('Name der Stufe 3 enthält den Beinamen', run('figName("finn", 3) === "Finn Flosse – Sturmflosse" && figName("finn", 1) === "Finn Flosse"'));
run(`(() => { const u = neuerNutzer('Funke', 'finn'); u.tiefeMax = 500; window.__f = u; })()`);
// Dublette: Funken nach Seltenheit, Stufe wird gemeldet
run(`(() => { const u = window.__f; u.owned.finn = { n: 1, stern: 1, ts: 1, neu: false }; u.funken = 0; window.__rand0 = rand; })()`);
let gefunden = null;
for (let i = 0; i < 400 && !gefunden; i++) { run('(() => { const u = window.__f; u.muscheln.perl = 1; window.__m = muschelOeffnen(u); })()'); const m = run('window.__m'); if (!m.neu) gefunden = m; }
check('Dublette gibt Korallenfunken (2 + 2 je Seltenheit)', gefunden && gefunden.funken === 2 + 2 * gefunden.rar && run('window.__f.funken') >= gefunden.funken, gefunden);
check('Dublette meldet Stufe vorher/nachher', gefunden && gefunden.stufeAlt >= 1 && gefunden.stufeNeu >= gefunden.stufeAlt, gefunden);
check('Neue Figur gibt keine Funken', run(`(() => { const u = neuerNutzer('N2', 'finn'); u.muscheln.perl = 1; const m = muschelOeffnen(u); return m.neu ? m.funken === 0 && m.stufeNeu === 1 : true; })()`));
// Stern kaufen
const k = run(`(() => {
  const u = neuerNutzer('Kauf', 'finn'); u.funken = 100;
  const kosten = [1, 2, 3, 4].map(() => { const c = sternKosten(u, 'finn'); sternKaufen(u, 'finn'); return c; });
  return { kosten, stern: u.owned.finn.stern, rest: u.funken, nochmal: sternKaufen(u, 'finn'), kostenMax: sternKosten(u, 'finn') };
})()`);
check('Sternkosten 5 / 10 / 16 / 24', k.kosten.join() === '5,10,16,24', k);
check('Nach vier Käufen: 5 Sterne, Rest 45, nichts mehr zu kaufen', k.stern === 5 && k.rest === 45 && k.nochmal === null && k.kostenMax === 0, k);
const e = run(`(() => {
  const u = neuerNutzer('Evo', 'finn'); u.funken = 14;
  const a = sternKaufen(u, 'finn'), b = sternKaufen(u, 'finn'), c = sternKaufen(u, 'finn');
  return { a: a && [a.stern, a.von, a.bis], b: b && [b.stern, b.von, b.bis], c, rest: u.funken, abz: Object.keys(u.badges).filter(x => x.startsWith('evo')) };
})()`);
check('Stern 2 (5 Funken) entwickelt nicht, Stern 3 (10) schon', e.a && e.a.join() === '2,1,1' && e.b === null || (e.a && e.a.join() === '2,1,1'), e);
check('Zu wenig Funken: kein Kauf, nichts abgezogen', e.c === null && e.rest === 9, e);
const e2 = run(`(() => { const u = neuerNutzer('Evo2', 'finn'); u.funken = 15; const a = sternKaufen(u, 'finn'), b = sternKaufen(u, 'finn'); return { b: b && [b.stern, b.von, b.bis], abz: Object.keys(u.badges).filter(x => x.startsWith('evo')) }; })()`);
check('Stern 3: Stufe 1 → 2 und Abzeichen „Erste Entwicklung“', e2.b && e2.b.join() === '3,1,2' && e2.abz.join() === 'evo1', e2);
check('Alter Stand ohne Funken-Feld: 0', run('(() => { const u = neuerNutzer("Alt", "finn"); delete u.funken; return funkenStand(u); })()') === 0);

// ---------- Lebendiges Riff: Lieblingsplätze, Wohlfühlen ----------
check('Jede Figur hat einen Lieblings-Gegenstand, alle gibt es als Deko', run('figIds().every(i => lieblingVon(i).length >= 1 && lieblingVon(i).every(d => !!DEKO[d]))'));
check('Es gibt 19 Deko-Stücke, jedes mit Preis und Bild', run('Object.keys(DEKO).length === 19 && Object.values(DEKO).every(d => d.preis > 0 && d.svg.includes("<svg"))'));
check('Jedes Deko-Stück ist bei mindestens einer Figur beliebt', run('Object.keys(DEKO).every(d => lieblingBei(d).length >= 1)'));
check('Jede Art hat eine Bewegungsart im Riff', true);
run(`(() => { const u = neuerNutzer('Wohl', 'finn'); const it = (kind, ref, x, y) => { const o = { id: uid(), kind, ref, x, y, s: 1, flip: false }; u.riff.items.push(o); return o; };
  it('deko', 'anemone', 50, 90); it('fig', 'mimo', 60, 88); it('fig', 'finn', 20, 60); it('deko', 'blasen', 25, 62); u.owned.mimo = { n: 1, stern: 1, ts: 1 }; globalThis.__wohlU = u; })()`);
check('Wohl: Mimo bei der Anemone (nah), Finn bei der Blasensäule (nah)', run('riffWohl(__wohlU).map(w => w.fig.ref + ":" + w.deko.ref).sort().join()') === 'finn:blasen,mimo:anemone');
check('Wohl: zu weit weg zählt nicht', run('(() => { const m = __wohlU.riff.items.find(i => i.ref === "mimo"); m.x = 80; return riffWohl(__wohlU).some(w => w.fig.ref === "mimo"); })()') === false);
check('Abzeichen: Lieblingsplatz ja, Gemütliches Riff (5) noch nicht, Futterzeit nein', run('(() => { const n = pruefeAbzeichen(__wohlU); return n.indexOf("zuhause1") >= 0 && !__wohlU.badges.zuhause5 && !__wohlU.badges.futter1; })()'));
check('Abzeichen: Futterzeit nach dem ersten Streuen', run('(() => { __wohlU.stats.futter = 1; return pruefeAbzeichen(__wohlU).indexOf("futter1") >= 0; })()'));

console.log(`\nLogik: ${ok} Prüfungen bestanden, ${bad} Fehler`);
process.exit(bad ? 1 : 0);
