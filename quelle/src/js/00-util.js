'use strict';
// ---------- kleine Helfer ----------
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = s => esc(s).replace(/\*(.+?)\*/g, '<i>$1</i>');          // *kursiv* aus den Kartendaten
const plain = s => String(s == null ? '' : s).replace(/\*(.+?)\*/g, '');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pad2 = n => String(n).padStart(2, '0');
const wait = ms => new Promise(r => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const copy = o => JSON.parse(JSON.stringify(o));
const sum = a => a.reduce((x, y) => x + y, 0);

// Zufall: mulberry32 (mit Startwert reproduzierbar, sonst zufällig)
function rng(seed) {
  let a = (seed == null ? Math.floor(Math.random() * 4294967296) : seed) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const RND = rng();                                   // App-Zufall (Tests können RND ersetzen)
let rand = () => RND();
const randInt = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = a => a[Math.floor(rand() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------- Datum (Tage als 'JJJJ-MM-TT', lokale Zeit) ----------
const TAGMS = 86400000;
const tagStr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const heute = () => window.__heute || tagStr(new Date());           // Tests setzen window.__heute
const tagNr = s => { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / TAGMS); };
const nrTag = n => { const d = new Date(n * TAGMS); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`; };
const addTage = (s, n) => nrTag(tagNr(s) + n);
const diffTage = (a, b) => tagNr(b) - tagNr(a);                      // b - a
const wochentag = s => new Date(tagNr(s) * TAGMS).getUTCDay();       // 0 = So
const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
function datumDe(s, mitTag) {
  const [y, m, d] = s.split('-').map(Number);
  return (mitTag ? WT[wochentag(s)] + ', ' : '') + `${d}. ${MON[m - 1]}`;
}
const wochenStart = s => addTage(s, -((wochentag(s) + 6) % 7));       // Montag der Woche

// ---------- Zahlen / Text ----------
const nf = n => Math.round(n).toLocaleString('de-DE');
const plural = (n, e, m) => `${nf(n)} ${n === 1 ? e : m}`;
function norm(s) {                                                    // für Tipp-Vergleiche
  return String(s || '').toLowerCase().replace(/\*(.+?)\*/g, '').replace(/[’‘`´]/g, "'").replace(/ /g, ' ')
    .replace(/[!?.,;:()"]/g, ' ').replace(/\s+/g, ' ').trim();
}
