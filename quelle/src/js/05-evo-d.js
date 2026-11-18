'use strict';
// ---------- Entwicklungsformen, Teil D: Narwal, Seestern, Wal, Seehund (Stufe 2 und 3 mit eigenem Körper) ----------
(() => {
  const { T, eye, cheek, smile, shine, mix, sym, klinge, brauen, augeA, funkel, welle, star } = ART.kit;
  const MUND = '#8E2640', ZUNGE = '#FF8FA8';

  // ---------- Narwal: Hornträger → Polarlicht ----------
  const horn = (bx, by, tx, ty, w, fill, rcol, n = 5) => {       // Horn von der Wurzel (bx,by) zur Spitze (tx,ty) mit schrägen Rillen
    const dx = tx - bx, dy = ty - by, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
    let r = '';
    for (let i = 1; i <= n; i++) { const t = i / (n + 1), cx = bx + dx * t, cy = by + dy * t, hw = w * (1 - t) * 0.95; r += `M${(cx + nx * hw - ux * 4).toFixed(1)} ${(cy + ny * hw - uy * 4).toFixed(1)} L${(cx - nx * hw + ux * 4).toFixed(1)} ${(cy - ny * hw + uy * 4).toFixed(1)} `; }
    return `<path d="M${(bx + nx * w).toFixed(1)} ${(by + ny * w).toFixed(1)} L${tx} ${ty} L${(bx - nx * w).toFixed(1)} ${(by - ny * w).toFixed(1)}Z" fill="${fill}"/><path d="${r}" fill="none" stroke="${rcol}" stroke-width="3.2"/>`;
  };
  ART.evo.narwal = {
    2: p => ({
      hd: { x: 100, top: 28, r: 52, ey: 70, ex: 24, cw: 46, chin: 112, sx: 58 },
      svg: `${horn(98, 50, 58, -8, 11, p.a, p.d)}
        <path d="M100 168 C84 168 60 166 36 150 C46 180 72 192 100 192 C128 192 154 180 164 150 C140 166 116 168 100 168Z" fill="${p.d}"/>
        ${sym(`<path d="M62 110 C40 110 22 126 16 150 C36 154 56 142 66 128Z" fill="${p.d}"/>`)}
        <path d="M44 82 C44 44 70 28 100 28 C130 28 156 44 156 82 C156 104 146 116 136 128 C130 146 124 160 110 172 Q100 176 90 172 C76 160 70 146 64 128 C54 116 44 104 44 82Z" fill="${p.m}"/>
        <path d="M62 102 C74 94 88 92 100 92 C112 92 126 94 138 102 C136 118 130 130 124 142 C120 154 114 164 106 170 Q100 172 94 170 C86 164 80 154 76 142 C70 130 64 118 62 102Z" fill="${p.b}" stroke="none"/>
        ${[[56, 94, 4], [146, 90, 5], [66, 70, 3.4], [138, 66, 3.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.d}" opacity=".55" stroke="none"/>`).join('')}
        <path d="${welle(78, 146, 3)}" fill="none" stroke="${p.d}" stroke-width="3.2" opacity=".5"/>
        ${shine('M50 82 C54 58 74 42 98 38 C80 50 68 66 62 88Z')}
        ${eye(76, 72, 10)}${eye(124, 72, 10)}${brauen(100, 72, 24, 0.8)}${smile(100, 108, 12, 9)}${cheek(54, 98, 8, 5)}${cheek(146, 98, 8, 5)}`
    }),
    3: p => ({
      hd: { x: 100, top: 26, r: 56, ey: 72, ex: 26, cw: 50, chin: 114, sx: 62 },
      svg: `<path d="M54 -4 C30 -10 6 12 18 40 C26 58 12 74 2 90" fill="none" stroke="#7DF9C8" stroke-width="11" opacity=".65"/>
        <path d="M56 -2 C96 -16 150 -6 178 22 C194 40 190 66 204 84" fill="none" stroke="#B08CFF" stroke-width="10" opacity=".6"/>
        <path d="M58 0 C102 2 140 16 158 40" fill="none" stroke="#FF9DEB" stroke-width="8" opacity=".6"/>
        ${horn(98, 50, 50, -10, 13, mix(p.a, '#ffffff', 0.5), p.d, 6)}${funkel(50, -6, 9)}
        <path d="M100 168 C80 168 52 164 20 142 C32 178 66 196 100 196 C134 196 168 178 180 142 C148 164 120 168 100 168Z" fill="${p.d}"/>
        ${sym(`<path d="M26 148 L16 134 L36 140Z M42 168 L38 182 L54 172Z" fill="#E8F6FF" stroke-width="3"/>`)}
        ${sym(`<path d="M60 108 C34 108 12 126 6 154 C30 160 54 146 66 128Z" fill="${p.d}"/>`)}
        <path d="M38 84 C38 44 68 26 100 26 C132 26 162 44 162 84 C162 106 150 118 140 130 C134 148 126 162 112 174 Q100 178 88 174 C74 162 66 148 60 130 C50 118 38 106 38 84Z" fill="${p.m}"/>
        <path d="M58 104 C72 94 88 92 100 92 C112 92 128 94 142 104 C140 120 134 132 128 144 C122 156 116 166 106 172 Q100 174 94 172 C84 166 78 156 72 144 C66 132 60 120 58 104Z" fill="${p.b}" stroke="none"/>
        ${[[60, 94, 7, 3], [140, 90, 6, 2.6], [68, 66, 5, 2.2], [134, 62, 5, 2.2], [48, 120, 5, 2.2], [152, 118, 5, 2.2]].map(([x, y, R, r]) => `<path d="${star(x, y, R, r, 6)}" fill="#fff" stroke-width="2"/>`).join('')}
        <path d="${welle(76, 148, 3)} ${welle(80, 160, 3, 9, 4)}" fill="none" stroke="${p.d}" stroke-width="3.2" opacity=".5"/>
        ${shine('M44 84 C48 58 72 40 98 36 C78 50 66 68 60 90Z')}
        ${augeA(74, 74, 11, p.a)}${augeA(126, 74, 11, p.a)}${smile(100, 110, 13, 9)}${cheek(52, 100, 8, 5)}${cheek(148, 100, 8, 5)}`
    })
  };

  // ---------- Seestern: Glitzerstern → Sternenwunder ----------
  const rippen = (cx, cy, n, R, col, w = 3.5) => Array.from({ length: n }, (_, i) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return `M${cx} ${cy} L${(cx + Math.cos(a) * R).toFixed(1)} ${(cy + Math.sin(a) * R).toFixed(1)}`; }).join(' ');
  const spitzen = (cx, cy, n, R, r, col) => Array.from({ length: n }, (_, i) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return `<circle cx="${(cx + Math.cos(a) * R).toFixed(1)}" cy="${(cy + Math.sin(a) * R).toFixed(1)}" r="${r}" fill="${col}" stroke-width="3"/>`; }).join('');
  ART.evo.seestern = {
    2: p => ({
      hd: { x: 100, top: 50, r: 40, ey: 100, ex: 18, cw: 24, chin: 128, sx: 44 },
      svg: `<path d="${star(100, 106, 98, 50, 5, -54)}" fill="${p.d}"/>
        <path d="${star(100, 104, 94, 46, 5)}" fill="${p.m}"/>
        <path d="${star(100, 104, 62, 30, 5)}" fill="${p.b}" opacity=".45" stroke="none"/>
        <path d="${rippen(100, 104, 5, 78, p.d)}" fill="none" stroke="${p.d}" stroke-width="3.5" opacity=".45"/>
        ${spitzen(100, 104, 5, 84, 5.5, '#FFD866')}
        <path d="M100 66 L108 76 L100 86 L92 76Z" fill="${mix(p.a, '#ffffff', 0.35)}" stroke-width="3"/>
        ${shine('M52 94 C60 72 76 60 94 58 C78 68 68 82 64 100Z')}
        ${eye(84, 104, 10)}${eye(116, 104, 10)}${brauen(100, 104, 18, 0.7)}${smile(100, 124, 9, 8)}${cheek(66, 118, 8, 5)}${cheek(134, 118, 8, 5)}`
    }),
    3: p => ({
      hd: { x: 100, top: 50, r: 40, ey: 100, ex: 18, cw: 24, chin: 128, sx: 44 },
      svg: `<path d="${star(100, 106, 106, 58, 7)}" fill="${mix(p.a, '#ffffff', 0.25)}"/>
        <path d="${star(100, 104, 92, 46, 5)}" fill="${p.m}"/>
        <path d="${star(100, 104, 62, 30, 5)}" fill="${p.b}" opacity=".5" stroke="none"/>
        <path d="${rippen(100, 104, 5, 80, p.d)}" fill="none" stroke="${p.d}" stroke-width="3.5" opacity=".5"/>
        ${spitzen(100, 104, 5, 82, 6, '#FFD866')}
        <circle cx="100" cy="76" r="17" fill="#fff" opacity=".4" stroke="none"/><path d="M100 62 L111 76 L100 90 L89 76Z" fill="${mix(p.a, '#ffffff', 0.45)}" stroke-width="3.2"/>
        ${[[50, 56, 7], [152, 52, 6], [34, 130, 6], [166, 132, 7], [100, 190, 7]].map(([x, y, r]) => funkel(x, y, r)).join('')}
        ${shine('M50 94 C58 70 76 58 94 56 C78 66 66 82 62 100Z')}
        ${augeA(84, 106, 10, p.a)}${augeA(116, 106, 10, p.a)}${smile(100, 125, 9, 8)}${cheek(66, 120, 8, 5)}${cheek(134, 120, 8, 5)}`
    })
  };

  // ---------- Wal: Tiefensänger → Ozeanstimme ----------
  const nota = (x, y, col, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M7 -2 V-28 q11 3 13 15" fill="none" stroke="${INK}" stroke-width="9"/><path d="M7 -2 V-28 q11 3 13 15" fill="none" stroke="${col}" stroke-width="4"/><ellipse cx="0" cy="0" rx="8" ry="6" transform="rotate(-22)" fill="${col}"/></g>`;
  const WALKOERPER = 'M30 90 C30 48 62 28 100 28 C138 28 170 48 170 90 C170 112 158 124 148 136 C140 152 130 166 114 178 Q100 184 86 178 C70 166 60 152 52 136 C42 124 30 112 30 90Z';
  ART.evo.wal = {
    2: p => ({
      hd: { x: 100, top: 28, r: 62, ey: 80, ex: 28, cw: 56, chin: 140, sx: 70 },
      svg: `<path d="M100 168 C84 168 60 166 36 150 C46 180 72 192 100 192 C128 192 154 180 164 150 C140 166 116 168 100 168Z" fill="${p.d}"/>
        ${T('M100 30 C100 14 84 4 70 8 M100 30 C100 14 116 4 130 8', 7, '#BDF0F7')}
        ${sym(`<path d="M52 112 C30 112 12 128 8 154 C28 158 48 148 58 134Z" fill="${p.d}"/>`)}
        <path d="${WALKOERPER}" fill="${p.m}"/>
        <path d="M50 108 C66 98 84 96 100 96 C116 96 134 98 150 108 C146 124 140 134 134 146 C128 160 118 172 106 178 Q100 180 94 178 C82 172 72 160 66 146 C60 134 54 124 50 108Z" fill="${p.b}" stroke="none"/>
        <path d="M64 142 Q100 152 136 142 M68 154 Q100 164 132 154 M76 166 Q100 174 124 166" fill="none" stroke="${p.d}" stroke-width="3" opacity=".5"/>
        <path d="M72 106 Q100 100 128 106 Q124 134 100 134 Q76 134 72 106Z" fill="${MUND}"/><ellipse cx="100" cy="127" rx="14" ry="5.5" fill="${ZUNGE}" stroke="none"/>
        ${nota(164, 56, p.a)}${nota(184, 96, mix(p.a, '#ffffff', 0.3), 0.85)}${nota(30, 60, mix(p.a, '#ffffff', 0.3), 0.85)}
        ${shine('M40 84 C44 58 70 40 98 36 C76 50 62 70 56 92Z')}
        ${eye(72, 80, 11)}${eye(128, 80, 11)}<path d="M60 62 Q72 54 84 62 M116 62 Q128 54 140 62" fill="none" stroke-width="3.6"/>${cheek(46, 102, 9, 6)}${cheek(154, 102, 9, 6)}`
    }),
    3: p => ({
      hd: { x: 100, top: 26, r: 66, ey: 80, ex: 29, cw: 60, chin: 142, sx: 74 },
      svg: `<circle cx="100" cy="116" r="106" fill="none" stroke="${p.a}" stroke-width="5" opacity=".28"/><circle cx="100" cy="116" r="88" fill="none" stroke="${p.a}" stroke-width="5" opacity=".4"/>
        <path d="M100 168 C80 168 52 164 20 142 C32 178 66 196 100 196 C134 196 168 178 180 142 C148 164 120 168 100 168Z" fill="${p.d}"/>
        <path d="M30 150 C50 172 72 186 100 188 C128 186 150 172 170 150" fill="none" stroke="${p.a}" stroke-width="3.4"/>
        ${T('M100 28 C100 10 80 -2 62 4 M100 28 C100 10 120 -2 138 4 M100 28 V4', 7, '#BDF0F7')}
        ${sym(`<path d="M50 112 C26 110 6 128 2 156 C26 162 48 150 58 134Z" fill="${p.d}"/>`)}
        <path d="${WALKOERPER}" fill="${p.m}"/>
        <path d="M50 108 C66 98 84 96 100 96 C116 96 134 98 150 108 C146 124 140 134 134 146 C128 160 118 172 106 178 Q100 180 94 178 C82 172 72 160 66 146 C60 134 54 124 50 108Z" fill="${p.b}" stroke="none"/>
        <path d="M64 142 Q100 152 136 142 M68 154 Q100 164 132 154 M76 166 Q100 174 124 166" fill="none" stroke="${p.d}" stroke-width="3" opacity=".5"/>
        ${sym(`<path d="M40 92 C34 112 38 134 50 150 M52 78 C44 96 46 112 54 126" fill="none" stroke="${p.a}" stroke-width="3.6"/><circle cx="50" cy="150" r="4" fill="${p.a}" stroke-width="2.4"/><circle cx="54" cy="126" r="3.4" fill="${p.a}" stroke-width="2.2"/>`)}
        <path d="M74 108 Q100 102 126 108 Q122 130 100 130 Q78 130 74 108Z" fill="${MUND}"/><ellipse cx="100" cy="123" rx="13" ry="5" fill="${ZUNGE}" stroke="none"/>
        ${nota(160, 46, p.a, 1.15)}${nota(184, 92, mix(p.a, '#ffffff', 0.3), 0.95)}${nota(26, 56, mix(p.a, '#ffffff', 0.3), 1)}${funkel(172, 140, 7)}${funkel(26, 130, 6)}
        ${shine('M38 86 C42 58 70 38 98 34 C76 48 60 68 54 94Z')}
        ${augeA(71, 80, 12, p.a)}${augeA(129, 80, 12, p.a)}${cheek(44, 102, 9, 6)}${cheek(156, 102, 9, 6)}`
    })
  };

  // ---------- Seehund: Wellenhüpfer → Robben-Champion ----------
  const keil = (cx, cy, r, a0, a1, col) => { const t0 = a0 * Math.PI / 180, t1 = a1 * Math.PI / 180; return `<path d="M${cx} ${cy} L${(cx + r * Math.cos(t0)).toFixed(1)} ${(cy + r * Math.sin(t0)).toFixed(1)} A${r} ${r} 0 0 1 ${(cx + r * Math.cos(t1)).toFixed(1)} ${(cy + r * Math.sin(t1)).toFixed(1)}Z" fill="${col}" stroke="none"/>`; };
  const seehundKopf = (p, cy, r, extra = '') => `<circle cx="100" cy="${cy}" r="${r}" fill="${p.m}"/>
    <ellipse cx="100" cy="${cy + 18}" rx="${r * 0.58}" ry="${r * 0.42}" fill="${p.b}" stroke="none"/>
    <path d="M92 ${cy + 8} Q100 ${cy + 2} 108 ${cy + 8} Q104 ${cy + 16} 100 ${cy + 16} Q96 ${cy + 16} 92 ${cy + 8}Z" fill="${INK}"/>
    <path d="M100 ${cy + 16} V${cy + 24} M100 ${cy + 24} Q92 ${cy + 32} 84 ${cy + 26} M100 ${cy + 24} Q108 ${cy + 32} 116 ${cy + 26}" fill="none" stroke-width="3.4"/>
    <path d="M72 ${cy + 12} L40 ${cy + 4} M72 ${cy + 18} L38 ${cy + 20} M72 ${cy + 24} L42 ${cy + 36} M128 ${cy + 12} L160 ${cy + 4} M128 ${cy + 18} L162 ${cy + 20} M128 ${cy + 24} L158 ${cy + 36}" fill="none" stroke="#fff" stroke-width="2.6"/>
    ${extra}`;
  ART.evo.seehund = {
    2: p => ({
      hd: { x: 100, top: 40, r: 50, ey: 86, ex: 22, cw: 42, chin: 140, sx: 50 },
      svg: `${sym(`<path d="M70 192 C54 204 34 202 24 190 C40 180 62 180 72 186Z" fill="${p.d}"/><path d="M50 138 C24 124 6 128 0 146 C18 158 42 154 56 146Z" fill="${p.d}"/>`)}
        <ellipse cx="100" cy="158" rx="56" ry="42" fill="${p.m}"/>
        <ellipse cx="100" cy="164" rx="36" ry="28" fill="${p.b}" stroke="none"/>
        <path d="${welle(82, 168, 3)}" fill="none" stroke="${p.d}" stroke-width="3" opacity=".5"/>
        ${seehundKopf(p, 90, 50)}
        <circle cx="100" cy="28" r="24" fill="#fff"/>${keil(100, 28, 24, -90, -30, '#E5484D')}${keil(100, 28, 24, 30, 90, '#4FA3D8')}${keil(100, 28, 24, 150, 210, '#FFC83D')}<circle cx="100" cy="28" r="24" fill="none"/><circle cx="100" cy="28" r="4" fill="#fff" stroke-width="3"/>
        <path d="M84 18 a16 16 0 0 1 12 -9" fill="none" stroke="#fff" stroke-width="3.4" opacity=".8"/>
        ${shine('M58 70 C62 54 78 44 94 42 C80 50 70 62 66 76Z')}
        ${eye(78, 86, 10)}${eye(122, 86, 10)}${cheek(60, 108, 8, 5)}${cheek(140, 108, 8, 5)}`
    }),
    3: p => {
      const blatt = (a, c) => { const t = a * Math.PI / 180, x = 100 + Math.cos(t) * 54, y = 90 + Math.sin(t) * 54; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="5" transform="rotate(${a + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${c}" stroke-width="3"/>`; };
      const lorbeer = [196, 212, 228, 244, 296, 312, 328, 344].map(a => blatt(a, '#3FBF7F')).join('');
      return {
        hd: { x: 100, top: 40, r: 54, ey: 88, ex: 23, cw: 44, chin: 142, sx: 54 },
        svg: `${sym(`<path d="M70 192 C54 204 34 202 24 190 C40 180 62 180 72 186Z" fill="${p.d}"/><path d="M54 140 C30 128 10 106 12 80 C30 82 52 100 62 124Z" fill="${p.d}"/>`)}
          <ellipse cx="100" cy="158" rx="60" ry="44" fill="${p.m}"/>
          <ellipse cx="100" cy="164" rx="40" ry="30" fill="${p.b}" stroke="none"/>
          ${seehundKopf(p, 90, 52)}
          ${lorbeer}
          ${T('M92 6 C80 6 80 24 94 26 M108 6 C120 6 120 24 106 26', 5, '#FFC83D')}
          <path d="M82 -6 H118 C118 18 112 30 100 32 C88 30 82 18 82 -6Z" fill="#FFC83D"/><path d="M100 32 V40" fill="none" stroke-width="7"/><path d="M88 40 H112 V46 H88Z" fill="#FFD866"/>
          <path d="${star(100, 10, 9, 4, 5)}" fill="#fff" stroke-width="2.4"/>
          ${T('M84 140 L100 160 L116 140', 8, '#E5484D')}
          <circle cx="100" cy="168" r="15" fill="#FFC83D" stroke-width="4"/><path d="${star(100, 168, 9, 4, 5)}" fill="#fff" stroke-width="2.4"/>
          ${shine('M56 72 C60 54 78 44 94 42 C80 50 70 62 66 78Z')}
          ${augeA(77, 88, 11, p.a)}${augeA(123, 88, 11, p.a)}${cheek(58, 110, 8, 5)}${cheek(142, 110, 8, 5)}${funkel(26, 30, 7)}`
      };
    }
  };
})();
