const CACHE_NAME = 'fizigames-cache-v2'; // Обновите версию кеша

// Файлы, которые необходимо закешировать
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/src/assets/style.sass',
  '/src/assets/sound/60sec.mp3',
  '/src/assets/sound/plus_click.mp3',
  '/src/assets/sound/miss_sound.mp3',
  '/src/assets/whatsapp.png',
  '/src/assets/viber.png',
  '/src/assets/telegram.png',

  // добавьте другие важные файлы
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Оставляем только текущий кеш

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Удаляем старые кеши
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Если запрашиваемый ресурс не найден в кеше и недоступен из сети, возвращаем закешированную офлайн-страницу
        return caches.match('/index.html');
      });
    })
  );
});
