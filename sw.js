const C = 'coach-web-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './manifest.json', './icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname !== location.hostname) return;          // 跨域（GitHub API / DeepSeek）不拦
  // 页面请求：先联网，拿到新的就用新的；断网才用缓存
  if (e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html')) {
    e.respondWith(fetch(e.request).then(resp => {
      const cp = resp.clone(); caches.open(C).then(c => c.put(e.request, cp)); return resp;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
    return;
  }
  // 静态资源：缓存优先
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    const cp = resp.clone(); caches.open(C).then(c => c.put(e.request, cp)); return resp;
  })));
});
