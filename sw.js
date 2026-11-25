// Farewell worker: KitCheck Tactical moved to https://kitchecktactical.com/
// Clears every cache, sends open windows to the new address, then removes itself.
const NEW_ORIGIN = 'https://kitchecktactical.com';
const OLD_PREFIX = '/kitcheck-tactical-app';

function newUrl(oldHref) {
  const url = new URL(oldHref);
  let path = url.pathname;
  if (path === OLD_PREFIX || path.startsWith(OLD_PREFIX + '/')) path = path.slice(OLD_PREFIX.length);
  if (!path.startsWith('/')) path = '/' + path;
  if (path.endsWith('/index.html')) path = path.slice(0, -'index.html'.length);
  return NEW_ORIGIN + path + url.search + url.hash;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (e) { /* keep going */ }
    try { await self.clients.claim(); } catch (e) { /* keep going */ }
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map((client) => client.navigate(newUrl(client.url)).catch(() => null)));
    await self.registration.unregister();
  })());
});

// Anything still routed through this worker goes straight to the new site.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(Response.redirect(newUrl(event.request.url), 302));
  }
});
