const CACHE = 'coagro-shell-v1';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => { caches.open(CACHE).then(c => c.put('/index.html', res.clone())); return res; }).catch(() => caches.match('/index.html')));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; }).catch(() => caches.match(req).then(cached => cached || new Response('{"error":"Sin conexión"}', {status:503,headers:{'Content-Type':'application/json'}}))));
    return;
  }

  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; })));
});
