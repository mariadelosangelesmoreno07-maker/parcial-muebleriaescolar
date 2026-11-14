/* Mueblería Escolar - sw.js (Paso 4)
   Guarda una copia de los archivos la primera vez y la usa sin internet. */
const VERSION = "v2";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png"
];

// install: al instalarse, guarda todos los archivos en el caché.
self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(ARCHIVOS);
    })
  );
});

// activate: al activarse, borra las cachés de versiones anteriores.
self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres.filter(function (nombre) { return nombre !== VERSION; })
               .map(function (nombre) { return caches.delete(nombre); })
      );
    })
  );
});

// fetch: busca primero la copia guardada y, si no está, la busca en internet.
self.addEventListener("fetch", function (evento) {
  evento.respondWith(
    caches.match(evento.request).then(function (respuesta) {
      return respuesta || fetch(evento.request);
    })
  );
});
