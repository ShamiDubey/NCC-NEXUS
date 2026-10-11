// NCC Nexus service worker: cache-first for heavy static assets (3D models,
// built JS/CSS, icons), network-first for pages, never touches /api or sockets.
const CACHE = "ncc-nexus-v1";

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/socket.io")) return;

  const heavy = /\/models\/|\/assets\/|\/icons\//.test(url.pathname);
  if (heavy) {
    // cache-first: models and hashed bundles are immutable
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.ok || res.status === 206) {
          if (res.status === 200) c.put(e.request, res.clone());
        }
        return res;
      })
    );
  } else {
    // network-first with cache fallback for navigation/shell
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok && url.origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("/")))
    );
  }
});
