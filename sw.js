/* ═══════════════════════════════════════
   HEARTLY SERVICE WORKER
   Handles push notifications for iOS Safari PWA
═══════════════════════════════════════ */

const CACHE_NAME = 'heartly-v4311';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

/* ── Push event handler ── */
self.addEventListener('push', e => {
  let data = { title: 'Heartly', body: 'You have a new message', icon: '/assets/icon.jpg' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch(_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  data.icon || '/assets/icon.jpg',
      badge: data.icon || '/assets/icon.jpg',
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
      clients.openWindow('/');
    })
  );
});
