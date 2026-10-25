// Götterwettstreit: Service Worker nur für Mitteilungen.
// Bewusst ohne Zwischenspeicher und ohne fetch-Handler, damit jede neue Version sofort ankommt.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Götterwettstreit', {
    body: d.body || '', icon: 'icon-192.png', data: { url: d.url || './' }
  }));
});

// Antippen öffnet das richtige Spiel, in der offenen App oder neu
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list[0];
    if (!c) return self.clients.openWindow(url);
    return (c.navigate ? c.navigate(url).catch(() => c) : Promise.resolve(c)).then(w => (w || c).focus());
  }));
});
