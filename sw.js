const CACHE_NAME = 'toreadlist-v4';
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

// 활성화: 이전 캐시 전부 삭제
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

// fetch: 네트워크 우선, 실패하면 캐시
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 성공하면 캐시도 업데이트
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // 오프라인이면 캐시에서
        return caches.match(event.request) || caches.match('./index.html');
      })
  );
});
