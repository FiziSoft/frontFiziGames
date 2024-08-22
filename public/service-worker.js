self.addEventListener('install', event => {
  event.waitUntil(
      caches.open('fizigames-cache-v1').then(cache => {
          return cache.addAll([
              '/',
              '/index.html',
              '/css/style.css',
              '/js/main.js',
              '/manifest.json',
              '/src/assets/style.sass',
          
              '/src/views/Alias/AliasCreate.vue',
              '/src/views/Alias/AliasRoom.vue',
              '/src/assets/sound/60sec.mp3',
              '/src/assets/sound/plus_click.mp3',
              '/src/assets/sound/miss_sound.mp3',


              // Добавьте все другие необходимые файлы сюда
          ]);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request).catch(() => {
              return caches.match('/offline.html');
          });
      })
  );
});
