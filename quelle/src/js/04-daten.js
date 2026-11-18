'use strict';
// ---------- Datenmodell: Nutzer, Projekte, Lernstand, Planer ----------
// Lernstand gehört zur KARTE (nicht zum Projekt). Wiederholungsplan wie bei Anki (SM-2-Familie):
//   Karte = { b, due, iv, ease, lapses, step, n, ok, last }
//   step > 0  → Lernphase (neu oder nach Fehler): noch so viele „Gut“ nötig, Karte bleibt heute fällig
//   iv        → aktuelles Intervall in Tagen, ease → Leichtigkeitsfaktor (Start 2,5)
//   b (Tiefe) → 0 neu · 1 Lernphase/Fehler · 2 gelernt · 3 sicher · 4 prüfungsfit · 5 tief   (zählt erfolgreiche Wiederholungen)
// Projekte wählen nur aus, WELCHE Karten bis WANN sitzen sollen. Hat eine Karte ein Projekt mit Enddatum, wird ihr Intervall
// so gedeckelt, dass sie vor dem Termin noch mindestens einmal kommt; Dauerprojekte (ohne Ende) lassen die Intervalle wachsen.
const SRS = { ease0: 2.5, easeMin: 1.3, easeMax: 3.2, hart: 1.2, leicht: 1.3, lapseFak: 0.25, gradGut: 1, gradLeicht: 4, maxIv: 365, langIv: 21 };
const ANTWORTEN = [
  { r: 0, name: 'Nochmal', farbe: 'rot' }, { r: 1, name: 'Schwer', farbe: 'orange' },
  { r: 2, name: 'Gut', farbe: 'gruen' }, { r: 3, name: 'Leicht', farbe: 'tuerkis' }
];
const ZIELE = [
  { b: 2, name: 'Kennenlernen', txt: 'Jedes Wort einmal gelernt' },
  { b: 3, name: 'Sicher', txt: 'Jedes Wort auch am nächsten Tag noch gewusst' },
  { b: 4, name: 'Prüfungsfit', txt: 'Jedes Wort an mehreren Tagen gewusst' },
  { b: 9, name: 'Langzeit', txt: 'Jedes Wort mindestens 3 Wochen im Gedächtnis', nurDauer: true }
];
const ziel_ = b => ZIELE.find(z => z.b === b) || ZIELE[1];
const TEMPO = { sanft: { name: 'Sanft', max: 16 }, normal: { name: 'Normal', max: 28 }, stark: { name: 'Stark', max: 45 } };
const BOX_NAMEN = ['Neu', 'Lernphase', 'Flachwasser', 'Riff', 'Tiefe', 'Tiefsee'];

const cur = () => (S && S.cur ? S.users[S.cur] : null);

function neuerNutzer(name, avatar) {
  const id = uid();
  S.users[id] = {
    id, name: name.trim().slice(0, 18), avatar, created: heute(),
    xp: 0, perlen: 20, muscheln: { perl: 1, schatz: 0 }, pity: 0, tiefeMax: 0,
    owned: {}, deko: {}, riff: { bg: 'flach', items: [] }, badges: {},
    cards: {}, projects: {}, tage: {},
    set: { ton: true, sprechen: 'auto', runde: 10, tempo: 'normal', sp: 'en' },
    stats: { antworten: 0, richtig: 0, runden: 0, tagesziele: 0, muscheln: 0 }
  };
  const u = S.users[id];
  if (typeof FIG !== 'undefined' && FIG[avatar]) u.owned[avatar] = { n: 1, stern: 1, ts: Date.now(), neu: false };
  S.cur = id;
  sichere();
  return u;
}

// ---------- Bibliothek-Zugriffe ----------
const lektionenSp = sp => Object.values(S.lib.lessons).filter(l => l.sp === sp).sort((a, b) => a.nr - b.nr);
const hatKarten = sp => lektionenSp(sp).some(l => Object.keys(l.cards).length);
function cidInfo(cid) {
  const t = cid.split('_');
  const lkey = t[0], satz = t[1], nrTxt = t[2];
  const L = S.lib.lessons[lkey];
  const c = L && L.cards[cid];
  return { cid, lkey, satz, nrTxt, L, c, info: satzInfo(satz), sp: lkey[0] === 'E' ? 'en' : 'fr' };
}
function kartenListe(L) {                                          // Reihenfolge: Eintragsnr., dann Satz; Bildkarten zuletzt
  return Object.keys(L.cards).map(cid => ({ cid, ...L.cards[cid] })).sort((a, b) =>
    (a.bild - b.bild) || (a.nr - b.nr) || (SATZ_REIHE.indexOf(a.satz) - SATZ_REIHE.indexOf(b.satz)));
}
function satzListe(lkeys) {
  const set = new Set();
  lkeys.forEach(k => { const L = S.lib.lessons[k]; if (L) Object.values(L.cards).forEach(c => set.add(c.satz)); });
  return SATZ_REIHE.filter(s => set.has(s)).concat(Array.from(set).filter(s => SATZ_REIHE.indexOf(s) < 0));
}
// Fragetext/Antworttext einer Wortkarte (nur wenn die Lektion Text hat)
function karteText(cid) {
  const ci = cidInfo(cid);
  if (!ci.L || !ci.c || ci.info.art !== 'wort') return null;
  const e = ci.L.entries[ci.c.nr];
  if (!e || e.nurKarte) return null;                      // z. B. Konjugationskarte: nur umdrehen, kein Quiz/Tippen
  const vonDe = ci.info.von === 'de';
  const hint = e.hinweis ? ` (${e.hinweis})` : '';
  return {
    e, vonDe, tts: ci.L.tts,
    frage: vonDe ? e.de : e.fremd + hint, antwort: vonDe ? e.fremd + hint : e.de,
    fremd: e.fremd, sprechen: e.sprechen || plain(e.fremd), de: e.de,
    loes: vonDe ? e.fremd : e.de, loesSprache: vonDe ? (ci.sp === 'fr' ? 'fr' : 'en') : 'de', artikel: e.artikel || null
  };
}

// ---------- Projekte ----------
const projekte = (u, sp) => Object.values(u.projects).filter(p => !sp || p.sp === sp);
const istAktiv = p => p.status === 'aktiv' && (!p.end || heute() <= p.end);
function projektKarten(P) {
  const out = [];
  P.lessons.forEach(k => {
    const L = S.lib.lessons[k]; if (!L) return;
    kartenListe(L).forEach(c => { if (P.sets.indexOf(c.satz) >= 0) out.push(c.cid); });
  });
  return out;
}
const lerntag = (P, d) => (P.ruhe || []).indexOf(wochentag(d)) < 0;
function lernTageRest(P, ab) {                                     // Lerntage von ab bis Ende (beide inklusive)
  if (!P.end) return 999;
  let n = 0; for (let d = ab; d <= P.end; d = addTage(d, 1)) if (lerntag(P, d)) n++;
  return n;
}
function lernTagDavor(P, d) { for (let i = 1; i <= 8; i++) { const x = addTage(d, -i); if (lerntag(P, x)) return x; } return addTage(d, -1); }
const reserveTage = ziel => (ziel >= 4 ? 4 : ziel >= 3 ? 2 : 0);   // so viele Tage vor dem Ende sollen keine neuen Karten mehr kommen

function neuesProjekt(u, o) {                                      // o: { name, sp, lessons, sets, end, ziel, ruhe, dauer }
  const id = uid();
  const P = {
    id, name: (o.name || 'Projekt').trim().slice(0, 28), sp: o.sp, lessons: o.lessons.slice(), sets: o.sets.slice(),
    start: heute(), end: o.dauer ? null : o.end, ziel: o.dauer ? 9 : o.ziel, ruhe: o.ruhe || [], dauer: !!o.dauer,
    status: 'aktiv', serie: { cur: 0, best: 0, last: null, joker: null }, meilen: {}, heute: null, wochen: {}, created: Date.now()
  };
  u.projects[id] = P; sichere();
  return P;
}

// ---------- Wiederholungsplan (Anki-ähnlich) ----------
const lang_ = s => !!s && s.step === 0 && s.b >= 2 && s.iv >= SRS.langIv;
const erreicht = (s, ziel) => !!s && (ziel === 9 ? lang_(s) : s.b >= ziel);
const KB = (u, cid) => (u.cards[cid] ? u.cards[cid].b : 0);
function capFuer(u, cid, dn) {                                     // frühester Termin aller aktiven Projekte mit Enddatum, die diese Karte enthalten
  let cap = SRS.maxIv;
  projekte(u, cidInfo(cid).sp).forEach(P => {
    if (P.status !== 'aktiv' || !P.end || projektKarten(P).indexOf(cid) < 0) return;
    const bis = tagNr(P.end) - dn;
    if (bis >= 1) cap = Math.min(cap, Math.max(1, Math.floor(bis / 2)));
  });
  return cap;
}
// Reiner Schritt: aus altem Zustand + Antwort r (0 Nochmal, 1 Schwer, 2 Gut, 3 Leicht) den neuen Zustand berechnen.
function srsSchritt(s0, r, dn, cap, fuzz) {
  const neu = !s0;
  const s = s0 ? Object.assign({}, s0) : { b: 0, due: dn, iv: 0, ease: SRS.ease0, lapses: 0, step: 0, n: 0, ok: 0, last: 0 };
  const info = { neu, graduiert: false, lapse: false, gap: 0, aenderung: true };
  const fertigGraduiert = (ivTage, bNeu) => {
    s.step = 0; s.iv = Math.max(1, Math.min(ivTage, cap, SRS.maxIv)); s.due = dn + s.iv; s.b = bNeu; info.graduiert = true;
  };
  const faellig = neu || s.due <= dn;
  if (neu) { s.step = 2; s.b = 1; }
  if (s.step > 0) {                                                // Lernphase (neu oder nach Fehler)
    const relearn = !!s.relearn;                                   // Lernphase nach einem Fehler (statt erstes Kennenlernen)
    if (r === 0) { s.step = relearn ? 1 : 2; info.gap = 3; }
    else if (r === 1) { info.gap = 4; }
    else if (r === 2) {
      s.step--;
      if (s.step <= 0) fertigGraduiert(relearn ? s.iv : SRS.gradGut, 2);
      else info.gap = 6;
    } else fertigGraduiert(relearn ? Math.max(2, s.iv) : SRS.gradLeicht, relearn ? 2 : 3);
    if (s.step === 0) s.relearn = false;
    if (s.step > 0) s.due = dn;
    return { s, info };
  }
  // fertig gelernte Karte
  if (!faellig && r >= 1) { info.aenderung = false; return { s, info }; }   // freies Üben ändert den Plan nicht
  const spaet = Math.max(0, dn - s.due), iv = Math.max(1, s.iv || 1);
  if (r === 0) {                                                   // Fehler: zurück in die Lernphase
    s.lapses++; s.ease = Math.max(SRS.easeMin, s.ease - 0.2);
    s.iv = Math.max(1, Math.floor(iv * SRS.lapseFak)); s.b = 1; s.step = 1; s.relearn = true; s.due = dn;
    info.lapse = true; info.gap = 3;
    return { s, info };
  }
  let ivN;
  if (r === 1) { ivN = Math.max(iv + 1, Math.round((iv + spaet / 4) * SRS.hart)); s.ease = Math.max(SRS.easeMin, s.ease - 0.15); }
  else if (r === 2) { ivN = Math.max(iv + 1, Math.round((iv + spaet / 2) * s.ease)); s.b = Math.min(5, s.b + 1); }
  else { ivN = Math.max(iv + 1, Math.round((iv + spaet) * s.ease * SRS.leicht)); s.ease = Math.min(SRS.easeMax, s.ease + 0.15); s.b = Math.min(5, s.b + 1); }
  if (fuzz && ivN >= 7) ivN = Math.max(iv + 1, Math.round(ivN * (0.95 + rand() * 0.1)));
  s.iv = Math.max(1, Math.min(ivN, cap, SRS.maxIv)); s.due = dn + s.iv;
  return { s, info };
}
// Eine Antwort verbuchen. Gibt zurück, ob die Karte jetzt für heute „erledigt“ ist (nicht mehr fällig).
function bewerte(u, cid, r) {
  const d = heute(), dn = tagNr(d);
  const alt = u.cards[cid];
  const { s, info } = srsSchritt(alt, r, dn, capFuer(u, cid, dn), true);
  const war = alt ? alt.b : 0;
  s.n++; if (r >= 2) s.ok++;
  s.last = Date.now();
  u.cards[cid] = s;
  const t = u.tage[d] || (u.tage[d] = { n: 0, ok: 0 });
  t.n++; if (r >= 2) t.ok++;
  if (alt && alt.step === 0 && alt.b >= 2 && alt.due <= dn) { t.rev = (t.rev || 0) + 1; if (r >= 2) t.revOk = (t.revOk || 0) + 1; }   // für die Behaltensquote
  u.stats.antworten++; if (r >= 2) u.stats.richtig++;
  const erledigt = s.step === 0 && s.due > dn;
  return { neu: !alt, war, jetzt: s.b, erledigt, graduiert: info.graduiert, erstGrad: info.graduiert && !(alt && alt.relearn), wiederholt: !!(alt && alt.step === 0 && alt.due <= dn && r >= 2), lapse: info.lapse, gap: info.gap, aufgestiegen: s.b > war && s.step === 0 };
}
// Vorschau der Abstände für die vier Antwort-Knöpfe (wie bei Anki)
function ivText(tage) {
  if (tage < 1) return 'gleich';
  if (tage < 30) return tage === 1 ? '1 Tag' : tage + ' Tage';
  if (tage < 365) { const m = Math.round(tage / 30.4); return m === 1 ? '1 Monat' : m + ' Monate'; }
  return '1 Jahr';
}
function vorschau(u, cid) {
  const dn = tagNr(heute()), cap = capFuer(u, cid, dn);
  return [0, 1, 2, 3].map(r => {
    const { s, info } = srsSchritt(u.cards[cid], r, dn, cap, false);
    if (!info.aenderung) return ivText(s.iv);
    return s.step > 0 ? 'gleich' : ivText(s.iv);
  });
}

// ---------- Fortschritt ----------
function stand(u, P) {                                             // { n, ok, pct, boxen, gesehen }
  const cids = projektKarten(P);
  const boxen = [0, 0, 0, 0, 0, 0];
  let ok = 0;
  cids.forEach(c => { const s = u.cards[c]; boxen[s ? s.b : 0]++; if (erreicht(s, P.ziel)) ok++; });
  return { n: cids.length, ok, pct: cids.length ? ok / cids.length : 0, boxen, gesehen: cids.length - boxen[0] };
}
function standKarten(u, cids, ziel) {                              // Anteil der Karten, die mindestens Box „ziel“ erreicht haben
  let ok = 0; cids.forEach(c => { if (erreicht(u.cards[c], ziel)) ok++; });
  return { n: cids.length, ok, pct: cids.length ? ok / cids.length : 0 };
}
// Kartenreife wie bei Anki: neu / lernt / jung (< 21 Tage) / reif (≥ 21 Tage)
function reifeVerteilung(u, cids) {
  const o = { neu: 0, lernt: 0, jung: 0, reif: 0 };
  cids.forEach(c => { const s = u.cards[c]; if (!s) o.neu++; else if (s.step > 0) o.lernt++; else if (s.iv >= SRS.langIv) o.reif++; else o.jung++; });
  return o;
}
function vorhersage(u, cids, tage) {                               // fällige Karten je Tag (Index 0 = heute inkl. Überfälliges)
  const dn = tagNr(heute()), out = new Array(tage).fill(0);
  cids.forEach(c => { const s = u.cards[c]; if (!s) return; const i = Math.max(0, s.due - dn); if (i < tage) out[i]++; });
  return out;
}
function behaltensquote(u, tage = 30) {
  let n = 0, ok = 0;
  for (let i = 0; i < tage; i++) { const t = u.tage[addTage(heute(), -i)]; if (t && t.rev) { n += t.rev; ok += t.revOk || 0; } }
  return n >= 10 ? ok / n : null;
}
// Ehrlichkeit: reicht die Zeit überhaupt? (Box 3 braucht mind. 2 Lerntage, Box 4 mind. 5 Tage Abstand zwischen Start und Ende)
function realismus(P, nKarten) {
  if (P.dauer || !P.end) return null;
  const tage = diffTage(heute(), P.end);
  const minT = P.ziel >= 4 ? 4 : P.ziel >= 3 ? 1 : 0, empf = P.ziel >= 4 ? 7 : P.ziel >= 3 ? 3 : 1;
  const lt = lernTageRest(P, heute());
  const z = ziel_(P.ziel).name;
  if (tage < minT) return { stufe: 'eng', txt: `Für „${z}“ braucht es mindestens ${minT + 1} Tage. Wähle mehr Zeit oder ein kleineres Ziel.` };
  const proTag = nKarten / Math.max(1, lt - reserveTage(P.ziel));
  if (proTag > 22) return { stufe: 'viel', txt: `Das sind etwa ${Math.ceil(proTag)} neue Karten pro Tag – ziemlich viel. Mehr Zeit oder weniger Lektionen machen es entspannter.` };
  if (tage < empf) return { stufe: 'knapp', txt: `Das geht, ist aber knapp: Für „${z}“ sind ${empf} Tage oder mehr entspannter, falls mal ein Tag ausfällt.` };
  const nn = Math.max(1, Math.ceil(proTag));
  return { stufe: 'ok', txt: `Etwa ${nn} neue ${nn === 1 ? 'Karte' : 'Karten'} pro Lerntag – das ist gut machbar.` };
}

// ---------- Tagesplan ----------
function heutePlan(u, P) {
  const d = heute();
  if (P.heute && P.heute.d === d) return P.heute;
  const dn = tagNr(d), cids = projektKarten(P);
  // fällig: Lernphase zuerst, dann nach „relativer Überfälligkeit“ (wie Anki)
  const faellig = cids.filter(c => u.cards[c] && u.cards[c].due <= dn)
    .sort((a, b) => {
      const A = u.cards[a], B = u.cards[b];
      if ((A.step > 0) !== (B.step > 0)) return A.step > 0 ? -1 : 1;
      return ((dn - B.due) / Math.max(1, B.iv)) - ((dn - A.due) / Math.max(1, A.iv));
    });
  const unseen = cids.filter(c => !u.cards[c]);
  const cap = (TEMPO[u.set.tempo] || TEMPO.normal).max;
  let quota = 0;
  if (unseen.length) {
    if (P.end) quota = Math.ceil(unseen.length / Math.max(1, lernTageRest(P, d) - reserveTage(P.ziel)));
    else quota = Math.min(5, unseen.length);
    quota = clamp(quota, 1, 20);
  }
  const frei = !lerntag(P, d);
  let nf = Math.min(faellig.length, cap), nn = Math.min(quota, Math.max(0, cap - nf));
  if (nn < Math.min(quota, 3)) { nn = Math.min(quota, 3); nf = Math.min(faellig.length, cap - nn); }
  if (frei) { nf = 0; nn = 0; }                                    // Ruhetag: nur freiwillig
  P.heute = { d, ziel: nf + nn, faellig: faellig.slice(0, nf), neu: unseen.slice(0, nn), erledigt: {}, fertig: false, ruhetag: frei };
  sichere();
  return P.heute;
}
const planGeschafft = pl => Object.keys(pl.erledigt).length;

// Runde zusammenstellen: erst fällig/neu aus dem Tagesplan, danach „Bonusrunde“ (freies Üben, ändert den Plan nicht)
function baueRunde(u, P) {
  const n = u.set.runde || 10;
  const pl = heutePlan(u, P);
  const offen = pl.faellig.concat(pl.neu).filter(c => !pl.erledigt[c]);
  if (offen.length) return { karten: shuffle(offen.slice(0, n)), bonus: false };
  const alle = projektKarten(P);
  const gesehen = alle.filter(c => u.cards[c]).sort((a, b) => (u.cards[a].b - u.cards[b].b) || (u.cards[a].last - u.cards[b].last));
  let pool = gesehen.slice(0, n * 2);
  if (pool.length < n) pool = pool.concat(alle.filter(c => !u.cards[c]).slice(0, n - pool.length));
  return { karten: shuffle(pool).slice(0, n), bonus: true };
}

// In allen aktiven Projekten dieser Sprache, die die Karte im heutigen Plan haben, als erledigt markieren
function planAbhaken(u, cid) {
  const hit = [];
  const sp = cidInfo(cid).sp;
  projekte(u, sp).filter(istAktiv).forEach(P => {
    const pl = heutePlan(u, P);
    if (!pl.erledigt[cid] && (pl.faellig.indexOf(cid) >= 0 || pl.neu.indexOf(cid) >= 0)) {
      pl.erledigt[cid] = 1;
      if (!pl.fertig && planGeschafft(pl) >= pl.ziel && pl.ziel > 0) { pl.fertig = true; hit.push(P); }
    }
  });
  return hit;                                                      // Projekte, deren Tagesziel jetzt erreicht ist
}

// ---------- Serie („Strömung“): zählt nur innerhalb eines Projekts, ohne Strafe ----------
function verpassteTage(P, last, d) {                                // Lerntage zwischen last und d (beide exklusive)
  let n = 0; for (let x = addTage(last, 1); x < d; x = addTage(x, 1)) if (lerntag(P, x)) n++;
  return n;
}
function jokerFrei(P, d) { return !P.serie.joker || diffTage(P.serie.joker, d) >= 7; }
function serieLebt(P, d) {
  const s = P.serie; if (!s.last) return false;
  if (s.last === d) return true;
  const v = verpassteTage(P, s.last, d);
  return v === 0 || (v === 1 && jokerFrei(P, d));
}
const serieJetzt = P => (P.serie.last && serieLebt(P, heute()) ? P.serie.cur : 0);
function serieFortsetzen(P) {                                       // beim Erreichen des Tagesziels
  const s = P.serie, d = heute();
  if (s.last === d) return { cur: s.cur, joker: false };
  let joker = false;
  if (s.last && serieLebt(P, d)) {
    if (verpassteTage(P, s.last, d) === 1) { s.joker = d; joker = true; }
    s.cur++;
  } else s.cur = 1;
  s.last = d; s.best = Math.max(s.best, s.cur);
  return { cur: s.cur, joker };
}

// Wochenziel (Dauerprojekt): an 3 verschiedenen Tagen das Tagesziel schaffen
function wochenZaehlen(P) {
  const w = wochenStart(heute());
  const W = P.wochen[w] || (P.wochen[w] = { tage: [], muschel: false });
  if (W.tage.indexOf(heute()) < 0) W.tage.push(heute());
  return W;
}
