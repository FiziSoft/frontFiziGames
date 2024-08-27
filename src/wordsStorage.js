import { openDB } from 'idb';

// Функция для открытия базы данных IndexedDB
async function openGameDB() {
  try {
    return openDB('GameDataDB', 2, {
      upgrade(db) {
        // Создаем хранилища для данных всех игр
        if (!db.objectStoreNames.contains('words')) {
          db.createObjectStore('words', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('names')) {
          db.createObjectStore('names', { keyPath: 'key' });
        }
        // Добавляем хранилища для игры "Шпіон"
        if (!db.objectStoreNames.contains('spy_data')) {
          db.createObjectStore('spy_data', { keyPath: 'key' });
        }
      }
    });
  } catch (error) {
    console.error("Ошибка при открытии базы данных:", error);
    return null; // Возвращаем null, если база данных не смогла открыться
  }
}

// Функция для сохранения данных в IndexedDB
async function saveData(storeName, key, data, lastModified) {
  try {
    const db = await openGameDB();
    if (db) {
      await db.put(storeName, { key, data, lastModified });
    }
  } catch (error) {
    console.error(`Ошибка при сохранении данных в ${storeName}:`, error);
  }
}

// Функция для получения данных из IndexedDB
async function getData(storeName, key) {
  try {
    const db = await openGameDB();
    if (db) {
      return await db.get(storeName, key);
    }
  } catch (error) {
    console.error(`Ошибка при получении данных из ${storeName}:`, error);
  }
  return null; // Возвращаем null, если не удалось получить данные
}

async function fetchAndStoreData(storeName, key, url) {
  const storedData = await getData(storeName, key);
  const lastModified = storedData ? storedData.lastModified : null;

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
      console.error('Failed to load data from server and no cached data available.');
      return null; // Возвращаем null, если нет данных ни с сервера, ни в кэше
    }
  } catch (error) {
    return storedData ? storedData.data : null; // Возвращаем данные из IndexedDB или null
  }
}

// Функция для загрузки данных для игры "Шпіон"
export async function loadSpyData(locale) {
  
    const url = `https://fizistat-33157f0b8398.herokuapp.com/files/spy/spy_${locale}.json`;
    return await fetchAndStoreData('spy_data', locale, url);
  
}

// Функции для игры Alias (аналогично вышеописанным)
export async function loadWordsForGame(locale) {
  const url = `https://fizistat-33157f0b8398.herokuapp.com/files/alias/alias_word_${locale}.json`;
  return await fetchAndStoreData('words', locale, url);
}

export async function loadNamesForGame(locale) {
  const url = `https://fizistat-33157f0b8398.herokuapp.com/files/alias/alias_team_name.json`;
  const allNames = await fetchAndStoreData('names', 'team_names', url);
  return allNames ? allNames[locale] : null;  // Возвращаем имена команд на нужном языке или null
}

export async function loadInitialAliasGameData() {
  const localesToLoad = ['ua', 'ru'];
  await Promise.all(localesToLoad.map(async (locale) => {
    await loadWordsForGame(locale);
    await loadNamesForGame(locale);
  }));
}

export async function loadInitialSpyGameData() {
  const localesToLoad = ['ua', 'ru'];
  await Promise.all(localesToLoad.map(async (locale) => {
    await loadSpyData(locale);
  }));

}

export async function loadAliasGameDataOnDemand(locale) {
  if (!['ua', 'ru'].includes(locale)) {
    await loadWordsForGame(locale);
    await loadNamesForGame(locale);
  }
}

export async function loadSpyGameDataOnDemand(locale) {
  if (!['ua', 'ru'].includes(locale)) {
    await loadSpyData(locale);
  }

}
