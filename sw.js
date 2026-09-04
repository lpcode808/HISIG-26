/* Offline app shell. Stale-while-revalidate: serve the cached copy instantly,
   then refresh it in the background.

   BUMP CACHE_NAME whenever any precached file changes, or returning visitors
   keep the old version until the next revalidation cycle. */

const CACHE_NAME = "hisig26-v6";

/* Without these five the app cannot render at all, so a failure here is worth
   failing the install for -- the next visit retries. */
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js"
];

/* Everything else degrades on its own: a missing font falls back to the system
   serif, a missing icon costs an icon, a missing qrcode.js costs the QR panel. */
const EXTRAS = [
  "./fonts/vollkorn-var-subset.woff2",
  "./vendor/qrcode.js",
  "./favicon.svg",
  "./favicon-32.png",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./manifest.webmanifest"
];

const PRECACHE = CORE.concat(EXTRAS);

/* addAll() is all-or-nothing: one dropped request among fourteen -- an icon, on
   the flaky first load a QR scan produces at a venue with poor signal --
   rejected the whole install, so the worker never activated and the cache
   stayed empty. The app rendered perfectly and had no offline copy at all, and
   because registration is registered with a silent .catch nothing said so. The
   attendee found out by walking outside. Core strict, extras best-effort. */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE)
        .then(() => Promise.allSettled(EXTRAS.map((u) => cache.add(u)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
