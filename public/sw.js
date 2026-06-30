self.addEventListener('push', function (event) {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) {}
  const title = data.title || 'SpeakUp'
  const options = {
    body: data.body || 'Hora de praticar seu inglês! 🔥',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/app' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/app'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const c of list) { if ('focus' in c) return c.focus() }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
