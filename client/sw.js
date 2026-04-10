const CACHE_NAME = 'pawspace-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/feed',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API calls: network first, no cache (always fresh data)
// - Static assets: cache first, fall back to network
// - Images: cache first with 7-day expiry (saves mobile data)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API — network only
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
    event.respondWith(fetch(request));
    return;
  }

  // Images — cache first, 7 day TTL
  if (request.destination === 'image') {
    event.respondWith(
      caches.open('pawspace-images').then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // Everything else — cache first, fall back to network, fall back to /
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match('/') ?? new Response('Offline', { status: 503 }));
    })
  );
});