const CACHE_NAME = 'app-shell-v1';

const urlsToCache = [
  '/',
  '/assets/main.js',
  '/assets/style.css',
  // Add other static paths
  '/index.html', // Entry point

  //'/styles.css', // Global styles
  '/main.js', // Main bundle
  //'/favicon.ico', // Icon
  //'/dashboardlower',
  //'/manifest.json', // PWA manifest
  //'/assets/logo.png', // Branding
  '/dashboard', // Main dashboard route
  '/destinations',
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open('holiday-planner-v1');

      // Cache static URLs
      const staticUrls = [
        '/',
        '/index.html', ,
        //'/favicon.ico',
        //'/manifest.json'
      ];
      await Promise.all(
        staticUrls.map(async url => {
          try {
            console.log('Prefetching static URL:', url);
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response.clone());
              console.log('Cached:', url);
            } else {
              console.warn('Failed to fetch (non-ok response):', url, response.status);
            }
          } catch (err) {
            console.error('Failed to fetch', url, err);
          }
        })
      );

      // Cache dynamic assets from manifest
      try {
        const res = await fetch('/asset-manifest.json');
        const manifest = await res.json();
        const dynamicUrls = Object.values(manifest);

        await Promise.all(
          dynamicUrls.map(url =>
            fetch(url).then(response => {
              if (response.ok) return cache.put(url, response);
            }).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      } catch (err) {
        console.error('Failed to fetch asset-manifest.json:', err);
      }
    })()
  );
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/')
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});


