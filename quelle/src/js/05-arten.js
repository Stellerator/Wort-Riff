'use strict';
// ---------- Meerwesen als SVG: 16 Arten × Farbpaletten × Zubehör (alles selbst gezeichnet, Stil wie die Karten) ----------
// Jede Art liefert { svg, hd } mit Kopf-Anker hd: { x, top, r, ey, ex, chin, sx } in einem 200×200-Feld.
const INK = '#14253F';
const ART = (() => {
  const T = (d, w, fill) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 10}"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;   // Röhre mit Kontur
  const eye = (x, y, r = 9, dx = 1.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + dx}" cy="${y + 1}" r="${r * 0.62}" fill="${INK}" stroke="none"/><circle cx="${x + dx + r * 0.22}" cy="${y - r * 0.2}" r="${r * 0.24}" fill="#fff" stroke="none"/>`;
  const cheek = (x, y, rx = 9, ry = 6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#FF8FA8" opacity=".62" stroke="none"/>`;
  const smile = (x, y, w = 9, d = 8) => `<path d="M${x - w} ${y} Q${x} ${y + d} ${x + w} ${y}" fill="none" stroke-width="4"/>`;
  const shine = d => `<path d="${d}" fill="#fff" opacity=".35" stroke="none"/>`;
  const star = (cx, cy, R, r, n, rot = -90) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); } return d + 'Z'; };
  const zahn = (x, y, w = 9, h = 9) => `<path d="M${x} ${y} l${w} 0 l${-w / 2} ${h}Z" fill="#fff" stroke-width="2.5"/>`;
  const wrap = body => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;

  const arten = {
    hai: p => ({
      hd: { x: 100, top: 48, r: 56, ey: 100, ex: 24, cw: 50, chin: 168, sx: 76 },
      svg: `<path d="M100 14 C110 34 122 50 130 64 L70 64 C78 50 90 34 100 14Z" fill="${p.d}"/>
        <path d="M34 120 C14 122 6 138 4 156 C24 154 40 146 48 136Z" fill="${p.d}"/><path d="M166 120 C186 122 194 138 196 156 C176 154 160 146 152 136Z" fill="${p.d}"/>
        <path d="M22 118 C22 72 58 46 100 46 C142 46 178 72 178 118 C178 158 142 180 100 180 C58 180 22 158 22 118Z" fill="${p.m}"/>
        <path d="M42 130 C48 110 74 102 100 102 C126 102 152 110 158 130 C160 158 130 174 100 174 C70 174 40 158 42 130Z" fill="${p.b}" stroke="none"/>
        <path d="M78 134 L84 146 M92 138 L96 150" stroke="${p.d}" stroke-width="0" fill="none"/>
        <path d="M72 128 Q100 124 128 128 Q124 156 100 156 Q76 156 72 128Z" fill="#8E2640"/>
        ${zahn(77, 128, 9, 9)}${zahn(90, 127, 9, 10)}${zahn(103, 127, 9, 10)}${zahn(116, 128, 9, 9)}
        <ellipse cx="100" cy="150" rx="12" ry="5" fill="#FF8FA8" stroke="none"/>
        ${shine('M44 98 C50 78 70 62 92 58 C72 70 60 84 56 104Z')}
        ${eye(76, 100, 10)}${eye(124, 100, 10)}${cheek(54, 122)}${cheek(146, 122)}`
    }),
    orca: p => ({
      hd: { x: 100, top: 48, r: 56, ey: 102, ex: 24, cw: 50, chin: 168, sx: 76 },
      svg: `<path d="M100 8 C112 32 124 52 132 66 L68 66 C76 52 88 32 100 8Z" fill="${p.m}"/>
        <path d="M34 120 C12 118 6 138 8 156 C28 158 42 148 48 136Z" fill="${p.m}"/><path d="M166 120 C188 118 194 138 192 156 C172 158 158 148 152 136Z" fill="${p.m}"/>
        <path d="M22 118 C22 72 58 46 100 46 C142 46 178 72 178 118 C178 158 142 180 100 180 C58 180 22 158 22 118Z" fill="${p.m}"/>
        <path d="M38 128 C46 108 74 100 100 100 C126 100 154 108 162 128 C164 158 132 174 100 174 C68 174 36 158 38 128Z" fill="${p.b}" stroke="none"/>
        <path d="M54 92 C62 78 76 76 86 84 C80 96 66 100 54 92Z" fill="${p.b}"/><path d="M146 92 C138 78 124 76 114 84 C120 96 134 100 146 92Z" fill="${p.b}"/>
        ${shine('M44 100 C50 80 70 64 92 60 C72 72 60 86 56 106Z')}
        ${eye(76, 104, 9)}${eye(124, 104, 9)}${smile(100, 134, 14, 12)}${cheek(54, 126)}${cheek(146, 126)}`
    }),
    delfin: p => ({
      hd: { x: 100, top: 46, r: 54, ey: 98, ex: 26, cw: 50, chin: 160, sx: 72 },
      svg: `<path d="M96 14 C118 18 128 36 124 58 L84 58 C88 38 90 24 96 14Z" fill="${p.d}"/>
        <path d="M30 126 C10 116 4 98 8 82 C24 90 40 100 50 114Z" fill="${p.d}"/><path d="M170 126 C190 116 196 98 192 82 C176 90 160 100 150 114Z" fill="${p.d}"/>
        <path d="M24 112 C24 70 56 44 100 44 C144 44 176 70 176 112 C176 150 144 174 100 174 C56 174 24 150 24 112Z" fill="${p.m}"/>
        <path d="M40 126 C48 112 74 106 100 106 C126 106 152 112 160 126 C162 152 134 168 100 168 C66 168 38 152 40 126Z" fill="${p.b}" stroke="none"/>
        <ellipse cx="100" cy="134" rx="30" ry="22" fill="${p.m}"/><ellipse cx="100" cy="138" rx="24" ry="15" fill="${p.b}" stroke="none"/>
        ${smile(100, 140, 14, 8)}<circle cx="100" cy="52" r="3.2" fill="${INK}" stroke="none"/>
        ${shine('M44 94 C50 76 70 60 92 56 C72 68 60 82 56 100Z')}
        ${eye(74, 98, 10)}${eye(126, 98, 10)}${cheek(52, 118)}${cheek(148, 118)}`
    }),
    manta: p => ({
      hd: { x: 100, top: 62, r: 36, ey: 96, ex: 17, cw: 30, chin: 124, sx: 40 },
      svg: `${T('M100 148 Q94 176 108 194', 9, p.d)}
        <path d="M100 56 C70 34 28 46 4 92 C28 96 52 110 80 126 L100 154 L120 126 C148 110 172 96 196 92 C172 46 130 34 100 56Z" fill="${p.m}"/>
        <path d="M60 104 C74 112 86 120 100 150 C114 120 126 112 140 104 C128 100 114 104 100 112 C86 104 72 100 60 104Z" fill="${p.b}" stroke="none"/>
        <path d="M84 62 C76 50 78 38 84 32 C94 40 96 52 94 62Z" fill="${p.d}"/><path d="M116 62 C124 50 122 38 116 32 C106 40 104 52 106 62Z" fill="${p.d}"/>
        <circle cx="40" cy="86" r="4" fill="${p.b}" stroke="none"/><circle cx="160" cy="86" r="4" fill="${p.b}" stroke="none"/><circle cx="58" cy="98" r="3.4" fill="${p.b}" stroke="none"/><circle cx="142" cy="98" r="3.4" fill="${p.b}" stroke="none"/>
        ${eye(83, 94, 9)}${eye(117, 94, 9)}${smile(100, 112, 8, 7)}${cheek(68, 108, 8, 5)}${cheek(132, 108, 8, 5)}`
    }),
    schildkroete: p => ({
      hd: { x: 100, top: 30, r: 30, ey: 56, ex: 12, cw: 22, chin: 82, sx: 30 },
      svg: `<path d="M70 92 C40 84 22 92 14 110 C34 116 56 112 74 106Z" fill="${p.d}"/><path d="M130 92 C160 84 178 92 186 110 C166 116 144 112 126 106Z" fill="${p.d}"/>
        <path d="M70 160 C44 170 28 164 20 150 C40 142 60 146 76 154Z" fill="${p.d}"/><path d="M130 160 C156 170 172 164 180 150 C160 142 140 146 124 154Z" fill="${p.d}"/>
        <path d="M92 176 L108 176 L100 196Z" fill="${p.d}"/>
        <circle cx="100" cy="132" r="58" fill="${p.m}"/>
        <path d="M100 96 L128 116 L118 150 L82 150 L72 116Z" fill="${p.b}"/>
        <path d="M100 96 L100 76 M128 116 L152 108 M118 150 L136 172 M82 150 L64 172 M72 116 L48 108" fill="none" stroke-width="4"/>
        <circle cx="100" cy="60" r="28" fill="${p.d}"/>
        ${eye(88, 56, 8)}${eye(112, 56, 8)}${smile(100, 70, 7, 6)}${cheek(78, 66, 6, 4)}${cheek(122, 66, 6, 4)}`
    }),
    seepferd: p => ({
      hd: { x: 116, top: 26, r: 36, ey: 56, ex: 12, cw: 24, chin: 88, sx: 36 },
      svg: `${T('M110 150 C100 172 76 178 66 164 C60 152 76 148 80 158', 17, p.m)}
        <path d="M88 104 C66 92 52 106 58 128 C72 128 84 122 88 104Z" fill="${p.d}"/>
        ${T('M110 90 C134 106 134 136 110 150', 46, p.m)}
        <path d="M120 102 Q130 120 118 140 M127 106 Q137 122 128 136" fill="none" stroke="${p.b}" stroke-width="5"/>
        <path d="M90 36 L92 16 L102 30 L112 12 L120 28 L132 14 L134 36Z" fill="${p.d}"/>
        <circle cx="116" cy="60" r="36" fill="${p.m}"/>
        ${T('M142 70 L172 84', 15, p.m)}<circle cx="164" cy="80" r="2.6" fill="${INK}" stroke="none"/>
        ${shine('M96 46 C102 36 114 32 124 35 C112 38 104 46 100 58Z')}
        ${eye(123, 56, 12)}${cheek(106, 78, 8, 5)}`
    }),
    qualle: p => ({
      hd: { x: 100, top: 26, r: 56, ey: 76, ex: 20, cw: 56, chin: 104, sx: 62 },
      svg: `${T('M66 106 C54 126 76 140 62 160 C56 168 60 176 66 180', 10, p.d)}${T('M86 108 C76 128 98 142 84 162 C80 170 84 176 88 182', 10, p.d)}
        ${T('M114 108 C124 128 102 142 116 162 C120 170 116 176 112 182', 10, p.d)}${T('M134 106 C146 126 124 140 138 160 C144 168 140 176 134 180', 10, p.d)}
        ${T('M100 108 C92 126 108 142 98 164', 14, p.a)}
        <path d="M28 102 C26 54 60 24 100 24 C140 24 174 54 172 102 Q154 114 138 102 Q120 116 100 102 Q80 116 62 102 Q46 114 28 102Z" fill="${p.m}"/>
        <circle cx="52" cy="62" r="7" fill="${p.a}" opacity=".7" stroke="none"/><circle cx="150" cy="56" r="6" fill="${p.a}" opacity=".7" stroke="none"/><circle cx="100" cy="42" r="5" fill="${p.a}" opacity=".7" stroke="none"/>
        ${shine('M42 78 C44 56 62 38 86 32 C66 46 56 62 54 84Z')}
        ${eye(80, 76, 10)}${eye(120, 76, 10)}${smile(100, 92, 8, 7)}${cheek(60, 90)}${cheek(140, 90)}`
    }),
    oktopus: p => ({
      hd: { x: 100, top: 32, r: 60, ey: 92, ex: 22, cw: 56, chin: 134, sx: 66 },
      svg: `${T('M48 128 C40 150 60 160 52 176 C48 182 40 182 36 178', 17, p.m)}${T('M74 132 C68 154 86 164 78 182', 17, p.m)}${T('M100 134 C100 156 110 168 104 186', 17, p.m)}
        ${T('M126 132 C132 154 114 164 122 182', 17, p.m)}${T('M152 128 C160 150 140 160 148 176 C152 182 160 182 164 178', 17, p.m)}
        <path d="M32 98 C32 54 62 26 100 26 C138 26 168 54 168 98 C168 122 150 138 128 138 L72 138 C50 138 32 122 32 98Z" fill="${p.m}"/>
        <circle cx="64" cy="48" r="6" fill="${p.d}" opacity=".6" stroke="none"/><circle cx="134" cy="44" r="8" fill="${p.d}" opacity=".6" stroke="none"/><circle cx="104" cy="36" r="5" fill="${p.d}" opacity=".6" stroke="none"/>
        ${shine('M46 84 C48 62 66 42 90 36 C70 50 60 66 58 90Z')}
        ${eye(78, 94, 12)}${eye(122, 94, 12)}${smile(100, 116, 10, 9)}${cheek(54, 110)}${cheek(146, 110)}`
    }),
    kugel: p => {
      let sp = ''; for (let i = 0; i < 16; i++) { const a = (-160 + i * 140 / 15) * Math.PI / 180, x = 100 + Math.cos(a) * 60, y = 104 + Math.sin(a) * 60, x2 = 100 + Math.cos(a) * 80, y2 = 104 + Math.sin(a) * 80, nx = -Math.sin(a) * 7, ny = Math.cos(a) * 7; sp += `<path d="M${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}Z" fill="${p.d}" stroke-width="3.5"/>`; }
      return {
        hd: { x: 100, top: 42, r: 58, ey: 98, ex: 22, cw: 40, chin: 164, sx: 70 },
        svg: `${sp}<path d="M36 112 C16 106 10 124 18 138 C30 136 40 128 44 120Z" fill="${p.d}"/><path d="M164 112 C184 106 190 124 182 138 C170 136 160 128 156 120Z" fill="${p.d}"/>
        <circle cx="100" cy="104" r="64" fill="${p.m}"/>
        <path d="M44 120 C56 150 78 164 100 164 C122 164 144 150 156 120 C140 134 120 138 100 138 C80 138 60 134 44 120Z" fill="${p.b}" stroke="none"/>
        <circle cx="64" cy="66" r="3" fill="${p.d}" stroke="none"/><circle cx="136" cy="64" r="3" fill="${p.d}" stroke="none"/><circle cx="100" cy="56" r="3" fill="${p.d}" stroke="none"/>
        ${shine('M46 90 C50 70 66 54 88 48 C68 60 58 76 56 96Z')}
        ${eye(76, 98, 12)}${eye(124, 98, 12)}<ellipse cx="100" cy="128" rx="10" ry="8" fill="${p.a}"/><ellipse cx="100" cy="128" rx="4" ry="3.5" fill="${INK}" stroke="none"/>${cheek(52, 120, 10, 7)}${cheek(148, 120, 10, 7)}`
      };
    },
    clown: p => ({
      hd: { x: 100, top: 52, r: 54, ey: 100, ex: 22, cw: 44, chin: 160, sx: 70 },
      svg: `<defs><clipPath id="cl_${p.id || 'x'}"><ellipse cx="100" cy="108" rx="66" ry="56"/></clipPath></defs>
        <path d="M64 62 C76 28 124 28 136 62Z" fill="${p.d}"/>
        <path d="M38 118 C16 118 8 136 12 154 C32 152 46 142 54 130Z" fill="${p.d}"/><path d="M162 118 C184 118 192 136 188 154 C168 152 154 142 146 130Z" fill="${p.d}"/>
        <path d="M84 160 L116 160 L108 190 L92 190Z" fill="${p.d}"/>
        <ellipse cx="100" cy="108" rx="66" ry="56" fill="${p.m}"/>
        <g clip-path="url(#cl_${p.id || 'x'})"><rect x="56" y="40" width="20" height="140" fill="#fff"/><rect x="124" y="40" width="20" height="140" fill="#fff"/><path d="M56 40 V180 M76 40 V180 M124 40 V180 M144 40 V180" fill="none" stroke-width="4"/></g>
        <ellipse cx="100" cy="108" rx="66" ry="56" fill="none"/>
        ${shine('M46 90 C52 68 70 52 92 48 C72 60 60 76 56 96Z')}
        ${eye(86, 98, 10)}${eye(114, 98, 10)}${smile(100, 126, 11, 9)}${cheek(46, 118)}${cheek(154, 118)}`
    }),
    angler: p => ({
      hd: { x: 100, top: 52, r: 56, ey: 94, ex: 20, cw: 52, chin: 168, sx: 70 },
      svg: `${T('M100 56 C100 14 140 6 146 30', 7, p.d)}
        <circle cx="146" cy="38" r="22" fill="#FFE680" opacity=".35" stroke="none"/><circle cx="146" cy="38" r="12" fill="#FFE680"/>
        <path d="M34 118 C14 114 8 130 14 148 C30 148 44 140 48 130Z" fill="${p.d}"/><path d="M166 118 C186 114 192 130 186 148 C170 148 156 140 152 130Z" fill="${p.d}"/>
        <path d="M28 114 C28 74 58 52 100 52 C142 52 172 74 172 114 C172 156 140 178 100 178 C60 178 28 156 28 114Z" fill="${p.m}"/>
        <path d="M44 120 Q100 172 156 120 Q100 138 44 120Z" fill="#8E2640"/>
        ${zahn(56, 125, 10, 14)}${zahn(72, 133, 10, 14)}${zahn(90, 137, 10, 14)}${zahn(110, 137, 10, 14)}${zahn(128, 133, 10, 14)}${zahn(144, 125, 10, 14)}
        ${shine('M42 98 C46 78 64 62 88 58 C68 70 56 84 54 104Z')}
        <circle cx="80" cy="92" r="11" fill="#fff"/><circle cx="82" cy="93" r="6.6" fill="${p.a}" stroke="none"/><circle cx="82" cy="93" r="3.2" fill="${INK}" stroke="none"/>
        <circle cx="120" cy="92" r="11" fill="#fff"/><circle cx="122" cy="93" r="6.6" fill="${p.a}" stroke="none"/><circle cx="122" cy="93" r="3.2" fill="${INK}" stroke="none"/>
        ${cheek(52, 108)}${cheek(148, 108)}`
    }),
    krebs: p => ({
      hd: { x: 100, top: 74, r: 52, ey: 112, ex: 22, cw: 50, chin: 160, sx: 64 },
      svg: `${T('M52 150 L22 164', 9, p.d)}${T('M56 160 L32 184', 9, p.d)}${T('M148 150 L178 164', 9, p.d)}${T('M144 160 L168 184', 9, p.d)}${T('M84 168 L78 192', 9, p.d)}${T('M116 168 L122 192', 9, p.d)}
        ${T('M54 112 C34 106 28 92 28 80', 14, p.m)}${T('M146 112 C166 106 172 92 172 80', 14, p.m)}
        <path d="M28 74 C8 70 4 40 22 28 C20 42 28 52 40 54 C44 40 52 32 60 34 C56 52 48 66 28 74Z" fill="${p.m}"/>
        <path d="M172 74 C192 70 196 40 178 28 C180 42 172 52 160 54 C156 40 148 32 140 34 C144 52 152 66 172 74Z" fill="${p.m}"/>
        ${T('M84 84 L82 62', 6, p.d)}${T('M116 84 L118 62', 6, p.d)}
        <ellipse cx="100" cy="124" rx="64" ry="46" fill="${p.m}"/>
        <path d="M60 124 C66 146 82 158 100 158 C118 158 134 146 140 124 C124 136 112 138 100 138 C88 138 76 136 60 124Z" fill="${p.b}" stroke="none"/>
        ${shine('M48 112 C52 96 68 84 86 82 C70 92 60 104 58 118Z')}
        ${eye(82, 62, 11)}${eye(118, 62, 11)}${smile(100, 126, 10, 9)}${cheek(60, 130)}${cheek(140, 130)}`
    }),
    narwal: p => ({
      hd: { x: 100, top: 52, r: 54, ey: 106, ex: 24, cw: 50, chin: 172, sx: 74 },
      svg: `<path d="M94 58 L70 4 L112 54Z" fill="${p.a}"/><path d="M88 42 L100 36 M82 28 L94 22 M92 54 L106 48" fill="none" stroke-width="3.5"/>
        <path d="M34 124 C12 122 6 142 8 160 C28 162 42 152 48 140Z" fill="${p.d}"/><path d="M166 124 C188 122 194 142 192 160 C172 162 158 152 152 140Z" fill="${p.d}"/>
        <path d="M22 122 C22 78 58 52 100 52 C142 52 178 78 178 122 C178 160 142 182 100 182 C58 182 22 160 22 122Z" fill="${p.m}"/>
        <path d="M38 134 C46 114 74 106 100 106 C126 106 154 114 162 134 C164 160 132 176 100 176 C68 176 36 160 38 134Z" fill="${p.b}" stroke="none"/>
        <circle cx="52" cy="104" r="4" fill="${p.d}" opacity=".5" stroke="none"/><circle cx="148" cy="100" r="5" fill="${p.d}" opacity=".5" stroke="none"/><circle cx="64" cy="86" r="3.4" fill="${p.d}" opacity=".5" stroke="none"/><circle cx="138" cy="84" r="3.4" fill="${p.d}" opacity=".5" stroke="none"/>
        ${shine('M44 104 C50 84 70 68 92 64 C72 76 60 90 56 110Z')}
        ${eye(76, 108, 10)}${eye(124, 108, 10)}${smile(100, 138, 12, 10)}${cheek(54, 128)}${cheek(146, 128)}`
    }),
    seestern: p => ({
      hd: { x: 100, top: 50, r: 40, ey: 100, ex: 18, cw: 24, chin: 128, sx: 44 },
      svg: `<path d="${star(100, 104, 94, 46, 5)}" fill="${p.m}" stroke-width="5"/>
        <path d="${star(100, 104, 60, 30, 5)}" fill="${p.b}" opacity=".45" stroke="none"/>
        <circle cx="100" cy="42" r="3.6" fill="${p.d}" stroke="none"/><circle cx="46" cy="86" r="3.6" fill="${p.d}" stroke="none"/><circle cx="154" cy="86" r="3.6" fill="${p.d}" stroke="none"/><circle cx="68" cy="156" r="3.6" fill="${p.d}" stroke="none"/><circle cx="132" cy="156" r="3.6" fill="${p.d}" stroke="none"/>
        <circle cx="100" cy="64" r="3.2" fill="${p.d}" stroke="none"/><circle cx="76" cy="96" r="3" fill="${p.d}" stroke="none"/><circle cx="124" cy="96" r="3" fill="${p.d}" stroke="none"/>
        ${eye(84, 104, 10)}${eye(116, 104, 10)}${smile(100, 124, 9, 8)}${cheek(66, 118, 8, 5)}${cheek(134, 118, 8, 5)}`
    }),
    wal: p => ({
      hd: { x: 100, top: 60, r: 56, ey: 110, ex: 24, cw: 54, chin: 172, sx: 76 },
      svg: `${T('M100 58 C100 40 84 30 70 34 M100 58 C100 40 116 30 130 34', 7, p.a)}
        <path d="M32 134 C12 130 6 150 10 166 C30 168 44 158 50 146Z" fill="${p.d}"/><path d="M168 134 C188 130 194 150 190 166 C170 168 156 158 150 146Z" fill="${p.d}"/>
        <path d="M18 126 C18 84 54 58 100 58 C146 58 182 84 182 126 C182 164 146 184 100 184 C54 184 18 164 18 126Z" fill="${p.m}"/>
        <path d="M34 138 C44 120 74 112 100 112 C126 112 156 120 166 138 C168 164 134 178 100 178 C66 178 32 164 34 138Z" fill="${p.b}" stroke="none"/>
        <path d="M64 142 C80 150 120 150 136 142 M70 154 C86 160 114 160 130 154 M78 166 C90 170 110 170 122 166" fill="none" stroke="${p.d}" stroke-width="3" opacity=".5"/>
        ${shine('M40 110 C46 90 66 74 90 70 C70 82 58 98 54 116Z')}
        ${eye(74, 112, 11)}${eye(126, 112, 11)}${smile(100, 134, 16, 9)}${cheek(50, 130)}${cheek(150, 130)}`
    }),
    seehund: p => ({
      hd: { x: 100, top: 42, r: 54, ey: 90, ex: 22, cw: 44, chin: 140, sx: 54 },
      svg: `<ellipse cx="100" cy="162" rx="60" ry="36" fill="${p.m}"/>
        <path d="M44 150 C22 154 16 172 26 184 C40 186 52 174 56 160Z" fill="${p.d}"/><path d="M156 150 C178 154 184 172 174 184 C160 186 148 174 144 160Z" fill="${p.d}"/>
        <circle cx="100" cy="92" r="54" fill="${p.m}"/>
        <ellipse cx="100" cy="112" rx="32" ry="24" fill="${p.b}" stroke="none"/>
        <path d="M92 100 Q100 94 108 100 Q104 108 100 108 Q96 108 92 100Z" fill="${INK}"/>
        <path d="M100 108 V116 M100 116 Q92 124 84 118 M100 116 Q108 124 116 118" fill="none" stroke-width="3.4"/>
        <path d="M70 106 L40 100 M70 112 L38 114 M70 118 L42 128 M130 106 L160 100 M130 112 L162 114 M130 118 L158 128" fill="none" stroke="#fff" stroke-width="2.4"/>
        ${shine('M52 76 C58 60 74 48 92 46 C74 56 64 68 60 82Z')}
        ${eye(76, 86, 10)}${eye(124, 86, 10)}${cheek(58, 104, 8, 5)}${cheek(142, 104, 8, 5)}`
    })
  };

  // ---------- Zubehör ----------
  const acc = {
    krone: h => { const s = h.r / 56; return `<g transform="translate(${h.x} ${h.top + 10 * s}) scale(${s})"><path d="M-27 2 L-31 -26 L-14 -12 L0 -34 L14 -12 L31 -26 L27 2Z" fill="#FFC83D"/><rect x="-27" y="-1" width="54" height="10" rx="3" fill="#FFD866"/><circle cx="0" cy="-28" r="3.4" fill="#E5484D" stroke-width="2.5"/><circle cx="-28" cy="-22" r="3" fill="#6A4FC8" stroke-width="2.5"/><circle cx="28" cy="-22" r="3" fill="#2FB38A" stroke-width="2.5"/></g>`; },
    piraten: h => { const s = h.r / 56; return `<g transform="translate(${h.x} ${h.top + 14 * s}) scale(${s})"><path d="M-46 2 C-44 -26 -22 -42 0 -42 C22 -42 44 -26 46 2 C22 10 -22 10 -46 2Z" fill="#1B2433"/><path d="M-44 2 C-20 8 20 8 44 2" fill="none" stroke="#E5484D" stroke-width="5"/><circle cx="0" cy="-20" r="7.5" fill="#fff" stroke-width="2.5"/><path d="M-12 -8 L12 -30 M12 -8 L-12 -30" stroke="#fff" stroke-width="4"/><circle cx="-2.6" cy="-21" r="1.6" fill="${INK}" stroke="none"/><circle cx="2.6" cy="-21" r="1.6" fill="${INK}" stroke="none"/></g>`; },
    zylinder: h => { const s = h.r / 56; return `<g transform="translate(${h.x} ${h.top + 10 * s}) scale(${s})"><rect x="-23" y="-50" width="46" height="46" rx="5" fill="#1B2433"/><rect x="-23" y="-18" width="46" height="9" fill="#E5484D" stroke-width="3"/><ellipse cx="0" cy="-2" rx="38" ry="9" fill="#1B2433"/></g>`; },
    maske: h => { const s = h.r / 56; return `<g transform="translate(${h.x} ${h.top + 18 * s}) scale(${s})"><path d="M-36 6 L-58 14 M36 6 L58 14" fill="none" stroke="#FF7A59" stroke-width="7"/><rect x="-36" y="-12" width="72" height="34" rx="14" fill="#BDF0F7" stroke-width="5"/><rect x="-36" y="-12" width="72" height="34" rx="14" fill="none" stroke="#FF7A59" stroke-width="3"/><path d="M-22 -2 C-12 -8 -4 -8 2 -4" fill="none" stroke="#fff" stroke-width="4"/></g>`; },
    schleife: h => { const s = h.r / 56; return `<g transform="translate(${h.x + 30 * s} ${h.top + 12 * s}) rotate(14) scale(${s})"><path d="M0 0 L-26 -16 L-26 16Z" fill="#FF7FA8"/><path d="M0 0 L26 -16 L26 16Z" fill="#FF7FA8"/><circle cx="0" cy="0" r="7" fill="#FF4F8B" stroke-width="3.5"/></g>`; },
    kopfhoerer: h => { const s = h.r / 56; const y = h.ey; return `${T(`M${h.x - h.sx} ${y - 4} C${h.x - h.sx} ${h.top - 26 * s} ${h.x + h.sx} ${h.top - 26 * s} ${h.x + h.sx} ${y - 4}`, 7, '#FFC83D')}<rect x="${h.x - h.sx - 11}" y="${y - 16}" width="19" height="34" rx="9" fill="#FF7A59"/><rect x="${h.x + h.sx - 8}" y="${y - 16}" width="19" height="34" rx="9" fill="#FF7A59"/>`; },
    brille: h => { const s = h.r / 56, r = 15 * s; return `<g fill="#BDF0F7" fill-opacity=".45" stroke-width="4.5"><circle cx="${h.x - h.ex}" cy="${h.ey}" r="${r}"/><circle cx="${h.x + h.ex}" cy="${h.ey}" r="${r}"/></g><path d="M${h.x - h.ex + r} ${h.ey} H${h.x + h.ex - r} M${h.x - h.ex - r} ${h.ey - 2} L${h.x - h.ex - r - 12} ${h.ey - 6} M${h.x + h.ex + r} ${h.ey - 2} L${h.x + h.ex + r + 12} ${h.ey - 6}" fill="none" stroke-width="4"/>`; },
    schal: h => { const s = h.r / 56, y = h.chin - 12 * s, w = h.cw; return `<path d="M${h.x - w} ${y} Q${h.x} ${y + 22 * s} ${h.x + w} ${y} L${h.x + w - 2} ${y + 16 * s} Q${h.x} ${y + 38 * s} ${h.x - w + 2} ${y + 16 * s}Z" fill="#E5484D"/><path d="M${h.x + w - 22 * s} ${y + 14 * s} L${h.x + w - 12 * s} ${y + 38 * s} L${h.x + w + 8 * s} ${y + 34 * s} L${h.x + w + 2 * s} ${y + 10 * s}Z" fill="#E5484D"/><path d="M${h.x - w * 0.5} ${y + 12 * s} l5 18 M${h.x} ${y + 17 * s} l0 18 M${h.x + w * 0.5} ${y + 12 * s} l-5 18" stroke="#fff" stroke-width="4" fill="none"/>`; },
    kette: h => { const s = h.r / 56, y = h.chin - 10 * s; let o = ''; for (let i = 0; i < 9; i++) { const t = (i - 4) / 4; o += `<circle cx="${(h.x + t * h.cw).toFixed(1)}" cy="${(y + t * t * 16 * s).toFixed(1)}" r="${(5.2 * s).toFixed(1)}" fill="#fff" stroke-width="3"/>`; } return o + `<path d="M${h.x - 8 * s} ${y + 18 * s} L${h.x + 8 * s} ${y + 18 * s} L${h.x} ${y + 34 * s}Z" fill="#FFC83D" stroke-width="3.5"/>`; },
    stern: h => { const s = h.r / 56; return `<path d="${star(h.x, h.top + 24 * s, 14 * s, 6 * s, 5)}" fill="#FFC83D" stroke-width="3.4"/>`; },
    blume: h => { const s = h.r / 56, cx = h.x - 32 * s, cy = h.top + 16 * s; let o = ''; for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; o += `<circle cx="${(cx + Math.cos(a) * 8 * s).toFixed(1)}" cy="${(cy + Math.sin(a) * 8 * s).toFixed(1)}" r="${(7 * s).toFixed(1)}" fill="#FF9DC2" stroke-width="3"/>`; } return o + `<circle cx="${cx}" cy="${cy}" r="${5 * s}" fill="#FFD866" stroke-width="3"/>`; },
    perle: h => { const s = h.r / 56; return `<circle cx="${h.x}" cy="${h.top + 12 * s}" r="${11 * s}" fill="#FFF7EC" stroke-width="4"/><path d="M${h.x - 5 * s} ${h.top + 8 * s} a6 6 0 0 1 6 -4" fill="none" stroke="#fff" stroke-width="3.2"/>`; }
  };
  const ZUBEHOER = Object.keys(acc);

  // ---------- Entwicklung: Stufe 2 (Stern 3) und Stufe 3 (Stern 5) ----------
  // Stufe 1 ist der kleine Rundling (nur Kopf). Jede Art hat in ART.evo[art] = { 2: p => ({ hd, svg, rot? }), 3: … } eigene Körper für Stufe 2 und 3
  // (Dateien 05-evo-*.js, gezeichnet mit dem Baukasten ART.kit): Rumpf, Flossen/Arme, Muster und ein Merkmal der Art; hd verankert das Zubehör am Kopf.
  const mix = (a, b, t) => { const c = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = c(a), y = c(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const funkel = (cx, cy, R) => `<path d="M${cx} ${cy - R} Q${cx + R * 0.16} ${cy - R * 0.16} ${cx + R} ${cy} Q${cx + R * 0.16} ${cy + R * 0.16} ${cx} ${cy + R} Q${cx - R * 0.16} ${cy + R * 0.16} ${cx - R} ${cy} Q${cx - R * 0.16} ${cy - R * 0.16} ${cx} ${cy - R}Z" fill="#FFF3A8" stroke="${INK}" stroke-width="2.4"/>`;

  const evoArten = {};
  const sym = b => `${b}<g transform="translate(200 0) scale(-1 1)">${b}</g>`;      // links gezeichnet, rechts gespiegelt
  const klinge = (ax, ay, bx, by, tx, ty, k = 0.18, fill = '#fff', ex = '') => {   // gebogene Flosse/Stachel: Basis A–B, Spitze T; k > 0 = geschwungen (hohl), k < 0 = blattförmig (bauchig)
    const kk = k * (Math.sign((tx - ax) * (by - ay) - (ty - ay) * (bx - ax)) || 1);      // Drehsinn des Dreiecks ausgleichen
    const q = (px, py, qx, qy) => `${((px + qx) / 2 - (qy - py) * kk).toFixed(1)} ${((py + qy) / 2 + (qx - px) * kk).toFixed(1)}`;
    return `<path d="M${ax} ${ay} Q${q(ax, ay, tx, ty)} ${tx} ${ty} Q${q(tx, ty, bx, by)} ${bx} ${by}Z" fill="${fill}" ${ex}/>`;
  };
  const welle = (x, y, n, w = 10, h = 5) => `M${x} ${y} q${w / 2} ${-h} ${w} 0` + ` t${w} 0`.repeat(n - 1);   // Wellenlinie mit n Bögen
  const stacheln = (cx, cy, r, winkel, len, w, fill) => winkel.map(a => {      // Stacheln auf einem Kreis (Winkel in Grad, 0 = rechts, −90 = oben)
    const t = a * Math.PI / 180, ux = Math.cos(t), uy = Math.sin(t), nx = -uy, ny = ux;
    return `<path d="M${(cx + ux * r + nx * w).toFixed(1)} ${(cy + uy * r + ny * w).toFixed(1)} L${(cx + ux * (r + len)).toFixed(1)} ${(cy + uy * (r + len)).toFixed(1)} L${(cx + ux * r - nx * w).toFixed(1)} ${(cy + uy * r - ny * w).toFixed(1)}Z" fill="${fill}"/>`;
  }).join('');
  const brauen = (x, y, ex, s = 1) => `<path d="M${x - ex - 11 * s} ${y - 19 * s} L${x - ex + 9 * s} ${y - 12 * s} M${x + ex + 11 * s} ${y - 19 * s} L${x + ex - 9 * s} ${y - 12 * s}" fill="none" stroke-width="5"/>`;
  const augeA = (x, y, r, iris) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + 1}" cy="${y + 1}" r="${r * 0.74}" fill="${iris}" stroke-width="2"/><circle cx="${x + 1.5}" cy="${y + 1.5}" r="${r * 0.4}" fill="${INK}" stroke="none"/><circle cx="${x + r * 0.32}" cy="${y - r * 0.26}" r="${r * 0.26}" fill="#fff" stroke="none"/>`;
  function evoAura(stufe, p, fid) {                               // Schein hinter der Figur (Stufe 3 stärker, mit drehenden Strahlen) und Funkeln davor
    const hoch = stufe === 3, ag = 'ag_' + fid;
    const defs = `<radialGradient id="${ag}" cx="50%" cy="50%" r="50%"><stop offset="0.35" stop-color="${mix(p.a, '#ffffff', 0.35)}" stop-opacity="${hoch ? 0.6 : 0.4}"/><stop offset="1" stop-color="${p.a}" stop-opacity="0"/></radialGradient>`;
    let aura = `<circle cx="100" cy="108" r="${hoch ? 104 : 98}" fill="url(#${ag})" stroke="none"/>`;
    if (hoch) {
      let st = ''; for (let i = 0; i < 14; i++) st += `<path transform="rotate(${(i * 360 / 14).toFixed(1)} 100 108)" d="M100 108 L94 2 L106 2Z"/>`;
      aura += `<g fill="#fff" opacity=".22" stroke="none">${st}<animateTransform attributeName="transform" type="rotate" from="0 100 108" to="360 100 108" dur="36s" repeatCount="indefinite"/></g>`;
    }
    const vorn = (hoch ? [[16, 34, 10], [186, 46, 8], [180, 172, 9], [20, 166, 7]] : [[18, 40, 8], [184, 60, 7]]).map(a => funkel(...a)).join('');
    return { defs, aura, vorn };
  }

  // Gesamtbild: Art + Palette + Zubehör (+ Entwicklungsstufe 1–3)
  function figur(art, pal, zub, id, stufe = 1) {
    const fid = (id || art) + stufe;
    const neu = stufe > 1 && evoArten[art] && evoArten[art][stufe];
    if (neu) {                                                    // eigener Körper für diese Stufe
      const a = neu({ ...pal, id: fid }), au = evoAura(stufe, pal, fid), m = stufe === 3 ? 12 : 6;
      const koerper = a.svg + (zub && acc[zub] ? acc[zub](a.hd) : '');
      return `<svg class="fig s${stufe}" viewBox="${-m} ${-m} ${200 + 2 * m} ${200 + 2 * m}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${au.defs}</defs>${au.aura}${wrap(a.rot ? `<g transform="${a.rot}">${koerper}</g>` : koerper)}${wrap(au.vorn)}</svg>`;
    }
    const a = arten[art]({ ...pal, id: fid });                    // Stufe 1
    const z = zub && acc[zub] ? acc[zub](a.hd) : '';
    return `<svg class="fig" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${wrap(a.svg + z)}</svg>`;
  }
  return { figur, arten: Object.keys(arten), zubehoer: ZUBEHOER, T, eye, star, wrap, evo: evoArten, kit: { T, eye, cheek, smile, shine, star, zahn, wrap, mix, funkel, sym, klinge, brauen, augeA, welle, stacheln } };
})();
