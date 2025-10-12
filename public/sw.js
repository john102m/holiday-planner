const CACHE_NAME = "itinera-v6.0";

// 🧱 Essential files for offline shell
const APP_SHELL = [
  "/", // root page
  "/index.html",
  "/manifest.json",
  "/placeholder.png", // fallback image
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

// 🛠 Install: Pre-cache static shell
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// 🧹 Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of open pages
});

// 🚦 Fetch: Handle requests based on type
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 🧭 1. Navigation (HTML pages) → stale-while-revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            trimCache(CACHE_NAME);


          });

          return networkRes;
        }).catch(() => cached || caches.match("/index.html")); // fallback if offline
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 🔌 2. API calls → network-first (fresh data preferred)
  if (url.pathname.startsWith("/api/") && req.method === "GET") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req)) // fallback only if offline
    );
    return;
  }

  // 🖼️ 3. Static assets (JS, CSS, images) → cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
              trimCache(CACHE_NAME); // add here too
          });
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 🧯 4. Fallback for everything else → network-first
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

const MAX_ITEMS = 50;

async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  while (keys.length > MAX_ITEMS) {
    await cache.delete(keys.shift()); // delete oldest
  }
}


