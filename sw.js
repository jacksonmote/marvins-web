/* Offline support for marvinsgreencastle.com
 *
 * Strategy: network first. When the phone is online, every request goes to
 * the live site, so menu and price updates show up immediately. The saved
 * copy is only used when there's no connection (or it's too slow to answer).
 * When it's too slow, the network's answer is still saved when it arrives, so
 * the next visit gets the newer copy.
 *
 * Bump CACHE_VERSION when the PRECACHE list below changes. Bump it also to
 * clear every visitor's saved copies if a bad version was ever cached.
 */
const CACHE_VERSION = 'v7';
const CACHE = `marvins-${CACHE_VERSION}`;
const NETWORK_TIMEOUT_MS = 4000;

const PRECACHE = [
  '/',
  '/privacy/',
  '/accessibility/',
  '/styles.css',
  '/app.js',
  '/404.html',
  '/manifest.webmanifest',
  '/assets/Marvins-1200x600.jpg',
  '/assets/Marvins-480x240.webp',
  '/assets/Marvins-800x400.webp',
  '/assets/Marvins-1200x600.webp',
  '/favicon.ico',
  '/assets/favicon-192.png',
  '/assets/apple-touch-icon.png',
  '/assets/install-tip-icon.webp',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
  '/assets/fonts/bowlby-one-400.woff2',
  '/assets/fonts/libre-franklin-400.woff2',
  '/assets/fonts/libre-franklin-600.woff2',
  '/assets/fonts/libre-franklin-700.woff2'
];
const PRECACHED = new Set(PRECACHE);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Remove caches from older versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Give up waiting after a few seconds on a weak signal
function withTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS);
    promise.then(
      (response) => { clearTimeout(timer); resolve(response); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

function networkFirst(event) {
  const { request } = event;
  const url = new URL(request.url);
  // Ask the network. Only save the site's own listed files, and only
  // complete responses. Save under the path alone, so links with ?fbclid= or
  // ?utm_ tags replace the one saved copy instead of adding another.
  let saving = Promise.resolve();
  const network = fetch(request).then((response) => {
    if (response.status === 200 && PRECACHED.has(url.pathname)) {
      const copy = response.clone();
      saving = caches.open(CACHE).then((cache) => cache.put(url.pathname, copy));
    }
    return response;
  });
  // Keep the worker running until the response arrives and is saved, even if
  // the saved copy was already shown because the network was too slow; that
  // way the next visit gets the newer copy.
  event.waitUntil(network.then(() => saving).catch(() => {}));

  return withTimeout(network).catch(async (err) => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return (await cache.match('/')) || (await cache.match('/404.html'));
    }
    throw err;
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(event));
  }
  // Everything else (Google Maps, outside links) goes straight to the network
});
