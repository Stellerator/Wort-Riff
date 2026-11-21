'use strict';
// ---------- Oberfläche: Router, Rahmen, Symbole, Effekte ----------
const ICO = {
  hafen: '<circle cx="12" cy="5" r="2.6"/><path d="M12 7.6V21M6.5 12H17.5M3.6 14c.2 4 4.2 7 8.4 7s8.2-3 8.4-7"/>',
  karte: '<circle cx="12" cy="12" r="9.2"/><path d="M15.8 8.2l-2.2 5.4-5.4 2.2 2.2-5.4z"/>',
  album: '<path d="M12 21.5L4 11C3 5.5 7 2.5 12 2.5S21 5.5 20 11z"/><path d="M12 21.5V3M8 4l-1.5 14M16 4l1.5 14M4.6 9l3 .1M19.4 9l-3 .1"/>',
  riff: '<path d="M12 21.5V11M12 16.5l-5.5-5.5V6M12 13.5l5.5-5.5V3.5"/><path d="M4 21.5h16"/>',
  voll: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  vollzu: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  ich: '<circle cx="12" cy="8" r="4"/><path d="M4 21.5c0-5 4-7.5 8-7.5s8 2.5 8 7.5"/>',
  buch: '<path d="M3.5 5c3-1.2 6-1 8.5 1 2.5-2 5.500-2.200 8.500-1v14c-3-1.200-6-1-8.500 1-2.500-2-5.500-2.200-8.500-1z"/><path d="M12 6v14"/>',
  zu: '<path d="M6 6l12 12M18 6L6 18"/>',
  zurueck: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  haken: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  uhr: '<circle cx="12" cy="13" r="8"/><path d="M12 8.500V13l3 2M9.500 2.500h5"/>',
  sprecher: '<path d="M4 9.500v5h4l5 4v-13l-5 4z"/><path d="M16 9a4.500 4.500 0 010 6M18.500 6.500a8 8 0 010 11"/>',
  stern: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  zahnrad: '<circle cx="12" cy="12" r="3.200"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M18.700 5.300l-2.100 2.100M7.400 16.600l-2.100 2.100"/>',
  tausch: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.500"/>',
  kalender: '<rect x="3.500" y="5" width="17" height="15" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
  papier: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  muelleimer: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  stift: '<path d="M4 20l1-5L16.500 3.500l4 4L9 19z"/>',
  speichern: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  laden: '<path d="M12 15V3M7 8l5-5 5 5M4 20h16"/>',
  licht: '<circle cx="12" cy="12" r="4.500"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  pfeilr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  schloss: '<rect x="5" y="11" width="14" height="10" rx="2.500"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  futter: '<path d="M6 8h12l-1.200 12H7.200z"/><path d="M5 8l1.500-3.500h11L19 8M9.500 13h5M9.500 16.500h5"/>',
  mond: '<path d="M20 14.500A8.500 8.500 0 119.500 4a7 7 0 0010.500 10.500z"/>',
  pause: '<path d="M8.500 5v14M15.500 5v14"/>',
  spiel: '<path d="M8 5l11 7-11 7z"/>'
};
const ico = (n, c) => `<svg class="ico ${c || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICO[n]}</svg>`;
const FLAMME = '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2C20 8 24 12 23 18c-1 5-5 9-8 9s-7-4-8-9c-1-6 5-8 8-16z" fill="#FF8A2B" stroke="#14253F" stroke-width="2" stroke-linejoin="round"/><path d="M15 14c3 3 4 6 3 8-1 2-2 3-3 3s-2-1-3-3c-1-3 1-5 3-8z" fill="#FFE680"/></svg>';
const TAUCHER = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#FFC83D" stroke="#14253F" stroke-width="2.5"/><rect x="9" y="14" width="22" height="13" rx="6" fill="#BDF0F7" stroke="#14253F" stroke-width="2.5"/><path d="M13 18q4-3 8-1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16 31q4 3 8 0" stroke="#14253F" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
const PERLE = '<i class="perle"></i>';
const FUNKE = '<i class="funke"></i>';
const STERN_SVG = (fill = '#FFC83D') => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="${ART.star(30, 31, 27, 12, 5)}" fill="${fill}" stroke="#14253F" stroke-width="3.5" stroke-linejoin="round"/></svg>`;

// ---------- Maskottchen Flo ----------
const flo = () => ART.figur('seepferd', PAL.tuerkis, 'maske', 'flo').replace('class="fig"', 'class="fig flo-svg"');
// ---------- Muschel (zu / offen) ----------
function muschelSvg(art, glow) {
  const c = art === 'schatz' ? { a: '#FFD25A', b: '#E5A000', c: '#FFF1BF' } : { a: '#FF9DC2', b: '#E0679A', c: '#FFE3EE' };
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><g stroke="#14253F" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="100" cy="176" rx="74" ry="9" fill="#000" opacity=".18" stroke="none"/>
    <path d="M22 118 C22 158 58 180 100 180 C142 180 178 158 178 118Z" fill="${c.b}"/>
    <path d="M100 180 V122 M66 174 L52 122 M134 174 L148 122 M40 160 L32 122 M160 160 L168 122" fill="none" stroke="${c.a}" stroke-width="5"/>
    <g class="fund"></g>
    <g class="oben"><path d="M18 120 C16 66 54 30 100 30 C146 30 184 66 182 120 C150 132 50 132 18 120Z" fill="${c.a}"/>
    <path d="M100 32 V126 M72 38 L54 124 M128 38 L146 124 M46 58 L30 118 M154 58 L170 118" fill="none" stroke="${c.b}" stroke-width="4"/>
    <path d="M40 74 C50 54 70 42 92 40" fill="none" stroke="#fff" stroke-width="6" opacity=".6"/></g>
    </g></svg>`;
}

// ---------- Ring ----------
function ring(pct, size, farbe, inner, dick) {
  const d = dick || 11, r = 50 - d / 2, u = 2 * Math.PI * r;
  const p = clamp(pct, 0, 1);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(14,107,168,.15)" stroke-width="${d}"/>` +
    `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${farbe}" stroke-width="${d}" stroke-linecap="round" stroke-dasharray="${(u * p).toFixed(1)} ${u.toFixed(1)}" transform="rotate(-90 50 50)" style="transition:stroke-dasharray .8s"/></svg><div class="mitte">${inner || ''}</div></div>`;
}

const imgTag = (key, cls) => `<img ${cls ? `class="${cls}" ` : ''}${IMGURL.get(key) ? `src="${IMGURL.get(key)}" ` : ''}data-img="${key}" alt="" draggable="false">`;

// ---------- Router ----------
let V = { name: 'start', p: {} };
const ANSICHT = {};                                               // name -> () => HTML
const AKT = {};                                                   // data-a -> Funktion(el, ev)
function gehe(name, p) { V = { name, p: p || {} }; if (name !== 'riff' && typeof riffVollEnde === 'function') riffVollEnde(); render(true); }
function render(hoch) {
  const f = ANSICHT[V.name];
  const main = $('.main');
  const y = main && !hoch ? main.scrollTop : 0;
  $('#app').innerHTML = f();
  const m2 = $('.main'); if (m2 && y) m2.scrollTop = y;
  nachRender();
}
function nachRender() {
  $$('img[data-img]').forEach(im => {
    if (im.getAttribute('src')) return;
    imgUrl(im.dataset.img).then(u => { if (u && im.isConnected) im.src = u; });
  });
  if (V.nach) { const n = V.nach; n(); }
}
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = AKT[el.dataset.a];
  if (f) { TON.start(); f(el, ev); }
});

// ---------- Rahmen mit Navigation ----------
const NAV = [['start', 'hafen', 'Hafen'], ['karte', 'karte', 'Karte'], ['album', 'album', 'Album'], ['riff', 'riff', 'Riff'], ['bibliothek', 'buch', 'Karten'], ['ich', 'ich', 'Ich']];
function mitNav(inner, klasse) {
  const u = cur();
  const m = u ? muschelAnzahl(u) : 0;
  const btn = ([id, ic, name]) => `<button data-a="nav" data-v="${id}" class="${V.name === id ? 'an' : ''}">${ico(ic)}<span>${name}</span>${id === 'album' && m ? `<span class="punkt">${m}</span>` : ''}</button>`;
  return `<div class="shell"><nav class="nav"><div class="logo">${flo()}</div>${NAV.map(btn).join('')}<div class="sp"></div></nav><div class="main ${klasse || ''}"><div class="wrap">${inner}</div></div></div>`;
}
AKT.nav = el => gehe(el.dataset.v);

function kopfLeiste() {
  const u = cur(), r = rangVon(u.xp), m = muschelAnzahl(u);
  return `<div class="top"><button class="wer" data-a="nav" data-v="ich"><div class="avatar mittel">${figSvg(u.avatar)}</div><div><b>${esc(u.name)}</b><small>${esc(r.name)}</small><div class="rangbar"><div class="leiste gold"><b style="width:${Math.round(r.pct * 100)}%"></b></div></div></div></button>
    <div class="rechts"><span class="chip">${PERLE} <span class="zahl">${nf(u.perlen)}</span></span>
    <button class="muschelknopf ${m ? 'voll' : ''}" data-a="${m ? 'muschelStart' : 'nav'}" data-v="album" aria-label="Muscheln">${muschelSvg(u.muscheln.schatz ? 'schatz' : 'perl')}<span>${m}</span></button>${paketAnzahl(u) ? `<button class="muschelknopf voll" data-a="paketStart" aria-label="Überraschungspakete"><span class="pkmini">${paketSvg(paketHoechste(u))}</span><span>${paketAnzahl(u)}</span></button>` : ''}</div></div>`;
}

// ---------- Hinweise ----------
function toast(text, ic, ms) {
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = (ic ? ico(ic) : '') + `<span>${esc(text)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('aus'), ms || 2600);
  setTimeout(() => t.remove(), (ms || 2600) + 400);
}
function zeigeBlatt(html, o) {
  o = o || {};
  $('#layer').innerHTML = `<div class="schleier" data-a="blattBg"><div class="blatt" ${o.breit ? `style="width:min(${o.breit}px,100%)"` : ''}>${o.ohneZu ? '' : '<button class="zu" data-a="blattZu" aria-label="Schließen">' + ico('zu') + '</button>'}${html}</div></div>`;
  V.blattZu = o.onZu || null;
  nachRender();
}
function schliesseBlatt() { $('#layer').innerHTML = ''; const f = V.blattZu; V.blattZu = null; if (f) f(); }
AKT.blattZu = () => schliesseBlatt();
AKT.blattBg = (el, ev) => { if (ev.target === el) schliesseBlatt(); };

function schwebZahl(el, text) {                                   // „+2“ steigt aus einem Element auf
  const r = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'schwebzahl'; s.textContent = text;
  s.style.left = (r.left + r.width / 2 - 20) + 'px'; s.style.top = (r.top + 4) + 'px';
  document.body.appendChild(s); setTimeout(() => s.remove(), 1200);
}

// ---------- Effekte: Luftblasen und Konfetti auf einer Leinwand ----------
const FX = (() => {
  const cv = $('#fx'), g = cv.getContext('2d');
  let W = 0, H = 0, parts = [], amb = [], laeuft = false, last = 0;
  const reduziert = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function groesse() { const d = Math.min(2, window.devicePixelRatio || 1); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; cv.dataset.d = d; }
  window.addEventListener('resize', groesse); groesse();
  for (let i = 0; i < (reduziert ? 0 : 12); i++) amb.push({ x: rand(), y: rand(), r: 4 + rand() * 12, v: 0.008 + rand() * 0.016, w: rand() * 6 });
  function schritt(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    const d = +cv.dataset.d || 1;
    g.clearRect(0, 0, W, H);
    amb.forEach(b => {
      b.y -= b.v * dt * 4; b.w += dt;
      if (b.y < -0.05) { b.y = 1.05; b.x = rand(); }
      const x = (b.x + Math.sin(b.w) * 0.01) * W, y = b.y * H, r = b.r * d;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = 'rgba(255,255,255,.16)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2 * d; g.stroke();
      g.beginPath(); g.arc(x - r * .35, y - r * .35, r * .22, 0, 7); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill();
    });
    parts = parts.filter(p => p.l > 0);
    parts.forEach(p => {
      p.l -= dt; p.vy += p.gr * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      g.save(); g.globalAlpha = clamp(p.l / p.l0 * 1.6, 0, 1); g.translate(p.x * d, p.y * d); g.rotate(p.rot);
      if (p.bubble) { g.beginPath(); g.arc(0, 0, p.s * d, 0, 7); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2 * d; g.stroke(); }
      else { g.fillStyle = p.c; g.fillRect(-p.s * d, -p.s * .5 * d, p.s * 2 * d, p.s * d); }
      g.restore();
    });
    if (document.visibilityState === 'hidden') { laeuft = false; return; }
    requestAnimationFrame(schritt);
  }
  function an() { if (!laeuft && !reduziert) { laeuft = true; last = performance.now(); requestAnimationFrame(schritt); } }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') an(); });
  an();
  const FARBEN = ['#FFC83D', '#FF7A59', '#1FB6C6', '#8E6BE0', '#FF8FB3', '#2FB38A', '#fff'];
  return {
    blasen(x, y, n) { if (reduziert) return; for (let i = 0; i < (n || 12); i++) parts.push({ x, y, vx: (rand() - .5) * 160, vy: -40 - rand() * 160, gr: -30, s: 4 + rand() * 9, l: 1 + rand() * 0.9, l0: 1.6, rot: 0, vr: 0, bubble: true }); an(); },
    konfetti(n) { if (reduziert) return; for (let i = 0; i < (n || 80); i++) parts.push({ x: innerWidth * (0.15 + rand() * 0.7), y: innerHeight * 0.25, vx: (rand() - .5) * 520, vy: -260 - rand() * 380, gr: 760, s: 5 + rand() * 5, l: 2 + rand() * 1.2, l0: 2.8, rot: rand() * 6, vr: (rand() - .5) * 14, c: FARBEN[Math.floor(rand() * FARBEN.length)] }); an(); }
  };
})();
