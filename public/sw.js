// sw.js
const CACHE_NAME = "holiday-planner-v1";
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    // Dynamic content: fetch from network first
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // Static assets: cache first
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
  }
});
