'use strict';
// ---------- Projekte: Assistent zum Anlegen, Details, Abschlussbericht ----------
function wzStandard(typ) {
  const u = cur(), sp = u.set.sp || 'en';
  const ls = lektionenSp(sp);
  const p = { typ: typ || 'termin', sp, lessons: ls.length === 1 ? [ls[0].key] : [], sets: [], end: addTage(heute(), 14), ruhe: [], ziel: 3, name: '', schritt: 0, nameGeaendert: false };
  p.sets = satzListe(p.lessons);
  return p;
}
AKT.projektNeu = () => gehe('projektNeu', wzStandard('termin'));
AKT.dauerNeu = () => gehe('projektNeu', wzStandard('dauer'));
const wzSchritte = p => (p.typ === 'dauer' ? ['typ', 'lektionen', 'name'] : ['typ', 'lektionen', 'zeit', 'ziel', 'name']);
const wzKarten = p => { const P = { lessons: p.lessons, sets: p.sets }; return projektKarten(P); };
function wzStandardName(p) {
  const t = p.lessons.map(k => S.lib.lessons[k] && S.lib.lessons[k].titel).filter(Boolean);
  const l = t.length ? t.join(' + ') : '';
  return p.typ === 'dauer' ? `Festigen ${SPRECHE_NAME[p.sp]}` : (l ? `Klassenarbeit ${l}` : 'Klassenarbeit');
}

ANSICHT.projektNeu = () => {
  const u = cur(), p = V.p, st = wzSchritte(p), art = st[p.schritt];
  const bar = `<div class="schritte">${st.map((_, i) => `<i class="${i < p.schritt ? 'fertig' : i === p.schritt ? 'jetzt' : ''}"></i>`).join('')}</div>`;
  let inhalt = '';
  const beideSp = hatKarten('en') && hatKarten('fr');
  if (art === 'typ') {
    inhalt = `<h2>Was hast du vor?</h2><p class="frage">Ein Projekt ist dein Lernplan. Du kannst später beliebig viele anlegen, getrennt nach Sprachen.</p>
      ${beideSp ? `<div class="opts" style="margin-bottom:16px">${['en', 'fr'].map(s => `<button class="opt sp sp-${s} ${p.sp === s ? 'an' : ''}" data-a="wzSp" data-v="${s}"><span class="spbadge" style="box-shadow:none">${SPRECHE_NAME[s]}</span></button>`).join('')}</div>` : `<div class="chip sp sp-${p.sp}" style="margin-bottom:14px">${SPRECHE_NAME[p.sp]}</div>`}
      <div class="wahl sp-${p.sp}"><button class="wahlkarte ${p.typ === 'termin' ? 'an' : ''}" data-a="wzTyp" data-v="termin"><div class="gross">${ico('kalender')}</div><b>Auf einen Termin hin</b><span>Zum Beispiel vor einer Klassenarbeit. Du wählst Zeitraum und Ziel, ich plane die Tagesportionen und die Wiederholungen vor dem Termin.</span></button>
      <button class="wahlkarte ${p.typ === 'dauer' ? 'an' : ''}" data-a="wzTyp" data-v="dauer"><div class="gross">${ico('tausch')}</div><b>Dauerhaft festigen</b><span>Ohne Ende. Neue Karten kommen langsam dazu, Altes wird in wachsenden Abständen wiederholt (wie bei Anki). Kein Druck: nur ein Wochenziel.</span></button></div>`;
  } else if (art === 'lektionen') {
    const ls = lektionenSp(p.sp);
    const cids = wzKarten(p), neu = cids.filter(c => !u.cards[c]).length;
    const sets = satzListe(p.lessons);
    inhalt = `<h2>Welche Lektionen?</h2><p class="frage">Nur Lektionen, die du in der Bibliothek hast, stehen zur Wahl.</p>
      ${ls.length ? `<div class="lkwahl sp-${p.sp}">${ls.map(L => { const n = Object.keys(L.cards).length, an = p.lessons.indexOf(L.key) >= 0; return `<button class="wahlkarte ${an ? 'an' : ''}" data-a="wzLk" data-v="${L.key}"><b>${esc(L.titel)}</b><span>${n} Karten${L.buch ? ' · ' + esc(L.buch) : ''}</span></button>`; }).join('')}</div>` : '<div class="hinweisbox">Für diese Sprache gibt es noch keine Karten.</div>'}
      ${sets.length ? `<h3 style="margin:18px 0 8px">Welche Kartenarten?</h3><div class="opts sp-${p.sp}">${sets.map(s => `<button class="opt sp ${p.sets.indexOf(s) >= 0 ? 'an' : ''}" data-a="wzSet" data-v="${s}">${esc(satzInfo(s).name)}</button>`).join('')}</div>
      <p class="mut" style="margin-top:12px">${cids.length} Karten gewählt${neu !== cids.length ? ` · davon ${neu} noch neu` : ''}</p>` : ''}`;
  } else if (art === 'zeit') {
    const tage = diffTage(heute(), p.end);
    const wt = [1, 2, 3, 4, 5, 6, 0];
    inhalt = `<h2>Wann ist der Termin?</h2><p class="frage">Der letzte Lerntag ist der Tag vor dem Termin oder der Termin selbst. Du kannst auch ein Datum eintippen.</p>
      <div class="datumzeile" style="margin-bottom:10px">${[7, 14, 21, 28].map(n => `<button class="opt ${tage === n ? 'an' : ''}" data-a="wzTage" data-v="${n}">${n / 7} ${n === 7 ? 'Woche' : 'Wochen'}</button>`).join('')}
      <input type="date" id="datumFeld" value="${esc(p.end)}" min="${addTage(heute(), 1)}" data-bind="end" data-nach="wzDatum"></div>
      <p class="mut" style="margin-bottom:18px">Termin: <b>${datumDe(p.end, true)}</b> · in ${tage} ${tage === 1 ? 'Tag' : 'Tagen'}</p>
      <h3 style="margin-bottom:6px">Ruhetage</h3><p class="frage" style="margin-bottom:10px">An diesen Wochentagen gibt es keine Pflicht. Die Strömung (Serie) reißt dann nicht ab.</p>
      <div class="wtage">${wt.map(w => `<button class="${p.ruhe.indexOf(w) >= 0 ? 'frei' : ''}" data-a="wzRuhe" data-v="${w}">${WT[w]}</button>`).join('')}</div>`;
  } else if (art === 'ziel') {
    const rz = realismus({ dauer: false, end: p.end, ziel: p.ziel, ruhe: p.ruhe }, wzKarten(p).filter(c => !u.cards[c]).length);
    inhalt = `<h2>Wie gründlich soll es sitzen?</h2><p class="frage">Das Ziel entscheidet, wann eine Karte als „geschafft“ zählt. Dein Fortschrittsbalken (die Tauchtiefe) misst genau das.</p>
      <div class="wahl sp-${p.sp}">${ZIELE.filter(z => !z.nurDauer).map(z => `<button class="wahlkarte ${p.ziel === z.b ? 'an' : ''}" data-a="wzZiel" data-v="${z.b}"><b>${z.name}</b><span>${z.txt}</span></button>`).join('')}</div>
      ${rz ? `<div class="hinweisbox ${rz.stufe === 'ok' ? 'gruen' : rz.stufe === 'eng' ? 'rot' : ''}" style="margin-top:16px">${esc(rz.txt)}</div>` : ''}`;
  } else {
    const cids = wzKarten(p);
    const nm = p.nameGeaendert ? p.name : wzStandardName(p);
    inhalt = `<h2>Wie soll dein Projekt heißen?</h2><p class="frage">Ein Name, den du auf dem Hafen wiedererkennst.</p>
      <input type="text" id="projektName" maxlength="28" value="${esc(nm)}" data-bind="name" data-nach="wzName" autocomplete="off" spellcheck="false">
      <div class="panel" style="margin-top:18px;background:#fff"><div class="zeile w"><span class="chip sp sp-${p.sp}">${SPRECHE_NAME[p.sp]}</span><span class="chip">${cids.length} Karten</span>${p.typ === 'dauer' ? '<span class="chip">Dauerprojekt</span><span class="chip">Ziel: Langzeit</span>' : `<span class="chip">${ico('kalender')} bis ${datumDe(p.end)}</span><span class="chip">Ziel: ${ziel_(p.ziel).name}</span>`}</div>
      <p class="mut" style="margin-top:10px">${p.lessons.map(k => esc(S.lib.lessons[k].titel)).join(', ')}</p></div>`;
  }
  const letzte = p.schritt === st.length - 1;
  const gueltig = art === 'lektionen' ? (p.lessons.length > 0 && p.sets.length > 0 && wzKarten(p).length > 0) : art === 'zeit' ? diffTage(heute(), p.end) >= 1 : true;
  return mitNav(`<div class="wiz sp-${p.sp}"><div class="kopf"><button class="btn weiss klein" data-a="wzAbbruch">${ico('zu')} Abbrechen</button><h1 style="font-size:28px;text-align:right">Neues Projekt</h1></div>${bar}<div class="panel">${inhalt}
    <div class="unten">${p.schritt ? '<button class="btn weiss" data-a="wzZurueck">Zurück</button>' : ''}<span class="sp1"></span><button class="btn ${letzte ? 'gruen gross' : 'blau'}" data-a="${letzte ? 'wzFertig' : 'wzWeiter'}" ${gueltig ? '' : 'disabled'}>${letzte ? 'Projekt starten' : 'Weiter'}</button></div></div></div>`);
};
AKT.wzAbbruch = () => gehe('start');
AKT.wzSp = el => { const n = wzStandard(V.p.typ); n.sp = el.dataset.v; const ls = lektionenSp(n.sp); n.lessons = ls.length === 1 ? [ls[0].key] : []; n.sets = satzListe(n.lessons); V.p = n; render(); };
AKT.wzTyp = el => { V.p.typ = el.dataset.v; V.p.schritt = 0; render(); };
AKT.wzLk = el => { const k = el.dataset.v, l = V.p.lessons, i = l.indexOf(k); if (i >= 0) l.splice(i, 1); else l.push(k); V.p.sets = satzListe(l); render(); };
AKT.wzSet = el => { const s = el.dataset.v, a = V.p.sets, i = a.indexOf(s); if (i >= 0) a.splice(i, 1); else a.push(s); render(); };
AKT.wzTage = el => { V.p.end = addTage(heute(), +el.dataset.v); render(); };
AKT.wzDatum = () => { const t = V.p.end; if (t && /^\d{4}-\d{2}-\d{2}$/.test(t)) { const n = $('.wiz .mut b'); if (n) n.textContent = datumDe(t, true); } };
AKT.wzRuhe = el => { const w = +el.dataset.v, a = V.p.ruhe, i = a.indexOf(w); if (i >= 0) a.splice(i, 1); else a.push(w); render(); };
AKT.wzZiel = el => { V.p.ziel = +el.dataset.v; render(); };
AKT.wzName = () => { V.p.nameGeaendert = true; };
AKT.wzWeiter = () => { V.p.schritt++; render(true); };
AKT.wzZurueck = () => { V.p.schritt = Math.max(0, V.p.schritt - 1); render(true); };
AKT.wzFertig = () => {
  const p = V.p, u = cur();
  const name = (p.nameGeaendert ? p.name : wzStandardName(p)).trim() || wzStandardName(p);
  const P = neuesProjekt(u, { name, sp: p.sp, lessons: p.lessons, sets: p.sets, end: p.end, ziel: p.ziel, ruhe: p.ruhe, dauer: p.typ === 'dauer' });
  pruefeAbzeichen(u); sichere();
  TON.spiel('fertig'); FX.konfetti(70);
  u.set.sp = p.sp;
  gehe('start');
  toast(`Projekt „${P.name}“ ist startklar!`, 'haken');
};

// ---------- Details ----------
AKT.projektDetail = el => projektDetail(el.dataset.v);
function projektDetail(pid) {
  const u = cur(), P = u.projects[pid]; if (!P) return;
  const cids = projektKarten(P), st = stand(u, P), rv = reifeVerteilung(u, cids);
  const n = Math.max(1, cids.length);
  const farben = { neu: '#C7DDE9', lernt: '#FF9A2B', jung: '#4FB5DD', reif: '#1E8764' };
  const vh = vorhersage(u, cids, 7), vmax = Math.max(1, ...vh);
  const bq = behaltensquote(u, 30);
  const pl = heutePlan(u, P);
  const lektLeft = lektionenSp(P.sp).filter(L => P.lessons.indexOf(L.key) < 0);
  zeigeBlatt(`<div class="sp-${P.sp}"><div class="zeile w" style="margin-bottom:6px;padding-right:56px"><span class="spbadge">${SPRECHE_NAME[P.sp].toUpperCase()}</span><h2>${esc(P.name)}</h2>${countdownChip(P)}</div>
    <p class="mut" style="margin-bottom:14px">${P.lessons.map(k => esc(S.lib.lessons[k] ? S.lib.lessons[k].titel : k)).join(', ')} · ${cids.length} Karten · Ziel „${ziel_(P.ziel).name}“</p>
    <div class="panel dicht" style="background:#fff"><b class="fred">Wie weit sitzen die Karten?</b>
      <div class="stapel" style="margin-top:8px">${['neu', 'lernt', 'jung', 'reif'].map(k => `<i style="flex:${rv[k]};background:${farben[k]}"></i>`).join('')}</div>
      <div class="legende">${[['neu', 'Neu'], ['lernt', 'Lernphase'], ['jung', 'Jung (unter 3 Wochen)'], ['reif', 'Reif (ab 3 Wochen)']].map(([k, t]) => `<span><i style="background:${farben[k]}"></i>${t}: <b>${rv[k]}</b></span>`).join('')}</div></div>
    <div class="abstand"></div>
    <div class="panel dicht" style="background:#fff"><b class="fred">Gezeitenvorhersage</b> <span class="mut" style="font-size:14px">– fällige Karten in den nächsten Tagen</span>
      <div class="vorher">${vh.map((x, i) => `<div><span>${x}</span><i style="height:${Math.max(4, x / vmax * 76)}px"></i><small>${i === 0 ? 'heute' : WT[wochentag(addTage(heute(), i))]}</small></div>`).join('')}</div></div>
    <div class="abstand"></div>
    <div class="statgrid"><div class="stat"><b>${Math.round(st.pct * 100)} %</b><span>Ziel erreicht (${st.ok}/${st.n})</span></div>
      <div class="stat"><b>${bq == null ? '–' : Math.round(bq * 100) + ' %'}</b><span>Behaltensquote (30 Tage)</span></div>
      <div class="stat"><b>${P.serie.best}</b><span>${P.dauer ? 'Wochenziele' : 'längste Strömung'}</span></div>
      <div class="stat"><b>${pl.ziel ? planGeschafft(pl) + '/' + pl.ziel : '–'}</b><span>Tagesziel heute</span></div></div>
    <div class="abstand"></div>
    <div class="zeile w"><button class="btn gold klein" data-a="probeNeu" data-v="${P.id}">${ico('stern')} Generalprobe</button>${lektLeft.length ? `<button class="btn blau klein" data-a="projektLektion" data-v="${P.id}">${ico('plus')} Lektion hinzufügen</button>` : ''}
      ${P.dauer ? '' : `<button class="btn weiss klein" data-a="projektTermin" data-v="${P.id}">${ico('kalender')} Termin ändern</button>`}
      <span class="sp1"></span><button class="btn rot klein" data-a="projektWeg" data-v="${P.id}">${ico('muelleimer')} Projekt beenden</button></div></div>`, { breit: 820 });
}
AKT.projektLektion = el => {
  const u = cur(), P = u.projects[el.dataset.v];
  const rest = lektionenSp(P.sp).filter(L => P.lessons.indexOf(L.key) < 0);
  zeigeBlatt(`<div class="sp-${P.sp}"><h2>Lektion hinzufügen</h2><p class="mut" style="margin:6px 0 14px">Die neuen Karten kommen nach und nach dazu, nicht alle auf einmal.</p>
    <div class="lkwahl">${rest.map(L => `<button class="wahlkarte" data-a="projektLektionJa" data-v="${P.id}" data-v2="${L.key}"><b>${esc(L.titel)}</b><span>${Object.keys(L.cards).length} Karten</span></button>`).join('')}</div></div>`);
};
AKT.projektLektionJa = el => {
  const u = cur(), P = u.projects[el.dataset.v];
  P.lessons.push(el.dataset.v2); satzListe([el.dataset.v2]).forEach(s => { if (P.sets.indexOf(s) < 0) P.sets.push(s); });
  P.heute = null; sichere(); schliesseBlatt(); toast('Lektion hinzugefügt.', 'haken'); render();
};
AKT.projektTermin = el => {
  const u = cur(), P = u.projects[el.dataset.v];
  zeigeBlatt(`<h2>Neuer Termin</h2><p class="mut" style="margin:6px 0 14px">Aktuell: ${datumDe(P.end, true)}</p>
    <div class="datumzeile">${[7, 14, 21].map(n => `<button class="btn weiss klein" data-a="projektTerminJa" data-v="${P.id}" data-v2="${n}">+${n / 7} ${n === 7 ? 'Woche' : 'Wochen'}</button>`).join('')}</div>`);
};
AKT.projektTerminJa = el => {
  const u = cur(), P = u.projects[el.dataset.v];
  P.end = addTage(P.end > heute() ? P.end : heute(), +el.dataset.v2); P.status = 'aktiv'; P.heute = null; sichere();
  schliesseBlatt(); toast('Termin verschoben.', 'kalender'); render();
};
AKT.projektWeg = el => {
  const P = cur().projects[el.dataset.v];
  zeigeBlatt(`<h2>„${esc(P.name)}“ beenden?</h2><p class="mut" style="margin:10px 0 18px">Dein Lernstand der Karten bleibt erhalten, ebenso alle Belohnungen. Nur der Plan wird gelöscht.</p>
    <div class="zeile"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn rot" data-a="projektWegJa" data-v="${P.id}">Beenden</button></div>`);
};
AKT.projektWegJa = el => { delete cur().projects[el.dataset.v]; sichere(); schliesseBlatt(); toast('Projekt beendet.', 'haken'); render(true); };

// ---------- Abschlussbericht ----------
function projektBericht(P) {
  const e = P.ergebnis, u = cur();
  const stufe = e.pct >= 1 ? 3 : e.pct >= 0.8 ? 2 : e.pct >= 0.5 ? 1 : 0;
  const text = ['Du hast viel gelernt – und alles bleibt dir erhalten.', 'Gut gemacht! Die Hälfte und mehr sitzt.', 'Starke Leistung! Fast alles sitzt.', 'Alles gemeistert! Perfekter Tauchgang!'][stufe];
  zeigeBlatt(`<div style="text-align:center" class="sp-${P.sp}"><div style="width:130px;margin:0 auto">${flo()}</div><h2 style="margin:6px 0">Abschlussbericht: ${esc(P.name)}</h2>
    <div class="sterne3" style="justify-content:center;margin:10px 0">${[0, 1, 2].map(i => `<span style="--i:${i}">${STERN_SVG(i < stufe ? '#FFC83D' : '#D4E3EC')}</span>`).join('')}</div>
    <p style="font:600 20px Fredoka;color:var(--navy)">${text}</p>
    <div class="statgrid" style="margin:16px 0"><div class="stat"><b>${Math.round(e.pct * 100)} %</b><span>Karten am Ziel (${e.ok}/${e.n})</span></div><div class="stat"><b>${e.serieBest}</b><span>längste Strömung (Tage)</span></div>
    <div class="stat"><b>+${e.perlen}</b><span>Perlen</span></div>${e.schatz ? `<div class="stat"><b>+${e.schatz}</b><span>Schatzmuschel${e.schatz > 1 ? 'n' : ''}</span></div>` : ''}</div>
    <p class="mut" style="margin-bottom:14px">Lust, die Karten dauerhaft zu festigen? Das Dauerprojekt hält sie mit wachsenden Abständen frisch.</p>
    <div class="zeile w" style="justify-content:center"><button class="btn gruen" data-a="berichtOk" data-v="${P.id}">Schön, weiter</button>${hatKarten(P.sp) && !projekte(u, P.sp).some(p => p.dauer && p.status === 'aktiv') ? `<button class="btn blau" data-a="berichtDauer" data-v="${P.id}">Dauerprojekt anlegen</button>` : ''}</div></div>`, { ohneZu: true, onZu: () => { P.ergebnis.gesehen = true; sichere(); } });
  TON.spiel('ziel'); FX.konfetti(90);
}
AKT.projektBericht = el => projektBericht(cur().projects[el.dataset.v]);
AKT.berichtOk = el => { cur().projects[el.dataset.v].ergebnis.gesehen = true; sichere(); schliesseBlatt(); render(); };
AKT.berichtDauer = el => { const P = cur().projects[el.dataset.v]; P.ergebnis.gesehen = true; sichere(); schliesseBlatt(); const w = wzStandard('dauer'); w.sp = P.sp; w.lessons = P.lessons.slice(); w.sets = satzListe(w.lessons); w.schritt = 2; gehe('projektNeu', w); };
AKT.projektVerlaengern = el => {
  const P = cur().projects[el.dataset.v];
  zeigeBlatt(`<h2>Verlängern</h2><p class="mut" style="margin:6px 0 14px">Das Projekt läuft mit neuem Termin weiter.</p><div class="datumzeile">${[7, 14, 21].map(n => `<button class="btn weiss klein" data-a="projektTerminJa" data-v="${P.id}" data-v2="${n}">+${n / 7} ${n === 7 ? 'Woche' : 'Wochen'}</button>`).join('')}</div>`);
};
function berichteZeigen() {
  const u = cur(); if (!u) return;
  const P = projekte(u).find(p => p.status === 'fertig' && p.ergebnis && !p.ergebnis.gesehen);
  if (P) projektBericht(P);
}
