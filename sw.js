/* ═══════════════════════════════════════
   HEARTLY SERVICE WORKER
   Handles push notifications for iOS Safari PWA
═══════════════════════════════════════ */

const CACHE_NAME = 'heartly-v4311';

// Resolve asset paths relative to wherever this SW is actually scoped —
// works whether the app lives at a domain root (Netlify, custom domain)
// or under a subpath (e.g. a GitHub Pages project site like
// username.github.io/heartly/). Hardcoding '/assets/...' would silently
// 404 the notification icon under a subpath.
const ICON_URL = new URL('assets/icon.jpg', self.registration.scope).href;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

/* ── Push event handler ── */
self.addEventListener('push', e => {
  let data = { title: 'Heartly', body: 'You have a new message' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch(_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  ICON_URL,
      badge: ICON_URL,
      tag:   data.tag  || 'heartly-general',
      data:  data,
      vibrate: [200, 100, 200],
    })
  );
});

/* ── Notification click ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          client.focus();
          return;
        }
      }
      clients.openWindow(self.registration.scope);
    })
  );
});
