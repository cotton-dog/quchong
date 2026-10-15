// 🟢 不需要写死版本号，每次安装自动生成一个唯一的名字
const CACHE_NAME = 'quchong-cache-' + new Date().getTime();

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './192.jpg',   // ✅ 改成实际的文件名
  './512.jpg'    // ✅ 改成实际的文件名
];

// 安装时，强制新 SW 立即跳过等待，并缓存新文件
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 激活时，自动清理掉所有不是当前名字的旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // 只要缓存名字不是我们当前最新的名字，统统删掉！
          if (cache !== CACHE_NAME) {
            console.log('自动清理旧缓存:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // 立即接管当前页面
      return self.clients.claim();
    })
  );
});

// 拦截请求，优先请求网络，网络失败时回退到缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});