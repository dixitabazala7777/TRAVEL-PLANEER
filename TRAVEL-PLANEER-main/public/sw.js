// Service Worker for Waypoint Offline Sync
const CACHE_NAME = 'waypoint-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background Sync Logic
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-itinerary') {
    event.waitUntil(syncItinerary());
  }
});

async function syncItinerary() {
  console.log('[SW] Syncing itinerary...');
  // In a real app, this would push to a server.
  // Here we simulate a network delay and success.
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[SW] Sync complete');
      resolve();
    }, 1500);
  });
}
