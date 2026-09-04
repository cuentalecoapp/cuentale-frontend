// Service worker simple: guarda en caché los archivos de la app (HTML, JS, CSS)
// la primera vez que se cargan, para que la aplicación pueda abrir aunque
// no haya internet en el momento. Los datos (ingresos, gastos, etc.) siguen
// necesitando conexión para guardarse en el servidor — pero eso ya lo maneja
// la cola de pendientes en offlineDb.js.

const NOMBRE_CACHE = "mvp-shell-v1";

self.addEventListener("install", (evento) => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres.filter((n) => n !== NOMBRE_CACHE).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;

  // Solo nos interesa guardar en caché la app misma (GET), nunca las
  // llamadas a la API — esas siempre deben ir directo al servidor real.
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

  evento.respondWith(
    caches.open(NOMBRE_CACHE).then(async (cache) => {
      try {
        const respuestaRed = await fetch(request);
        cache.put(request, respuestaRed.clone());
        return respuestaRed;
      } catch (err) {
        const respuestaCache = await cache.match(request);
        return respuestaCache || Response.error();
      }
    })
  );
});
