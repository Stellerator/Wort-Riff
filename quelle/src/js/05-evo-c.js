'use strict';
// ---------- Entwicklungsformen, Teil C: Kugelfisch, Clownfisch, Anglerfisch, Krebs (Stufe 2 und 3 mit eigenem Körper) ----------
(() => {
  const { T, eye, cheek, smile, shine, zahn, mix, sym, klinge, brauen, augeA, funkel, stacheln, star } = ART.kit;
  const MUND = '#8E2640';
  const ring = n => Array.from({ length: n }, (_, i) => i * 360 / n);
  const ellStacheln = (cx, cy, rx, ry, winkel, len, w, fill) => winkel.map(a => {          // Stacheln auf einer Ellipse
    const t = a * Math.PI / 180, bx = cx + rx * Math.cos(t), by = cy + ry * Math.sin(t);
    let nx = Math.cos(t) / rx, ny = Math.sin(t) / ry; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
    const tx = -ny, ty = nx;
    return `<path d="M${(bx + tx * w - nx * 4).toFixed(1)} ${(by + ty * w - ny * 4).toFixed(1)} L${(bx + nx * len).toFixed(1)} ${(by + ny * len).toFixed(1)} L${(bx - tx * w - nx * 4).toFixed(1)} ${(by - ty * w - ny * 4).toFixed(1)}Z" fill="${fill}"/>`;
  }).join('');

  // ---------- Kugelfisch: Großkugel → Sternenkugel ----------
  ART.evo.kugel = {
    2: p => ({
      hd: { x: 100, top: 40, r: 62, ey: 96, ex: 24, cw: 44, chin: 166, sx: 74 },
      svg: `${stacheln(100, 102, 60, ring(16), 22, 8, p.d)}
        <path d="M84 164 C70 180 68 196 84 204 C92 198 108 198 116 204 C132 196 130 180 116 164Z" fill="${p.d}"/>
        <path d="M92 172 L86 198 M100 174 L100 202 M108 172 L114 198" fill="none" stroke="${p.b}" stroke-width="2.6" opacity=".7"/>
        ${sym(`<path d="M40 102 C14 88 0 106 6 130 C22 140 42 132 48 118Z" fill="${p.d}"/>`)}
        <circle cx="100" cy="102" r="66" fill="${p.m}"/>
        <path d="M40 124 C52 160 76 172 100 172 C124 172 148 160 160 124 C144 138 122 144 100 144 C78 144 56 138 40 124Z" fill="${p.b}" stroke="none"/>
        ${[[64, 58, 5], [90, 46, 6], [118, 48, 5], [142, 64, 6], [52, 86, 4], [150, 88, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.d}" stroke="none"/>`).join('')}
        ${shine('M44 88 C48 66 66 50 88 44 C68 56 58 72 56 94Z')}
        <ellipse cx="100" cy="130" rx="12" ry="9" fill="${p.a}"/><ellipse cx="100" cy="130" rx="5" ry="4.4" fill="${INK}" stroke="none"/>
        ${eye(74, 96, 13)}${eye(126, 96, 13)}${brauen(100, 96, 26, 1.1)}${cheek(50, 122, 10, 7)}${cheek(150, 122, 10, 7)}`
    }),
    3: p => ({
      hd: { x: 100, top: 38, r: 66, ey: 96, ex: 26, cw: 46, chin: 168, sx: 78 },
      svg: `${stacheln(100, 102, 62, ring(12), 34, 9, p.a)}
        ${[-150, -120, -90, -60, -30].map(a => funkel(100 + Math.cos(a * Math.PI / 180) * 102, 102 + Math.sin(a * Math.PI / 180) * 102, 7)).join('')}
        <path d="M80 164 C62 182 60 200 78 208 C88 200 112 200 122 208 C140 200 138 182 120 164Z" fill="${p.d}"/>
        <path d="M90 172 L82 202 M100 174 L100 206 M110 172 L118 202" fill="none" stroke="${p.a}" stroke-width="3" opacity=".8"/>
        ${sym(`<path d="M38 100 C10 80 -6 100 0 128 C16 140 40 132 48 116Z" fill="${p.d}"/><path d="M40 104 L6 108 M42 112 L6 124" fill="none" stroke="${p.a}" stroke-width="3"/>`)}
        <circle cx="100" cy="102" r="68" fill="${p.m}"/>
        <path d="M38 124 C50 162 76 174 100 174 C124 174 150 162 162 124 C146 138 122 144 100 144 C78 144 54 138 38 124Z" fill="${p.b}" stroke="none"/>
        <path d="${star(100, 156, 15, 6.5, 5)}" fill="${p.a}" stroke-width="3"/>
        ${[[64, 60, 5], [92, 46, 6], [120, 50, 5], [144, 68, 5], [54, 88, 4]].map(([x, y, r]) => funkel(x, y, r)).join('')}
        ${shine('M42 88 C46 64 66 48 90 42 C68 54 58 72 54 94Z')}
        <ellipse cx="100" cy="128" rx="12" ry="9" fill="${p.a}"/><ellipse cx="100" cy="128" rx="5" ry="4.4" fill="${INK}" stroke="none"/>
        ${augeA(74, 96, 13, p.a)}${augeA(126, 96, 13, p.a)}${cheek(48, 122, 10, 7)}${cheek(152, 122, 10, 7)}`
    })
  };

  // ---------- Clownfisch: Streifenstar → Riff-Legende ----------
  ART.evo.clown = {
    2: p => ({
      hd: { x: 100, top: 40, r: 56, ey: 88, ex: 16, cw: 40, chin: 150, sx: 62 },
      svg: `<defs><clipPath id="cl_${p.id}"><ellipse cx="100" cy="102" rx="58" ry="64"/></clipPath></defs>
        <path d="M80 158 C60 176 56 198 74 206 C84 196 96 200 100 208 C104 200 116 196 126 206 C144 198 140 176 120 158Z" fill="${p.d}"/>
        <path d="M100 166 V204 M88 168 L80 198 M112 168 L120 198" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
        <path d="M56 66 C50 30 80 8 100 2 C120 8 150 30 144 66Z" fill="${p.d}"/>
        <path d="M100 8 V60 M80 16 L72 60 M120 16 L128 60" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
        ${sym(`<path d="M44 108 C20 102 6 118 10 142 C28 144 44 134 50 122Z" fill="${p.d}"/>`)}
        <ellipse cx="100" cy="102" rx="58" ry="64" fill="${p.m}"/>
        <g clip-path="url(#cl_${p.id})"><rect x="48" y="30" width="22" height="150" fill="#fff"/><rect x="130" y="30" width="22" height="150" fill="#fff"/><path d="M48 30 V180 M70 30 V180 M130 30 V180 M152 30 V180" fill="none" stroke-width="4.4"/></g>
        <ellipse cx="100" cy="102" rx="58" ry="64" fill="none"/>
        ${shine('M44 84 C48 62 68 46 90 42 C70 54 60 70 58 92Z')}
        ${eye(84, 88, 11)}${eye(116, 88, 11)}${brauen(100, 88, 16, 0.85)}${smile(100, 116, 12, 9)}${cheek(60, 112, 8, 5)}${cheek(140, 112, 8, 5)}`
    }),
    3: p => {
      const anem = [-62, -42, -21, 0, 21, 42, 62].map((a, i) => `<g transform="rotate(${a} 100 56)">${T('M100 56 C94 38 106 24 100 8', 7, i % 2 ? '#FF8FC0' : '#FF9DC2')}<circle cx="100" cy="6" r="5.4" fill="#8E6BE0" stroke-width="3"/></g>`).join('');
      const GOLD = '#FFD866';
      return {
        hd: { x: 100, top: 40, r: 58, ey: 88, ex: 17, cw: 42, chin: 152, sx: 64 },
        svg: `<defs><clipPath id="cl_${p.id}"><ellipse cx="100" cy="102" rx="60" ry="66"/></clipPath></defs>
          ${anem}
          <path d="M82 160 C66 170 52 186 44 208 C62 200 76 200 86 208 C90 198 96 198 100 212 C104 198 110 198 114 208 C124 200 138 200 156 208 C148 186 134 170 118 160Z" fill="${p.d}"/>
          <path d="M44 208 C62 200 76 200 86 208 C90 198 96 198 100 212 C104 198 110 198 114 208 C124 200 138 200 156 208" fill="none" stroke="${GOLD}" stroke-width="3.4"/>
          ${sym(`<path d="M44 104 C16 92 -2 108 2 138 C10 130 18 132 22 142 C28 134 36 134 42 142 C48 132 50 124 50 118Z" fill="${p.d}"/><path d="M42 112 L8 114 M42 120 L10 130" fill="none" stroke="${GOLD}" stroke-width="3"/>`)}
          <ellipse cx="100" cy="102" rx="60" ry="66" fill="${p.m}"/>
          <g clip-path="url(#cl_${p.id})"><rect x="46" y="30" width="24" height="150" fill="#fff"/><rect x="130" y="30" width="24" height="150" fill="#fff"/><path d="M46 30 V180 M70 30 V180 M130 30 V180 M154 30 V180" fill="none" stroke-width="4.4"/></g>
          <ellipse cx="100" cy="102" rx="60" ry="66" fill="none"/>
          ${funkel(58, 98, 7)}${funkel(142, 98, 7)}${funkel(58, 138, 5)}${funkel(142, 138, 5)}
          ${shine('M42 84 C46 60 68 44 90 40 C70 52 58 68 56 92Z')}
          ${augeA(84, 88, 11, '#FFC83D')}${augeA(116, 88, 11, '#FFC83D')}${smile(100, 118, 12, 9)}${cheek(62, 114, 8, 5)}${cheek(138, 114, 8, 5)}`
      };
    }
  };

  // ---------- Anglerfisch: Lichtfänger → Tiefenlicht ----------
  const ANGLER_KOERPER = 'M28 114 C28 74 58 52 100 52 C142 52 172 74 172 114 C172 156 140 178 100 178 C60 178 28 156 28 114Z';
  const bulbe = (x, y, r, halo = 1.9) => `<circle cx="${x}" cy="${y}" r="${(r * halo).toFixed(1)}" fill="#FFE680" opacity=".32" stroke="none"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFE680"/><path d="M${x - r * 0.5} ${y - r * 0.3} a${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.6} ${-r * 0.5}" fill="none" stroke="#fff" stroke-width="3"/>`;
  ART.evo.angler = {
    2: p => ({
      hd: { x: 100, top: 50, r: 58, ey: 92, ex: 20, cw: 54, chin: 170, sx: 72 },
      svg: `<path d="M82 168 C64 184 62 198 78 206 C90 198 110 198 122 206 C138 198 136 184 118 168Z" fill="${p.d}"/>
        ${T('M100 58 C92 8 148 -4 164 28', 8, p.d)}${bulbe(164, 40, 14)}
        ${sym(klinge(64, 66, 94, 58, 38, 34, 0.04, p.d))}
        ${sym(`<path d="M34 116 C8 110 0 132 8 152 C26 154 44 146 50 134Z" fill="${p.d}"/>`)}
        <path d="${ANGLER_KOERPER}" fill="${p.m}"/>
        ${sym([[44, 92], [38, 112], [52, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#7DF9FF" stroke-width="2.4"/>`).join(''))}
        <path d="M40 118 Q100 180 160 118 Q100 138 40 118Z" fill="${MUND}"/>
        ${zahn(52, 123, 10, 16)}${zahn(68, 132, 10, 16)}${zahn(86, 137, 10, 16)}${zahn(108, 137, 10, 16)}${zahn(126, 132, 10, 16)}${zahn(142, 123, 10, 16)}
        ${shine('M42 98 C46 78 64 62 88 58 C68 70 56 84 54 104Z')}
        ${augeA(80, 92, 11, p.a)}${augeA(120, 92, 11, p.a)}${brauen(100, 92, 20, 0.9)}`
    }),
    3: p => ({
      hd: { x: 100, top: 48, r: 60, ey: 92, ex: 21, cw: 56, chin: 172, sx: 74 },
      svg: `<path d="M78 168 C58 186 54 202 74 210 C88 202 112 202 126 210 C146 202 142 186 122 168Z" fill="${p.d}"/>
        ${T('M100 56 C98 30 108 14 104 4', 7, p.d)}${bulbe(104, 6, 13, 2.1)}${funkel(104, 6, 8)}
        ${sym(T('M70 60 C54 34 30 30 20 46', 6, p.d) + bulbe(18, 50, 9))}
        ${sym(klinge(54, 74, 88, 60, 24, 40, 0.04, p.d))}
        ${sym(`<path d="M34 114 C6 106 -6 130 2 154 C22 158 42 148 50 134Z" fill="${p.d}"/><path d="M36 124 L6 134 M38 132 L8 148" fill="none" stroke="#7DF9FF" stroke-width="3"/>`)}
        <path d="${ANGLER_KOERPER}" fill="${p.m}"/>
        ${sym([[42, 90], [36, 108], [46, 126], [60, 140], [76, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="#7DF9FF" stroke-width="2.4"/>`).join(''))}
        <path d="M36 118 Q100 188 164 118 Q100 138 36 118Z" fill="${MUND}"/>
        ${[[48, 122], [62, 132], [78, 139], [94, 142], [108, 142], [124, 139], [140, 132], [154, 122]].map(([x, y]) => zahn(x, y, 10, 17)).join('')}
        ${shine('M42 98 C46 78 64 62 88 58 C68 70 56 84 54 104Z')}
        ${augeA(80, 90, 12, p.a)}${augeA(120, 90, 12, p.a)}${brauen(100, 90, 20, 1)}`
    })
  };

  // ---------- Krebs: Scherenmeister → Scheren-Champion ----------
  const KLAUE = 'M28 74 C8 70 4 40 22 28 C20 42 28 52 40 54 C44 40 52 32 60 34 C56 52 48 66 28 74Z';
  const beine = p => sym(T('M54 142 L24 160', 9, p.d) + T('M58 152 L34 178', 9, p.d) + T('M68 160 L52 190', 9, p.d));
  ART.evo.krebs = {
    2: p => ({
      hd: { x: 100, top: 26, r: 52, ey: 62, ex: 20, cw: 50, chin: 160, sx: 64 },
      svg: `${beine(p)}
        ${T('M56 114 C40 108 32 94 32 82', 14, p.m)}
        <path d="${KLAUE}" fill="${p.m}"/>
        ${T('M148 118 C168 116 180 104 180 88', 16, p.m)}
        <g stroke-width="3.4" transform="translate(180 92) scale(-1.5 1.5) translate(-28 -74)"><path d="${KLAUE}" fill="${p.m}"/></g>
        ${ellStacheln(100, 128, 64, 46, [-160, -135, -110, -90, -70, -45, -20], 18, 7, p.d)}
        <ellipse cx="100" cy="128" rx="64" ry="46" fill="${p.m}"/>
        <path d="M58 132 C62 152 80 164 100 164 C120 164 138 152 142 132 C126 142 112 144 100 144 C88 144 74 142 58 132Z" fill="${p.b}" stroke="none"/>
        ${T('M84 88 L82 64', 6, p.d)}${T('M116 88 L118 64', 6, p.d)}
        ${shine('M48 116 C52 100 68 88 86 86 C70 96 60 108 58 122Z')}
        ${eye(82, 60, 11)}${eye(118, 60, 11)}${brauen(100, 60, 18, 0.9)}${smile(100, 128, 10, 9)}${cheek(60, 134)}${cheek(140, 134)}`
    }),
    3: p => ({
      hd: { x: 100, top: 22, r: 56, ey: 60, ex: 21, cw: 52, chin: 160, sx: 66 },
      svg: `${beine(p)}
        ${T('M52 118 C32 118 20 106 20 92', 16, p.m)}
        <g stroke-width="3.4" transform="translate(20 96) scale(1.5 1.5) translate(-28 -74)"><path d="${KLAUE}" fill="${p.m}"/></g>
        ${T('M148 118 C168 118 180 106 180 92', 16, p.m)}
        <g stroke-width="3.4" transform="translate(180 96) scale(-1.5 1.5) translate(-28 -74)"><path d="${KLAUE}" fill="${p.m}"/></g>
        <ellipse cx="20" cy="98" rx="16" ry="8" fill="${p.a}"/><ellipse cx="180" cy="98" rx="16" ry="8" fill="${p.a}"/>
        ${ellStacheln(100, 128, 66, 48, [-165, -140, -115, -90, -65, -40, -15], 22, 8, p.a)}
        <ellipse cx="100" cy="128" rx="66" ry="48" fill="${p.m}"/>
        <path d="M58 134 C62 154 80 166 100 166 C120 166 138 154 142 134 C126 144 112 146 100 146 C88 146 74 144 58 134Z" fill="${p.b}" stroke="none"/>
        <path d="M44 142 Q100 160 156 142 L152 160 Q100 178 48 160Z" fill="${p.a}"/>
        <circle cx="100" cy="156" r="14" fill="#FFF3A8" stroke-width="3.4"/><path d="M100 146 L108 156 L100 166 L92 156Z" fill="#E5484D" stroke-width="2.6"/>
        ${T('M84 88 L82 62', 6, p.d)}${T('M116 88 L118 62', 6, p.d)}
        ${shine('M48 114 C52 98 68 86 86 84 C70 94 60 106 58 120Z')}
        ${augeA(82, 58, 11, p.a)}${augeA(118, 58, 11, p.a)}${brauen(100, 58, 18, 1)}${smile(100, 126, 12, 9)}${cheek(60, 130)}${cheek(140, 130)}`
    })
  };
})();
