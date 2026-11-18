'use strict';
// ---------- Ton (selbst erzeugte Klänge) und Vorlesen (Sprachausgabe des iPad) ----------
const TON = {
  ctx: null,
  an() { const u = cur(); return !u || u.set.ton !== false; },
  start() {                                                        // muss aus einer Berührung heraus aufgerufen werden (iOS)
    if (!TON.ctx) { try { const C = window.AudioContext || window.webkitAudioContext; if (C) TON.ctx = new C(); } catch (e) { /* kein Ton */ } }
    if (TON.ctx && TON.ctx.state === 'suspended') TON.ctx.resume();
  },
  note(f, t0, dauer, typ, vol, glide) {
    const c = TON.ctx; if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = typ || 'sine'; o.frequency.setValueAtTime(f, c.currentTime + t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, c.currentTime + t0 + dauer);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dauer);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dauer + 0.05);
  },
  spiel(name) {
    if (!TON.an()) return;
    TON.start(); if (!TON.ctx) return;
    const n = (...a) => TON.note(...a);
    switch (name) {
      case 'tap': n(660, 0, 0.06, 'triangle', 0.08); break;
      case 'um': n(420, 0, 0.09, 'triangle', 0.1, 640); break;
      case 'gut': n(523, 0, 0.12, 'sine', 0.2); n(784, 0.09, 0.2, 'sine', 0.2); break;
      case 'leicht': n(523, 0, 0.1, 'sine', 0.2); n(659, 0.08, 0.1, 'sine', 0.2); n(988, 0.16, 0.26, 'sine', 0.2); break;
      case 'schwer': n(440, 0, 0.18, 'triangle', 0.16); break;
      case 'nochmal': n(300, 0, 0.22, 'triangle', 0.18, 200); break;
      case 'perle': n(1320, 0, 0.12, 'sine', 0.12); n(1760, 0.07, 0.18, 'sine', 0.1); break;
      case 'fertig': [523, 659, 784, 1047].forEach((f, i) => n(f, i * 0.11, 0.3, 'triangle', 0.2)); break;
      case 'ziel': [523, 659, 784, 1047, 1319].forEach((f, i) => n(f, i * 0.1, 0.4, 'triangle', 0.2)); n(262, 0, 0.8, 'sine', 0.12); break;
      case 'muschelAuf': n(200, 0, 0.5, 'sine', 0.2, 900); [1047, 1319, 1568, 2093].forEach((f, i) => n(f, 0.25 + i * 0.07, 0.5, 'sine', 0.12)); break;
      case 'selten': [659, 784, 988, 1319].forEach((f, i) => n(f, i * 0.1, 0.5, 'triangle', 0.18)); break;
      case 'episch': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => n(f, i * 0.09, 0.7, 'triangle', 0.18)); break;
      case 'legende': [392, 523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => n(f, i * 0.09, 0.9, 'triangle', 0.2)); n(196, 0, 1.4, 'sine', 0.16); break;
      case 'rang': [392, 523, 659, 784, 1047].forEach((f, i) => n(f, i * 0.12, 0.5, 'square', 0.07)); break;
      case 'kauf': n(880, 0, 0.08, 'square', 0.06); n(1320, 0.07, 0.14, 'square', 0.06); break;
      case 'freude': n(988, 0, 0.09, 'sine', 0.06); n(1319, 0.08, 0.16, 'sine', 0.05); break;
      case 'blubb': n(320, 0, 0.08, 'sine', 0.06, 560); break;
    }
  }
};

// ---------- Vorlesen ----------
const SPRECHEN = {
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined',
  stimmen: [],
  laden() { if (!SPRECHEN.ok) return; SPRECHEN.stimmen = speechSynthesis.getVoices() || []; },
  stimme(lang) {
    const kurz = lang.slice(0, 2).toLowerCase();
    const alle = SPRECHEN.stimmen.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(kurz));
    return alle.find(v => v.lang.replace('_', '-') === lang) || alle.find(v => /enhanced|premium|siri/i.test(v.name)) || alle[0] || null;
  },
  sag(text, lang) {
    if (!SPRECHEN.ok || !text) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = 0.88; u.pitch = 1.05;
      const v = SPRECHEN.stimme(lang); if (v) u.voice = v;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }
};
if (SPRECHEN.ok) { SPRECHEN.laden(); try { speechSynthesis.addEventListener('voiceschanged', SPRECHEN.laden); } catch (e) { /* ältere Browser */ } }
