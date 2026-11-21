'use strict';
// ---------- Mythen der Tiefe: Fabelwesen und Gegenstände mit mystischem Leuchten ----------
// Sie stecken nicht im Riff-Laden und nicht in der Freunde-Serie. Man findet sie sehr selten in Muscheln und in Überraschungspaketen.
// Jede Zeichnung hat eine pulsierende Aura und funkelnde Sterne (SVG-Animation). Im Riff leuchten sie nachts stärker.
// Aufbau je Eintrag: wesen = schwimmt im Riff herum (Freund-Verhalten), sonst Gegenstand; bew = Bewegungsart (siehe BEWEGUNG in 14z-riffleben);
// freude = Freuden-Bewegungen; emit = [Teilchen je Sekunde, Art, Steighöhe] für Gegenstände; basis = Breite im Riff (Einheiten).
const MYTH_RAR = { name: 'Mythisch', farbe: '#C46BFF', serie: 'Mythen der Tiefe' };
const MYTH = {};
const mythSvg = id => MYTH[id].svg();
const mythIds = () => Object.keys(MYTH);
(() => {
  const I = INK, K = ART.kit, T = ART.T, eye = ART.eye;
  const W = b => `<g stroke="${I}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${b}</g>`;
  const fk = (x, y, R, d = 0, f = '#FFF7C2') => `<path d="M${x} ${y - R}Q${x + R * .16} ${y - R * .16} ${x + R} ${y}Q${x + R * .16} ${y + R * .16} ${x} ${y + R}Q${x - R * .16} ${y + R * .16} ${x - R} ${y}Q${x - R * .16} ${y - R * .16} ${x} ${y - R}Z" fill="${f}" stroke="${I}" stroke-width="2.2"><animate attributeName="opacity" values="1;.3;1" dur="${(2.2 + d * .7).toFixed(1)}s" begin="${d}s" repeatCount="indefinite"/></path>`;
  const aura = (id, c, cy = 104, r = 94) => `<radialGradient id="mg_${id}" cx="50%" cy="50%" r="50%"><stop offset=".28" stop-color="${c}" stop-opacity=".85"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const auraKreis = (id, cy = 104, r = 94) => `<circle cx="100" cy="${cy}" r="${r}" fill="url(#mg_${id})" stroke="none"><animate attributeName="opacity" values=".6;1;.6" dur="3.4s" repeatCount="indefinite"/></circle>`;
  const lin = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const rund = (id, mitte, rand) => `<radialGradient id="${id}" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="${mitte}"/><stop offset="1" stop-color="${rand}"/></radialGradient>`;
  const huelle = (id, glow, defs, body, vorn, cy, r) => `<svg class="myth" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${aura(id, glow)}${defs || ''}</defs>${auraKreis(id, cy, r)}${W(body)}${vorn || ''}</svg>`;
  const bez = (p, t) => { const u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; };
  const dbez = (p, t) => { const u = 1 - t; return [3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]), 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5])]; };
  const zacken = (seg, ts, len, w, fill, seite = 1) => ts.map(t => {          // kleine Rückenflossen entlang einer Kurve
    const [x, y] = bez(seg, t), [dx, dy] = dbez(seg, t), l = Math.hypot(dx, dy) || 1, nx = -dy / l * seite, ny = dx / l * seite, tx = dx / l, ty = dy / l;
    return `<path d="M${(x - tx * w).toFixed(1)} ${(y - ty * w).toFixed(1)} L${(x + nx * len + tx * w * .3).toFixed(1)} ${(y + ny * len + ty * w * .3).toFixed(1)} L${(x + tx * w).toFixed(1)} ${(y + ty * w).toFixed(1)}Z" fill="${fill}"/>`;
  }).join('');

  const def = (id, name, wesen, glow, text, basis, extra, svg) => { MYTH[id] = Object.assign({ id, name, wesen, glow, text, basis, svg }, extra); };

  // ---------- Fabelwesen ----------
  def('selene', 'Hippokamp Selene', true, '#A8DCFF', 'Trägt den Mond auf der Stirn. Nachts schenkt sie jedem Wort ein leises Leuchten.', 19, { bew: { typ: 'schweber', v: 6, r: 18 }, freude: ['wippen', 'puls'] }, () => {
    const defs = lin('sk', '#F4FBFF', '#BFE4FF') + lin('sm', '#FFB8F0', '#B99BFF') + lin('sf', '#9DE8FF', '#57B4FF');
    const koerper = `
      <path d="M100 54C124 40 150 50 148 72C146 90 130 92 118 84C130 78 128 68 116 68C110 68 106 72 104 76Z" fill="url(#sm)"/>
      <path d="M116 58C134 52 144 60 142 70" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
      ${T('M88 84C100 108 96 130 118 146', 26, '#DDF1FF')}
      ${T('M118 146C146 164 172 148 164 122C160 106 142 110 146 124', 18, '#BFE4FF')}
      <path d="M146 124C134 106 146 88 162 96C174 112 160 128 146 124Z" fill="url(#sf)"/>
      ${zacken([88, 84, 100, 108, 96, 130, 118, 146], [.2, .45, .7], 13, 7, '#C8A8FF', -1)}
      <path d="M96 112C80 112 70 124 74 136C88 136 98 128 100 118Z" fill="url(#sf)"/>
      <path d="M106 118q8 4 8 12M118 134q8 3 10 11" fill="none" stroke-width="3" stroke="#8FB9E6"/>
      <circle cx="74" cy="68" r="29" fill="url(#sk)"/>
      <ellipse cx="53" cy="80" rx="17" ry="13" fill="url(#sk)"/>
      <path d="M80 44L90 22L96 48Z" fill="#BFE4FF"/>
      <path d="M64 42L56 4L78 40Z" fill="#FFF3B0"/><path d="M60 28l13 4M58 17l10 4" fill="none" stroke-width="3"/>
      <path d="M62 54a9 9 0 1 0 9 9a7 7 0 1 1-9-9Z" fill="#FFD866" stroke-width="3"/>
      ${eye(76, 70, 8)}${K.cheek(64, 84, 7, 5)}<circle cx="44" cy="78" r="2.6" fill="${I}" stroke="none"/><path d="M46 88q6 4 12 0" fill="none" stroke-width="3.5"/>`;
    return huelle('selene', '#A8DCFF', defs, koerper, fk(24, 30, 9, .2) + fk(164, 154, 8, 1) + fk(176, 52, 6, 1.6), 104, 92);
  });

  def('naga', 'Seedrache Naga', true, '#5CF0C0', 'Hütet in seiner Perle jedes Wort, das je gelernt wurde. Er vergisst keins.', 21, { bew: { typ: 'schwimmer', v: 7, r: 30 }, freude: ['wippen', 'dreh'] }, () => {
    const s1 = [40, 170, 14, 130, 72, 136, 86, 106], s2 = [86, 106, 100, 78, 56, 66, 84, 42];
    const defs = rund('nk', '#9FFFE0', '#27C99A');
    const koerper = `
      <path d="M40 170C22 176 14 188 20 196C36 194 50 184 56 172Z" fill="#FFC83D"/>
      ${T('M' + s1.slice(0, 2).join(' ') + 'C' + s1.slice(2).join(' ') + 'C' + s2.slice(2).join(' '), 24, '#2FD3A0')}
      <path d="M${s1[0]} ${s1[1]}C${s1.slice(2).join(' ')}C${s2.slice(2).join(' ')}" fill="none" stroke="#C9FFE9" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 13"/>
      ${zacken(s1, [.22, .5, .78], 14, 7, '#FFC83D', -1)}${zacken(s2, [.22, .55], 14, 7, '#FFC83D', -1)}
      <path d="M70 40C60 36 52 40 50 48C58 46 62 52 66 54Z" fill="#7AF5D2"/><path d="M104 40C114 36 122 40 124 48C116 46 112 52 108 54Z" fill="#7AF5D2"/>
      <path d="M72 24C62 6 48 6 44 14C54 14 62 22 66 32Z" fill="#FFC83D"/><path d="M102 24C112 6 126 6 130 14C120 14 112 22 108 32Z" fill="#FFC83D"/>
      <circle cx="87" cy="42" r="28" fill="url(#nk)"/>
      <ellipse cx="87" cy="56" rx="17" ry="11" fill="#C9FFE9" stroke="none"/>
      <path d="M62 48C46 44 34 52 28 62M112 48C128 44 140 52 146 62" fill="none" stroke="#FFD866" stroke-width="4.5"/>
      ${eye(76, 38, 7.5)}${eye(98, 38, 7.5)}<circle cx="82" cy="54" r="2" fill="${I}" stroke="none"/><circle cx="92" cy="54" r="2" fill="${I}" stroke="none"/><path d="M80 61q7 5 14 0" fill="none" stroke-width="3.5"/>${K.cheek(67, 52, 6, 4)}${K.cheek(107, 52, 6, 4)}
      <circle cx="140" cy="116" r="18" fill="#fff" fill-opacity=".85"/><circle cx="140" cy="116" r="18" fill="none"/><path d="M130 112a11 11 0 0 1 8-7" fill="none" stroke="#7AF5D2" stroke-width="3.5"/>`;
    return huelle('naga', '#5CF0C0', defs, koerper, fk(140, 94, 8, .3) + fk(30, 90, 7, 1.1) + fk(168, 150, 6, .8), 104, 94);
  });

  def('ignis', 'Glutqualle Ignis', true, '#FF9A3D', 'Sie brennt nie, sie wärmt nur. Ihr Licht macht Mut vor jedem Test.', 19, { bew: { typ: 'treiber', v: 5, r: 18 }, freude: ['puls', 'wippen'] }, () => {
    const defs = lin('ik', '#FFD866', '#FF7A3D');
    const tent = (x, dx, c) => `${T(`M${x} 108q${dx} 18 0 32t0 32t${dx * -.6} 22`, 9, c)}<path d="M${(x - dx * .5).toFixed(1)} 176q${(dx * .3).toFixed(1)} -14 ${(dx * .6).toFixed(1)} 0q${(-dx * .1).toFixed(1)} 14 ${(-dx * .6).toFixed(1)} 0Z" fill="#FFD866" stroke-width="3"/>`;
    const koerper = `
      ${tent(58, 10, '#FFA24D')}${tent(142, -10, '#FFA24D')}${tent(80, -9, '#FF8A3D')}${tent(120, 9, '#FF8A3D')}${tent(100, 7, '#FFB866')}
      <path d="M100 44C84 34 88 14 100 4C112 14 116 34 100 44Z" fill="#FF7A3D"/><path d="M100 40C92 32 94 20 100 12C106 20 108 32 100 40Z" fill="#FFE27A" stroke="none"/>
      <path d="M72 50C60 42 62 24 70 16C80 26 84 40 78 52Z" fill="#FF7A3D"/><path d="M128 50C140 42 138 24 130 16C120 26 116 40 122 52Z" fill="#FF7A3D"/>
      <path d="M38 108C32 60 64 40 100 40C136 40 168 60 162 108C142 120 58 120 38 108Z" fill="url(#ik)"/>
      <path d="M52 84C56 66 70 54 86 52" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5"/>
      <circle cx="66" cy="98" r="3" fill="#FF7A3D" stroke="none"/><circle cx="134" cy="94" r="3" fill="#FF7A3D" stroke="none"/><circle cx="150" cy="78" r="2.5" fill="#FF7A3D" stroke="none"/>
      ${eye(80, 82, 9)}${eye(120, 82, 9)}${K.cheek(64, 98, 8, 5)}${K.cheek(136, 98, 8, 5)}<path d="M92 96q8 8 16 0" fill="none" stroke-width="4"/>`;
    return huelle('ignis', '#FF9A3D', defs, koerper, fk(30, 40, 9, .2) + fk(172, 30, 7, .9) + fk(176, 130, 6, 1.4), 98, 94);
  });

  def('atlas', 'Sternenschildkröte Atlas', true, '#FFD866', 'Trägt eine ganze Insel auf dem Rücken und kennt jeden Stern beim Namen.', 20, { bew: { typ: 'schwimmer', v: 3, r: 16 }, freude: ['wackeln', 'wippen'] }, () => {
    const defs = lin('at', '#5460C8', '#232C74') + lin('ar', '#7BE0B4', '#2F9C80');
    const sterne = [[56, 86, 5], [84, 66, 6], [112, 90, 5], [140, 70, 6], [100, 112, 5]];
    const linien = 'M56 86L84 66L112 90L140 70M112 90L100 112';
    const koerper = `
      <path d="M34 130C14 134 8 152 20 164C36 160 48 150 52 138Z" fill="url(#ar)"/><path d="M166 130C186 134 192 152 180 164C164 160 152 150 148 138Z" fill="url(#ar)"/>
      <path d="M28 132C24 76 62 40 100 40C138 40 176 76 172 132Z" fill="url(#at)"/>
      <path d="M24 132H176C176 146 156 152 100 152C44 152 24 146 24 132Z" fill="url(#ar)"/>
      <path d="${linien}" fill="none" stroke="#FFE9A0" stroke-width="2.6" stroke-opacity=".9"/>
      ${sterne.map(([x, y, r]) => K.funkel(x, y, r + 3)).join('')}
      <path d="M72 48C80 30 120 30 128 48Z" fill="#F6E3B4" stroke-width="4"/>
      <path d="M97 40L99 18H103L105 40Z" fill="#fff" stroke-width="3.5"/><path d="M98 32L102 32L103 27L97 27Z" fill="#E5484D" stroke="none"/><circle cx="101" cy="14" r="6" fill="#FFE27A" stroke-width="3.5"/>
      <circle cx="100" cy="158" r="25" fill="url(#ar)"/>
      ${eye(89, 154, 7.5)}${eye(111, 154, 7.5)}${K.cheek(78, 166, 6, 4)}${K.cheek(122, 166, 6, 4)}<path d="M93 167q7 5 14 0" fill="none" stroke-width="3.5"/>`;
    return huelle('atlas', '#FFD866', defs, koerper, fk(24, 56, 9, .3) + fk(176, 44, 8, 1) + fk(100, 188, 6, 1.7, '#FFF7C2'), 104, 94);
  });

  def('cirrus', 'Himmelswal Cirrus', true, '#C9B8FF', 'Singt so tief, dass die Wellen die Vokabeln mitsummen.', 21, { bew: { typ: 'gleiter', v: 6, r: 40 }, freude: ['wippen', 'sprung'] }, () => {
    const defs = lin('ck', '#F7F2FF', '#C9B8FF');
    const koerper = `
      ${T('M102 56C102 40 100 28 100 16', 5, '#BDEBFF')}${T('M102 56C112 44 124 38 134 42', 5, '#BDEBFF')}${T('M102 56C92 44 80 38 70 42', 5, '#BDEBFF')}<circle cx="100" cy="10" r="5" fill="#BDEBFF" stroke-width="3"/><circle cx="139" cy="46" r="4.5" fill="#BDEBFF" stroke-width="3"/><circle cx="65" cy="46" r="4.5" fill="#BDEBFF" stroke-width="3"/>
      <path d="M44 100C26 98 14 82 18 64C30 70 40 72 48 70Z" fill="#C9B8FF"/><path d="M18 64C4 62 -2 48 4 38C14 40 20 50 18 64Z" fill="#E4D8FF"/>
      <path d="M24 122C20 82 60 56 104 58C146 60 176 88 172 122C168 152 130 166 96 162C60 158 28 150 24 122Z" fill="url(#ck)"/>
      <path d="M46 134C68 156 126 164 158 142C146 160 90 172 46 134Z" fill="#fff" stroke="none"/>
      <g fill="#fff"><circle cx="72" cy="60" r="14"/><circle cx="96" cy="52" r="17"/><circle cx="122" cy="58" r="14"/></g>
      <path d="M62 66C70 74 82 74 90 66M92 64C100 72 112 72 118 62" fill="none" stroke-width="3" stroke="#C9B8FF"/>
      <path d="M96 150C80 156 78 172 92 172C104 168 110 158 106 150Z" fill="#C9B8FF"/>
      ${K.funkel(88, 100, 7)}${K.funkel(112, 122, 6)}${K.funkel(66, 114, 5)}
      ${eye(138, 104, 9)}${K.cheek(152, 120, 7, 5)}<path d="M146 130q10 6 22 0" fill="none" stroke-width="4"/>`;
    return huelle('cirrus', '#C9B8FF', defs, koerper, fk(116, 8, 8, .2) + fk(36, 30, 6, 1) + fk(172, 160, 7, 1.5) + fk(10, 150, 6, .6), 104, 94);
  });

  // ---------- Gegenstände ----------
  def('dreizack', 'Poseidons Dreizack', false, '#5CE6FF', 'Wer ihn anfasst, hört das Meer flüstern.', 15, { emit: [0.35, 'stern', 30] }, () => {
    const defs = lin('dg', '#FFE48A', '#F0A800');
    const koerper = `<g transform="rotate(-10 100 110)">
      ${T('M100 190V72', 11, '#F5B93A')}
      <path d="M92 168h16M92 150h16M92 132h16" stroke-width="4" fill="none"/>
      <path d="M84 120q-14 -8 0 -16t0 -16q-14 -8 0 -16" fill="none" stroke="#5CE6FF" stroke-width="6"/>
      ${T('M66 34C66 62 80 74 100 74C120 74 134 62 134 34', 9, 'url(#dg)')}
      ${T('M100 74V26', 9, 'url(#dg)')}
      <path d="M100 2L112 30H88Z" fill="#FFE48A"/><path d="M66 14L78 38H54Z" fill="#FFE48A"/><path d="M134 14L146 38H122Z" fill="#FFE48A"/>
      <circle cx="100" cy="78" r="11" fill="#5CE6FF"/><path d="M95 75q3 -5 8 -3" fill="none" stroke="#fff" stroke-width="3"/></g>`;
    return huelle('dreizack', '#5CE6FF', defs, koerper, fk(34, 60, 9, .2) + fk(168, 100, 8, 1) + fk(148, 168, 6, 1.5) + `<circle cx="44" cy="150" r="5" fill="#BDF0F7" stroke="${I}" stroke-width="2.5"/><circle cx="158" cy="132" r="4" fill="#BDF0F7" stroke="${I}" stroke-width="2.5"/>`, 100, 92);
  });

  def('wunschperle', 'Wunschperle', false, '#FFB8F5', 'Schimmert in allen Farben. Man sagt, sie erfüllt einen Wunsch pro Mondphase.', 15, { emit: [0.4, 'stern', 34] }, () => {
    const defs = rund('wp', '#FFFFFF', '#E8B8FF') + lin('wm', '#FFA6D6', '#E0679A') + `<radialGradient id="wq" cx="50%" cy="50%" r="50%"><stop offset=".5" stop-color="#7DF9FF" stop-opacity="0"/><stop offset="1" stop-color="#7DF9FF" stop-opacity=".55"/></radialGradient>`;
    const koerper = `
      <path d="M26 132C20 76 66 42 100 42C134 42 180 76 174 132Z" fill="url(#wm)"/>
      <path d="M100 44V130M70 52L60 128M130 52L140 128M46 76L40 128M154 76L160 128" fill="none" stroke-width="3" stroke="#E0679A"/>
      <circle cx="100" cy="108" r="36" fill="url(#wp)"/><circle cx="100" cy="108" r="36" fill="url(#wq)" stroke="none"/>
      <path d="M78 96a26 26 0 0 1 18 -16" fill="none" stroke="#fff" stroke-width="6"/>
      <path d="M24 130C24 170 60 188 100 188C140 188 176 170 176 130C160 154 40 154 24 130Z" fill="url(#wm)"/>
      <path d="M56 160q14 8 28 8M120 168q14 -2 26 -10" fill="none" stroke-width="3" stroke="#E0679A"/>`;
    return huelle('wunschperle', '#FFB8F5', defs, koerper, fk(100, 20, 10, .2) + fk(30, 78, 8, .9) + fk(172, 70, 7, 1.4) + fk(150, 12, 5, .5) + fk(50, 24, 5, 1.8), 104, 94);
  });

  def('krone', 'Krone des Meereskönigs', false, '#FFE066', 'Schwebt von ganz allein. Sie wartet auf jemanden, der fleißig getaucht ist.', 16, { emit: [0.4, 'stern', 32] }, () => {
    const defs = lin('kg', '#FFE48A', '#F0A800');
    const koerper = `
      <ellipse cx="100" cy="186" rx="44" ry="6" fill="#000" fill-opacity=".14" stroke="none"/>
      <path d="M46 126C24 120 10 100 16 82C30 90 42 100 50 112Z" fill="#fff"/><path d="M154 126C176 120 190 100 184 82C170 90 158 100 150 112Z" fill="#fff"/>
      <path d="M44 128L36 72L70 102L100 54L130 102L164 72L156 128Z" fill="url(#kg)"/>
      <path d="M44 128H156V152C132 162 68 162 44 152Z" fill="url(#kg)"/>
      <path d="M44 140C70 150 130 150 156 140" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
      <circle cx="36" cy="68" r="8" fill="#fff" stroke-width="3.5"/><circle cx="100" cy="50" r="9" fill="#fff" stroke-width="3.5"/><circle cx="164" cy="68" r="8" fill="#fff" stroke-width="3.5"/>
      <path d="M100 84l12 12l-12 16l-12 -16Z" fill="#E5484D" stroke-width="3.5"/><circle cx="62" cy="128" r="8" fill="#4FB5DD" stroke-width="3.5"/><circle cx="138" cy="128" r="8" fill="#2FB38A" stroke-width="3.5"/><circle cx="100" cy="138" r="7" fill="#8E6BE0" stroke-width="3.5"/>`;
    return huelle('krone', '#FFE066', defs, koerper, fk(24, 40, 9, .2) + fk(176, 42, 8, 1) + fk(100, 20, 6, 1.5), 104, 94);
  });

  def('tor', 'Gezeitentor', false, '#6FA8FF', 'Zeigt bei Flut ein Tor in eine andere Welt.', 20, { emit: [0.5, 'blase', 36] }, () => {
    const defs = lin('tp', '#7DF9FF', '#2A3CC8') + lin('ts', '#B5C6D9', '#8FA2B8');
    const koerper = `
      <path d="M60 190V94C60 62 140 62 140 94V190Z" fill="url(#tp)"/>
      <path d="M78 150C70 120 90 100 112 108C130 116 126 140 108 140C94 140 92 124 104 122" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5"/>
      <path d="M72 176C98 168 126 176 132 160" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>
      <path d="M26 190V86C26 24 174 24 174 86V190H140V94C140 62 60 62 60 94V190Z" fill="url(#ts)"/>
      <path d="M84 40L116 40L110 68H90Z" fill="#9FB3C8"/><circle cx="100" cy="54" r="8" fill="#FFE27A" stroke-width="3.5"/>
      <path d="M36 112l8 8m0 -8l-8 8M36 146h10M40 138v16M152 124l8 8m0 -8l-8 8M154 156h10M158 148v16" fill="none" stroke="#7DF9FF" stroke-width="3.5"/>
      <path d="M30 74q-6 16 0 30M170 74q6 16 0 30" fill="none" stroke="#3FBF7F" stroke-width="6"/>`;
    return huelle('tor', '#6FA8FF', defs, koerper, fk(100, 28, 8, .2) + fk(18, 120, 7, 1) + fk(182, 140, 7, 1.6) + fk(100, 120, 6, 0.6, '#fff'), 108, 94);
  });

  def('kristall', 'Mondkristall', false, '#B58CFF', 'Speichert das Mondlicht und gibt es nachts ganz langsam zurück.', 17, { emit: [0.45, 'stern', 34] }, () => {
    const defs = lin('kl', '#E6D8FF', '#B58CFF') + lin('kd', '#B58CFF', '#6445B8');
    const koerper = `
      <path d="M60 78L78 104L72 176L44 182L38 112Z" fill="url(#kd)"/><path d="M60 78L38 112L44 182L28 160L30 116Z" fill="url(#kl)"/>
      <path d="M142 70L166 100L160 170L132 176L126 104Z" fill="url(#kd)"/><path d="M142 70L126 104L132 176L120 150L122 104Z" fill="url(#kl)"/>
      <path d="M100 10L124 40L120 172L100 186L80 172L76 40Z" fill="url(#kd)"/><path d="M100 10L76 40L80 172L100 186Z" fill="url(#kl)"/>
      <path d="M90 48L88 150" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5"/>
      <path d="M20 190C40 170 160 170 180 190Z" fill="#8FA2B8"/>
      <path d="M96 94a9 9 0 1 0 9 9a7 7 0 1 1-9-9Z" fill="#FFF3B0" stroke-width="3"/>`;
    return huelle('kristall', '#B58CFF', defs, koerper, fk(40, 40, 9, .2) + fk(168, 44, 8, 1) + fk(100, 192, 6, 1.5) + fk(20, 140, 6, .7), 100, 94);
  });
})();

// ---------- Beliebtheit der Funde ----------
// Chancen in Prozent je Muschel (nur wer schon etwas tiefer getaucht ist) – stehen offen im „Chancen“-Fenster.
const MYTH_CHANCE = { perl: 0.8, schatz: 2.5, ab: 10 };               // ab = Tauchtiefe in Metern
const mythBesitz = u => (u.myth = u.myth || {});
const mythZahl = u => Object.keys(mythBesitz(u)).length;
const mythPlatziert = (u, id) => u.riff.items.some(i => i.kind === 'myth' && i.ref === id);
