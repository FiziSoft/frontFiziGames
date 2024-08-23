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

  try {
    const response = await fetch(`https://fizistat-33157f0b8398.herokuapp.com/files/locales/${locale}.json`, {
      headers: lastModified ? { 'If-Modified-Since': lastModified } : {}
    });

    if (response.status === 200) {
      const data = await response.json();
      const newLastModified = response.headers.get('Last-Modified');
      await saveLocaleData(locale, data, newLastModified);
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
    const messages = await loadLocaleMessages(locale);
    if (messages) {
      i18n.global.setLocaleMessage(locale, messages);
      i18n.global.locale = locale;
      localStorage.setItem('language', locale);
      console.log(`Locale set to ${locale}`);
    } else {
      console.error(`Failed to load locale: ${locale}`);
    }
  } catch (error) {
    console.error(`Error setting locale: ${error}`);
  }
}

export async function loadAllLocales(locales) {
  const promises = locales.map(async locale => {
    const messages = await fetchAndStoreLocale(locale);
    i18n.global.setLocaleMessage(locale, messages);
  });

  await Promise.all(promises);
}

// Пример использования: загрузка всех нужных локализаций при старте
const localesToLoad = ['ua', 'ru', 'en', 'es', 'pl']; // Замените на те языки, которые вам нужны
loadAllLocales(localesToLoad).then(() => {
  const currentLocale = localStorage.getItem('language') || 'ua';
  setLocale(currentLocale).then(() => {
    // Теперь приложение может рендериться
    console.log(`App is ready with locale: ${currentLocale}`);
  });
});

export default i18n;
