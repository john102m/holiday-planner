const CACHE_NAME = "itinera-v6.1";
const MAX_ITEMS = 100;

// 🧱 Essential shell files
const APP_SHELL = [
  "/", "/index.html", "/manifest.json", "/placeholder.png",
  "/icons/android-chrome-192x192.png", "/icons/android-chrome-512x512.png"
];

// 📦 Install: Pre-cache shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// 🧹 Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 🚦 Fetch: Strategy-based handling
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 🧭 Navigation → stale-while-revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            trimCache(CACHE_NAME);
          });
          return networkRes;
        }).catch(() => cached || caches.match("/index.html"));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 🔌 API GET → network-first with fallback
  if (url.pathname.startsWith("/api/") && req.method === "GET") {
    event.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 🖼️ Images (uploads, blobs) → cache-first + background update
  if (
    url.hostname.endsWith("blob.core.windows.net") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            trimCache(CACHE_NAME);
          });
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 📁 Static assets (JS, CSS) → stale-while-revalidate
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            trimCache(CACHE_NAME);
          });
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 🧯 Default → network-first fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// 🧼 Trim cache to prevent bloat
async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  while (keys.length > MAX_ITEMS) {
    await cache.delete(keys.shift());
  }
}
