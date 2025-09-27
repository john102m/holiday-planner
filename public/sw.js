const CACHE_NAME = "itinera-v4.3";

// App shell: essential files
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/placeholder.png" // good idea to always cache your fallback
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
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
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

  // 3️⃣ Azure Blob images → cache-first with background update (opaque-safe)
  if (url.hostname.endsWith("blob.core.windows.net")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          const clone = res.clone(); // clone immediately
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4️⃣ Dynamic images (uploads folder or local assets) → cache-first
  if (url.pathname.startsWith("/uploads/") || url.pathname.match(/\.(png|jpg|jpeg|gif)$/)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5️⃣ Static assets (JS, CSS, icons) → stale-while-revalidate
  if (url.pathname.startsWith("/icons/") || url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(networkRes => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 6️⃣ Default → cache-first fallback network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
