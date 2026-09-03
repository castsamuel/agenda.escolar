// sw.js — service worker: cacheia o "app shell" para funcionar offline e
// instalado (o que permite o "Adicionar à tela inicial" no Android se
// comportar como um app de verdade). Não lida com dados — isso continua
// 100% em localStorage/IndexedDB, controlado pelas páginas do app.

const CACHE_NAME = 'agenda-escolar-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles/main.css',
  './src/js/app.bundle.js',
  './public/icons/icon-192.png',
  './public/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network-first para o bundle JS (pega atualizações rápido), cache-first pro resto
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.url.includes('app.bundle.js')) {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => cached))
  );
});

// Permite que a página acorde uma notificação local mesmo com a aba em segundo plano.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
