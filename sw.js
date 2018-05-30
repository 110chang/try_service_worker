'use strict';
console.log(self);
const CACHE_NAME = 'cache-v1';
const urlsToCache = [
  './'
];

self.addEventListener('install', function (e) {
  console.log('install sw');
  e.waitUntil(caches.open(CACHE_NAME).then(cache => {
    console.log('open cache');
    return cache.addAll(urlsToCache);
  }));
});

self.addEventListener('activate', function (e) {
  console.log('activate');
  let cacheWhiteList = [CACHE_NAME];

  e.waitUntil(caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
      if (cacheWhiteList.indexOf(cacheName) === -1) {
        return caches.delete(cacheName);
      }
    }))
  }))
})

self.addEventListener('fetch', function (e) {
  console.log('fetch', e.request.url);
  e.respondWith(caches.match(e.request).then(response => {
    if (response) {
      return response;
    }
    let fetchRequest = e.request.clone();

    return fetch(fetchRequest).then(response => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      let responseToCache = response.clone();

      caches.open(CACHE_NAME).then(cache => {
        cache.put(e.request, responseToCache);
      });

      return response;
    })
  }))
});
