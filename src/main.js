import { createApp } from 'vue';
import App from './App.vue';
import { router } from "./router";
import './assets/style.sass';
import './assets/neonCheckbox.scss';
import './assets/loader.css';
import store from './components/store';
import i18n, { setLocale } from './i18n';

// Добавляем обработку лоадера
const loaderElement = document.getElementById('loader');

async function initApp() {
  const app = createApp(App);

  // Применение языка при инициализации
  const savedLanguage = localStorage.getItem('language') || 'ua'; // По умолчанию 'ua', если нет сохраненного языка
  await setLocale(savedLanguage); // Установка сохраненного языка

  // Удаляем лоадер после загрузки
  if (loaderElement) {
    loaderElement.style.display = 'none';
  }

  app.use(router);
  app.use(store);
  app.use(i18n);

  app.mount('#app');
}

initApp(); // Инициализация приложения
