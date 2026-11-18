'use strict';
// ---------- ZIP lesen (ohne Bibliothek): Zentralverzeichnis + eigener Inflate (RFC 1951) ----------
// Unterstützt "gespeichert" (0) und "deflate" (8). Kein ZIP64, keine Verschlüsselung.
const ZIP = (() => {
  const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  const ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  function huff(lengths, n) {
    const count = new Uint16Array(16), symbol = new Uint16Array(n), offs = new Uint16Array(16);
    for (let i = 0; i < n; i++) count[lengths[i]]++;
    for (let l = 1; l < 15; l++) offs[l + 1] = offs[l] + count[l];
    for (let s = 0; s < n; s++) if (lengths[s]) symbol[offs[lengths[s]]++] = s;
    return { count, symbol };
  }
  const FIXLEN = (() => { const l = new Uint8Array(288); for (let i = 0; i < 144; i++) l[i] = 8; for (let i = 144; i < 256; i++) l[i] = 9; for (let i = 256; i < 280; i++) l[i] = 7; for (let i = 280; i < 288; i++) l[i] = 8; return huff(l, 288); })();
  const FIXDIST = (() => { const l = new Uint8Array(30).fill(5); return huff(l, 30); })();

  function inflate(src, outLen) {
    const out = new Uint8Array(outLen);
    let ip = 0, op = 0, bb = 0, bc = 0;
    const bits = n => { while (bc < n) { if (ip >= src.length) throw new Error('ZIP defekt (Ende)'); bb |= src[ip++] << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
    const dec = h => {
      let code = 0, first = 0, index = 0;
      for (let len = 1; len <= 15; len++) {
        code |= bits(1);
        const cnt = h.count[len];
        if (code - cnt < first) return h.symbol[index + (code - first)];
        index += cnt; first += cnt; first <<= 1; code <<= 1;
      }
      throw new Error('ZIP defekt (Code)');
    };
    let last;
    do {
      last = bits(1);
      const type = bits(2);
      if (type === 0) {
        bb = 0; bc = 0;
        const len = src[ip] | (src[ip + 1] << 8); ip += 4;
        if (op + len > outLen) throw new Error('ZIP defekt (Größe)');
        out.set(src.subarray(ip, ip + len), op); ip += len; op += len;
      } else {
        let lc, dc;
        if (type === 1) { lc = FIXLEN; dc = FIXDIST; }
        else if (type === 2) {
          const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
          const lens = new Uint8Array(320);
          for (let i = 0; i < ncode; i++) lens[ORDER[i]] = bits(3);
          const cl = huff(lens, 19);
          let idx = 0; const ll = new Uint8Array(320);
          while (idx < nlen + ndist) {
            let sym = dec(cl);
            if (sym < 16) ll[idx++] = sym;
            else {
              let rep, val = 0;
              if (sym === 16) { val = ll[idx - 1]; rep = 3 + bits(2); }
              else if (sym === 17) rep = 3 + bits(3);
              else rep = 11 + bits(7);
              while (rep--) ll[idx++] = val;
            }
          }
          lc = huff(ll.subarray(0, nlen), nlen); dc = huff(ll.subarray(nlen, nlen + ndist), ndist);
        } else throw new Error('ZIP defekt (Blocktyp)');
        for (;;) {
          let sym = dec(lc);
          if (sym < 256) { if (op >= outLen) throw new Error('ZIP defekt (Größe)'); out[op++] = sym; }
          else if (sym === 256) break;
          else {
            sym -= 257;
            const len = LBASE[sym] + bits(LEXT[sym]);
            const ds = dec(dc);
            const dist = DBASE[ds] + bits(DEXT[ds]);
            if (dist > op || op + len > outLen) throw new Error('ZIP defekt (Verweis)');
            for (let i = 0; i < len; i++) { out[op] = out[op - dist]; op++; }
          }
        }
      }
    } while (!last);
    return out;
  }

  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

  // Liest alle Dateien eines ZIP (File/Blob). onTeil(i, n) meldet den Fortschritt. Ergebnis: [File, …]
  async function lies(file, onTeil) {
    const tailLen = Math.min(file.size, 65557 + 22);
    const tail = new Uint8Array(await file.slice(file.size - tailLen).arrayBuffer());
    let e = -1;
    for (let i = tail.length - 22; i >= 0; i--) if (u32(tail, i) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Kein gültiges ZIP.');
    const total = u16(tail, e + 10), cdSize = u32(tail, e + 12), cdOff = u32(tail, e + 16);
    if (cdOff === 0xFFFFFFFF || total === 0xFFFF) throw new Error('ZIP64 wird nicht unterstützt – bitte in kleinere ZIPs aufteilen.');
    const cd = new Uint8Array(await file.slice(cdOff, cdOff + cdSize).arrayBuffer());
    const eintraege = [];
    for (let p = 0, k = 0; k < total && u32(cd, p) === 0x02014b50; k++) {
      const method = u16(cd, p + 10), csize = u32(cd, p + 20), usize = u32(cd, p + 24);
      const nl = u16(cd, p + 28), el = u16(cd, p + 30), cl = u16(cd, p + 32), lho = u32(cd, p + 42);
      const name = new TextDecoder('utf-8').decode(cd.subarray(p + 46, p + 46 + nl));
      eintraege.push({ name, method, csize, usize, lho });
      p += 46 + nl + el + cl;
    }
    const out = [];
    let i = 0;
    for (const en of eintraege) {
      i++;
      if (en.name.endsWith('/') || /(^|\/)(__MACOSX|\._)/.test(en.name)) continue;
      const lh = new Uint8Array(await file.slice(en.lho, en.lho + 30).arrayBuffer());
      if (u32(lh, 0) !== 0x04034b50) throw new Error('ZIP defekt (Kopf)');
      const start = en.lho + 30 + u16(lh, 26) + u16(lh, 28);
      const raw = new Uint8Array(await file.slice(start, start + en.csize).arrayBuffer());
      let data;
      if (en.method === 0) data = raw;
      else if (en.method === 8) data = inflate(raw, en.usize);
      else throw new Error('ZIP-Verfahren ' + en.method + ' wird nicht unterstützt.');
      out.push(new File([data], en.name.split('/').pop(), { type: '' }));
      if (onTeil) onTeil(i, eintraege.length);
    }
    return out;
  }
  return { lies, inflate };
})();
