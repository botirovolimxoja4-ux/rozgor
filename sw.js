// Ro'zgor service worker — v5 (network-first: doim eng yangi versiya)
const CACHE = 'rozgor-v5';
const SHELL = ['./', './index.html', './app.jsx', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  // Server funksiyalari/API ni hech qachon keshlamaymiz
  if (url.indexOf('/.netlify/functions/') !== -1 || url.indexOf('api.anthropic.com') !== -1) return;

  const sameOrigin = url.indexOf(self.location.origin) === 0;

  if (sameOrigin) {
    // NETWORK-FIRST: doim yangi versiyani olishga harakat, internet yo'q bo'lsa keshdan
    e.respondWith(
      fetch(req)
        .then((res) => { try { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {} return res; })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
  } else {
    // CDN (React/Babel) — barqaror, keshdan tez
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => { try { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {} return res; }))
    );
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
