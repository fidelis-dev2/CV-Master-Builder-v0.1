const CACHE_NAME = 'cv-master-builder-pwa-v20260520';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css?v=20260520-pwa-mobile-pdf',
  './assets/js/app.js?v=20260520-pwa-mobile-pdf',
  './data/templates.json',
  './data/reviews.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
    const copy = resp.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
    return resp;
  }).catch(()=>caches.match('./index.html'))));
});
