'use strict';
// ---------- Profile & Hafen (Startseite) ----------
document.addEventListener('input', ev => {                        // Eingabefelder mit data-bind füllen V.p
  const el = ev.target;
  if (el.dataset && el.dataset.bind) { V.p[el.dataset.bind] = el.value; if (el.dataset.nach && AKT[el.dataset.nach]) AKT[el.dataset.nach](el, ev); }
});

ANSICHT.profile = () => {
  const us = Object.values(S.users);
  return `<div class="profil-wahl"><div style="width:180px">${flo()}</div><h1>Wortriff</h1><div class="unter">${us.length ? 'Wer taucht heute?' : 'Willkommen im Meer der Wörter!'}</div>
    <div class="pgrid">${us.map(u => `<button class="ptile" data-a="waehleNutzer" data-v="${u.id}"><div class="avatar">${figSvg(u.avatar, stufeVon(u, u.avatar))}</div>${esc(u.name)}</button>`).join('')}
    <button class="ptile neu" data-a="neuNutzerSeite"><div class="plus">+</div>Neu</button></div>
    <div style="width:min(640px,100%);margin-top:18px">${installHinweisHtml()}${umzugHtml(us.length > 0)}</div></div>`;
};
AKT.waehleNutzer = el => { S.cur = el.dataset.v; sichere(); start(); };
AKT.neuNutzerSeite = () => gehe('neuNutzer', { name: '', avatar: pick(STARTER) });
ANSICHT.neuNutzer = () => {
  const p = V.p;
  return `<div class="profil-wahl"><h1 style="font-size:40px">Wie heißt du?</h1>
    <div class="panel" style="width:min(640px,100%);display:flex;flex-direction:column;gap:18px">
      <input type="text" id="nameFeld" maxlength="18" placeholder="Dein Name" value="${esc(p.name)}" data-bind="name" autocomplete="off" autocapitalize="words" spellcheck="false">
      <div><h3 style="margin-bottom:10px">Such dir deinen Tauchbegleiter aus</h3><div class="avawahl">${STARTER.map(id => `<button class="${p.avatar === id ? 'an' : ''}" data-a="waehleAvatar" data-v="${id}" aria-label="${esc(FIG[id].name)}">${figSvg(id, 1)}</button>`).join('')}</div>
      <p class="mut" style="margin-top:8px;text-align:center">${esc(FIG[p.avatar].name)} – ${esc(FIG[p.avatar].text)}</p></div>
      <div class="zeile"><button class="btn weiss" data-a="${Object.keys(S.users).length ? 'zuProfilen' : 'nix'}" ${Object.keys(S.users).length ? '' : 'style="visibility:hidden"'}>Zurück</button><span class="sp1"></span><button class="btn gruen gross" data-a="nutzerAnlegen">Los geht’s!</button></div>
    </div>
    <div style="width:min(640px,100%);margin-top:6px">${installHinweisHtml()}${Object.keys(S.users).length ? '' : umzugHtml(false)}</div></div>`;
};
AKT.waehleAvatar = el => { V.p.avatar = el.dataset.v; const n = $('#nameFeld'); const wert = n ? n.value : V.p.name; V.p.name = wert; render(); const n2 = $('#nameFeld'); if (n2) n2.value = wert; };
AKT.zuProfilen = () => gehe('profile');
AKT.nutzerAnlegen = () => {
  const name = (V.p.name || '').trim();
  if (!name) { toast('Wie heißt du? Bitte tippe deinen Namen ein.', 'info'); const n = $('#nameFeld'); if (n) n.focus(); return; }
  neuerNutzer(name, V.p.avatar);
  TON.spiel('fertig'); FX.konfetti(60);
  start(true);
};

function start(neu) {
  const u = cur();
  if (!u) return gehe('profile');
  const fertig = projekteAbschliessen(u);
  gehe('start', { neu: !!neu, fertig });
  berichteZeigen();
}

// ---------- Hafen ----------
function floText(u, sp) {
  const ps = projekte(u, sp).filter(istAktiv);
  const name = esc(u.name);
  if (V.p.neu) return [`Hallo ${name}! Ich bin Flo und tauche mit dir durch die Wörter.`, 'Du hast schon eine Muschel – tipp oben auf die Muschel und schau, wer drin steckt!'];
  if (!hatKarten('en') && !hatKarten('fr')) return [`Hallo ${name}! Zuerst brauche ich Karten.`, 'Tipp auf „Karten“ und zieh deine Kartenordner hinein.'];
  if (!hatKarten(sp)) return [`Für ${SPRECHE_NAME[sp]} habe ich noch keine Karten.`, 'Du kannst sie unter „Karten“ hinzufügen.'];
  if (!ps.length) return ['Lege ein Projekt an, zum Beispiel für deine nächste Klassenarbeit.', 'Du bestimmst, wie lange und wie gründlich.'];
  const heutige = ps.map(p => ({ p, pl: heutePlan(u, p) }));
  const offen = heutige.filter(x => x.pl.ziel > 0 && !x.pl.fertig);
  const naechster = ps.filter(p => p.end).sort((a, b) => a.end.localeCompare(b.end))[0];
  const tage = naechster ? diffTage(heute(), naechster.end) : null;
  if (offen.length) {
    const x = offen[0], rest = x.pl.ziel - planGeschafft(x.pl);
    return [`Heute dran: noch ${rest} ${rest === 1 ? 'Karte' : 'Karten'} für „${esc(x.p.name)}“.`, tage != null && tage <= 14 ? `Noch ${tage} ${tage === 1 ? 'Tag' : 'Tage'} bis „${esc(naechster.name)}“ – du bist auf Kurs.` : 'Los geht’s, ich bin dabei!'];
  }
  if (heutige.some(x => x.pl.fertig)) return ['Tagesziel geschafft – sauber getaucht!', 'Eine Bonusrunde geht immer, muss aber nicht.'];
  return ['Heute ist nichts fällig. Alles sitzt!', 'Wenn du magst: Bonusrunde zum Auffrischen.'];
}
const SPRECHE_NAME = { en: 'Englisch', fr: 'Französisch' };

function countdownChip(P) {
  if (P.dauer || !P.end) return '<span class="chip klein">Dauerprojekt</span>';
  const t = diffTage(heute(), P.end);
  if (t === 0) return '<span class="chip klein rot">Heute ist der Termin!</span>';
  return `<span class="chip klein ${t <= 3 ? 'rot' : ''}">${ico('kalender')} noch ${t} ${t === 1 ? 'Tag' : 'Tage'}</span>`;
}
function serieChip(P) {
  if (P.dauer) {
    const w = (P.wochen[wochenStart(heute())] || { tage: [] }).tage.length;
    return `<span class="flamme ${w ? '' : 'aus'}" title="Wochenziel">${FLAMME}${w}/3 Tage diese Woche</span>`;
  }
  const s = serieJetzt(P);
  return `<span class="flamme ${s ? '' : 'aus'}" title="Strömung">${FLAMME}${s ? s + (s === 1 ? ' Tag' : ' Tage in Folge') : 'Strömung startet heute'}</span>`;
}
function projektKarte(u, P) {
  const st = stand(u, P), pl = heutePlan(u, P);
  const done = planGeschafft(pl), z = pl.ziel;
  const rest = Math.max(0, z - done);
  const pct = z ? done / z : 1;
  const inner = pl.ruhetag ? `<span class="fred" style="font-size:15px">Ruhetag</span>` : z ? `<span class="fred" style="font-size:26px">${done}</span><small style="display:block;font-size:13px;color:var(--mut)">von ${z}</small>` : `${ico('haken')}`;
  const ringHtml = ring(pct, 104, pl.fertig || !z ? 'var(--gruen)' : 'var(--sp)', inner);
  const label = pl.fertig || (!z) ? 'Bonusrunde' : done ? 'Weitertauchen' : 'Tauchen!';
  const ZZ = ziel_(P.ziel);
  const marke = Math.round(st.pct * 100);
  return `<div class="panel pk sp-${P.sp}"><div class="kopfz"><span class="spbadge">${SPRECHE_NAME[P.sp].toUpperCase()}</span><h3>${esc(P.name)}</h3>${countdownChip(P)}</div>
    <div class="mitte">${ringHtml}<div class="info">
      <div class="zeile"><span>Tauchtiefe: <b>${marke} %</b> · Ziel „${ZZ.name}“</span></div>
      <div class="tiefe"><b style="width:${Math.max(3, marke)}%"></b><i style="left:${clamp(Math.max(3, marke), 3, 97)}%">${TAUCHER}</i></div>
      <div class="zeile"><span>${st.ok} von ${st.n} Karten</span><span class="sp1"></span>${serieChip(P)}</div></div></div>
    <div class="aktion"><button class="btn sp-farbe gross" data-a="lernStart" data-v="${P.id}" ${st.n ? '' : 'disabled'}>${ico('hafen')} ${label}${!pl.fertig && rest ? ` <small style="font:600 15px Inter;opacity:.9">(${rest} ${rest === 1 ? 'Karte' : 'Karten'})</small>` : ''}</button><button class="btn weiss" data-a="projektDetail" data-v="${P.id}" aria-label="Details">${ico('info')}</button></div></div>`;
}
function logbuchKarte(P, u) {
  const e = P.ergebnis || { pct: 0, n: 0 };
  return `<div class="panel pk sp-${P.sp}"><div class="kopfz"><span class="spbadge">${SPRECHE_NAME[P.sp].toUpperCase()}</span><h3>${esc(P.name)}</h3><span class="chip klein">${datumDe(P.end)} beendet</span></div>
    <div class="zeile mut">Am Ende gelernt: <b class="fred" style="color:var(--navy)">${Math.round(e.pct * 100)} %</b> von ${e.n} Karten · Strömung bis ${P.serie.best} ${P.serie.best === 1 ? 'Tag' : 'Tagen'}
    <span class="sp1"></span><button class="btn klein weiss" data-a="projektBericht" data-v="${P.id}">Bericht</button><button class="btn klein blau" data-a="projektVerlaengern" data-v="${P.id}">Verlängern</button></div></div>`;
}

ANSICHT.start = () => {
  const u = cur(), sp = u.set.sp || 'en';
  const ps = projekte(u, sp).filter(istAktiv).sort((a, b) => (a.end || '9').localeCompare(b.end || '9'));
  const alt = projekte(u, sp).filter(p => p.status === 'fertig');
  const [t1, t2] = floText(u, sp);
  const tabs = ['en', 'fr'].map(s => `<button class="${s === sp ? 'an' : ''}" data-a="sprache" data-v="${s}"><span class="pkt" style="background:${SPRACHE[s].farbe}"></span>${SPRECHE_NAME[s]}</button>`).join('');
  const mitKarten = hatKarten(sp);
  const dauer = ps.some(p => p.dauer);
  return mitNav(`<div class="sp-${sp}">${kopfLeiste()}
    <div class="flobox"><div class="flo">${flo()}</div><div class="sprechblase">${t1}<small>${t2}</small></div></div>
    ${installHinweisHtml()}
    ${u.stats.antworten > 100 && (!S.sicherung || diffTage(S.sicherung, heute()) > 14) ? `<div class="hinweisbox blau" style="margin-bottom:14px">Tipp: Sichere deinen Fortschritt als Datei (unter „Ich“ → „Daten“). Dann geht nichts verloren, auch wenn das iPad mal Speicher aufräumt. <button class="linkbtn" data-a="nav" data-v="ich">Zu „Ich“</button></div>` : ''}
    <div class="zeile w" style="margin-bottom:16px"><div class="tabs">${tabs}</div><span class="sp1"></span>
    <button class="btn blau" data-a="projektNeu" ${mitKarten ? '' : 'disabled'}>${ico('plus')} Neues Projekt</button></div>
    ${mitKarten ? '' : `<div class="panel leer"><h2>Noch keine ${SPRECHE_NAME[sp]}-Karten</h2><p class="mut" style="margin:8px 0 16px">Zieh Kartenordner in die App, dann sortiere ich sie automatisch in Lektionen.</p><button class="btn gross" data-a="nav" data-v="bibliothek">${ico('buch')} Karten holen</button></div>`}
    ${mitKarten && !ps.length ? `<div class="panel leer"><h2>Was steht an?</h2><p class="mut" style="margin:8px 0 16px">Ein Projekt ist dein Lernplan: Du wählst Lektionen, einen Termin (z. B. die Klassenarbeit) und ein Ziel.<br>Ich teile dir den Weg in kleine Tagesportionen auf.</p><button class="btn gross blau" data-a="projektNeu">${ico('plus')} Erstes Projekt anlegen</button></div>` : ''}
    <div class="pgrid2">${ps.map(p => projektKarte(u, p)).join('')}</div>
    ${mitKarten && ps.length && !dauer ? `<div style="margin-top:14px"><button class="linkbtn" data-a="dauerNeu">Dauerprojekt zum langfristigen Festigen anlegen</button></div>` : ''}
    ${alt.length ? `<div class="sektion logbuch">Logbuch <small>abgeschlossene Projekte</small></div><div class="pgrid2 logbuch">${alt.map(p => logbuchKarte(p, u)).join('')}</div>` : ''}
    </div>`);
};
AKT.sprache = el => { cur().set.sp = el.dataset.v; sichere(); render(true); };
