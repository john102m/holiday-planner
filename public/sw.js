const CACHE_NAME = "itinera-v3.5";

// App shell: essential files for first load
const APP_SHELL = [
  "/",              // main entry
  "/index.html",
  "/manifest.json"
];

// Static assets (rarely change, icons, CSS, JS bundles)
const STATIC_ASSETS = [
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

// Install → cache app shell + static assets
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
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch → unified strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1️⃣ Navigation requests → network-first with fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(res => res)
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 2️⃣ API requests → network-first with cache fallback
  if (url.pathname.startsWith("/api/") && event.request.method === "GET") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(event.request);
          const clone = res.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, clone);
          return res;
        } catch {
          return caches.match(event.request);
        }
      })()
    );
    return;
  }

  // 3️⃣ Dynamic images (user uploads) → network-first, cache-update
  if (url.pathname.startsWith("/uploads/") ||
      url.pathname.match(/\.(png|jpg|jpeg|gif)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkRes;
        }).catch(() => cached); // fallback if network fails
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4️⃣ Static assets (icons, JS/CSS bundles) → stale-while-revalidate
  if (url.pathname.startsWith("/icons/") ||
      url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkRes;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5️⃣ All other requests → cache-first, fallback network
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// ✅ Key Points:
// /uploads/ is the folder for dynamic user images. Adjust if your backend stores them elsewhere.
// JS/CSS bundles are cached stale-while-revalidate → fast but still updated in the background.
// API calls are network-first, so users get fresh data whenever online.
// Offline users see cached content gracefully.
