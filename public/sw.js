// sw.js
const CACHE_NAME = "itinera-v3";
const APP_SHELL = ["/", "/index.html"];

const STATIC_ASSETS = [
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

// Install event – cache app shell + static assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // 🚀 Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...APP_SHELL, ...STATIC_ASSETS]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // 👑 Take control of all tabs
});


// Fetch event – unified strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1️⃣ API requests → network-first
  if (url.pathname.startsWith("/api/") && event.request.method === "GET") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(event.request);
          const resClone = res.clone(); // ✅ clone before using
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, resClone);
          return res;
        } catch {
          return caches.match(event.request);
        }
      })()
    );
    return;
  }

  // 2️⃣ Static assets → stale-while-revalidate
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkRes) => {
          const resClone = networkRes.clone(); // ✅ clone before caching
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, resClone)
          );
          return networkRes;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3️⃣ App shell & other static files → cache-first
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
