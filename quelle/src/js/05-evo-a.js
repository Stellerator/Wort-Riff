'use strict';
// ---------- Entwicklungsformen, Teil A: Hai, Delfin, Qualle, Oktopus (Stufe 2 und 3 mit eigenem Körper) ----------
// Stufe 1 ist der kleine Rundling (nur Kopf). Stufe 2 bekommt Rumpf, Flossen/Arme, Muster und ein erstes Merkmal, Stufe 3 wird groß und prächtig.
// Jede Form liefert { hd, svg, rot? } wie die Grundfiguren; hd verankert das Zubehör (Hut, Kopfhörer, Brille …) am Kopf.
(() => {
  const { T, eye, cheek, smile, shine, zahn, mix, sym, klinge, brauen, augeA, funkel, welle } = ART.kit;
  const MUND = '#8E2640', ZUNGE = '#FF8FA8', HOLZ = '#C98A3A';

  // ---------- Hai: Wellenjäger → Sturmflosse ----------
  ART.evo.hai = {
    2: p => ({
      hd: { x: 100, top: 24, r: 52, ey: 64, ex: 24, cw: 48, chin: 120, sx: 56 },
      svg: `<path d="M100 148 C88 160 72 178 54 196 C76 192 92 188 100 176 C108 188 124 192 146 196 C128 178 112 160 100 148Z" fill="${p.d}"/>
        ${klinge(64, 60, 136, 60, 100, -4, 0.05, p.d)}
        ${sym(klinge(68, 80, 70, 118, 4, 150, 0.06, p.d) + klinge(74, 138, 84, 160, 40, 182, 0.08, p.d))}
        <path d="M46 76 C46 40 70 24 100 24 C130 24 154 40 154 76 C154 98 144 110 134 122 C128 142 122 158 108 170 Q100 174 92 170 C78 158 72 142 66 122 C56 110 46 98 46 76Z" fill="${p.m}"/>
        <path d="M64 92 C74 84 88 80 100 80 C112 80 126 84 136 92 C134 110 130 122 124 136 C120 150 116 160 108 166 Q100 168 92 166 C84 160 80 150 76 136 C70 122 66 110 64 92Z" fill="${p.b}" stroke="none"/>
        <path d="${welle(80, 142, 3)} ${welle(84, 155, 3, 8, 4)}" fill="none" stroke="${p.d}" stroke-width="3.4" opacity=".6"/>
        <path d="M70 96 Q100 90 130 96 Q126 122 100 122 Q74 122 70 96Z" fill="${MUND}"/>
        ${[72, 84, 96, 108, 120].map(x => zahn(x, 95, 9, 10)).join('')}
        <ellipse cx="100" cy="116" rx="13" ry="5" fill="${ZUNGE}" stroke="none"/>
        ${shine('M54 68 C58 46 78 34 98 32 C80 44 70 58 66 76Z')}
        ${eye(76, 64, 10)}${eye(124, 64, 10)}${brauen(100, 64, 24, 0.85)}${cheek(56, 92, 8, 5)}${cheek(144, 92, 8, 5)}`
    }),
    3: p => ({
      hd: { x: 100, top: 20, r: 62, ey: 62, ex: 28, cw: 64, chin: 132, sx: 72 },
      svg: `<path d="M100 150 C84 162 60 178 28 198 C62 198 88 194 100 182 C112 194 138 198 172 198 C140 178 116 162 100 150Z" fill="${p.d}"/>
        <path d="M98 168 L109 178 L101 180 L109 195 L91 182 L99 181Z" fill="${p.a}" stroke-width="2.5"/>
        ${klinge(52, 62, 148, 62, 100, -8, 0.05, p.d)}${sym(klinge(40, 66, 74, 62, 12, 14, 0.06, p.d))}
        <path d="M100 2 L100 48 M70 40 L24 22" fill="none" stroke="${p.a}" stroke-width="3.6"/><path d="M130 40 L176 22" fill="none" stroke="${p.a}" stroke-width="3.6"/>
        ${sym(klinge(72, 62, 72, 112, -8, 86, 0.06, p.d) + klinge(74, 108, 76, 144, -2, 156, 0.08, p.d) + `<path d="M58 80 L4 88 M62 128 L8 150" fill="none" stroke="${p.a}" stroke-width="3.4"/>`)}
        <path d="M26 78 C26 36 60 20 100 20 C140 20 174 36 174 78 C174 102 160 116 148 128 C140 146 130 162 114 174 Q100 180 86 174 C70 162 60 146 52 128 C40 116 26 102 26 78Z" fill="${p.m}"/>
        <path d="M52 92 C66 80 84 76 100 76 C116 76 134 80 148 92 C146 112 140 126 132 140 C126 154 120 166 108 172 Q100 175 92 172 C80 166 74 154 68 140 C60 126 54 112 52 92Z" fill="${p.b}" stroke="none"/>
        <path d="M62 126 Q100 138 138 126 M68 140 Q100 152 132 140 M76 154 Q100 164 124 154 M84 166 Q100 173 116 166" fill="none" stroke="${p.d}" stroke-width="3.8"/>
        ${sym(`<path d="M52 52 L36 78 L47 78 L40 102 L60 70 L49 70 L56 52Z" fill="${p.a}" stroke-width="2.5"/>`)}
        <path d="M58 102 Q100 92 142 102 Q136 134 100 134 Q64 134 58 102Z" fill="${MUND}"/>
        ${[60, 71, 82, 93, 104, 115, 126].map(x => zahn(x, 98, 11, 13)).join('')}
        <path d="M80 133 l6 -13 l6 13Z M108 133 l6 -13 l6 13Z" fill="#fff" stroke-width="2.5"/>
        <ellipse cx="100" cy="127" rx="15" ry="5" fill="${ZUNGE}" stroke="none"/>
        ${shine('M40 64 C44 42 70 28 98 26 C78 40 64 56 58 78Z')}
        <path d="M120 40 L136 82" fill="none" stroke="${INK}" stroke-width="9"/><path d="M120 40 L136 82 M115 56 l14 5 M123 69 l14 5" fill="none" stroke="#fff" stroke-width="3.6"/>
        ${augeA(72, 62, 12, p.a)}${augeA(128, 62, 12, p.a)}${brauen(100, 62, 28, 1.2)}`
    })
  };

  // ---------- Delfin: Sprungkünstler → Wellenfürst ----------
  ART.evo.delfin = {
    2: p => ({
      rot: 'rotate(-8 100 100)',
      hd: { x: 100, top: 24, r: 52, ey: 68, ex: 24, cw: 46, chin: 122, sx: 54 },
      svg: `${T('M104 150 C112 178 150 184 164 152', 20, p.m)}
        <path d="M164 154 C150 152 138 140 136 124 C150 128 160 138 164 148 C168 136 180 126 194 124 C192 140 180 152 164 154Z" fill="${p.d}"/>
        <circle cx="178" cy="176" r="6" fill="#E3F7FF" stroke-width="3"/><circle cx="190" cy="160" r="4" fill="#E3F7FF" stroke-width="2.6"/>
        <path d="M82 54 C86 30 104 12 130 8 C120 20 118 38 124 58Z" fill="${p.d}"/>
        ${sym(`<path d="M60 100 C40 98 22 112 16 134 C34 136 52 128 62 116Z" fill="${p.d}"/>`)}
        <path d="M48 74 C48 38 72 24 100 24 C128 24 152 38 152 74 C152 94 142 104 134 114 C130 132 126 150 114 162 L86 162 C74 150 70 132 66 114 C58 104 48 94 48 74Z" fill="${p.m}"/>
        <path d="M52 64 C56 40 76 28 100 28 C124 28 144 40 148 64 C134 54 118 50 100 50 C82 50 66 54 52 64Z" fill="${p.d}"/>
        <path d="M60 86 C72 78 88 76 100 76 C112 76 128 78 140 86 C138 106 132 120 126 134 C122 148 118 156 110 160 L90 160 C82 156 78 148 74 134 C68 120 62 106 60 86Z" fill="${p.b}" stroke="none"/>
        <ellipse cx="100" cy="102" rx="26" ry="17" fill="${p.b}"/>
        <circle cx="100" cy="94" r="3.5" fill="${INK}" stroke="none"/>${smile(100, 104, 15, 8)}
        <path d="${welle(82, 140, 3)}" fill="none" stroke="${p.d}" stroke-width="3.4" opacity=".6"/>
        ${shine('M56 62 C60 44 76 34 94 32 C80 42 70 54 66 68Z')}
        ${eye(76, 70, 10)}${eye(124, 70, 10)}${cheek(58, 94, 8, 5)}${cheek(142, 94, 8, 5)}`
    }),
    3: p => ({
      rot: 'rotate(-8 100 100)',
      hd: { x: 100, top: 22, r: 58, ey: 66, ex: 26, cw: 54, chin: 124, sx: 62 },
      svg: `${T('M104 148 C112 186 162 194 174 150', 24, p.m)}
        <path d="M174 152 C158 152 142 136 138 114 C154 118 168 130 174 144 C178 130 192 120 208 116 C206 138 192 154 174 152Z" fill="${p.d}"/>
        <path d="M150 128 C158 134 164 140 168 146 M196 128 C190 134 184 140 180 146" fill="none" stroke="${p.a}" stroke-width="3.4"/>
        <circle cx="186" cy="178" r="7" fill="#E3F7FF" stroke-width="3"/><circle cx="198" cy="160" r="4.5" fill="#E3F7FF" stroke-width="2.6"/>
        ${klinge(70, 54, 130, 54, 102, -6, 0.06, p.a)}${sym(klinge(58, 62, 92, 56, 30, 14, 0.08, p.a))}
        <path d="M82 54 C84 26 106 6 138 2 C124 16 122 36 128 60Z" fill="${p.d}"/>
        ${sym(`<path d="M58 92 C30 80 6 92 -2 118 C14 112 28 114 40 124 C30 128 24 138 28 150 C44 138 56 126 64 112Z" fill="${p.d}"/><path d="M48 100 C32 96 18 100 6 114" fill="none" stroke="${p.a}" stroke-width="3.4"/>`)}
        <path d="M38 76 C38 38 66 22 100 22 C134 22 162 38 162 76 C162 98 150 110 140 122 C134 140 128 156 116 166 L84 166 C72 156 66 140 60 122 C50 110 38 98 38 76Z" fill="${p.m}"/>
        <path d="M42 66 C46 40 70 26 100 26 C130 26 154 40 158 66 C142 54 122 50 100 50 C78 50 58 54 42 66Z" fill="${p.d}"/>
        <path d="M44 64 C60 54 78 50 100 50 C122 50 140 54 156 64" fill="none" stroke="${p.a}" stroke-width="3.6"/>
        <path d="M60 88 C72 80 88 78 100 78 C112 78 128 80 140 88 C138 108 132 122 126 134 C122 148 118 158 110 164 L90 164 C82 158 78 148 74 134 C68 122 62 108 60 88Z" fill="${p.b}" stroke="none"/>
        <ellipse cx="100" cy="104" rx="27" ry="18" fill="${p.b}"/>
        <circle cx="100" cy="95" r="3.6" fill="${INK}" stroke="none"/>${smile(100, 106, 16, 8)}
        ${[[74, 142], [87, 149], [100, 152], [113, 149], [126, 142]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#FFF7EC" stroke-width="3"/>`).join('')}
        ${shine('M50 62 C54 42 74 30 96 28 C80 40 68 52 64 70Z')}
        ${augeA(76, 70, 11, p.a)}${augeA(124, 70, 11, p.a)}${cheek(56, 96, 8, 5)}${cheek(144, 96, 8, 5)}`
    })
  };

  // ---------- Qualle: Leuchtschleier → Glanzgestirn ----------
  ART.evo.qualle = {
    2: p => ({
      hd: { x: 100, top: 14, r: 62, ey: 80, ex: 24, cw: 60, chin: 112, sx: 70 },
      svg: `${sym(T('M58 112 C44 134 70 150 54 174 C50 182 56 190 62 194', 10, p.d) + T('M80 114 C70 136 94 152 82 176 C78 184 84 192 90 196', 10, p.d))}
        ${T('M100 112 C90 134 112 148 100 176 C96 186 100 192 100 196', 16, p.a)}
        <path d="M14 100 C10 116 20 124 30 118 C34 130 46 134 54 124 C60 136 74 138 82 128 C90 138 110 138 118 128 C126 138 140 136 146 124 C154 134 166 130 170 118 C180 124 190 116 186 100 C170 112 140 106 100 106 C60 106 30 112 14 100Z" fill="${p.b}" opacity=".9"/>
        <path d="M22 108 C18 54 54 18 100 14 C146 18 182 54 178 108 Q158 122 140 108 Q120 124 100 108 Q80 124 60 108 Q42 122 22 108Z" fill="${p.m}"/>
        <ellipse cx="100" cy="62" rx="58" ry="38" fill="#fff" opacity=".16" stroke="none"/>
        ${[[60, 50], [80, 36], [100, 30], [120, 36], [140, 50], [46, 76], [154, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${p.a}" stroke-width="2.5"/>`).join('')}
        <circle cx="100" cy="12" r="6" fill="${p.a}"/>
        ${shine('M38 84 C38 56 60 36 88 28 C66 44 54 64 52 92Z')}
        ${eye(76, 82, 11)}${eye(124, 82, 11)}${brauen(100, 82, 24, 0.9)}${smile(100, 98, 10, 8)}${cheek(56, 98)}${cheek(144, 98)}`
    }),
    3: p => {
      const glas = mix(p.m, p.d, 0.35), hell = mix(p.m, '#ffffff', 0.55);
      const stern = [[52, 76], [76, 46], [100, 34], [126, 48], [150, 76], [100, 66]];
      return {
        hd: { x: 100, top: 16, r: 64, ey: 84, ex: 26, cw: 64, chin: 116, sx: 72 },
        svg: `<ellipse cx="100" cy="4" rx="36" ry="8" fill="none" stroke="${INK}" stroke-width="11"/><ellipse cx="100" cy="4" rx="36" ry="8" fill="none" stroke="${p.a}" stroke-width="6"/>
          <path d="M-6 108 C-8 136 12 154 34 146 C40 164 62 170 76 158 C88 174 112 174 124 158 C138 170 160 164 166 146 C188 154 208 136 206 108 C182 122 150 112 100 112 C50 112 18 122 -6 108Z" fill="${hell}" opacity=".7"/>
          ${sym(T('M56 114 C38 136 66 154 44 180 C40 186 44 192 52 194', 11, p.a) + T('M76 118 C64 142 90 158 74 184 C70 192 76 198 84 198', 11, p.a) + funkel(50, 194, 7) + funkel(82, 198, 6))}
          ${T('M100 116 C92 138 110 152 100 182', 18, mix(p.a, '#ffffff', 0.3))}
          <path d="M18 110 C14 52 52 14 100 10 C148 14 186 52 182 110 Q162 126 142 110 Q122 128 100 110 Q78 128 58 110 Q38 126 18 110Z" fill="${glas}"/>
          <path d="M52 76 L76 46 L100 34 L126 48 L150 76 M76 46 L100 66 L126 48" fill="none" stroke="#fff" stroke-width="2.8" opacity=".9"/>
          ${stern.map(([x, y], i) => funkel(x, y, i === 2 ? 9 : 6)).join('')}
          ${shine('M32 88 C32 58 56 34 88 24 C64 42 50 64 46 96Z')}
          ${augeA(76, 86, 12, p.a)}${augeA(124, 86, 12, p.a)}${smile(100, 102, 10, 8)}${cheek(54, 102)}${cheek(146, 102)}`
      };
    }
  };

  // ---------- Oktopus: Tintenmeister → Tintenkaiser ----------
  const pinsel = (x0, y0, x1, y1, ferr, spitze) => {            // Pinsel von der Zwinge (x0,y0) zur Spitze (x1,y1)
    const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    const bx = x1 + ux * 28, by = y1 + uy * 28;
    return `${T(`M${x0} ${y0} L${x1} ${y1}`, 8, HOLZ)}${T(`M${x1 - ux * 14} ${y1 - uy * 14} L${x1} ${y1}`, 11, ferr)}
      <path d="M${(x1 - uy * 7).toFixed(1)} ${(y1 + ux * 7).toFixed(1)} C${(x1 + ux * 10 - uy * 9).toFixed(1)} ${(y1 + uy * 10 + ux * 9).toFixed(1)} ${(bx - uy * 3).toFixed(1)} ${(by + ux * 3).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} C${(bx + uy * 3).toFixed(1)} ${(by - ux * 3).toFixed(1)} ${(x1 + ux * 10 + uy * 9).toFixed(1)} ${(y1 + uy * 10 - ux * 9).toFixed(1)} ${(x1 + uy * 7).toFixed(1)} ${(y1 - ux * 7).toFixed(1)}Z" fill="${spitze}"/>`;
  };
  ART.evo.oktopus = {
    2: p => ({
      hd: { x: 100, top: 10, r: 62, ey: 88, ex: 22, cw: 56, chin: 130, sx: 66 },
      svg: `${sym(T('M72 136 C60 158 64 180 80 190 C88 194 96 190 94 184', 16, p.m) + T('M88 140 C86 160 90 180 100 194', 14, p.m))}
        ${T('M50 124 C28 136 18 160 34 176 C44 184 58 178 56 168', 16, p.m)}
        ${T('M150 126 C176 126 192 110 186 88', 15, p.m)}
        ${pinsel(172, 106, 190, 52, '#C9D3DD', p.a)}
        <circle cx="172" cy="30" r="3.6" fill="${p.d}" stroke-width="2.4"/><circle cx="160" cy="44" r="2.6" fill="${p.d}" stroke-width="2"/>
        <path d="M30 100 C30 52 60 20 100 8 C140 20 170 52 170 100 C170 124 152 138 128 138 L72 138 C48 138 30 124 30 100Z" fill="${p.m}"/>
        ${T('M100 14 C112 4 126 10 122 22', 7, p.d)}
        <path d="${'M64 54 C72 40 86 32 100 30'}" fill="none" stroke="${p.d}" stroke-width="4.6" opacity=".6"/><path d="M136 54 C128 40 114 32 100 30" fill="none" stroke="${p.d}" stroke-width="4.6" opacity=".6"/>
        <path d="M40 72 C44 64 54 66 56 74 C62 76 62 86 54 88 C54 96 44 96 42 88 C34 86 34 76 40 72Z" fill="${p.d}" opacity=".55" stroke="none"/>
        ${shine('M46 84 C48 62 66 40 90 32 C70 48 60 66 58 90Z')}
        ${eye(78, 90, 12)}${eye(122, 90, 12)}${brauen(100, 90, 22)}${smile(100, 114, 10, 9)}${cheek(54, 108)}${cheek(146, 108)}`
    }),
    3: p => ({
      hd: { x: 100, top: 6, r: 66, ey: 90, ex: 24, cw: 60, chin: 134, sx: 70 },
      svg: `<path d="M16 112 C-4 100 -4 70 16 64 C30 60 40 72 32 82" fill="none" stroke="${p.d}" stroke-width="7" opacity=".45"/><path d="M184 112 C204 100 204 70 184 64 C170 60 160 72 168 82" fill="none" stroke="${p.d}" stroke-width="7" opacity=".45"/>
        ${sym(T('M48 130 C22 138 4 160 14 180 C20 192 40 192 42 180 C44 172 34 168 30 174', 15, p.m) + T('M68 140 C52 162 52 188 72 196 C84 200 94 192 90 184', 14, p.m) + T('M86 144 C82 166 88 186 98 198', 13, p.m))}
        ${T('M46 124 C20 122 4 104 10 78', 14, p.m)}${T('M154 124 C180 122 196 104 190 78', 14, p.m)}
        ${pinsel(176, 104, 194, 50, '#FFD866', p.a)}
        <circle cx="16" cy="54" r="15" fill="#1B2440"/><path d="M8 54 C8 46 18 44 22 50 C26 56 18 62 12 58" fill="none" stroke="${p.a}" stroke-width="3.2"/><circle cx="10" cy="46" r="3" fill="#fff" stroke="none"/>
        <circle cx="34" cy="38" r="3.6" fill="#1B2440" stroke-width="2.4"/><circle cx="30" cy="22" r="2.6" fill="#1B2440" stroke-width="2"/>
        <path d="M28 104 C26 62 42 30 62 18 L72 44 L88 10 L100 2 L112 10 L128 44 L138 18 C158 30 174 62 172 104 C172 128 154 142 128 142 L72 142 C46 142 28 128 28 104Z" fill="${p.m}"/>
        ${T('M34 76 C56 60 78 56 100 56 C122 56 144 60 166 76', 6, p.a)}
        <path d="M100 42 L110 57 L100 72 L90 57Z" fill="${mix(p.a, '#ffffff', 0.4)}" stroke-width="3.2"/>
        ${shine('M42 92 C42 70 56 50 76 40 C62 56 56 72 56 96Z')}
        ${augeA(78, 94, 13, p.a)}${augeA(122, 94, 13, p.a)}${smile(100, 118, 10, 9)}${cheek(54, 112)}${cheek(146, 112)}`
    })
  };
})();
