// public/sw.js

const CACHE_VERSION = "remi-cache-v1";
const APP_SHELL_CACHE = `${CACHE_VERSION}:shell`;
const ASSETS_CACHE = `${CACHE_VERSION}:assets`;

// Forzar activación inmediata al instalar
self.addEventListener("install", (event) => {
  self.skipWaiting();

  // Pre-cache mínimo (seguro y no rompe Vite)
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(APP_SHELL_CACHE);
        await cache.addAll([
          "/",
          "/index.html",
          "/manifest.webmanifest",
          "/icons/icon-192.png",
          "/icons/icon-512.png",
        ]);
      } catch {
        // si alguno no existe, no queremos romper install
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // limpiar caches antiguos
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("remi-cache-") && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      );

      await self.clients.claim();
    })()
  );
});

// Util: resolver una URL (relativa o absoluta) contra el scope del SW
function resolveUrl(urlLike) {
  try {
    return new URL(urlLike || "/", self.registration.scope).toString();
  } catch {
    return self.registration.scope;
  }
}

// ---------------------------
// OFFLINE: cache app shell + assets
// ---------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET (no tocamos POST/PUT... para no interferir con Supabase)
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Solo mismo origen (tu PWA). No caches a Supabase/CDNs.
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  // SPA navigation
  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          // Network-first: si hay red, conseguimos la versión nueva.
          const fresh = await fetch(req);

          // Guardamos SIEMPRE el HTML como /index.html para usarlo como fallback estable.
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put("/index.html", fresh.clone());

          return fresh;
        } catch {
          // Offline -> devolvemos index.html cacheado
          const cached = await caches.match("/index.html");
          return cached || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Assets típicos de Vite: /assets/*.js, *.css, icons, etc.
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest");

  if (isStaticAsset) {
    // Stale-while-revalidate:
    // - si existe en cache -> responde rápido
    // - en paralelo intenta bajar versión nueva (si hay red) y actualiza cache
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS_CACHE);
        const cached = await cache.match(req);

        const fetchPromise = (async () => {
          try {
            const fresh = await fetch(req);
            cache.put(req, fresh.clone());
            return fresh;
          } catch {
            return null;
          }
        })();

        // Si hay cache, devolvemos cache y actualizamos en background
        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

        // Si no hay cache, esperamos red; si falla -> 503
        const fresh = await fetchPromise;
        return fresh || new Response("Offline", { status: 503 });
      })()
    );
    return;
  }

  // Para el resto de GET same-origin (si los hubiera), dejamos comportamiento normal (network)
});

// ---------------------------
// PUSH (tu código)
// ---------------------------

// PUSH: espera payload JSON { title, body, url, tag }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}

  const title = data.title || "REMI";
  const options = {
    body: data.body || "Tienes tareas por completar 💪",
    icon: "/icons/icon-192.png",
    tag: data.tag || "Remi-reminder",
    renotify: false,
    data: { url: resolveUrl(data.url || "/") },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// CLICK: enfocar una ventana existente o abrir nueva en data.url
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = resolveUrl(event.notification.data?.url || "/");

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const scopeOrigin = new URL(self.registration.scope).origin;
      const sameOrigin = all.find((c) => {
        try {
          return new URL(c.url).origin === scopeOrigin;
        } catch {
          return false;
        }
      });

      if (sameOrigin) {
        await sameOrigin.focus();
        if (sameOrigin.url !== targetUrl && "navigate" in sameOrigin) {
          try {
            await sameOrigin.navigate(targetUrl);
          } catch {}
        } else {
          try {
            sameOrigin.postMessage({ type: "OPEN_URL", url: targetUrl });
          } catch {}
        }
        return;
      }

      await clients.openWindow(targetUrl);
    })()
  );
});

// Opcional: telemetría o limpieza
self.addEventListener("notificationclose", (_event) => {});

// Opcional: si cambia la suscripción push
self.addEventListener("pushsubscriptionchange", async (event) => {
  console.log("pushsubscriptionchange", event);
});
