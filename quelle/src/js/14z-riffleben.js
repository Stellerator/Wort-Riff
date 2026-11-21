'use strict';
// ---------- Lebendiges Riff ----------
// Freunde schwimmen von selbst durchs Riff (ihr Heimatplatz ist dort, wo du sie hingestellt hast), besuchen ihre Lieblings-Gegenstände (LIEBLING in 06-katalog),
// freuen sich dort, schlafen nachts, fressen gestreutes Futter und plaudern beim Antippen (auch mit Wörtern, die du schon kannst).
// Blasensäulen, Seegras & Co. sind animiert, Tag und Nacht wechseln. Alles hier ist nur Darstellung: gespeichert werden nur u.riff.leben (an/aus)
// und u.riff.zeit (auto/tag/nacht), die Positionen der Stücke bleiben die Heimatplätze. Die Bewegung läuft als Versatz (ox, oy) um den Heimatplatz.
const BEWEGUNG = {                                                // Art → Bewegungsart, Tempo (Einheiten je Sekunde, 1 Einheit = 1 % einer Kachel), Streifraum
  hai: { typ: 'schwimmer', v: 9, r: 28 }, orca: { typ: 'schwimmer', v: 8, r: 30 }, delfin: { typ: 'schwimmer', v: 12, r: 36 }, manta: { typ: 'gleiter', v: 10, r: 42 },
  schildkroete: { typ: 'schwimmer', v: 5, r: 24 }, seepferd: { typ: 'schweber', v: 5, r: 14 }, qualle: { typ: 'treiber', v: 5, r: 18 }, oktopus: { typ: 'krabbler', v: 7, r: 22 },
  kugel: { typ: 'schwimmer', v: 6, r: 20 }, clown: { typ: 'schwimmer', v: 11, r: 18 }, angler: { typ: 'schwimmer', v: 5, r: 20 }, krebs: { typ: 'krabbler', v: 11, r: 24 },
  narwal: { typ: 'schwimmer', v: 8, r: 30 }, seestern: { typ: 'krabbler', v: 2.4, r: 9 }, wal: { typ: 'schwimmer', v: 6, r: 32 }, seehund: { typ: 'schwimmer', v: 8, r: 24 }
};
const FREUDE_ANIM = {                                             // Art → Freuden-Bewegungen (CSS .fx.f-…)
  delfin: ['sprung', 'dreh'], orca: ['sprung', 'wippen'], narwal: ['sprung', 'wippen'], hai: ['wippen', 'dreh'], clown: ['wippen', 'dreh'], kugel: ['puls', 'wippen'], manta: ['wippen'],
  wal: ['wippen'], seehund: ['hopser', 'wippen'], schildkroete: ['wackeln'], seepferd: ['wippen'], qualle: ['puls'], oktopus: ['dreh', 'wackeln'], krebs: ['hopser'], seestern: ['dreh'], angler: ['puls', 'wackeln']
};
const ART_PL = { hai: 'Haie', orca: 'Orcas', delfin: 'Delfine', manta: 'Mantas', schildkroete: 'Schildkröten', seepferd: 'Seepferdchen', qualle: 'Quallen', oktopus: 'Kraken', kugel: 'Kugelfische', clown: 'Clownfische', angler: 'Anglerfische', krebs: 'Krebse', narwal: 'Narwale', seestern: 'Seesterne', wal: 'Wale', seehund: 'Robben' };
const EMITTER = { blasen: [0.55, 'blase', 58], helm: [0.22, 'blase', 42], truhe: [0.1, 'stern', 22], muschel: [0.1, 'stern', 20], amphore: [0.1, 'blase', 36], kelp: [0.14, 'blase', 48], wrack: [0.18, 'blase', 46], hoehle: [0.07, 'blase', 30], seegras: [0.06, 'blase', 26] };   // Deko → [Blasen je Sekunde, Art, Steighöhe in Einheiten]
const TEIL = {
  herz: '<svg viewBox="0 0 24 24"><path d="M12 21C4 15.500 3 10 3 8.500A4.800 4.800 0 0112 6.500 4.800 4.800 0 0121 8.500C21 10 20 15.500 12 21z" fill="#FF6B8A" stroke="#14253F" stroke-width="2" stroke-linejoin="round"/></svg>',
  stern: '<svg viewBox="0 0 24 24"><path d="M12 2.500l2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z" fill="#FFC83D" stroke="#14253F" stroke-width="2" stroke-linejoin="round"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M9 17.500V5.500l11-2v11" fill="none" stroke="#14253F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 17.500V5.500l11-2v11" fill="none" stroke="#FF9A2B" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.500" cy="17.500" r="3.500" fill="#FF9A2B" stroke="#14253F" stroke-width="2"/><circle cx="17.500" cy="14.500" r="3.500" fill="#FF9A2B" stroke="#14253F" stroke-width="2"/></svg>',
  zzz: '<b>Z</b>', blase: '', mampf: '<b>mampf!</b>', ring: '', leucht: '', sand: '',
  glitzer: '<svg viewBox="0 0 24 24"><path d="M12 1Q13.600 10.400 23 12Q13.600 13.600 12 23Q10.400 13.600 1 12Q10.400 10.400 12 1Z" fill="#FFFFFF"/></svg>'
};
const LEBEN = { ag: new Map(), el: new Map(), emit: new Map(), futter: [], futterModus: false, raf: 0, zeit: 0, letzt: 0, nacht: false, nachtZeit: -99, wohl: [], wohlZeit: -99, rede: null, tonBis: 0, zieht: null, ambient: 0 };

const lebenAn = u => (u.riff.leben !== undefined ? !!u.riff.leben : !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
const lebenBeweglich = it => it.kind === 'fig' || (it.kind === 'myth' && !!MYTH[it.ref] && MYTH[it.ref].wesen);   // wer im Riff umherschwimmt: Freunde und mythische Fabelwesen
mythIds().forEach(i => { const m = MYTH[i]; if (m.wesen) { BEWEGUNG['m_' + i] = m.bew; FREUDE_ANIM['m_' + i] = m.freude; m.emit = m.emit || [0.2, 'stern', 22]; } });
const lebenNachtJetzt = u => { const z = u.riff.zeit || 'auto'; if (z === 'nacht') return true; if (z === 'tag') return false; const h = window.__stunde != null ? window.__stunde : new Date().getHours(); return h >= 20 || h < 6; };
const riffSicht = it => { const a = LEBEN.ag.get(it.id); return a ? { x: it.x + a.ox, y: it.y + a.oy } : { x: it.x, y: it.y }; };   // wo das Stück gerade zu sehen ist
const riffGrenzen = W => ({ x0: W.minX + 8, x1: W.minX + W.w - 8, y0: 30, y1: W.h - 3 });
const riffTransform = a => `translate3d(${(a.ox * RIFF.u).toFixed(1)}px,${(a.oy * RIFF.v).toFixed(1)}px,0) rotate(${a.tilt.toFixed(1)}deg)`;

function lieblingHtml(figId) {                                     // „Mag am liebsten …“ für das Album
  const u = cur(), mag = lieblingVon(figId);
  if (!mag.length) return '';
  return `<p class="mut" style="font-size:14px;margin:0 0 8px">${ico('stern', 'klein')} Mag am liebsten: <b>${mag.map(d => esc(DEKO[d].name)).join('</b>, <b>')}</b>${u && u.riff.items.some(i => i.kind === 'fig' && i.ref === figId) && riffWohl(u).some(w => w.fig.ref === figId) ? ' · <span style="color:var(--gruenD)">fühlt sich im Riff wohl</span>' : ''}</p>`;
}
function beliebtHtml(dekoId) {                                      // „Beliebt bei …“ für den Riff-Laden
  const u = cur(), wer = lieblingBei(dekoId);
  const meine = wer.filter(i => u.owned[i]).map(i => FIG[i].name.split(' ').slice(-1)[0]);
  const arten = Array.from(new Set(wer.map(i => ART_PL[FIG[i].art]))).slice(0, 2);
  if (!meine.length && !arten.length) return '';
  return `<div class="beliebt">${meine.length ? `<span class="chip klein gold">${ico('stern', 'klein')} ${esc(meine.slice(0, 3).join(', '))}</span>` : `<span class="mut">Beliebt bei ${esc(arten.join(' und '))}</span>`}</div>`;
}

// ---------- Teilchen: Blasen, Herzen, Sterne, Zzz ----------
function lebenSichtbar(p, rand_) {                                  // liegt der Punkt (Welt-Einheiten) im sichtbaren Ausschnitt?
  const w = $('#riffwrap'), b = $('#buehne'); if (!w || !b) return false;
  const W = riffWelt(cur()), br = b.getBoundingClientRect(), wr = w.getBoundingClientRect(), m = rand_ || 40;
  const x = br.left + 6 + (p.x - W.minX) * RIFF.u, y = br.top + 6 + p.y * RIFF.v;
  return x > wr.left - m && x < wr.right + m && y > wr.top - m && y < wr.bottom + m;
}
function lebenTeil(typ, x, y, o) {
  const c = $('#teile'); if (!c || c.childElementCount > 70) return null;
  o = o || {};
  const W = riffWelt(cur()), d = document.createElement('div');
  d.className = 'teil t-' + typ;
  d.style.left = riffLeft(x, W); d.style.top = riffTop(y);
  d.style.setProperty('--steig', -((o.hoch || 16) * RIFF.v).toFixed(0) + 'px');
  d.style.setProperty('--w', (o.w != null ? o.w : 6).toFixed(1) + 'px');
  d.style.setProperty('--dauer', (o.dauer || (typ === 'blase' ? 3.4 : 1.9)).toFixed(2) + 's');
  if (o.gross) d.style.setProperty('--g', o.gross.toFixed(2));
  d.innerHTML = TEIL[typ] || '';
  d.addEventListener('animationend', () => d.remove());
  c.appendChild(d);
  return d;
}
function lebenTon(name, p) {
  if (LEBEN.zeit < LEBEN.tonBis || !lebenSichtbar(p, 0)) return;
  TON.spiel(name); LEBEN.tonBis = LEBEN.zeit + 2.4;
}

// ---------- Freude ----------
function lebenFreude(a, it, grund) {
  a.wachBis = LEBEN.zeit + 2.2;                                      // ein angetippter Schläfer macht kurz die Augen auf
  if (grund === 'versteck') { const e0 = lebenEl(it.id); if (e0) { const fx = e0.querySelector('.fx'); if (fx) { fx.className = 'fx'; void fx.offsetWidth; fx.className = 'fx f-wippen'; } } return; }
  if (a.spielDeko) lebenDekoSpiel(a.spielDeko);
  const el = lebenEl(it.id);
  if (el) { const fx = el.querySelector('.fx'); if (fx) { fx.className = 'fx'; void fx.offsetWidth; fx.className = 'fx f-' + pick(FREUDE_ANIM[a.art] || ['wippen']); } }
  const p = riffSicht(it), kopf = p.y - riffBasis(it) * RIFF.ratio * 0.95;
  lebenTeil(pick(['herz', 'herz', 'stern', 'note']), p.x + (rand() - 0.5) * 6, kopf, { hoch: 16 + rand() * 8, w: (rand() - 0.5) * 16 });
  if (rand() < 0.55) lebenTeil(pick(['herz', 'stern']), p.x + (rand() - 0.5) * 12, kopf + 3, { hoch: 14 + rand() * 8, w: (rand() - 0.5) * 20 });
  lebenTon('freude', p);
  if (a.staunen) { const m = cur().riff.items.find(i => i.id === a.staunen); if (m) lebenTeil('glitzer', m.x + (rand() - 0.5) * 8, m.y - riffBasis(m) * RIFF.ratio * 0.55, { hoch: 12, w: (rand() - 0.5) * 10, dauer: 1.8, gross: 0.6 }); }
}
function lebenDekoSpiel(id) {                                        // Ball hüpft, Reifen schwingt, solange ein Freund damit spielt
  const el = document.querySelector('.ritem[data-id="' + id + '"] .dr');
  if (el && !el.classList.contains('spiel')) { el.classList.add('spiel'); setTimeout(() => el.classList.remove('spiel'), 2100); }
}
function lebenLocken(p) {                                           // Tipp ins freie Wasser: Ringwelle, die drei nächsten Freunde schauen vorbei
  const u = cur(), k = RIFF.v / RIFF.u, G = riffGrenzen(riffWelt(u)), liste = [];
  lebenTeil('ring', p.x, p.y, { dauer: 1.3 });
  u.riff.items.forEach(it => {
    if (!lebenBeweglich(it)) return;
    const a = LEBEN.ag.get(it.id); if (!a || a.modus === 'schlafen') return;
    const q = riffSicht(it); liste.push({ it, a, d: Math.hypot(q.x - p.x, (q.y - p.y) * k) });
  });
  liste.sort((x, y) => x.d - y.d).slice(0, 3).forEach(({ a, d }) => {
    if (d > 90) return;
    a.ziel = lebenKlemme({ x: p.x + (rand() - 0.5) * 12, y: p.y + (rand() - 0.5) * 6 }, G);
    a.modus = 'gehe'; a.danach = 'verweilen'; a.spielDeko = null; a.staunen = null; a.gehen = false; a.partner = null; a.tempoF = 1; a.hinterZ = null;
  });
  lebenTon('blubb', p);
}


// ---------- Ziele ----------
function lebenLieblingsziel(it, u, p, reichweite) {                  // nächster aufgestellter Lieblings-Gegenstand (Lieblingsplatz zählt etwas mehr)
  const mag = lieblingVon(it.ref), k = RIFF.v / RIFF.u;
  let best = null, bd = 1e9;
  u.riff.items.forEach(d => {
    if (d.kind !== 'deko') return;
    const rang = mag.indexOf(d.ref); if (rang < 0) return;
    const dist = Math.hypot(d.x - p.x, (d.y - p.y) * k) + rang * 14 + rand() * 12;
    if (dist < bd && dist < reichweite) { bd = dist; best = d; }
  });
  return best;
}
function lebenFutterNah(p, r) {
  const k = RIFF.v / RIFF.u; let best = null, bd = r;
  LEBEN.futter.forEach(f => { const d = Math.hypot(f.x - p.x, (f.y - p.y) * k); if (d < bd) { bd = d; best = f; } });
  return best;
}
const lebenKlemme = (z, G) => ({ x: clamp(z.x, G.x0, G.x1), y: clamp(z.y, G.y0, G.y1) });
function lebenWaehle(a, it, u, G, nacht) {
  const t = LEBEN.zeit, p = riffSicht(it), k = RIFF.v / RIFF.u, b = a.b, boden = b.typ === 'krabbler';
  a.spielDeko = null; a.staunen = null; a.partner = null; a.gehen = false; a.tempoF = 1; a.hinterZ = null;
  if (nacht) {                                                     // Nachts schlafen alle, am liebsten bei ihrem Lieblingsplatz
    const d = lebenLieblingsziel(it, u, p, 130);
    a.ziel = lebenKlemme(d ? { x: d.x + (rand() < 0.5 ? -1 : 1) * (7 + rand() * 7), y: d.y + 1 } : { x: it.x, y: it.y }, G);
    a.modus = 'gehe'; a.danach = 'schlafen'; return;
  }
  const f = lebenFutterNah(p, 95);
  if (f && t > a.fressenBis) { a.ziel = lebenKlemme({ x: f.x, y: f.y }, G); a.modus = 'gehe'; a.danach = 'fressen'; a.futter = f; return; }
  const wohl = LEBEN.wohl.some(w => w.fig === it), r = rand();
  const d = lebenLieblingsziel(it, u, p, 400);
  if (d && r < (wohl ? 0.14 : 0.4)) { a.ziel = lebenKlemme({ x: d.x + (rand() < 0.5 ? -1 : 1) * (6 + rand() * 9), y: d.y + 1 + rand() * 2 }, G); a.modus = 'gehe'; a.danach = 'verweilen'; return; }
  if (lebenAktivitaet(a, it, u, G, p)) return;
  if (wohl && r < 0.8) { a.modus = 'verweilen'; a.bis = t + 6 + rand() * 8; a.naechste = t + 0.5 + rand() * 2; a.ziel = null; return; }
  if (r < 0.74) {                                                  // in der Nähe des Heimatplatzes umherschwimmen
    a.ziel = lebenKlemme({ x: it.x + (rand() * 2 - 1) * b.r, y: boden ? it.y + (rand() * 2 - 1) * 2 : it.y + (rand() * 2 - 1) * b.r * 0.5 / k }, G);
    a.modus = 'gehe'; a.danach = 'bleiben'; return;
  }
  if (r < 0.88 && !boden) {                                        // größere Reise durchs Riff
    const w = rand() * 6.283, dist = 40 + rand() * 80;
    a.ziel = lebenKlemme({ x: it.x + Math.cos(w) * dist, y: it.y + Math.sin(w) * dist * 0.5 / k }, G);
    a.modus = 'gehe'; a.danach = 'bleiben'; return;
  }
  a.modus = 'bleiben'; a.bis = t + 1.2 + rand() * 3;
}
// ---------- Abwechslung: weitere Verhaltensweisen ----------
// Mit etwas Glück (und wenn die Umgebung passt) tut ein Freund statt Herumschwimmen etwas Besonderes:
//   spielen   – am Wasserball oder Sprungreifen (das Spielzeug hüpft/schwingt mit)
//   verstecken – Schüchterne schlüpfen hinter Höhle, Kelp, Seegras … und tauchen später wieder auf
//   staunen   – bewundert ein mythisches Stück im Riff (Glitzer)
//   buddeln   – Bodenbewohner wühlen im Sand (Sandwölkchen)
//   jagen     – Fangen spielen mit einem Nachbarn (Rollen wechseln beim Fangen)
//   folgen    – schwimmt ein Stück hinter einem anderen Freund her
// Dazu: blinzeln und strecken im Leerlauf, und ein Tipp ins Wasser lockt die nächsten Freunde an (lebenLocken).
const VERSTECKER = ['seestern', 'krebs', 'kugel', 'qualle', 'oktopus', 'angler', 'seepferd', 'schildkroete', 'clown', 'seehund'];
const VERSTECKE = ['hoehle', 'kelp', 'seegras', 'bogen', 'wrack', 'amphore', 'rotkoralle', 'faecher'];
function lebenAktivitaet(a, it, u, G, p) {
  if (rand() > 0.34) return false;
  const t = LEBEN.zeit, k = RIFF.v / RIFF.u, boden = a.b.typ === 'krabbler';
  const nah = (liste, reich) => { let best = null, bd = reich; liste.forEach(d => { const dd = Math.hypot(d.x - p.x, (d.y - p.y) * k); if (dd < bd) { bd = dd; best = d; } }); return best; };
  const dekos = u.riff.items.filter(i => i.kind === 'deko'), opts = [];
  const spiel = nah(dekos.filter(d => d.ref === 'ball' || d.ref === 'reifen'), 220); if (spiel && !boden) opts.push([3, 'spielen', spiel]);
  const versteck = nah(dekos.filter(d => VERSTECKE.indexOf(d.ref) >= 0), 200); if (versteck && VERSTECKER.indexOf(a.art) >= 0) opts.push([3, 'verstecken', versteck]);
  const myth = nah(u.riff.items.filter(i => i.kind === 'myth' && i.id !== it.id), 260); if (myth) opts.push([3, 'staunen', myth]);
  if (boden) opts.push([5, 'buddeln', null]);
  const frei = [];
  LEBEN.ag.forEach((o, id) => {
    if (id === it.id || ['schlafen', 'jagen', 'fliehen', 'folgen', 'verstecken'].indexOf(o.modus) >= 0) return;
    const oi = u.riff.items.find(i => i.id === id); if (!oi) return;
    const q = riffSicht(oi), dd = Math.hypot(q.x - p.x, (q.y - p.y) * k);
    if (dd < 110) frei.push({ o, oi, dd });
  });
  frei.sort((x, y) => x.dd - y.dd);
  if (frei.length && !boden) { opts.push([2, 'jagen', null]); opts.push([2, 'folgen', null]); }
  if (!opts.length) return false;
  let x = rand() * sum(opts.map(o => o[0])), w = opts[0];
  for (const o of opts) { if (x < o[0]) { w = o; break; } x -= o[0]; }
  const [, typ, d] = w, seite = rand() < 0.5 ? -1 : 1;
  if (typ === 'spielen') { a.ziel = lebenKlemme({ x: d.x + seite * (6 + rand() * 6), y: d.y + 1 }, G); a.modus = 'gehe'; a.danach = 'verweilen'; a.spielDeko = d.id; return true; }
  if (typ === 'staunen') { a.ziel = lebenKlemme({ x: d.x + seite * (10 + rand() * 6), y: d.y - 2 + rand() * 4 }, G); a.modus = 'gehe'; a.danach = 'verweilen'; a.staunen = d.id; return true; }
  if (typ === 'verstecken') { a.ziel = lebenKlemme({ x: d.x + (rand() - 0.5) * 3, y: d.y + 0.5 }, G); a.modus = 'gehe'; a.danach = 'verstecken'; a.hinterZ = Math.round(d.y * 10) - 1; return true; }
  if (typ === 'buddeln') { a.ziel = lebenKlemme({ x: it.x + (rand() * 2 - 1) * a.b.r, y: G.y1 - 1 }, G); a.modus = 'gehe'; a.danach = 'buddeln'; return true; }
  const n = frei[0];
  if (typ === 'jagen') {
    const bis = t + 6 + rand() * 3;
    a.modus = 'jagen'; a.partner = n.oi.id; a.bis = bis; a.gehen = true; a.tempoF = 1.7; a.fangT = t + 1.5;
    n.o.modus = 'fliehen'; n.o.partner = it.id; n.o.bis = bis; n.o.gehen = true; n.o.tempoF = 1.8; n.o.ziel = null; n.o.danach = '';
    return true;
  }
  a.modus = 'folgen'; a.partner = n.oi.id; a.bis = t + 9 + rand() * 6; a.gehen = true; a.tempoF = 1; a.off = seite * (9 + rand() * 6);
  return true;
}
function lebenAktEnde(a, it, froh) {
  const t = LEBEN.zeit, o = a.partner && LEBEN.ag.get(a.partner);
  if (o && o.partner === it.id && (o.modus === 'fliehen' || o.modus === 'jagen')) { o.modus = 'bleiben'; o.bis = t + 0.5 + rand() * 1.5; o.partner = null; o.gehen = false; o.tempoF = 1; }
  a.modus = 'bleiben'; a.bis = t + 0.6 + rand() * 1.8; a.partner = null; a.gehen = false; a.tempoF = 1; a.hinterZ = null; a.ziel = null; a.danach = '';
  if (froh) lebenFreude(a, it, 'ort');
}
function lebenAnkunft(a, it) {
  const t = LEBEN.zeit;
  if (a.danach === 'verweilen') { a.modus = 'verweilen'; a.bis = t + 7 + rand() * 8; a.naechste = t + 0.4; }
  else if (a.danach === 'verstecken') { a.modus = 'verstecken'; a.bis = t + 6 + rand() * 7; a.naechste = t + 2.5; }
  else if (a.danach === 'buddeln') { a.modus = 'buddeln'; a.bis = t + 3 + rand() * 3; a.naechste = t; }
  else if (a.danach === 'schlafen') { a.modus = 'schlafen'; a.bis = 1e9; a.naechste = t + 0.8; }
  else if (a.danach === 'fressen') { lebenFressen(a, it); a.modus = 'bleiben'; a.bis = t + 0.5; }
  else { a.modus = 'bleiben'; a.bis = t + 0.8 + rand() * 3; }
  a.danach = '';
}
function lebenFressen(a, it) {
  const i = LEBEN.futter.indexOf(a.futter);
  if (i >= 0) { const f = LEBEN.futter.splice(i, 1)[0]; if (f.el) f.el.remove(); const p = riffSicht(it); lebenTeil('mampf', p.x, p.y - riffBasis(it) * RIFF.ratio * 0.8, { hoch: 10, dauer: 1.2 }); lebenTon('blubb', p); if (rand() < 0.5) lebenFreude(a, it, 'futter'); }
  a.fressenBis = LEBEN.zeit + 0.4; a.futter = null;
}

// ---------- ein Schritt für einen Freund ----------
function lebenTempo(a) {
  const t = LEBEN.zeit, v = a.b.v;
  switch (a.b.typ) {
    case 'treiber': return v * (0.15 + 0.85 * Math.max(0, Math.sin(t * 2.2 + a.ph)));
    case 'krabbler': return v * (Math.sin(t * 2.6 + a.ph) > -0.2 ? 1 : 0.08);
    case 'gleiter': return v * (0.8 + 0.2 * Math.sin(t * 0.7 + a.ph));
    default: return v * (0.85 + 0.15 * Math.sin(t * 1.3 + a.ph));
  }
}
function lebenSchritt(a, it, u, dt, G, nacht, k, sel) {
  const t = LEBEN.zeit, b = a.b;
  if (sel === it.id || LEBEN.zieht === it.id) { a.vx *= 0.5; a.vy *= 0.5; a.tilt *= 0.8; return; }                 // angefasst oder ausgewählt: bleibt stehen
  if (nacht && a.modus !== 'schlafen' && !(a.modus === 'gehe' && a.danach === 'schlafen')) lebenWaehle(a, it, u, G, true);
  if (!nacht && (a.modus === 'schlafen' || a.danach === 'schlafen')) { a.modus = 'bleiben'; a.danach = ''; a.bis = t + rand() * 2; }
  if (a.modus === 'bleiben') { if (t >= a.bis) lebenWaehle(a, it, u, G, nacht); }
  else if (a.modus === 'verweilen') {
    if (t >= a.bis) lebenWaehle(a, it, u, G, nacht);
    else if (t >= a.naechste) { lebenFreude(a, it, 'ort'); a.naechste = t + 3 + rand() * 3; }
  } else if (a.modus === 'schlafen') {
    if (t >= a.naechste) { const p = riffSicht(it); if (lebenSichtbar(p)) lebenTeil('zzz', p.x + 3, p.y - riffBasis(it) * RIFF.ratio * 0.9, { hoch: 14, w: 5, dauer: 2.4 }); a.naechste = t + 3.2; }
  } else if (a.modus === 'verstecken') {                                           // hinter Deko versteckt, lugt ab und zu hervor
    if (t >= a.bis) lebenAktEnde(a, it, true);
    else if (t >= a.naechste) { lebenFreude(a, it, 'versteck'); a.naechste = t + 2.6 + rand() * 2; }
  } else if (a.modus === 'buddeln') {                                              // wühlt im Sand
    if (t >= a.bis) { const p = riffSicht(it); if (rand() < 0.35) { for (let i = 0; i < 3; i++) lebenTeil('glitzer', p.x + (rand() - 0.5) * 8, p.y - 2, { hoch: 10 + rand() * 6, w: (rand() - 0.5) * 12, dauer: 1.6, gross: 0.7 }); lebenTon('perle', p); } lebenAktEnde(a, it, true); }
    else if (t >= a.naechste) { const p = riffSicht(it); lebenTeil('sand', p.x + (rand() - 0.5) * 6, p.y - 0.5, { w: (rand() - 0.5) * 12, dauer: 1 }); const e0 = lebenEl(it.id); if (e0) { const fx = e0.querySelector('.fx'); if (fx && !/ f-/.test(fx.className)) { fx.className = 'fx f-wackeln'; } } a.naechste = t + 0.45; }
  } else if (a.modus === 'jagen' || a.modus === 'fliehen' || a.modus === 'folgen') {   // Fangen spielen / hinterherschwimmen
    const o = a.partner && LEBEN.ag.get(a.partner), oi = o && u.riff.items.find(i => i.id === a.partner);
    if (!o || !oi || t >= a.bis) lebenAktEnde(a, it, a.modus !== 'fliehen');
    else {
      const p = riffSicht(it), q = riffSicht(oi);
      if (a.modus === 'jagen') {
        a.ziel = lebenKlemme({ x: q.x, y: q.y }, G);
        if (Math.hypot(q.x - p.x, (q.y - p.y) * k) < 7 && t >= a.fangT) {                  // gefangen: Rollen tauschen
          a.fangT = t + 1.6; a.modus = 'fliehen'; o.modus = 'jagen'; o.fangT = t + 1.6; a.tempoF = 1.8; o.tempoF = 1.7;
          lebenFreude(a, it, 'ort'); lebenFreude(o, oi, 'ort'); lebenTeil('herz', (p.x + q.x) / 2, Math.min(p.y, q.y) - 6, { hoch: 14, dauer: 1.6 });
        }
      } else if (a.modus === 'fliehen') {
        const dx = p.x - q.x, dy = (p.y - q.y) * k, dd = Math.hypot(dx, dy) || 1;
        a.ziel = lebenKlemme({ x: p.x + dx / dd * 34, y: p.y + dy / dd * 34 / k }, G);
      } else {
        a.ziel = lebenKlemme({ x: q.x - (Math.sign(o.vx) || 1) * 10 + a.off * 0.4, y: q.y + (a.off > 0 ? 3 : -3) }, G);
      }
      a.gehen = true;
    }
  }
  // Ziel verfolgen
  let wx = 0, wy = 0;
  if ((a.modus === 'gehe' || a.gehen) && a.ziel) {
    if (a.danach === 'fressen') { if (!a.futter || LEBEN.futter.indexOf(a.futter) < 0) { a.modus = 'bleiben'; a.danach = ''; a.bis = t + 0.2; a.futter = null; } else a.ziel = lebenKlemme({ x: a.futter.x, y: a.futter.y }, G); }
    const p = riffSicht(it), dx = a.ziel.x - p.x, dy = (a.ziel.y - p.y) * k, d = Math.hypot(dx, dy);
    if (a.modus === 'gehe') {
      if (d < 2.4) lebenAnkunft(a, it);
      else { const sp = lebenTempo(a) * Math.min(1, d / 9 + 0.35); wx = dx / d * sp; wy = dy / d * sp / k; }
    } else if (d > 1.5) { const sp = lebenTempo(a) * (a.tempoF || 1) * Math.min(1, d / 9 + 0.35); wx = dx / d * sp; wy = dy / d * sp / k; }
  }
  const glatt = 1 - Math.exp(-dt * 2.6);
  a.vx += (wx - a.vx) * glatt; a.vy += (wy - a.vy) * glatt;
  a.ox += a.vx * dt; a.oy += a.vy * dt;
  if (b.typ === 'krabbler') a.oy = clamp(a.oy, -3, 3);
  const nx = clamp(it.x + a.ox, G.x0, G.x1), ny = clamp(it.y + a.oy, G.y0, G.y1);
  a.ox = nx - it.x; a.oy = ny - it.y;
  const neigung = (b.typ === 'krabbler' || b.typ === 'schweber') ? 0 : clamp(a.vx * 1.4, -12, 12) + (b.typ === 'gleiter' ? clamp(a.vy * 0.8, -6, 6) : 0);
  a.tilt += (neigung - a.tilt) * (1 - Math.exp(-dt * 6));
}
function lebenAnwenden(a, it, el) {
  const schlaf = a.modus === 'schlafen' && LEBEN.zeit >= (a.wachBis || 0);            // Schlafende schließen die Augen (CSS .schlaf zeigt die Lidbögen)
  if (a.sc !== schlaf || a.tx === '') {
    a.sc = schlaf;
    const fx = el.querySelector('.fx');
    if (fx) { if (schlaf) fx.className = 'fx schlaf'; else if (fx.classList.contains('schlaf')) fx.classList.remove('schlaf'); }
  }
  if (!schlaf && a.modus !== 'verstecken') {                                           // Leerlauf: blinzeln (manchmal doppelt), ab und zu strecken
    if (a.blinkT == null) a.blinkT = LEBEN.zeit + 1 + rand() * 5;
    if (LEBEN.zeit >= a.blinkT) {
      const fx = el.querySelector('.fx');
      if (fx && !/ f-/.test(fx.className)) {
        if (rand() < 0.1) { fx.className = 'fx f-strecken'; a.blinkT = LEBEN.zeit + 5 + rand() * 5; }
        else { fx.classList.add('blink'); a.blinkEnde = LEBEN.zeit + 0.16; a.blinkT = LEBEN.zeit + (rand() < 0.2 ? 0.4 : 2 + rand() * 5); }
      } else a.blinkT = LEBEN.zeit + 1;
    }
    if (a.blinkEnde && LEBEN.zeit >= a.blinkEnde) { a.blinkEnde = 0; const fx = el.querySelector('.fx'); if (fx) fx.classList.remove('blink'); }
  }
  const hop = a.b.typ === 'krabbler' && Math.abs(a.vx) > 0.8 ? Math.abs(Math.sin(LEBEN.zeit * 11)) * -3 : 0;
  const neu = `translate3d(${(a.ox * RIFF.u).toFixed(1)}px,${(a.oy * RIFF.v + hop).toFixed(1)}px,0) rotate(${a.tilt.toFixed(1)}deg)`;
  if (a.tx !== neu) { el.style.transform = neu; a.tx = neu; }
}

// ---------- Agenten, Elemente ----------
function lebenAgent(it) {
  let a = LEBEN.ag.get(it.id);
  if (!a) {
    const art = it.kind === 'myth' ? 'm_' + it.ref : FIG[it.ref].art;
    a = { id: it.id, ref: it.ref, art, b: BEWEGUNG[art] || BEWEGUNG.hai, ox: 0, oy: 0, vx: 0, vy: 0, tilt: 0, modus: 'bleiben', bis: LEBEN.zeit + 0.3 + rand() * 2.2, ziel: null, danach: '', ph: rand() * 6.283, naechste: 0, fressenBis: 0, futter: null, z: 0, tx: '' };
    LEBEN.ag.set(it.id, a);
  }
  return a;
}
function lebenEl(id) {
  let el = LEBEN.el.get(id);
  if (!el || !el.isConnected) { const b = $('#buehne'); el = b ? b.querySelector(`.ritem[data-id="${id}"] .swim`) : null; if (el) LEBEN.el.set(id, el); else LEBEN.el.delete(id); }
  return el;
}
function lebenFalte(it) {                                           // beim Ziehen: den Versatz in den Heimatplatz übernehmen, damit nichts springt
  const a = LEBEN.ag.get(it.id); if (!a) return;
  const W = riffWelt(cur());
  it.x = clamp(it.x + a.ox, W.minX + 4, W.minX + W.w - 4); it.y = clamp(it.y + a.oy, 22, W.h - 1);
  a.ox = a.oy = a.vx = a.vy = 0; a.tilt = 0; a.tx = '';
  const el = lebenEl(it.id);
  if (el) { el.style.transform = 'none'; const ri = el.parentNode; ri.style.left = riffLeft(it.x, W); ri.style.top = riffTop(it.y); ri.style.zIndex = Math.round(it.y * 10); }
}

// ---------- Futter ----------
function lebenFutterStreuen(p) {
  const c = $('#teile'); if (!c) return;
  for (let i = 0; i < 6; i++) {
    const el = document.createElement('div'); el.className = 'flocke'; c.appendChild(el);
    LEBEN.futter.push({ x: p.x + (rand() - 0.5) * 12, y: p.y - rand() * 6, vy: 5 + rand() * 4, bis: LEBEN.zeit + 18, el });
  }
  lebenTeil('ring', p.x, p.y, { dauer: 1.3 });
  const u = cur(); u.stats.futter = (u.stats.futter || 0) + 1;
  pruefeAbzeichen(u).forEach(b => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200));
  sichere(); TON.spiel('blubb');
}
function lebenFutterSchritt(dt, G) {
  for (let i = LEBEN.futter.length - 1; i >= 0; i--) {
    const f = LEBEN.futter[i];
    if (LEBEN.zeit > f.bis) { if (f.el) f.el.remove(); LEBEN.futter.splice(i, 1); continue; }
    f.y = Math.min(G.y1 - 4, f.y + f.vy * dt);
    if (f.el && f.el.isConnected) { const W = riffWelt(cur()); f.el.style.left = riffLeft(f.x, W); f.el.style.top = riffTop(f.y); }
  }
}

// ---------- Sprechblase ----------
function lebenWort(u) {                                             // ein gelerntes Wort aus den Karten (Box ≥ 2)
  const cids = Object.keys(u.cards).filter(c => (u.cards[c].b || 0) >= 2);
  for (let i = 0; i < 12 && cids.length; i++) {
    const t = karteText(cids[Math.floor(rand() * cids.length)]);
    if (t && t.fremd && t.de) return { text: `${plain(t.fremd)} = ${plain(t.de)}`, sprechen: t.sprechen, tts: t.tts };
  }
  return null;
}
function lebenGruss(it) {
  const u = cur(), a = lebenAgent(it);
  if (LEBEN.fz && LEBEN.fz.id === it.id) { frageStart(it.id); return; }          // der Freund mit dem „?“ fragt eine Vokabel
  if (it.kind === 'myth') {                                          // Fabelwesen: erzählt etwas Mystisches
    const m = MYTH[it.ref];
    LEBEN.rede = { id: it.id, text: pick([m.text, m.name + ' leuchtet für dich.', 'Das Meer erzählt Geschichten.', 'Mystisch, nicht wahr?']), bis: LEBEN.zeit + 6 };
    lebenFreude(a, it, 'tipp'); lebenRedeZeigen(); return;
  }
  let text = null, wort = null;
  const w = riffWohl(u).find(x => x.fig === it);
  if (w) text = `${DEKO[w.deko.ref].name}! Hier fühle ich mich wohl.`;
  else {
    wort = lebenWort(u);
    if (wort && rand() < 0.65) text = wort.text;
    else {
      wort = null;
      const fehlt = lieblingVon(it.ref).find(d => !u.riff.items.some(i => i.kind === 'deko' && i.ref === d));
      text = fehlt ? `Ich mag ${DEKO[fehlt].name}. Hast du eins für mich?` : pick(['Blubb! Schön hier!', 'Hier lässt es sich aushalten.', 'Tauchen wir bald wieder zusammen?']);
    }
  }
  LEBEN.rede = { id: it.id, text, bis: LEBEN.zeit + 5 };
  lebenFreude(a, it, 'tipp');
  if (wort && wort.sprechen && u.set.sprechen === 'auto' && SPRECHEN.ok) SPRECHEN.sag(wort.sprechen, wort.tts);
  lebenRedeZeigen();
}
function lebenRedeZeigen() {
  const r = LEBEN.rede, b = $('#buehne');
  let el = $('#rede');
  if (!b || !r || LEBEN.zeit > r.bis) { if (el) el.remove(); LEBEN.rede = null; return; }
  const u = cur(), it = u.riff.items.find(i => i.id === r.id);
  if (!it) { if (el) el.remove(); LEBEN.rede = null; return; }
  const W = riffWelt(u), p = riffSicht(it), oben = p.y - riffBasis(it) * RIFF.ratio * 1.0;
  if (!el) { el = document.createElement('div'); el.id = 'rede'; el.className = 'rede'; b.appendChild(el); }
  if (el.dataset.t !== r.text) { el.textContent = r.text; el.dataset.t = r.text; }
  el.style.left = riffLeft(clamp(p.x, W.minX + 26, W.minX + W.w - 26), W); el.style.top = riffTop(Math.max(oben, 10));
}

// ---------- Blasensäulen & Co. ----------
function lebenEmitter(u, dt) {
  u.riff.items.forEach(it => {
    if (it.kind !== 'deko' && it.kind !== 'myth') return;
    const e = it.kind === 'deko' ? EMITTER[it.ref] : MYTH[it.ref].emit; if (!e) return;
    let st = LEBEN.emit.get(it.id); if (!st) { st = { n: rand() * 2 }; LEBEN.emit.set(it.id, st); }
    st.n -= dt;
    if (st.n > 0) return;
    st.n = (0.5 + rand()) / (e[0] * (it.kind === 'myth' && LEBEN.nacht ? 1.8 : 1));          // Mythen funkeln nachts mehr
    const pe = riffSicht(it);
    if (!lebenSichtbar(pe)) return;
    lebenTeil(e[1], pe.x + (rand() - 0.5) * 4, pe.y - riffBasis(it) * RIFF.ratio * 0.9 + rand() * 4, { hoch: e[2] * (0.6 + rand() * 0.8), w: 4 + rand() * 8, dauer: 2.8 + rand() * 2.4, gross: 0.5 + rand() * 0.9 });
  });
  if (LEBEN.nacht) {                                                // nachts: leuchtendes Plankton treibt durchs Wasser
    LEBEN.leuchtT = (LEBEN.leuchtT || 0) - dt;
    if (LEBEN.leuchtT <= 0) {
      LEBEN.leuchtT = 0.35 + rand() * 0.7;
      const w = $('#riffwrap'), b = $('#buehne');
      if (w && b) { const W = riffWelt(u), wr = w.getBoundingClientRect(), br = b.getBoundingClientRect(); const x = W.minX + (wr.left + rand() * wr.width - br.left - 6) / RIFF.u, y = (Math.min(wr.bottom, br.bottom - 6) - br.top - 6) / RIFF.v - 8 - rand() * 50; lebenTeil('leucht', x, y, { hoch: 14 + rand() * 18, w: (rand() - 0.5) * 18, dauer: 6 + rand() * 4, gross: 0.7 + rand() * 0.8 }); }
    }
  }
  LEBEN.ambient -= dt;                                              // dazu ein paar Blasen vom Boden, überall im sichtbaren Ausschnitt
  if (LEBEN.ambient <= 0) {
    LEBEN.ambient = 0.9 + rand() * 1.4;
    const w = $('#riffwrap'), b = $('#buehne');
    if (w && b) { const W = riffWelt(u), wr = w.getBoundingClientRect(), br = b.getBoundingClientRect(); const x = W.minX + (wr.left + rand() * wr.width - br.left - 6) / RIFF.u, y = (Math.min(wr.bottom, br.bottom - 6) - br.top - 6) / RIFF.v - rand() * 6; lebenTeil('blase', x, y, { hoch: 30 + rand() * 30, w: 3 + rand() * 6, dauer: 3.2 + rand() * 2.4, gross: 0.35 + rand() * 0.5 }); }
  }
}

// ---------- Schleife ----------
function lebenTick(ts) {
  LEBEN.raf = 0;
  const b = $('#buehne'), u = cur();
  if (V.name !== 'riff' || !b || !u || !lebenAn(u)) return;
  const jetzt = ts / 1000, dt = LEBEN.letzt ? clamp(jetzt - LEBEN.letzt, 0.001, 0.05) : 0.016;
  LEBEN.letzt = jetzt; LEBEN.zeit += dt;
  const W = riffWelt(u), G = riffGrenzen(W), k = RIFF.v / RIFF.u;
  if (LEBEN.zeit - LEBEN.nachtZeit > 4) { LEBEN.nachtZeit = LEBEN.zeit; const n = lebenNachtJetzt(u); if (n !== LEBEN.nacht) { LEBEN.nacht = n; b.classList.toggle('nacht', n); } }
  if (LEBEN.zeit - LEBEN.wohlZeit > 1) { LEBEN.wohlZeit = LEBEN.zeit; LEBEN.wohl = riffWohl(u); }
  lebenFutterSchritt(dt, G);
  const sel = V.p.sel, ids = new Set();
  u.riff.items.forEach(it => {
    if (!lebenBeweglich(it)) return;
    ids.add(it.id);
    const a = lebenAgent(it), el = lebenEl(it.id); if (!el) return;
    lebenSchritt(a, it, u, dt, G, LEBEN.nacht, k, sel);
    lebenAnwenden(a, it, el);
    const z = a.modus === 'verstecken' && a.hinterZ != null ? a.hinterZ : Math.round((it.y + a.oy) * 10); if (z !== a.z) { a.z = z; el.parentNode.style.zIndex = z; }
  });
  LEBEN.ag.forEach((a, id) => { if (!ids.has(id)) LEBEN.ag.delete(id); });
  lebenEmitter(u, dt);
  lebenFrageSchritt(u);
  lebenEreignisSchritt(u, dt);
  if (LEBEN.rede) lebenRedeZeigen();
  LEBEN.raf = requestAnimationFrame(lebenTick);
}
function lebenStart() {                                             // nach jedem Neuzeichnen des Riffs
  const b = $('#buehne'), u = cur(); if (!b || !u) return;
  cancelAnimationFrame(LEBEN.raf); LEBEN.raf = 0;
  b.classList.toggle('ruhe', !lebenAn(u));
  LEBEN.nacht = lebenNachtJetzt(u); b.classList.toggle('nacht', LEBEN.nacht); LEBEN.nachtZeit = LEBEN.zeit;
  LEBEN.el.clear();
  const c = $('#teile');
  LEBEN.futter.forEach(f => { if (c) { f.el = document.createElement('div'); f.el.className = 'flocke'; c.appendChild(f.el); } });
  u.riff.items.forEach(it => { if (!lebenBeweglich(it)) return; const a = LEBEN.ag.get(it.id), el = lebenEl(it.id); if (a && el) { a.tx = ''; lebenAnwenden(a, it, el); } });
  lebenRedeZeigen();
  lebenFrageWeg(); LEBEN.fzNext = LEBEN.zeit + 5 + rand() * 8;
  if (LEBEN.ereToken && b) b.appendChild(LEBEN.ereToken.el);                      // der goldene Stern bleibt beim Neuzeichnen
  if (EG && !$('#ereignis')) EG = null;
  if (lebenAn(u)) { LEBEN.letzt = 0; LEBEN.raf = requestAnimationFrame(lebenTick); }
}

// ---------- Knöpfe ----------
AKT.riffLeben = () => { const u = cur(); u.riff.leben = !lebenAn(u); if (!u.riff.leben) { LEBEN.ag.clear(); LEBEN.futter.forEach(f => f.el && f.el.remove()); LEBEN.futter = []; } sichere(); toast(u.riff.leben ? 'Im Riff ist wieder Leben!' : 'Ruhe im Riff: alles steht an seinem Platz.', u.riff.leben ? 'stern' : 'info', 2400); render(); };
AKT.riffZeit = () => { const u = cur(), f = { auto: 'tag', tag: 'nacht', nacht: 'auto' }; u.riff.zeit = f[u.riff.zeit || 'auto']; sichere(); toast({ auto: 'Tag und Nacht wie auf deiner Uhr', tag: 'Immer Tag', nacht: 'Immer Nacht' }[u.riff.zeit], u.riff.zeit === 'nacht' ? 'mond' : 'licht', 2400); render(); };
AKT.riffSperre = () => { const u = cur(); u.riff.sperre = !u.riff.sperre; if (u.riff.sperre) { V.p.sel = null; LEBEN.zieht = null; } sichere(); toast(u.riff.sperre ? 'Tiere gesperrt: Du kannst im Riff scrollen, zoomen und füttern, ohne aus Versehen ein Tier zu berühren.' : 'Tiere sind wieder antippbar.', 'schloss', 3200); render(); };
AKT.riffFutter = () => { LEBEN.futterModus = !LEBEN.futterModus; if (LEBEN.futterModus) toast('Tippe ins Wasser, um Futter zu streuen.', 'futter', 2800); render(); };

// ---------- Knöpfe über dem Wasser ----------
function riffWerkHtml(u) {
  const an = lebenAn(u), zeit = u.riff.zeit || 'auto';
  return `<div class="riffwerk"><button class="rw ${LEBEN.futterModus ? 'an' : ''}" data-a="riffFutter" aria-label="Futter streuen">${ico('futter')}</button><button class="rw ${zeit !== 'auto' ? 'an' : ''}" data-a="riffZeit" aria-label="Tag und Nacht">${ico(LEBEN.nacht || zeit === 'nacht' ? 'mond' : 'licht')}${zeit === 'auto' ? '<small>A</small>' : ''}</button><button class="rw ${u.riff.sperre ? 'an' : ''}" data-a="riffSperre" aria-label="Tiere gegen Antippen sperren" aria-pressed="${!!u.riff.sperre}">${ico('schloss')}</button><button class="rw ${frageAn() ? 'an' : ''}" data-a="riffFragenAn" aria-label="Freunde fragen Vokabeln" aria-pressed="${frageAn()}">${ico('buch')}</button><button class="rw ${RIFF.voll ? 'an' : ''}" data-a="riffVoll" aria-label="${RIFF.voll ? 'Vollbild beenden' : 'Riff im Vollbild'}">${ico(RIFF.voll ? 'vollzu' : 'voll')}</button><button class="rw ${an ? 'an' : ''}" data-a="riffLeben" aria-label="Leben im Riff">${ico(an ? 'pause' : 'spiel')}</button></div>${LEBEN.futterModus ? '<div class="riffhinweis">Tippe ins Wasser, um Futter zu streuen</div>' : ''}${frageAn(u) ? '<div class="riffhinweis modus">' + ico('buch') + ' Vokabel-Modus an: Freunde fragen Wörter <button data-a="riffFragenAn">Aus</button></div>' : ''}`;
}

// ---------- Freunde fragen Vokabeln ----------
// Ab und zu taucht über einem Freund ein „?“ auf. Tippt man es (oder den Freund) an, stellt er eine Vokabelfrage aus den Karten, die man schon kennt
// (Quiz mit drei Antworten, schwächere Karten öfter). Das Üben ändert den Lernplan nicht. Perlen gibt es bewusst knapp, damit die Perlen aus den
// Lektionen ihren Wert behalten: nur jede zweite richtige Antwort bringt eine Perle, höchstens FRAGE_MAX richtige Antworten am Tag zählen (= 3 Perlen),
// nach FRAGE_FEHLER falschen Antworten am Tag gibt es nichts mehr (kein Belohnen fürs Raten), Korallenfunken gibt es hier nicht. Das Ganze ist ein eigener **Modus**: Er ist beim Start aus und wird nur über den Buch-Knopf im Riff
// ein- und wieder ausgeschaltet (LEBEN.fragenModus, wird nicht gespeichert, damit das Riff nie ungefragt Fragen stellt).
const FRAGE_MAX = 6, FRAGE_FEHLER = 3;
const frageTag = u => { const r = u.riff; if (!r.frage || r.frage.d !== heute()) r.frage = { d: heute(), ok: 0, n: 0, falsch: 0 }; return r.frage; };
const frageAn = () => !!LEBEN.fragenModus;
function frageKarte(u) {                                           // → { cid, t, optionen } oder null (noch keine bekannten Karten mit Text)
  const cids = Object.keys(u.cards).filter(c => cidInfo(c).c && karteText(c));
  if (!cids.length) return null;
  for (let v = 0; v < 10; v++) {
    const ws = cids.map(c => 1 / (1 + (u.cards[c].b || 0)));        // wacklige Karten kommen öfter dran
    let y = rand() * sum(ws), cid = cids[0];
    for (let i = 0; i < cids.length; i++) { if (y < ws[i]) { cid = cids[i]; break; } y -= ws[i]; }
    if (cid === LEBEN.letzteFrage && cids.length > 1) continue;
    const t = karteText(cid), alle = quizOptionen(cid);
    if (alle.length < 2) continue;
    return { cid, t, optionen: shuffle([t.antwort].concat(alle.filter(o => o !== t.antwort).slice(0, 3))) };
  }
  return null;
}
function lebenFrageWeg() { if (LEBEN.fz) { if (LEBEN.fz.el) LEBEN.fz.el.remove(); LEBEN.fz = null; } }
function lebenFrageSchritt(u) {                                    // lässt das „?“ erscheinen, mitwandern und wieder verschwinden
  const an = frageAn(u) && !LEBEN.nacht && !LEBEN.futterModus && !LEBEN.frage && !EG, fz = LEBEN.fz;
  if (fz) {
    const it = u.riff.items.find(i => i.id === fz.id), a = LEBEN.ag.get(fz.id);
    if (!an || !it || !a || a.modus === 'schlafen' || a.modus === 'verstecken' || LEBEN.zeit > fz.bis) { lebenFrageWeg(); LEBEN.fzNext = LEBEN.zeit + 12 + rand() * 12; return; }
    const W = riffWelt(u), p = riffSicht(it);
    fz.el.style.left = riffLeft(p.x, W); fz.el.style.top = riffTop(Math.max(p.y - riffBasis(it) * RIFF.ratio * 1.05, 8));
    return;
  }
  if (!an || LEBEN.zeit < (LEBEN.fzNext || 0)) return;
  if (frageTag(u).ok >= FRAGE_MAX || (frageTag(u).falsch || 0) >= FRAGE_FEHLER) { LEBEN.fzNext = LEBEN.zeit + 60; return; }
  const kand = u.riff.items.filter(it => { const a = lebenBeweglich(it) && LEBEN.ag.get(it.id); return a && a.modus !== 'schlafen' && a.modus !== 'verstecken' && lebenSichtbar(riffSicht(it), 0); });
  const b = $('#buehne');
  if (!kand.length || !b || !Object.keys(u.cards).length) { LEBEN.fzNext = LEBEN.zeit + 10; return; }
  const it = pick(kand), el = document.createElement('button');
  el.className = 'fragezeichen'; el.dataset.a = 'riffFrage'; el.dataset.v = it.id; el.setAttribute('aria-label', 'Ein Freund hat eine Frage an dich'); el.textContent = '?';
  b.appendChild(el);
  LEBEN.fz = { id: it.id, el, bis: LEBEN.zeit + 45 };
}
AKT.riffFrage = el => frageStart(el.dataset.v);
function frageStart(id) {
  const u = cur(), it = u.riff.items.find(i => i.id === id); if (!it) return;
  const f = frageKarte(u);
  lebenFrageWeg();
  if (!f) { LEBEN.fzNext = LEBEN.zeit + 30; toast('Lerne erst ein paar Karten, dann fragen dich deine Freunde!', 'info', 3600); return; }
  LEBEN.frage = { id, cid: f.cid, richtig: f.t.antwort, optionen: f.optionen, fertig: false };
  LEBEN.letzteFrage = f.cid;
  const kurz = it.kind === 'myth' ? MYTH[it.ref].name.split(' ').slice(-1)[0] : FIG[it.ref].name.split(' ')[0];
  const sp = cidInfo(f.cid).sp, ziel = f.t.vonDe ? (sp === 'fr' ? 'Französisch' : 'Englisch') : 'Deutsch';
  const knoepfe = f.optionen.map((o, i) => `<button data-a="frageWahl" data-v="${i}">${md(o)}</button>`).join('');
  zeigeBlatt(`<div class="rfrage"><div class="fkopf"><div class="fb">${it.kind === 'myth' ? mythSvg(it.ref) : figSvg(it.ref)}</div><div><b>${esc(kurz)} fragt dich:</b><small>Wie heißt das auf ${ziel}?</small></div></div>
    <div class="ffrage">${md(f.t.frage)}</div><div class="quiz" id="frageOpt">${knoepfe}</div><div class="fmeld" id="frageMeld"></div>
    <div class="zeile" style="margin-top:10px"><button class="linkbtn" data-a="frageSpaeter">Später</button></div></div>`, { breit: 560, onZu: frageEnde });
  TON.spiel('tap');
}
AKT.frageSpaeter = () => schliesseBlatt();
function frageEnde() {                                             // Fenster ist zu: das Fragezeichen kommt später wieder
  const q = LEBEN.frage; LEBEN.frage = null;
  LEBEN.fzNext = LEBEN.zeit + 14 + rand() * 14;
  if (!q || !q.fertig) return;
  const u = cur(), it = u.riff.items.find(i => i.id === q.id), a = it && LEBEN.ag.get(q.id);
  if (it && a && q.gut) { lebenFreude(a, it, 'tipp'); lebenTeil('herz', riffSicht(it).x, riffSicht(it).y - riffBasis(it) * RIFF.ratio * 0.9, { hoch: 16, w: 4, dauer: 1.8 }); }
}
AKT.frageWahl = el => {
  const q = LEBEN.frage; if (!q || q.fertig) return;
  const u = cur(), i = +el.dataset.v, gewaehlt = q.optionen[i], gut = gewaehlt === q.richtig, tag = frageTag(u);
  q.fertig = true; q.gut = gut; tag.n++;
  const t = karteText(q.cid);
  document.querySelectorAll('#frageOpt button').forEach((b, k) => { b.disabled = true; if (q.optionen[k] === q.richtig) b.classList.add('richtig'); else if (k === i) b.classList.add('falsch'); });
  let meld = '';
  if (gut) {
    TON.spiel('gut');
    if (tag.ok < FRAGE_MAX && (tag.falsch || 0) < FRAGE_FEHLER) {
      tag.ok++; u.stats.riffFragen = (u.stats.riffFragen || 0) + 1;
      if (tag.ok % 2 === 0) { u.perlen += 1; meld = `Richtig! +1 Perle ${PERLE}`; } else meld = 'Richtig! Die nächste richtige Antwort bringt eine Perle.';
      pruefeAbzeichen(u).forEach(b => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200));
    } else meld = 'Richtig! Für heute gibt es keine Perlen mehr, üben darfst du trotzdem.';
  } else { tag.falsch = (tag.falsch || 0) + 1; TON.spiel('schwer'); meld = `Fast! Richtig ist: <b>${md(q.richtig)}</b>`; }
  sichere(); perlenAnzeige(u);
  const m = $('#frageMeld'); if (m) m.innerHTML = `${meld}<div class="zeile" style="justify-content:center;margin-top:8px"><button class="btn gruen" data-a="blattZu">Weiter</button></div>`;
  if (t && u.set.sprechen !== 'aus' && (u.set.sprechen || 'auto') === 'auto') SPRECHEN.sag(t.sprechen, t.tts);
};
AKT.riffFragenAn = () => {
  LEBEN.fragenModus = !LEBEN.fragenModus; lebenFrageWeg();
  toast(LEBEN.fragenModus ? 'Vokabel-Modus an: Deine Freunde fragen dich Wörter. Zum Ausschalten tippe den Knopf noch einmal an.' : 'Vokabel-Modus aus: keine Fragen mehr im Riff.', 'buch', 3400);
  render();
  if (LEBEN.fragenModus) LEBEN.fzNext = LEBEN.zeit + 1.5;                              // das erste „?“ kommt gleich
};
