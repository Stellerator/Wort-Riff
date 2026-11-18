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
  zzz: '<b>Z</b>', blase: '', mampf: '<b>mampf!</b>'
};
const LEBEN = { ag: new Map(), el: new Map(), emit: new Map(), futter: [], futterModus: false, raf: 0, zeit: 0, letzt: 0, nacht: false, nachtZeit: -99, wohl: [], wohlZeit: -99, rede: null, tonBis: 0, zieht: null, ambient: 0 };

const lebenAn = u => (u.riff.leben !== undefined ? !!u.riff.leben : !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
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
  const el = lebenEl(it.id);
  if (el) { const fx = el.querySelector('.fx'); if (fx) { fx.className = 'fx'; void fx.offsetWidth; fx.className = 'fx f-' + pick(FREUDE_ANIM[a.art] || ['wippen']); } }
  const p = riffSicht(it), kopf = p.y - riffBasis(it) * RIFF.ratio * 0.95;
  lebenTeil(pick(['herz', 'herz', 'stern', 'note']), p.x + (rand() - 0.5) * 6, kopf, { hoch: 16 + rand() * 8, w: (rand() - 0.5) * 16 });
  if (rand() < 0.55) lebenTeil(pick(['herz', 'stern']), p.x + (rand() - 0.5) * 12, kopf + 3, { hoch: 14 + rand() * 8, w: (rand() - 0.5) * 20 });
  lebenTon('freude', p);
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
function lebenAnkunft(a, it) {
  const t = LEBEN.zeit;
  if (a.danach === 'verweilen') { a.modus = 'verweilen'; a.bis = t + 7 + rand() * 8; a.naechste = t + 0.4; }
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
  }
  // Ziel verfolgen
  let wx = 0, wy = 0;
  if (a.modus === 'gehe' && a.ziel) {
    if (a.danach === 'fressen') { if (!a.futter || LEBEN.futter.indexOf(a.futter) < 0) { a.modus = 'bleiben'; a.danach = ''; a.bis = t + 0.2; a.futter = null; } else a.ziel = lebenKlemme({ x: a.futter.x, y: a.futter.y }, G); }
    const p = riffSicht(it), dx = a.ziel.x - p.x, dy = (a.ziel.y - p.y) * k, d = Math.hypot(dx, dy);
    if (a.modus === 'gehe') {
      if (d < 2.4) lebenAnkunft(a, it);
      else { const sp = lebenTempo(a) * Math.min(1, d / 9 + 0.35); wx = dx / d * sp; wy = dy / d * sp / k; }
    }
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
  const hop = a.b.typ === 'krabbler' && Math.abs(a.vx) > 0.8 ? Math.abs(Math.sin(LEBEN.zeit * 11)) * -3 : 0;
  const neu = `translate3d(${(a.ox * RIFF.u).toFixed(1)}px,${(a.oy * RIFF.v + hop).toFixed(1)}px,0) rotate(${a.tilt.toFixed(1)}deg)`;
  if (a.tx !== neu) { el.style.transform = neu; a.tx = neu; }
}

// ---------- Agenten, Elemente ----------
function lebenAgent(it) {
  let a = LEBEN.ag.get(it.id);
  if (!a) {
    const art = FIG[it.ref].art;
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
    if (it.kind !== 'deko') return;
    const e = EMITTER[it.ref]; if (!e) return;
    let st = LEBEN.emit.get(it.id); if (!st) { st = { n: rand() * 2 }; LEBEN.emit.set(it.id, st); }
    st.n -= dt;
    if (st.n > 0) return;
    st.n = (0.5 + rand()) / e[0];
    if (!lebenSichtbar({ x: it.x, y: it.y })) return;
    lebenTeil(e[1], it.x + (rand() - 0.5) * 4, it.y - riffBasis(it) * RIFF.ratio * 0.9 + rand() * 4, { hoch: e[2] * (0.6 + rand() * 0.8), w: 4 + rand() * 8, dauer: 2.8 + rand() * 2.4, gross: 0.5 + rand() * 0.9 });
  });
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
    if (it.kind !== 'fig') return;
    ids.add(it.id);
    const a = lebenAgent(it), el = lebenEl(it.id); if (!el) return;
    lebenSchritt(a, it, u, dt, G, LEBEN.nacht, k, sel);
    lebenAnwenden(a, it, el);
    const z = Math.round((it.y + a.oy) * 10); if (z !== a.z) { a.z = z; el.parentNode.style.zIndex = z; }
  });
  LEBEN.ag.forEach((a, id) => { if (!ids.has(id)) LEBEN.ag.delete(id); });
  lebenEmitter(u, dt);
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
  u.riff.items.forEach(it => { if (it.kind !== 'fig') return; const a = LEBEN.ag.get(it.id), el = lebenEl(it.id); if (a && el) { a.tx = ''; lebenAnwenden(a, it, el); } });
  lebenRedeZeigen();
  if (lebenAn(u)) { LEBEN.letzt = 0; LEBEN.raf = requestAnimationFrame(lebenTick); }
}

// ---------- Knöpfe ----------
AKT.riffLeben = () => { const u = cur(); u.riff.leben = !lebenAn(u); if (!u.riff.leben) { LEBEN.ag.clear(); LEBEN.futter.forEach(f => f.el && f.el.remove()); LEBEN.futter = []; } sichere(); toast(u.riff.leben ? 'Im Riff ist wieder Leben!' : 'Ruhe im Riff: alles steht an seinem Platz.', u.riff.leben ? 'stern' : 'info', 2400); render(); };
AKT.riffZeit = () => { const u = cur(), f = { auto: 'tag', tag: 'nacht', nacht: 'auto' }; u.riff.zeit = f[u.riff.zeit || 'auto']; sichere(); toast({ auto: 'Tag und Nacht wie auf deiner Uhr', tag: 'Immer Tag', nacht: 'Immer Nacht' }[u.riff.zeit], u.riff.zeit === 'nacht' ? 'mond' : 'licht', 2400); render(); };
AKT.riffFutter = () => { LEBEN.futterModus = !LEBEN.futterModus; if (LEBEN.futterModus) toast('Tippe ins Wasser, um Futter zu streuen.', 'futter', 2800); render(); };

// ---------- Knöpfe über dem Wasser ----------
function riffWerkHtml(u) {
  const an = lebenAn(u), zeit = u.riff.zeit || 'auto';
  return `<div class="riffwerk"><button class="rw ${LEBEN.futterModus ? 'an' : ''}" data-a="riffFutter" aria-label="Futter streuen">${ico('futter')}</button><button class="rw ${zeit !== 'auto' ? 'an' : ''}" data-a="riffZeit" aria-label="Tag und Nacht">${ico(LEBEN.nacht || zeit === 'nacht' ? 'mond' : 'licht')}${zeit === 'auto' ? '<small>A</small>' : ''}</button><button class="rw ${an ? 'an' : ''}" data-a="riffLeben" aria-label="Leben im Riff">${ico(an ? 'pause' : 'spiel')}</button></div>${LEBEN.futterModus ? '<div class="riffhinweis">Tippe ins Wasser, um Futter zu streuen</div>' : ''}`;
}
