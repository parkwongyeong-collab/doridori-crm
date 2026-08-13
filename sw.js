// 도리도리CRM Service Worker
const CACHE_NAME = 'doridori-crm-v1';

// 설치 시 기본 파일 캐시
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/doridori-crm/',
        '/doridori-crm/index.html'
      ]);
    })
  );
  self.skipWaiting();
});

// 활성화 시 구 캐시 삭제
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', function(e) {
  // API 요청은 캐시 안 함
  if(e.request.url.includes('supabase') ||
     e.request.url.includes('solapi') ||
     e.request.url.includes('googleapis')) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(res) {
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, resClone);
      });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
