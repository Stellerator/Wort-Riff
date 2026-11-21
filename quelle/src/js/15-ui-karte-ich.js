'use strict';
// ---------- Tauchfahrt-Karte, Profil „Ich“, Einstellungen ----------
const ZONENFARBE = ['#2FB3C9', '#1B8FD0', '#27458F', '#1A2A5E'];     // eine Farbe je Tiefenzone (siehe RAR in 06-katalog)
// Tiefenmesser: vier Zonen, die Figur zeigt die tiefste erreichte Tiefe. Er erklärt auch, warum seltene Wesen erst später auftauchen.
function tiefenmesser(u) {
  const t = tiefeJetzt(u), zi = zoneVonTiefe(t), lo = RAR[zi].tiefe, hi = RAR[zi + 1] ? RAR[zi + 1].tiefe : lo * 2;
  const pos = clamp((zi + clamp((t - lo) / (hi - lo), 0, 1)) / RAR.length * 100, 2, 98);
  const nxt = RAR[zi + 1];
  return `<div class="panel tiefenmesser"><div class="zeile w" style="margin-bottom:10px"><b class="fred" style="font-size:20px">Du bist <span style="color:var(--ocean)">${nf(t)} m</span> tief getaucht</b><span class="chip klein dunkel">${esc(RAR[zi].zone)}</span><span class="sp1"></span>
    <span class="mut" style="font-size:14px">${nxt ? `Noch ${nf(nxt.tiefe - t)} m bis ${esc(nxt.zone)}: dort leben die ${esc(nxt.serie)}.` : 'Tiefer geht es nicht: Hier leben die Legenden.'}</span></div>
    <div class="tm"><div class="tm-leiste">${RAR.map((r, k) => `<div class="tm-zone ${k <= zi ? 'da' : ''}" style="--c:${ZONENFARBE[k]}"><b>${esc(r.zone)}</b><small>ab ${r.tiefe} m</small></div>`).join('')}</div><div class="tm-marke" style="left:${pos}%">${TAUCHER}</div></div>
    <p class="mut" style="font-size:13px;margin-top:8px">Jede Karte, die sitzt, bringt dich tiefer: 1 m für „sicher“, je 1 m mehr für „prüfungsfit“ und „Langzeit“. Je tiefer du bist, desto seltener die Wesen in den Muscheln. Du verlierst nie Tiefe.</p></div>`;
}

ANSICHT.karte = () => {
  const u = cur(), sp = u.set.sp || 'en';
  const ls = lektionenSp(sp);
  const tabs = ['en', 'fr'].map(s => `<button class="${s === sp ? 'an' : ''}" data-a="sprache" data-v="${s}"><span class="pkt" style="background:${SPRACHE[s].farbe}"></span>${SPRECHE_NAME[s]}</button>`).join('');
  const aktiv = projekte(u, sp).filter(istAktiv);
  const stationen = ls.map((L, i) => {
    const cids = Object.keys(L.cards), s = standKarten(u, cids, 3), lern = standKarten(u, cids, 2);
    const sterne = s.pct >= 0.95 ? 3 : s.pct >= 0.67 ? 2 : s.pct >= 0.34 ? 1 : 0;
    const ps = aktiv.filter(p => p.lessons.indexOf(L.key) >= 0);
    return `<div class="station ${i % 2 ? 're' : ''} sp-${sp}"><button class="knoten" data-a="stationDetail" data-v="${L.key}">${ring(s.pct, 112, sp === 'en' ? '#E9683A' : '#6A4FC8', `<span class="nr">${esc(String(L.nr))}</span>`, 9)}</button>
      <div class="karte"><b>${esc(L.titel)}</b><small>${s.ok} von ${s.n} Karten sicher · ${lern.ok} gelernt</small><div class="sterne">${'★'.repeat(sterne)}${'<span style="color:#C7D7E2">★</span>'.repeat(3 - sterne)}</div>
      ${ps.length ? ps.map(p => `<div class="chip klein sp" style="margin-top:6px">${ico('kalender')} ${esc(p.name)}${p.end ? ' · noch ' + diffTage(heute(), p.end) + ' T.' : ''}</div>`).join('') : ''}</div></div>`;
  }).join('');
  const zuletzt = ls.length ? `<div class="station ${ls.length % 2 ? 're' : ''} zu"><div class="knoten"><div class="ring" style="width:112px;height:112px"><span class="nr">?</span></div></div><div class="karte" style="border-style:dashed"><b>Unerforschtes Gewässer</b><small>Hier warten neue Lektionen. Sobald du neue Karten hineinziehst, wächst dein Weg nach unten.</small></div></div>` : '';
  return mitNav(`<div class="sp-${sp}">${kopfLeiste()}<div class="kopf"><h1>Tauchfahrt</h1><div class="tabs">${tabs}</div></div>
    ${tiefenmesser(u)}
    ${ls.length ? `<div class="tiefenzaehler"><span class="chip">${ls.length} ${ls.length === 1 ? 'Station' : 'Stationen'} auf deiner Tauchfahrt</span></div>
    <div class="weg"><div class="pfad"></div><div class="zone" style="background:linear-gradient(90deg,#9CE5E8,#2FB3C9);color:var(--navy)">Wasseroberfläche · 0 m</div>${stationen}${zuletzt}</div>` : `<div class="panel leer"><h2>Noch keine Stationen</h2><p class="mut" style="margin:8px 0 16px">Jede Lektion wird eine Station auf deiner Tauchfahrt. Hol dir zuerst Karten.</p><button class="btn gross" data-a="nav" data-v="bibliothek">${ico('buch')} Karten holen</button></div>`}</div>`);
};
AKT.stationDetail = el => {
  const u = cur(), L = S.lib.lessons[el.dataset.v]; if (!L) return;
  const sets = {};
  Object.keys(L.cards).forEach(cid => { const s = L.cards[cid].satz; (sets[s] = sets[s] || []).push(cid); });
  const zeilen = SATZ_REIHE.concat(Object.keys(sets).filter(s => SATZ_REIHE.indexOf(s) < 0)).filter(s => sets[s]).map(s => {
    const st = standKarten(u, sets[s], 3), lern = standKarten(u, sets[s], 2);
    return `<div style="margin:10px 0"><div class="zeile"><b class="fred">${esc(satzInfo(s).name)}</b><span class="sp1"></span><span class="mut">${st.ok}/${st.n} sicher · ${lern.ok} gelernt</span></div><div class="leiste sp" style="margin-top:4px"><b style="width:${st.pct * 100}%"></b></div></div>`;
  }).join('');
  zeigeBlatt(`<div class="sp-${L.sp}"><div class="zeile w" style="padding-right:56px"><span class="spbadge">${SPRECHE_NAME[L.sp].toUpperCase()}</span><h2>${esc(L.titel)}</h2></div><p class="mut" style="margin:4px 0 8px">${L.buch ? esc(L.buch) + ' · ' : ''}${Object.keys(L.cards).length} Karten${L.hasText ? ' · mit Text (Vorlesen und Quiz)' : ' · nur Bilder'}</p>${zeilen}
    <div class="zeile" style="margin-top:16px"><button class="btn blau" data-a="projektFuerLektion" data-v="${L.key}">${ico('plus')} Projekt für diese Lektion</button></div></div>`);
};
AKT.projektFuerLektion = el => {
  const L = S.lib.lessons[el.dataset.v];
  const w = wzStandard('termin'); w.sp = L.sp; w.lessons = [L.key]; w.sets = satzListe(w.lessons); w.schritt = 1;
  schliesseBlatt(); gehe('projektNeu', w);
};

// ---------- Ich ----------
ANSICHT.ich = () => {
  const u = cur(), r = rangVon(u.xp), s = u.stats;
  const bq = behaltensquote(u, 30);
  const karten = Object.values(u.cards);
  const gelernt = karten.filter(c => c.b >= 2).length, sicher = karten.filter(c => c.b >= 3).length, lang = karten.filter(c => lang_(c)).length;
  const bd = Object.keys(BADGES);
  const raus = bd.filter(b => u.badges[b]).length;
  const opt = (k, v, t) => `<button class="opt ${String(u.set[k] || '') === v ? 'an' : ''}" data-a="einst" data-k="${k}" data-v="${v}">${t}</button>`;
  return mitNav(`<div>${kopfLeiste()}<div class="kopf"><h1>Ich</h1></div>
    <div class="panel"><div class="ichkopf"><button class="avatar gross" data-a="avatarWahl" style="border:0;padding:0" aria-label="Profilbild ändern">${figSvg(u.avatar)}</button><div class="daten"><h2>${esc(u.name)}</h2><div class="zeile w" style="margin:4px 0 8px"><span class="chip gold">${esc(r.name)}</span><span class="chip">${nf(u.xp)} XP</span><span class="chip">${PERLE} ${nf(u.perlen)} Perlen</span></div>
      <div class="leiste gold"><b style="width:${Math.round(r.pct * 100)}%"></b></div><p class="mut" style="font-size:14px;margin-top:4px">${nf(Math.max(0, r.bis - u.xp))} XP bis „${esc(r.naechster)}“</p></div></div></div>
    <div class="sektion">Statistik</div><div class="statgrid"><div class="stat"><b>${nf(s.antworten)}</b><span>Antworten</span></div><div class="stat"><b>${s.antworten ? Math.round(s.richtig / s.antworten * 100) + ' %' : '–'}</b><span>richtig (Gut/Leicht)</span></div>
      <div class="stat"><b>${bq == null ? '–' : Math.round(bq * 100) + ' %'}</b><span>Behaltensquote, 30 Tage</span></div><div class="stat"><b>${s.runden}</b><span>Lernrunden</span></div><div class="stat"><b>${s.tagesziele}</b><span>Tagesziele</span></div>
      <div class="stat"><b>${gelernt}</b><span>Karten gelernt</span></div><div class="stat"><b>${sicher}</b><span>Karten sicher</span></div><div class="stat"><b>${lang}</b><span>Langzeit (ab 3 Wochen)</span></div></div>
    <div class="sektion">Abzeichen <small>${raus} von ${bd.length}</small></div><div class="badgeraster">${bd.map(b => `<div class="badgekachel ${u.badges[b] ? '' : 'zu'}"><div class="b">${badgeSvg(b, !!u.badges[b])}</div>${esc(BADGES[b].name)}<small>${esc(BADGES[b].text)}</small></div>`).join('')}</div>
    <div class="sektion">Einstellungen</div><div class="panel">
      <div class="einst"><div class="t"><b>Ton</b><span>Klänge bei Antworten und Belohnungen</span></div><button class="schalter ${u.set.ton !== false ? 'an' : ''}" data-a="ton" aria-label="Ton"></button></div>
      <div class="einst"><div class="t"><b>Überraschungen im Riff</b><span>Ganz selten gibt es ein kleines Geschicklichkeitsspiel mit Bonus</span></div><button class="schalter ${u.set.ereignisse !== false ? 'an' : ''}" data-a="ereignisSchalter" aria-label="Überraschungen im Riff"></button></div>
      <div class="einst"><div class="t"><b>Vorlesen</b><span>${SPRECHEN.ok ? 'Das iPad spricht das Wort. Funktioniert bei Lektionen mit Text.' : 'Auf diesem Gerät nicht verfügbar.'}</span></div><div class="opts">${opt('sprechen', 'auto', 'Automatisch')}${opt('sprechen', 'knopf', 'Mit Knopf')}${opt('sprechen', 'aus', 'Aus')}</div></div>
      <div class="einst"><div class="t"><b>Lernmodus</b><span>Quiz und Tippen gibt es nur bei Lektionen mit Text</span></div><div class="opts">${opt('modus', 'karten', 'Karten umdrehen')}${opt('modus', 'quiz', 'Quiz')}${opt('modus', 'tippen', 'Tippen')}</div></div>
      <div class="einst"><div class="t"><b>Tempo pro Tag</b><span>Höchstzahl an Karten, die ein Tagesziel verlangt</span></div><div class="opts">${Object.keys(TEMPO).map(k => opt('tempo', k, `${TEMPO[k].name} (${TEMPO[k].max})`)).join('')}</div></div>
      <div class="einst"><div class="t"><b>Rundenlänge</b><span>Karten pro Tauchgang</span></div><div class="opts">${[8, 10, 15].map(n => opt('runde', String(n), String(n))).join('')}</div></div></div>
    <div class="sektion">Daten</div><div class="panel"><div class="zeile w"><button class="btn blau klein" data-a="sichern">${ico('speichern')} Fortschritt sichern</button><button class="btn blau klein" data-a="sicherungWahl">${ico('laden')} Sicherung laden</button><button class="btn weiss klein" data-a="sicherungKopieren">Als Text kopieren</button><button class="btn weiss klein" data-a="sicherungText">Aus Text laden</button><button class="btn weiss klein" data-a="chancen">Muschel-Chancen</button></div>
      <p class="mut" style="margin-top:10px;font-size:14px" id="speicherInfo">${DB.ok ? 'Speicher: dauerhaft im Browser dieses Geräts.' : 'Achtung: Dauerhafter Speicher ist nicht verfügbar. Fortschritt geht beim Schließen verloren. Bitte sichere ihn regelmäßig als Datei.'}</p>
      <p class="mut" style="font-size:14px"><b>${S.sicherung ? 'Letzte Sicherung: ' + datumDe(S.sicherung, true) : 'Noch keine Sicherung erstellt.'}</b> Die Sicherung enthält Lernstand, Belohnungen, Riff und Projekte. Die Karten-Bilder holt die App aus dem Repo, sonst per ZIP unter „Karten“.</p><input type="file" id="fSicherung" accept=".json,application/json" hidden></div>
    ${appPanelHtml()}
    <div class="sektion">Konto</div><div class="panel"><div class="zeile w"><button class="btn weiss klein" data-a="nutzerWechsel">${ico('tausch')} Nutzer wechseln</button><button class="btn rot klein" data-a="nutzerLoeschen">${ico('muelleimer')} Nutzer löschen</button></div></div>
    <p class="mut" style="text-align:center;margin-top:18px;font-size:13px">Wortriff ${APP_VERSION} · gebaut ${APP_BUILD}</p></div>`);
};
function ichNach() {
  appPanelNach();
  if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(e => { const el = $('#speicherInfo'); if (el && e.usage != null) el.textContent += ` Belegt: ${Math.round(e.usage / 1048576)} MB.`; }).catch(() => {});
}
const _ichAnsicht = ANSICHT.ich;
ANSICHT.ich = () => { const h = _ichAnsicht(); V.nach = ichNach; return h; };
AKT.einst = el => {
  const u = cur(), k = el.dataset.k, v = el.dataset.v;
  u.set[k] = (k === 'runde') ? +v : v; sichere(); render();
};
AKT.ton = () => { const u = cur(); u.set.ton = u.set.ton === false; sichere(); render(); };
AKT.sichern = async () => {
  const r = await sicherungTeilen();
  if (r === 'geteilt') toast('Sicherung gespeichert.', 'haken', 3500);
  else if (r === 'heruntergeladen') toast('Sicherung wird gespeichert (Ordner „Downloads“ bzw. „Dateien“).', 'speichern', 4000);
  if (V.name === 'ich') render();
};
AKT.sicherungWahl = () => $('#fSicherung').click();
AKT.nutzerWechsel = () => { sichereJetzt(); gehe('profile'); };
AKT.nutzerLoeschen = () => {
  const u = cur();
  zeigeBlatt(`<h2>${esc(u.name)} wirklich löschen?</h2><p class="mut" style="margin:10px 0 18px">Lernstand, Projekte, Album und Riff dieses Nutzers werden unwiderruflich gelöscht. Die Karten in der Bibliothek bleiben. Tipp: Sichere vorher den Fortschritt.</p>
    <div class="zeile"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn rot" data-a="nutzerLoeschenJa">Löschen</button></div>`);
};
AKT.nutzerLoeschenJa = () => { delete S.users[S.cur]; S.cur = null; sichereJetzt(); schliesseBlatt(); gehe('profile'); };
AKT.avatarWahl = () => {
  const u = cur(), ids = figIds().filter(i => u.owned[i]);
  zeigeBlatt(`<h2>Profilbild wählen</h2><p class="mut" style="margin:4px 0 12px">Alle Figuren aus deinem Album stehen zur Wahl.</p><div class="avawahl" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">${ids.map(i => `<button class="${u.avatar === i ? 'an' : ''}" data-a="figAvatar" data-v="${i}" aria-label="${esc(FIG[i].name)}">${figSvg(i)}</button>`).join('')}</div>`);
};
