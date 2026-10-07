/* Offline support for marvinsgreencastle.com
 *
 * Strategy: network first. When the phone is online, every request goes to
 * the live site, so menu and price updates show up immediately. The saved
 * copy is only used when there's no connection (or it's too slow to answer).
 *
 * Bump CACHE_VERSION only when the PRECACHE list below changes.
 */
const CACHE_VERSION = 'v1';
const CACHE = `marvins-${CACHE_VERSION}`;
const FONT_CACHE = 'marvins-fonts';
const NETWORK_TIMEOUT_MS = 4000;

const PRECACHE = [
  '/',
  '/styles.css',
  '/app.js',
  '/404.html',
  '/manifest.webmanifest',
  '/assets/Marvins-1200x600.jpg',
  '/assets/MarvinsFavicon.png',
  '/assets/apple-touch-icon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png'
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
        keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))
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

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
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

// Font files never change at a given URL, so serve saved copies first
async function cacheFirst(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, CACHE));
  } else if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(networkFirst(request, FONT_CACHE));
  } else if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
  }
  // Everything else (Google Maps, outside links) goes straight to the network
});
