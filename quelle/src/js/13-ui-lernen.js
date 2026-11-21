'use strict';
// ---------- Lernen: Runden mit Karten umdrehen oder Quiz, danach Ergebnis ----------
let LS = null;                                                    // Zustand der laufenden Runde

async function lernBereit(cids) {                                 // Bilder der ersten Karten vorladen, Rest im Hintergrund
  const keys = cids.reduce((a, c) => a.concat([c + '_v', c + '_h']), []);
  await imgVorladen(keys.slice(0, 6));
  imgVorladen(keys.slice(6));
}
AKT.lernStart = async el => {
  const u = cur(), P = u.projects[el.dataset.v]; if (!P) return;
  const r = baueRunde(u, P);
  if (!r.karten.length) { toast('Hier gibt es gerade nichts zu üben.', 'info'); return; }
  const fehlt = r.karten.filter(c => !(cidInfo(c).c));
  if (fehlt.length) { toast('Einige Karten fehlen in der Bibliothek. Bitte Lektion neu hineinziehen.', 'info', 4000); }
  const karten = r.karten.filter(c => cidInfo(c).c);
  if (!karten.length) return;
  LS = { pid: P.id, bonus: r.bonus, queue: karten.slice(), gesamt: karten.length, fertig: 0, gesehen: {}, combo: 0, um: false, cid: null, antwortet: false, gewaehlt: null, optionen: null, t0: 0,
    sess: { bonus: r.bonus, antworten: [], xp: 0, perlen: 0, treffer: new Set(), rang: null, abbruch: false }, erg: null };
  await lernBereit(karten);
  naechsteKarte();
};
function modusFuer(cid) {
  const u = cur(), m = u.set.modus || 'karten';
  if (karteText(cid)) {
    if (m === 'tippen') return { m: 'tippen' };
    if (m === 'quiz') { const o = quizOptionen(cid); if (o.length >= 2) return { m: 'quiz', o }; }
  }
  return { m: 'karten' };
}

// ---------- Tippen: Antwort eintippen und freundlich prüfen ----------
const AKZENTE = { fr: ['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'î', 'û', 'ë', 'ï', 'œ'], en: [], de: ['ä', 'ö', 'ü', 'ß'] };
const normT = s => norm(plain(s)).replace(/[…+]/g, ' ').replace(/\s+/g, ' ').trim();
// Verglichen werden nur Buchstaben und Ziffern: Leerzeichen (fehlende oder überzählige), Satzzeichen, Apostrophe, Bindestriche
// und Sonderzeichen wie „+“ oder „…“ zählen nie als Fehler. Groß-/Kleinschreibung auch nicht.
const kern = s => normT(s).replace(/[^\p{L}\p{N}]+/gu, '');
const ohneAkzent = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe').replace(/ß/g, 'ss');
const WORT_PLATZ = /\b(etw|jdn|jdm|jmd|jmdn|jmdm|sth|sb)\b\.?/gi;               // „jdn.“, „etw.“, „sth“ dürfen auch fehlen
// Alle gültigen Schreibweisen einer Lösung (als „Kern“-Texte):
//   ok      – genaue Schreibweisen (Bedeutungen mit „;“ oder „ / “ getrennt, „(sich)“ optional, „to“ optional, „Hallo! Tschüss!“ auch jede Hälfte)
//   ohneArt – dieselben ohne Artikel (zählt als „fast“)
//   praefix – „je m’appelle + Name“: nur der Teil vor dem „+“ ist Pflicht, danach darf alles folgen (Name, Land, …)
//   muster  – „j’ai … ans“: an der Stelle von „…“ darf alles stehen (auch nichts)
function antwortVarianten(text, artikel) {
  const ok = new Set(), ohneArt = new Set(), praefix = new Set(), muster = [];
  const art = artikel ? normT(artikel) : '';
  const nimm = x => {
    const n = normT(x), k = kern(x); if (!k) return;
    ok.add(k);
    if (/^to /.test(n)) ok.add(kern(n.slice(3)));
    if (art && n.indexOf(art) === 0 && (art.slice(-1) === "'" || n.charAt(art.length) === ' ')) { const r = kern(n.slice(art.length)); if (r) ohneArt.add(r); }
  };
  const musterAus = x => {
    const teile = x.split(/…|\.\.\./).map(kern), t2 = teile.filter(Boolean);
    if (t2.length) muster.push(new RegExp('^' + (teile[0] ? '' : '.*') + t2.join('.*') + (teile[teile.length - 1] ? '' : '.*') + '$', 'u'));
  };
  const verarbeite = x => {
    if (x.indexOf('+') >= 0) { const basis = x.split('+')[0]; if (kern(basis)) { praefix.add(normT(basis)); nimm(basis); } return; }
    if (/…|\.\.\./.test(x)) {
      musterAus(x); nimm(x.replace(/…|\.\.\./g, ' '));
      const stuecke = x.split(/,\s+/); if (stuecke.length > 1) stuecke.forEach(verarbeite);
      return;
    }
    nimm(x);
    const hälften = x.split(/[!?.,]\s+/);
    if (hälften.length > 1) hälften.forEach(nimm);
    if (/^[^\s/]+\/[^\s/]+$/.test(x.trim())) x.trim().split('/').forEach(nimm);       // „keinen/keine“
  };
  plain(text).split(/;\s*|\s\/\s/).forEach(v => {
    v = v.trim(); if (!v) return;
    const alle = [v], ohneTok = v.replace(WORT_PLATZ, ' ');
    if (ohneTok !== v) alle.push(ohneTok);
    alle.forEach(w => [w.replace(/\([^)]*\)/g, ' '), w.replace(/[()]/g, ' ')].forEach(verarbeite));
  });
  return { ok: Array.from(ok), ohneArt: Array.from(ohneArt), praefix: Array.from(praefix), muster };
}
function editDist(a, b) {                                          // Levenshtein mit Buchstabendreher (candel ≈ candle = 1)
  const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; } for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
// Beginnt die Eingabe (Wort für Wort, Leerzeichen egal) mit dem Pflichtteil? „en France“ passt zu „en“, „english“ nicht.
function beginntMit(e, basis, f) {
  const pk = f(kern(basis)); if (!pk) return false;
  let acc = '';
  for (const tk of e.split(' ')) { acc += tk; const a = f(kern(acc)); if (a === pk) return true; if (a.length > pk.length) return false; }
  return false;
}
// Eigene Eingabe für den Vergleich: Buchstaben, die nicht zur nächstliegenden richtigen Schreibweise passen, werden markiert (LCS).
// Leerzeichen, Satzzeichen und Sonderzeichen werden nie markiert.
function eingabeMarkiert(eingabe, loes, artikel) {
  const roh = String(eingabe || '').trim();
  if (!roh) return '';
  const k = kern(roh), v = antwortVarianten(loes, artikel);
  let ziel = '', best = 1e9, grenze = null;
  v.ok.concat(v.ohneArt).forEach(x => { const d = editDist(x, k); if (d < best) { best = d; ziel = x; grenze = null; } });
  v.praefix.forEach(p => { const x = kern(p), d = editDist(x, k.slice(0, x.length)); if (d < best) { best = d; ziel = x; grenze = x.length; } });
  const a = Array.from(roh), istB = a.map(ch => /[\p{L}\p{N}]/u.test(ch));
  const pos = []; a.forEach((ch, i) => { if (istB[i]) pos.push(i); });
  const tl = pos.map(i => a[i].toLowerCase()), zl = Array.from(ziel), n = tl.length, m = zl.length;
  const L = []; for (let i = 0; i <= n; i++) { L[i] = new Array(m + 1).fill(0); }
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = tl[i] === zl[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const passt = new Array(n).fill(false);
  for (let i = 0, j = 0; i < n && j < m;) { if (tl[i] === zl[j]) { passt[i] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  const markiert = new Set(); pos.forEach((p, li) => { if (!passt[li] && (grenze == null || li < grenze)) markiert.add(p); });
  return a.map((ch, i) => (markiert.has(i) ? `<mark>${esc(ch)}</mark>` : esc(ch))).join('');
}
// Ergebnis: { art: richtig | akzent | artikel | fast | falsch, r: 0..2 }
function tippPruefung(eingabe, t) {
  const e = normT(eingabe), k = kern(eingabe);
  if (!k) return { art: 'falsch', r: 0 };
  const v = antwortVarianten(t.loes, t.artikel);
  if (v.ok.indexOf(k) >= 0) return { art: 'richtig', r: 2 };
  if (v.praefix.some(p => beginntMit(e, p, x => x))) return { art: 'richtig', r: 2 };
  if (v.muster.some(m => m.test(k))) return { art: 'richtig', r: 2 };
  if (v.ohneArt.indexOf(k) >= 0) return { art: 'artikel', r: 1 };
  const ka = ohneAkzent(k);
  if (v.ok.some(x => ohneAkzent(x) === ka) || v.praefix.some(p => beginntMit(e, p, ohneAkzent))) return { art: 'akzent', r: 1 };
  if (v.ok.some(x => { const m = Math.max(x.length, k.length); return m >= 5 && editDist(x, k) <= (m >= 9 ? 2 : 1); })) return { art: 'fast', r: 1 };
  if (v.praefix.some(p => { const x = kern(p); return x.length >= 5 && [-1, 0, 1].some(dl => editDist(x, k.slice(0, x.length + dl)) <= 1); })) return { art: 'fast', r: 1 };   // Tippfehler im Pflichtteil, Name danach egal
  return { art: 'falsch', r: 0 };
}
function quizOptionen(cid) {
  const t = karteText(cid), ci = cidInfo(cid);
  if (!t) return [];
  let pool = kartenListe(ci.L).filter(c => c.satz === ci.satz && c.cid !== cid).map(c => karteText(c.cid)).filter(Boolean);
  if (pool.length < 3) {
    Object.values(S.lib.lessons).filter(L => L.sp === ci.sp && L.key !== ci.lkey).forEach(L => kartenListe(L).filter(c => c.satz === ci.satz).forEach(c => { const x = karteText(c.cid); if (x) pool.push(x); }));
  }
  const gesehen = new Set([norm(t.antwort)]), falsch = [];
  shuffle(pool).forEach(x => { const k = norm(x.antwort); if (!gesehen.has(k) && falsch.length < 3) { gesehen.add(k); falsch.push(x.antwort); } });
  return shuffle([t.antwort].concat(falsch));
}
function naechsteKarte() {
  const u = cur();
  if (!LS || !u) return;                                           // Runde wurde inzwischen verlassen
  if (!LS.queue.length) return rundeFertig(false);
  LS.cid = LS.queue.shift();
  const m = modusFuer(LS.cid);
  LS.modus = m.m; LS.optionen = m.o || null; LS.um = false; LS.antwortet = false; LS.gewaehlt = null; LS.t0 = Date.now(); LS.tipp = ''; LS.tippErg = null;
  if (!LS.gesehen[LS.cid]) LS.gesehen[LS.cid] = 0;
  gehe('lernen');
  void u;
}
function fitKarte() {                                             // Karte (1772×1182) so groß wie möglich in die Bühne einpassen
  const b = $('.buehne'), k = $('#kb'); if (!b || !k) return;
  const W = b.clientWidth, H = b.clientHeight - 20, R = 1772 / 1182;
  const w = Math.max(120, Math.min(W, H * R));
  k.style.width = Math.floor(w) + 'px'; k.style.height = Math.floor(w / R) + 'px';
}
function lernGroesse() {                                          // mit eingeblendeter Bildschirmtastatur nur den sichtbaren Teil nutzen
  const l = $('.lern'); if (!l) return;
  const vv = window.visualViewport;
  if (vv && vv.height < innerHeight - 80) { l.style.height = vv.height + 'px'; l.style.top = vv.offsetTop + 'px'; l.style.bottom = 'auto'; }
  else { l.style.height = ''; l.style.top = ''; l.style.bottom = ''; }
  fitKarte();
}
window.addEventListener('resize', () => { if (V.name === 'lernen') lernGroesse(); });
if (window.visualViewport) { visualViewport.addEventListener('resize', () => { if (V.name === 'lernen') lernGroesse(); }); visualViewport.addEventListener('scroll', () => { if (V.name === 'lernen') lernGroesse(); }); }
ANSICHT.lernen = () => {
  if (!LS || !LS.cid) { setTimeout(() => { if (V.name === 'lernen') start(); }, 0); return '<div class="lern"></div>'; }          // keine Runde da (z. B. wird gerade eine neue vorbereitet)
  V.nach = () => { lernGroesse(); const f = $('#tippFeld'); if (f && !LS.antwortet) { try { f.focus(); } catch (e) { /* iPad: erst nach Tipp */ } } };
  const u = cur(), P = u.projects[LS.pid], cid = LS.cid, t = karteText(cid);
  const pl = heutePlan(u, P);
  const proz = LS.gesamt ? LS.fertig / LS.gesamt : 0;
  const mm = u.set.modus || 'karten';
  const modus = t ? `<div class="tabs modus">${[['karten', 'Karten'], ['quiz', 'Quiz'], ['tippen', 'Tippen']].map(([k, n]) => `<button class="${mm === k ? 'an' : ''}" data-a="modus" data-v="${k}">${n}</button>`).join('')}</div>` : '';
  const tz = LS.probe ? '<span class="chip gold">Generalprobe</span>' : pl.ziel ? ring(planGeschafft(pl) / pl.ziel, 54, pl.fertig ? 'var(--gruen)' : 'var(--sp)', `<span class="fred" style="font-size:14px">${planGeschafft(pl)}</span>`, 14) : '';
  const speak = t && SPRECHEN.ok && u.set.sprechen !== 'aus';
  return `<div class="lern sp-${P.sp}"><div class="kopfzeile"><button class="zu" data-a="lernZu" aria-label="Beenden">${ico('zu')}</button>
    <div class="fort"><div class="leiste sp"><b style="width:${Math.max(3, Math.round(proz * 100))}%"></b></div></div>
    <div class="zaehler">${LS.fertig}/${LS.gesamt}</div>${modus}${speak ? `<button class="zu" data-a="vorlesen" aria-label="Vorlesen" style="color:var(--ocean)">${ico('sprecher')}</button>` : ''}<span class="chip">${PERLE} <b class="zahl">${nf(u.perlen)}</b></span>${tz}</div>
    <div class="buehne"><div class="kartebox ein ${LS.um ? 'um' : ''}" id="kb" data-a="${LS.modus === 'karten' ? 'umdrehen' : 'nix'}">
      <div class="seite vorn">${imgTag(cid + '_v')}</div><div class="seite hinten">${imgTag(cid + '_h')}</div>
</div></div>
    <div class="steuer" id="steuer">${steuerHtml()}</div></div>`;
};
function steuerHtml() {
  const u = cur();
  if (LS.modus === 'tippen') {
    const t = karteText(LS.cid), ak = AKZENTE[t.loesSprache] || [];
    if (!LS.antwortet) {
      return `<div class="tippbox"><div class="tippzeile"><input type="text" id="tippFeld" placeholder="${t.loesSprache === 'de' ? 'Auf Deutsch' : t.loesSprache === 'fr' ? 'Auf Französisch' : 'Auf Englisch'} …" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" value="${esc(LS.tipp || '')}"><button class="btn blau" data-a="tippPruefen">Prüfen</button></div>
        ${ak.length ? `<div class="akzente">${ak.map(a => `<button data-a="akzent" data-v="${a}">${a}</button>`).join('')}</div>` : ''}<button class="linkbtn" data-a="tippWeissNicht">Weiß ich nicht</button></div>`;
    }
    const f = LS.tippErg, meld = { richtig: 'Richtig!', akzent: 'Fast! Achte auf die Akzente.', artikel: 'Fast! Der Artikel gehört dazu.', fast: 'Fast, nur ein kleiner Tippfehler.', falsch: 'Das war nicht ganz richtig.' }[f.art];
    return `<div class="tippbox"><div class="tippurteil ${f.r === 2 ? 'gut' : f.r === 1 ? 'fast' : 'schlecht'}"><b>${meld}</b>${f.art === 'richtig' ? '' : `${normT(LS.tipp || '') ? `<span class="deins">Du hast geschrieben: <b>${eingabeMarkiert(LS.tipp, t.loes, t.artikel)}</b></span>` : ''}<span>Richtig ist: <b>${md(t.loes)}</b></span>`}</div><button class="btn blau gross" data-a="quizWeiter">Weiter ${ico('pfeilr')}</button></div>`;
  }
  if (LS.modus === 'quiz') {
    const t = karteText(LS.cid);
    const korrekt = t.antwort;
    const knoepfe = LS.optionen.map((o, i) => {
      let cls = '';
      if (LS.antwortet) cls = o === korrekt ? 'richtig' : (o === LS.gewaehlt ? 'falsch' : '');
      return `<button class="${cls}" data-a="waehle" data-v="${i}" ${LS.antwortet ? 'disabled' : ''}>${md(o)}</button>`;
    }).join('');
    return LS.antwortet ? `<div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:900px;align-items:center"><div class="quiz">${knoepfe}</div><button class="btn blau gross" data-a="quizWeiter">Weiter ${ico('pfeilr')}</button></div>` : `<div class="quiz">${knoepfe}</div>`;
  }
  if (!LS.um) return `<button class="btn blau gross" data-a="umdrehen">${ico('tausch')} Antwort zeigen</button>`;
  const vs = vorschau(u, LS.cid);
  return `<div class="antw">${ANTWORTEN.map(a => `<button class="${a.farbe}" data-a="antwort" data-v="${a.r}">${a.name}<small>${LS.probe ? '' : vs[a.r]}</small></button>`).join('')}</div>`;
}
AKT.umdrehen = () => {
  if (!LS || LS.modus !== 'karten' || LS.um) return;
  LS.um = true; TON.spiel('um');
  $('#kb').classList.add('um'); $('#steuer').innerHTML = steuerHtml();
  const u = cur(), t = karteText(LS.cid);
  if (t && u.set.sprechen !== 'aus' && (u.set.sprechen || 'auto') === 'auto') sprechenKarte();
};
function sprechenKarte() {
  const t = karteText(LS.cid); if (!t) return;
  SPRECHEN.sag(t.sprechen, t.tts);
}
AKT.vorlesen = (el, ev) => { ev.stopPropagation(); sprechenKarte(); };
AKT.modus = el => { const u = cur(); u.set.modus = el.dataset.v; sichere(); LS.queue.unshift(LS.cid); naechsteKarte(); };
AKT.waehle = el => {
  if (LS.antwortet) return;
  const t = karteText(LS.cid), o = LS.optionen[+el.dataset.v];
  LS.antwortet = true; LS.gewaehlt = o; LS.um = true;
  const richtig = o === t.antwort;
  $('#kb').classList.add('um'); $('#steuer').innerHTML = steuerHtml();
  verbuche(richtig ? 2 : 0);
  const u = cur();
  if (u.set.sprechen !== 'aus' && (u.set.sprechen || 'auto') === 'auto') sprechenKarte();
};
AKT.quizWeiter = () => { LS.weiter && LS.weiter(); };
AKT.tippPruefen = () => {
  if (LS.antwortet) return;
  const f = $('#tippFeld'), eingabe = f ? f.value : '';
  if (!normT(eingabe)) { toast('Tipp zuerst deine Antwort ein, oder wähle „Weiß ich nicht“.', 'info'); return; }
  tippAbschluss(eingabe);
};
AKT.tippWeissNicht = () => { if (!LS.antwortet) tippAbschluss(''); };
function tippAbschluss(eingabe) {
  const t = karteText(LS.cid), u = cur();
  LS.antwortet = true; LS.um = true; LS.tipp = eingabe;
  LS.tippErg = tippPruefung(eingabe, t);
  $('#kb').classList.add('um'); $('#steuer').innerHTML = steuerHtml();
  verbuche(LS.tippErg.r);
  if (u.set.sprechen !== 'aus' && (u.set.sprechen || 'auto') === 'auto') sprechenKarte();
}
AKT.akzent = el => {
  const f = $('#tippFeld'); if (!f) return;
  const a = f.selectionStart == null ? f.value.length : f.selectionStart, b = f.selectionEnd == null ? a : f.selectionEnd;
  f.value = f.value.slice(0, a) + el.dataset.v + f.value.slice(b);
  f.focus(); try { f.setSelectionRange(a + 1, a + 1); } catch (e) { /* egal */ }
};
AKT.antwort = el => { const r = +el.dataset.v; verbuche(r); LS.weiter(); };

// Eine Antwort verbuchen; setzt LS.weiter (nächste Karte)
function verbuche(r) {
  if (LS.probe) { verbucheProbe(r); return; }                       // Generalprobe: nichts im Lernplan verbuchen
  const u = cur(), P = u.projects[LS.pid], cid = LS.cid;
  const res = bewerte(u, cid, r);
  const bel = belohneAntwort(u, r, res);
  const s = LS.sess;
  s.xp += bel.xp; s.perlen += bel.perlen; if (bel.rang && !s.rang) s.rang = bel.rang;
  const erste = !LS.gesehen[cid];
  LS.gesehen[cid]++;
  s.antworten.push({ cid, r, erste });
  TON.spiel(['nochmal', 'schwer', 'gut', 'leicht'][r]);
  if (r >= 2) { LS.combo++; if (bel.perlen) TON.spiel('perle'); } else LS.combo = 0;
  if (res.erledigt) {
    LS.fertig++;
    planAbhaken(u, cid).forEach(p => { s.treffer.add(p.id); TON.spiel('ziel'); FX.konfetti(60); toast(`Tagesziel geschafft: ${p.name}`, 'haken', 3200); });
  } else if (LS.gesehen[cid] < 5) {
    const gap = res.gap || 3;
    LS.queue.splice(Math.min(LS.queue.length, gap), 0, cid);
  } else LS.fertig++;                                             // nach 5 Anläufen bleibt die Karte für später fällig
  if ([3, 5, 8, 12].indexOf(LS.combo) >= 0) {
    const d = document.createElement('div'); d.className = 'rueck gut'; d.textContent = `${LS.combo} richtig in Folge!`; ($('.lern') || document.body).appendChild(d); setTimeout(() => d.remove(), 1500);
    FX.blasen(innerWidth / 2, innerHeight * 0.4, 14);
  }
  sichere();
  LS.weiter = () => { LS.weiter = null; const kb = $('#kb'); if (kb) { kb.classList.remove('ein'); kb.classList.add('raus'); } setTimeout(naechsteKarte, kb ? 240 : 0); };
}
AKT.lernZu = () => {
  const n = LS.sess.antworten.length;
  zeigeBlatt(`<h2>${n ? 'Runde beenden?' : 'Zurück zum Hafen?'}</h2><p class="mut" style="margin:10px 0 18px">${n ? (LS.probe ? 'Alles, was du bis jetzt beantwortet hast, kommt in die Auswertung. Dein Lernplan bleibt unverändert.' : 'Alles, was du bis jetzt beantwortet hast, ist gespeichert und zählt für dein Tagesziel.') : 'Es wurde noch nichts verbucht.'}</p>
    <div class="zeile"><button class="btn gruen" data-a="blattZu">Weiter üben</button><span class="sp1"></span><button class="btn weiss" data-a="lernEnde">Beenden</button></div>`, { ohneZu: true });
};
AKT.lernEnde = () => { schliesseBlatt(); if (LS.sess.antworten.length) rundeFertig(true); else { LS = null; gehe('start'); } };

function rundeFertig(abbruch) {
  if (LS.probe) return probeFertig(abbruch);
  const u = cur(), P = u.projects[LS.pid];
  LS.sess.abbruch = !!abbruch;
  const erg = rundeEnde(u, P, LS.sess);
  LS.erg = erg;
  TON.spiel(erg.perfekt ? 'ziel' : 'fertig');
  if (!abbruch) FX.konfetti(erg.perfekt ? 110 : 60);
  gehe('ergebnis');
  if (erg.rang) setTimeout(() => TON.spiel('rang'), 900);
  setTimeout(() => erg.abzeichen.length && TON.spiel('selten'), 1300);
}
const sterneFuer = e => (e.n ? (e.richtig / e.n >= 0.9 ? 3 : e.richtig / e.n >= 0.7 ? 2 : e.richtig / e.n >= 0.4 ? 1 : 0) : 0);
ANSICHT.ergebnis = () => {
  const u = cur(), P = u.projects[LS.pid], e = LS.erg, pl = heutePlan(u, P), st = stand(u, P);
  let i = 0;
  const z = (ic, titel, sub, pl_, cls) => `<div class="bz ${cls || ''}" style="--i:${i++}">${ico(ic)}<div class="t">${titel}${sub ? `<small>${sub}</small>` : ''}</div><div class="pl">${pl_ || ''}</div></div>`;
  const rows = [];
  rows.push(z('stern', `${e.richtig} von ${e.n} ${e.n === 1 ? 'Karte' : 'Karten'} gleich gewusst`, e.perfekt ? 'Runde ohne Fehler!' : 'Fehler gehören dazu: so lernt das Gedächtnis.', `+${e.xp} XP`));
  rows.push(z('haken', 'Perlen gesammelt', '', `${PERLE} +${e.perlen}`));
  e.tagesziele.forEach(t => {
    rows.push(z('hafen', `Tagesziel geschafft: ${esc(t.name)}`, t.serie ? `Strömung: ${t.serie.cur} ${t.serie.cur === 1 ? 'Tag' : 'Tage'} in Folge${t.serie.joker ? ' (Flossenpause genutzt)' : ''}${t.serieMuschel ? ' · Serien-Muschel!' : ''}` : (t.wochenMuschel ? 'Wochenziel erreicht: Extra-Muschel!' : 'Weiter so, jeder Tag zählt.'), `+${t.xp} XP`, 'gold'));
  });
  e.meilen.forEach(m => rows.push(z('karte', `${m.m} % von „${esc(m.name)}“ geschafft!`, 'Meilenstein', `${PERLE} +${m.perlen}`, 'gold')));
  (e.zonen || []).forEach(zn => rows.push(z('karte', `Neue Tiefenzone: ${esc(zn.zone)}!`, `Ab jetzt können ${esc(zn.serie)} in Muscheln stecken. Dazu gibt es eine Schatzmuschel.`, `${PERLE} +10`, 'gold')));
  const mus = e.perl + e.schatz;
  if (mus) rows.push(z('album', `${mus} ${mus === 1 ? 'Muschel' : 'Muscheln'} gefunden`, e.schatz ? 'Schatzmuscheln haben bessere Chancen.' : 'Mach sie auf und schau, wer drin steckt!', `+${mus}`, 'gold'));
  const noch = pl.ziel - planGeschafft(pl);
  const hinw = !LS.bonus && pl.ziel && noch > 0 ? `<div class="hinweisbox blau" style="width:100%">Noch <b>${noch}</b> ${noch === 1 ? 'Karte' : 'Karten'} bis zum Tagesziel – das schaffst du in einer kurzen Runde!</div>` : '';
  const anz = muschelAnzahl(u);
  const weiterNoetig = baueRunde(u, P).karten.length > 0;
  const sterne = sterneFuer(e);
  const titel = LS.sess.abbruch ? 'Runde beendet' : LS.bonus ? 'Bonusrunde geschafft!' : 'Tauchgang geschafft!';
  return `<div class="ergebnis sp-${P.sp}"><div class="scroll"><div class="innen"><div class="flo">${flo()}</div><h1>${titel}</h1>
    <div class="sterne3">${[0, 1, 2].map(k => `<span style="--i:${k}">${STERN_SVG(k < sterne ? '#FFC83D' : '#D4E3EC')}</span>`).join('')}</div>
    <div class="belohnungen">${rows.join('')}${e.rang ? `<div class="rangup" style="--i:${i++}">Neuer Rang: <b>${esc(e.rang.name)}</b></div>` : ''}</div>
    ${e.abzeichen.length ? `<h3>Neue Abzeichen</h3><div class="badgezeile">${e.abzeichen.map((b, k) => `<div class="b" style="--i:${k + i}"><div>${badgeSvg(b, true)}</div>${esc(BADGES[b].name)}</div>`).join('')}</div>` : ''}
    ${hinw}
    <p class="mut" style="font-size:13px;text-align:center">Tauchtiefe von „${esc(P.name)}“: ${Math.round(st.pct * 100)} % (${st.ok}/${st.n} Karten am Ziel)</p></div></div>
    <div class="fuss">${anz ? `<button class="btn gold gross" data-a="muschelStart">${muschelSvgKlein()} Muschel öffnen (${anz})</button>` : ''}
    ${weiterNoetig ? `<button class="btn blau gross" data-a="lernStart" data-v="${P.id}">${ico('hafen')} ${pl.fertig || LS.bonus ? 'Noch eine Runde' : 'Weitertauchen'}</button>` : ''}
    <button class="btn weiss gross" data-a="zumHafen">Zum Hafen</button></div></div>`;
};
const muschelSvgKlein = () => `<span style="width:34px;height:34px;display:inline-block">${muschelSvg('schatz')}</span>`;
AKT.zumHafen = () => { LS = null; start(); };

// Tastatur (am Rechner zum Testen): Leertaste dreht, 1–4 bewerten
document.addEventListener('keydown', ev => {
  if (V.name === 'lernen' && LS && ev.target.id === 'tippFeld' && ev.key === 'Enter') { ev.preventDefault(); AKT.tippPruefen(); return; }
  if (V.name !== 'lernen' || !LS || ev.target.tagName === 'INPUT') return;
  if (ev.code === 'Space' || ev.key === 'Enter') { ev.preventDefault(); if (LS.modus === 'karten' && !LS.um) AKT.umdrehen(); else if ((LS.modus === 'quiz' || LS.modus === 'tippen') && LS.antwortet) AKT.quizWeiter(); }
  else if (LS.modus === 'karten' && LS.um && '1234'.indexOf(ev.key) >= 0 && ev.key) AKT.antwort({ dataset: { v: String(+ev.key - 1) } });
  else if (LS.modus === 'quiz' && !LS.antwortet && '1234'.indexOf(ev.key) >= 0 && ev.key && LS.optionen[+ev.key - 1] != null) AKT.waehle({ dataset: { v: String(+ev.key - 1) } });
});
