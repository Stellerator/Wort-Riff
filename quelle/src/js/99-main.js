'use strict';
// ---------- Start ----------
(async function init() {
  window.addEventListener('error', e => { try { console.error('Fehler:', e.message); } catch (x) { /* nichts */ } });
  await DB.open();
  await ladeZustand();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* optional */ }
  const us = Object.keys(S.users);
  if (us.length === 1 && S.cur && S.users[S.cur]) start();
  else if (us.length === 0) gehe('neuNutzer', { name: '', avatar: pick(STARTER) });
  else gehe('profile');
  updAutoStart();
  window.__bereit = true;
})();
