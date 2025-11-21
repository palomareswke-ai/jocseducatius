const CACHE_NAME = 'jocs-edu-cache-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './offline.html',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Strategy: cache-first for same-origin, network fallback
  const req = event.request;
  const url = new URL(req.url);

  // Per a recursos de la mateixa origen: cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(resp => {
          // cachejar respostes GET i 200
          if (req.method === 'GET' && resp && resp.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
          }
          return resp;
        }).catch(() => {
          // si es tracta d'una petició HTML, tornar fallback offline
          if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
            return caches.match('./offline.html');
          }
        });
      })
    );
    return;
  }

  // Per a recursos de tercers (CDN): només intentar fetch (evitar problemes CORS)
  event.respondWith(
    fetch(req).catch(() => {
      // si falla i tenim una copia al cache (rara vegada en CDN), la retornem
      return caches.match(req);
    })
  );
});
