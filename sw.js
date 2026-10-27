// Cupcake Quest service worker: lets the game open with no internet and tells the page when a new version is ready.
// VERSION must equal APP_VERSION in math-quest.html (a test checks it): changing this file is what makes browsers notice a new release.
const VERSION = '2026.10.26';
const CACHE = 'cq-' + VERSION;
const PAGE = './math-quest.html';
const CORE = [PAGE, './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.add(new Request(PAGE, {cache: 'reload'}));                                   // the game itself must be cached, or the install fails
    await Promise.all(CORE.slice(1).map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => {})));   // icons are nice to have
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k.startsWith('cq-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

function networkFirst(req){            // pages: the newest copy when online (4 s patience), the saved copy otherwise
  const net = fetch(req).then(r => { if(r && r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; });
  const slow = new Promise((_, no) => setTimeout(() => no(new Error('slow')), 4000));
  return Promise.race([net, slow]).catch(async () => (await caches.match(req, {ignoreSearch: true})) || (await caches.match(PAGE)) || net);
}
async function cacheFirst(req){        // icons and other small files
  const hit = await caches.match(req, {ignoreSearch: true}); if(hit) return hit;
  const r = await fetch(req); if(r && r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r;
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;             // Firebase and Google are never touched
  if(req.mode === 'navigate' || /\.html?$/.test(url.pathname)) e.respondWith(networkFirst(req));
  else e.respondWith(cacheFirst(req));
});
