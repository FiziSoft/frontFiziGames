const CACHE_NAME = 'fizigames-cache-v4'; // Обновите версию кеша
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // Установите лимит кеша, например, 50MB

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
            await cache.put(event.request, fetchResponse.clone());
            await limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE); // Ограничиваем размер кеша
          }

          return fetchResponse;
        } catch (error) {
          console.error('Ошибка при загрузке файла локализации:', error);
          return caches.match('/index.html');
        }
      })
    );
  } else {
    // Для всех остальных запросов обычная обработка
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            limitCacheSize(CACHE_NAME, MAX_CACHE_SIZE); // Ограничиваем размер кеша
            return fetchResponse;
          });
        }).catch(() => {
          return caches.match('/index.html');
        });
      })
    );
  }
});

// Функция для ограничения размера кеша
async function limitCacheSize(name, size) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  let cacheSize = 0;

  for (let request of keys) {
    const response = await cache.match(request);
    const blob = await response.blob();
    cacheSize += blob.size;

    if (cacheSize > size) {
      await cache.delete(request);
    }
  }
}
