'use strict';
// ---------- Karten einlesen: Ordner / Dateien / ZIP → Lektionen ----------
// Alles Nötige steckt im Dateinamen:  E04_DE-EN_011_1-vorne.webp (oder .png/.jpg)  =  Englisch, Lektion 04, Kartensatz DE-EN, Nr. 011, Vorderseite.
// Die Ordnerstruktur ist egal (beim Ziehen auf dem iPad geht sie ohnehin leicht verloren).
const SATZ = {                                            // bekannte Kartensätze; unbekannte werden als Wortkarte behandelt
  'DE-EN': { name: 'Deutsch → Englisch', kurz: 'DE → EN', art: 'wort', von: 'de' },
  'EN-DE': { name: 'Englisch → Deutsch', kurz: 'EN → DE', art: 'wort', von: 'fremd' },
  'DE-FR': { name: 'Deutsch → Französisch', kurz: 'DE → FR', art: 'wort', von: 'de' },
  'FR-DE': { name: 'Französisch → Deutsch', kurz: 'FR → DE', art: 'wort', von: 'fremd' },
  'EXTRA': { name: 'Extra', kurz: 'EXTRA', art: 'extra' },
  'BILD': { name: 'Bildkarten', kurz: 'BILD', art: 'bild' },
  'VERB': { name: 'Verben', kurz: 'VERB', art: 'verb' }          // vorne deutsches Verb, hinten Infinitiv + Simple Past (nur Umdreh-Karte, kein Quiz/Tippen)
};
const satzInfo = s => SATZ[s] || { name: s, kurz: s, art: 'wort', von: 'de' };
const SATZ_REIHE = ['DE-EN', 'EN-DE', 'DE-FR', 'FR-DE', 'EXTRA', 'BILD', 'VERB'];
const SPRACHE = {
  en: { id: 'en', name: 'Englisch', buchstabe: 'E', farbe: '#E9683A', dunkel: '#B3441B', hell: '#FDE9DE', tts: 'en-GB', lektion: 'Unit' },
  fr: { id: 'fr', name: 'Französisch', buchstabe: 'F', farbe: '#6A4FC8', dunkel: '#4A349C', hell: '#E9E4FA', tts: 'fr-FR', lektion: 'Lektion' }
};

// Nummernteil: 011 (Vokabel), B1 (Bildkarte), V01 (Verbkarte)
const KARTE_RE = /([EF])(\d{2})_([A-Za-z]{2,5}(?:-[A-Za-z]{2,3})?)_([BV]?\d{1,3})_([12])-(vorne|hinten)/i;
function parseKarte(name) {
  const m = KARTE_RE.exec(name);
  if (!m) return null;
  const sp = m[1].toUpperCase() === 'E' ? 'en' : 'fr';
  const lk = m[1].toUpperCase() + m[2];
  const satz = m[3].toUpperCase();
  const bild = /^B/i.test(m[4]), verb = /^V/i.test(m[4]);
  const num = parseInt(m[4].replace(/^[BV]/i, ''), 10);
  const nrTxt = bild ? 'B' + num : verb ? 'V' + num : String(num).padStart(3, '0');
  // Verbkarten haben eigene Nummern (V01 …) und kein Gegenstück in den Vokabeln: Nr. + 1000, damit sie nie mit Eintrag 1 verwechselt werden und nach allen Vokabeln stehen
  return { sp, lkey: lk, lektion: parseInt(m[2], 10), satz, nr: verb ? 1000 + num : num, bild, seite: m[5] === '1' ? 'v' : 'h', cid: `${lk}_${satz}_${nrTxt}` };
}

// ----- Ziehen & Ablegen: Ordner rekursiv lesen (muss synchron im Drop-Ereignis starten) -----
// Auf dem iPad gibt Safari ganze Ordner nicht heraus (von dir getestet). Deshalb: nichts hängen lassen (Zeitlimit),
// genau aufschreiben, was ankam, und im Bericht den Ausweg zeigen (ZIP oder alle Dateien markieren).
function dropAnfang(dt) {
  const items = dt.items ? Array.from(dt.items) : [];
  const entries = items.map(i => { try { return i.webkitGetAsEntry ? i.webkitGetAsEntry() : null; } catch (e) { return null; } });
  const flach = Array.from(dt.files || []);
  const diag = {
    items: items.map((i, k) => `${i.kind}/${i.type || '-'}/${entries[k] ? (entries[k].isDirectory ? 'Ordner ' : 'Datei ') + entries[k].name : 'kein Eintrag'}`),
    dateien: flach.slice(0, 12).map(f => `${f.name} (${f.size} B, ${f.type || '-'})`) };
  if (flach.length > 12) diag.dateien.push(`… und ${flach.length - 12} weitere`);
  return { entries, flach, diag };
}
const mitZeit = (p, ms, was) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(was + ': keine Antwort')), ms))]);
function eintragDatei(en) { return new Promise((res, rej) => en.file(res, rej)); }
function eintragKinder(en) {
  return new Promise((res, rej) => {
    const rd = en.createReader(), all = [];
    const naechste = () => rd.readEntries(es => { if (!es.length) res(all); else { all.push(...es); naechste(); } }, rej);
    naechste();
  });
}
async function laufe(en, out, log) {
  if (!en) return;
  try {
    if (en.isFile) out.push(await mitZeit(eintragDatei(en), 8000, 'Datei'));
    else if (en.isDirectory) {
      log.ordner++;
      const ks = await mitZeit(eintragKinder(en), 8000, 'Ordner');
      log.kinder += ks.length;
      for (const k of ks) await laufe(k, out, log);
    }
  } catch (e) { log.fehler.push(`${en.name}: ${(e && e.message) || e}`); }
}
// Ergebnis: { dateien, ordner (es wurde ein Ordner gezogen), diag }
async function dateienAusDrop(d) {
  const out = [], log = { ordner: 0, kinder: 0, fehler: [] };
  for (const en of d.entries) await laufe(en, out, log);
  const dateien = out.length ? out : d.flach;
  const pseudo = d.flach.some(f => f.size === 0 || !/\.[a-z0-9]{2,5}$/i.test(f.name));      // ein Ordner erscheint oft als leere „Datei“ ohne Endung
  return { dateien, ordner: log.ordner > 0 || (!out.length && pseudo), diag: Object.assign({}, d.diag, { ordner: log.ordner, kinder: log.kinder, fehler: log.fehler }) };
}

// ----- Bilder verkleinern & speichern -----
function ladeBild(blob) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(blob), im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); res(im); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Bild nicht lesbar')); };
    im.src = u;
  });
}
async function packe(file, modus) {
  const buf0 = await file.arrayBuffer();
  const typ = /\.jpe?g$/i.test(file.name) ? 'image/jpeg' : /\.webp$/i.test(file.name) ? 'image/webp' : 'image/png';
  if (modus === 'original') return { type: typ, buf: buf0 };
  const blob = new Blob([buf0], { type: typ });
  let bmp;
  try { bmp = await createImageBitmap(blob); } catch (e) { bmp = await ladeBild(blob); }
  const bw = bmp.width, bh = bmp.height;
  // Schon klein und komprimiert (WebP 1500 px aus dem Kartenbau): unverändert übernehmen, Neukodieren würde sie nur größer machen
  if (typ !== 'image/png' && bw <= 1500) { if (bmp.close) bmp.close(); return { type: typ, buf: buf0, w: bw, h: bh }; }
  const w = Math.min(bw, 1500), h = Math.round(bh * w / bw);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  const out = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
  if (!out) return { type: typ, buf: buf0 };
  return { type: 'image/jpeg', buf: await out.arrayBuffer(), w, h };
}

// ----- Bibliothek -----
function lektionStandard(sp, lkey, nr) {
  return { key: lkey, sp, nr, titel: `${SPRACHE[sp].lektion} ${nr}`, buch: '', klasse: 5, hasText: false, tts: SPRACHE[sp].tts, entries: {}, bild: {}, cards: {}, added: Date.now() };
}
function textEintragen(L, j) {
  L.hasText = true;
  L.titel = j.titel || L.titel; L.buch = j.buch || L.buch; L.klasse = j.klasse || L.klasse; L.tts = j.tts || L.tts;
  (j.eintraege || []).forEach(e => { L.entries[e.nr] = e; });
  (j.bildkarten || []).forEach(b => { L.bild[b.id] = b; });
}

// Hauptfunktion: nimmt eine Liste von File-Objekten, legt Karten + Texte in Speicher und Bibliothek
async function importiere(dateien, fortschritt) {
  const fort = fortschritt || (() => {});
  const bericht = { neu: 0, aktualisiert: 0, lektionen: [], ohneText: [], unvollstaendig: [], ignoriert: 0, fehler: [], dateien: dateien.length };
  let alle = [];
  for (const f of dateien) {
    if (/\.zip$/i.test(f.name)) {
      try { alle.push(...await ZIP.lies(f, (i, n) => fort(`ZIP „${f.name}“ öffnen …`, i, n))); }
      catch (e) { bericht.fehler.push(`${f.name}: ${e.message}`); }
    } else alle.push(f);
  }
  const jsons = [], gruppen = new Map();
  for (const f of alle) {
    if (/\.json$/i.test(f.name)) { jsons.push(f); continue; }
    const p = parseKarte(f.name);
    if (!p || !/\.(png|jpe?g|webp)$/i.test(f.name)) { bericht.ignoriert++; continue; }
    if (!gruppen.has(p.cid)) gruppen.set(p.cid, { p, v: null, h: null });
    gruppen.get(p.cid)[p.seite] = f;
  }
  const beruehrt = new Set();
  // Textdateien zuerst, damit auch neue Lektionen ihren Namen bekommen
  for (const f of jsons) {
    try {
      const j = JSON.parse(await f.text());
      if (!j || !j.praefix || !j.sprache || !Array.isArray(j.eintraege)) { bericht.ignoriert++; continue; }
      const L = S.lib.lessons[j.praefix] || (S.lib.lessons[j.praefix] = lektionStandard(j.sprache, j.praefix, j.lektion));
      textEintragen(L, j); beruehrt.add(j.praefix);
    } catch (e) { bericht.fehler.push(`${f.name}: kein lesbares JSON`); }
  }
  const liste = Array.from(gruppen.values());
  let i = 0;
  for (const g of liste) {
    i++;
    const { p } = g;
    if (!g.v || !g.h) { bericht.unvollstaendig.push(`${p.cid} (${g.v ? 'Rückseite' : 'Vorderseite'} fehlt)`); continue; }
    fort(`Karte ${i} von ${liste.length}: ${p.cid}`, i, liste.length);
    try {
      const a = await packe(g.v, S.bildmodus), b = await packe(g.h, S.bildmodus);
      await DB.set('img', p.cid + '_v', a); await DB.set('img', p.cid + '_h', b);
      imgFreigeben([p.cid + '_v', p.cid + '_h']);
      const L = S.lib.lessons[p.lkey] || (S.lib.lessons[p.lkey] = lektionStandard(p.sp, p.lkey, p.lektion));
      if (L.cards[p.cid]) bericht.aktualisiert++; else bericht.neu++;
      L.cards[p.cid] = { satz: p.satz, nr: p.nr, bild: p.bild };
      beruehrt.add(p.lkey);
    } catch (e) { bericht.fehler.push(`${p.cid}: ${e.message || e}`); }
  }
  bericht.lektionen = Array.from(beruehrt).sort();
  bericht.ohneText = bericht.lektionen.filter(k => S.lib.lessons[k] && !S.lib.lessons[k].hasText);
  await sichereJetzt();
  return bericht;
}

async function lektionLoeschen(lkey) {
  const L = S.lib.lessons[lkey];
  if (!L) return;
  for (const cid of Object.keys(L.cards)) { await DB.del('img', cid + '_v'); await DB.del('img', cid + '_h'); imgFreigeben([cid + '_v', cid + '_h']); }
  delete S.lib.lessons[lkey];                  // Lernstand und Projektzuordnung bleiben erhalten: Neu-Import knüpft wieder an
  await sichereJetzt();
}
