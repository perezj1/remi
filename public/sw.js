// Forzar activación inmediata al instalar
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Util: resolver una URL (relativa o absoluta) contra el scope del SW
function resolveUrl(urlLike) {
  try {
    // Si ya es absoluta, new URL la aceptará; si es relativa, la resuelve vs scope
    return new URL(urlLike || '/home', self.registration.scope).toString();
  } catch {
    // Fallback: raíz de la app (scope)
    return self.registration.scope;
  }
}

// PUSH: espera payload JSON { title, body, url, tag }
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}

  const title = data.title || 'REMI';
  const options = {
    body: data.body || 'Tienes tareas por completar 💪',
    icon: '/icons/icon-192.png',
    // Si tienes badge, descomenta:
    // badge: '/icons/badge-72.png',
    tag: data.tag || 'Remi-reminder',
    renotify: false,
    // Normalizamos aquí para que notificationclick no tenga que adivinar
    data: { url: resolveUrl(data.url || '/home') }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// CLICK: enfocar una ventana existente o abrir nueva en data.url
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = resolveUrl(event.notification.data?.url || '/home');

  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // 1) Busca una ventana del mismo origen (respecto al scope)
    const scopeOrigin = new URL(self.registration.scope).origin;
    const sameOrigin = all.find((c) => {
      try { return new URL(c.url).origin === scopeOrigin; }
      catch { return false; }
    });

    if (sameOrigin) {
      // Android suele respetar mejor focus() antes de navigate()
      await sameOrigin.focus();
      if (sameOrigin.url !== targetUrl && 'navigate' in sameOrigin) {
        try { await sameOrigin.navigate(targetUrl); } catch {}
      } else {
        // Plan B (opcional): si no navega, que la app lo haga
        try { sameOrigin.postMessage({ type: 'OPEN_URL', url: targetUrl }); } catch {}
      }
      return;
    }

    // 2) Si no hay ventana, abrir nueva
    await clients.openWindow(targetUrl);
  })());
});

// Opcional: telemetría o limpieza
self.addEventListener('notificationclose', (_event) => {
  // console.log('Notificación cerrada', _event.notification?.tag);
});

// Opcional: si cambia la suscripción push (rotación de claves, etc.)
self.addEventListener('pushsubscriptionchange', async (event) => {
  // Aquí puedes re-suscribirte y enviar la nueva sub a tu backend.
  // Por simplicidad, sólo log:
  console.log('pushsubscriptionchange', event);
});
