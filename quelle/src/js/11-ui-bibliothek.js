'use strict';
// ---------- Bibliothek: Karten per Ziehen & Ablegen, Dateiauswahl oder ZIP einlesen ----------
const IMP = { laeuft: false, text: '', i: 0, n: 0, bericht: null };

function lektionKachel(L) {
  const sp = SPRACHE[L.sp];
  const nKarten = Object.keys(L.cards).length;
  const saetze = {};
  Object.values(L.cards).forEach(c => { saetze[c.satz] = (saetze[c.satz] || 0) + 1; });
  const chips = SATZ_REIHE.concat(Object.keys(saetze).filter(s => SATZ_REIHE.indexOf(s) < 0)).filter(s => saetze[s]).map(s => `<span class="chip klein">${esc(satzInfo(s).kurz)} · ${saetze[s]}</span>`).join('');
  return `<div class="panel lk sp-${L.sp}"><div class="zeile"><span class="spbadge">${sp.name.toUpperCase()}</span><h3>${esc(L.titel)}</h3>
    <button class="btn klein weiss" data-a="lektionWeg" data-v="${L.key}" aria-label="Lektion löschen">${ico('muelleimer')}</button></div>
    <div class="mut" style="font-size:14px">${L.buch ? esc(L.buch) + ' · ' : ''}${nKarten} Karten (${nKarten * 2} Bilder)</div>
    <div class="sets">${chips}</div>
    <div style="margin-top:8px">${L.hasText ? '<span class="chip klein gruen">' + ico('haken') + ' mit Text: Vorlesen und Quiz möglich</span>' : '<span class="chip klein gold">nur Bilder: Karten umdrehen</span>'}</div></div>`;
}

ANSICHT.bibliothek = () => {
  const ls = Object.values(S.lib.lessons).sort((a, b) => a.sp.localeCompare(b.sp) || a.nr - b.nr);
  const b = IMP.bericht;
  const prog = IMP.laeuft ? `<div class="panel fortschritt"><div class="zeile"><h3 class="sp1">${esc(IMP.text)}</h3><span class="zahl">${IMP.n ? Math.round(IMP.i / IMP.n * 100) : 0} %</span></div><div class="leiste" style="margin-top:10px"><b id="impBalken" style="width:${IMP.n ? IMP.i / IMP.n * 100 : 3}%"></b></div></div>` : '';
  let ber = '';
  if (b && !IMP.laeuft) {
    const ok = b.neu + b.aktualisiert;
    const teile = [];
    if (ok) teile.push(`<b>${b.neu}</b> neue Karten, <b>${b.aktualisiert}</b> aktualisiert`);
    if (b.lektionen.length) teile.push('Lektionen: ' + b.lektionen.map(k => esc(S.lib.lessons[k] ? S.lib.lessons[k].titel : k)).join(', '));
    const ordnerTipp = `<b>Ein ganzer Ordner lässt sich hier nicht hineinziehen.</b> Der iPad-Browser gibt ihn nicht heraus. Zwei Wege, die gehen:<ol style="margin:6px 0 0;padding-left:22px"><li><b>ZIP:</b> Ordner in „Dateien“ lange drücken → „Komprimieren“, dann die ZIP-Datei hineinziehen oder „ZIP wählen“.</li><li><b>Dateien:</b> In „Dateien“ in den Ordner gehen, „Auswählen“ → „Alle“ und alles auf einmal hineinziehen (bei mehreren Unterordnern jeden einzeln) oder „Dateien wählen“.</li></ol>`;
    ber = `<div class="bericht panel dicht"><div class="hinweisbox ${ok ? 'gruen' : b.ordner ? 'blau' : 'rot'}">${ok ? '<b>Eingelesen.</b> ' + teile.join(' · ') : (b.ordner ? ordnerTipp : '<b>Keine Karten gefunden.</b> Die Dateien müssen so heißen wie vom Kartenbau erzeugt, z. B. <i>E04_DE-EN_011_1-vorne.webp</i> und <i>…_2-hinten.png</i>. Alternativ nimm „Dateien wählen“ oder ein ZIP.')}</div>
      ${b.diag && !ok ? `<details style="margin-top:8px;font-size:13px;color:var(--mut)"><summary>Technische Info (für die Fehlersuche)</summary><pre style="white-space:pre-wrap;user-select:text;-webkit-user-select:text">${esc(JSON.stringify(b.diag, null, 1))}</pre></details>` : ''}
      ${b.ohneText.length ? `<div class="hinweisbox" style="margin-top:8px">Für ${b.ohneText.map(k => esc(k)).join(', ')} fehlt die <i>lektion.json</i>. Die Karten funktionieren, aber ohne Vorlesen und Quiz. Zieh die Datei einfach nachträglich dazu.</div>` : ''}
      ${b.unvollstaendig.length ? `<div class="hinweisbox rot" style="margin-top:8px">Unvollständig (nicht übernommen): ${b.unvollstaendig.slice(0, 6).map(esc).join(', ')}${b.unvollstaendig.length > 6 ? ' … (+' + (b.unvollstaendig.length - 6) + ')' : ''}</div>` : ''}
      ${b.fehler.length ? `<div class="hinweisbox rot" style="margin-top:8px">Fehler: ${b.fehler.slice(0, 4).map(esc).join(' · ')}</div>` : ''}
      ${b.ignoriert ? `<div class="mut" style="margin-top:8px;font-size:14px">${b.ignoriert} andere Dateien übersprungen.</div>` : ''}</div>`;
  }
  return mitNav(`<div>${kopfLeiste()}<div class="kopf"><h1>Karten</h1></div>
    <div class="ablage" id="ablage"><div class="fisch">${ART.figur('hai', PAL.tuerkis, 'maske', 'bibl')}</div><h2>Kartenordner hier hineinziehen</h2>
    <p class="mut">Einzelne Bilder, <i>lektion.json</i> oder ein ZIP. Je zwei Bilder (vorne/hinten) werden zu einer Karte, alles landet automatisch in der richtigen Lektion.<br><b>Am iPad:</b> Ganze Ordner gehen nicht. Markiere in „Dateien“ alle Dateien auf einmal und zieh sie herein, oder nimm die ZIP-Datei.</p>
    <div class="knoepfe"><button class="btn blau" data-a="waehleDateien">${ico('papier')} Dateien wählen</button><button class="btn blau" data-a="waehleZip">${ico('laden')} ZIP wählen</button><button class="btn weiss" data-a="waehleOrdner">${ico('buch')} Ordner wählen (nur am Rechner)</button></div></div>
    <input type="file" id="fOrdner" webkitdirectory directory multiple hidden><input type="file" id="fDateien" multiple accept="image/webp,image/png,image/jpeg,.json,.webp,.png,.jpg,.jpeg" hidden><input type="file" id="fZip" accept=".zip,application/zip" multiple hidden>
    ${prog}${ber}
    ${repoPanelHtml()}
    <div class="sektion">Bibliothek <small>${ls.length ? ls.length + (ls.length === 1 ? ' Lektion' : ' Lektionen') : 'noch leer'}</small></div>
    ${ls.length ? `<div class="lektionen">${ls.map(lektionKachel).join('')}</div>` : '<div class="panel leer mut">Hier erscheinen deine Lektionen, sobald du Karten hineingezogen hast.</div>'}
    <div class="sektion">Bildqualität beim Einlesen</div>
    <div class="panel dicht"><div class="opts"><button class="opt ${S.bildmodus !== 'original' ? 'an' : ''}" data-a="bildmodus" data-v="sparsam">Sparsam (empfohlen)</button><button class="opt ${S.bildmodus === 'original' ? 'an' : ''}" data-a="bildmodus" data-v="original">Original (viel Speicher)</button></div>
    <p class="mut" style="margin-top:8px;font-size:14px">Sparsam verkleinert die Karten auf das Nötige (etwa ein Viertel des Speichers). Gilt für künftiges Einlesen.</p></div></div>`);
};

function impNachDrop() {                                          // nach jedem Neuzeichnen die Ablage verdrahten
  const a = $('#ablage'); if (!a) return;
  ['dragenter', 'dragover'].forEach(t => a.addEventListener(t, e => { e.preventDefault(); a.classList.add('drin'); }));
  ['dragleave', 'dragend'].forEach(t => a.addEventListener(t, () => a.classList.remove('drin')));
  a.addEventListener('drop', e => { e.preventDefault(); a.classList.remove('drin'); const d = dropAnfang(e.dataTransfer); impStart(async () => dateienAusDrop(d)); });
  [['fOrdner'], ['fDateien'], ['fZip']].forEach(([id]) => { const f = $('#' + id); if (f) f.addEventListener('change', () => { const l = Array.from(f.files); f.value = ''; if (l.length) impStart(async () => l); }); });
}
const bibNach = () => { impNachDrop(); repoPanelFuellen(); };
const _bibAnsicht = ANSICHT.bibliothek;
ANSICHT.bibliothek = () => { const h = _bibAnsicht(); V.nach = bibNach; return h; };

AKT.waehleOrdner = () => $('#fOrdner').click();
AKT.waehleDateien = () => $('#fDateien').click();
AKT.waehleZip = () => $('#fZip').click();
AKT.bildmodus = el => { S.bildmodus = el.dataset.v; sichere(); render(); };
AKT.lektionWeg = el => {
  const L = S.lib.lessons[el.dataset.v]; if (!L) return;
  zeigeBlatt(`<h2>„${esc(L.titel)}“ entfernen?</h2><p class="mut" style="margin:10px 0 18px">Die Karten-Bilder werden gelöscht. Dein Lernstand und deine Projekte bleiben erhalten: Wenn du die Lektion später wieder hineinziehst, geht es genau dort weiter.</p>
    <div class="zeile"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn rot" data-a="lektionWegJa" data-v="${L.key}">Entfernen</button></div>`);
};
AKT.lektionWegJa = async el => { await lektionLoeschen(el.dataset.v); schliesseBlatt(); toast('Lektion entfernt.', 'muelleimer'); render(); };

async function impStart(hole) {
  if (IMP.laeuft) { toast('Es läuft noch ein Einlesen …', 'uhr'); return; }
  IMP.laeuft = true; IMP.bericht = null; IMP.text = 'Dateien werden gelesen …'; IMP.i = 0; IMP.n = 0;
  render();
  let dateien = [], ordner = false, diag = null;
  try {
    const r = await hole();
    if (Array.isArray(r)) dateien = r; else { dateien = r.dateien || []; ordner = !!r.ordner; diag = r.diag || null; }
  } catch (e) { dateien = []; diag = { fehler: [String((e && e.message) || e)] }; }
  let b;
  try {
    b = await importiere(dateien, (txt, i, n) => {
      IMP.text = txt; IMP.i = i; IMP.n = n;
      const bar = $('#impBalken'); if (bar) bar.style.width = (n ? i / n * 100 : 0) + '%';
      const h3 = $('.fortschritt h3'); if (h3) h3.textContent = txt;
      const z = $('.fortschritt .zahl'); if (z) z.textContent = (n ? Math.round(i / n * 100) : 0) + ' %';
    });
  } catch (e) { b = { neu: 0, aktualisiert: 0, lektionen: [], ohneText: [], unvollstaendig: [], ignoriert: 0, fehler: [String(e.message || e)] }; }
  b.ordner = ordner && b.neu + b.aktualisiert === 0; b.diag = diag;
  IMP.laeuft = false; IMP.bericht = b;
  if (b.neu + b.aktualisiert) { TON.spiel('fertig'); FX.blasen(innerWidth / 2, innerHeight / 2, 30); }
  if (V.name === 'bibliothek') render();
}
