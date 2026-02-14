// 🔴 每次发布新版本时修改这个版本号！
const CACHE_VERSION = 'v1.0.2.0';
const CACHE_NAME = `handincap-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/IntegratedGolfGame.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// 安装新版本
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_NAME}`);
  
  // 🔴 关键：跳过等待，立即激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活新版本，删除旧缓存
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_NAME}`);
  
  event.waitUntil(
    Promise.all([
      // 🔴 关键：立即接管所有页面
      clients.claim(),
      
      // 删除旧版本缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('handincap-') && name !== CACHE_NAME)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// 🔴 网络优先策略：优先获取最新内容，失败才用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 请求成功，更新缓存
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败，使用缓存（离线模式）
        return caches.match(event.request);
      })
  );
});