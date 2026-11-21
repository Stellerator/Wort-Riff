/* Wortriff Service Worker – macht die App offline nutzbar. Version und Dateiliste setzt repo-bauen.js ein.
   Neue Fassung: Der neue Service Worker lädt alles vor und wartet, bis die App „Jetzt installieren“ meldet (message 'skip').
   Kartenpakete (karten/) und version.json gehen immer frisch ans Netz. Der Lernstand liegt in IndexedDB und wird hier nie angefasst. */
const VERSION = 'V04-8c74830';
const FILES = ["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
const CACHE = 'wortriff-' + VERSION;

self.addEventListener('install', (e) => {
  // 'reload' umgeht den HTTP-Cache des Servers (GitHub Pages cached ca. 10 Minuten), sonst gäbe es beim Update die alte Version
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => fetch(new Request(f, { cache: 'reload' })).then((r) => { if (!r.ok) throw new Error(f + ' ' + r.status); return c.put(f, r); })))));
});
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('wortriff-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (/\/karten\/|\/version\.json$/.test(u.pathname)) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || fetch(r)));
});
