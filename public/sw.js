const CACHE_NAME = "itinera-v4.0";

// App shell: essential files
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Static assets
const STATIC_ASSETS = [
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

// Install → pre-cache shell + static
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...APP_SHELL, ...STATIC_ASSETS])
    )
  );
});

// Activate → clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch → strategy-based
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1️⃣ Navigation requests → stale-while-revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          return networkRes;
        }).catch(() => cached || caches.match("/index.html"));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 2️⃣ API requests → network-first with cache fallback
  if (url.pathname.startsWith("/api/") && req.method === "GET") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const clone = res.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, clone);
          return res;
        } catch {
          return caches.match(req);
        }
      })()
    );
    return;
  }

  // 3️⃣ Dynamic images → cache-first with background update
  if (url.pathname.startsWith("/uploads/") || url.pathname.match(/\.(png|jpg|jpeg|gif)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4️⃣ Static assets (JS, CSS, icons) → stale-while-revalidate
  if (url.pathname.startsWith("/icons/") || url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes.clone()));
          return networkRes;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5️⃣ Default → cache-first fallback network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
