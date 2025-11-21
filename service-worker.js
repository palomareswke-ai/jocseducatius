const CACHE_NAME = 'jocs-edu-cache-v1';
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
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => {
    if(e.request.headers.get('accept')?.includes('text/html')) return caches.match('./offline.html');
  })));
});
