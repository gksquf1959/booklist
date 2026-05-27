const CACHE_NAME = 'toreadlist-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png'
];

// 설치: 필요한 파일 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// fetch: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        // 오프라인이고 캐시도 없으면 index.html 반환
        return caches.match('./index.html');
      });
    })
  );
});
