// Versioning (optional but helpful)
const CACHE_NAME = 'image-cache-v1';

// 🔁 Install: Activate new SW immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Skip waiting phase
});

// 🧭 Activate: Take control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Claim control
});

// 🖼️ Fetch: Cache Azure Blob images
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('blob.core.windows.net')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          }).catch(() => {
		    return caches.match('/placeholder.png'); // or Response.error()
		  });
        })
      )
    );
  }
});
