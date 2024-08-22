self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('fizigames-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/style.css',
          '/js/main.js',
          '/manifest.json',
          // добавьте сюда пути к основным файлам локализации
          '/locales/ua.json',
          '/locales/ru.json',
          '/locales/en.json',
          '/locales/pl.json',
          '/locales/es.json',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  