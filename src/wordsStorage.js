import { openDB } from 'idb';

// Функция для открытия базы данных IndexedDB
async function openGameDB() {
  return openDB('GameDataDB', 1, {
    upgrade(db) {
      // Создаем хранилища для общих данных всех игр
      if (!db.objectStoreNames.contains('words')) {
        db.createObjectStore('words', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('names')) {
        db.createObjectStore('names', { keyPath: 'key' });
      }
    }
  });
}

// Функция для сохранения данных в IndexedDB
async function saveData(storeName, key, data, lastModified) {
  const db = await openGameDB();
  await db.put(storeName, { key, data, lastModified });
}

// Функция для получения данных из IndexedDB
async function getData(storeName, key) {
  const db = await openGameDB();
  return await db.get(storeName, key);
}

// Загрузка данных с сервера и сохранение их в IndexedDB
async function fetchAndStoreData(storeName, key, url) {
  const storedData = await getData(storeName, key);
  const lastModified = storedData ? storedData.lastModified : null;

  // Если есть сохраненные данные, используйте их сразу
  if (storedData) {
    console.log(`Using stored data for ${key} in ${storeName}`);
    return storedData.data;
  }

  try {
    const response = await fetch(url, {
      headers: lastModified ? { 'If-Modified-Since': lastModified } : {}
    });

    if (response.status === 200) {
      const data = await response.json();
      const newLastModified = response.headers.get('Last-Modified');
      await saveData(storeName, key, data, newLastModified);
      return data;
    } else if (response.status === 304 && storedData) {
      return storedData.data;
    } else if (storedData) {
      return storedData.data;
    } else {
      throw new Error('Failed to load data');
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${key} from server, loading from IndexedDB:`, error);
    if (storedData) {
      return storedData.data;
    } else {
      throw new Error('No data available in IndexedDB');
    }
  }
}

// Функция для загрузки слов для игры
export async function loadWordsForGame(locale) {
  const url = `https://fizistat-33157f0b8398.herokuapp.com/files/alias/alias_word_${locale}.json`;
  return await fetchAndStoreData('words', locale, url);
}

// Функция для загрузки имен команд для игры
export async function loadNamesForGame(locale) {
  const url = `https://fizistat-33157f0b8398.herokuapp.com/files/alias/alias_team_name.json`;
  const allNames = await fetchAndStoreData('names', 'team_names', url);
  return allNames[locale];  // Возвращаем имена команд на нужном языке
}

// Функция для загрузки начальных данных игр (украинский и русский)
export async function loadInitialGameData() {
  const localesToLoad = ['ua', 'ru']; // Автоматически загружаем только украинский и русский языки
  await Promise.all(localesToLoad.map(async (locale) => {
    await loadWordsForGame(locale);
    await loadNamesForGame(locale);
  }));
}

// Функция для загрузки игровых данных по запросу (для других языков)
export async function loadGameDataOnDemand(locale) {
  if (!['ua', 'ru'].includes(locale)) {
    await loadWordsForGame(locale);
    await loadNamesForGame(locale);
  }
}
