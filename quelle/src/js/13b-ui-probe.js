'use strict';
// ---------- Generalprobe: alle oder selbst gewählte Karten eines Projekts gezielt abfragen (z. B. am Tag vor dem Test) ----------
// Ändert den Lernplan nicht: keine Intervalle, kein Tagesziel, keine XP. Belohnung ist ein Überraschungspaket (PAKET in 07-belohnung),
// am Ende gibt es eine Auswertung. Die Runde läuft in der normalen Lern-Ansicht (LS.probe = true), Karten, Quiz und Tippen sind wählbar.
let PB = null;                                                    // Auswahl im Einrichtungs-Fenster: { pid, sel: Set(cid), filter, modus }
const PROBE_FILTER = [['alle', 'Alle'], ['wackelig', 'Noch nicht sicher'], ['falsch', 'Schon mal falsch'], ['neu', 'Noch nie geübt'], ['zufall', 'Zufällig 20'], ['keine', 'Keine']];
const probeFarbe = (u, cid) => { const c = u.cards[cid]; return !c ? '#C7DDE9' : c.b >= 3 ? '#1E8764' : c.b >= 2 ? '#FFC83D' : '#FF9A2B'; };
function probeFilterMenge(u, cids, f) {                           // Schnellfilter → Auswahl
  const c = x => u.cards[x];
  if (f === 'keine') return [];
  if (f === 'wackelig') return cids.filter(x => !c(x) || c(x).b < 3 || (c(x).step || 0) > 0);
  if (f === 'falsch') return cids.filter(x => c(x) && c(x).lapses > 0);
  if (f === 'neu') return cids.filter(x => !c(x));
  if (f === 'zufall') return shuffle(cids).slice(0, 20);
  return cids.slice();
}
AKT.probeNeu = el => {
  const u = cur(), P = u.projects[el.dataset.v]; if (!P) return;
  const cids = projektKarten(P).filter(c => cidInfo(c).c);
  if (!cids.length) { toast('In diesem Projekt gibt es keine Karten.', 'info'); return; }
  PB = { pid: P.id, sel: new Set(cids), filter: 'alle', modus: u.set.modus || 'karten' };
  probeBlatt();
};
function probeBlatt() {
  const u = cur(), P = u.projects[PB.pid]; if (!P) return;
  const cids = projektKarten(P).filter(c => cidInfo(c).c);
  const mitText = cids.some(c => karteText(c));
  const lekt = P.lessons.filter(k => S.lib.lessons[k]);
  const reihe = cid => {
    const t = karteText(cid), ci = cidInfo(cid);
    return `<button class="prow ${PB.sel.has(cid) ? 'an' : ''}" data-a="probeKarte" data-v="${cid}"><i class="pdot" style="background:${probeFarbe(u, cid)}"></i><span class="pbox">${ico('haken')}</span><b>${t ? esc(plain(t.frage)) : 'Bildkarte ' + esc(ci.nrTxt)}</b><small>${esc(ci.info.kurz)}${lekt.length > 1 ? ' · ' + esc(ci.L ? ci.L.titel : ci.lkey) : ''}</small></button>`;
  };
  const modi = mitText ? `<div class="tabs modus" id="probeModi">${[['karten', 'Karten'], ['quiz', 'Quiz'], ['tippen', 'Tippen']].map(([k, n]) => `<button class="${PB.modus === k ? 'an' : ''}" data-a="probeModus" data-v="${k}">${n}</button>`).join('')}</div>` : '<span class="mut" style="font-size:14px">Diese Karten haben keinen Text: Es gibt nur Karten umdrehen.</span>';
  zeigeBlatt(`<div class="probe sp-${P.sp}"><h2>Generalprobe</h2>
    <p class="mut" style="margin:4px 0 12px">„${esc(P.name)}“: Die gewählten Karten werden noch einmal abgefragt, zum Beispiel am Tag vor dem Test. Dein Lernplan ändert sich dadurch <b>nicht</b>.</p>
    <div class="zeile w probefilter">${PROBE_FILTER.map(([k, n]) => `<button class="chip ${PB.filter === k ? 'sp' : ''}" data-a="probeFilter" data-v="${k}">${n}</button>`).join('')}</div>
    ${lekt.length > 1 ? `<div class="zeile w probefilter"><span class="mut" style="font-size:14px">Lektion an/aus:</span>${lekt.map(k => `<button class="chip klein" data-a="probeLektion" data-v="${k}">${esc(S.lib.lessons[k].titel)}</button>`).join('')}</div>` : ''}
    <div class="probeliste" id="probeListe">${cids.map(reihe).join('')}</div>
    <div class="probefuss"><div class="zeile w" style="justify-content:space-between">${modi}</div><div class="probeinfo" id="probeInfo"></div>
      <div class="zeile"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn gruen gross" id="probeGo" data-a="probeStart">Los!</button></div></div></div>`, { breit: 860 });
  probeZaehlen();
}
function probeZaehlen() {                                         // Zähler, Paket-Hinweis und Haken der Zeilen auffrischen (ohne Neuaufbau, die Liste behält ihren Platz)
  const u = cur(), P = u.projects[PB.pid], n = PB.sel.size, st = paketStufeFuer(n);
  const info = $('#probeInfo'), go = $('#probeGo'); if (!info || !go) return;
  const schon = P && P.paketAm === heute();
  info.innerHTML = `<b>${n}</b> ${n === 1 ? 'Karte' : 'Karten'} gewählt · ${st ? `${ico('stern')} ${PAKET[st].name}${schon ? ' (für dieses Projekt gab es heute schon eins)' : ' wartet'}` : `ab ${PAKET[1].ab} Karten gibt es ein Überraschungspaket`}<small>Je mehr Karten, desto größer das Paket: ab ${PAKET.slice(1).map(p => p.ab).join(' · ')} Karten. Eins pro Projekt und Tag.</small>`;
  go.textContent = n ? `Los! (${n})` : 'Karten wählen'; go.disabled = !n;
  document.querySelectorAll('#probeListe .prow').forEach(b => b.classList.toggle('an', PB.sel.has(b.dataset.v)));
  document.querySelectorAll('.probefilter [data-a="probeFilter"]').forEach(b => b.classList.toggle('sp', b.dataset.v === PB.filter));
}
AKT.probeKarte = el => { const c = el.dataset.v; if (PB.sel.has(c)) PB.sel.delete(c); else PB.sel.add(c); PB.filter = ''; probeZaehlen(); };
AKT.probeFilter = el => { const u = cur(), P = u.projects[PB.pid]; PB.filter = el.dataset.v; PB.sel = new Set(probeFilterMenge(u, projektKarten(P).filter(c => cidInfo(c).c), PB.filter)); probeZaehlen(); };
AKT.probeLektion = el => {
  const u = cur(), P = u.projects[PB.pid], k = el.dataset.v;
  const cids = projektKarten(P).filter(c => cidInfo(c).lkey === k && cidInfo(c).c);
  const alle = cids.every(c => PB.sel.has(c));
  cids.forEach(c => { if (alle) PB.sel.delete(c); else PB.sel.add(c); });
  PB.filter = ''; probeZaehlen();
};
AKT.probeModus = el => { PB.modus = el.dataset.v; document.querySelectorAll('#probeModi button').forEach(b => b.classList.toggle('an', b.dataset.v === PB.modus)); };
function probeLos(P, karten) {                                    // Runde einrichten und starten
  const u = cur();
  LS = { pid: P.id, probe: true, bonus: false, queue: shuffle(karten), gesamt: karten.length, fertig: 0, gesehen: {}, combo: 0, um: false, cid: null, antwortet: false, gewaehlt: null, optionen: null, t0: 0,
    sess: { bonus: false, probe: true, antworten: [], xp: 0, perlen: 0, treffer: new Set(), rang: null, abbruch: false }, erg: null };
  void u;
  return lernBereit(karten).then(() => naechsteKarte());
}
AKT.probeStart = () => {
  const u = cur(), P = u.projects[PB.pid]; if (!P) return;
  const karten = Array.from(PB.sel).filter(c => cidInfo(c).c);
  if (!karten.length) { toast('Wähle mindestens eine Karte aus.', 'info'); return; }
  u.set.modus = PB.modus; sichere();
  schliesseBlatt();
  probeLos(P, karten);
};
AKT.probeFehler = () => {                                         // nur das, was nicht saß, noch einmal
  const u = cur(), P = u.projects[LS.pid], e = LS.erg;
  const karten = e.falschListe.concat(e.wackelListe).filter(c => cidInfo(c).c);
  if (P && karten.length) probeLos(P, karten);
};

// Eine Antwort der Generalprobe: nur festhalten, nichts im Lernplan ändern
function verbucheProbe(r) {
  const cid = LS.cid, s = LS.sess;
  LS.gesehen[cid] = (LS.gesehen[cid] || 0) + 1;
  s.antworten.push({ cid, r });
  LS.fertig++;
  TON.spiel(['nochmal', 'schwer', 'gut', 'leicht'][r]);
  if (r >= 2) LS.combo++; else LS.combo = 0;
  if ([3, 5, 8, 12].indexOf(LS.combo) >= 0) {
    const d = document.createElement('div'); d.className = 'rueck gut'; d.textContent = `${LS.combo} richtig in Folge!`; ($('.lern') || document.body).appendChild(d); setTimeout(() => d.remove(), 1500);
    FX.blasen(innerWidth / 2, innerHeight * 0.4, 14);
  }
  LS.weiter = () => { LS.weiter = null; const kb = $('#kb'); if (kb) { kb.classList.remove('ein'); kb.classList.add('raus'); } setTimeout(naechsteKarte, kb ? 240 : 0); };
}
function probeFertig(abbruch) {
  const u = cur(), P = u.projects[LS.pid];
  const erg = probeAuswerten(LS.sess.antworten);
  erg.abbruch = !!abbruch;
  erg.paket = paketVergeben(u, P, erg.n);
  if (erg.n >= PAKET[1].ab) u.stats.proben = (u.stats.proben || 0) + 1;
  erg.abzeichen = pruefeAbzeichen(u);
  LS.erg = erg; sichere();
  TON.spiel(erg.quote >= 0.9 && erg.n ? 'ziel' : 'fertig');
  if (!abbruch) FX.konfetti(erg.quote >= 0.9 ? 100 : 50);
  gehe('probeErg');
  if (erg.paket.stufe) setTimeout(() => TON.spiel('selten'), 900);
}
ANSICHT.probeErg = () => {
  if (!LS || !LS.erg) { setTimeout(() => { if (V.name === 'probeErg') start(); }, 0); return '<div class="ergebnis"></div>'; }
  const u = cur(), P = u.projects[LS.pid], e = LS.erg;
  const sterne = e.n ? (e.quote >= 0.9 ? 3 : e.quote >= 0.7 ? 2 : e.quote >= 0.4 ? 1 : 0) : 0;
  const zeile = (cid, cls) => { const t = karteText(cid), ci = cidInfo(cid); return `<div class="pf ${cls}"><b>${t ? md(t.frage) : 'Bildkarte ' + esc(ci.nrTxt)}</b>${t ? `<span>${ico('pfeilr')} ${md(t.antwort)}</span>` : ''}</div>`; };
  const noch = e.falschListe.length + e.wackelListe.length;
  const pk = e.paket;
  const paketHtml = pk.stufe
    ? `<div class="paketkarte"><div class="pb">${paketSvg(pk.stufe)}</div><div class="t"><b>${esc(PAKET[pk.stufe].name)} verdient!</b><small>${PAKET[pk.stufe].plaetze} ${PAKET[pk.stufe].plaetze === 1 ? 'Platz' : 'Plätze'}: Perlen, Korallenfunken, Freunde oder besondere Gegenstände</small></div><button class="btn gold" data-a="paketStart">Auspacken</button></div>`
    : pk.grund === 'heute' ? `<div class="hinweisbox blau" style="width:100%">Für dieses Projekt gab es heute schon ein Überraschungspaket. Morgen gibt es wieder eins!</div>`
    : `<div class="hinweisbox blau" style="width:100%">Ab ${PAKET[1].ab} abgefragten Karten gibt es ein Überraschungspaket.</div>`;
  const stat = (zahl, text, farbe) => `<div class="stat"><b style="color:${farbe}">${zahl}</b><span>${text}</span></div>`;
  return `<div class="ergebnis sp-${P.sp}"><div class="scroll"><div class="innen"><div class="flo">${flo()}</div><h1>${e.abbruch ? 'Generalprobe beendet' : 'Generalprobe geschafft!'}</h1>
    <div class="sterne3">${[0, 1, 2].map(k => `<span style="--i:${k}">${STERN_SVG(k < sterne ? '#FFC83D' : '#D4E3EC')}</span>`).join('')}</div>
    <p class="mut" style="text-align:center">${e.n} ${e.n === 1 ? 'Karte' : 'Karten'} aus „${esc(P.name)}“ abgefragt${e.n ? ` · ${Math.round(e.quote * 100)} % gleich gewusst` : ''}. Dein Lernplan ist unverändert.</p>
    <div class="statgrid" style="width:100%;max-width:560px">${stat(e.gewusst, 'gewusst', '#1E8764')}${stat(e.wackelig, 'wackelig', '#E08A00')}${stat(e.falsch, 'nicht gewusst', '#D43D43')}</div>
    ${paketHtml}
    ${e.abzeichen.length ? `<h3>Neue Abzeichen</h3><div class="badgezeile">${e.abzeichen.map((b, k) => `<div class="b" style="--i:${k}"><div>${badgeSvg(b, true)}</div>${esc(BADGES[b].name)}</div>`).join('')}</div>` : ''}
    ${noch ? `<div class="pfliste"><h3>Das solltest du dir noch einmal ansehen</h3>${e.falschListe.map(c => zeile(c, 'f')).join('')}${e.wackelListe.map(c => zeile(c, 'w')).join('')}</div>` : (e.n ? '<div class="hinweisbox gruen" style="width:100%">Alles gewusst. So kannst du in den Test gehen!</div>' : '')}
    </div></div>
    <div class="fuss">${noch ? `<button class="btn blau gross" data-a="probeFehler">${ico('tausch')} Nur diese ${noch} nochmal</button>` : ''}<button class="btn weiss gross" data-a="probeNeu" data-v="${P.id}">Neue Generalprobe</button><button class="btn weiss gross" data-a="zumHafen">Zum Hafen</button></div></div>`;
};

// ---------- Überraschungspaket: Bild, Auspacken ----------
const PAKETFARBE = [null, { a: '#4FB5DD', b: '#2D78B0', band: '#FFFFFF' }, { a: '#8E6BE0', b: '#5B3C9A', band: '#E8EEF5' }, { a: '#FFC83D', b: '#D69B00', band: '#E5484D' }, { a: '#3B2F9A', b: '#1B1560', band: '#7DF9FF' }];
function paketSvg(stufe) {
  const c = PAKETFARBE[stufe] || PAKETFARBE[1];
  const muster = stufe === 4 ? [[58, 126, 7], [140, 152, 8], [72, 166, 5], [136, 112, 5], [102, 148, 6]].map(([x, y, r]) => `<path d="${ART.star(x, y, r * 1.5, r * .6, 4)}" fill="#FFF3A8" stroke="none"/>`).join('')
    : stufe === 3 ? [[56, 120], [146, 138], [66, 160], [140, 168]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFF3B0" stroke="none"/>`).join('')
    : stufe === 2 ? '<path d="M44 116l16 -10l16 10M44 146l16 -10l16 10M126 116l16 -10l16 10M126 146l16 -10l16 10" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="5"/>' : '';
  return `<svg class="paketbild s${stufe}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="100" cy="188" rx="66" ry="8" fill="#000" fill-opacity=".16" stroke="none"/>
    <rect x="34" y="94" width="132" height="90" rx="10" fill="${c.a}"/>${muster}
    <rect x="26" y="68" width="148" height="34" rx="9" fill="${c.b}"/>
    <rect x="87" y="68" width="26" height="116" fill="${c.band}"/>
    <path d="M100 66C72 26 38 40 58 64C70 76 92 72 100 66Z" fill="${c.band}"/><path d="M100 66C128 26 162 40 142 64C130 76 108 72 100 66Z" fill="${c.band}"/><circle cx="100" cy="66" r="10" fill="${c.band}"/>
    <path d="M44 106v68" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none"/></g>${stufe >= 3 ? `<path d="${ART.star(170, 52, 12, 4, 4)}" fill="#FFF3A8" stroke="${INK}" stroke-width="2.5"/><path d="${ART.star(28, 40, 9, 3, 4)}" fill="#FFF3A8" stroke="${INK}" stroke-width="2.5"/>` : ''}</svg>`;
}
AKT.paketStart = () => {
  const u = cur(), s = paketHoechste(u);
  if (!s) { toast('Gerade wartet kein Paket auf dich. Pakete gibt es für Generalproben.', 'info', 3600); return; }
  gehe('paket', { phase: 'zu', stufe: s });
};
ANSICHT.paket = () => {
  const p = V.p, pk = PAKET[p.stufe], rest = paketAnzahl(cur());
  const glow = ['', '#7FD9EA', '#B9A0FF', '#FFD25A', '#9FA8FF'][p.stufe];
  return `<div class="muschel paketbuehne" style="--glow:${glow}"><div class="titel" id="pTitel">${esc(pk.name)} – tipp es an!</div>
    <div class="schale wackelt" id="paketbox" data-a="paketAuf"><div class="strahlen"></div>${paketSvg(p.stufe)}</div>
    <div class="paketpreise" id="pPreise"></div>
    <div class="zeile w" style="justify-content:center;min-height:68px" id="pKnoepfe"><button class="btn weiss" data-a="paketZu">Später auspacken</button></div>
    <div class="rest" id="pRest">${rest === 1 ? 'Das ist dein einziges Paket.' : rest + ' Pakete warten auf dich.'}</div></div>`;
};
function paketPreisHtml(x, i) {
  const st = `style="--i:${i}"`;
  if (x.typ === 'perlen') return `<div class="pp perlen" ${st}><div class="b gross">${PERLE}</div><b>+${x.n} Perlen</b></div>`;
  if (x.typ === 'funken') return `<div class="pp funken" ${st}><div class="b gross">${FUNKE}</div><b>+${x.n} Korallenfunken</b><small>Damit stärkst du Freunde im Album.</small></div>`;
  if (x.typ === 'deko') return `<div class="pp deko" ${st}><div class="b">${dekoSvg(x.id)}</div><b>${esc(DEKO[x.id].name)}</b><small>Neues Riff-Stück, es wartet im Lager.</small></div>`;
  const r = x.res;
  if (x.typ === 'myth') {
    const m = MYTH[r.id];
    return `<div class="pp myth" style="--i:${i};--mg:${m.glow}"><div class="b">${mythSvg(r.id)}</div><b>${esc(m.name)}</b><span class="chip klein mythchip">${MYTH_RAR.name}</span>${r.neu ? '<span class="neuband">NEU im Album!</span>' : `<small>Doppelt: +${r.perlen} Perlen, +${r.funken} Funken</small>`}</div>`;
  }
  const f = FIG[r.id], evo = r.stufeNeu > r.stufeAlt;
  return `<div class="pp freund" style="--i:${i};--rc:${RC(r.rar)}"><div class="b">${figSvg(r.id, r.stufeNeu)}</div><b>${esc(f.name)}</b><span class="chip klein" style="background:${RC(r.rar)};color:#fff">${RAR[r.rar].name}</span>${r.neu ? '<span class="neuband">NEU im Album!</span>' : `<small>Doppelt: +${r.perlen} Perlen, +${r.funken} Funken${r.sternNeu ? ' · ' + sterneText(r.sternNeu) : ''}${evo ? ' · entwickelt: ' + esc(figName(r.id, r.stufeNeu)) : ''}</small>`}</div>`;
}
const paketTon = x => (x.typ === 'myth' ? 'legende' : x.typ === 'freund' ? ['perle', 'selten', 'episch', 'legende'][x.res.rar] : x.typ === 'deko' ? 'kauf' : 'perle');
AKT.paketAuf = () => {
  const p = V.p; if (p.phase !== 'zu') return;
  const u = cur(), res = paketOeffnen(u, p.stufe); if (!res) return;
  p.phase = 'offen'; p.res = res;
  const box = $('#paketbox'); box.classList.remove('wackelt'); box.classList.add('offen');
  TON.spiel('muschelAuf'); FX.blasen(innerWidth / 2, innerHeight * 0.4, 22);
  const lebt = () => V.name === 'paket' && V.p === p && $('#pPreise');
  $('#pTitel').textContent = 'Überraschung!';
  setTimeout(() => { if (!lebt()) return; $('#paketbox').style.display = 'none'; $('#pPreise').innerHTML = res.preise.map(paketPreisHtml).join(''); }, 450);
  res.preise.forEach((x, i) => setTimeout(() => {
    if (!lebt()) return;
    TON.spiel(paketTon(x));
    if (x.typ === 'myth') FX.konfetti(220); else if (x.typ === 'freund' && x.res.rar >= 2) FX.konfetti(130); else FX.konfetti(30);
  }, 1000 + i * 900));
  setTimeout(() => {
    if (!lebt()) { (res.abzeichen || []).forEach(b => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200)); return; }
    const rest = paketAnzahl(u);
    $('#pKnoepfe').innerHTML = `${rest ? `<button class="btn gold gross" data-a="paketNoch">Nächstes Paket (${rest})</button>` : ''}<button class="btn ${rest ? 'weiss' : 'gruen gross'}" data-a="paketFertig">${rest ? 'Ins Album' : 'Weiter'}</button>`;
    $('#pRest').style.visibility = 'hidden';
    (res.abzeichen || []).forEach((b, i) => setTimeout(() => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200), 500 + i * 900));
  }, 1000 + res.preise.length * 900 + 500);
};
AKT.paketZu = () => start();
AKT.paketNoch = () => { const s = paketHoechste(cur()); if (s) gehe('paket', { phase: 'zu', stufe: s }); else gehe('album'); };
AKT.paketFertig = () => gehe('album');
