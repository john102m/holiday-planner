const CACHE_NAME = "itinera-v8.6";

// App shell: essential files
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
   // good idea to always cache your fallback
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

  // 🚫 Skip non-GET requests (like POST, PUT, DELETE)
  if (req.method !== "GET") return;

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
  if (
    url.hostname.endsWith("blob.core.windows.net") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        try {
          //console.log("Intercepting image:", req.url);
          const res = await fetch(req, { mode: "cors", credentials: "omit" });
          if (res.ok) {
            if (res.type === "opaque") {
              cache.put(req, res); // Don't clone opaque responses
            } else {
              cache.put(req, res.clone());
            }
          }
          return res;
        } catch {
          return cached || caches.match("/placeholder.png");
        }
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
    caches.match(req).then(cached =>
      fetch(req).catch((err) => {
        console.error("❌ [SW] Fetch failed:", err);
        return cached || new Response("Network error", { status: 503 });
      })
    )
  );
});
