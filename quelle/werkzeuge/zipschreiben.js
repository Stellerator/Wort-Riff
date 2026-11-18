// ZIP-Dateien schreiben und kleine Test-PNGs erzeugen (ohne Bibliothek, nur Node).
const fs = require('fs');
const zlib = require('zlib');

// dateien: Map Pfad → Buffer. Schon Komprimiertes (zip, webp, png, jpg, woff2) wird nur gespeichert, der Rest per Deflate.
function zipBytes(dateien) {
  const jetzt = new Date();
  const zeit = (jetzt.getHours() << 11) | (jetzt.getMinutes() << 5) | (jetzt.getSeconds() >> 1);
  const datum = ((jetzt.getFullYear() - 1980) << 9) | ((jetzt.getMonth() + 1) << 5) | jetzt.getDate();
  const teile = [], zentral = [];
  let pos = 0;
  for (const [name, roh] of dateien) {
    const nb = Buffer.from(name, 'utf8');
    let daten = roh, methode = 0;
    if (roh.length > 64 && !/\.(zip|webp|png|jpe?g|woff2?)$/i.test(name)) { const d = zlib.deflateRawSync(roh, { level: 9 }); if (d.length < roh.length) { daten = d; methode = 8; } }
    const crc = zlib.crc32(roh);
    const l = Buffer.alloc(30);
    l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt16LE(0x0800, 6); l.writeUInt16LE(methode, 8); l.writeUInt16LE(zeit, 10); l.writeUInt16LE(datum, 12);
    l.writeUInt32LE(crc, 14); l.writeUInt32LE(daten.length, 18); l.writeUInt32LE(roh.length, 22); l.writeUInt16LE(nb.length, 26);
    teile.push(l, nb, daten);
    const z = Buffer.alloc(46);
    z.writeUInt32LE(0x02014b50, 0); z.writeUInt16LE(20, 4); z.writeUInt16LE(20, 6); z.writeUInt16LE(0x0800, 8); z.writeUInt16LE(methode, 10); z.writeUInt16LE(zeit, 12); z.writeUInt16LE(datum, 14);
    z.writeUInt32LE(crc, 16); z.writeUInt32LE(daten.length, 20); z.writeUInt32LE(roh.length, 24); z.writeUInt16LE(nb.length, 28); z.writeUInt32LE(pos, 42);
    zentral.push(z, nb);
    pos += 30 + nb.length + daten.length;
  }
  const zd = Buffer.concat(zentral);
  const ende = Buffer.alloc(22);
  ende.writeUInt32LE(0x06054b50, 0); ende.writeUInt16LE(dateien.size, 8); ende.writeUInt16LE(dateien.size, 10); ende.writeUInt32LE(zd.length, 12); ende.writeUInt32LE(pos, 16);
  return Buffer.concat([...teile, zd, ende]);
}
function zipSchreiben(dateien, ziel) { fs.writeFileSync(ziel, zipBytes(dateien)); }

// Kleines, gültiges PNG (einfarbig) – für Tests mit Kartenpaketen
function png(breite, hoehe, [r, g, b]) {
  const chunk = (typ, daten) => {
    const t = Buffer.from(typ, 'ascii'), len = Buffer.alloc(4); len.writeUInt32BE(daten.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, daten])));
    return Buffer.concat([len, t, daten, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(breite, 0); ihdr.writeUInt32BE(hoehe, 4); ihdr[8] = 8; ihdr[9] = 2;
  const zeile = Buffer.alloc(1 + breite * 3); for (let x = 0; x < breite; x++) { zeile[1 + x * 3] = r; zeile[2 + x * 3] = g; zeile[3 + x * 3] = b; }
  const roh = Buffer.concat(Array.from({ length: hoehe }, () => zeile));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(roh)), chunk('IEND', Buffer.alloc(0))]);
}
// Testpaket: Lektion mit n Wörtern, je zwei Bilder (vorne/hinten) als DE-EN-Karten
function testPaket(praefix, nr, titel, n, farbe) {
  const m = new Map();
  const eintraege = [];
  for (let i = 1; i <= n; i++) {
    const nn = String(i).padStart(3, '0');
    m.set(`DE-EN/${praefix}_DE-EN_${nn}_1-vorne.png`, png(16, 10, farbe || [30, 120, 200]));
    m.set(`DE-EN/${praefix}_DE-EN_${nn}_2-hinten.png`, png(16, 10, [240, 200, 60]));
    eintraege.push({ nr: i, en: 'word' + i, de: 'wort' + i });
  }
  m.set('lektion.json', Buffer.from(JSON.stringify({ praefix, sprache: praefix[0] === 'E' ? 'en' : 'fr', buch: 'Testbuch', klasse: 5, lektion: nr, titel, eintraege }), 'utf8'));
  return m;
}
module.exports = { zipBytes, zipSchreiben, png, testPaket };
