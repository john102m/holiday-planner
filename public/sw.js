// sw.js
const CACHE_NAME = "itinera-v1";
const APP_SHELL = ["/", "/index.html", "/src/main.tsx"]; // Add other static JS/CSS files if needed
const STATIC_ASSETS = ["/icons/android-chrome-192x192.png", "/icons/android-chrome-512x512.png"]; // Add more static assets here

// Install event - cache app shell + static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...APP_SHELL, ...STATIC_ASSETS]))
  );
});

// Activate event - optional: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1️⃣ Dynamic API content → network-first
  if (url.pathname.startsWith("/api/")  && event.request.method === "GET") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // Optionally cache a copy for offline fallback
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2️⃣ Static assets / images → stale-while-revalidate
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkRes) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes.clone()));
          return networkRes;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3️⃣ App shell / other static files → cache-first
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
