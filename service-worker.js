const CACHE_NAME = 'jocs-edu-cache-v2';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './offline.html',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const request = e.request;

  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./offline.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request).catch(() => {
      if ((request.headers.get('accept') || '').includes('text/html')) {
        return caches.match('./offline.html');
      }
    }))
  );
});
