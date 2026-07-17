// Minimal offline service worker for Tablomino.
// Strategy: network-first (fresh when online, cached fallback when offline)
// for everything EXCEPT immutable, content-hashed build assets under
// `/_next/static/`, which are safe (and fast) to serve cache-first since
// their URL changes whenever their content does.
//
// Next.js App Router client-side navigations (router.push) fetch route data
// via plain same-URL `fetch()` calls, not `mode: 'navigate'` -- treating
// those as cache-first (as an earlier version of this file did) let a stale
// cached route response silently outlive its deploy: the URL never changes
// across versions, so nothing ever invalidated it, and a `router.push` could
// resolve against months-old route data with no visible error. All game
// data lives in IndexedDB, not here.

const CACHE = 'tablomino-v3';

// Every static route in the app, precached up front rather than waiting for
// a first online visit -- otherwise a page you've never opened before (e.g.
// Progression) has nothing to fall back to offline and silently resolves to
// the wrong screen. `/profil/[id]` is server-rendered per profile and isn't
// worth precaching (nothing generic to cache); it falls back to `/` offline.
const PRECACHE_URLS = [
  '/',
  '/config',
  '/jeu',
  '/bilan',
  '/progression',
  '/profil/nouveau',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) =>
      // Individually, not addAll(): one route failing to fetch shouldn't
      // block every other route from being precached.
      Promise.all(PRECACHE_URLS.map((url) => c.add(url).catch(() => {}))),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isImmutableAsset = url.pathname.startsWith('/_next/static/');

  if (!isImmutableAsset) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    }),
  );
});
