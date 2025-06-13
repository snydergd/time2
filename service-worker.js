const CACHE_NAME = 'external-resources-cache-v2';
const URLS_TO_CACHE = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css',
  'https://unpkg.com/react@17/umd/react.development.js',
  'https://unpkg.com/react-dom@17/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://snydergd.github.io/images/paper.jpg',
];
const WEB_FIRST_URLS = [
  /.*\/time2.html$/,
  /.*\/manifest.json$/,
];

// Install event - cache specified resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Fetch event - handle caching logic
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  const isFont = /\.(woff2?|ttf|otf|eot)$/i.test(url.pathname);
  const isCachedResource = URLS_TO_CACHE.includes(request.url);
  const isWebFirstUrl = WEB_FIRST_URLS.filter(x => x.test(request.url)).length > 0;

  if (isWebFirstUrl) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(request))
    );
  } else if (isFont || isCachedResource) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});
