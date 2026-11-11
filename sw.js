const C = 'coach-web-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './manifest.json', './icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname !== location.hostname) return;   // 只缓存自己的页面
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    const cp = resp.clone(); caches.open(C).then(c => c.put(e.request, cp)); return resp;
  }).catch(() => caches.match('./'))));
});
