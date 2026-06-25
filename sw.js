const CACHE = 'rozgor-v4';
const SHELL = ['./', './index.html', './app.jsx', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = req.url;
  // Server funksiyalari va API ni HECH QACHON keshlamaymiz (sinxron uchun)
  if (u.indexOf('/.netlify/functions/') !== -1 || u.indexOf('api.anthropic.com') !== -1) return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        try { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } catch (_) {}
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});

// Bildirishnoma bosilganda ilovani ochish/fokuslash
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
