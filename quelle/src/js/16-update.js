'use strict';
// ---------- Web-App: Service Worker, Updates, Kartenpakete aus dem Repo, Umzug ----------
// Läuft die App von einer Webadresse (https, z. B. GitHub Pages), gilt: Offline-Kopie per Service Worker, Update-Prüfung beim Start und beim
// Zurückkehren, neue Kartenpakete aus karten/ werden von selbst eingelesen. Als lokale Datei (file://) ist das alles aus, der Rest läuft wie bisher.
// Kartenpakete: karten/index.json (vom Repo-Bau erzeugt) plus – falls erreichbar – das GitHub-Verzeichnis karten/, damit auch von Hand
// hochgeladene ZIP-Dateien gefunden werden. Was schon geladen wurde, steht nur auf diesem Gerät (kv „repo“), nicht in der Sicherung.
const UPD = { web: /^https?:$/.test(location.protocol), reg: null, wartet: null, geprueft: 0, laeuft: false, ergebnis: null, pakete: [], listeFehler: false, letzteEingabe: Date.now(), frage: null, neuLaden: false };
const istApp = () => !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));
const istIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const appEinst = () => { S.einst = Object.assign({ autoUpdate: true, autoKarten: true }, S.einst || {}); return S.einst; };
document.addEventListener('pointerdown', () => { UPD.letzteEingabe = Date.now(); }, true);

// ---------- kleine Statusanzeige unten ----------
function updPille(text, pct, knoepfe) {
  let el = $('#updpille');
  if (!text) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'updpille'; el.className = 'updpille'; document.body.appendChild(el); }
  el.innerHTML = `<span class="t">${esc(text)}</span>${pct != null ? `<span class="bar"><b style="width:${Math.round(pct)}%"></b></span>` : ''}${(knoepfe || []).map(k => `<button class="btn klein ${k[2] || 'gold'}" data-a="${k[1]}">${esc(k[0])}</button>`).join('')}`;
}
function updPilleStand() {                                          // zeigt, was gerade wichtig ist (Update bereit / Frage zu Karten)
  if (UPD.wartet) updPille('Neue Version bereit.', null, [['Jetzt installieren', 'updateJetzt']]);
  else if (UPD.frage) updPille(`${UPD.frage.pakete.length} neue ${UPD.frage.pakete.length === 1 ? 'Kartenpaket' : 'Kartenpakete'} (${updMB(UPD.frage.bytes)} MB) gefunden.`, null, [['Laden', 'kartenFrageJa'], ['Später', 'kartenFrageNein', 'weiss']]);
  else updPille('');
}
const updMB = b => (b / 1048576 >= 10 ? Math.round(b / 1048576) : Math.round(b / 104857.6) / 10).toLocaleString('de-DE');

// ---------- Service Worker (Offline-Kopie und App-Update) ----------
function updSwStart() {
  if (!UPD.web || !('serviceWorker' in navigator)) return;
  let hatteSteuerung = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {           // neuer Service Worker hat übernommen → neu laden (nicht beim allerersten Installieren)
    if (!hatteSteuerung) { hatteSteuerung = true; return; }
    if (UPD.neuLaden) return;
    UPD.neuLaden = true; location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
    UPD.reg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) updNeuWartet(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) updNeuWartet(nw); });
    });
  }).catch(() => { /* kein Service Worker: die App läuft trotzdem */ });
}
function updNeuWartet(sw) { UPD.wartet = sw; updPilleStand(); if (V.name === 'ich') ichUpdateStatus(); }
async function updateAnwenden() {
  if (!UPD.wartet) { UPD.neuLaden = true; location.reload(); return; }
  updPille('Update wird installiert …', null);
  try { await sichereJetzt(); } catch (e) { /* weiter */ }
  UPD.wartet.postMessage('skip');
  setTimeout(() => { if (!UPD.neuLaden) { UPD.neuLaden = true; location.reload(); } }, 5000);
}
AKT.updateJetzt = () => updateAnwenden();
// Von selbst installieren nur auf den Startseiten und wenn gerade nichts angetippt wird, sonst bleibt der Knopf stehen (nie mitten in der Runde neu laden).
setInterval(() => {
  if (!UPD.wartet || UPD.neuLaden) return;
  if ((V.name === 'start' || V.name === 'profile') && Date.now() - UPD.letzteEingabe > 2500 && !$('#layer').firstElementChild && !IMP.laeuft) updateAnwenden();
}, 2000);
const updRuhig = () => ['start', 'profile', 'karte', 'album', 'riff', 'bibliothek', 'ich'].indexOf(V.name) >= 0 && !$('#layer').firstElementChild;

// ---------- Netz ----------
async function updJson(url) {
  const r = await fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error(url + ': ' + r.status);
  return r.json();
}
function repoAdresse(idx, loc) {                                          // https://<name>.github.io/<repo>/  →  { owner, repo }  (oder in index.json eingetragen)
  if (idx && idx.repo && idx.repo.owner && idx.repo.repo) return idx.repo;
  loc = loc || location;
  const m = /^([a-z0-9-]+)\.github\.io$/i.exec(loc.hostname);
  if (!m) return null;
  const seg = loc.pathname.split('/').filter(Boolean);
  return { owner: m[1], repo: seg.length && !/\.html?$/i.test(seg[0]) ? seg[0] : m[1] + '.github.io' };
}
async function repoPaketListe() {                                       // → [{ datei, bytes, sha, name, lektionen:[{key,titel,karten}], raw? }]
  const map = new Map();
  let idx = null;
  try { idx = await updJson('karten/index.json'); (idx.pakete || []).forEach(p => map.set(p.datei, Object.assign({}, p))); } catch (e) { idx = null; }
  const gh = repoAdresse(idx);
  let apiOk = false;
  if (gh) {
    try {
      const r = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/karten`, { headers: { Accept: 'application/vnd.github+json' } });
      if (r.ok) {
        apiOk = true;
        (await r.json()).filter(f => f.type === 'file' && /\.zip$/i.test(f.name)).forEach(f => {
          const alt = map.get(f.name);
          if (alt) { if (alt.sha !== f.sha) { alt.sha = f.sha; alt.bytes = f.size; } alt.raw = f.download_url; }       // Datei wurde nach dem Index-Bau ersetzt: GitHub hat recht
          else map.set(f.name, { datei: f.name, bytes: f.size, sha: f.sha, raw: f.download_url, name: f.name.replace(/\.zip$/i, '').replace(/_/g, ' '), lektionen: [] });
        });
      }
    } catch (e) { /* GitHub nicht erreichbar oder Grenze erreicht: der Index genügt */ }
  }
  if (!idx && !apiOk) throw new Error('keine Kartenliste');
  return Array.from(map.values()).sort((a, b) => a.datei.localeCompare(b.datei));
}
async function updBlob(url, fort) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(url + ': ' + r.status);
  const gesamt = +r.headers.get('content-length') || 0;
  if (!r.body || !r.body.getReader) return r.blob();
  const rd = r.body.getReader(), teile = []; let gelesen = 0;
  for (;;) { const { done, value } = await rd.read(); if (done) break; teile.push(value); gelesen += value.length; if (fort) fort(gelesen, gesamt); }
  return new Blob(teile, { type: 'application/zip' });
}

// ---------- Was ist schon geladen? (nur auf diesem Gerät) ----------
async function repoStand() { try { return (await DB.get('kv', 'repo')) || { pakete: {} }; } catch (e) { return { pakete: {} }; } }
async function repoMerken(st) { try { await DB.set('kv', 'repo', st); } catch (e) { /* egal */ } }
async function kartenLuecken() {                                     // Lektionen, für die Bilder fehlen (z. B. nach dem Laden einer Sicherung auf einem neuen Gerät)
  const keys = new Set(await DB.keys('img')), out = [];
  Object.values(S.lib.lessons).forEach(L => {
    const cids = Object.keys(L.cards), fehlt = cids.filter(c => !keys.has(c + '_v') || !keys.has(c + '_h')).length;
    if (fehlt) out.push({ key: L.key, titel: L.titel, sp: L.sp, fehlt, gesamt: cids.length });
  });
  return out;
}
async function paketeBereitsDa(p, luecken) {                         // alle Lektionen des Pakets sind schon vollständig im Gerät
  const ks = (p.lektionen || []);
  if (!ks.length) return false;
  return ks.every(l => { const L = S.lib.lessons[l.key]; return L && Object.keys(L.cards).length >= (l.karten || 1) && !luecken.some(x => x.key === l.key); });
}

// ---------- Paket laden und einlesen ----------
async function paketLaden(p, fort) {
  const urls = ['karten/' + encodeURIComponent(p.datei)];
  if (p.raw) urls.push(p.raw);                                       // GitHub-Pages braucht nach dem Hochladen ein, zwei Minuten: bis dahin direkt von GitHub
  let blob = null, fehler = null;
  for (const u of urls) { try { blob = await updBlob(u, (g, n) => fort && fort('lade', g, n)); break; } catch (e) { fehler = e; } }
  if (!blob) throw fehler || new Error('Download fehlgeschlagen');
  IMP.laeuft = true; IMP.bericht = null; IMP.text = `Karten einlesen: ${p.name || p.datei}`; IMP.i = 0; IMP.n = 0;
  let b;
  try {
    b = await importiere([new File([blob], p.datei, { type: 'application/zip' })], (txt, i, n) => { IMP.text = txt; IMP.i = i; IMP.n = n; if (fort) fort('lese', i, n); });
  } finally { IMP.laeuft = false; }
  b.ordner = false; IMP.bericht = b;
  return b;
}
async function kartenSync(o) {
  o = o || {};
  const r = { geladen: [], offen: [], fehler: [], keineListe: false };
  let liste;
  try { liste = await repoPaketListe(); UPD.listeFehler = false; } catch (e) { UPD.listeFehler = true; r.keineListe = true; return r; }
  UPD.pakete = liste;
  const stand = await repoStand();
  const luecken = await kartenLuecken();
  const lokal = Object.keys(S.lib.lessons);
  const faellig = [];
  for (const p of liste) {
    const rec = stand.pakete[p.datei];
    if (!rec) {
      if (await paketeBereitsDa(p, luecken)) { stand.pakete[p.datei] = { sha: p.sha, bytes: p.bytes, am: Date.now(), vorhanden: true }; continue; }   // schon von Hand eingelesen
      faellig.push(p);
    } else if (rec.sha !== p.sha) {
      const ks = (p.lektionen || []).map(l => l.key);
      if (!ks.length || ks.some(k => lokal.indexOf(k) >= 0)) faellig.push(p);                  // geändert: nur nachziehen, wenn die Lektion noch da ist (bewusst Entferntes bleibt weg)
    }
  }
  await repoMerken(stand);
  r.offen = faellig;
  if (!faellig.length) return r;
  const bytes = sum(faellig.map(p => p.bytes || 0));
  if (!o.hand && !(appEinst().autoKarten)) return r;
  if (!o.hand && !appEinst().kartenOk && bytes > 15 * 1048576) { UPD.frage = { pakete: faellig, bytes }; updPilleStand(); return r; }   // große Mengen erst mit Ja
  return kartenLaden(faellig, r);
}
async function kartenLaden(faellig, r) {
  r = r || { geladen: [], offen: [], fehler: [] };
  const stand = await repoStand();
  let k = 0;
  for (const p of faellig) {
    k++;
    const kopf = `Karten ${k}/${faellig.length}: ${p.name || p.datei}`;
    try {
      const b = await paketLaden(p, (was, a, n) => updPille(was === 'lade' ? `${kopf} laden` : `${kopf} einlesen`, n ? a / n * 100 : null));
      if (b.fehler.length || b.neu + b.aktualisiert === 0) { r.fehler.push(`${p.datei}: ${b.fehler[0] || 'keine Karten gefunden'}`); continue; }
      stand.pakete[p.datei] = { sha: p.sha, bytes: p.bytes, am: Date.now() };
      await repoMerken(stand);
      r.geladen.push({ datei: p.datei, name: p.name || p.datei, karten: b.neu + b.aktualisiert });
    } catch (e) { r.fehler.push(`${p.datei}: ${(e && e.message) || e}`); }
  }
  updPille('');
  r.offen = [];
  if (r.geladen.length) { TON.spiel('fertig'); FX.blasen(innerWidth / 2, innerHeight / 2, 24); }
  if (V.name === 'bibliothek') render();
  return r;
}
AKT.kartenFrageJa = async () => { const f = UPD.frage; UPD.frage = null; appEinst().kartenOk = true; sichere(); updPilleStand(); if (f) { const r = await kartenLaden(f.pakete); updErgebnis({ geladen: r.geladen, fehler: r.fehler, hand: false }); } };
AKT.kartenFrageNein = () => { UPD.frage = null; updPilleStand(); };

// ---------- Prüfung: App + Karten ----------
function updWarte(sw, ms) {
  return new Promise(res => {
    if (!sw || sw.state === 'installed' || sw.state === 'activated') return res();
    const t = setTimeout(res, ms);
    sw.addEventListener('statechange', () => { if (['installed', 'activated', 'redundant'].indexOf(sw.state) >= 0) { clearTimeout(t); res(); } });
  });
}
function updErgebnis(e) {
  const t = [];
  if (e.app) t.push('Neue App-Version bereit.');
  if (e.geladen && e.geladen.length) t.push(`${e.geladen.length} ${e.geladen.length === 1 ? 'Kartenpaket' : 'Kartenpakete'} geladen (${sum(e.geladen.map(g => g.karten))} Karten).`);
  if (e.fehler && e.fehler.length) t.push('Problem: ' + e.fehler[0]);
  if (!t.length) t.push(e.offline ? 'Keine Verbindung. Ich versuche es später wieder.' : e.keineListe ? 'Keine Kartenliste gefunden. Die App ist aktuell.' : 'Alles aktuell.');
  UPD.ergebnis = Object.assign({ zeit: Date.now(), text: t.join(' ') }, e);
  if (e.hand || (e.geladen && e.geladen.length)) toast(UPD.ergebnis.text, e.fehler && e.fehler.length ? 'info' : 'haken', 4200);
  if (V.name === 'ich') ichUpdateStatus();
}
async function updatePruefen(o) {
  o = o || {};
  if (!UPD.web) { if (o.hand) toast('Updates gibt es nur in der Web-Version. Öffne Wortriff über den Link aus dem Repo und lege es auf den Home-Bildschirm.', 'info', 6000); return; }
  if (UPD.laeuft) return;
  UPD.laeuft = true; UPD.geprueft = Date.now();
  if (V.name === 'ich') ichUpdateStatus();
  const erg = { app: false, geladen: [], fehler: [], offline: false, keineListe: false, hand: !!o.hand };
  try {
    if (UPD.reg) {
      try { await UPD.reg.update(); } catch (e) { erg.offline = true; }
      await updWarte(UPD.reg.installing, 20000);
      if (UPD.reg.waiting && navigator.serviceWorker.controller) updNeuWartet(UPD.reg.waiting);
    } else if (navigator.onLine !== false) {
      try { const v = await updJson('version.json'); if (v.id && v.id !== APP_ID) { erg.app = true; if (o.hand) updPille('Neue Version gefunden.', null, [['Seite neu laden', 'updateJetzt']]); } } catch (e) { erg.offline = true; }
    }
    erg.app = erg.app || !!UPD.wartet;
    if (!erg.offline && (o.hand || appEinst().autoKarten)) {
      if (!o.hand && !updRuhig()) { UPD.spaeter = true; }                     // nicht während der Runde: später
      else { const r = await kartenSync({ hand: o.hand }); erg.geladen = r.geladen || []; erg.fehler = r.fehler || []; erg.keineListe = !!r.keineListe; }
    }
  } catch (e) { erg.fehler.push(String((e && e.message) || e)); }
  UPD.laeuft = false;
  updErgebnis(erg);
}
AKT.updateSuchen = () => updatePruefen({ hand: true });
function updAutoStart() {
  if (!UPD.web) return;
  const los = () => { if (appEinst().autoUpdate && navigator.onLine !== false && Date.now() - UPD.geprueft > 15 * 60 * 1000) updatePruefen({}); };
  setTimeout(los, 2500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(los, 800); });
  window.addEventListener('online', () => setTimeout(los, 1500));
  setInterval(() => { if (UPD.spaeter && updRuhig() && !UPD.laeuft) { UPD.spaeter = false; updatePruefen({}); } }, 15000);
  setInterval(los, 30 * 60 * 1000);
}

// ---------- Sicherung laden (Umzug von der alten Version / vom alten Gerät) ----------
document.addEventListener('change', async ev => {
  const f = ev.target;
  if (!f || f.id !== 'fSicherung') return;
  const file = f.files[0]; f.value = ''; if (!file) return;
  await sicherungPruefen(file);
});
async function sicherungPruefen(file) {
  let j;
  try { j = JSON.parse(await file.text()); } catch (e) { toast('Die Datei ist keine Wortriff-Sicherung.', 'info', 4500); return; }
  if (!j || j.app !== 'wortriff' || !j.zustand || j.zustand.v !== 1) { toast('Das ist keine Wortriff-Sicherung.', 'info', 4500); return; }
  const z = j.zustand, nutzer = Object.values(z.users || {}), lekt = Object.values((z.lib && z.lib.lessons) || {});
  const karten = sum(lekt.map(L => Object.keys(L.cards || {}).length));
  const antworten = sum(nutzer.map(u => (u.stats && u.stats.antworten) || 0));
  const jetztDa = Object.keys(S.users).length > 0;
  V.sicherungNeu = z;
  zeigeBlatt(`<h2>Sicherung übernehmen?</h2>
    <p class="mut" style="margin:6px 0 12px">Gespeichert am ${esc(j.am ? new Date(j.am).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }) : '?')}</p>
    <div class="panel dicht" style="margin-bottom:12px"><div class="zeile w">${nutzer.map(u => `<span class="chip">${esc(u.name)} · ${nf(u.xp || 0)} XP</span>`).join('') || '<span class="mut">keine Nutzer</span>'}</div>
      <p style="margin-top:10px"><b>${nutzer.length}</b> ${nutzer.length === 1 ? 'Nutzer' : 'Nutzer'} · <b>${nf(antworten)}</b> Antworten · <b>${lekt.length}</b> ${lekt.length === 1 ? 'Lektion' : 'Lektionen'} mit <b>${nf(karten)}</b> Karten</p></div>
    ${jetztDa ? '<div class="hinweisbox" style="margin-bottom:12px"><b>Achtung:</b> Der Stand auf diesem Gerät wird durch die Sicherung ersetzt. Eine Kopie davon bleibt für „Rückgängig“ erhalten.</div>' : ''}
    <p class="mut" style="font-size:14px;margin-bottom:14px">Die Sicherung enthält Lernstand, Belohnungen, Riff und Projekte. Die Kartenbilder holt die App danach selbst${UPD.web ? ' aus dem Repo' : ' (ZIP-Dateien unter „Karten“ hineinziehen)'}.</p>
    <div class="zeile"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn gruen gross" data-a="sicherungJa">Übernehmen</button></div>`);
}
AKT.sicherungJa = async () => {
  const z = V.sicherungNeu; if (!z) return;
  if (Object.keys(S.users).length || Object.keys(S.lib.lessons).length) { try { await DB.set('kv', 'state_vorher', S); } catch (e) { /* egal */ } }
  S = z; S.lib = S.lib || { lessons: {} };
  await sichereJetzt();
  V.sicherungNeu = null; schliesseBlatt();
  const us = Object.keys(S.users);
  if (us.length === 1) { S.cur = us[0]; start(); } else { S.cur = null; gehe('profile'); }
  TON.spiel('fertig'); FX.konfetti(80);
  const luecken = await kartenLuecken();
  zeigeBlatt(`<h2>Sicherung übernommen</h2><p class="mut" style="margin:6px 0 12px">${us.length} ${us.length === 1 ? 'Nutzer' : 'Nutzer'}, ${Object.keys(S.lib.lessons).length} Lektionen.</p>
    ${luecken.length ? `<div class="hinweisbox blau" style="margin-bottom:12px"><b>Kartenbilder fehlen noch</b> bei ${luecken.map(l => esc(l.titel)).join(', ')} (${sum(luecken.map(l => l.fehlt))} Karten).<br>${UPD.web ? 'Die App holt sie jetzt aus dem Repo.' : 'Ziehe die ZIP-Dateien unter „Karten“ hinein.'}</div>` : '<div class="hinweisbox gruen" style="margin-bottom:12px">Alle Kartenbilder sind vorhanden.</div>'}
    <div class="zeile"><button class="btn weiss klein" data-a="sicherungZurueck">Rückgängig</button><span class="sp1"></span><button class="btn gruen" data-a="blattZu">Weiter</button></div>`);
  if (luecken.length && UPD.web) kartenNachladen();
};
AKT.sicherungZurueck = async () => {
  let v = null; try { v = await DB.get('kv', 'state_vorher'); } catch (e) { v = null; }
  if (!v) { toast('Es gibt nichts zum Zurücksetzen.', 'info'); return; }
  S = v; await sichereJetzt(); schliesseBlatt(); toast('Der vorherige Stand ist wieder da.', 'haken'); const us = Object.keys(S.users); if (us.length === 1) { S.cur = us[0]; start(); } else gehe('profile');
};

// ---------- Sicherung als Text (Zwischenablage): Notweg, wenn Dateien oder Downloads auf dem Gerät haken ----------
AKT.sicherungKopieren = async () => {
  const text = sicherungInhalt();
  try { if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('keine Zwischenablage'); await navigator.clipboard.writeText(text); S.sicherung = heute(); sichere(); toast('Sicherung kopiert. In der neuen App: Ich → Daten → „Aus Text laden“.', 'haken', 5000); if (V.name === 'ich') render(); return; } catch (e) { /* Rückfall: Text zum Markieren */ }
  zeigeBlatt(`<h2>Sicherung als Text</h2><p class="mut" style="margin:6px 0 10px;font-size:14px">Tippe in das Feld, wähle „Alles auswählen“ und „Kopieren“. In der neuen App: Ich → Daten → „Aus Text laden“.</p><textarea id="sicherungFeld" readonly rows="8" style="width:100%;font:12px monospace;user-select:text;-webkit-user-select:text">${esc(text)}</textarea><div class="zeile" style="margin-top:10px"><span class="sp1"></span><button class="btn blau" data-a="blattZu">Fertig</button></div>`);
  const fe = $('#sicherungFeld'); if (fe) { fe.focus(); fe.select(); }
};
AKT.sicherungText = () => {
  zeigeBlatt(`<h2>Sicherung aus Text laden</h2><p class="mut" style="margin:6px 0 10px;font-size:14px">Füge den kopierten Text ein (lange auf das Feld tippen → „Einfügen“).</p><textarea id="sicherungEinfuegen" rows="8" placeholder="Hier einfügen …" style="width:100%;font:12px monospace;user-select:text;-webkit-user-select:text"></textarea><div class="zeile" style="margin-top:10px"><button class="btn weiss" data-a="blattZu">Abbrechen</button><span class="sp1"></span><button class="btn blau" data-a="sicherungTextJa">Weiter</button></div>`);
};
AKT.sicherungTextJa = async () => {
  const fe = $('#sicherungEinfuegen'), text = fe ? fe.value.trim() : '';
  if (!text) { toast('Das Feld ist leer.', 'info'); return; }
  schliesseBlatt();
  await sicherungPruefen(new File([text], 'Sicherung.json', { type: 'application/json' }));
};

// ---------- fehlende Kartenbilder aus dem Repo holen ----------
async function kartenNachladen() {
  if (!UPD.web) { toast('Ziehe die ZIP-Dateien unter „Karten“ hinein.', 'info', 4500); return; }
  const luecken = await kartenLuecken();
  if (!luecken.length) { toast('Alle Kartenbilder sind vorhanden.', 'haken'); return; }
  updPille('Suche die Karten im Repo …', null);
  let liste;
  try { liste = await repoPaketListe(); UPD.pakete = liste; } catch (e) { updPille(''); toast('Keine Verbindung zum Repo.', 'info', 4000); return; }
  const keys = luecken.map(l => l.key);
  let wahl = liste.filter(p => (p.lektionen || []).some(l => keys.indexOf(l.key) >= 0));
  const ohneInfo = liste.filter(p => !(p.lektionen || []).length);
  wahl = wahl.concat(ohneInfo.filter(p => wahl.indexOf(p) < 0));
  const r = await kartenLaden(wahl);
  const rest = await kartenLuecken();
  updErgebnis({ geladen: r.geladen, fehler: r.fehler, hand: true });
  if (rest.length) zeigeBlatt(`<h2>Nicht alles gefunden</h2><p class="mut" style="margin:6px 0 12px">Im Repo gibt es keine Karten für: <b>${rest.map(l => esc(l.titel)).join(', ')}</b>.<br>Ziehe die ZIP-Dateien dieser Lektionen unter „Karten“ hinein.</p><div class="zeile"><span class="sp1"></span><button class="btn blau" data-a="nav" data-v="bibliothek">Zu „Karten“</button></div>`);
}
AKT.kartenNachladen = () => kartenNachladen();
AKT.kartenAlleLaden = async () => { const liste = UPD.pakete; if (!liste.length) { await updatePruefen({ hand: true }); return; } const st = await repoStand(); const r = await kartenLaden(liste.filter(p => !st.pakete[p.datei] || st.pakete[p.datei].sha !== p.sha || !S.lib.lessons[((p.lektionen || [])[0] || {}).key])); updErgebnis({ geladen: r.geladen, fehler: r.fehler, hand: true }); };
AKT.kartenEinzeln = async el => { const p = UPD.pakete.find(x => x.datei === el.dataset.v); if (!p) return; const r = await kartenLaden([p]); updErgebnis({ geladen: r.geladen, fehler: r.fehler, hand: true }); };

// ---------- Anzeige: Karten-Seite (Pakete im Repo) ----------
function repoPanelHtml() {
  if (!UPD.web) return '';
  return `<div class="sektion">Kartenpakete im Repo <small id="repoZahl"></small></div><div class="panel dicht" id="repoPanel"><p class="mut">Suche nach Kartenpaketen …</p></div>`;
}
async function repoPanelFuellen() {
  const el = $('#repoPanel'); if (!el) return;
  let liste = UPD.pakete;
  try { liste = await repoPaketListe(); UPD.pakete = liste; UPD.listeFehler = false; } catch (e) { UPD.listeFehler = true; }
  const el2 = $('#repoPanel'); if (!el2) return;
  if (!liste.length) { el2.innerHTML = `<p class="mut">${UPD.listeFehler ? 'Die Kartenliste ist gerade nicht erreichbar (keine Verbindung?).' : 'Im Repo liegen noch keine Kartenpakete.'}</p>`; return; }
  const st = await repoStand();
  const z = $('#repoZahl'); if (z) z.textContent = `${liste.length} ${liste.length === 1 ? 'Paket' : 'Pakete'}`;
  const zeile = p => {
    const rec = st.pakete[p.datei], da = rec && rec.sha === p.sha, neu = !rec, upd = rec && rec.sha !== p.sha;
    const chip = da ? '<span class="chip klein gruen">' + ico('haken') + ' geladen</span>' : neu ? '<span class="chip klein gold">neu</span>' : '<span class="chip klein gold">Update</span>';
    return `<div class="repozeile"><div class="t"><b>${esc(p.name || p.datei)}</b><small>${[(p.lektionen || []).map(l => esc(l.titel) + (l.karten ? ' · ' + l.karten + ' Karten' : '')).join(' · '), updMB(p.bytes || 0) + ' MB', esc(p.datei)].filter(Boolean).join(' · ')}</small></div>${chip}<button class="btn klein ${da ? 'weiss' : 'blau'}" data-a="kartenEinzeln" data-v="${esc(p.datei)}">${ico('speichern')} ${da ? 'Neu laden' : 'Laden'}</button></div>`;
  };
  el2.innerHTML = liste.map(zeile).join('') + `<div class="zeile" style="margin-top:10px"><button class="btn blau klein" data-a="kartenAlleLaden">${ico('speichern')} Alle neuen laden</button><button class="btn weiss klein" data-a="kartenNachladen">Fehlende Bilder nachladen</button></div>`;
}

// ---------- Anzeige: „Ich“ → App & Updates ----------
function appPanelHtml() {
  const e = appEinst(), modus = !UPD.web ? 'datei' : istApp() ? 'app' : 'browser';
  const modusText = modus === 'app' ? 'Als App auf dem Home-Bildschirm. Hier löscht iPadOS den Speicher nicht wegen langer Nichtbenutzung. Löschst du das Symbol, verschwindet aber auch der Lernstand: vorher sichern.' : modus === 'browser' ? 'Im Browser-Tab. Lege Wortriff auf den Home-Bildschirm, dann löscht iPadOS den Speicher nicht wegen langer Nichtbenutzung.' : 'Als lokale Datei. Updates und Karten aus dem Repo gibt es in der Web-Version.';
  const schalter = (k, t, s) => `<div class="einst"><div class="t"><b>${t}</b><span>${s}</span></div><button class="schalter ${e[k] !== false ? 'an' : ''}" data-a="appEinst" data-v="${k}" aria-label="${t}"></button></div>`;
  return `<div class="sektion">App und Updates</div><div class="panel" id="appPanel">
    <div class="zeile w"><span class="chip">Wortriff ${APP_VERSION}</span><span class="chip klein">Stand ${esc(APP_BUILD)}</span><span class="chip klein" title="Kennung dieser Fassung">${esc(APP_ID)}</span><span class="sp1"></span>
    <button class="btn blau klein" data-a="updateSuchen" ${UPD.web ? '' : 'disabled'}>${ico('laden')} Nach Updates suchen</button></div>
    <p class="mut" style="margin-top:8px;font-size:14px" id="updStatus">${esc(updStatusText())}</p>
    ${UPD.web ? schalter('autoUpdate', 'Automatisch nach Updates suchen', 'Beim Start und beim Zurückkehren in die App') + schalter('autoKarten', 'Neue Karten automatisch laden', 'Kartenpakete, die im Repo dazukommen') : ''}
    <p class="mut" style="font-size:14px;margin-top:8px" id="speicherStatus">${esc(modusText)}</p>
    <div class="zeile w" style="margin-top:8px"><button class="btn weiss klein" data-a="kartenNachladen">Kartenprüfung</button></div><p class="mut" style="font-size:14px;margin-top:6px" id="kartenStatus"></p></div>`;
}
function updStatusText() {
  if (!UPD.web) return 'Lokale Datei: kein Update nötig. Für Updates und neue Karten die Web-Version nutzen.';
  if (UPD.laeuft) return 'Suche nach Updates …';
  if (UPD.wartet) return 'Eine neue Version ist bereit. Tippe unten auf „Jetzt installieren“.';
  const e = UPD.ergebnis;
  return e ? `${e.text} (${new Date(e.zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr)` : 'Noch nicht gesucht.';
}
function ichUpdateStatus() { const el = $('#updStatus'); if (el) el.textContent = updStatusText(); }
async function appPanelNach() {
  ichUpdateStatus();
  try {
    const p = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null;
    const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
    const el = $('#speicherStatus');
    if (el) el.textContent += ` Speicher ${p === true ? 'dauerhaft zugesichert' : p === false ? 'nicht dauerhaft zugesichert' : ''}${est && est.usage != null ? ', belegt: ' + Math.round(est.usage / 1048576) + ' MB' : ''}.`;
  } catch (e) { /* egal */ }
  try {
    const l = await kartenLuecken(), el = $('#kartenStatus');
    const alle = sum(Object.values(S.lib.lessons).map(L => Object.keys(L.cards).length));
    if (el) el.innerHTML = l.length ? `<b>${sum(l.map(x => x.fehlt))} von ${alle} Karten ohne Bild</b> (${l.map(x => esc(x.titel)).join(', ')}).` : (alle ? `Alle ${alle} Karten haben ihre Bilder.` : 'Noch keine Karten in der Bibliothek.');
  } catch (e) { /* egal */ }
}
AKT.appEinst = el => { const e = appEinst(), k = el.dataset.v; e[k] = e[k] === false; sichere(); render(); };

// ---------- Hinweis zum Home-Bildschirm (nur iPad/iPhone im Browser-Tab) ----------
function installHinweisHtml() {
  if (!UPD.web || istApp() || !istIOS()) return '';
  const e = appEinst();
  if (e.installBis && e.installBis > Date.now()) return '';
  const hat = Object.keys(S.users).length > 0;
  return `<div class="hinweisbox blau" style="margin-bottom:14px"><b>Wortriff auf den Home-Bildschirm legen:</b> Tippe auf <b>Teilen</b> (Quadrat mit Pfeil) → <b>„Zum Home-Bildschirm“</b>.<br>Dort löscht iPadOS den Speicher nicht wegen langer Nichtbenutzung (im Browser-Tab kann das nach 7 Tagen ohne Nutzung passieren).
    ${hat ? '<br><b>Wichtig:</b> Die Home-Bildschirm-App startet mit leerem Speicher. Sichere vorher deinen Fortschritt (Ich → Daten → „Fortschritt sichern“) und lade die Sicherung in der App vom Home-Bildschirm.' : ''}
    <div style="margin-top:8px"><button class="btn klein weiss" data-a="installSpaeter">Später erinnern</button></div></div>`;
}
AKT.installSpaeter = () => { appEinst().installBis = Date.now() + 3 * 86400000; sichere(); render(); };

// ---------- Umzug: Block für Profil- und Neu-Seite ----------
function umzugHtml() {
  return `<div class="panel dicht umzug"><h3>Schon mit Wortriff gelernt?</h3>
    <p class="mut" style="margin:6px 0 10px;font-size:14px">Hol deinen Fortschritt aus der alten Version: Dort unter <b>Ich → Daten → „Fortschritt sichern“</b> eine Sicherung speichern, hier laden. Die Karten holt sich die App danach selbst${UPD.web ? ' aus dem Repo' : ''}.</p>
    <button class="btn blau klein" data-a="sicherungWahl">${ico('laden')} Sicherung laden</button><input type="file" id="fSicherung" accept=".json,application/json" hidden></div>`;
}

// ---------- Start ----------
updSwStart();
