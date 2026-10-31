// Service worker for Scene Partner: makes the app installable and lets it work offline.
//
// IMPORTANT: CACHE is strictly prefixed `scene-partner-` and cleanup only ever
// deletes caches starting with `scene-partner-`, so it never touches `addy-math-lab-`
// or `felix-math-lab-` on the shared `https://jmerk-bot.github.io` origin.

const CACHE = 'scene-partner-__APP_VERSION__';
const NETWORK_TIMEOUT_MS = 3000;

const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/ui.js',
  './js/state.js',
  './js/matcher.js',
  './js/voice.js',
  './js/pdf.js',
  './js/library.js',
  './js/library-shakespeare.js',
  './js/library-classics.js',
  './js/cloud.js',
  './js/pwa.js',
  './js/version.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('scene-partner-') && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/version.json')) return;

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);

  const freshRequest = request.mode === 'navigate'
    ? new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' })
    : new Request(request, { cache: 'no-cache' });

  const network = fetch(freshRequest).then((response) => {
    if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
    if (response.status === 200) cache.put(request, response.clone());
    return response;
  });
  network.catch(() => {});

  try {
    return await withTimeout(network, NETWORK_TIMEOUT_MS);
  } catch (e) {
    const cached = await cache.match(request, { ignoreSearch: true })
      || (request.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    return cached || network;
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}
