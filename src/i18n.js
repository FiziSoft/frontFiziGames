import { createI18n } from 'vue-i18n';
import { openDB } from 'idb';

// Инициализация i18n с пустыми сообщениями
const i18n = createI18n({
  locale: localStorage.getItem('language') || 'ua', // текущий язык
  fallbackLocale: 'ua', // язык по умолчанию, если перевод не найден
  messages: {}, // Начинаем с пустым объектом
});

// Функция для открытия базы данных IndexedDB
async function openLocaleDB() {
  return openDB('LocaleDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('locales')) {
        db.createObjectStore('locales', { keyPath: 'key' });
      }
    }
  });
}

// Функция для сохранения данных локализации в IndexedDB
async function saveLocaleData(locale, data, lastModified) {
  const db = await openLocaleDB();
  await db.put('locales', { key: locale, data, lastModified });
}

// Функция для получения данных локализации из IndexedDB
async function getLocaleData(locale) {
  const db = await openLocaleDB();
  return await db.get('locales', locale);
}

// Загрузка локализационных данных с сервера и сохранение их в IndexedDB
async function fetchAndStoreLocale(locale) {
  const storedData = await getLocaleData(locale);
  const lastModified = storedData ? storedData.lastModified : null;

  // Если есть сохраненные данные, используйте их сразу
  if (storedData) {
    console.log(`Using stored locale for ${locale}`);
    i18n.global.setLocaleMessage(locale, storedData.data);
  }

  try {
    const response = await fetch(`https://fizistat-33157f0b8398.herokuapp.com/files/locales/${locale}.json`, {
      headers: lastModified ? { 'If-Modified-Since': lastModified } : {}
    });

    if (response.status === 200) {
      const data = await response.json();
      const newLastModified = response.headers.get('Last-Modified');
      await saveLocaleData(locale, data, newLastModified);
      i18n.global.setLocaleMessage(locale, data); // Обновляем локализацию только если есть обновленные данные
      return data;
    } else if (response.status === 304 && storedData) {
      return storedData.data;
    } else if (storedData) {
      return storedData.data;
    } else {
      throw new Error('Failed to load locale data from server');
    }
  } catch (error) {
    console.error('Failed to fetch locale from server, loading from IndexedDB:', error);
    if (storedData) {
      return storedData.data;
    } else {
      throw new Error('No locale data available in IndexedDB');
    }
  }
}

// Функция для загрузки локализаций и установки их в i18n
export async function loadLocaleMessages(locale) {
  const messages = await fetchAndStoreLocale(locale);
  return messages;
}

export async function setLocale(locale) {
  try {
    const storedData = await getLocaleData(locale);
    if (storedData) {
      i18n.global.setLocaleMessage(locale, storedData.data);
      i18n.global.locale = locale;
      console.log(`Locale immediately set from IndexedDB to ${locale}`);
    }

    // Затем обновляем локализацию, если данные на сервере изменились
    const messages = await fetchAndStoreLocale(locale);
    if (messages) {
      i18n.global.setLocaleMessage(locale, messages);
      i18n.global.locale = locale;
      localStorage.setItem('language', locale);
      console.log(`Locale updated to ${locale}`);
    }
  } catch (error) {
    console.error(`Error setting locale: ${error}`);
  }
}

// Загружаем только украинский и русский языки при старте
export async function loadInitialLocales() {
  const localesToLoad = ['ua', 'ru']; // Автоматически загружаем только украинский и русский языки
  await Promise.all(localesToLoad.map(locale => fetchAndStoreLocale(locale)));
}

// Загружаем остальные языки только по мере необходимости
export async function loadLocaleOnDemand(locale) {
  if (!['ua', 'ru'].includes(locale)) {
    await fetchAndStoreLocale(locale);
  }
}

export default i18n;
