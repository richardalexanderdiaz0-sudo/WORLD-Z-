// A minimal service worker to allow the app to be installed.
// It doesn't do any caching, just has the necessary event handlers.

self.addEventListener('install', (event) => {
  // This event is fired when the service worker is installed.
  // We don't need to do anything here for a minimal PWA.
  // Calling skipWaiting() ensures the new service worker activates immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // This event is fired when the service worker is activated.
  // We can claim clients here to take control of the page without a reload.
  event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', (event) => {
  // The fetch event handler is required for the app to be installable.
  // For a minimal "install-only" PWA, we don't need to intercept requests.
  // We can simply let the browser handle the request as it normally would.
  return;
});
