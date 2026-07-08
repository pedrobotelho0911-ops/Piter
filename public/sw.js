const CACHE_NAME = "piter-financas-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Nunca cachear chamadas de API de terceiros (ex: backup no GitHub) — elas
  // precisam sempre ir para a rede, senão o app passa a responder com dados
  // antigos em cache em vez de checar o estado real remoto.
  if (new URL(event.request.url).origin !== self.location.origin) return;

  const isNavigation =
    event.request.mode === "navigate" || event.request.destination === "document";

  if (isNavigation) {
    // A página em si (index.html) sempre busca a versão mais nova primeiro,
    // pra nunca mostrar uma versão desatualizada do app depois de um deploy.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(event.request);
          event.waitUntil(cache.put(event.request, response.clone()));
          return response;
        } catch {
          const cached = await cache.match(event.request);
          if (cached) return cached;
          throw new Error("Sem rede e sem versão salva em cache");
        }
      })(),
    );
    return;
  }

  // Assets com hash no nome (JS/CSS) não mudam de conteúdo, então cache-first é seguro.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) event.waitUntil(cache.put(event.request, response.clone()));
      return response;
    })(),
  );
});
