const CACHE = "itinera-lite-v2";
const STATIC = ["/", "/index.html", "/manifest.json", "/placeholder.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);

  // Skip non-GET or cross-origin requests you don't control
  if (req.method !== "GET" || !url.origin.includes(self.location.origin)) return;

  // 1️⃣ API data & navigation → stale-while-revalidate
  if (url.pathname.startsWith("/api/") || req.mode === "navigate") {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then(res => {
            cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })()
    );
    return;
  }

  // 2️⃣ Everything else (static, images) → cache-first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
      return res;
    }))
  );
});
