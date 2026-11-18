'use strict';
// ---------- Speicher: IndexedDB (Karten-Bilder + Zustand), mit Notlösung im Arbeitsspeicher ----------
const DB = {
  db: null, ok: false, mem: { kv: new Map(), img: new Map() },
  open() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('wortriff', 1);
        r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kv'); d.createObjectStore('img'); };
        r.onsuccess = () => { DB.db = r.result; DB.ok = true; res(true); };
        r.onerror = r.onblocked = () => res(false);
      } catch (e) { res(false); }
    });
  },
  _tx(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = DB.db.transaction(store, mode), s = t.objectStore(store);
      let out; const rq = fn(s); if (rq) rq.onsuccess = () => { out = rq.result; };
      t.oncomplete = () => res(out); t.onerror = t.onabort = () => rej(t.error);
    });
  },
  async get(store, key) { return DB.ok ? DB._tx(store, 'readonly', s => s.get(key)) : DB.mem[store].get(key); },
  async set(store, key, val) { if (DB.ok) await DB._tx(store, 'readwrite', s => s.put(val, key)); else DB.mem[store].set(key, val); },
  async del(store, key) { if (DB.ok) await DB._tx(store, 'readwrite', s => s.delete(key)); else DB.mem[store].delete(key); },
  async keys(store) { return DB.ok ? DB._tx(store, 'readonly', s => s.getAllKeys()) : Array.from(DB.mem[store].keys()); },
  async clear(store) { if (DB.ok) await DB._tx(store, 'readwrite', s => s.clear()); else DB.mem[store].clear(); }
};

// ---------- Bilder: als Bytes speichern, bei Bedarf als Blob-URL ausliefern ----------
const IMGURL = new Map();                              // key -> blob-URL
async function imgUrl(key) {
  if (IMGURL.has(key)) return IMGURL.get(key);
  const rec = await DB.get('img', key);
  if (!rec) return null;
  const url = URL.createObjectURL(new Blob([rec.buf], { type: rec.type }));
  IMGURL.set(key, url);
  return url;
}
function imgFreigeben(keys) {                          // Blob-URLs wieder loslassen (Arbeitsspeicher schonen)
  keys.forEach(k => { const u = IMGURL.get(k); if (u) { URL.revokeObjectURL(u); IMGURL.delete(k); } });
}
async function imgVorladen(keys) { await Promise.all(keys.map(imgUrl)); }

// ---------- Zustand (S) sichern / laden ----------
let S = null;
let saveTimer = null, saveFehler = false;
async function ladeZustand() {
  let s = null;
  try { s = await DB.get('kv', 'state'); } catch (e) { s = null; }
  if (!s) try { const t = localStorage.getItem('wortriff-state'); if (t) s = JSON.parse(t); } catch (e) { s = null; }
  S = s && s.v === 1 ? s : { v: 1, users: {}, cur: null, lib: { lessons: {} }, bildmodus: 'sparsam' };
  S.lib = S.lib || { lessons: {} };
  return S;
}
async function sichereJetzt() {
  clearTimeout(saveTimer); saveTimer = null;
  try { await DB.set('kv', 'state', S); saveFehler = false; }
  catch (e) { saveFehler = true; try { localStorage.setItem('wortriff-state', JSON.stringify(S)); } catch (e2) { /* voll */ } }
}
function sichere() { if (saveTimer) return; saveTimer = setTimeout(sichereJetzt, 350); }
window.addEventListener('pagehide', () => { if (S) sichereJetzt(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && S) sichereJetzt(); });

// ---------- Sicherung: Fortschritt als Datei ----------
const sicherungInhalt = () => JSON.stringify({ app: 'wortriff', format: 1, am: new Date().toISOString(), zustand: S });
function sicherungsDatei() {                                       // Download (Rechner, Browser)
  const blob = new Blob([sicherungInhalt()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Wortriff_Sicherung_${heute()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  S.sicherung = heute(); sichere();
}
// iPad: Teilen-Blatt → „In Dateien sichern“ (Download-Links funktionieren in der Home-Bildschirm-App nicht zuverlässig). Ergebnis: 'geteilt' | 'abgebrochen' | 'heruntergeladen'
async function sicherungTeilen() {
  const name = `Wortriff_Sicherung_${heute()}.json`;
  if (navigator.canShare && navigator.share) {
    for (const typ of ['application/json', 'text/plain']) {
      let file = null; try { file = new File([sicherungInhalt()], name, { type: typ }); } catch (e) { file = null; }
      try {
        if (file && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Wortriff-Sicherung' }); S.sicherung = heute(); sichere(); return 'geteilt'; }
      } catch (e) { if (e && e.name === 'AbortError') return 'abgebrochen'; }
    }
  }
  sicherungsDatei();
  return 'heruntergeladen';
}
async function sicherungLaden(file) {
  const j = JSON.parse(await file.text());
  if (j.app !== 'wortriff' || !j.zustand || j.zustand.v !== 1) throw new Error('Das ist keine Wortriff-Sicherung.');
  S = j.zustand; S.lib = S.lib || { lessons: {} };
  await sichereJetzt();
}
