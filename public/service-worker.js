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
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/files/locales/')) {
    // Обработка запросов на локализационные файлы
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const response = await cache.match(event.request);

        if (response) {
          // Если файл есть в кэше, возвращаем его
          return response;
        }

        // Иначе делаем запрос на сервер
        try {
          const fetchResponse = await fetch(event.request);
          
          // Кешируем полученный файл локализации
          if (fetchResponse && fetchResponse.status === 200) {
            cache.put(event.request, fetchResponse.clone());
          }

          return fetchResponse;
        } catch (error) {
          console.error('Ошибка при загрузке файла локализации:', error);
          // Здесь можно вернуть локальную версию или показать сообщение
          return caches.match('/index.html');
        }
      })
    );
  } else {
    // Для всех остальных запросов обычная обработка
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Кеширование новых запросов
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }).catch(() => {
          // Если запрашиваемый ресурс не найден в кеше и недоступен из сети, возвращаем закешированную офлайн-страницу
          return caches.match('/index.html');
        });
      })
    );
  }
});
