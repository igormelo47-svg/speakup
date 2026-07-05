// Service worker do Vonai: além de habilitar a instalação (beforeinstallprompt) e as
// notificações push, guarda o app shell em cache para o app abrir e as lições
// funcionarem mesmo sem internet (o conteúdo das lições viaja no bundle JS).
const CACHE = 'vonai-shell-v3'

self.addEventListener('install', function () { self.skipWaiting() })

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('vonai-shell-') === 0 && k !== CACHE }).map(function (k) { return caches.delete(k) })) })
      .then(function () { return self.clients.claim() })
  )
})

self.addEventListener('fetch', function (event) {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Supabase, Anthropic e afins: rede normal, nunca cache (dados vivos e autenticados).
  if (url.origin !== self.location.origin) return
  if (url.pathname.indexOf('/api/') === 0) return

  // Páginas: rede primeiro (sempre fresco); sem rede, serve a última versão salva.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (r) { const copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia) }); return r })
        .catch(function () { return caches.match(req).then(function (r) { return r || caches.match('/app') }) })
    )
    return
  }

  // Estáticos (_next, ícones, sons): cache primeiro, atualizando em segundo plano.
  event.respondWith(
    caches.match(req).then(function (hit) {
      const rede = fetch(req)
        .then(function (r) { if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia) }) } return r })
        .catch(function () { return hit })
      return hit || rede
    })
  )
})

self.addEventListener('push', function (event) {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) {}
  const title = data.title || 'Vonai'
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
