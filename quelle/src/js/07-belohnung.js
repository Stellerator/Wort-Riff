'use strict';
// ---------- Belohnungslogik: Perlen, Erfahrung, Ränge, Muscheln, Album, Abzeichen ----------
// Alle Zahlen sind Startwerte (ungeprüft an der Praxis) und stehen hier gebündelt, damit sie leicht zu justieren sind.
// Grundsätze: Belohnungen gehören dem Kind dauerhaft, nichts verfällt; Serie/Tagesziel zählen nur im selbst gewählten Projekt;
// Muschel-Wahrscheinlichkeiten sind in der App sichtbar; keine Käufe, keine Werbung, keine Verlust-Drohungen.
const R = {
  // Auf Jahre ausgelegt: ein Lerntag bringt etwa 60–100 XP, 15–25 Perlen und etwa eine Muschel.
  xp: { richtig: 2, neuGewusst: 3, fast: 1, falsch: 1, runde: 5, perfekt: 5, tagesziel: 15 },
  perlen: { neuGewusst: 1, wiederholt: 1, runde: 1, perfekt: 2, tagesziel: 3, serieMax: 3, meilen: { 25: 10, 50: 20, 75: 30, 100: 80 }, dublette: 4, dubletteRar: 4, stern: 15 },
  funken: { dublette: 2, dubletteRar: 2 },                        // Korallenfunken für eine Dublette: 2 / 4 / 6 / 8 je Seltenheit
  sternKosten: [0, 0, 5, 10, 16, 24],                             // Korallenfunken für Stern 2…5 (Index = Ziel-Stern); Entwicklung bei Stern 3 und 5
  mythDublette: { perlen: 25, funken: 15 },                       // Mythos doppelt gefunden
  pityNach: 10                                                    // spätestens die 10. Muschel enthält eine epische oder legendäre Figur
};
const MUSCHEL = {
  perl: { name: 'Perlmuschel', gew: [62, 25, 10, 3] },
  schatz: { name: 'Schatzmuschel', gew: [35, 40, 20, 5] }
};
const RAENGE = [                                                 // XP-Schwellen: Seepferdchen nach ~3–4 Lerntagen, Meereskönig erst nach etwa 3 Jahren
  [0, 'Schwimmanfänger'], [300, 'Seepferdchen'], [900, 'Bronze-Schwimmer'], [2000, 'Silber-Schwimmer'], [3600, 'Gold-Schwimmer'],
  [6000, 'Schnorchler'], [9500, 'Flaschentaucher'], [14000, 'Riffwächter'], [20000, 'Tiefseetaucher'], [28000, 'Strömungsmeister'],
  [38000, 'Gezeitenhüter'], [50000, 'Meereskönig']
];
const STERN_XP = 8000;                                            // danach alle 8000 XP ein Stern (endlos)
const RIFF_BG = [                                                // Riff-Hintergründe, freigeschaltet über den Rang
  { id: 'flach', name: 'Flachwasser', rang: 0 }, { id: 'daemmer', name: 'Dämmerzone', rang: 2 },
  { id: 'korallen', name: 'Korallengarten', rang: 4 }, { id: 'tief', name: 'Tiefsee', rang: 6 }, { id: 'nacht', name: 'Leuchtnacht', rang: 8 }
];
function rangVon(xp) {
  let i = 0; while (i + 1 < RAENGE.length && xp >= RAENGE[i + 1][0]) i++;
  const von = RAENGE[i][0], letzter = i === RAENGE.length - 1;
  let bis, extra = 0;
  if (letzter) { extra = Math.floor((xp - von) / STERN_XP); bis = von + (extra + 1) * STERN_XP; } else bis = RAENGE[i + 1][0];
  const vv = letzter ? von + extra * STERN_XP : von;
  return { i, name: RAENGE[i][1] + (extra ? ' ' + '★'.repeat(Math.min(extra, 5)) : ''), von: vv, bis, pct: (xp - vv) / (bis - vv), naechster: letzter ? 'noch ein Stern' : RAENGE[i + 1][1], stufe: i + extra };
}

// ---------- Geben ----------
function gib(u, o) {                                              // o: { xp, perlen, perl, schatz }
  const alt = rangVon(u.xp).stufe;
  u.xp += o.xp || 0; u.perlen += o.perlen || 0;
  if (o.perl) { u.muscheln.perl += o.perl; }
  if (o.schatz) { u.muscheln.schatz += o.schatz; }
  const neu = rangVon(u.xp).stufe;
  return neu > alt ? rangVon(u.xp) : null;
}
const muschelAnzahl = u => u.muscheln.perl + u.muscheln.schatz;

// Kleine Belohnung direkt nach jeder Antwort (r: 0 Nochmal, 1 Schwer, 2 Gut, 3 Leicht). Mühe zählt: auch Fehler geben etwas Erfahrung.
function belohneAntwort(u, r, res) {
  let xp = r >= 2 ? R.xp.richtig : r === 1 ? R.xp.fast : R.xp.falsch, perlen = 0;
  if (res.erstGrad) { xp += R.xp.neuGewusst; perlen += R.perlen.neuGewusst; }      // Perlen nur für echten Fortschritt: Karte neu gelernt …
  else if (res.wiederholt) { u.rv = (u.rv || 0) + 1; if (u.rv % 2 === 0) perlen += R.perlen.wiederholt; }   // … oder jede zweite fällige Karte erfolgreich wiederholt (kein Farmen durch Klicken)
  const rang = gib(u, { xp, perlen });
  return { xp, perlen, rang };
}

// ---------- Muschel öffnen ----------
// ---------- Tauchtiefe: schaltet seltenere Wesen frei ----------
function tiefeMeter(u) {                                          // 1 m je Karte „sicher“, +1 m „prüfungsfit“, +1 m „Langzeit“ (bis zu 3 m je Karte)
  let m = 0;
  Object.values(u.cards).forEach(s => { if (s.step === 0 && s.b >= 3) m++; if (s.step === 0 && s.b >= 4) m++; if (lang_(s)) m++; });
  return m;
}
function tiefeNach(u) { const t = Math.max(u.tiefeMax || 0, tiefeMeter(u)); u.tiefeMax = t; return t; }   // die tiefste erreichte Tiefe geht nie verloren
const tiefeJetzt = u => Math.max(u.tiefeMax || 0, tiefeMeter(u));
const zoneFrei = (u, r) => tiefeJetzt(u) >= RAR[r].tiefe;
const zoneVonTiefe = m => RAR.reduce((z, r) => (m >= r.tiefe ? r.id : z), 0);
function wahrscheinlichkeiten(u, art) {                           // tatsächliche Chancen mit der aktuellen Tauchtiefe (in Prozent, Summe 100)
  const t = tiefeJetzt(u), gew = MUSCHEL[art].gew.map((g, i) => (t >= RAR[i].tiefe ? g : 0)), gs = sum(gew);
  return gew.map(g => g / gs * 100);
}

function ziehen(u, art) {
  const tiefe = tiefeNach(u);
  if (tiefe >= MYTH_CHANCE.ab && rand() * 100 < MYTH_CHANCE[art]) {   // mystischer Fund: Schutzzähler und Seltenheits-Wurf bleiben unberührt
    const res = mythGeben(u, mythWaehlen(u));
    res.art = art; res.tiefe = tiefe; res.pity = false; u.pity = 0;
    u.stats.muscheln = (u.stats.muscheln || 0) + 1;
    return res;
  }
  const gew = MUSCHEL[art].gew.map((g, i) => (tiefe >= RAR[i].tiefe ? g : 0));     // nur Wesen, die in dieser Tiefe leben
  const hochFrei = tiefe >= RAR[2].tiefe;
  u.pity = hochFrei ? (u.pity || 0) + 1 : 0;                      // Schutzzähler läuft erst, wenn es etwas Episches zu finden gibt
  let rar;
  const pity = hochFrei && u.pity >= R.pityNach;
  if (pity) {
    gew[0] = 0; gew[1] = 0;                                       // Schutz: spätestens jetzt episch oder besser
  }
  const gs = sum(gew); let x = rand() * gs; rar = 0;
  for (let i = 0; i < gew.length; i++) { if (x < gew[i]) { rar = i; break; } x -= gew[i]; }
  if (rar >= 2) u.pity = 0;
  const id = figWaehlen(u, rar);
  const res = figGeben(u, id, rar);
  res.art = art; res.pity = pity; res.tiefe = tiefe;
  u.stats.muscheln = (u.stats.muscheln || 0) + 1;
  return res;
}
// Unbekannte Figuren einer Seltenheit werden dreimal so oft gezogen wie schon bekannte
function figWaehlen(u, rar) {
  const pool = figNachSeltenheit(rar), ws = pool.map(i => (u.owned[i] ? 1 : 3));
  let y = rand() * sum(ws), id = pool[0];
  for (let i = 0; i < pool.length; i++) { if (y < ws[i]) { id = pool[i]; break; } y -= ws[i]; }
  return id;
}
// Figur ins Album legen; eine Dublette gibt Perlen, Korallenfunken und ab und zu einen Stern
function figGeben(u, id, rar) {
  const besitz = u.owned[id];
  const res = { id, rar, neu: !besitz, perlen: 0, funken: 0, sternNeu: 0, stufeAlt: besitz ? figStufe(besitz.stern) : 1, stufeNeu: 1 };
  if (!besitz) u.owned[id] = { n: 1, stern: 1, ts: Date.now(), neu: true };
  else {
    besitz.n++;
    const sterne = [1, 3, 6, 10];                                 // ab dieser Anzahl gibt es einen weiteren Stern (max. 5)
    const st = 1 + sterne.filter(n => besitz.n >= n + 1).length;
    res.perlen = R.perlen.dublette + R.perlen.dubletteRar * rar;
    res.funken = R.funken.dublette + R.funken.dubletteRar * rar; u.funken = funkenStand(u) + res.funken;
    if (st > besitz.stern) { besitz.stern = st; res.sternNeu = st; res.perlen += R.perlen.stern; }
    u.perlen += res.perlen;
    res.stufeNeu = figStufe(besitz.stern);
  }
  return res;
}
// Mythen der Tiefe (06m-mythos): sehr selten in Muscheln, etwas häufiger in großen Überraschungspaketen. Unbekannte werden dreimal so oft gezogen.
function mythWaehlen(u) {
  const ids = mythIds(), b = mythBesitz(u), ws = ids.map(i => (b[i] ? 1 : 3));
  let y = rand() * sum(ws), id = ids[0];
  for (let i = 0; i < ids.length; i++) { if (y < ws[i]) { id = ids[i]; break; } y -= ws[i]; }
  return id;
}
function mythGeben(u, id) {
  const b = mythBesitz(u), res = { id, myth: true, neu: !b[id], perlen: 0, funken: 0 };
  if (!b[id]) b[id] = { n: 1, ts: Date.now(), neu: true };
  else { b[id].n++; res.perlen = R.mythDublette.perlen; res.funken = R.mythDublette.funken; u.perlen += res.perlen; u.funken = funkenStand(u) + res.funken; }
  return res;
}
function muschelOeffnen(u) {                                      // Schatzmuscheln zuerst
  const art = u.muscheln.schatz > 0 ? 'schatz' : u.muscheln.perl > 0 ? 'perl' : null;
  if (!art) return null;
  u.muscheln[art]--;
  const res = ziehen(u, art);
  res.abzeichen = pruefeAbzeichen(u);
  sichere();
  return res;
}
// ---------- Überraschungspakete: die Belohnung der Generalprobe ----------
// Je mehr Karten in einer Generalprobe abgefragt wurden, desto größer das Paket (ab 5 / 15 / 30 / 60 Karten); pro Projekt und Tag gibt es eins.
// Jeder Platz im Paket enthält Perlen, Korallenfunken, einen Freund oder einen besonderen Gegenstand (Riff-Deko; in großen Paketen auch ein Mythos).
// gew = Gewichte [Perlen, Funken, Freund, Gegenstand]; rar = Gewichte der Seltenheit des Freundes (nur Zonen, die schon erreicht sind); preis = höchster Deko-Preis; myth = Prozent, dass der Gegenstand ein Mythos ist
const PAKET = [null,
  { stufe: 1, name: 'Kleines Überraschungspaket', ab: 5, plaetze: 1, gew: [50, 35, 12, 3], perlen: [10, 20], funken: [3, 6], rar: [62, 25, 10, 3], preis: 70, myth: 0 },
  { stufe: 2, name: 'Überraschungspaket', ab: 15, plaetze: 2, gew: [38, 32, 22, 8], perlen: [20, 40], funken: [6, 10], rar: [45, 38, 15, 2], preis: 95, myth: 2 },
  { stufe: 3, name: 'Großes Überraschungspaket', ab: 30, plaetze: 3, gew: [28, 28, 28, 16], perlen: [40, 80], funken: [10, 18], rar: [35, 40, 20, 5], preis: 150, myth: 8 },
  { stufe: 4, name: 'Sternen-Überraschungspaket', ab: 60, plaetze: 4, gew: [20, 24, 32, 24], perlen: [80, 150], funken: [18, 30], rar: [15, 40, 33, 12], preis: 999, myth: 18 }
];
const PAKET_KAT = ['perlen', 'funken', 'freund', 'ding'];
const paketBesitz = u => (u.pakete = u.pakete || { 1: 0, 2: 0, 3: 0, 4: 0 });
const paketAnzahl = u => sum(Object.values(paketBesitz(u)));
const paketHoechste = u => { const b = paketBesitz(u); for (let i = PAKET.length - 1; i >= 1; i--) if (b[i] > 0) return i; return 0; };
const paketStufeFuer = n => { let s = 0; for (let i = 1; i < PAKET.length; i++) if (n >= PAKET[i].ab) s = i; return s; };
function paketVergeben(u, P, n) {                                 // n = abgefragte Karten → { stufe, grund: ok | zuwenig | heute }
  const stufe = paketStufeFuer(n);
  if (!stufe) return { stufe: 0, grund: 'zuwenig' };
  if (P.paketAm === heute()) return { stufe: 0, grund: 'heute', moeglich: stufe };
  P.paketAm = heute(); paketBesitz(u)[stufe]++;
  return { stufe, grund: 'ok' };
}
const wuerfle = gew => { const gs = sum(gew); let x = rand() * gs; for (let i = 0; i < gew.length; i++) { if (x < gew[i]) return i; x -= gew[i]; } return gew.length - 1; };
const zwischen = ([a, b]) => a + Math.floor(rand() * (b - a + 1));
function paketOeffnen(u, stufe) {                                 // → { stufe, preise: [{typ, …}], abzeichen } oder null
  const pk = PAKET[stufe], bes = paketBesitz(u);
  if (!pk || !(bes[stufe] > 0)) return null;
  bes[stufe]--;
  const tiefe = tiefeNach(u), preise = [];
  for (let k = 0; k < pk.plaetze; k++) {
    const kat = PAKET_KAT[wuerfle(pk.gew)];
    if (kat === 'perlen') { const n = zwischen(pk.perlen); u.perlen += n; preise.push({ typ: 'perlen', n }); }
    else if (kat === 'funken') { const n = zwischen(pk.funken); u.funken = funkenStand(u) + n; preise.push({ typ: 'funken', n }); }
    else if (kat === 'freund') {
      const rar = wuerfle(pk.rar.map((g, i) => (tiefe >= RAR[i].tiefe ? g : 0)));
      preise.push({ typ: 'freund', res: figGeben(u, figWaehlen(u, rar), rar) });
    } else if (pk.myth && rand() * 100 < pk.myth) preise.push({ typ: 'myth', res: mythGeben(u, mythWaehlen(u)) });
    else {
      const ids = Object.keys(DEKO).filter(d => DEKO[d].preis <= pk.preis), ws = ids.map(d => DEKO[d].preis);     // teurere Stücke sind wahrscheinlicher
      let y = rand() * sum(ws), id = ids[0];
      for (let i = 0; i < ids.length; i++) { if (y < ws[i]) { id = ids[i]; break; } y -= ws[i]; }
      u.deko[id] = (u.deko[id] || 0) + 1; (u.dekoNeu = u.dekoNeu || {})[id] = true;
      preise.push({ typ: 'deko', id });
    }
  }
  u.stats.pakete = (u.stats.pakete || 0) + 1;
  const abz = pruefeAbzeichen(u);
  sichere();
  return { stufe, preise, abzeichen: abz };
}
// Auswertung einer Generalprobe: antworten = [{ cid, r }] mit r 0 (nicht gewusst), 1 (wackelig), 2/3 (gewusst)
function probeAuswerten(antworten) {
  const n = antworten.length;
  return {
    n, gewusst: antworten.filter(a => a.r >= 2).length, wackelig: antworten.filter(a => a.r === 1).length, falsch: antworten.filter(a => a.r === 0).length,
    quote: n ? antworten.filter(a => a.r >= 2).length / n : 0,
    wackelListe: antworten.filter(a => a.r === 1).map(a => a.cid), falschListe: antworten.filter(a => a.r === 0).map(a => a.cid)
  };
}

// Mit Korallenfunken lässt sich ein Freund gezielt stärken: jeder Stern kostet Funken, Stern 3 und 5 entwickeln die Figur weiter.
const funkenStand = u => u.funken || 0;
function sternKosten(u, id) { const b = u.owned[id]; return b && b.stern < 5 ? R.sternKosten[b.stern + 1] : 0; }
function sternKaufen(u, id) {                                     // → { stern, von, bis, kosten, abzeichen } oder null
  const b = u.owned[id], k = sternKosten(u, id);
  if (!b || b.stern >= 5 || funkenStand(u) < k) return null;
  const von = figStufe(b.stern);
  u.funken = funkenStand(u) - k; b.stern++;
  const abz = pruefeAbzeichen(u);
  sichere();
  return { stern: b.stern, von, bis: figStufe(b.stern), kosten: k, abzeichen: abz };
}
const albumAnzahl = u => Object.keys(u.owned).length;

// ---------- Wohlfühlen im Riff: Wer steht bei seinem Lieblings-Gegenstand? (reine Rechnung über die gespeicherten Heimatplätze, siehe LIEBLING in 06-katalog) ----------
function riffWohl(u) {
  const items = u.riff.items, out = [];
  items.forEach(f => {
    if (f.kind !== 'fig') return;
    const mag = lieblingVon(f.ref);
    const d = items.find(i => i.kind === 'deko' && mag.indexOf(i.ref) >= 0 && Math.abs(i.x - f.x) <= 16 && Math.abs(i.y - f.y) <= 22);
    if (d) out.push({ fig: f, deko: d });
  });
  return out;
}

// ---------- Abzeichen ----------
function pruefeAbzeichen(u) {
  const neu = [];
  const st = u.stats;
  const gesehen = Object.keys(u.cards).length;
  const sicher = Object.values(u.cards).filter(c => c.b >= 3).length;
  const serieBest = Math.max(0, ...Object.values(u.projects).map(p => p.serie.best));
  const bed = {
    start: st.runden >= 1, karten50: st.antworten >= 100, karten250: st.antworten >= 500, karten1000: st.antworten >= 2500,
    runde10: st.runden >= 15, runde50: st.runden >= 75, runde200: st.runden >= 300,
    perfekt: (st.perfekt || 0) >= 1, perfekt5: (st.perfekt || 0) >= 5,
    tagesziel1: st.tagesziele >= 1, tagesziel10: st.tagesziele >= 10, tagesziel50: st.tagesziele >= 50,
    serie3: serieBest >= 3, serie7: serieBest >= 7, serie14: serieBest >= 14,
    projekt1: Object.keys(u.projects).length >= 1,
    projektfertig: Object.values(u.projects).some(p => p.ergebnis && p.ergebnis.pct >= 0.8),
    projekt100: Object.values(u.projects).some(p => p.ergebnis && p.ergebnis.pct >= 1) || Object.values(u.projects).some(p => p.status === 'aktiv' && stand(u, p).pct >= 1 && stand(u, p).n > 0),
    wort100: gesehen >= 100, sicher50: sicher >= 50,
    album10: albumAnzahl(u) >= 10, album20: albumAnzahl(u) >= 20, albumalle: albumAnzahl(u) >= figIds().length,
    selten: figIds().some(i => FIG[i].rar === 1 && u.owned[i]), legende: figIds().some(i => FIG[i].rar === 3 && u.owned[i]),
    evo1: Object.values(u.owned).some(o => o.stern >= 3), evo3: Object.values(u.owned).some(o => o.stern >= 5),
    zuhause1: riffWohl(u).length >= 1, zuhause5: riffWohl(u).length >= 5, futter1: (u.stats.futter || 0) >= 1,
    fragen1: (st.riffFragen || 0) >= 1, fragen50: (st.riffFragen || 0) >= 50, fragen250: (st.riffFragen || 0) >= 250,
    probe1: (st.proben || 0) >= 1, probe5: (st.proben || 0) >= 5, paket1: (st.pakete || 0) >= 1,
    mythos1: mythZahl(u) >= 1, mythos5: mythZahl(u) >= 5, mythosalle: mythZahl(u) >= mythIds().length,
    riff1: u.riff.items.filter(i => i.kind === 'deko').length >= 1, riff10: u.riff.items.length >= 10
  };
  Object.keys(bed).forEach(id => { if (bed[id] && !u.badges[id]) { u.badges[id] = Date.now(); neu.push(id); } });
  return neu;
}

// ---------- Runde auswerten ----------
// sess: { bonus, antworten: [{cid, r, erste, neu}], xp, perlen, treffer: Set(Projekt-IDs mit erreichtem Tagesziel) }
function rundeEnde(u, P, sess) {
  const d = heute();
  const erste = sess.antworten.filter(a => a.erste);
  const fehler = sess.antworten.filter(a => a.r === 0).length;
  const perfekt = fehler === 0 && erste.length >= 5 && !sess.abbruch;
  const sum_ = { xp: sess.xp, perlen: sess.perlen, perl: 0, schatz: 0, perfekt, fehler, richtig: erste.filter(a => a.r >= 2).length, n: erste.length, zeilen: [], tagesziele: [], meilen: [], serie: null, rang: null };
  const abbruch = !!sess.abbruch;                                // vorzeitig beendet: keine Rundenbelohnung, aber erreichte Tagesziele zählen
  const extra = { xp: 0, perlen: 0 };
  const t = u.tage[d] || (u.tage[d] = { n: 0, ok: 0 });
  if (!abbruch) {
    u.stats.runden++; t.runden = (t.runden || 0) + 1;
    extra.xp += R.xp.runde; extra.perlen += R.perlen.runde;
    if (perfekt) { u.stats.perfekt = (u.stats.perfekt || 0) + 1; extra.xp += R.xp.perfekt; extra.perlen += R.perlen.perfekt; sum_.zeilen.push({ ico: 'stern', t: 'Runde ohne Fehler', xp: R.xp.perfekt, perlen: R.perlen.perfekt }); }
  }
  // Tagesziele, die in dieser Runde erreicht wurden
  sess.treffer.forEach(pid => {
    const p = u.projects[pid]; if (!p || p.belohntAm === d) return;         // pro Projekt und Tag nur einmal (auch wenn der Plan neu berechnet wurde)
    p.belohntAm = d;
    u.stats.tagesziele++;
    const z = { name: p.name, pid, xp: R.xp.tagesziel, perlen: R.perlen.tagesziel, perl: 1, schatz: 0, serie: null, wochenMuschel: false, serieMuschel: false };
    if (!p.dauer) {
      const s = serieFortsetzen(p);
      z.serie = s;
      const bonus = Math.min(s.cur, R.perlen.serieMax);
      z.perlen += bonus;
      if (s.cur % 7 === 0) { z.schatz++; z.serieMuschel = true; }                // alle 7 Tage Strömung: Schatzmuschel
      else if (s.cur === 3) { z.perl++; z.serieMuschel = true; }
    } else {
      const w = wochenZaehlen(p);
      if (w.tage.length >= 3 && !w.muschel) { w.muschel = true; z.wochenMuschel = true; z.schatz++; }
    }
    sum_.tagesziele.push(z);
    extra.xp += z.xp; extra.perlen += z.perlen; sum_.perl += z.perl; sum_.schatz += z.schatz;
  });
  // Meilensteine
  projekte(u).filter(p => p.status === 'aktiv').forEach(p => {
    const pct = stand(u, p).pct;
    [25, 50, 75, 100].forEach(m => {
      if (pct * 100 >= m && !p.meilen[m] && stand(u, p).n > 0) {
        p.meilen[m] = Date.now();
        const pe = R.perlen.meilen[m];
        extra.perlen += pe; if (m === 50 || m === 75) sum_.perl++;
        if (m === 100) sum_.schatz++;
        sum_.meilen.push({ name: p.name, m, perlen: pe });
      }
    });
  });
  // Neue Tiefenzone erreicht? Dann gibt es eine Schatzmuschel, und in den Muscheln stecken ab jetzt auch Wesen dieser Zone
  const tAlt = u.tiefeMax || 0, tNeu = tiefeNach(u);
  sum_.tiefe = tNeu; sum_.zonen = RAR.filter(r => r.tiefe > 0 && r.tiefe > tAlt && r.tiefe <= tNeu);
  sum_.zonen.forEach(() => { extra.perlen += 10; sum_.schatz++; });
  sum_.xp += extra.xp; sum_.perlen += extra.perlen;
  const rg = gib(u, { xp: sum_.xp - sess.xp, perlen: sum_.perlen - sess.perlen, perl: sum_.perl, schatz: sum_.schatz });
  sum_.rang = sess.rang || rg;
  sum_.abzeichen = pruefeAbzeichen(u);
  sichere();
  return sum_;
}

// ---------- Projektabschluss (beim Öffnen der App) ----------
function projekteAbschliessen(u) {
  const fertig = [];
  projekte(u).forEach(p => {
    if (p.status === 'aktiv' && p.end && heute() > p.end) {
      const s = stand(u, p);
      p.status = 'fertig';
      p.ergebnis = { pct: s.pct, ok: s.ok, n: s.n, serieBest: p.serie.best, am: p.end, gesehen: false, perlen: Math.round(30 * s.pct) + (s.pct >= 1 ? 50 : 0), schatz: (s.pct >= 0.5 ? 1 : 0) + (s.pct >= 1 ? 1 : 0) };
      gib(u, { xp: Math.round(60 * s.pct), perlen: p.ergebnis.perlen, schatz: p.ergebnis.schatz });
      fertig.push(p);
    }
  });
  if (fertig.length) { pruefeAbzeichen(u); sichere(); }
  return fertig;
}

// ---------- Riff & Laden ----------
function dekoKaufen(u, id) {
  const d = DEKO[id];
  if (!d || u.perlen < d.preis) return false;
  u.perlen -= d.preis; u.deko[id] = (u.deko[id] || 0) + 1; (u.dekoNeu = u.dekoNeu || {})[id] = true; sichere();
  return true;
}
// ---------- Riff-Erweiterungen ----------
// Das Riff ist ein Raster aus Bildschirm-Kacheln. Start: 1 × 1. Positionen sind in „Einheiten“ gespeichert (100 = eine Kachel, Ursprung = Start-Kachel),
// deshalb bleiben alte Stände gültig. Nach unten geht es in die nächste Tiefenzone (Reihe 1 = Korallenriff, 2 = Tiefsee, 3 = Abgrund).
const RIFF_EXT = { max: { l: 2, r: 2, d: 3 }, preise: [120, 200, 320, 500], plus: 200 };   // Preis steigt mit jedem Kauf, danach +200 je Kauf
const riffExt = u => (u.riff.ext = u.riff.ext || { l: 0, r: 0, d: 0 });
const riffKaeufe = u => { const e = riffExt(u); return e.l + e.r + e.d; };
const riffPreis = u => { const n = riffKaeufe(u), p = RIFF_EXT.preise; return n < p.length ? p[n] : p[p.length - 1] + RIFF_EXT.plus * (n - p.length + 1); };
function riffWelt(u) { const e = riffExt(u), cols = 1 + e.l + e.r, rows = 1 + e.d; return { e, cols, rows, minX: -100 * e.l, w: 100 * cols, h: 100 * rows }; }
function riffErweiterbar(u, k) {                                  // { ok, grund, preis }
  const e = riffExt(u), preis = riffPreis(u);
  if (e[k] >= RIFF_EXT.max[k]) return { ok: false, grund: 'max', preis };
  if (k === 'd' && !zoneFrei(u, e.d + 1)) return { ok: false, grund: 'zone', zone: e.d + 1, preis };
  if (u.perlen < preis) return { ok: false, grund: 'perlen', preis, fehlt: preis - u.perlen };
  return { ok: true, preis };
}
function riffErweitern(u, k) {
  const p = riffErweiterbar(u, k); if (!p.ok) return false;
  u.perlen -= p.preis; riffExt(u)[k]++; sichere();
  return true;
}
const dekoPlatziert = (u, id) => u.riff.items.filter(i => i.kind === 'deko' && i.ref === id).length;
const dekoFrei = (u, id) => (u.deko[id] || 0) - dekoPlatziert(u, id);
const figPlatziert = (u, id) => u.riff.items.some(i => i.kind === 'fig' && i.ref === id);
