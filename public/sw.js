const CACHE_NAME = "itinera-v11.1";

// App shell: essential files
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Static assets
const STATIC_ASSETS = [
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/placeholder.png",        // ✅ pre-cache placeholder
  // add any other key images you always want offline here
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

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1️⃣ Navigation requests → stale-while-revalidate
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req)
          .then(networkRes => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            return networkRes;
          })
          .catch(() => cached || caches.match("/index.html"));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 2️⃣ API requests → network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
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

  // 3️⃣ Image requests → cache-first with placeholder fallback
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/) ||
    url.hostname.endsWith("blob.core.windows.net")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const networkRes = await fetch(req, { mode: "cors", credentials: "omit" });
          if (networkRes.ok) cache.put(req, networkRes.type === "opaque" ? networkRes : networkRes.clone());
          return networkRes;
        } catch {
          const fallback = await cache.match("/placeholder.png");
          return fallback || new Response("", { status: 404 });
        }
      })
    );
    return;
  }

  // 4️⃣ Static assets (JS, CSS, icons) → stale-while-revalidate
  if (url.pathname.startsWith("/icons/") || url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req)
          .then(networkRes => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5️⃣ Default → cache-first fallback network
  event.respondWith(
    caches.match(req).then(cached =>
      fetch(req).catch(() => cached || new Response("Network error", { status: 503 }))
    )
  );
});
