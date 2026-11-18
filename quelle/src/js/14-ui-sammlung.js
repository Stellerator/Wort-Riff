'use strict';
// ---------- Muschel öffnen, Album, Riff ----------
const RC = id => RAR[id].farbe;
const RT = id => ['#EAF6FA', '#E1EFFF', '#EFE6FF', '#FFF2C7'][id];
const sterneText = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const sterneHtml = n => `<span class="sternfull">${'★'.repeat(n)}</span><span class="sternleer">${'★'.repeat(5 - n)}</span>`;

// ---------- Muschel ----------
AKT.muschelStart = () => {
  const u = cur();
  if (!muschelAnzahl(u)) { toast('Keine Muschel da. Die nächste gibt es nach einer Lernrunde!', 'album'); return; }
  gehe('muschel', { phase: 'zu', art: u.muscheln.schatz ? 'schatz' : 'perl' });
};
ANSICHT.muschel = () => {
  const u = cur(), p = V.p, rest = muschelAnzahl(u);
  const art = p.art;
  return `<div class="muschel" style="--glow:${art === 'schatz' ? '#FFD25A' : '#7FD9EA'}"><div class="titel" id="mTitel">${MUSCHEL[art].name} – tipp sie an!</div>
    <div class="schale wackelt" id="schale" data-a="muschelAuf"><div class="strahlen"></div>${muschelSvg(art)}<div class="fund" id="fund"></div></div>
    <div class="info" id="mInfo"></div>
    <div class="zeile w" style="justify-content:center;min-height:68px" id="mKnoepfe"><button class="btn weiss" data-a="muschelZu">Später öffnen</button></div>
    <div class="rest" id="mRest">${rest === 1 ? 'Das ist deine letzte Muschel.' : rest + ' Muscheln warten auf dich.'} <button class="linkbtn" style="color:#BCD9EE" data-a="chancen">Wie wahrscheinlich?</button></div></div>`;
};
AKT.muschelZu = () => { gehe('album'); };
AKT.muschelAuf = () => {
  const p = V.p; if (p.phase !== 'zu') return;
  const u = cur();
  const res = muschelOeffnen(u);
  if (!res) return;
  p.phase = 'offen'; p.res = res;
  const f = FIG[res.id], farbe = RC(res.rar);
  $('.muschel').style.setProperty('--glow', farbe);
  const sch = $('#schale'); sch.classList.remove('wackelt'); sch.classList.add('offen');
  TON.spiel('muschelAuf');
  const lebt = () => V.name === 'muschel' && V.p === p && $('#fund');         // Kind hat die Ansicht evtl. schon verlassen
  setTimeout(() => {
    if (!lebt()) return;
    $('#fund').innerHTML = figSvg(res.id, res.stufeAlt);
    TON.spiel(['perle', 'selten', 'episch', 'legende'][res.rar]);
    FX.konfetti(res.rar >= 2 ? 140 : 60); FX.blasen(innerWidth / 2, innerHeight * 0.4, 24);
  }, 350);
  $('#mTitel').textContent = res.neu ? 'Ein neuer Freund!' : 'Den kennst du schon …';
  setTimeout(() => {
    if (!lebt()) { (res.abzeichen || []).forEach(b => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200)); return; }
    const info = $('#mInfo');
    info.style.setProperty('--rc', farbe);
    const extra = res.neu ? '<span class="neuband">NEU im Album!</span>' : `<span class="chip gold">Doppelt: +${res.perlen} Perlen ${PERLE}</span><span class="chip koralle">+${res.funken} Korallenfunken ${FUNKE}</span>${res.sternNeu ? `<span class="chip gold">Freundschaft: ${sterneHtml(res.sternNeu)} (+${R.perlen.stern} Perlen)</span>` : '<span class="chip klein">Mit Funken stärkst du Freunde im Album.</span>'}`;
    info.innerHTML = `<div class="raritaet" style="--rc:${farbe}">${RAR[res.rar].name}</div><div class="name">${esc(f.name)}</div><div class="zeile w" style="justify-content:center">${extra}</div><div class="text">${esc(f.text)}</div>${res.pity ? '<div class="rest">Garantiefund: nach vielen Muscheln gibt es einen besonderen Fund.</div>' : ''}`;
    info.classList.add('da');
    const rest = muschelAnzahl(u);
    $('#mKnoepfe').innerHTML = `${rest ? `<button class="btn gold gross" data-a="muschelNoch">Nächste Muschel (${rest})</button>` : ''}<button class="btn ${rest ? 'weiss' : 'gruen gross'}" data-a="muschelFertig">${rest ? 'Ins Album' : 'Weiter'}</button>`;
    $('#mRest').style.visibility = 'hidden';
    (res.abzeichen || []).forEach((b, i) => setTimeout(() => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200), 600 + i * 900));
    if (res.stufeNeu > res.stufeAlt) setTimeout(() => {
      if (!lebt()) return;
      zeigeEntwicklung(res.id, res.stufeAlt, res.stufeNeu, () => { if (!lebt()) return; $('#fund').innerHTML = figSvg(res.id, res.stufeNeu); const n = $('#mInfo .name'); if (n) n.textContent = figName(res.id, res.stufeNeu); });
    }, 900);
  }, 1250);
};
AKT.muschelNoch = () => { const u = cur(); gehe('muschel', { phase: 'zu', art: u.muscheln.schatz ? 'schatz' : 'perl' }); };
AKT.muschelFertig = () => gehe('album');
AKT.chancen = () => {
  const u = cur(), t = tiefeJetzt(u), pp = wahrscheinlichkeiten(u, 'perl'), ps = wahrscheinlichkeiten(u, 'schatz');
  zeigeBlatt(`<h2>Wie wahrscheinlich ist was?</h2><p class="mut" style="margin:6px 0 12px">Hier steht offen, was in den Muscheln stecken kann. Es gibt nichts zu kaufen, Muscheln bekommst du nur durchs Lernen. Seltene Wesen leben tiefer: Sie stecken erst in den Muscheln, wenn du tief genug getaucht bist (jetzt: <b>${nf(t)} m</b>).</p>
    <table class="odds"><tr><th></th><th>${MUSCHEL.perl.name}</th><th>${MUSCHEL.schatz.name}</th></tr>${RAR.map(r => { const frei = t >= r.tiefe; return `<tr style="${frei ? '' : 'opacity:.55'}"><td><b style="color:${r.farbe}">${r.name}</b> <span class="mut">(${figNachSeltenheit(r.id).length} Figuren, ${esc(r.zone)})</span><br><small class="mut">${frei ? 'frei seit ' + r.tiefe + ' m' : ico('schloss') + ' ab ' + r.tiefe + ' m Tiefe, noch ' + nf(r.tiefe - t) + ' m'}</small></td><td>${frei ? Math.round(pp[r.id]) + ' %' : '–'}</td><td>${frei ? Math.round(ps[r.id]) + ' %' : '–'}</td></tr>`; }).join('')}</table>
    <p class="mut" style="margin-top:12px;font-size:14px">Neue Figuren werden bei gleicher Seltenheit dreimal so oft gezogen wie schon bekannte. Sobald es Episches zu finden gibt, enthält spätestens die ${R.pityNach}. Muschel eine epische oder legendäre Figur. Doppelte geben Perlen und Korallenfunken. Mit den Funken stärkst du Freunde im Album (bis zu 5 Sterne); bei 3 und bei 5 Sternen entwickeln sie sich weiter.</p>`);
};

// ---------- Album ----------
ANSICHT.album = () => {
  const u = cur();
  const alle = figIds(), mein = alle.filter(i => u.owned[i]).length;
  const m = muschelAnzahl(u);
  const tiefe = tiefeJetzt(u);
  const serien = RAR.map(r => {
    const ids = figNachSeltenheit(r.id), haben = ids.filter(i => u.owned[i]).length, frei = tiefe >= r.tiefe;
    return `<div class="serie ${frei ? '' : 'gesperrt'}"><h3><span style="color:${r.farbe}">●</span> ${r.serie} <small class="mut" style="font:600 15px Inter">${haben}/${ids.length} · ${r.name}</small>${frei ? '' : `<span class="chip klein">${ico('schloss')} ab ${r.tiefe} m Tiefe · noch ${nf(r.tiefe - tiefe)} m</span>`}</h3><div class="figraster">${ids.map(i => figKachel(u, i)).join('')}</div></div>`;
  }).join('');
  return mitNav(`<div>${kopfLeiste()}<div class="kopf"><h1>Album</h1><button class="btn gold" data-a="muschelStart" ${m ? '' : 'disabled'}>${muschelSvgKlein()} Muschel öffnen (${m})</button><button class="btn weiss klein" data-a="chancen">Chancen</button></div>
    <div class="panel dicht" style="margin-bottom:18px"><div class="zeile"><b class="fred">${mein} von ${alle.length} Figuren gefunden</b><span class="sp1"></span><span class="chip koralle" title="Korallenfunken: Doppelte Figuren geben Funken. Damit stärkst du Freunde.">${FUNKE} <b class="zahl">${nf(funkenStand(u))}</b> Korallenfunken</span><span class="mut">Tiefe: ${nf(tiefe)} m · ${esc(RAR[zoneVonTiefe(tiefe)].zone)}</span></div><div class="leiste gold" style="margin-top:8px"><b style="width:${mein / alle.length * 100}%"></b></div></div>${serien}</div>`);
};
function figKachel(u, id) {
  const f = FIG[id], b = u.owned[id];
  const st = `--rc:${RC(f.rar)};--rt:${RT(f.rar)}`;
  if (!b) return `<button class="figkachel zu" style="${st}" data-a="figDetail" data-v="${id}"><div class="bild">${figSvg(id)}</div><div class="frage">?</div><div>???</div><div class="sterne"></div></button>`;
  return `<button class="figkachel rar${f.rar} ${b.neu ? 'neu' : ''}" style="${st}" data-a="figDetail" data-v="${id}"><div class="bild">${figSvg(id)}</div><div>${esc(f.name)}</div><div class="sterne">${sterneHtml(b.stern)}</div>${f.rar >= 2 ? '<div class="glanz"></div>' : ''}</button>`;
}
AKT.figDetail = el => {
  const u = cur(), id = el.dataset.v, f = FIG[id], b = u.owned[id];
  const st = `--rc:${RC(f.rar)};--rt:${RT(f.rar)}`;
  if (!b) { zeigeBlatt(`<div class="detail" style="${st}"><div class="gross">${`<div style="filter:brightness(0) opacity(.2);height:100%">${figSvg(id)}</div>`}</div><div style="flex:1;min-width:240px"><h2>Noch unbekannt</h2><p class="mut" style="margin:8px 0">Dieses Wesen gehört zu den <b style="color:${RC(f.rar)}">${RAR[f.rar].name}en</b> (${f.serie}). Es lebt in der Zone „${esc(RAR[f.rar].zone)}“ ${RAR[f.rar].tiefe ? '(ab ' + RAR[f.rar].tiefe + ' m Tiefe)' : ''} und steckt in Muscheln, sobald du dort angekommen bist.</p></div></div>`); return; }
  if (b.neu) { b.neu = false; sichere(); }
  const naechster = [2, 4, 7, 11].find(n => n > b.n), stufe = figStufe(b.stern), kost = sternKosten(u, id), funk = funkenStand(u);
  const reihe = [1, 2, 3].map(s => `<div class="evostufe ${s <= stufe ? 'da' : ''} ${s === stufe ? 'jetzt' : ''}"><div class="b">${s <= stufe ? figSvg(id, s) : `<div style="filter:brightness(0) opacity(.22);height:100%">${figSvg(id, s)}</div>`}</div><small>${s === 1 ? 'Start' : s === 2 ? 'ab ★3' : 'ab ★5'}</small></div>`).join('<span class="evopfeil">›</span>');
  const staerken = b.stern >= 5 ? '<p class="mut" style="font-size:14px;margin-top:10px">Volle Freundschaft! Mehr geht nicht.</p>'
    : `<div class="zeile w" style="margin-top:12px"><button class="btn gold klein" data-a="sternKaufen" data-v="${id}" ${funk >= kost ? '' : 'disabled'}>${FUNKE} ${kost} · Stern stärken</button><span class="mut" style="font-size:14px">${[3, 5].includes(b.stern + 1) ? '<b>Mit dem nächsten Stern entwickelt er sich weiter!</b> ' : ''}Du hast ${nf(funk)} Korallenfunken.</span></div>`;
  zeigeBlatt(`<div class="detail" style="${st}"><div class="gross">${figSvg(id)}</div><div style="flex:1;min-width:250px"><span class="chip" style="background:${RC(f.rar)};color:#fff">${RAR[f.rar].name}</span> <span class="chip klein">${f.serie}</span>
    <h2 style="margin:8px 0 4px">${esc(figName(id, stufe))}</h2><p class="mut" style="margin-bottom:10px">${esc(f.text)}</p>${lieblingHtml(id)}
    <p style="font:600 24px Fredoka;letter-spacing:2px">${sterneHtml(b.stern)}</p><p class="mut" style="font-size:14px">${b.n}× gefunden${naechster ? ` · auch der ${naechster}. Fund bringt einen Stern` : ''}</p>
    ${staerken}
    <div class="evoreihe">${reihe}</div>
    <div class="zeile w" style="margin-top:14px"><button class="btn blau klein" data-a="figAvatar" data-v="${id}">${ico('ich')} Als Profilbild</button><button class="btn tuerkis klein" data-a="figRiff" data-v="${id}">${ico('riff')} ${figPlatziert(u, id) ? 'Aus dem Riff nehmen' : 'Ins Riff setzen'}</button></div></div></div>`);
  render();
};
AKT.sternKaufen = el => {
  const u = cur(), id = el.dataset.v, r = sternKaufen(u, id);
  if (!r) return;
  TON.spiel('kauf');
  r.abzeichen.forEach((b, i) => setTimeout(() => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200), 1200 + i * 900));
  const zurueck = () => AKT.figDetail({ dataset: { v: id } });
  if (r.bis > r.von) { schliesseBlatt(); render(); zeigeEntwicklung(id, r.von, r.bis, zurueck); }
  else { toast(`${FIG[id].name}: ${r.stern} von 5 Sternen`, 'stern'); zurueck(); }
};
// Entwicklung: die alte Gestalt leuchtet auf, ein Blitz, dann steht die neue Form da (Antippen schließt)
function zeigeEntwicklung(id, von, bis, fertig) {
  const f = FIG[id];
  $('#layer').innerHTML = `<div class="evoschleier" style="--rc:${RC(f.rar)}"><div class="evobuehne"><div class="evostrahl"></div><div class="evofig alt">${figSvg(id, von)}</div><div class="evofig neu">${figSvg(id, bis)}</div><div class="evoblitz"></div></div><div class="evotext" id="evoText">${esc(f.name)} spürt etwas …</div><div class="evoknopf" id="evoKnopf"></div></div>`;
  V.evoFertig = fertig || null;
  TON.spiel('episch');
  const lebt = () => $('#evoText');
  setTimeout(() => {
    if (!lebt()) return;
    $('.evoschleier').classList.add('fertig'); $('#evoText').textContent = figName(id, bis) + '!';
    TON.spiel('legende'); FX.konfetti(150); FX.blasen(innerWidth / 2, innerHeight * 0.45, 30);
  }, 2100);
  setTimeout(() => { if (lebt()) $('#evoKnopf').innerHTML = '<button class="btn gold gross" data-a="evoZu">Toll!</button>'; }, 3000);
}
AKT.evoZu = () => { $('#layer').innerHTML = ''; const f = V.evoFertig; V.evoFertig = null; if (f) f(); };
AKT.figAvatar = el => { cur().avatar = el.dataset.v; sichere(); schliesseBlatt(); toast('Neues Profilbild!', 'ich'); render(); };
AKT.figRiff = el => {
  const u = cur(), id = el.dataset.v;
  if (figPlatziert(u, id)) { u.riff.items = u.riff.items.filter(i => !(i.kind === 'fig' && i.ref === id)); toast('Aus dem Riff genommen.', 'riff'); }
  else { riffSetze('fig', id); toast(`${FIG[id].name} schwimmt jetzt im Riff.`, 'riff'); }
  sichere(); schliesseBlatt();
};

// ---------- Riff ----------
const RIFFHG = {
  flach: ['#C9F5FA', '#5CC8E4', '#F6E3B4', '#E8C985'], daemmer: ['#5FB0DD', '#1D63A3', '#D6C18C', '#B09860'],
  korallen: ['#86E6D6', '#1FA3B5', '#F6D9AA', '#E3B26E'], tief: ['#1F5498', '#0A2147', '#6A6890', '#4A486E'], nacht: ['#25286B', '#05061F', '#3C3C70', '#25254F']
};
// Welt-Hintergrund: ab der zweiten Reihe läuft das Wasser Zone für Zone ins Dunkle (Farbe an der Unterkante der Reihe 0–3)
const ZONEHG = [null, '#2F8CC4', '#143E7A', '#0A1F45', '#050B22'];
const ZONESAND = [null, ['#D9BE8C', '#B39562'], ['#6A6890', '#4A486E'], ['#3B3B63', '#23233F']];   // Sand der untersten Reihe ab Reihe 1
const ZONEKARTE = ['#7FD6EA', '#2F8CC4', '#143E7A', '#0A1F45'];
const RIFF = { ratio: 1.6, u: 6, v: 4, alles: false, scroll: null };   // u/v: Pixel je Einheit (1 Einheit = 1 % einer Kachel)
const lum = h => { const n = parseInt(h.slice(1), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11; };
function riffWasser(rows, c) {
  if (rows === 1) return `linear-gradient(180deg,${c[0]},${c[1]})`;
  let prev = c[0]; const st = [`${c[0]} 0%`];
  for (let k = 1; k <= rows; k++) {
    const z = ZONEHG[k], f = k === 1 && lum(c[1]) < lum(z) ? c[1] : z;
    if (lum(f) < lum(prev)) prev = f;                              // nie heller als darüber
    st.push(`${prev} ${k / rows * 100}%`);
  }
  return `linear-gradient(180deg,${st.join(',')})`;
}

// Silhouetten im Hintergrund (nur angedeutet): pro Zone Formen am Boden (b) und im freien Wasser (f), jeweils [Höhe bei Breite 100, SVG-Inhalt]
const SILF = ['rgba(20,110,150,.26)', 'rgba(8,50,100,.3)', 'rgba(0,10,35,.4)', 'rgba(80,100,170,.3)'];
const FISCHE = [40, '<path d="M0 10C8-2 18-2 26 10 18 22 8 22 0 10ZM26 10 36 2V18Z"/><path transform="translate(44 18) scale(.8)" d="M0 10C8-2 18-2 26 10 18 22 8 22 0 10ZM26 10 36 2V18Z"/><path transform="translate(64 2) scale(.9)" d="M0 10C8-2 18-2 26 10 18 22 8 22 0 10ZM26 10 36 2V18Z"/>'];
const SILBOGEN = [100, '<path d="M0 100V50C0-10 100-10 100 50V100H72V54C72 30 28 30 28 54V100Z"/>'];
const SIL = [
  { b: [[100, '<path d="M8 100C-2 70 22 55 10 20 28 50 20 70 28 100ZM34 100C30 62 50 52 44 8 60 48 52 66 52 100ZM60 100C62 72 80 60 74 30 92 60 80 78 86 100Z"/>'],
         [100, '<path d="M0 100C4 60 24 40 44 46 54 30 80 34 86 62 96 70 100 86 100 100Z"/>']], f: [FISCHE] },
  { b: [[100, '<path d="M0 100V70C6 60 10 66 12 54 14 40 20 44 22 56 26 48 34 46 36 62L40 30C44 24 48 28 48 44L52 62C58 50 66 48 66 60 70 52 78 52 80 62 86 56 94 60 96 70V100Z"/>'],
         [100, '<path d="M50 100V82C8 72 0 30 20 6 34 18 42 12 50 0 58 12 66 18 80 6 100 30 92 72 50 82Z"/>']],
    f: [[40, '<ellipse cx="46" cy="22" rx="26" ry="14"/><path d="M68 20 88 14V26ZM30 26 14 36 22 22ZM30 16 14 6 22 20ZM70 28 82 38 72 30Z"/>'], FISCHE] },
  { b: [[100, '<g transform="rotate(-7 50 100)"><path d="M0 100 10 78H78L90 66 100 100ZM30 78 34 16 38 78ZM34 22 62 38 34 54Z"/></g>'], SILBOGEN],
    f: [[100, '<path d="M20 34C20 6 80 6 80 34Z"/><path d="M30 34C26 54 36 64 30 84M46 34C42 56 52 68 46 96M62 34C58 54 68 64 62 84" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="24" r="9" fill="#7DF9FF" opacity=".5"/>']] },
  { b: [[100, '<path d="M0 100 38 40H62L100 100Z"/><path d="M40 40H60L56 28H44Z" fill="#FF8A4B" opacity=".6"/>'],
         [100, '<path d="M0 100 14 30 26 70 40 10 56 66 70 24 84 70 100 100Z"/>']],
    f: [[50, '<ellipse cx="46" cy="30" rx="30" ry="18"/><path d="M76 30 96 18V42Z"/><path d="M30 14C30-4 56-6 62 4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="62" cy="4" r="5" fill="#9FFBFF" opacity=".8"/>']] }
];
function riffZonenHtml(W) {
  const out = [];
  for (let r = 0; r < W.rows; r++) for (let c = 0; c < W.cols; c++) {
    const h = hashStr((c - W.e.l) + ':' + r), z = SIL[r];
    const sil = (s, st, sp, c) => `<svg class="sil ${c || ''}" viewBox="0 0 100 ${s[0]}" style="${st};color:${SILF[r]}${sp ? ';transform:scaleX(-1)' : ''}" aria-hidden="true">${s[1]}</svg>`;
    let inner = `<div class="zlabel">${esc(RAR[r].zone)}${RAR[r].tiefe ? ` · ab ${RAR[r].tiefe} m` : ''}</div>` +
      sil(z.f[(h >>> 3) % z.f.length], `left:${10 + (h >>> 5) % 55}%;top:${14 + (h >>> 9) % 34}%;width:${16 + (h >>> 13) % 10}%`, (h >>> 1) & 1, 'fl');
    if (r === W.rows - 1) {
      inner += sil(z.b[h % z.b.length], `left:${3 + (h >>> 4) % 20}%;bottom:7%;width:${22 + (h >>> 7) % 12}%`, (h >>> 2) & 1) +
        sil(z.b[(h >>> 6) % z.b.length], `left:${54 + (h >>> 8) % 24}%;bottom:7%;width:${16 + (h >>> 11) % 12}%`, (h >>> 3) & 1);
    }
    out.push(`<div class="zelle" style="left:${c / W.cols * 100}%;top:${r / W.rows * 100}%;width:${100 / W.cols}%;height:${100 / W.rows}%">${inner}</div>`);
  }
  return out.join('');
}

function riffSetze(kind, ref) {
  const u = cur(), W = riffWelt(u), b = $('#buehne'), wrap = $('#riffwrap');
  let x = 14 + rand() * 72, y = 55 + rand() * 38;                  // ohne Riff-Ansicht: in der Start-Kachel
  if (b && wrap) {                                                // sonst im sichtbaren Ausschnitt, in der unteren Hälfte
    const br = b.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    x = W.minX + ((wr.left + wr.width / 2) - (br.left + 6)) / RIFF.u + (rand() - 0.5) * 40;
    y = (Math.min(wr.bottom, br.bottom - 6) - (br.top + 6)) / RIFF.v - 6 - rand() * 36;
  }
  const it = { id: uid(), kind, ref, x: clamp(x, W.minX + 8, W.minX + W.w - 8), y: clamp(y, 30, W.h - 2), s: 1, flip: rand() < 0.5 };
  u.riff.items.push(it);
  if (u.dekoNeu) delete u.dekoNeu[ref];
  const neu = pruefeAbzeichen(u); neu.forEach(b => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200));
  return it;
}
const STUFENGROESSE = [1, 1.08, 1.2];                             // entwickelte Freunde sind im Riff etwas größer
const riffBasis = it => (it.kind === 'fig' ? 17 * STUFENGROESSE[stufeVon(cur(), it.ref) - 1] : 13) * it.s;     // Breite in Einheiten (Prozent einer Kachel)
const riffLeft = (x, W) => `calc(${+(x - W.minX).toFixed(2)} * var(--u))`, riffTop = y => `calc(${+y.toFixed(2)} * var(--v))`;
function riffItemHtml(it, W) {
  const sel = V.p.sel === it.id;
  const svg = it.kind === 'fig' ? figSvg(it.ref) : dekoSvg(it.ref);
  const a = LEBEN.ag.get(it.id);
  return `<div class="ritem ${it.kind} ${it.kind === 'deko' ? 'd-' + it.ref : ''} ${sel ? 'gew' : ''}" data-id="${it.id}" style="left:${riffLeft(it.x, W)};top:${riffTop(it.y)};width:calc(${riffBasis(it)} * var(--u));z-index:${Math.round((it.y + (a ? a.oy : 0)) * 10)};--dl:${(hashStr(it.id) % 30) / 10}s"><div class="swim"${a ? ` style="transform:${riffTransform(a)}"` : ''}><div class="dr"><div class="fl" style="transform:${it.flip ? 'scaleX(-1)' : 'none'}"><div class="fx">${svg}</div></div></div></div></div>`;
}
const werkzeugTop = it => clamp(riffSicht(it).y - riffBasis(it) * RIFF.ratio - 11, 2, riffWelt(cur()).h - 22);
function lagerHtml(u) {
  const figs = figIds().filter(i => u.owned[i] && !figPlatziert(u, i));
  const dek = Object.keys(DEKO).filter(i => dekoFrei(u, i) > 0);
  const n = figs.length + sum(dek.map(i => dekoFrei(u, i)));
  const kacheln = dek.map(i => `<button class="rtile ${u.dekoNeu && u.dekoNeu[i] ? 'neu' : ''}" data-a="riffNimm" data-k="deko" data-v="${i}" aria-label="${esc(DEKO[i].name)} aufstellen"><div class="b">${dekoSvg(i)}</div>${esc(DEKO[i].name)}${dekoFrei(u, i) > 1 ? `<span class="n">${dekoFrei(u, i)}</span>` : ''}</button>`).join('') +
    figs.map(i => `<button class="rtile" data-a="riffNimm" data-k="fig" data-v="${i}" aria-label="${esc(FIG[i].name)} ins Riff setzen"><div class="b">${figSvg(i)}</div>${esc(FIG[i].name.split(' ').slice(-1)[0])}</button>`).join('');
  return `<div class="lager"><div class="lagerkopf"><b class="fred">Lager</b><span class="mut">${n ? `${n} ${n === 1 ? 'Stück wartet' : 'Stücke warten'} – tipp eins an, dann steht es im Riff` : 'leer'}</span></div>
    <div class="ablage-riff">${kacheln || `<div class="lagerleer">Hier landen Tiere aus Muscheln und gekaufte Deko. <button class="linkbtn" data-a="laden">Zum Riff-Laden</button></div>`}</div></div>`;
}
ANSICHT.riff = () => {
  V.nach = riffNach;
  const u = cur(), W = riffWelt(u);
  const bgId = u.riff.bg, c = RIFFHG[bgId] || RIFFHG.flach;
  const items = u.riff.items;
  const sel = V.p.sel && items.find(i => i.id === V.p.sel);
  const sand = W.rows === 1 ? [c[2], c[3]] : ZONESAND[W.rows - 1];
  const gross = W.cols * W.rows > 1;
  const sterne = bgId === 'nacht' ? `<div class="hg" style="height:${100 / W.rows}%;background-size:${100 / W.cols}% 100%;background-image:radial-gradient(circle at 18% 22%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 72% 14%,#fff 0 2px,transparent 2.5px),radial-gradient(circle at 44% 32%,#BDF 0 1.5px,transparent 2px),radial-gradient(circle at 88% 40%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 30% 8%,#fff 0 1px,transparent 1.5px)"></div>` : '';
  const leer = items.length ? '' : `<div class="riffleer" style="left:${riffLeft(0, W)};width:calc(100 * var(--u))">Dein Riff ist noch leer.<br>Tipp unten im Lager auf ein Tier oder ein Stück Deko.</div>`;
  return mitNav(`<div class="riff-seite">${kopfLeiste()}<div class="riffkopf"><h1>Mein Riff</h1><span class="sp1"></span>${gross ? `<button class="btn weiss klein" data-a="riffAlles">${RIFF.alles ? 'Zoomen' : 'Übersicht'}</button>` : ''}<button class="btn blau klein" data-a="riffWeiter">Erweitern</button><button class="btn gold klein" data-a="laden">${PERLE} Riff-Laden</button><button class="btn weiss klein" data-a="riffHg">Hintergrund</button></div>
    <div class="riffrahmen"><div class="riffwrap ${RIFF.alles ? 'alles' : ''}" id="riffwrap"><div class="riffbuehne" id="buehne" style="--cols:${W.cols};--rows:${W.rows}"><div class="hg" style="background:${riffWasser(W.rows, c)}"></div><div class="strahl"></div>${sterne}<div class="nachthaut"></div>
    ${riffZonenHtml(W)}<div class="sand" style="--sand1:${sand[0]};--sand2:${sand[1]}"></div>${items.map(i => riffItemHtml(i, W)).join('')}${leer}<div class="teile" id="teile"></div>
    ${sel ? `<div class="werkzeug" id="werkzeug" style="left:${riffLeft(clamp(riffSicht(sel).x, W.minX + 14, W.minX + W.w - 14), W)};top:${riffTop(werkzeugTop(sel))}"><button data-a="riffKlein" aria-label="Kleiner">−</button><button data-a="riffGross" aria-label="Größer">+</button><button data-a="riffSpiegel" aria-label="Spiegeln">${ico('tausch')}</button><button class="rot" data-a="riffWeg" aria-label="Zurück ins Lager">${ico('muelleimer')}</button></div>` : ''}</div></div>${riffWerkHtml(u)}</div>
    ${lagerHtml(u)}</div>`, 'fest');
};
function riffFit() {                                              // Kachel so groß wie möglich (Lager darunter bleibt sichtbar), die Welt scrollt oder zoomt auf „Übersicht“
  const w = $('#riffwrap'), b = $('#buehne'); if (!w || !b) return;
  const W = w.clientWidth, H = w.clientHeight;
  if (W < 50 || H < 50) return;
  const u = cur(), wel = riffWelt(u);
  RIFF.ratio = clamp(W / H, 1.0, 1.6);
  const bw = Math.floor(Math.min(W, H * RIFF.ratio));
  let cw = bw - 12, ch = Math.floor(bw / RIFF.ratio) - 12;         // 12 = Rand der Bühne
  const alles = RIFF.alles && wel.cols * wel.rows > 1;
  if (alles) { const s = Math.min((W - 12) / (wel.cols * cw), (H - 12) / (wel.rows * ch), 1); cw = Math.floor(cw * s); ch = Math.floor(ch * s); }
  RIFF.u = cw / 100; RIFF.v = ch / 100;
  b.style.setProperty('--u', RIFF.u + 'px'); b.style.setProperty('--v', RIFF.v + 'px');
  b.style.width = wel.cols * cw + 12 + 'px'; b.style.height = wel.rows * ch + 12 + 'px';
  if (!alles) {                                                   // gemerkte Ansicht wiederherstellen, sonst bei der Start-Kachel anfangen
    const s = RIFF.scroll && RIFF.scroll.u === u.id ? RIFF.scroll : { x: wel.e.l * 100, y: 0 };
    w.scrollLeft = s.x * RIFF.u; w.scrollTop = s.y * RIFF.v;
  }
  const sel = riffSel(), wk = $('#werkzeug');
  if (sel && wk) wk.style.top = riffTop(werkzeugTop(sel));
}
window.addEventListener('resize', () => { if (V.name === 'riff') riffFit(); });
function riffNach() {
  riffFit();
  const b = $('#buehne'), wrap = $('#riffwrap'); if (!b || !wrap) return;
  const u = cur(), W = riffWelt(u);
  wrap.addEventListener('scroll', () => { if (!RIFF.alles) RIFF.scroll = { u: u.id, x: wrap.scrollLeft / RIFF.u, y: wrap.scrollTop / RIFF.v }; }, { passive: true });
  const pos = e => { const r = b.getBoundingClientRect(); return { x: (e.clientX - r.left - 6) / RIFF.u + W.minX, y: (e.clientY - r.top - 6) / RIFF.v }; };
  let drag = null, pan = null, last = null, nachKlick = false;
  const bewege = () => {
    const p = pos(last), x = clamp(p.x - drag.dx, W.minX + 4, W.minX + W.w - 4), y = clamp(p.y - drag.dy, 22, W.h - 1);
    drag.it.x = x; drag.it.y = y;
    drag.el.style.left = riffLeft(x, W); drag.el.style.top = riffTop(y); drag.el.style.zIndex = Math.round(y * 10);
  };
  const lauf = () => {                                            // am Rand festhalten scrollt die Ansicht mit
    if (!drag || !drag.moved) return;
    const r = wrap.getBoundingClientRect();
    const sx = last.clientX < r.left + 60 ? -1 : last.clientX > r.right - 60 ? 1 : 0, sy = last.clientY < r.top + 60 ? -1 : last.clientY > r.bottom - 60 ? 1 : 0;
    if (sx || sy) { wrap.scrollLeft += sx * 12; wrap.scrollTop += sy * 12; bewege(); }
    drag.raf = requestAnimationFrame(lauf);
  };
  b.addEventListener('pointerdown', e => {
    if (e.target.closest('.werkzeug')) return;
    const el = e.target.closest('.ritem');
    if (!el) {                                                    // leeres Wasser: Touch scrollt von selbst, mit der Maus ziehen wir die Ansicht
      if (LEBEN.futterModus) { lebenFutterStreuen(pos(e)); return; }
      if (e.pointerType === 'mouse' && e.button === 0 && !RIFF.alles) { pan = { x: e.clientX, y: e.clientY, sl: wrap.scrollLeft, st: wrap.scrollTop, moved: false }; b.setPointerCapture(e.pointerId); }
      return;
    }
    const it = u.riff.items.find(i => i.id === el.dataset.id); if (!it) return;
    const p = pos(e);
    const s = riffSicht(it);
    drag = { it, el, dx: p.x - s.x, dy: p.y - s.y, moved: false, sx: e.clientX, sy: e.clientY, raf: 0 }; last = e; LEBEN.zieht = it.id;
    el.setPointerCapture(e.pointerId);
    const wk = $('#werkzeug'); if (wk) wk.style.display = 'none';
  });
  b.addEventListener('pointermove', e => {
    if (pan) {
      if (!pan.moved && Math.hypot(e.clientX - pan.x, e.clientY - pan.y) < 6) return;
      pan.moved = true; wrap.scrollLeft = pan.sl - (e.clientX - pan.x); wrap.scrollTop = pan.st - (e.clientY - pan.y);
      return;
    }
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
    last = e;
    if (!drag.moved) { drag.moved = true; lebenFalte(drag.it); drag.raf = requestAnimationFrame(lauf); }
    bewege();
  });
  const ende = () => {
    if (pan) { nachKlick = pan.moved; pan = null; return; }
    if (!drag) return;
    const d = drag; drag = null; cancelAnimationFrame(d.raf); LEBEN.zieht = null;
    if (d.moved) { sichere(); TON.spiel('tap'); }
    V.p.sel = d.it.id; render();
    if (!d.moved && d.it.kind === 'fig') lebenGruss(d.it);
  };
  b.addEventListener('pointerup', ende); b.addEventListener('pointercancel', ende);
  b.addEventListener('click', e => {                              // Klick ins leere Wasser: Auswahl aufheben (ein Scrollen mit dem Finger löst keinen Klick aus)
    if (nachKlick) { nachKlick = false; return; }
    if (!e.target.closest('.ritem, .werkzeug') && V.p.sel) { V.p.sel = null; render(); }
  });
  lebenStart();
}
AKT.riffAlles = () => { RIFF.alles = !RIFF.alles; render(); };
AKT.riffNimm = el => { const it = riffSetze(el.dataset.k, el.dataset.v); V.p.sel = it.id; TON.spiel('tap'); sichere(); render(); };
const riffSel = () => { const u = cur(); return u.riff.items.find(i => i.id === V.p.sel); };
AKT.riffKlein = () => { const it = riffSel(); if (it) { it.s = clamp(it.s - 0.15, 0.5, 2); sichere(); render(); } };
AKT.riffGross = () => { const it = riffSel(); if (it) { it.s = clamp(it.s + 0.15, 0.5, 2); sichere(); render(); } };
AKT.riffSpiegel = () => { const it = riffSel(); if (it) { it.flip = !it.flip; sichere(); render(); } };
AKT.riffWeg = () => { const u = cur(); u.riff.items = u.riff.items.filter(i => i.id !== V.p.sel); V.p.sel = null; sichere(); render(); };
AKT.riffHg = () => {
  const u = cur(), r = rangVon(u.xp).stufe;
  zeigeBlatt(`<h2>Hintergrund</h2><p class="mut" style="margin:6px 0 14px">Tiefere Welten schaltest du mit deinem Rang frei.</p><div class="lkwahl">${RIFF_BG.map(b => { const frei = r >= b.rang, c = RIFFHG[b.id]; return `<button class="wahlkarte ${u.riff.bg === b.id ? 'an' : ''}" ${frei ? `data-a="riffHgWahl" data-v="${b.id}"` : 'disabled style="opacity:.55"'}><div style="height:54px;border-radius:14px;background:linear-gradient(180deg,${c[0]},${c[1]})"></div><b>${b.name}</b><span>${frei ? 'frei' : 'ab Rang „' + RAENGE[b.rang][1] + '“'}</span></button>`; }).join('')}</div>`);
};
AKT.riffHgWahl = el => { cur().riff.bg = el.dataset.v; sichere(); schliesseBlatt(); render(); };
AKT.laden = () => {
  const u = cur();
  zeigeBlatt(`<h2>Riff-Laden</h2><p class="zeile" style="margin:6px 0 12px"><span class="chip">${PERLE} <b class="zahl">${nf(u.perlen)}</b></span><span class="mut">Perlen verdienst du beim Lernen. Gekauftes kannst du gleich aufstellen oder im Lager aufheben.</span><button class="btn blau klein" data-a="riffWeiter">Mehr Platz im Riff</button></p>
    <div class="laden">${Object.values(DEKO).sort((a, b) => a.preis - b.preis).map(d => { const frei = dekoFrei(u, d.id); return `<div class="ladenkachel"><div class="b">${dekoSvg(d.id)}</div>${esc(d.name)}${beliebtHtml(d.id)}${u.deko[d.id] ? `<div class="mut" style="font:500 13px Inter">im Besitz: ${u.deko[d.id]}</div>` : ''}<button class="btn gold klein" data-a="kaufen" data-v="${d.id}" ${u.perlen >= d.preis ? '' : 'disabled'}>${PERLE} ${d.preis}</button>${frei > 0 ? `<button class="btn gruen klein" data-a="dekoAufstellen" data-v="${d.id}">Aufstellen (${frei})</button>` : ''}</div>`; }).join('')}</div>`, { breit: 900 });
};
const RICHTUNG = { l: ['←', 'Nach links'], r: ['→', 'Nach rechts'], d: ['↓', 'In die Tiefe'] };
AKT.riffWeiter = () => {
  const u = cur(), W = riffWelt(u);
  const karte = [];
  for (let r = 0; r < 4; r++) for (let c = -2; c <= 2; c++) {
    const da = c >= -W.e.l && c <= W.e.r && r < W.rows;
    karte.push(`<div class="kz ${da ? 'da' : ''} ${c === 0 && r === 0 ? 'start' : ''}" style="${da ? `background:${ZONEKARTE[r]}` : ''}" title="${esc(RAR[r].zone)}"></div>`);
  }
  const grund = p => p.grund === 'max' ? 'Größer geht es nicht.' : p.grund === 'zone' ? `Erst ab ${RAR[p.zone].tiefe} m Tauchtiefe (${RAR[p.zone].zone}).` : p.grund === 'perlen' ? `Dir fehlen noch ${p.fehlt} Perlen.` : 'Ein ganzer Bildschirm mehr Platz.';
  const knoepfe = ['l', 'r', 'd'].map(k => {
    const p = riffErweiterbar(u, k);
    return `<div class="ladenkachel"><b class="fred" style="font-size:20px">${RICHTUNG[k][0]} ${RICHTUNG[k][1]}</b><span class="mut" style="font:500 13px Inter;min-height:36px">${grund(p)}</span>${p.grund === 'max' ? '' : `<button class="btn gold klein" data-a="riffKaufen" data-v="${k}" ${p.ok ? '' : 'disabled'}>${PERLE} ${p.preis}</button>`}</div>`;
  }).join('');
  zeigeBlatt(`<h2>Riff erweitern</h2><p class="zeile" style="margin:6px 0 4px"><span class="chip">${PERLE} <b class="zahl">${nf(u.perlen)}</b></span><span class="mut">Dein Riff ist ${W.cols} × ${W.rows} Bildschirm${W.cols * W.rows === 1 ? '' : 'e'} groß. Jede Erweiterung bringt eine ganze Spalte oder Reihe dazu und wird teurer als die vorige.</span></p>
    <div class="kzraster">${karte.join('')}</div><div class="laden">${knoepfe}</div>
    <p class="mut" style="margin-top:10px;font-size:14px">Nach unten wird das Wasser tiefer: Dort wartet die nächste Zone, sobald du sie beim Lernen erreicht hast. Die Dinge in deinem Riff bleiben, wo sie sind.</p>`, { breit: 640 });
};
AKT.riffKaufen = el => {
  const u = cur(), k = el.dataset.v;
  if (riffErweitern(u, k)) { if (k === 'l') RIFF.scroll = null; TON.spiel('kauf'); toast('Dein Riff ist größer geworden!', 'haken', 3200); AKT.riffWeiter(); if (V.name === 'riff') render(); }
};
AKT.kaufen = el => {
  const u = cur(), id = el.dataset.v;
  if (dekoKaufen(u, id)) { TON.spiel('kauf'); toast(`${DEKO[id].name} gekauft. Gleich aufstellen oder im Lager unten finden.`, 'haken', 3200); AKT.laden(); render(); }
};
AKT.dekoAufstellen = el => {
  const u = cur(), id = el.dataset.v;
  if (dekoFrei(u, id) < 1) return;
  const it = riffSetze('deko', id); V.p.sel = it.id; sichere(); TON.spiel('tap');
  schliesseBlatt();
  if (V.name !== 'riff') gehe('riff', { sel: it.id }); else render();
};
