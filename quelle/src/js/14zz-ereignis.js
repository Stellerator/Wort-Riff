'use strict';
// ---------- Überraschungs-Ereignisse im Riff: ganz selten ein kleines Geschicklichkeitsspiel mit Bonus ----------
// Ein goldener Stern taucht im Wasser auf (höchstens einmal am Tag, nach mindestens 90 s im Riff, Würfel alle 10 s mit 1,2 % Chance, also etwa alle 15–30 Minuten im Riff
// einmal, im Schnitt viel seltener). Antippen öffnet eine Karte mit den Regeln, „Los!“ startet 12 Sekunden Spiel:
//   Blasenregen      – leuchtende Blasen antippen, bevor sie oben ankommen; goldene zählen 3, Seeigel kosten 2 Punkte
//   Goldener Krebs   – ein goldener Krebs flitzt über den Sand; je öfter man ihn trifft, desto schneller wird er
// Bonus nach Sternen (0–3): 1 / 2 / 4 / 6 Perlen, bei 3 Sternen zusätzlich 3 Korallenfunken. Bewusst klein, damit die Perlen aus den Lektionen ihren Wert behalten.
// Abschalten: Ich → Einstellungen → „Überraschungen im Riff“ (u.set.ereignisse = false).
const EREIGNIS = { chance: 0.012, takt: 10, minSek: 90, dauer: 12, perlen: [1, 2, 4, 6], funken: [0, 0, 0, 3], sterne: { blasen: [10, 20, 30], krebs: [4, 8, 12] } };
const ereignisSterne = (spiel, punkte) => EREIGNIS.sterne[spiel].filter(s => punkte >= s).length;
let EG = null;                                                      // laufendes Ereignis: { spiel, phase: intro | laeuft | ende, punkte, … }

function ereignisTokenWeg() { if (LEBEN.ereToken) { if (LEBEN.ereToken.el) LEBEN.ereToken.el.remove(); LEBEN.ereToken = null; } }
function lebenEreignisSchritt(u, dt) {                              // Würfel und Anzeige des goldenen Sterns
  LEBEN.ereT = (LEBEN.ereT || 0) - dt; LEBEN.ereAkku = (LEBEN.ereAkku || 0) + dt;
  const tok = LEBEN.ereToken;
  if (tok) { if (LEBEN.zeit > tok.bis || EG) ereignisTokenWeg(); return; }
  if (LEBEN.ereT > 0) return;
  LEBEN.ereT = EREIGNIS.takt;
  if (u.set.ereignisse === false || EG || LEBEN.ereAkku < EREIGNIS.minSek || u.riff.ereTag === heute() || $('.blatt') || LEBEN.frage) return;
  if (rand() < EREIGNIS.chance) ereignisTokenZeigen(u);
}
function ereignisTokenZeigen(u) {
  const w = $('#riffwrap'), b = $('#buehne'); if (!w || !b) return;
  const W = riffWelt(u), wr = w.getBoundingClientRect(), br = b.getBoundingClientRect();
  const x = W.minX + (wr.left + wr.width * (0.2 + rand() * 0.6) - br.left - 6) / RIFF.u, y = (wr.top + wr.height * (0.25 + rand() * 0.35) - br.top - 6) / RIFF.v;
  const el = document.createElement('button');
  el.className = 'ereignisstern'; el.dataset.a = 'ereignisStart'; el.setAttribute('aria-label', 'Überraschung im Riff: antippen');
  el.style.left = riffLeft(x, W); el.style.top = riffTop(y);
  el.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${ART.star(24, 25, 21, 9, 5)}" fill="#FFD23D" stroke="#14253F" stroke-width="3" stroke-linejoin="round"/><path d="M15 17l5 -3" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg><span>Überraschung!</span>`;
  b.appendChild(el);
  LEBEN.ereToken = { el, bis: LEBEN.zeit + 30 };
  u.riff.ereTag = heute(); LEBEN.ereAkku = 0; sichere();
  TON.spiel('selten');
}

// ---------- Karte, Countdown, Spiel, Ergebnis ----------
const EREIGNIS_INFO = {
  blasen: ['Blasenregen!', 'Tippe die leuchtenden Blasen, bevor sie oben ankommen. Goldene zählen dreifach, aber Vorsicht vor den Seeigeln!'],
  krebs: ['Der goldene Krebs!', 'Ein goldener Krebs flitzt über den Sand. Tippe ihn so oft du kannst, er wird immer schneller!']
};
AKT.ereignisStart = el => {
  ereignisTokenWeg();
  const spiel = (el && el.dataset && el.dataset.spiel) || (rand() < 0.5 ? 'blasen' : 'krebs');
  const rahmen = $('.riffrahmen'); if (!rahmen || EG) return;
  EG = { spiel, phase: 'intro', punkte: 0, treffer: 0, zeit: EREIGNIS.dauer };
  const d = document.createElement('div');
  d.className = 'ereignis'; d.id = 'ereignis';
  d.innerHTML = `<div class="efeld" id="efeld"></div><div class="ehud" id="ehud"></div>
    <div class="ekarte" id="ekarte"><div class="ekopf">${ico('stern')} Überraschung im Riff!</div><h2>${EREIGNIS_INFO[spiel][0]}</h2><p>${EREIGNIS_INFO[spiel][1]}</p>
    <p class="ebonus">Bonus bis zu ${EREIGNIS.perlen[3]} Perlen ${PERLE} und ${EREIGNIS.funken[3]} Korallenfunken ${FUNKE}</p>
    <div class="zeile" style="justify-content:center;gap:12px"><button class="btn weiss" data-a="ereignisZu">Später</button><button class="btn gold gross" data-a="ereignisLos">Los!</button></div></div>`;
  rahmen.appendChild(d);
  TON.spiel('tap');
};
AKT.ereignisZu = () => { const d = $('#ereignis'); if (d) d.remove(); EG = null; };
AKT.ereignisLos = () => {
  const g = EG; if (!g || g.phase !== 'intro') return;
  g.phase = 'zaehlen';
  const k = $('#ekarte'); let n = 3;
  const zeig = () => {
    if (EG !== g || !$('#ekarte')) return;
    if (n === 0) { $('#ekarte').remove(); ereignisLauf(g); return; }
    $('#ekarte').className = 'ekarte zaehler'; $('#ekarte').innerHTML = `<b>${n}</b>`; TON.spiel('tap'); n--;
    setTimeout(zeig, 650);
  };
  void k; zeig();
};
function ereignisHud(g) {
  const h = $('#ehud'); if (!h) return;
  h.innerHTML = `<span class="chip gold">${ico('stern')} <b class="zahl">${g.punkte}</b> Punkte</span><div class="ezeit"><b style="width:${Math.max(0, g.zeit / EREIGNIS.dauer * 100)}%"></b></div>`;
}
const IGEL_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${ART.star(32, 32, 30, 14, 12)}" fill="#6B3F8F" stroke="#14253F" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="32" r="14" fill="#8E5BC4" stroke="#14253F" stroke-width="3"/><circle cx="26" cy="29" r="3" fill="#fff"/><circle cx="38" cy="29" r="3" fill="#fff"/><path d="M26 39q6 -4 12 0" fill="none" stroke="#14253F" stroke-width="3" stroke-linecap="round"/></svg>`;
function ereignisLauf(g) {
  g.phase = 'laeuft'; g.liste = []; g.spawn = 0; g.letzt = performance.now(); g.tempo = 1;
  const feld = $('#efeld'); if (!feld) { EG = null; return; }
  if (g.spiel === 'krebs') {
    const el = document.createElement('div'); el.className = 'ekrebs';
    el.innerHTML = ART.figur('krebs', PAL.gold, 'krone', 'ekrebs', 1);
    feld.appendChild(el);
    g.krebs = { el, x: feld.clientWidth * 0.5, vx: 180, wechsel: 1, hop: 0 };
    el.addEventListener('pointerdown', ev => { ev.preventDefault(); ereignisKrebsTreffer(g, ev); });
  }
  const tick = ts => {
    if (EG !== g || !$('#efeld')) { if (EG === g) EG = null; return; }
    const dt = Math.min(0.05, (ts - g.letzt) / 1000); g.letzt = ts; g.zeit -= dt;
    const W = feld.clientWidth, H = feld.clientHeight;
    if (g.spiel === 'blasen') ereignisBlasenTick(g, feld, dt, W, H); else ereignisKrebsTick(g, dt, W, H);
    ereignisHud(g);
    if (g.zeit <= 0) { ereignisEnde(g); return; }
    requestAnimationFrame(tick);
  };
  ereignisHud(g); requestAnimationFrame(tick);
}
function ereignisBlasenTick(g, feld, dt, W, H) {
  const fortschritt = 1 - g.zeit / EREIGNIS.dauer;
  g.spawn -= dt;
  if (g.spawn <= 0) {
    g.spawn = 0.34 - fortschritt * 0.08 + rand() * 0.1;
    const r = rand(), typ = r < 0.12 ? 'igel' : r < 0.27 ? 'gold' : 'normal', gr = typ === 'gold' ? 54 : 58 + rand() * 20;
    const el = document.createElement('div'); el.className = 'eblase ' + typ; el.style.width = el.style.height = gr + 'px';
    if (typ === 'igel') el.innerHTML = IGEL_SVG;
    const b = { el, x: gr / 2 + rand() * (W - gr), y: H + gr, vy: (typ === 'gold' ? 190 : 120) + rand() * 80 + fortschritt * 70, typ, gr, tot: false, ph: rand() * 6.28 };
    el.addEventListener('pointerdown', ev => { ev.preventDefault(); ereignisBlase(g, b); });
    feld.appendChild(el); g.liste.push(b);
  }
  for (let i = g.liste.length - 1; i >= 0; i--) {
    const b = g.liste[i];
    if (b.tot) { g.liste.splice(i, 1); continue; }
    b.y -= b.vy * dt;
    const wx = Math.sin(performance.now() / 600 + b.ph) * 10;
    b.el.style.transform = `translate(${(b.x - b.gr / 2 + wx).toFixed(1)}px,${(b.y - b.gr / 2).toFixed(1)}px)`;
    if (b.y < -b.gr) { b.el.remove(); g.liste.splice(i, 1); }
  }
}
function ereignisBlase(g, b) {
  if (EG !== g || g.phase !== 'laeuft' || b.tot) return;
  b.tot = true;
  const r = b.el.getBoundingClientRect();
  if (b.typ === 'igel') { g.punkte = Math.max(0, g.punkte - 2); TON.spiel('schwer'); b.el.classList.add('aua'); }
  else { g.punkte += b.typ === 'gold' ? 3 : 1; g.treffer++; TON.spiel(b.typ === 'gold' ? 'selten' : 'perle'); b.el.classList.add('platzt'); FX.blasen(r.left + r.width / 2, r.top + r.height / 2, b.typ === 'gold' ? 12 : 6); }
  setTimeout(() => b.el.remove(), 260);
}
function ereignisKrebsTick(g, dt, W, H) {
  const k = g.krebs; if (!k) return;
  k.wechsel -= dt;
  if (k.wechsel <= 0) { k.wechsel = 0.5 + rand() * 0.9; k.vx = (rand() < 0.5 ? -1 : 1) * (150 + rand() * 120); k.hop = 0.35; }
  k.x += k.vx * g.tempo * dt;
  const gr = Math.min(120, W * 0.14);
  if (k.x < gr / 2) { k.x = gr / 2; k.vx = Math.abs(k.vx); } else if (k.x > W - gr / 2) { k.x = W - gr / 2; k.vx = -Math.abs(k.vx); }
  k.hop = Math.max(0, k.hop - dt);
  const spring = Math.sin(k.hop / 0.35 * Math.PI) * 36, y = H * 0.74 - spring;
  k.el.style.width = k.el.style.height = gr + 'px';
  k.el.style.transform = `translate(${(k.x - gr / 2).toFixed(1)}px,${(y - gr / 2).toFixed(1)}px) scaleX(${k.vx < 0 ? 1 : -1})`;
}
function ereignisKrebsTreffer(g, ev) {
  if (EG !== g || g.phase !== 'laeuft') return;
  g.punkte++; g.treffer++; g.tempo = Math.min(2.6, g.tempo * 1.1);
  g.krebs.vx = -g.krebs.vx; g.krebs.hop = 0.35; g.krebs.wechsel = 0.4 + rand() * 0.5;
  g.krebs.el.classList.remove('treffer'); void g.krebs.el.offsetWidth; g.krebs.el.classList.add('treffer');
  TON.spiel('perle'); FX.blasen(ev.clientX, ev.clientY, 8);
}
function ereignisBelohnen(u, spiel, punkte) {                         // → { sterne, perlen, funken, abzeichen }
  const sterne = ereignisSterne(spiel, punkte), perlen = EREIGNIS.perlen[sterne], funken = EREIGNIS.funken[sterne];
  u.perlen += perlen; if (funken) u.funken = funkenStand(u) + funken;
  u.stats.ereignisse = (u.stats.ereignisse || 0) + 1; if (sterne === 3) u.stats.ereignis3 = (u.stats.ereignis3 || 0) + 1;
  const abzeichen = pruefeAbzeichen(u);
  sichere();
  return { sterne, perlen, funken, abzeichen };
}
function perlenAnzeige(u) { const z = $('.top .rechts .zahl'); if (z) z.textContent = nf(u.perlen); }   // Perlen oben sofort auffrischen, ohne die Ansicht neu zu zeichnen
function ereignisEnde(g) {
  g.phase = 'ende';
  const u = cur(), res = ereignisBelohnen(u, g.spiel, g.punkte); perlenAnzeige(u);
  g.ergebnis = res;
  const feld = $('#efeld'); if (feld) feld.innerHTML = '';
  const h = $('#ehud'); if (h) h.innerHTML = '';
  const d = $('#ereignis'); if (!d) { EG = null; return; }
  const k = document.createElement('div'); k.className = 'ekarte'; k.id = 'ekarte';
  k.innerHTML = `<h2>${res.sterne === 3 ? 'Perfekt!' : res.sterne ? 'Gut gemacht!' : 'Geschafft!'}</h2><div class="sterne3">${[0, 1, 2].map(i => `<span style="--i:${i}">${STERN_SVG(i < res.sterne ? '#FFC83D' : '#D4E3EC')}</span>`).join('')}</div>
    <p>${g.punkte} Punkte</p><p class="ebonus">+${res.perlen} ${res.perlen === 1 ? 'Perle' : 'Perlen'} ${PERLE}${res.funken ? ` · +${res.funken} Korallenfunken ${FUNKE}` : ''}</p>
    <div class="zeile" style="justify-content:center"><button class="btn gruen gross" data-a="ereignisZu">Toll!</button></div>`;
  d.appendChild(k);
  TON.spiel(res.sterne === 3 ? 'ziel' : 'fertig'); if (res.sterne >= 2) FX.konfetti(res.sterne === 3 ? 120 : 60);
  res.abzeichen.forEach((b, i) => setTimeout(() => toast(`Neues Abzeichen: ${BADGES[b].name}`, 'stern', 3200), 500 + i * 900));
}
AKT.ereignisSchalter = () => { const u = cur(); u.set.ereignisse = u.set.ereignisse === false; if (u.set.ereignisse === false) ereignisTokenWeg(); sichere(); render(); };
