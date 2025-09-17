self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('blob.core.windows.net')) {
    event.respondWith(
      caches.open('image-cache').then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  }
});
