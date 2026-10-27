/* Offline support for marvinsgreencastle.com
 *
 * Strategy: network first. When the phone is online, every request goes to
 * the live site, so menu and price updates show up immediately. The saved
 * copy is only used when there's no connection (or it's too slow to answer).
 *
 * Bump CACHE_VERSION only when the PRECACHE list below changes.
 */
const CACHE_VERSION = 'v3';
const CACHE = `marvins-${CACHE_VERSION}`;
const NETWORK_TIMEOUT_MS = 4000;

const PRECACHE = [
  '/',
  '/styles.css',
  '/app.js',
  '/404.html',
  '/manifest.webmanifest',
  '/assets/Marvins-1200x600.jpg',
  '/favicon.ico',
  '/assets/favicon-192.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
  '/assets/fonts/bowlby-one-400.woff2',
  '/assets/fonts/libre-franklin-400.woff2',
  '/assets/fonts/libre-franklin-600.woff2',
  '/assets/fonts/libre-franklin-700.woff2'
];

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

// Try the network, but give up after a few seconds on a weak signal
function fetchWithTimeout(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS);
    fetch(request).then(
      (response) => { clearTimeout(timer); resolve(response); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetchWithTimeout(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return (await cache.match('/')) || (await cache.match('/404.html'));
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
  // Everything else (Google Maps, outside links) goes straight to the network
});
